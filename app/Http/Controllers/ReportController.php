<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function getFilteredQuery(Request $request): array
    {
        $period = $request->input('period', 'daily'); // 'daily', 'monthly', 'custom'
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Sale::with(['user:id,name', 'items']);

        if ($period === 'daily') {
            $parsedDate = Carbon::parse($date);
            $query->whereDate('created_at', $parsedDate);
            $title = 'Laporan Penjualan Harian - ' . $parsedDate->translatedFormat('d F Y');
        } elseif ($period === 'monthly') {
            $parsedMonth = Carbon::parse($month . '-01');
            $query->whereYear('created_at', $parsedMonth->year)
                ->whereMonth('created_at', $parsedMonth->month);
            $title = 'Laporan Penjualan Bulanan - ' . $parsedMonth->translatedFormat('F Y');
        } else {
            // custom range
            $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->startOfDay();
            $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::today()->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
            $title = 'Laporan Penjualan Periode ' . $start->format('d/m/Y') . ' - ' . $end->format('d/m/Y');
        }

        return [$query, $title, [
            'period' => $period,
            'date' => $date,
            'month' => $month,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]];
    }

    public function index(Request $request): InertiaResponse
    {
        [$query, $title, $filters] = $this->getFilteredQuery($request);

        $sales = (clone $query)->latest()->paginate(15)->withQueryString();

        // Calculate summary
        $allSales = (clone $query)->get();
        $totalTransactions = $allSales->count();
        $totalRevenue = (float) $allSales->sum('total_amount');
        $totalDiscount = (float) $allSales->sum('discount');

        // Calculate estimated cost and profit based on items
        $saleIds = $allSales->pluck('id');
        $totalItemsSold = SaleItem::whereIn('sale_id', $saleIds)->sum('quantity');

        // Profit calculation
        $itemsWithCost = SaleItem::whereIn('sale_id', $saleIds)
            ->join('medicines', 'sale_items.medicine_id', '=', 'medicines.id')
            ->select(
                DB::raw('SUM(sale_items.quantity * sale_items.price) as revenue'),
                DB::raw('SUM(sale_items.quantity * medicines.buy_price) as cost')
            )
            ->first();

        $grossProfit = ($itemsWithCost ? ($itemsWithCost->revenue - $itemsWithCost->cost) : 0) - $totalDiscount;

        // Payment method breakdown
        $paymentMethods = [
            'cash' => $allSales->where('payment_method', 'cash')->sum('total_amount'),
            'qris' => $allSales->where('payment_method', 'qris')->sum('total_amount'),
            'transfer' => $allSales->where('payment_method', 'transfer')->sum('total_amount'),
        ];

        return Inertia::render('Reports/Index', [
            'title' => $title,
            'sales' => $sales,
            'filters' => $filters,
            'summary' => [
                'totalTransactions' => $totalTransactions,
                'totalRevenue' => $totalRevenue,
                'totalDiscount' => $totalDiscount,
                'totalItemsSold' => (int) $totalItemsSold,
                'grossProfit' => (float) max(0, $grossProfit),
                'paymentMethods' => $paymentMethods,
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        [$query, $title, $filters] = $this->getFilteredQuery($request);

        $sales = $query->oldest()->get();
        $totalRevenue = (float) $sales->sum('total_amount');
        $totalTransactions = $sales->count();
        $saleIds = $sales->pluck('id');
        $totalItemsSold = (int) SaleItem::whereIn('sale_id', $saleIds)->sum('quantity');

        $pdf = Pdf::loadView('reports.pdf', [
            'title' => $title,
            'sales' => $sales,
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions,
            'totalItemsSold' => $totalItemsSold,
            'generatedAt' => Carbon::now()->translatedFormat('d F Y, H:i:s'),
            'generatedBy' => $request->user()->name,
        ])->setPaper('a4', 'portrait');

        $filename = 'laporan-penjualan-' . Carbon::now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        [$query, $title, $filters] = $this->getFilteredQuery($request);
        $sales = $query->oldest()->get();

        $filename = 'laporan-penjualan-' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($sales, $title) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Title and header
            fputcsv($handle, ['APOTEK SEHAT']);
            fputcsv($handle, [$title]);
            fputcsv($handle, ['Tanggal Cetak: ' . Carbon::now()->format('d/m/Y H:i:s')]);
            fputcsv($handle, []); // empty line

            // Column Headers
            fputcsv($handle, [
                'No.',
                'No. Faktur',
                'Waktu Transaksi',
                'Kasir',
                'Nama Pelanggan',
                'Metode Pembayaran',
                'Jumlah Item',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Total Akhir (Rp)',
            ]);

            $no = 1;
            $grandTotal = 0;
            $grandDiscount = 0;

            foreach ($sales as $sale) {
                $itemCount = $sale->items->sum('quantity');
                $grandTotal += $sale->total_amount;
                $grandDiscount += $sale->discount;

                fputcsv($handle, [
                    $no++,
                    $sale->invoice_number,
                    $sale->created_at->format('d/m/Y H:i'),
                    $sale->user->name ?? '-',
                    $sale->customer_name,
                    strtoupper($sale->payment_method),
                    $itemCount,
                    number_format($sale->subtotal, 0, ',', '.'),
                    number_format($sale->discount, 0, ',', '.'),
                    number_format($sale->total_amount, 0, ',', '.'),
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, [
                '',
                '',
                '',
                '',
                '',
                'TOTAL KESELURUHAN',
                '',
                '',
                number_format($grandDiscount, 0, ',', '.'),
                number_format($grandTotal, 0, ',', '.'),
            ]);

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
