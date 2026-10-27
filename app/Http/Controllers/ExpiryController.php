<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MedicineBatch;
use App\Models\StockAdjustment;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpiryController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $today = Carbon::today()->format('Y-m-d');
        $thirtyDays = Carbon::today()->addDays(30)->format('Y-m-d');
        $ninetyDays = Carbon::today()->addDays(90)->format('Y-m-d');

        // High-level statistics
        $stats = [
            'expired_count' => MedicineBatch::active()->expired()->count(),
            'critical_count' => MedicineBatch::active()->critical(30)->count(),
            'warning_count' => MedicineBatch::active()
                ->where('expiry_date', '>', $thirtyDays)
                ->where('expiry_date', '<=', $ninetyDays)
                ->count(),
            'safe_count' => MedicineBatch::active()
                ->where('expiry_date', '>', $ninetyDays)
                ->count(),
            'expired_loss_value' => (float) (MedicineBatch::active()->expired()
                ->select(DB::raw('SUM(current_stock * buy_price) as loss'))
                ->value('loss') ?: 0),
            'expiring_soon_loss_value' => (float) (MedicineBatch::active()
                ->where('expiry_date', '>=', $today)
                ->where('expiry_date', '<=', $ninetyDays)
                ->select(DB::raw('SUM(current_stock * buy_price) as loss'))
                ->value('loss') ?: 0),
        ];

        // Query batches
        $query = MedicineBatch::with(['medicine.category'])
            ->where('current_stock', '>', 0);

        // Status Filter
        if ($status === 'expired') {
            $query->where('expiry_date', '<', $today);
        } elseif ($status === 'critical') {
            $query->where('expiry_date', '>=', $today)
                ->where('expiry_date', '<=', $thirtyDays);
        } elseif ($status === 'warning') {
            $query->where('expiry_date', '>', $thirtyDays)
                ->where('expiry_date', '<=', $ninetyDays);
        } elseif ($status === 'safe') {
            $query->where('expiry_date', '>', $ninetyDays);
        }

        // Search Filter (Medicine Name, Code, Batch Number)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                    ->orWhereHas('medicine', function ($mq) use ($search) {
                        $mq->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%")
                            ->orWhere('generic_name', 'like', "%{$search}%");
                    });
            });
        }

        // Category Filter
        if (!empty($categoryId)) {
            $query->whereHas('medicine', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        // Order by expiry date ascending (FEFO priority)
        $batches = $query->orderBy('expiry_date', 'asc')
            ->paginate(20)
            ->withQueryString();

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Expiries/Index', [
            'batches' => $batches,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'category_id' => $categoryId,
            ],
            'categories' => $categories,
        ]);
    }

    public function quarantine(Request $request, MedicineBatch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:retur_pbf,pemusnahan,rusak'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($batch->current_stock <= 0) {
            return redirect()->back()->with('error', 'Batch ini sudah tidak memiliki sisa stok aktif.');
        }

        $reasonLabels = [
            'retur_pbf' => 'Retur ke Distributor (PBF)',
            'pemusnahan' => 'Berita Acara Pemusnahan Obat Kadaluarsa',
            'rusak' => 'Karantina Obat Rusak / Cacat Kemasan',
        ];

        $reasonLabel = $reasonLabels[$validated['reason']] ?? 'Karantina Obat Kadaluarsa';
        $qtyToDeduct = $batch->current_stock;
        $medicine = $batch->medicine;

        try {
            DB::transaction(function () use ($batch, $medicine, $qtyToDeduct, $reasonLabel, $validated, $request) {
                $currentMedStock = $medicine->stock;

                StockAdjustment::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'user_id' => $request->user()->id,
                    'type' => 'out',
                    'quantity' => $qtyToDeduct,
                    'stock_before' => $currentMedStock,
                    'stock_after' => max(0, $currentMedStock - $qtyToDeduct),
                    'notes' => "[{$reasonLabel}] {$batch->batch_number}: " . ($validated['notes'] ?: 'Dikeluarkan dari stok penjualan kasir'),
                ]);

                $batch->update(['current_stock' => 0]);
                $medicine->syncStockFromBatches();
            });
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses karantina: ' . $e->getMessage());
        }

        return redirect()->back()->with(
            'success',
            "Batch {$batch->batch_number} ({$medicine->name}) sebanyak {$qtyToDeduct} {$medicine->unit} berhasil dikarantina dan dikeluarkan dari stok kasir."
        );
    }

    public function export(Request $request): StreamedResponse
    {
        $status = $request->input('status', 'all');
        $today = Carbon::today()->format('Y-m-d');
        $thirtyDays = Carbon::today()->addDays(30)->format('Y-m-d');
        $ninetyDays = Carbon::today()->addDays(90)->format('Y-m-d');

        $query = MedicineBatch::with(['medicine.category'])
            ->where('current_stock', '>', 0);

        if ($status === 'expired') {
            $query->where('expiry_date', '<', $today);
        } elseif ($status === 'critical') {
            $query->where('expiry_date', '>=', $today)->where('expiry_date', '<=', $thirtyDays);
        } elseif ($status === 'warning') {
            $query->where('expiry_date', '>', $thirtyDays)->where('expiry_date', '<=', $ninetyDays);
        }

        $batches = $query->orderBy('expiry_date', 'asc')->get();

        $filename = 'rekap_kadaluarsa_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($batches, $today) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [
                'No.',
                'Kode Obat',
                'Nama Obat',
                'Kategori',
                'No. Batch',
                'Tanggal Kadaluarsa',
                'Status Sisa Hari',
                'Sisa Stok',
                'Satuan',
                'Harga Beli (Rp)',
                'Estimasi Nilai (Rp)',
                'Lokasi Rak',
            ]);

            foreach ($batches as $idx => $batch) {
                $med = $batch->medicine;
                $expDate = $batch->expiry_date ? Carbon::parse($batch->expiry_date) : null;
                $daysRemaining = $expDate ? Carbon::today()->diffInDays($expDate, false) : null;

                if ($daysRemaining === null) {
                    $statusText = 'Tidak tercatat';
                } elseif ($daysRemaining < 0) {
                    $statusText = 'Kadaluarsa ' . abs($daysRemaining) . ' hari lalu';
                } elseif ($daysRemaining === 0) {
                    $statusText = 'Kadaluarsa HARI INI';
                } else {
                    $statusText = $daysRemaining . ' hari lagi';
                }

                $value = $batch->current_stock * $batch->buy_price;

                fputcsv($handle, [
                    $idx + 1,
                    $med?->code ?? '-',
                    $med?->name ?? 'Obat Tidak Ditemukan',
                    $med?->category?->name ?? '-',
                    $batch->batch_number,
                    $batch->expiry_date ? Carbon::parse($batch->expiry_date)->format('d/m/Y') : '-',
                    $statusText,
                    $batch->current_stock,
                    $med?->unit ?? '-',
                    $batch->buy_price,
                    $value,
                    $med?->location ?? '-',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
