<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $medicines = Medicine::with('category:id,name')
            ->where('stock', '>', 0)
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, function ($q, $categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('name')
            ->get();

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        // Recent sales by current user for fast access
        $recentSales = Sale::where('user_id', $request->user()->id)
            ->whereDate('created_at', Carbon::today())
            ->with('items')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Pos/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'recentSales' => $recentSales,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'in:cash,qris,transfer'],
            'cash_paid' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $discount = (float) ($validated['discount'] ?? 0);
        $cashPaid = (float) $validated['cash_paid'];
        $customerName = !empty($validated['customer_name']) ? trim($validated['customer_name']) : 'Pelanggan Umum';

        try {
            $sale = DB::transaction(function () use ($validated, $user, $discount, $cashPaid, $customerName) {
                $subtotal = 0;
                $processedItems = [];

                // 1. Validate each item and check stock with lock
                foreach ($validated['items'] as $item) {
                    $medicine = Medicine::where('id', $item['medicine_id'])->lockForUpdate()->first();

                    if (!$medicine) {
                        throw new Exception("Obat dengan ID {$item['medicine_id']} tidak ditemukan.");
                    }

                    if ($medicine->stock < $item['quantity']) {
                        throw new Exception("Stok untuk {$medicine->name} tidak mencukupi (sisa: {$medicine->stock}, diminta: {$item['quantity']}).");
                    }

                    $itemSubtotal = $medicine->sell_price * $item['quantity'];
                    $subtotal += $itemSubtotal;

                    $processedItems[] = [
                        'medicine' => $medicine,
                        'quantity' => $item['quantity'],
                        'price' => $medicine->sell_price,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                $totalAmount = max(0, $subtotal - $discount);

                if ($validated['payment_method'] === 'cash' && $cashPaid < $totalAmount) {
                    throw new Exception("Nominal pembayaran tunai (Rp " . number_format($cashPaid, 0, ',', '.') . ") kurang dari total belanja (Rp " . number_format($totalAmount, 0, ',', '.') . ").");
                }

                $changeAmount = $validated['payment_method'] === 'cash' ? max(0, $cashPaid - $totalAmount) : 0;

                // 2. Generate unique invoice number: INV-YYYYMMDD-XXXX
                $datePrefix = Carbon::now()->format('Ymd');
                $lastSaleToday = Sale::where('invoice_number', 'like', "INV-{$datePrefix}-%")
                    ->orderBy('id', 'desc')
                    ->first();

                if ($lastSaleToday) {
                    $lastSeq = (int) substr($lastSaleToday->invoice_number, -4);
                    $seq = str_pad($lastSeq + 1, 4, '0', STR_PAD_LEFT);
                } else {
                    $seq = '0001';
                }

                $invoiceNumber = "INV-{$datePrefix}-{$seq}";

                // 3. Create Sale record
                $sale = Sale::create([
                    'invoice_number' => $invoiceNumber,
                    'user_id' => $user->id,
                    'customer_name' => $customerName,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'cash_paid' => $validated['payment_method'] === 'cash' ? $cashPaid : $totalAmount,
                    'change_amount' => $changeAmount,
                    'notes' => $validated['notes'] ?? null,
                ]);

                // 4. Create SaleItems and update stock
                foreach ($processedItems as $pItem) {
                    /** @var Medicine $med */
                    $med = $pItem['medicine'];
                    $qty = $pItem['quantity'];

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'medicine_id' => $med->id,
                        'medicine_name' => $med->name,
                        'medicine_code' => $med->code,
                        'unit' => $med->unit,
                        'price' => $pItem['price'],
                        'quantity' => $qty,
                        'subtotal' => $pItem['subtotal'],
                    ]);

                    $oldStock = $med->stock;
                    $newStock = $oldStock - $qty;
                    $med->update(['stock' => $newStock]);

                    StockAdjustment::create([
                        'medicine_id' => $med->id,
                        'user_id' => $user->id,
                        'type' => 'out',
                        'quantity' => $qty,
                        'stock_before' => $oldStock,
                        'stock_after' => $newStock,
                        'notes' => "Penjualan #{$invoiceNumber}",
                    ]);
                }

                return $sale->load(['items', 'user:id,name']);
            });

            return redirect()->route('pos.index')
                ->with('success', "Transaksi berhasil disimpan! Nomor Faktur: {$sale->invoice_number}")
                ->with('completed_sale', $sale);
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function history(Request $request): Response
    {
        $search = $request->input('search');
        $date = $request->input('date');

        $query = Sale::with(['user:id,name', 'items'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($date, function ($q, $date) {
                $q->whereDate('created_at', $date);
            });

        // Kasir only sees their own transactions unless Admin
        if ($request->user()->isKasir()) {
            $query->where('user_id', $request->user()->id);
        }

        $sales = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Pos/History', [
            'sales' => $sales,
            'filters' => [
                'search' => $search,
                'date' => $date,
            ],
        ]);
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['items', 'user:id,name']);

        return Inertia::render('Pos/Receipt', [
            'sale' => $sale,
        ]);
    }
}
