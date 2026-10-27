<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_kasir_can_checkout_sale_and_decrement_stock(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Analgesik', 'slug' => 'analgesik']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-001',
            'name' => 'Paracetamol 500mg',
            'unit' => 'Strip',
            'buy_price' => 3000,
            'sell_price' => 5000,
            'stock' => 50,
            'min_stock' => 10,
        ]);

        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Bapak Joko',
            'payment_method' => 'cash',
            'cash_paid' => 20000,
            'discount' => 0,
            'notes' => 'Pembelian langsung',
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 3,
                ],
            ],
        ]);

        $response->assertRedirect('/pos');
        $response->assertSessionHas('success');

        // Stock should decrement from 50 to 47
        $this->assertEquals(47, $medicine->fresh()->stock);

        // Sale record check
        $this->assertDatabaseHas('sales', [
            'customer_name' => 'Bapak Joko',
            'user_id' => $kasir->id,
            'subtotal' => 15000,
            'total_amount' => 15000,
            'cash_paid' => 20000,
            'change_amount' => 5000,
        ]);

        // Sale item check
        $this->assertDatabaseHas('sale_items', [
            'medicine_id' => $medicine->id,
            'quantity' => 3,
            'price' => 5000,
            'subtotal' => 15000,
        ]);

        // Stock adjustment out check
        $this->assertDatabaseHas('stock_adjustments', [
            'medicine_id' => $medicine->id,
            'type' => 'out',
            'quantity' => 3,
            'stock_before' => 50,
            'stock_after' => 47,
        ]);
    }

    public function test_checkout_fails_if_quantity_exceeds_stock(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Analgesik', 'slug' => 'analgesik']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-002',
            'name' => 'Obat Langka',
            'unit' => 'Botol',
            'buy_price' => 20000,
            'sell_price' => 30000,
            'stock' => 2,
            'min_stock' => 5,
        ]);

        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Pelanggan Umum',
            'payment_method' => 'cash',
            'cash_paid' => 100000,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 5, // exceeds available stock 2
                ],
            ],
        ]);

        // Should redirect back with error flash
        $response->assertSessionHas('error');
        // Stock remains unchanged
        $this->assertEquals(2, $medicine->fresh()->stock);
    }

    public function test_pos_checkout_deducts_using_fefo_algorithm(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        $category = Category::create(['name' => 'Antibiotik', 'slug' => 'antibiotik']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-FEFO',
            'name' => 'Amoxicillin 500mg',
            'unit' => 'Strip',
            'buy_price' => 5000,
            'sell_price' => 9000,
            'stock' => 0,
            'min_stock' => 5,
        ]);

        // Batch A expires earlier
        $batchA = \App\Models\MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXP-EARLY',
            'expiry_date' => '2026-11-15',
            'initial_stock' => 10,
            'current_stock' => 10,
            'buy_price' => 5000,
        ]);

        // Batch B expires later
        $batchB = \App\Models\MedicineBatch::create([
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXP-LATER',
            'expiry_date' => '2027-06-20',
            'initial_stock' => 20,
            'current_stock' => 20,
            'buy_price' => 5000,
        ]);

        $medicine->syncStockFromBatches();
        $this->assertEquals(30, $medicine->fresh()->stock);

        // Checkout 14 units -> Should consume all 10 of Batch A, and 4 of Batch B
        $response = $this->actingAs($kasir)->post('/pos', [
            'customer_name' => 'Pasien FEFO',
            'payment_method' => 'cash',
            'cash_paid' => 150000,
            'items' => [
                [
                    'medicine_id' => $medicine->id,
                    'quantity' => 14,
                ],
            ],
        ]);

        $response->assertRedirect('/pos');
        $response->assertSessionHas('success');

        // Assert Batch A is exhausted
        $this->assertEquals(0, $batchA->fresh()->current_stock);

        // Assert Batch B has 16 remaining (20 - 4)
        $this->assertEquals(16, $batchB->fresh()->current_stock);

        // Assert total medicine stock is now 16
        $this->assertEquals(16, $medicine->fresh()->stock);

        // Assert sale items split accurately by batch
        $this->assertDatabaseHas('sale_items', [
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXP-EARLY',
            'quantity' => 10,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'medicine_id' => $medicine->id,
            'batch_number' => 'BATCH-EXP-LATER',
            'quantity' => 4,
        ]);
    }
}
