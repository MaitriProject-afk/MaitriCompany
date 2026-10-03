<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_any_dashboard(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/staff/dashboard')->assertRedirect('/login');
        $this->get('/warga/dashboard')->assertRedirect('/login');
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_admin_can_access_admin_dashboard_only(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($admin)->get('/staff/dashboard')->assertStatus(403);
        $this->actingAs($admin)->get('/warga/dashboard')->assertStatus(403);
    }

    public function test_staff_can_access_staff_dashboard_only(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->get('/staff/dashboard')->assertStatus(200);
        $this->actingAs($staff)->get('/admin/dashboard')->assertStatus(403);
        $this->actingAs($staff)->get('/warga/dashboard')->assertStatus(403);
    }

    public function test_warga_can_access_warga_dashboard_only(): void
    {
        $warga = User::factory()->warga()->create();

        $this->actingAs($warga)->get('/warga/dashboard')->assertStatus(200);
        $this->actingAs($warga)->get('/admin/dashboard')->assertStatus(403);
        $this->actingAs($warga)->get('/staff/dashboard')->assertStatus(403);
    }

    public function test_general_dashboard_route_redirects_according_to_role(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = User::factory()->staff()->create();
        $warga = User::factory()->warga()->create();

        $this->actingAs($admin)->get('/dashboard')->assertRedirect(route('admin.dashboard'));
        $this->actingAs($staff)->get('/dashboard')->assertRedirect(route('staff.dashboard'));
        $this->actingAs($warga)->get('/dashboard')->assertRedirect(route('warga.dashboard'));
    }
}
