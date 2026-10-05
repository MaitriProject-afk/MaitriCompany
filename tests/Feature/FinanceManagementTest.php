<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleRental;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_finance_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Hauler Prime',
            'rental_price_per_hour' => 100000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Roadtrain 01',
            'plate_number' => 'RT-001',
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Tommy Vercetti',
            'san_andreas_id_card' => 'SA-1111',
            'contact_phone' => '555-1111',
            'san_andreas_phone' => '555-1111',
            'rental_type' => 'jam',
            'duration' => 2,
            'rate_per_unit' => 100000,
            'rental_price' => 200000,
            'start_time' => Carbon::now()->subHours(3),
            'expected_return_time' => Carbon::now()->subHours(1),
            'actual_return_time' => Carbon::now(),
            'status' => VehicleRental::STATUS_COMPLETED,
            'late_duration_hours' => 1,
            'late_penalty_fee' => 50000,
            'damage_fee' => 150000,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_MECHANIC,
            'total_cost' => 400000,
            'initial_health' => 2000,
            'return_health' => 1800,
            'truck_health' => 1800,
        ]);

        $response = $this->actingAs($admin)->get('/admin/finance');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Finance/Index')
            ->has('stats')
            ->where('stats.total_gross_revenue', 400000)
            ->where('stats.net_profit', 250000)
            ->where('stats.total_late_fines', 50000)
            ->where('stats.total_damage_fines', 150000)
            ->where('stats.mechanic_fines', 150000)
            ->has('rentals', 1)
        );
    }

    public function test_non_admin_cannot_access_finance_dashboard(): void
    {
        $staff = User::factory()->staff()->create();
        $response = $this->actingAs($staff)->get('/admin/finance');
        $response->assertStatus(403);

        $warga = User::factory()->warga()->create();
        $response = $this->actingAs($warga)->get('/admin/finance');
        $response->assertStatus(403);
    }

    public function test_public_can_view_official_invoice(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Hauler Prime',
            'rental_price_per_hour' => 100000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Roadtrain 01',
            'plate_number' => 'RT-001',
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Tommy Vercetti',
            'san_andreas_id_card' => 'SA-1111',
            'contact_phone' => '555-1111',
            'san_andreas_phone' => '555-1111',
            'rental_type' => 'jam',
            'duration' => 2,
            'rate_per_unit' => 100000,
            'rental_price' => 200000,
            'start_time' => Carbon::now()->subHours(3),
            'expected_return_time' => Carbon::now()->subHours(1),
            'actual_return_time' => Carbon::now(),
            'status' => VehicleRental::STATUS_COMPLETED,
            'late_duration_hours' => 1,
            'late_penalty_fee' => 50000,
            'damage_fee' => 0,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_NONE,
            'total_cost' => 250000,
            'initial_health' => 2000,
            'return_health' => 1950,
            'truck_health' => 1950,
        ]);

        $invoiceCode = $rental->getInvoiceCode();

        $response = $this->get("/invoice/{$invoiceCode}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/RentalInvoice')
            ->has('invoice')
            ->where('invoice.renter_name', 'Tommy Vercetti')
            ->where('invoice.total_cost', 250000)
            ->where('invoice.late_penalty_fee', 50000)
        );
    }
}
