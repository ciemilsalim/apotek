<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // 1. Basic metrics
        $todaySalesCount = Sale::whereDate('created_at', $today)->count();
        $todaySalesAmount = (float) Sale::whereDate('created_at', $today)->sum('total_amount');

        $monthSalesCount = Sale::where('created_at', '>=', $startOfMonth)->count();
        $monthSalesAmount = (float) Sale::where('created_at', '>=', $startOfMonth)->sum('total_amount');

        $totalMedicines = Medicine::count();
        $lowStockMedicines = Medicine::whereColumn('stock', '<=', 'min_stock')->count();
        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addMonths(3))
            ->count();

        // Expiring batches with stock > 0
        $expiringBatches = MedicineBatch::with('medicine:id,code,name,unit')
            ->where('current_stock', '>', 0)
            ->where('expiry_date', '<=', Carbon::now()->addMonths(3))
            ->orderBy('expiry_date', 'asc')
            ->take(6)
            ->get();

        // 2. Recent sales
        $recentSalesQuery = Sale::with(['user:id,name', 'items'])
            ->latest()
            ->take(6);

        if ($user->isKasir()) {
            $recentSalesQuery->where('user_id', $user->id);
            $myTodaySalesCount = Sale::where('user_id', $user->id)
                ->whereDate('created_at', $today)
                ->count();
            $myTodaySalesAmount = (float) Sale::where('user_id', $user->id)
                ->whereDate('created_at', $today)
                ->sum('total_amount');
        } else {
            $myTodaySalesCount = $todaySalesCount;
            $myTodaySalesAmount = $todaySalesAmount;
        }

        $recentSales = $recentSalesQuery->get();

        // 3. Top selling medicines
        $topSelling = SaleItem::select('medicine_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('medicine_name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // 4. Low stock alert items list
        $lowStockItems = Medicine::with('category:id,name')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        // 5. Recent stock adjustments (for Operator & Admin)
        $recentAdjustments = StockAdjustment::with(['medicine:id,code,name,unit', 'batch:id,batch_number,expiry_date', 'user:id,name'])
            ->latest()
            ->take(5)
            ->get();

        // 6. User counts (for Admin)
        $userStats = [
            'total' => User::count(),
            'admin' => User::where('role', 'admin')->count(),
            'operator' => User::where('role', 'operator')->count(),
            'kasir' => User::where('role', 'kasir')->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySalesCount' => $todaySalesCount,
                'todaySalesAmount' => $todaySalesAmount,
                'monthSalesCount' => $monthSalesCount,
                'monthSalesAmount' => $monthSalesAmount,
                'totalMedicines' => $totalMedicines,
                'lowStockCount' => $lowStockMedicines,
                'expiringCount' => $expiringMedicines,
                'myTodaySalesCount' => $myTodaySalesCount,
                'myTodaySalesAmount' => $myTodaySalesAmount,
                'userStats' => $userStats,
            ],
            'recentSales' => $recentSales,
            'topSelling' => $topSelling,
            'lowStockItems' => $lowStockItems,
            'recentAdjustments' => $recentAdjustments,
            'expiringBatches' => $expiringBatches,
        ]);
    }
}
