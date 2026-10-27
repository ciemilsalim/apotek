<?php

namespace Tests\Feature;

use App\Models\PharmacyProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PharmacyProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_pharmacy_settings(): void
    {
        $response = $this->get('/settings/pharmacy');
        $response->assertRedirect('/login');

        $response = $this->post('/settings/pharmacy', []);
        $response->assertRedirect('/login');
    }

    public function test_operator_and_kasir_cannot_access_pharmacy_settings(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $kasir = User::factory()->create(['role' => 'kasir']);

        $this->actingAs($operator)->get('/settings/pharmacy')->assertForbidden();
        $this->actingAs($operator)->post('/settings/pharmacy', ['name' => 'Test'])->assertForbidden();

        $this->actingAs($kasir)->get('/settings/pharmacy')->assertForbidden();
        $this->actingAs($kasir)->post('/settings/pharmacy', ['name' => 'Test'])->assertForbidden();
    }

    public function test_admin_can_view_pharmacy_settings_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/settings/pharmacy');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/PharmacyProfile')
            ->has('pharmacy')
            ->where('pharmacy.name', 'Apotek Sehat')
        );
    }

    public function test_admin_can_update_pharmacy_profile_text_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $payload = [
            'name' => 'Apotek Bio Medika Farma',
            'tagline' => 'Solusi Obat Lengkap & Murah',
            'owner_name' => 'Dr. H. Bambang Soeprapto',
            'apa_name' => 'apt. Dewi Sartika, M.Farm.',
            'sipa_number' => '19870215/SIPA_32.73/2025/1002',
            'sia_number' => '503/008/SIA-DPMPTSP/2024',
            'address' => 'Jl. Kesehatan Bangsa No. 99, Bandung',
            'phone' => '0812-9876-5432',
            'email' => 'admin@biomedika.id',
            'receipt_footer' => "Terima Kasih Atas Kepercayaan Anda\nObat yang dibeli tidak dapat ditukar",
        ];

        $response = $this->actingAs($admin)->post('/settings/pharmacy', $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Profil Apotek berhasil diperbarui!');

        $this->assertDatabaseHas('pharmacy_profiles', [
            'name' => 'Apotek Bio Medika Farma',
            'tagline' => 'Solusi Obat Lengkap & Murah',
            'owner_name' => 'Dr. H. Bambang Soeprapto',
            'apa_name' => 'apt. Dewi Sartika, M.Farm.',
            'sipa_number' => '19870215/SIPA_32.73/2025/1002',
            'sia_number' => '503/008/SIA-DPMPTSP/2024',
            'address' => 'Jl. Kesehatan Bangsa No. 99, Bandung',
            'phone' => '0812-9876-5432',
            'email' => 'admin@biomedika.id',
        ]);
    }

    public function test_admin_can_upload_and_replace_pharmacy_logo(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $file = UploadedFile::fake()->image('logo_apotek.png', 200, 200);

        $response = $this->actingAs($admin)->post('/settings/pharmacy', [
            'name' => 'Apotek Sehat Plus',
            'logo' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $profile = PharmacyProfile::getSettings();
        $this->assertNotNull($profile->logo_path);
        Storage::disk('public')->assertExists($profile->logo_path);
        $this->assertStringContainsString('/storage/', $profile->logo_url);
    }

    public function test_pharmacy_profile_validation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Name is required
        $response = $this->actingAs($admin)->post('/settings/pharmacy', [
            'name' => '',
            'email' => 'bukan-email-valid',
        ]);

        $response->assertSessionHasErrors(['name', 'email']);
    }

    public function test_updated_pharmacy_reflected_in_shared_inertia_and_reports(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Update profile
        $this->actingAs($admin)->post('/settings/pharmacy', [
            'name' => 'Apotek Medika Utama',
            'apa_name' => 'apt. Budi Gunawan, S.Farm.',
            'sipa_number' => 'SIPA-99999',
            'sia_number' => 'SIA-88888',
        ]);

        // Check shared prop in any dashboard view
        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('pharmacy.name', 'Apotek Medika Utama')
            ->where('pharmacy.apa_name', 'apt. Budi Gunawan, S.Farm.')
        );

        // Check PDF export contains updated APA and SIPA
        $pdfResponse = $this->actingAs($admin)->get('/reports/export/pdf');
        $pdfResponse->assertOk();
        $this->assertEquals('application/pdf', $pdfResponse->headers->get('content-type'));

        // Check Finance PDF export
        $finPdf = $this->actingAs($admin)->get('/finance/export/pdf');
        $finPdf->assertOk();
        $this->assertEquals('application/pdf', $finPdf->headers->get('content-type'));

        // Check Profit & Loss PDF export
        $plPdf = $this->actingAs($admin)->get('/reports/profit-loss/export/pdf');
        $plPdf->assertOk();
        $this->assertEquals('application/pdf', $plPdf->headers->get('content-type'));
    }
}
