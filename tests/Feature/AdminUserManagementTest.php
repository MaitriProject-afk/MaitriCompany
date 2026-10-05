<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_user_management(): void
    {
        $response = $this->get('/admin/users');

        $response->assertRedirect('/login');
    }

    public function test_warga_cannot_access_user_management(): void
    {
        $warga = User::factory()->warga()->create();

        $response = $this->actingAs($warga)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_access_user_management(): void
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_user_management(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_can_promote_warga_to_staff(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->warga()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$targetUser->id}/role", [
            'role' => User::ROLE_STAFF,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role' => User::ROLE_STAFF,
        ]);
    }

    public function test_admin_can_promote_staff_to_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->staff()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$targetUser->id}/role", [
            'role' => User::ROLE_ADMIN,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role' => User::ROLE_ADMIN,
        ]);
    }

    public function test_admin_can_demote_user_to_warga(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->staff()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$targetUser->id}/role", [
            'role' => User::ROLE_WARGA,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role' => User::ROLE_WARGA,
        ]);
    }

    public function test_admin_cannot_change_own_role(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}/role", [
            'role' => User::ROLE_WARGA,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => User::ROLE_ADMIN,
        ]);
    }

    public function test_admin_can_assign_position_to_staff(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->staff()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$targetUser->id}/role", [
            'role' => User::ROLE_STAFF,
            'position' => 'Dispatcher Lead & Logistics Coordinator',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role' => User::ROLE_STAFF,
            'position' => 'Dispatcher Lead & Logistics Coordinator',
        ]);
    }

    public function test_admin_can_update_own_position(): void
    {
        $admin = User::factory()->admin()->create(['position' => null]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}/role", [
            'role' => User::ROLE_ADMIN,
            'position' => 'Chief Executive Officer / Fleet Director',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => User::ROLE_ADMIN,
            'position' => 'Chief Executive Officer / Fleet Director',
        ]);
    }

    public function test_demoting_to_warga_clears_position(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->staff()->create(['position' => 'Fleet Supervisor']);

        $response = $this->actingAs($admin)->patch("/admin/users/{$targetUser->id}/role", [
            'role' => User::ROLE_WARGA,
            'position' => 'Some Position',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role' => User::ROLE_WARGA,
            'position' => null,
        ]);
    }
}
