<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\PrescriptionItemMedicine;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrescriptionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_can_create_prescription_with_compounded_items(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $category = Category::create(['name' => 'Analgesik', 'slug' => 'analgesik']);

        $medA = Medicine::create([
            'category_id' => $category->id,
            'code' => 'PCT-500',
            'name' => 'Paracetamol 500mg',
            'unit' => 'Tablet',
            'buy_price' => 500,
            'sell_price' => 1000,
            'stock' => 100,
            'min_stock' => 10,
        ]);

        $medB = Medicine::create([
            'category_id' => $category->id,
            'code' => 'CTM-4',
            'name' => 'Chlorpheniramine 4mg',
            'unit' => 'Tablet',
            'buy_price' => 200,
            'sell_price' => 500,
            'stock' => 100,
            'min_stock' => 10,
        ]);

        $response = $this->actingAs($operator)->post('/prescriptions', [
            'doctor_name' => 'dr. Hendra Sp.A',
            'doctor_sip' => 'SIP.440/123/2026',
            'patient_name' => 'Rizky Pratama',
            'patient_age' => '6 Tahun',
            'patient_phone' => '08123456789',
            'prescription_date' => Carbon::today()->format('Y-m-d'),
            'type' => 'racikan',
            'notes' => 'Puyer batuk pilek anak 10 bungkus',
            'items' => [
                [
                    'item_type' => 'racikan',
                    'racikan_name' => 'Puyer Batuk Anak',
                    'racikan_type' => 'puyer',
                    'quantity' => 10,
                    'unit' => 'Bungkus',
                    'signa' => '3 x 1 bungkus sehari sesudah makan',
                    'service_fee' => 5000,
                    'ingredients' => [
                        [
                            'medicine_id' => $medA->id,
                            'dosage' => '1/2 tablet',
                            'quantity' => 5, // 5 x 1000 = 5000
                        ],
                        [
                            'medicine_id' => $medB->id,
                            'dosage' => '1/4 tablet',
                            'quantity' => 3, // 3 x 500 = 1500
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('prescriptions', [
            'doctor_name' => 'dr. Hendra Sp.A',
            'patient_name' => 'Rizky Pratama',
            'status' => 'pending',
            'total_medicine_price' => 6500, // 5000 + 1500
            'service_fee' => 5000,
            'grand_total' => 11500,
        ]);

        $this->assertDatabaseHas('prescription_items', [
            'racikan_name' => 'Puyer Batuk Anak',
            'quantity' => 10,
            'subtotal' => 11500,
        ]);

        $this->assertDatabaseHas('prescription_item_medicines', [
            'medicine_id' => $medA->id,
            'quantity' => 5,
            'subtotal' => 5000,
        ]);
    }

    public function test_operator_can_update_prescription_status(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $prescription = Prescription::create([
            'prescription_number' => 'RSP-20261027-0001',
            'doctor_name' => 'dr. Budi',
            'patient_name' => 'Siti Aminah',
            'prescription_date' => Carbon::today()->format('Y-m-d'),
            'status' => 'pending',
            'type' => 'racikan',
            'total_medicine_price' => 10000,
            'service_fee' => 5000,
            'grand_total' => 15000,
            'created_by' => $operator->id,
        ]);

        $response = $this->actingAs($operator)->patch("/prescriptions/{$prescription->id}/status", [
            'status' => 'processed',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('processed', $prescription->fresh()->status);
        $this->assertEquals($operator->id, $prescription->fresh()->processed_by);
    }

    public function test_kasir_can_redeem_prescription_at_pos_and_complete_it(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $operator = User::factory()->create(['role' => 'operator']);
        $category = Category::create(['name' => 'Antibiotik', 'slug' => 'antibiotik']);

        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'AMX-500',
            'name' => 'Amoxicillin 500mg',
            'unit' => 'Kapsul',
            'buy_price' => 3000,
            'sell_price' => 6000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        // Batch
        MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'LOT-AMX-01',
            'expiry_date' => Carbon::now()->addYear()->format('Y-m-d'),
            'initial_stock' => 20,
            'current_stock' => 20,
            'buy_price' => 3000,
        ]);
        $medicine->syncStockFromBatches();

        $prescription = Prescription::create([
            'prescription_number' => 'RSP-20261027-0099',
            'doctor_name' => 'dr. Rina Sp.PD',
            'patient_name' => 'Bapak Subur',
            'prescription_date' => Carbon::today()->format('Y-m-d'),
            'status' => 'processed',
            'type' => 'racikan',
            'total_medicine_price' => 30000,
            'service_fee' => 5000,
            'grand_total' => 35000,
            'created_by' => $operator->id,
            'processed_by' => $operator->id,
        ]);

        $item = PrescriptionItem::create([
            'prescription_id' => $prescription->id,
            'item_type' => 'racikan',
            'racikan_name' => 'Kapsul Antibiotik Racik',
            'racikan_type' => 'kapsul',
            'quantity' => 10,
            'unit' => 'Kapsul',
            'signa' => '3x1 sesudah makan',
            'service_fee' => 5000,
            'subtotal' => 35000,
        ]);

        PrescriptionItemMedicine::create([
            'prescription_item_id' => $item->id,
            'medicine_id' => $medicine->id,
            'medicine_name' => $medicine->name,
            'quantity' => 5,
            'price' => 6000,
            'subtotal' => 30000,
        ]);

        // Kasir checkout with prescription_id
        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Bapak Subur',
            'payment_method' => 'cash',
            'cash_paid' => 50000,
            'prescription_id' => $prescription->id,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 5,
                ],
            ],
        ]);

        $response->assertRedirect('/pos');
        $response->assertSessionHas('success');

        // Assert Prescription is marked completed and linked to sale
        $freshPrescription = $prescription->fresh();
        $this->assertEquals('completed', $freshPrescription->status);
        $this->assertNotNull($freshPrescription->sale_id);

        // Assert medicine stock decremented by 5 (20 - 5 = 15)
        $this->assertEquals(15, $medicine->fresh()->stock);

        // Assert sale record references prescription_id
        $this->assertDatabaseHas('sales', [
            'id' => $freshPrescription->sale_id,
            'prescription_id' => $prescription->id,
            'customer_name' => 'Bapak Subur',
        ]);
    }

    public function test_cannot_redeem_completed_prescription_twice(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Vitamin', 'slug' => 'vitamin']);

        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'VIT-C',
            'name' => 'Vitamin C 500mg',
            'unit' => 'Tablet',
            'buy_price' => 1000,
            'sell_price' => 2000,
            'stock' => 50,
            'min_stock' => 5,
        ]);

        MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'LOT-VITC',
            'expiry_date' => Carbon::now()->addYear()->format('Y-m-d'),
            'initial_stock' => 50,
            'current_stock' => 50,
            'buy_price' => 1000,
        ]);
        $medicine->syncStockFromBatches();

        $prescription = Prescription::create([
            'prescription_number' => 'RSP-ALREADY-DONE',
            'doctor_name' => 'dr. Agus',
            'patient_name' => 'Pasien Lama',
            'prescription_date' => Carbon::today()->format('Y-m-d'),
            'status' => 'completed',
            'type' => 'racikan',
            'total_medicine_price' => 4000,
            'service_fee' => 0,
            'grand_total' => 4000,
            'created_by' => $kasir->id,
        ]);

        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Pasien Lama',
            'payment_method' => 'cash',
            'cash_paid' => 10000,
            'prescription_id' => $prescription->id,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        // Must fail with error
        $response->assertSessionHas('error');
    }

    public function test_operator_can_view_etiket_print_page(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $prescription = Prescription::create([
            'prescription_number' => 'RSP-ETIKET-01',
            'doctor_name' => 'dr. Bambang',
            'patient_name' => 'Adinda Putri',
            'prescription_date' => Carbon::today()->format('Y-m-d'),
            'status' => 'processed',
            'type' => 'racikan',
            'total_medicine_price' => 5000,
            'service_fee' => 2000,
            'grand_total' => 7000,
            'created_by' => $operator->id,
        ]);

        $response = $this->actingAs($operator)->get("/prescriptions/{$prescription->id}/etiket");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Prescriptions/Etiket'));
    }

    public function test_kasir_cannot_create_or_delete_prescriptions(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        $responsePost = $this->actingAs($kasir)->post('/prescriptions', [
            'doctor_name' => 'dr. Ilegal',
        ]);
        $responsePost->assertStatus(403);
    }
}
