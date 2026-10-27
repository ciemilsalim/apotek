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
}
