<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicineManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_can_create_medicine(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $category = Category::create([
            'name' => 'Analgesik',
            'slug' => 'analgesik',
        ]);

        $response = $this->actingAs($operator)->post('/medicines', [
            'code' => 'OBT-100',
            'name' => 'Asam Mefenamat 500mg',
            'generic_name' => 'Mefenamic Acid',
            'category_id' => $category->id,
            'unit' => 'Strip',
            'buy_price' => 4000,
            'sell_price' => 7000,
            'stock' => 50,
            'min_stock' => 10,
            'expiry_date' => '2027-12-31',
            'location' => 'Rak A-3',
            'description' => 'Pereda nyeri gigi',
        ]);

        $response->assertRedirect('/medicines');

        $this->assertDatabaseHas('medicines', [
            'code' => 'OBT-100',
            'name' => 'Asam Mefenamat 500mg',
            'stock' => 50,
        ]);

        // Asserts stock adjustment was recorded
        $this->assertDatabaseHas('stock_adjustments', [
            'type' => 'in',
            'quantity' => 50,
            'stock_after' => 50,
        ]);
    }

    public function test_operator_can_restock_medicine(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $category = Category::create(['name' => 'Vitamin', 'slug' => 'vitamin']);
        $medicine = Medicine::create([
            'category_id' => $category->id,
            'code' => 'OBT-200',
            'name' => 'Vitamin B Kompleks',
            'unit' => 'Botol',
            'buy_price' => 10000,
            'sell_price' => 15000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        $response = $this->actingAs($operator)->post("/medicines/{$medicine->id}/adjust-stock", [
            'type' => 'in',
            'quantity' => 15,
            'notes' => 'Penerimaan kiriman gudang',
        ]);

        $response->assertRedirect('/medicines');

        $this->assertEquals(35, $medicine->fresh()->stock);

        $this->assertDatabaseHas('stock_adjustments', [
            'medicine_id' => $medicine->id,
            'type' => 'in',
            'quantity' => 15,
            'stock_before' => 20,
            'stock_after' => 35,
        ]);
    }
}
