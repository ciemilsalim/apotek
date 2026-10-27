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

    public function test_can_download_import_template(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $response = $this->actingAs($operator)->get('/medicines/import/template');

        $response->assertOk();
        $this->assertTrue(
            str_contains($response->headers->get('content-disposition', ''), 'template_import_obat')
        );
    }

    public function test_operator_can_import_medicines_csv(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $csvContent = "kode_obat,nama_obat,nama_generik,kategori,satuan,harga_beli,harga_jual,stok,stok_minimum,nomor_batch,tanggal_kadaluarsa\n" .
            "OBT-IMP01,Cefixime 100mg,Cefixime,Antibiotik,Kapsul,15000,22000,40,10,B-CFX-01,2028-06-30\n" .
            "OBT-IMP02,Ibuprofen 400mg,Ibuprofen,Analgesik,Tablet,4000,7000,60,15,B-IBU-02,2028-12-31\n";

        $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('import_obat.csv', $csvContent);

        $response = $this->actingAs($operator)->post('/medicines/import', [
            'file' => $file,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('medicines', [
            'code' => 'OBT-IMP01',
            'name' => 'Cefixime 100mg',
            'stock' => 40,
        ]);

        $this->assertDatabaseHas('medicines', [
            'code' => 'OBT-IMP02',
            'name' => 'Ibuprofen 400mg',
            'stock' => 60,
        ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Antibiotik',
        ]);
    }

    public function test_operator_can_import_medicines_xlsx(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['kode_obat', 'nama_obat', 'kategori', 'satuan', 'harga_beli', 'harga_jual', 'stok'],
            ['OBT-XLS01', 'Cetirizine 10mg', 'Antihistamin', 'Strip', 6000, 10000, 35],
        ]);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_med_') . '.xlsx';
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempPath,
            'data_obat.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($operator)->post('/medicines/import', [
            'file' => $uploadedFile,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('medicines', [
            'code' => 'OBT-XLS01',
            'name' => 'Cetirizine 10mg',
            'stock' => 35,
        ]);

        if (file_exists($tempPath)) {
            @unlink($tempPath);
        }
    }

    public function test_kasir_cannot_import_medicines(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        $response = $this->actingAs($kasir)->get('/medicines/import/template');
        $response->assertForbidden();

        $response = $this->actingAs($kasir)->post('/medicines/import', []);
        $response->assertForbidden();
    }
}
