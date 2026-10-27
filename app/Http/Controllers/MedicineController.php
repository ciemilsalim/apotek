<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockAdjustment;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MedicineController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $status = $request->input('status'); // 'all', 'low_stock', 'out_of_stock', 'expiring'

        $query = Medicine::with(['category:id,name', 'batches'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhereHas('batches', function ($bq) use ($search) {
                            $bq->where('batch_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            });

        if ($status === 'low_stock') {
            $query->whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0);
        } elseif ($status === 'out_of_stock') {
            $query->where('stock', '<=', 0);
        } elseif ($status === 'expiring') {
            $query->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', Carbon::now()->addMonths(3));
        }

        $medicines = $query->latest()->paginate(10)->withQueryString();

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Medicines/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'status' => $status ?? 'all',
            ],
            'units' => ['Strip', 'Botol', 'Tablet', 'Box', 'Ampul', 'Tube', 'Sachet', 'Kapsul', 'Pcs'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:medicines,code'],
            'name' => ['required', 'string', 'max:255'],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:50'],
            'buy_price' => ['required', 'numeric', 'min:0'],
            'sell_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'expiry_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $stock = (int) $validated['stock'];
            $medicine = Medicine::create($validated);

            if ($stock > 0) {
                $batchNumber = !empty($validated['batch_number'])
                    ? trim($validated['batch_number'])
                    : 'B-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $medicine->code), 0, 4)) . '-' . date('ym');

                $expiryDate = !empty($validated['expiry_date'])
                    ? $validated['expiry_date']
                    : Carbon::now()->addYear()->format('Y-m-d');

                $batch = MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => $batchNumber,
                    'expiry_date' => $expiryDate,
                    'initial_stock' => $stock,
                    'current_stock' => $stock,
                    'buy_price' => $medicine->buy_price,
                    'notes' => 'Batch awal penambahan obat baru',
                ]);

                StockAdjustment::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'user_id' => $request->user()->id,
                    'type' => 'in',
                    'quantity' => $stock,
                    'stock_before' => 0,
                    'stock_after' => $stock,
                    'notes' => "Stok awal obat baru (Batch: {$batch->batch_number})",
                ]);

                $medicine->syncStockFromBatches();
            }
        });

        return redirect()->route('medicines.index')->with('success', 'Data obat berhasil ditambahkan.');
    }

    public function update(Request $request, Medicine $medicine): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('medicines')->ignore($medicine->id)],
            'name' => ['required', 'string', 'max:255'],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:50'],
            'buy_price' => ['required', 'numeric', 'min:0'],
            'sell_price' => ['required', 'numeric', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'expiry_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $medicine->update($validated);

        return redirect()->route('medicines.index')->with('success', 'Data obat berhasil diperbarui.');
    }

    public function adjustStock(Request $request, Medicine $medicine): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['required', 'string', 'max:255'],
            'batch_mode' => ['nullable', 'string', Rule::in(['existing', 'new'])],
            'batch_id' => ['nullable', 'exists:medicine_batches,id'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'expiry_date' => ['nullable', 'date'],
            'buy_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $currentStock = $medicine->stock;
        $type = $validated['type'];
        $qty = (int) $validated['quantity'];

        try {
            DB::transaction(function () use ($medicine, $request, $type, $qty, $currentStock, $validated) {
                // Ensure legacy unbatched stock has a batch row before mutating
                if ($medicine->stock > 0 && $medicine->batches()->count() === 0) {
                    MedicineBatch::create([
                        'medicine_id' => $medicine->id,
                        'batch_number' => 'LOT-INIT-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $medicine->code), 0, 4)),
                        'expiry_date' => $medicine->expiry_date ?: Carbon::now()->addYear()->format('Y-m-d'),
                        'initial_stock' => $medicine->stock,
                        'current_stock' => $medicine->stock,
                        'buy_price' => $medicine->buy_price,
                        'notes' => 'Batch inisialisasi stok awal',
                    ]);
                }

                $batch = null;

                if ($type === 'in') {
                    // Check if targeting existing batch or creating new batch
                    if (!empty($validated['batch_id'])) {
                        $batch = MedicineBatch::where('id', $validated['batch_id'])
                            ->where('medicine_id', $medicine->id)
                            ->first();

                        if ($batch) {
                            $batchBefore = $batch->current_stock;
                            $batch->increment('current_stock', $qty);
                            $batchAfter = $batch->current_stock;
                        }
                    } else {
                        // Create new batch
                        $batchNumber = !empty($validated['batch_number'])
                            ? trim($validated['batch_number'])
                            : 'B-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $medicine->code), 0, 4)) . '-' . date('ym');

                        $expiryDate = !empty($validated['expiry_date'])
                            ? $validated['expiry_date']
                            : Carbon::now()->addYear()->format('Y-m-d');

                        $buyPrice = !empty($validated['buy_price'])
                            ? (float) $validated['buy_price']
                            : (float) $medicine->buy_price;

                        $batch = MedicineBatch::create([
                            'medicine_id' => $medicine->id,
                            'batch_number' => $batchNumber,
                            'expiry_date' => $expiryDate,
                            'initial_stock' => $qty,
                            'current_stock' => $qty,
                            'buy_price' => $buyPrice,
                            'notes' => $validated['notes'],
                        ]);

                        $batchBefore = 0;
                        $batchAfter = $qty;
                    }

                    StockAdjustment::create([
                        'medicine_id' => $medicine->id,
                        'batch_id' => $batch?->id,
                        'batch_number' => $batch?->batch_number,
                        'user_id' => $request->user()->id,
                        'type' => 'in',
                        'quantity' => $qty,
                        'stock_before' => $currentStock,
                        'stock_after' => $currentStock + $qty,
                        'notes' => $validated['notes'] . ($batch ? " (Batch: {$batch->batch_number})" : ''),
                    ]);

                    $medicine->syncStockFromBatches();
                } elseif ($type === 'out') {
                    if ($qty > $currentStock) {
                        throw new Exception("Pengurangan stok ($qty) melebihi total stok tersedia ($currentStock).");
                    }

                    if (!empty($validated['batch_id'])) {
                        $batch = MedicineBatch::where('id', $validated['batch_id'])
                            ->where('medicine_id', $medicine->id)
                            ->first();

                        if ($batch) {
                            if ($qty > $batch->current_stock) {
                                throw new Exception("Pengurangan ($qty) melebihi sisa stok pada Batch {$batch->batch_number} ({$batch->current_stock}).");
                            }
                            $batch->decrement('current_stock', $qty);
                        }
                    } else {
                        // Auto deduct via FEFO
                        $needed = $qty;
                        $batches = $medicine->activeBatches()->get();
                        foreach ($batches as $b) {
                            if ($needed <= 0) break;
                            $deduct = min($b->current_stock, $needed);
                            $b->decrement('current_stock', $deduct);
                            $needed -= $deduct;
                            $batch = $b;
                        }
                    }

                    StockAdjustment::create([
                        'medicine_id' => $medicine->id,
                        'batch_id' => $batch?->id,
                        'batch_number' => $batch?->batch_number,
                        'user_id' => $request->user()->id,
                        'type' => 'out',
                        'quantity' => $qty,
                        'stock_before' => $currentStock,
                        'stock_after' => $currentStock - $qty,
                        'notes' => $validated['notes'] . ($batch ? " (Batch: {$batch->batch_number})" : ''),
                    ]);

                    $medicine->syncStockFromBatches();
                } else {
                    // adjustment: set target stock
                    if (!empty($validated['batch_id'])) {
                        $batch = MedicineBatch::where('id', $validated['batch_id'])
                            ->where('medicine_id', $medicine->id)
                            ->first();

                        if ($batch) {
                            $batch->update(['current_stock' => $qty]);
                        }
                    }

                    StockAdjustment::create([
                        'medicine_id' => $medicine->id,
                        'batch_id' => $batch?->id,
                        'batch_number' => $batch?->batch_number,
                        'user_id' => $request->user()->id,
                        'type' => 'adjustment',
                        'quantity' => $qty,
                        'stock_before' => $currentStock,
                        'stock_after' => $qty,
                        'notes' => $validated['notes'],
                    ]);

                    if ($batch) {
                        $medicine->syncStockFromBatches();
                    } else {
                        $medicine->update(['stock' => $qty]);
                    }
                }
            });
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('medicines.index')->with('success', 'Penyesuaian stok dan batch berhasil disimpan.');
    }

    public function storeBatch(Request $request, Medicine $medicine): RedirectResponse
    {
        $validated = $request->validate([
            'batch_number' => ['required', 'string', 'max:100'],
            'expiry_date' => ['required', 'date'],
            'stock' => ['required', 'integer', 'min:1'],
            'buy_price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $medicine, $request) {
            $qty = (int) $validated['stock'];

            // Ensure legacy unbatched stock has a batch row before mutating
            if ($medicine->stock > 0 && $medicine->batches()->count() === 0) {
                MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => 'LOT-INIT-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $medicine->code), 0, 4)),
                    'expiry_date' => $medicine->expiry_date ?: Carbon::now()->addYear()->format('Y-m-d'),
                    'initial_stock' => $medicine->stock,
                    'current_stock' => $medicine->stock,
                    'buy_price' => $medicine->buy_price,
                    'notes' => 'Batch inisialisasi stok awal',
                ]);
            }

            $batch = MedicineBatch::create([
                'medicine_id' => $medicine->id,
                'batch_number' => trim($validated['batch_number']),
                'expiry_date' => $validated['expiry_date'],
                'initial_stock' => $qty,
                'current_stock' => $qty,
                'buy_price' => $validated['buy_price'] ?? $medicine->buy_price,
                'notes' => $validated['notes'] ?? 'Penambahan batch baru',
            ]);

            StockAdjustment::create([
                'medicine_id' => $medicine->id,
                'batch_id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'user_id' => $request->user()->id,
                'type' => 'in',
                'quantity' => $qty,
                'stock_before' => $medicine->stock,
                'stock_after' => $medicine->stock + $qty,
                'notes' => "Tambah Batch Baru #{$batch->batch_number}",
            ]);

            $medicine->syncStockFromBatches();
        });

        return redirect()->route('medicines.index')->with('success', "Batch {$validated['batch_number']} berhasil ditambahkan.");
    }

    public function adjustmentsHistory(Request $request): Response
    {
        $search = $request->input('search');

        $adjustments = StockAdjustment::with(['medicine:id,code,name,unit', 'batch:id,batch_number,expiry_date', 'user:id,name'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('batch_number', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%")
                        ->orWhereHas('medicine', function ($mq) use ($search) {
                            $mq->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Medicines/AdjustmentsHistory', [
            'adjustments' => $adjustments,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function destroy(Medicine $medicine): RedirectResponse
    {
        if ($medicine->saleItems()->count() > 0) {
            return redirect()->route('medicines.index')->with('error', 'Obat tidak dapat dihapus karena telah tercatat dalam riwayat transaksi penjualan.');
        }

        $medicine->delete();

        return redirect()->route('medicines.index')->with('success', 'Data obat berhasil dihapus.');
    }

    /**
     * Download Excel template for importing medicines.
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Obat');

        // Headers
        $headers = [
            'kode_obat',
            'nama_obat',
            'nama_generik',
            'kategori',
            'satuan',
            'harga_beli',
            'harga_jual',
            'stok',
            'stok_minimum',
            'nomor_batch',
            'tanggal_kadaluarsa',
            'lokasi_rak',
            'deskripsi',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        // Styling header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '059669'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
        ];
        $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

        // Sample Data Rows
        $samples = [
            [
                'OBT-001',
                'Paracetamol 500mg',
                'Paracetamol',
                'Analgesik & Antipiretik',
                'Strip',
                5000,
                8000,
                50,
                10,
                'B-PCT-2601',
                date('Y-m-d', strtotime('+1 year')),
                'Rak A-01',
                'Obat penurun demam dan pereda nyeri',
            ],
            [
                'OBT-002',
                'Amoxicillin 500mg',
                'Amoxicillin Trihydrate',
                'Antibiotik',
                'Strip',
                12000,
                18000,
                30,
                5,
                'B-AMX-2602',
                date('Y-m-d', strtotime('+18 months')),
                'Rak B-02',
                'Antibiotik spektrum luas dengan resep dokter',
            ],
            [
                'OBT-003',
                'Antasida Doen Tablet',
                'Al(OH)3 & Mg(OH)2',
                'Obat Lambung / Maag',
                'Strip',
                3500,
                6000,
                40,
                10,
                'B-ATD-2603',
                date('Y-m-d', strtotime('+2 years')),
                'Rak A-03',
                'Mengurangi gejala sakit maag dan asam lambung',
            ],
        ];

        $sheet->fromArray($samples, null, 'A2');

        // Auto size columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'template_import_obat_' . date('Ymd_His') . '.xlsx';
        $tempPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $filename;
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, 'template_import_obat.xlsx')->deleteFileAfterSend(true);
    }

    /**
     * Import medicines and stock from Excel or CSV file.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:10240'],
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal membaca berkas Excel: ' . $e->getMessage());
        }

        if (empty($rows) || count($rows) < 2) {
            return back()->with('error', 'Berkas Excel kosong atau tidak memiliki baris data.');
        }

        // Header mapping (row 1)
        $headerRow = array_shift($rows);
        $columnMap = [];
        foreach ($headerRow as $colLetter => $headerName) {
            if ($headerName === null) continue;
            $normalized = strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '_', (string) $headerName)));
            $columnMap[$normalized] = $colLetter;
        }

        $getVal = function ($row, array $keys, $default = null) use ($columnMap) {
            foreach ($keys as $k) {
                if (isset($columnMap[$k]) && isset($row[$columnMap[$k]])) {
                    $val = trim((string) $row[$columnMap[$k]]);
                    if ($val !== '') return $val;
                }
            }
            return $default;
        };

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $rowIndex => $row) {
                $code = $getVal($row, ['kode_obat', 'kode', 'code', 'barcode', 'sku']);
                $name = $getVal($row, ['nama_obat', 'nama', 'name', 'nama_produk']);

                if (empty($code) && empty($name)) {
                    continue; // Skip empty row
                }

                if (empty($code) || empty($name)) {
                    $skippedCount++;
                    continue;
                }

                $categoryName = $getVal($row, ['kategori', 'category', 'golongan', 'kategori_obat'], 'Umum');
                $categorySlug = \Illuminate\Support\Str::slug($categoryName) ?: 'kat-' . substr(md5($categoryName), 0, 6);
                $category = Category::firstOrCreate(
                    ['name' => $categoryName],
                    ['slug' => $categorySlug, 'description' => 'Dibuat otomatis dari impor data obat']
                );

                $genericName = $getVal($row, ['nama_generik', 'generik', 'generic_name']);
                $unit = $getVal($row, ['satuan', 'unit', 'kemasan'], 'Pcs');
                $buyPrice = (float) str_replace([',', ' '], '', $getVal($row, ['harga_beli', 'buy_price', 'modal', 'hpp'], 0));
                $sellPrice = (float) str_replace([',', ' '], '', $getVal($row, ['harga_jual', 'sell_price', 'harga'], 0));
                $stockInput = (int) $getVal($row, ['stok', 'stock', 'jumlah', 'qty'], 0);
                $minStock = (int) $getVal($row, ['stok_minimum', 'min_stock', 'minimum'], 5);
                $batchNumber = $getVal($row, ['nomor_batch', 'batch', 'batch_number', 'no_batch']);
                $expiryDate = $getVal($row, ['tanggal_kadaluarsa', 'expiry_date', 'exp_date', 'kadaluarsa', 'expired']);
                $location = $getVal($row, ['lokasi_rak', 'location', 'rak', 'lokasi']);
                $description = $getVal($row, ['deskripsi', 'description', 'keterangan']);

                // Parse expiry date if present
                $parsedExpiry = null;
                if (!empty($expiryDate)) {
                    try {
                        if (is_numeric($expiryDate)) {
                            $parsedExpiry = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($expiryDate)->format('Y-m-d');
                        } else {
                            $parsedExpiry = Carbon::parse($expiryDate)->format('Y-m-d');
                        }
                    } catch (\Throwable $e) {
                        $parsedExpiry = Carbon::now()->addYear()->format('Y-m-d');
                    }
                }

                $medicine = Medicine::where('code', $code)->first();

                if ($medicine) {
                    // Update existing medicine
                    $medicine->update([
                        'name' => $name,
                        'category_id' => $category->id,
                        'generic_name' => $genericName ?? $medicine->generic_name,
                        'unit' => $unit,
                        'buy_price' => $buyPrice > 0 ? $buyPrice : $medicine->buy_price,
                        'sell_price' => $sellPrice > 0 ? $sellPrice : $medicine->sell_price,
                        'min_stock' => $minStock,
                        'location' => $location ?? $medicine->location,
                        'description' => $description ?? $medicine->description,
                        'expiry_date' => $parsedExpiry ?? $medicine->expiry_date,
                    ]);

                    if ($stockInput > 0) {
                        $batchNo = !empty($batchNumber)
                            ? trim($batchNumber)
                            : 'IMP-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $code), 0, 4)) . '-' . date('ymd');

                        $batchExp = $parsedExpiry ?? Carbon::now()->addYear()->format('Y-m-d');

                        $batch = MedicineBatch::create([
                            'medicine_id' => $medicine->id,
                            'batch_number' => $batchNo,
                            'expiry_date' => $batchExp,
                            'initial_stock' => $stockInput,
                            'current_stock' => $stockInput,
                            'buy_price' => $medicine->buy_price,
                            'notes' => 'Tambahan stok via impor berkas',
                        ]);

                        $stockBefore = $medicine->stock;
                        $medicine->increment('stock', $stockInput);

                        StockAdjustment::create([
                            'medicine_id' => $medicine->id,
                            'batch_id' => $batch->id,
                            'batch_number' => $batchNo,
                            'user_id' => auth()->id(),
                            'type' => 'in',
                            'quantity' => $stockInput,
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockBefore + $stockInput,
                            'notes' => 'Stok masuk via impor data obat (Batch: ' . $batchNo . ')',
                        ]);

                        if (method_exists($medicine, 'syncStockFromBatches')) {
                            $medicine->syncStockFromBatches();
                        }
                    }

                    $updatedCount++;
                } else {
                    // Create new medicine
                    $medicine = Medicine::create([
                        'code' => $code,
                        'name' => $name,
                        'category_id' => $category->id,
                        'generic_name' => $genericName,
                        'unit' => $unit,
                        'buy_price' => $buyPrice,
                        'sell_price' => $sellPrice,
                        'stock' => $stockInput,
                        'min_stock' => $minStock,
                        'expiry_date' => $parsedExpiry,
                        'location' => $location,
                        'description' => $description,
                    ]);

                    if ($stockInput > 0) {
                        $batchNo = !empty($batchNumber)
                            ? trim($batchNumber)
                            : 'B-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $code), 0, 4)) . '-' . date('ym');

                        $batchExp = $parsedExpiry ?? Carbon::now()->addYear()->format('Y-m-d');

                        $batch = MedicineBatch::create([
                            'medicine_id' => $medicine->id,
                            'batch_number' => $batchNo,
                            'expiry_date' => $batchExp,
                            'initial_stock' => $stockInput,
                            'current_stock' => $stockInput,
                            'buy_price' => $medicine->buy_price,
                            'notes' => 'Stok awal impor berkas',
                        ]);

                        StockAdjustment::create([
                            'medicine_id' => $medicine->id,
                            'batch_id' => $batch->id,
                            'batch_number' => $batchNo,
                            'user_id' => auth()->id(),
                            'type' => 'in',
                            'quantity' => $stockInput,
                            'stock_before' => 0,
                            'stock_after' => $stockInput,
                            'notes' => 'Stok awal via impor berkas Excel (Batch: ' . $batchNo . ')',
                        ]);

                        if (method_exists($medicine, 'syncStockFromBatches')) {
                            $medicine->syncStockFromBatches();
                        }
                    }

                    $createdCount++;
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan saat memproses data impor: ' . $e->getMessage());
        }

        $msg = "Impor data selesai: {$createdCount} obat baru ditambahkan, {$updatedCount} obat diperbarui.";
        if ($skippedCount > 0) {
            $msg .= " ({$skippedCount} baris dilewati karena kode/nama tidak lengkap).";
        }

        return back()->with('success', $msg);
    }
}
