<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');

        $response = $this->get('/medicines');
        $response->assertRedirect('/login');

        $response = $this->get('/pos');
        $response->assertRedirect('/login');

        $response = $this->get('/users');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_all_modules(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/dashboard')->assertOk();
        $this->actingAs($admin)->get('/users')->assertOk();
        $this->actingAs($admin)->get('/medicines')->assertOk();
        $this->actingAs($admin)->get('/categories')->assertOk();
        $this->actingAs($admin)->get('/reports')->assertOk();
        $this->actingAs($admin)->get('/pos')->assertOk();
    }

    public function test_operator_cannot_access_user_management(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);

        // Operator has access to medicines, categories, reports, dashboard
        $this->actingAs($operator)->get('/dashboard')->assertOk();
        $this->actingAs($operator)->get('/medicines')->assertOk();
        $this->actingAs($operator)->get('/categories')->assertOk();
        $this->actingAs($operator)->get('/reports')->assertOk();

        // Operator is forbidden from user management and POS
        $this->actingAs($operator)->get('/users')->assertForbidden();
        $this->actingAs($operator)->get('/pos')->assertForbidden();
    }

    public function test_kasir_can_only_access_dashboard_and_pos(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);

        // Kasir has access to dashboard and POS
        $this->actingAs($kasir)->get('/dashboard')->assertOk();
        $this->actingAs($kasir)->get('/pos')->assertOk();

        // Kasir is forbidden from user management, medicines CRUD, and reports
        $this->actingAs($kasir)->get('/users')->assertForbidden();
        $this->actingAs($kasir)->get('/medicines')->assertForbidden();
        $this->actingAs($kasir)->get('/categories')->assertForbidden();
        $this->actingAs($kasir)->get('/reports')->assertForbidden();
    }
}
