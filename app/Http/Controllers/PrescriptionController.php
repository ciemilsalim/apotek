<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\PrescriptionItemMedicine;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = Prescription::with(['items.ingredients', 'creator:id,name', 'processor:id,name', 'sale:id,invoice_number']);

        if ($status !== 'all' && in_array($status, ['pending', 'processed', 'completed', 'cancelled'])) {
            $query->where('status', $status);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('prescription_number', 'like', "%{$search}%")
                    ->orWhere('patient_name', 'like', "%{$search}%")
                    ->orWhere('doctor_name', 'like', "%{$search}%");
            });
        }

        $prescriptions = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $stats = [
            'pending_count' => Prescription::where('status', 'pending')->count(),
            'processed_count' => Prescription::where('status', 'processed')->count(),
            'completed_today' => Prescription::where('status', 'completed')
                ->whereDate('updated_at', Carbon::today())
                ->count(),
            'total_count' => Prescription::count(),
        ];

        return Inertia::render('Prescriptions/Index', [
            'prescriptions' => $prescriptions,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        // Get non-expired medicines that have active stock
        $medicines = Medicine::with('category:id,name')
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'unit', 'sell_price', 'stock', 'location']);

        return Inertia::render('Prescriptions/Create', [
            'medicines' => $medicines,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'doctor_name' => ['required', 'string', 'max:150'],
            'doctor_sip' => ['nullable', 'string', 'max:100'],
            'patient_name' => ['required', 'string', 'max:150'],
            'patient_age' => ['nullable', 'string', 'max:50'],
            'patient_phone' => ['nullable', 'string', 'max:50'],
            'prescription_date' => ['required', 'date'],
            'type' => ['required', 'in:racikan,non_racikan,campuran'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['required', 'in:racikan,obat_jadi'],
            'items.*.racikan_name' => ['nullable', 'string', 'max:150'],
            'items.*.racikan_type' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit' => ['required', 'string', 'max:50'],
            'items.*.signa' => ['required', 'string', 'max:150'],
            'items.*.service_fee' => ['nullable', 'numeric', 'min:0'],
            'items.*.ingredients' => ['required', 'array', 'min:1'],
            'items.*.ingredients.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.ingredients.*.dosage' => ['nullable', 'string', 'max:100'],
            'items.*.ingredients.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $prescription = DB::transaction(function () use ($validated, $request) {
                // Generate prescription number: RSP-YYYYMMDD-XXXX
                $datePrefix = Carbon::now()->format('Ymd');
                $lastPrescriptionToday = Prescription::where('prescription_number', 'like', "RSP-{$datePrefix}-%")
                    ->orderBy('id', 'desc')
                    ->first();

                $sequence = 1;
                if ($lastPrescriptionToday) {
                    $parts = explode('-', $lastPrescriptionToday->prescription_number);
                    $sequence = intval(end($parts)) + 1;
                }
                $prescriptionNumber = sprintf("RSP-%s-%04d", $datePrefix, $sequence);

                $prescription = Prescription::create([
                    'prescription_number' => $prescriptionNumber,
                    'doctor_name' => trim($validated['doctor_name']),
                    'doctor_sip' => $validated['doctor_sip'] ?? null,
                    'patient_name' => trim($validated['patient_name']),
                    'patient_age' => $validated['patient_age'] ?? null,
                    'patient_phone' => $validated['patient_phone'] ?? null,
                    'prescription_date' => $validated['prescription_date'],
                    'status' => 'pending',
                    'type' => $validated['type'],
                    'notes' => $validated['notes'] ?? null,
                    'created_by' => $request->user()->id,
                ]);

                foreach ($validated['items'] as $itemData) {
                    $item = PrescriptionItem::create([
                        'prescription_id' => $prescription->id,
                        'item_type' => $itemData['item_type'],
                        'racikan_name' => $itemData['racikan_name'] ?? ($itemData['item_type'] === 'racikan' ? 'Racikan Puyer' : 'Obat Jadi'),
                        'racikan_type' => $itemData['racikan_type'] ?? 'puyer',
                        'quantity' => $itemData['quantity'],
                        'unit' => $itemData['unit'] ?? 'Bungkus',
                        'signa' => $itemData['signa'],
                        'service_fee' => (float) ($itemData['service_fee'] ?? 0),
                        'subtotal' => 0,
                    ]);

                    $itemMedSubtotal = 0;
                    foreach ($itemData['ingredients'] as $ingData) {
                        $medicine = Medicine::findOrFail($ingData['medicine_id']);
                        $subtotal = $medicine->sell_price * $ingData['quantity'];
                        $itemMedSubtotal += $subtotal;

                        PrescriptionItemMedicine::create([
                            'prescription_item_id' => $item->id,
                            'medicine_id' => $medicine->id,
                            'medicine_name' => $medicine->name,
                            'dosage' => $ingData['dosage'] ?? null,
                            'quantity' => $ingData['quantity'],
                            'price' => $medicine->sell_price,
                            'subtotal' => $subtotal,
                        ]);
                    }

                    $item->update([
                        'subtotal' => $itemMedSubtotal + (float) $item->service_fee,
                    ]);
                }

                $prescription->calculateTotals();

                return $prescription;
            });

            return redirect()->route('prescriptions.show', $prescription->id)
                ->with('success', "Resep {$prescription->prescription_number} berhasil dibuat dan menunggu diracik.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat resep: ' . $e->getMessage());
        }
    }

    public function show(Prescription $prescription): Response
    {
        $prescription->load([
            'items.ingredients.medicine',
            'creator:id,name',
            'processor:id,name',
            'sale:id,invoice_number,created_at,total_amount,payment_method',
        ]);

        return Inertia::render('Prescriptions/Show', [
            'prescription' => $prescription,
        ]);
    }

    public function updateStatus(Request $request, Prescription $prescription): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processed,completed,cancelled'],
        ]);

        $newStatus = $validated['status'];

        if ($newStatus === 'processed') {
            $prescription->update([
                'status' => 'processed',
                'processed_by' => $request->user()->id,
            ]);
            $msg = "Resep {$prescription->prescription_number} telah selesai diracik dan siap ditebus di kasir.";
        } elseif ($newStatus === 'cancelled') {
            $prescription->update([
                'status' => 'cancelled',
            ]);
            $msg = "Resep {$prescription->prescription_number} telah dibatalkan.";
        } else {
            $prescription->update([
                'status' => $newStatus,
            ]);
            $msg = "Status resep {$prescription->prescription_number} diperbarui menjadi {$newStatus}.";
        }

        return redirect()->back()->with('success', $msg);
    }

    public function etiket(Prescription $prescription): Response
    {
        $prescription->load(['items.ingredients.medicine']);

        return Inertia::render('Prescriptions/Etiket', [
            'prescription' => $prescription,
        ]);
    }

    public function destroy(Prescription $prescription): RedirectResponse
    {
        if ($prescription->status === 'completed') {
            return redirect()->back()->with('error', 'Resep yang sudah ditebus/dibayar tidak dapat dihapus.');
        }

        $prescription->delete();

        return redirect()->route('prescriptions.index')
            ->with('success', 'Data resep dokter berhasil dihapus.');
    }
}
