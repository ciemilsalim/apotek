<?php

namespace Tests\Feature;

use App\Models\FinancialTransaction;
use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_when_accessing_finance(): void
    {
        $response = $this->get('/finance');
        $response->assertRedirect('/login');
    }

    public function test_kasir_cannot_access_finance_dashboard(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        $response = $this->actingAs($kasir)->get('/finance');
        $response->assertStatus(403);
    }

    public function test_admin_and_operator_can_access_finance_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $operator = User::factory()->create(['role' => 'operator']);

        $resAdmin = $this->actingAs($admin)->get('/finance');
        $resAdmin->assertStatus(200);

        $resOperator = $this->actingAs($operator)->get('/finance');
        $resOperator->assertStatus(200);
    }

    public function test_operator_can_record_operational_expense(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $response = $this->actingAs($operator)->post('/finance', [
            'type' => 'expense',
            'category' => 'pembelian_obat',
            'amount' => 450000,
            'payment_method' => 'transfer',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'reference_number' => 'INV-PBF-2026-001',
            'description' => 'Pembelian obat dari PT Kimia Farma Trading',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('financial_transactions', [
            'type' => 'expense',
            'category' => 'pembelian_obat',
            'amount' => 450000,
            'payment_method' => 'transfer',
            'reference_number' => 'INV-PBF-2026-001',
            'user_id' => $operator->id,
        ]);

        $trx = FinancialTransaction::first();
        $this->assertStringStartsWith('TRX-', $trx->transaction_number);
    }

    public function test_admin_can_record_cash_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/finance', [
            'type' => 'income',
            'category' => 'modal_awal',
            'amount' => 2000000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'reference_number' => null,
            'description' => 'Kas modal awal apotek',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('financial_transactions', [
            'type' => 'income',
            'category' => 'modal_awal',
            'amount' => 2000000,
            'payment_method' => 'cash',
        ]);
    }

    public function test_recording_transaction_validates_required_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post('/finance', [
            'type' => '',
            'category' => '',
            'amount' => -1000,
            'transaction_date' => '',
        ]);

        $response->assertSessionHasErrors(['type', 'category', 'amount', 'transaction_date']);
    }

    public function test_only_admin_can_delete_financial_transaction(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $operator = User::factory()->create(['role' => 'operator']);

        $trx = FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-0001',
            'type' => 'expense',
            'category' => 'operasional',
            'amount' => 50000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        // Operator attempt should fail with 403
        $operatorResponse = $this->actingAs($operator)->delete("/finance/{$trx->id}");
        $operatorResponse->assertStatus(403);
        $this->assertDatabaseHas('financial_transactions', ['id' => $trx->id]);

        // Admin attempt should succeed
        $adminResponse = $this->actingAs($admin)->delete("/finance/{$trx->id}");
        $adminResponse->assertRedirect();
        $this->assertDatabaseMissing('financial_transactions', ['id' => $trx->id]);
    }

    public function test_finance_calculates_sales_and_expenses_net_cash_flow(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $kasir = User::factory()->create(['role' => 'kasir']);

        // Create a sale in the current period
        Sale::create([
            'invoice_number' => 'INV-20261027-0001',
            'user_id' => $kasir->id,
            'customer_name' => 'Umum',
            'subtotal' => 100000,
            'discount' => 0,
            'total_amount' => 100000,
            'payment_method' => 'cash',
            'cash_paid' => 100000,
            'change_amount' => 0,
            'created_at' => Carbon::now(),
        ]);

        // Create an expense
        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-0002',
            'type' => 'expense',
            'category' => 'operasional',
            'amount' => 30000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        // Request monthly period
        $response = $this->actingAs($admin)->get('/finance?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);

        $summary = $response->viewData('page')['props']['summary'];
        $this->assertEquals(100000, $summary['totalSales']);
        $this->assertEquals(30000, $summary['totalExpense']);
        $this->assertEquals(70000, $summary['netCashFlow']); // 100000 - 30000
    }

    public function test_can_export_finance_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-0003',
            'type' => 'expense',
            'category' => 'listrik_air',
            'amount' => 150000,
            'payment_method' => 'transfer',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get('/finance/export/pdf?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
    }

    public function test_can_export_finance_excel_csv(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-20261027-0004',
            'type' => 'income',
            'category' => 'pendapatan_jasa',
            'amount' => 75000,
            'payment_method' => 'cash',
            'transaction_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get('/finance/export/excel?period=monthly&month=' . Carbon::now()->format('Y-m'));
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
    }
}
