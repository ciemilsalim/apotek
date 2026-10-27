<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\StockAdjustment;
use Carbon\Carbon;
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

        $query = Medicine::with('category:id,name')
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
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
            'expiry_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $medicine = Medicine::create($validated);

            if ($medicine->stock > 0) {
                StockAdjustment::create([
                    'medicine_id' => $medicine->id,
                    'user_id' => $request->user()->id,
                    'type' => 'in',
                    'quantity' => $medicine->stock,
                    'stock_before' => 0,
                    'stock_after' => $medicine->stock,
                    'notes' => 'Stok awal penambahan obat baru',
                ]);
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
        ]);

        $currentStock = $medicine->stock;
        $type = $validated['type'];
        $qty = (int) $validated['quantity'];

        if ($type === 'in') {
            $newStock = $currentStock + $qty;
        } elseif ($type === 'out') {
            if ($qty > $currentStock) {
                return redirect()->back()->with('error', "Pengurangan stok ($qty) melebihi stok tersedia ($currentStock).");
            }
            $newStock = $currentStock - $qty;
        } else {
            // 'adjustment' sets target stock
            $newStock = $qty;
        }

        DB::transaction(function () use ($medicine, $request, $type, $qty, $currentStock, $newStock, $validated) {
            $medicine->update(['stock' => $newStock]);

            StockAdjustment::create([
                'medicine_id' => $medicine->id,
                'user_id' => $request->user()->id,
                'type' => $type,
                'quantity' => $qty,
                'stock_before' => $currentStock,
                'stock_after' => $newStock,
                'notes' => $validated['notes'],
            ]);
        });

        return redirect()->route('medicines.index')->with('success', 'Penyesuaian stok berhasil disimpan.');
    }

    public function adjustmentsHistory(Request $request): Response
    {
        $search = $request->input('search');

        $adjustments = StockAdjustment::with(['medicine:id,code,name,unit', 'user:id,name'])
            ->when($search, function ($q, $search) {
                $q->whereHas('medicine', function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
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
