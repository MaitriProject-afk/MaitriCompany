<?php

namespace Tests\Feature;

use App\Models\RecruitmentDivision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffDivisionDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_without_division_sees_unassigned_onboarding_dashboard(): void
    {
        $staff = User::factory()->staff()->create([
            'recruitment_division_id' => null,
        ]);

        $response = $this->actingAs($staff)->get(route('staff.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Staff/Dashboard')
            ->where('currentDivisionCode', null)
            ->has('allDivisions')
        );
    }

    public function test_staff_with_marketing_division_renders_marketing_code(): void
    {
        $div = RecruitmentDivision::create([
            'code' => 'marketing',
            'title' => 'Divisi Marketing',
            'department' => 'Pemasaran & Publikasi',
            'icon' => 'campaign',
            'description' => 'Marketing Maitri',
            'is_active' => true,
        ]);

        $staff = User::factory()->staff()->create([
            'recruitment_division_id' => $div->id,
        ]);

        $response = $this->actingAs($staff)->get(route('staff.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Staff/Dashboard')
            ->where('currentDivisionCode', 'marketing')
        );
    }

    public function test_staff_with_automotive_division_renders_automotive_code(): void
    {
        $div = RecruitmentDivision::create([
            'code' => 'automotive',
            'title' => 'Divisi Automotive',
            'department' => 'Workshop & Pemeliharaan Armada',
            'icon' => 'build',
            'description' => 'Automotive Maitri',
            'is_active' => true,
        ]);

        $staff = User::factory()->staff()->create([
            'recruitment_division_id' => $div->id,
        ]);

        $response = $this->actingAs($staff)->get(route('staff.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Staff/Dashboard')
            ->where('currentDivisionCode', 'automotive')
        );
    }

    public function test_staff_with_rental_division_renders_rental_code(): void
    {
        $div = RecruitmentDivision::create([
            'code' => 'rental',
            'title' => 'Divisi Rental',
            'department' => 'Layanan & Dispatcher Sewa Armada',
            'icon' => 'key',
            'description' => 'Rental Maitri',
            'is_active' => true,
        ]);

        $staff = User::factory()->staff()->create([
            'recruitment_division_id' => $div->id,
        ]);

        $response = $this->actingAs($staff)->get(route('staff.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Staff/Dashboard')
            ->where('currentDivisionCode', 'rental')
        );
    }

    public function test_staff_with_daily_globe_division_renders_daily_globe_code(): void
    {
        $div = RecruitmentDivision::create([
            'code' => 'daily_globe',
            'title' => 'Divisi Daily Globe',
            'department' => 'Jurnalistik & Kantor Berita Pers',
            'icon' => 'newspaper',
            'description' => 'Daily Globe Maitri',
            'is_active' => true,
        ]);

        $staff = User::factory()->staff()->create([
            'recruitment_division_id' => $div->id,
        ]);

        $response = $this->actingAs($staff)->get(route('staff.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Staff/Dashboard')
            ->where('currentDivisionCode', 'daily_globe')
        );
    }

    public function test_admin_can_assign_staff_division_in_user_management(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->warga()->create();

        $div = RecruitmentDivision::create([
            'code' => 'automotive',
            'title' => 'Divisi Automotive',
            'department' => 'Workshop & Pemeliharaan Armada',
            'icon' => 'build',
            'description' => 'Automotive Maitri',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.users.update-role', $user), [
            'role' => User::ROLE_STAFF,
            'position' => 'Mekanik Senior',
            'recruitment_division_id' => $div->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => User::ROLE_STAFF,
            'position' => 'Mekanik Senior',
            'recruitment_division_id' => $div->id,
        ]);
    }
}
