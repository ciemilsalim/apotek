<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpiryMonitoringTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_and_admin_can_access_expiry_monitoring_page(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $admin = User::factory()->create(['role' => 'admin']);

        $responseOperator = $this->actingAs($operator)->get('/expiries');
        $responseOperator->assertStatus(200);
        $responseOperator->assertInertia(fn ($page) => $page->component('Expiries/Index'));

        $responseAdmin = $this->actingAs($admin)->get('/expiries');
        $responseAdmin->assertStatus(200);
    }

    public function test_kasir_cannot_access_expiry_monitoring_page(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        $response = $this->actingAs($kasir)->get('/expiries');
        $response->assertStatus(403);
    }

    public function test_operator_can_quarantine_batch_and_remove_from_stock(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $category = Category::create(['name' => 'Analgesik', 'slug' => 'analgesik']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-QRT',
            'name' => 'Paracetamol 500mg Batch Karantina',
            'unit' => 'Strip',
            'buy_price' => 3000,
            'sell_price' => 5000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        $batch = MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'LOT-EXP-BAD',
            'expiry_date' => Carbon::yesterday()->format('Y-m-d'),
            'initial_stock' => 20,
            'current_stock' => 20,
            'buy_price' => 3000,
        ]);

        $medicine->syncStockFromBatches();
        $this->assertEquals(20, $medicine->fresh()->stock);

        $response = $this->actingAs($operator)->post("/expiries/{$batch->id}/quarantine", [
            'reason' => 'retur_pbf',
            'notes' => 'Retur ke PBF Kimia Farma nomor RT-001',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Batch stock should now be 0
        $this->assertEquals(0, $batch->fresh()->current_stock);

        // Medicine stock should now be 0
        $this->assertEquals(0, $medicine->fresh()->stock);

        // Audit adjustment recorded
        $this->assertDatabaseHas('stock_adjustments', [
            'medicine_id' => $medicine->id,
            'batch_id' => $batch->id,
            'type' => 'out',
            'quantity' => 20,
            'stock_after' => 0,
        ]);
    }

    public function test_pos_sale_skips_expired_batch_and_sells_valid_batch(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Antibiotik', 'slug' => 'antibiotik']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-SAFE',
            'name' => 'Cefixime 100mg',
            'unit' => 'Kapsul',
            'buy_price' => 8000,
            'sell_price' => 14000,
            'stock' => 15,
            'min_stock' => 5,
        ]);

        // Expired Batch
        $batchExpired = MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXPIRED-PAST',
            'expiry_date' => Carbon::now()->subMonths(2)->format('Y-m-d'),
            'initial_stock' => 5,
            'current_stock' => 5,
            'buy_price' => 8000,
        ]);

        // Valid Fresh Batch
        $batchValid = MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-VALID-FRESH',
            'expiry_date' => Carbon::now()->addYear()->format('Y-m-d'),
            'initial_stock' => 10,
            'current_stock' => 10,
            'buy_price' => 8000,
        ]);

        $medicine->syncStockFromBatches();

        // Kasir purchases 4 units
        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Pasien Umum',
            'payment_method' => 'cash',
            'cash_paid' => 100000,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 4,
                ],
            ],
        ]);

        $response->assertRedirect('/pos');
        $response->assertSessionHas('success');

        // Expired batch must remain completely untouched (5 units)
        $this->assertEquals(5, $batchExpired->fresh()->current_stock);

        // Valid batch should be decremented from 10 to 6
        $this->assertEquals(6, $batchValid->fresh()->current_stock);

        // Sale item must be attributed exclusively to the valid batch
        $this->assertDatabaseHas('sale_items', [
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-VALID-FRESH',
            'quantity' => 4,
        ]);

        $this->assertDatabaseMissing('sale_items', [
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXPIRED-PAST',
        ]);
    }

    public function test_pos_sale_fails_if_only_expired_stock_remains(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Sirup', 'slug' => 'sirup']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-EXPIRED-ONLY',
            'name' => 'Sirup Batuk Kadaluarsa',
            'unit' => 'Botol',
            'buy_price' => 12000,
            'sell_price' => 18000,
            'stock' => 5,
            'min_stock' => 2,
        ]);

        MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXPIRED-ONLY',
            'expiry_date' => Carbon::yesterday()->format('Y-m-d'),
            'initial_stock' => 5,
            'current_stock' => 5,
            'buy_price' => 12000,
        ]);

        $medicine->syncStockFromBatches();

        // Attempt checkout
        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Pasien Batal',
            'payment_method' => 'cash',
            'cash_paid' => 50000,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        // Must fail with error flash
        $response->assertSessionHas('error');

        // No sales recorded
        $this->assertDatabaseMissing('sales', [
            'customer_name' => 'Pasien Batal',
        ]);
    }

    public function test_operator_can_export_expiry_report_csv(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $response = $this->actingAs($operator)->get('/expiries/export?status=expired');
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}
