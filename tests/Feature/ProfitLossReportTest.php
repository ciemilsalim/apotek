<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\FinancialTransaction;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfitLossReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_when_accessing_profit_loss(): void
    {
        $response = $this->get('/reports/profit-loss');
        $response->assertRedirect('/login');
    }

    public function test_kasir_cannot_access_profit_loss_report(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        $response = $this->actingAs($kasir)->get('/reports/profit-loss');
        $response->assertStatus(403);
    }

    public function test_admin_and_operator_can_access_profit_loss_report(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $operator = User::factory()->create(['role' => 'operator']);

        $resAdmin = $this->actingAs($admin)->get('/reports/profit-loss');
        $resAdmin->assertStatus(200);

        $resOperator = $this->actingAs($operator)->get('/reports/profit-loss');
        $resOperator->assertStatus(200);
    }

    public function test_profit_loss_calculates_cogs_gross_profit_and_net_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Analgesik', 'slug' => 'analgesik']);

        // Medicine: Buy price 3,000, Sell price 5,000 (Margin 2,000 per unit)
        $med = Medicine::create([
            'category_id' => $category->id,
            'code' => 'PCT-500',
            'name' => 'Paracetamol 500mg',
            'unit' => 'Tablet',
            'buy_price' => 3000,
            'sell_price' => 5000,
            'stock' => 100,
            'min_stock' => 10,
        ]);

        // Sale: 10 units sold @ 5,000 = 50,000. Discount = 5,000. Total = 45,000.
        // COGS = 10 * 3,000 = 30,000.
        // Gross Profit = 45,000 - 30,000 = 15,000.
        $sale = Sale::create([
            'invoice_number' => 'INV-20261027-9001',
            'user_id' => $admin->id,
            'customer_name' => 'Pasien A',
            'subtotal' => 50000,
            'discount' => 5000,
            'total_amount' => 45000,
            'payment_method' => 'cash',
            'cash_paid' => 50000,
            'change_amount' => 5000,
            'created_at' => Carbon::now(),
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'medicine_id' => $med->id,
            'medicine_name' => $med->name,
            'medicine_code' => $med->code,
            'unit' => $med->unit,
            'quantity' => 10,
            'price' => 5000,
            'subtotal' => 50000,
        ]);

        // Operational Expense: Listrik 5,000
        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-9001',
            'type' => 'expense',
            'category' => 'listrik_air',
            'amount' => 5000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        // Inventory Restock Purchase: 20,000 (should NOT count as OPEX)
        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-9002',
            'type' => 'expense',
            'category' => 'pembelian_obat',
            'amount' => 20000,
            'payment_method' => 'transfer',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        // Other Operating Income: Jasa Medis 2,000
        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-9003',
            'type' => 'income',
            'category' => 'pendapatan_jasa',
            'amount' => 2000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get('/reports/profit-loss?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);

        $stmt = $response->viewData('page')['props']['statement'];

        $this->assertEquals(50000, $stmt['grossSales']);
        $this->assertEquals(5000, $stmt['totalDiscount']);
        $this->assertEquals(45000, $stmt['netSales']);
        $this->assertEquals(30000, $stmt['cogs']); // 10 * 3,000
        $this->assertEquals(15000, $stmt['grossProfit']); // 45,000 - 30,000
        $this->assertEquals(33.3, $stmt['grossProfitMargin']); // (15,000 / 45,000) * 100
        $this->assertEquals(5000, $stmt['totalOpex']); // only listrik, not pembelian_obat
        $this->assertEquals(2000, $stmt['otherIncome']);
        // Net profit = 15,000 - 5,000 + 2,000 = 12,000
        $this->assertEquals(12000, $stmt['netOperatingProfit']);
    }

    public function test_can_export_profit_loss_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/reports/profit-loss/export/pdf?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
    }

    public function test_can_export_profit_loss_excel_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/reports/profit-loss/export/excel?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
    }
}
