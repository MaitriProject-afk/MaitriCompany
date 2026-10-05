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

    public function test_admin_can_create_vehicle_category_with_custom_rental_price(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/vehicle-categories', [
            'name' => 'Roadtrain Heavy Haul',
            'rental_price_per_day' => 8500000,
            'description' => 'Truk konfigurasi multi trailer kapasitas ekstra.',
            'icon' => 'train',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicle_categories', [
            'name' => 'Roadtrain Heavy Haul',
            'rental_price_per_day' => 8500000,
            'icon' => 'train',
        ]);
    }

    public function test_admin_can_update_vehicle_category_rental_price(): void
    {
        $admin = User::factory()->admin()->create();
        $category = VehicleCategory::create([
            'name' => 'Pickup Truck',
            'rental_price_per_day' => 750000,
            'icon' => 'local_shipping',
        ]);

        $response = $this->actingAs($admin)->put("/admin/vehicle-categories/{$category->id}", [
            'name' => 'Pickup Truck Super',
            'rental_price_per_day' => 900000,
            'icon' => 'rv_hookup',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('vehicle_categories', [
            'id' => $category->id,
            'name' => 'Pickup Truck Super',
            'rental_price_per_day' => 900000,
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
            'rental_price_per_day' => 4500000,
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
