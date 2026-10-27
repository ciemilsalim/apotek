<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Sale;
use App\Models\SaleItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfitLossController extends Controller
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
            $title = 'Laporan Laba Rugi Harian - ' . $parsed->translatedFormat('d F Y');
        } elseif ($period === 'monthly') {
            $parsed = Carbon::parse($month . '-01');
            $start = $parsed->copy()->startOfMonth()->startOfDay();
            $end = $parsed->copy()->endOfMonth()->endOfDay();
            $title = 'Laporan Laba Rugi - ' . $parsed->translatedFormat('F Y');
        } else {
            $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfMonth()->startOfDay();
            $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::today()->endOfDay();
            $title = 'Laporan Laba Rugi Periode ' . $start->format('d/m/Y') . ' - ' . $end->format('d/m/Y');
        }

        return [$start, $end, $title, [
            'period' => $period,
            'date' => $date,
            'month' => $month,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]];
    }

    private function calculateProfitLossData(Carbon $start, Carbon $end): array
    {
        // 1. Sales revenue
        $salesQuery = Sale::whereBetween('created_at', [$start, $end]);
        $totalTransactions = (int) (clone $salesQuery)->count();
        $grossSales = (float) (clone $salesQuery)->sum('subtotal');
        $totalDiscount = (float) (clone $salesQuery)->sum('discount');
        $netSales = (float) (clone $salesQuery)->sum('total_amount');
        $saleIds = (clone $salesQuery)->pluck('id');

        // 2. Cost of Goods Sold (HPP)
        $cogsQuery = SaleItem::whereIn('sale_id', $saleIds)
            ->join('medicines', 'sale_items.medicine_id', '=', 'medicines.id')
            ->select(
                DB::raw('SUM(sale_items.quantity * medicines.buy_price) as total_cogs'),
                DB::raw('SUM(sale_items.quantity * sale_items.price) as total_item_revenue'),
                DB::raw('SUM(sale_items.quantity) as total_qty')
            )->first();

        $cogs = (float) ($cogsQuery ? $cogsQuery->total_cogs : 0);
        $totalQtySold = (int) ($cogsQuery ? $cogsQuery->total_qty : 0);

        // 3. Gross Profit
        $grossProfit = $netSales - $cogs;
        $grossProfitMargin = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 1) : 0;

        // 4. Other Operating Incomes (excluding capital injection)
        $otherIncome = (float) FinancialTransaction::whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->where('type', 'income')
            ->where('category', '!=', 'modal_awal')
            ->sum('amount');

        // 5. Operating Expenses (OPEX - excluding inventory purchase which is an asset)
        $opexBaseQuery = FinancialTransaction::whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->where('type', 'expense')
            ->where('category', '!=', 'pembelian_obat');

        $totalOpex = (float) (clone $opexBaseQuery)->sum('amount');

        $expensesByCategory = (clone $opexBaseQuery)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->pluck('total', 'category')
            ->toArray();

        $categoriesMap = FinancialTransaction::getCategories()['expense'] ?? [];
        $opexDetails = [];
        foreach ($expensesByCategory as $cat => $amt) {
            $opexDetails[] = [
                'category' => $cat,
                'label' => $categoriesMap[$cat] ?? ucfirst(str_replace('_', ' ', $cat)),
                'amount' => (float) $amt,
            ];
        }

        // Inventory Restock Purchases (for financial transparency info)
        $inventoryPurchases = (float) FinancialTransaction::whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->where('type', 'expense')
            ->where('category', 'pembelian_obat')
            ->sum('amount');

        // 6. Net Profit
        $netOperatingProfit = $grossProfit - $totalOpex + $otherIncome;
        $totalRevenue = $netSales + $otherIncome;
        $netProfitMargin = $totalRevenue > 0 ? round(($netOperatingProfit / $totalRevenue) * 100, 1) : 0;

        // 7. Top 5 Medicines by Gross Profit Contribution
        $topMedicines = SaleItem::whereIn('sale_id', $saleIds)
            ->join('medicines', 'sale_items.medicine_id', '=', 'medicines.id')
            ->leftJoin('categories', 'medicines.category_id', '=', 'categories.id')
            ->select(
                'medicines.name as medicine_name',
                'categories.name as category_name',
                DB::raw('SUM(sale_items.quantity) as qty_sold'),
                DB::raw('SUM(sale_items.quantity * sale_items.price) as revenue'),
                DB::raw('SUM(sale_items.quantity * medicines.buy_price) as cogs'),
                DB::raw('SUM(sale_items.quantity * (sale_items.price - medicines.buy_price)) as profit')
            )
            ->groupBy('medicines.id', 'medicines.name', 'categories.name')
            ->orderByDesc('profit')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $rev = (float) $item->revenue;
                $profit = (float) $item->profit;
                $item->margin = $rev > 0 ? round(($profit / $rev) * 100, 1) : 0;
                return $item;
            });

        // 8. Category Breakdown
        $categoryBreakdown = SaleItem::whereIn('sale_id', $saleIds)
            ->join('medicines', 'sale_items.medicine_id', '=', 'medicines.id')
            ->leftJoin('categories', 'medicines.category_id', '=', 'categories.id')
            ->select(
                DB::raw("COALESCE(categories.name, 'Tanpa Kategori') as category_name"),
                DB::raw('SUM(sale_items.quantity) as qty_sold'),
                DB::raw('SUM(sale_items.quantity * sale_items.price) as revenue'),
                DB::raw('SUM(sale_items.quantity * medicines.buy_price) as cogs'),
                DB::raw('SUM(sale_items.quantity * (sale_items.price - medicines.buy_price)) as profit')
            )
            ->groupBy('category_name')
            ->orderByDesc('profit')
            ->get()
            ->map(function ($item) {
                $rev = (float) $item->revenue;
                $profit = (float) $item->profit;
                $item->margin = $rev > 0 ? round(($profit / $rev) * 100, 1) : 0;
                return $item;
            });

        return [
            'totalTransactions' => $totalTransactions,
            'totalQtySold' => $totalQtySold,
            'grossSales' => $grossSales,
            'totalDiscount' => $totalDiscount,
            'netSales' => $netSales,
            'cogs' => $cogs,
            'grossProfit' => $grossProfit,
            'grossProfitMargin' => $grossProfitMargin,
            'otherIncome' => $otherIncome,
            'totalOpex' => $totalOpex,
            'opexDetails' => $opexDetails,
            'inventoryPurchases' => $inventoryPurchases,
            'totalRevenue' => $totalRevenue,
            'netOperatingProfit' => $netOperatingProfit,
            'netProfitMargin' => $netProfitMargin,
            'topMedicines' => $topMedicines,
            'categoryBreakdown' => $categoryBreakdown,
        ];
    }

    public function index(Request $request): InertiaResponse
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);
        $data = $this->calculateProfitLossData($start, $end);

        return Inertia::render('Reports/ProfitLoss', [
            'title' => $title,
            'filters' => $filters,
            'statement' => $data,
        ]);
    }

    public function exportPdf(Request $request)
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);
        $data = $this->calculateProfitLossData($start, $end);
        $pharmacy = \App\Models\PharmacyProfile::getSettings();

        $pdf = Pdf::loadView('reports.profit_loss_pdf', array_merge($data, [
            'pharmacy' => $pharmacy,
            'title' => $title,
            'startDate' => $start->translatedFormat('d F Y'),
            'endDate' => $end->translatedFormat('d F Y'),
            'generatedAt' => Carbon::now()->translatedFormat('d F Y, H:i:s'),
            'generatedBy' => $request->user()->name,
        ]))->setPaper('a4', 'portrait');

        $filename = 'laporan-laba-rugi-' . Carbon::now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        [$start, $end, $title, $filters] = $this->getPeriodRange($request);
        $data = $this->calculateProfitLossData($start, $end);
        $pharmacy = \App\Models\PharmacyProfile::getSettings();

        $filename = 'laporan-laba-rugi-' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($pharmacy, $data, $title, $start, $end) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [$pharmacy->name ?? 'APOTEK SEHAT']);
            fputcsv($handle, ['LAPORAN LABA RUGI KOMPREHENSIF']);
            fputcsv($handle, [$title]);
            fputcsv($handle, ['Periode: ' . $start->format('d/m/Y') . ' - ' . $end->format('d/m/Y')]);
            fputcsv($handle, ['Waktu Ekspor: ' . Carbon::now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, []);

            // 1. REVENUE
            fputcsv($handle, ['I. PENDAPATAN OPERASIONAL']);
            fputcsv($handle, ['Penjualan Kotor Obat (POS)', number_format($data['grossSales'], 0, ',', '.')]);
            fputcsv($handle, ['Potongan / Diskon Penjualan', '-' . number_format($data['totalDiscount'], 0, ',', '.')]);
            fputcsv($handle, ['PENDAPATAN PENJUALAN BERSIH', number_format($data['netSales'], 0, ',', '.')]);
            if ($data['otherIncome'] > 0) {
                fputcsv($handle, ['Pendapatan Operasional Lain (Jasa/Layanan)', number_format($data['otherIncome'], 0, ',', '.')]);
            }
            fputcsv($handle, ['TOTAL PENDAPATAN', number_format($data['totalRevenue'], 0, ',', '.')]);
            fputcsv($handle, []);

            // 2. COGS
            fputcsv($handle, ['II. HARGA POKOK PENJUALAN (HPP)']);
            fputcsv($handle, ['Harga Pokok Obat Terjual (Modal Beli)', '-' . number_format($data['cogs'], 0, ',', '.')]);
            fputcsv($handle, ['LABA KOTOR (GROSS PROFIT)', number_format($data['grossProfit'], 0, ',', '.')]);
            fputcsv($handle, ['Margin Laba Kotor', $data['grossProfitMargin'] . '%']);
            fputcsv($handle, []);

            // 3. OPEX
            fputcsv($handle, ['III. BEBAN OPERASIONAL (OPEX)']);
            if (empty($data['opexDetails'])) {
                fputcsv($handle, ['(Tidak ada beban operasional tercatat pada periode ini)', '0']);
            } else {
                foreach ($data['opexDetails'] as $item) {
                    fputcsv($handle, ['Beban ' . $item['label'], '-' . number_format($item['amount'], 0, ',', '.')]);
                }
            }
            fputcsv($handle, ['TOTAL BEBAN OPERASIONAL', '-' . number_format($data['totalOpex'], 0, ',', '.')]);
            fputcsv($handle, []);

            // 4. NET PROFIT
            fputcsv($handle, ['IV. LABA OPERASIONAL BERSIH (NET INCOME)']);
            fputcsv($handle, ['LABA BERSIH APOTEK', number_format($data['netOperatingProfit'], 0, ',', '.')]);
            fputcsv($handle, ['Margin Laba Bersih (Net Profit Margin)', $data['netProfitMargin'] . '%']);
            fputcsv($handle, []);

            // Reference Info
            fputcsv($handle, ['INFORMASI TAMBAHAN']);
            fputcsv($handle, ['Jumlah Transaksi Selesai', number_format($data['totalTransactions'], 0, ',', '.')]);
            fputcsv($handle, ['Total Unit Obat Terjual', number_format($data['totalQtySold'], 0, ',', '.') . ' unit']);
            fputcsv($handle, ['Pembelian Stok Obat Baru (PBF)', number_format($data['inventoryPurchases'], 0, ',', '.')]);
            fputcsv($handle, []);

            // Top medicines
            fputcsv($handle, ['TOP 5 OBAT PENYUMBANG LABA TERBESAR']);
            fputcsv($handle, ['No.', 'Nama Obat', 'Kategori', 'Qty Terjual', 'Omset (Rp)', 'HPP Modal (Rp)', 'Laba Kotor (Rp)', 'Margin (%)']);
            $no = 1;
            foreach ($data['topMedicines'] as $med) {
                fputcsv($handle, [
                    $no++,
                    $med->medicine_name,
                    $med->category_name ?? '-',
                    $med->qty_sold,
                    number_format($med->revenue, 0, ',', '.'),
                    number_format($med->cogs, 0, ',', '.'),
                    number_format($med->profit, 0, ',', '.'),
                    $med->margin . '%',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
