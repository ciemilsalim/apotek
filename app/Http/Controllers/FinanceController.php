<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    private function getPeriodRange(Request $request): array
    {
        $period = $request->input('period', 'monthly');
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($period === 'daily') {
            $parsed = Carbon::parse($date);
            $start = $parsed->copy()->startOfDay();
            $end = $parsed->copy()->endOfDay();
            $title = 'Buku Kas Harian - ' . $parsed->translatedFormat('d F Y');
        } elseif ($period === 'monthly') {
            $parsed = Carbon::parse($month . '-01');
            $start = $parsed->copy()->startOfMonth()->startOfDay();
            $end = $parsed->copy()->endOfMonth()->endOfDay();
            $title = 'Buku Kas & Arus Kas - ' . $parsed->translatedFormat('F Y');
        } else {
            $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfMonth()->startOfDay();
            $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::today()->endOfDay();
            $title = 'Buku Kas & Arus Kas Periode ' . $start->format('d/m/Y') . ' - ' . $end->format('d/m/Y');
        }

        return [$start, $end, $title, [
            'period' => $period,
            'date' => $date,
            'month' => $month,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => $request->input('type', 'all'),
            'category' => $request->input('category', 'all'),
        ]];
    }

    public function index(Request $request): InertiaResponse
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);

        // 1. Sales revenue within period
        $salesQuery = Sale::whereBetween('created_at', [$start, $end]);
        $totalSales = (float) (clone $salesQuery)->sum('total_amount');
        $salesCash = (float) (clone $salesQuery)->where('payment_method', 'cash')->sum('total_amount');
        $salesQris = (float) (clone $salesQuery)->where('payment_method', 'qris')->sum('total_amount');
        $salesTransfer = (float) (clone $salesQuery)->where('payment_method', 'transfer')->sum('total_amount');

        // 2. Financial transactions within period
        $trxBaseQuery = FinancialTransaction::whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);

        $totalOtherIncome = (float) (clone $trxBaseQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (float) (clone $trxBaseQuery)->where('type', 'expense')->sum('amount');

        $totalIncome = $totalSales + $totalOtherIncome;
        $netCashFlow = $totalIncome - $totalExpense;

        // Expense by category breakdown
        $expensesByCategory = (clone $trxBaseQuery)
            ->where('type', 'expense')
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->pluck('total', 'category')
            ->toArray();

        // 3. Filtered transaction listing
        $tableQuery = FinancialTransaction::with('user:id,name')
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $tableQuery->where('type', $filters['type']);
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $tableQuery->where('category', $filters['category']);
        }

        $transactions = $tableQuery->latest('transaction_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        // Transform transactions to include category_label
        $categoriesMap = FinancialTransaction::getCategories();
        $transactions->getCollection()->transform(function ($item) use ($categoriesMap) {
            $typeCategories = $categoriesMap[$item->type] ?? [];
            $item->category_label = $typeCategories[$item->category] ?? ucfirst(str_replace('_', ' ', $item->category));
            return $item;
        });

        return Inertia::render('Finance/Index', [
            'title' => $title,
            'transactions' => $transactions,
            'filters' => $filters,
            'summary' => [
                'totalSales' => $totalSales,
                'salesCash' => $salesCash,
                'salesNonCash' => $salesQris + $salesTransfer,
                'totalOtherIncome' => $totalOtherIncome,
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'netCashFlow' => $netCashFlow,
                'salesMethods' => [
                    'cash' => $salesCash,
                    'qris' => $salesQris,
                    'transfer' => $salesTransfer,
                ],
                'expensesByCategory' => $expensesByCategory,
            ],
            'categories' => $categoriesMap,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:cash,transfer,qris',
            'transaction_date' => 'required|date',
            'reference_number' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ], [
            'type.required' => 'Jenis transaksi wajib dipilih (Pemasukan / Pengeluaran).',
            'category.required' => 'Kategori transaksi wajib dipilih.',
            'amount.required' => 'Nominal transaksi wajib diisi.',
            'amount.min' => 'Nominal transaksi minimal Rp 1.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
        ]);

        $validated['transaction_number'] = FinancialTransaction::generateTransactionNumber();
        $validated['user_id'] = $request->user()->id;

        FinancialTransaction::create($validated);

        $typeLabel = $validated['type'] === 'income' ? 'Pemasukan' : 'Pengeluaran';

        return redirect()->back()->with('success', "Catatan {$typeLabel} sebesar Rp " . number_format($validated['amount'], 0, ',', '.') . " berhasil disimpan.");
    }

    public function destroy(Request $request, FinancialTransaction $transaction): RedirectResponse
    {
        // Only Admin can delete financial records to prevent misuse
        abort_if($request->user()->role !== 'admin', 403, 'Hanya Administrator yang memiliki akses menghapus catatan transaksi keuangan.');

        $trxNumber = $transaction->transaction_number;
        $transaction->delete();

        return redirect()->back()->with('success', "Transaksi {$trxNumber} berhasil dihapus.");
    }

    public function exportPdf(Request $request)
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);

        // Sales
        $salesQuery = Sale::whereBetween('created_at', [$start, $end]);
        $totalSales = (float) (clone $salesQuery)->sum('total_amount');
        $salesCash = (float) (clone $salesQuery)->where('payment_method', 'cash')->sum('total_amount');
        $salesNonCash = (float) (clone $salesQuery)->whereIn('payment_method', ['qris', 'transfer'])->sum('total_amount');

        // Transactions
        $transactions = FinancialTransaction::with('user:id,name')
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $totalOtherIncome = (float) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'expense')->sum('amount');
        $totalIncome = $totalSales + $totalOtherIncome;
        $netCashFlow = $totalIncome - $totalExpense;

        $pharmacy = \App\Models\PharmacyProfile::getSettings();

        $pdf = Pdf::loadView('reports.finance_pdf', [
            'pharmacy' => $pharmacy,
            'title' => $title,
            'startDate' => $start->translatedFormat('d F Y'),
            'endDate' => $end->translatedFormat('d F Y'),
            'totalSales' => $totalSales,
            'salesCash' => $salesCash,
            'salesNonCash' => $salesNonCash,
            'totalOtherIncome' => $totalOtherIncome,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netCashFlow' => $netCashFlow,
            'transactions' => $transactions,
            'categories' => FinancialTransaction::getCategories(),
            'generatedAt' => Carbon::now()->translatedFormat('d F Y, H:i:s'),
            'generatedBy' => $request->user()->name,
        ])->setPaper('a4', 'portrait');

        $filename = 'laporan-keuangan-' . Carbon::now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);
        $pharmacy = \App\Models\PharmacyProfile::getSettings();

        $salesQuery = Sale::whereBetween('created_at', [$start, $end]);
        $totalSales = (float) (clone $salesQuery)->sum('total_amount');
        $salesCash = (float) (clone $salesQuery)->where('payment_method', 'cash')->sum('total_amount');
        $salesNonCash = (float) (clone $salesQuery)->whereIn('payment_method', ['qris', 'transfer'])->sum('total_amount');

        $transactions = FinancialTransaction::with('user:id,name')
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $totalOtherIncome = (float) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'expense')->sum('amount');
        $totalIncome = $totalSales + $totalOtherIncome;
        $netCashFlow = $totalIncome - $totalExpense;

        $filename = 'buku-kas-keuangan-' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $categories = FinancialTransaction::getCategories();

        $callback = function () use ($pharmacy, $transactions, $title, $totalSales, $salesCash, $salesNonCash, $totalOtherIncome, $totalIncome, $totalExpense, $netCashFlow, $categories) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [$pharmacy->name ?? 'APOTEK SEHAT']);
            fputcsv($handle, [$title]);
            fputcsv($handle, ['Waktu Ekspor: ' . Carbon::now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, []);

            // Summary section
            fputcsv($handle, ['RINGKASAN ARUS KAS']);
            fputcsv($handle, ['Total Pemasukan Penjualan Apotek (POS)', number_format($totalSales, 0, ',', '.')]);
            fputcsv($handle, [' - Penerimaan Kas Tunai (Cash)', number_format($salesCash, 0, ',', '.')]);
            fputcsv($handle, [' - Penerimaan Non-Tunai (QRIS / Transfer)', number_format($salesNonCash, 0, ',', '.')]);
            fputcsv($handle, ['Total Pemasukan Lainnya (Kas Masuk)', number_format($totalOtherIncome, 0, ',', '.')]);
            fputcsv($handle, ['TOTAL SELURUH PEMASUKAN', number_format($totalIncome, 0, ',', '.')]);
            fputcsv($handle, ['TOTAL PENGELUARAN OPERASIONAL & PBF', number_format($totalExpense, 0, ',', '.')]);
            fputcsv($handle, ['SURPLUS / SALDO ARUS KAS BERSIH', number_format($netCashFlow, 0, ',', '.')]);
            fputcsv($handle, []);

            // Transaction Detail table
            fputcsv($handle, ['RINCIAN TRANSAKSI PENGELUARAN & PEMASUKAN KAS']);
            fputcsv($handle, [
                'No.',
                'No. Transaksi',
                'Tanggal',
                'Jenis',
                'Kategori',
                'Nominal (Rp)',
                'Metode',
                'No. Referensi / Nota',
                'Keterangan',
                'Dicatat Oleh',
            ]);

            $no = 1;
            foreach ($transactions as $trx) {
                $typeCat = $categories[$trx->type] ?? [];
                $catLabel = $typeCat[$trx->category] ?? $trx->category;
                $typeLabel = $trx->type === 'income' ? 'Pemasukan' : 'Pengeluaran';

                fputcsv($handle, [
                    $no++,
                    $trx->transaction_number,
                    $trx->transaction_date->format('d/m/Y'),
                    $typeLabel,
                    $catLabel,
                    number_format($trx->amount, 0, ',', '.'),
                    strtoupper($trx->payment_method),
                    $trx->reference_number ?? '-',
                    $trx->description ?? '-',
                    $trx->user->name ?? '-',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
