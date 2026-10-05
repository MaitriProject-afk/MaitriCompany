<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVehicleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_vehicles(): void
    {
        $response = $this->get('/admin/vehicles');

        $response->assertRedirect('/login');
    }

    public function test_warga_cannot_access_vehicles(): void
    {
        $warga = User::factory()->warga()->create();

        $response = $this->actingAs($warga)->get('/admin/vehicles');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_access_vehicles(): void
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->get('/admin/vehicles');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_vehicles_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/vehicles');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_vehicle_category_with_only_per_trip_pricing(): void
    {
        $admin = User::factory()->admin()->create();

        // Testing the exact user scenario: "jika cuman mau per trip aja berarti ya lain nya null gitu"
        $response = $this->actingAs($admin)->post('/admin/vehicle-categories', [
            'name' => 'Roadtrain Heavy Haulage',
            'rental_price_per_hour' => null,
            'rental_price_per_day' => null,
            'rental_price_per_trip' => 12500000,
            'description' => 'Khusus rute hauling tambang sekali trip.',
            'icon' => 'train',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicle_categories', [
            'name' => 'Roadtrain Heavy Haulage',
            'rental_price_per_hour' => null,
            'rental_price_per_day' => null,
            'rental_price_per_trip' => 12500000,
            'icon' => 'train',
        ]);
    }

    public function test_admin_can_create_vehicle_category_with_hourly_daily_and_trip_rates(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/vehicle-categories', [
            'name' => 'Pickup Truck Express',
            'rental_price_per_hour' => 120000,
            'rental_price_per_day' => 850000,
            'rental_price_per_trip' => 500000,
            'description' => 'Pickup serbaguna dalam kota.',
            'icon' => 'local_shipping',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicle_categories', [
            'name' => 'Pickup Truck Express',
            'rental_price_per_hour' => 120000,
            'rental_price_per_day' => 850000,
            'rental_price_per_trip' => 500000,
        ]);
    }

    public function test_admin_cannot_create_vehicle_category_without_any_pricing_option(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/vehicle-categories', [
            'name' => 'Dummy Category',
            'rental_price_per_hour' => null,
            'rental_price_per_day' => null,
            'rental_price_per_trip' => null,
            'icon' => 'local_shipping',
        ]);

        $response->assertSessionHasErrors(['rental_price_per_day']);
    }

    public function test_admin_can_update_vehicle_category_flexible_rates(): void
    {
        $admin = User::factory()->admin()->create();
        $category = VehicleCategory::create([
            'name' => 'Pickup Truck',
            'rental_price_per_day' => 750000,
            'icon' => 'local_shipping',
        ]);

        $response = $this->actingAs($admin)->put("/admin/vehicle-categories/{$category->id}", [
            'name' => 'Pickup Truck Multi Option',
            'rental_price_per_hour' => 100000,
            'rental_price_per_day' => 800000,
            'rental_price_per_trip' => 450000,
            'icon' => 'rv_hookup',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicle_categories', [
            'id' => $category->id,
            'name' => 'Pickup Truck Multi Option',
            'rental_price_per_hour' => 100000,
            'rental_price_per_day' => 800000,
            'rental_price_per_trip' => 450000,
        ]);
    }

    public function test_admin_cannot_delete_category_when_vehicles_are_attached(): void
    {
        $admin = User::factory()->admin()->create();
        $category = VehicleCategory::create([
            'name' => 'Lorry',
            'rental_price_per_day' => 2000000,
            'icon' => 'local_shipping',
        ]);

        Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Hino Ranger FL',
            'plate_number' => 'B 1234 CD',
            'status' => 'tersedia',
        ]);

        $response = $this->actingAs($admin)->delete("/admin/vehicle-categories/{$category->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('vehicle_categories', [
            'id' => $category->id,
        ]);
    }

    public function test_admin_can_create_vehicle_and_link_multiple_users(): void
    {
        $admin = User::factory()->admin()->create();
        $driver1 = User::factory()->staff()->create(['name' => 'Driver Joko']);
        $driver2 = User::factory()->warga()->create(['name' => 'Driver Rudi']);

        $category = VehicleCategory::create([
            'name' => 'Heavy Truck',
            'rental_price_per_trip' => 4500000,
            'icon' => 'forklift',
        ]);

        $response = $this->actingAs($admin)->post('/admin/vehicles', [
            'vehicle_category_id' => $category->id,
            'name' => 'Scania Heavy Tipper 40T',
            'plate_number' => 'KT 9999 HA',
            'capacity' => '40 Ton',
            'status' => 'tersedia',
            'year' => 2024,
            'notes' => 'Unit baru operasional tambang.',
            'user_ids' => [$driver1->id, $driver2->id],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicles', [
            'plate_number' => 'KT 9999 HA',
            'name' => 'Scania Heavy Tipper 40T',
            'vehicle_category_id' => $category->id,
        ]);

        $vehicle = Vehicle::where('plate_number', 'KT 9999 HA')->firstOrFail();
        $this->assertCount(2, $vehicle->users);
        $this->assertTrue($vehicle->users->contains($driver1->id));
        $this->assertTrue($vehicle->users->contains($driver2->id));
    }

    public function test_admin_can_update_vehicle_and_sync_linked_users(): void
    {
        $admin = User::factory()->admin()->create();
        $driver1 = User::factory()->staff()->create();
        $driver2 = User::factory()->staff()->create();

        $category = VehicleCategory::create([
            'name' => 'Box Car',
            'rental_price_per_day' => 1200000,
            'rental_price_per_trip' => 900000,
            'icon' => 'inventory_2',
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Isuzu Elf Box',
            'plate_number' => 'D 5555 EF',
            'status' => 'tersedia',
        ]);
        $vehicle->users()->sync([$driver1->id]);

        $this->assertCount(1, $vehicle->fresh()->users);

        $response = $this->actingAs($admin)->put("/admin/vehicles/{$vehicle->id}", [
            'vehicle_category_id' => $category->id,
            'name' => 'Isuzu Giga Box Long',
            'plate_number' => 'D 5555 EF',
            'capacity' => '10 Ton',
            'status' => 'disewa',
            'year' => 2023,
            'user_ids' => [$driver2->id],
        ]);

        $response->assertSessionHas('success');

        $updatedVehicle = $vehicle->fresh();
        $this->assertEquals('Isuzu Giga Box Long', $updatedVehicle->name);
        $this->assertEquals('disewa', $updatedVehicle->status);
        $this->assertCount(1, $updatedVehicle->users);
        $this->assertTrue($updatedVehicle->users->contains($driver2->id));
        $this->assertFalse($updatedVehicle->users->contains($driver1->id));
    }

    public function test_admin_can_delete_vehicle(): void
    {
        $admin = User::factory()->admin()->create();
        $category = VehicleCategory::create([
            'name' => 'Pickup Truck',
            'rental_price_per_day' => 600000,
            'icon' => 'local_shipping',
        ]);

        $vehicle = Vehicle::create([
            'vehicle_category_id' => $category->id,
            'name' => 'Grand Max Pickup',
            'plate_number' => 'L 9900 AA',
            'status' => 'tersedia',
        ]);

        $response = $this->actingAs($admin)->delete("/admin/vehicles/{$vehicle->id}");

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('vehicles', [
            'id' => $vehicle->id,
        ]);
    }
}
