<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleRental;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleRentalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_rent_vehicle_and_status_becomes_disewa(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Heavy Truck Hauler',
            'rental_price_per_hour' => 150000,
            'rental_price_per_day' => 1200000,
            'rental_price_per_trip' => 500000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Linerunner Alpha 01',
            'plate_number' => 'MA-101-TRK',
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $startTime = Carbon::now()->format('Y-m-d H:i:s');

        $response = $this->actingAs($admin)->post('/admin/rentals', [
            'vehicle_id' => $vehicle->id,
            'renter_name' => 'Carl Johnson',
            'san_andreas_id_card' => 'SA-98979',
            'contact_phone' => '555-0199',
            'initial_health' => 2000,
            'licenses' => ['driving', 'trucker'],
            'rental_type' => 'jam',
            'duration' => 4,
            'start_time' => $startTime,
            'notes' => 'Sewa rute hauling Palomino Creek',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('vehicle_rentals', [
            'vehicle_id' => $vehicle->id,
            'renter_name' => 'Carl Johnson',
            'san_andreas_id_card' => 'SA-98979',
            'contact_phone' => '555-0199',
            'initial_health' => 2000,
            'rental_type' => 'jam',
            'duration' => 4,
            'rate_per_unit' => 150000,
            'rental_price' => 600000,
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        $vehicle->refresh();
        $this->assertEquals(Vehicle::STATUS_RENTED, $vehicle->status);
    }

    public function test_vehicle_that_is_already_rented_cannot_be_rented_again(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Flatbed Timber',
            'rental_price_per_day' => 800000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Flatbed 02',
            'plate_number' => 'MA-202-LBR',
            'status' => Vehicle::STATUS_RENTED, // already rented
        ]);

        $response = $this->actingAs($admin)->post('/admin/rentals', [
            'vehicle_id' => $vehicle->id,
            'renter_name' => 'Sweet Johnson',
            'san_andreas_id_card' => 'SA-88771',
            'contact_phone' => '555-0200',
            'initial_health' => 2000,
            'licenses' => ['driving', 'lumber'],
            'rental_type' => 'hari',
            'duration' => 2,
            'start_time' => Carbon::now()->format('Y-m-d H:i:s'),
        ]);

        $response->assertSessionHasErrors(['vehicle_id']);
    }

    public function test_admin_can_process_return_with_late_and_damage_penalties(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Box Truck Logistics',
            'rental_price_per_hour' => 100000,
            'rental_price_per_day' => 800000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Yankee 03',
            'plate_number' => 'MA-303-BOX',
            'status' => Vehicle::STATUS_RENTED,
        ]);

        $start = Carbon::now()->subHours(6);
        $expected = Carbon::now()->subHours(2); // 2 hours late
        $actual = Carbon::now();

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Big Smoke',
            'san_andreas_id_card' => 'SA-55443',
            'contact_phone' => '555-0818',
            'san_andreas_phone' => '555-0818',
            'initial_health' => 2000,
            'truck_health' => 2000,
            'licenses' => ['driving', 'trucker'],
            'rental_type' => 'jam',
            'duration' => 4,
            'rate_per_unit' => 100000,
            'rental_price' => 400000,
            'start_time' => $start,
            'expected_return_time' => $expected,
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($admin)->post("/admin/rentals/{$rental->id}/return", [
            'actual_return_time' => $actual->format('Y-m-d H:i:s'),
            'vehicle_condition' => VehicleRental::CONDITION_LIGHT_DAMAGE,
            'return_health' => 1800,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_MECHANIC,
            'damage_fee' => 250000,
            'late_penalty_fee' => 300000,
            'return_notes' => 'Bumper depan lecet perbaikan di mechanic Palomino.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $rental->refresh();
        $this->assertEquals(VehicleRental::STATUS_COMPLETED, $rental->status);
        $this->assertEquals(1800, $rental->return_health);
        $this->assertEquals(VehicleRental::DAMAGE_TYPE_MECHANIC, $rental->damage_fee_type);
        $this->assertEquals(250000, $rental->damage_fee);
        $this->assertEquals(300000, $rental->late_penalty_fee);
        // Base 400,000 + Late penalty (300,000) + damage (250,000) = 950,000
        $this->assertEquals(950000, $rental->total_cost);

        // Vehicle returns to available because damage is light & health >= 1000
        $vehicle->refresh();
        $this->assertEquals(Vehicle::STATUS_AVAILABLE, $vehicle->status);
    }

    public function test_heavily_damaged_or_destroyed_vehicle_switches_to_maintenance(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Dump Truck Mining',
            'rental_price_per_trip' => 750000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Dumper 09',
            'plate_number' => 'MA-909-DMP',
            'status' => Vehicle::STATUS_RENTED,
        ]);

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Ryder Johnson',
            'san_andreas_id_card' => 'SA-44332',
            'contact_phone' => '555-0420',
            'san_andreas_phone' => '555-0420',
            'initial_health' => 2000,
            'truck_health' => 2000,
            'licenses' => ['driving', 'trucker', 'lumber'],
            'rental_type' => 'trip',
            'duration' => 1,
            'rate_per_unit' => 750000,
            'rental_price' => 750000,
            'start_time' => Carbon::now()->subHours(2),
            'expected_return_time' => Carbon::now()->addHours(2),
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($admin)->post("/admin/rentals/{$rental->id}/return", [
            'actual_return_time' => Carbon::now()->format('Y-m-d H:i:s'),
            'vehicle_condition' => VehicleRental::CONDITION_DESTROYED,
            'return_health' => 0,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_INSURANCE,
            'damage_fee' => 5000000,
            'return_notes' => 'Truk meledak di Mount Chiliad. Klaim asuransi tebus unit.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $rental->refresh();
        $this->assertEquals(0, $rental->return_health);
        $this->assertEquals(VehicleRental::DAMAGE_TYPE_INSURANCE, $rental->damage_fee_type);
        $this->assertEquals(5000000, $rental->damage_fee);

        // Status vehicle must change to maintenance (perawatan)
        $vehicle->refresh();
        $this->assertEquals(Vehicle::STATUS_MAINTENANCE, $vehicle->status);
    }

    public function test_cannot_choose_bebas_denda_when_health_loss_exceeds_100_hp(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Box Truck Logistics',
            'rental_price_per_hour' => 100000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Yankee 04',
            'plate_number' => 'MA-304-BOX',
            'status' => Vehicle::STATUS_RENTED,
        ]);

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Big Smoke',
            'san_andreas_id_card' => 'SA-55443',
            'contact_phone' => '555-0818',
            'san_andreas_phone' => '555-0818',
            'initial_health' => 2000,
            'truck_health' => 2000,
            'licenses' => ['driving'],
            'rental_type' => 'jam',
            'duration' => 2,
            'rate_per_unit' => 100000,
            'rental_price' => 200000,
            'start_time' => Carbon::now()->subHours(2),
            'expected_return_time' => Carbon::now()->addHours(1),
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        // Trying to return with health 1452 (loss 548 > 100) but choosing 'none' (Bebas Denda)
        $response = $this->actingAs($admin)->post("/admin/rentals/{$rental->id}/return", [
            'actual_return_time' => Carbon::now()->format('Y-m-d H:i:s'),
            'vehicle_condition' => VehicleRental::CONDITION_HEAVY_DAMAGE,
            'return_health' => 1452,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_NONE,
            'damage_fee' => 0,
        ]);

        $response->assertSessionHasErrors(['damage_fee_type']);

        // Trying with mechanic but Rp 0 fee must also fail
        $responseZeroFee = $this->actingAs($admin)->post("/admin/rentals/{$rental->id}/return", [
            'actual_return_time' => Carbon::now()->format('Y-m-d H:i:s'),
            'vehicle_condition' => VehicleRental::CONDITION_HEAVY_DAMAGE,
            'return_health' => 1452,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_MECHANIC,
            'damage_fee' => 0,
        ]);

        $responseZeroFee->assertSessionHasErrors(['damage_fee']);
    }

    public function test_cannot_choose_mechanic_or_bebas_denda_when_zero_health(): void
    {
        $admin = User::factory()->admin()->create();

        $category = VehicleCategory::create([
            'name' => 'Heavy Truck',
            'rental_price_per_day' => 500000,
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Roadtrain 01',
            'plate_number' => 'MA-501-RT',
            'status' => Vehicle::STATUS_RENTED,
        ]);

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Ryder',
            'san_andreas_id_card' => 'SA-44332',
            'contact_phone' => '555-0420',
            'san_andreas_phone' => '555-0420',
            'initial_health' => 2000,
            'truck_health' => 2000,
            'licenses' => ['driving'],
            'rental_type' => 'hari',
            'duration' => 1,
            'rate_per_unit' => 500000,
            'rental_price' => 500000,
            'start_time' => Carbon::now()->subDay(),
            'expected_return_time' => Carbon::now(),
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        // Health 0 HP with 'mechanic' instead of 'insurance' must fail
        $response = $this->actingAs($admin)->post("/admin/rentals/{$rental->id}/return", [
            'actual_return_time' => Carbon::now()->format('Y-m-d H:i:s'),
            'vehicle_condition' => VehicleRental::CONDITION_DESTROYED,
            'return_health' => 0,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_MECHANIC,
            'damage_fee' => 1000000,
        ]);

        $response->assertSessionHasErrors(['damage_fee_type']);
    }

    public function test_guest_can_view_public_rental_mou_document(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Lucian Castellano',
            'email' => 'lucian@maitri.com',
        ]);

        $category = VehicleCategory::create([
            'name' => 'Linerunner Hauling',
            'rental_price_per_day' => 1500000,
            'icon' => 'local_shipping',
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Linerunner Prime 01',
            'plate_number' => 'MA-888-LNR',
            'status' => Vehicle::STATUS_RENTED,
        ]);

        $rental = VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $admin->id,
            'renter_name' => 'Carl Johnson',
            'san_andreas_id_card' => 'SA-112233',
            'contact_phone' => '555-9090',
            'san_andreas_phone' => '555-9090',
            'licenses' => ['driving', 'trucker'],
            'rental_type' => 'hari',
            'duration' => 3,
            'rate_per_unit' => 1500000,
            'rental_price' => 4500000,
            'start_time' => Carbon::now(),
            'expected_return_time' => Carbon::now()->addDays(3),
            'status' => VehicleRental::STATUS_ACTIVE,
        ]);

        // Access via mou_code without authentication
        $response = $this->get("/mou/{$rental->mou_code}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/RentalMou')
            ->has('rental')
            ->where('rental.renter_name', 'Carl Johnson')
            ->where('rental.contract_number', $rental->contract_number)
            ->where('rental.admin.name', 'Lucian Castellano')
            ->where('rental.admin.email', 'lucian@maitri.com')
            ->has('categories')
        );

        // Also accessible via numeric ID
        $responseById = $this->get("/mou/{$rental->id}");
        $responseById->assertStatus(200);
    }
}
