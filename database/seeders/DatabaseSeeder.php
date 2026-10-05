<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@maitri.com'],
            [
                'name' => 'Administrator Utama',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Staff Accounts
        $staff1 = User::firstOrCreate(
            ['email' => 'staff@maitri.com'],
            [
                'name' => 'Staff Operasional Fleet',
                'password' => bcrypt('password'),
                'role' => User::ROLE_STAFF,
                'email_verified_at' => now(),
            ]
        );

        $driverBambang = User::firstOrCreate(
            ['email' => 'bambang.driver@maitri.com'],
            [
                'name' => 'Bambang Hariyanto (Driver Senior)',
                'password' => bcrypt('password'),
                'role' => User::ROLE_STAFF,
                'email_verified_at' => now(),
            ]
        );

        $driverSupri = User::firstOrCreate(
            ['email' => 'supri.driver@maitri.com'],
            [
                'name' => 'Supriyadi (Driver Tronton)',
                'password' => bcrypt('password'),
                'role' => User::ROLE_STAFF,
                'email_verified_at' => now(),
            ]
        );

        // Warga Account
        $warga = User::firstOrCreate(
            ['email' => 'warga@maitri.com'],
            [
                'name' => 'Warga Masyarakat',
                'password' => bcrypt('password'),
                'role' => User::ROLE_WARGA,
                'email_verified_at' => now(),
            ]
        );

        // Vehicle Categories (User requested: Pickup Truck, Lorry, Box Car, Heavy Truck, Roadtrain)
        $catPickup = VehicleCategory::firstOrCreate(
            ['slug' => 'pickup-truck'],
            [
                'name' => 'Pickup Truck',
                'description' => 'Kendaraan bak terbuka muatan ringan s.d 1.5 ton untuk mobilitas cepat perkotaan.',
                'rental_price_per_hour' => 120000,
                'rental_price_per_day' => 850000,
                'rental_price_per_trip' => 500000,
                'icon' => 'local_shipping',
            ]
        );

        $catLorry = VehicleCategory::firstOrCreate(
            ['slug' => 'lorry'],
            [
                'name' => 'Lorry',
                'description' => 'Truk medium cargo muatan hingga 5-8 ton lintas kabupaten/provinsi.',
                'rental_price_per_hour' => null,
                'rental_price_per_day' => 1750000,
                'rental_price_per_trip' => 1200000,
                'icon' => 'rv_hookup',
            ]
        );

        $catBoxCar = VehicleCategory::firstOrCreate(
            ['slug' => 'box-car'],
            [
                'name' => 'Box Car',
                'description' => 'Truk tertutup boks pendingin atau kering tahan cuaca muatan 10-15 ton.',
                'rental_price_per_hour' => null,
                'rental_price_per_day' => 2400000,
                'rental_price_per_trip' => 1800000,
                'icon' => 'inventory_2',
            ]
        );

        $catHeavyTruck = VehicleCategory::firstOrCreate(
            ['slug' => 'heavy-truck'],
            [
                'name' => 'Heavy Truck',
                'description' => 'Truk berat tronton wingbox & trailer multi-axle muatan 25-35 ton.',
                'rental_price_per_hour' => null,
                'rental_price_per_day' => 4800000,
                'rental_price_per_trip' => 3500000,
                'icon' => 'local_shipping',
            ]
        );

        $catRoadtrain = VehicleCategory::firstOrCreate(
            ['slug' => 'roadtrain'],
            [
                'name' => 'Roadtrain',
                'description' => 'Rangkaian truk hauling ganda kapasitas super heavy haulage 40-70 ton rute khusus tambang/industri.',
                'rental_price_per_hour' => null,
                'rental_price_per_day' => null,
                'rental_price_per_trip' => 12500000,
                'icon' => 'train',
            ]
        );

        // Vehicles
        $roadtrain = Vehicle::firstOrCreate(
            ['plate_number' => 'B 9421 UXT'],
            [
                'vehicle_category_id' => $catRoadtrain->id,
                'name' => 'Scania R450 Roadtrain Hauler',
                'capacity' => '60 Ton Double Trailer',
                'status' => Vehicle::STATUS_RENTED,
                'year' => 2024,
                'notes' => 'Unit hauling ganda aktif di rute logistik industri Marunda - Cikarang.',
            ]
        );
        $roadtrain->users()->syncWithoutDetaching([
            $driverBambang->id => ['role_note' => 'Driver Utama'],
            $staff1->id => ['role_note' => 'Pengawas Operasional'],
        ]);

        $heavyTruck = Vehicle::firstOrCreate(
            ['plate_number' => 'B 8820 KLO'],
            [
                'vehicle_category_id' => $catHeavyTruck->id,
                'name' => 'Hino 500 Profia Wingbox',
                'capacity' => '30 Ton Tronton',
                'status' => Vehicle::STATUS_AVAILABLE,
                'year' => 2023,
                'notes' => 'Siap penugasan rute antarkota Jawa - Bali.',
            ]
        );
        $heavyTruck->users()->syncWithoutDetaching([
            $driverSupri->id => ['role_note' => 'Driver Utama'],
        ]);

        $boxCar = Vehicle::firstOrCreate(
            ['plate_number' => 'L 7712 AA'],
            [
                'vehicle_category_id' => $catBoxCar->id,
                'name' => 'Isuzu Giga FVR Reefer Cold Box',
                'capacity' => '14 Ton Temperature Controlled',
                'status' => Vehicle::STATUS_AVAILABLE,
                'year' => 2024,
                'notes' => 'Pendingin ThermoKing suhu -20°C s.d +15°C.',
            ]
        );
        $boxCar->users()->syncWithoutDetaching([
            $driverSupri->id => ['role_note' => 'Driver Cadangan'],
        ]);

        $lorry = Vehicle::firstOrCreate(
            ['plate_number' => 'D 3145 XYZ'],
            [
                'vehicle_category_id' => $catLorry->id,
                'name' => 'Mitsubishi Fuso Fighter Lorry',
                'capacity' => '8 Ton Cargo',
                'status' => Vehicle::STATUS_AVAILABLE,
                'year' => 2022,
                'notes' => 'Armada regional Jawa Barat.',
            ]
        );

        $pickup = Vehicle::firstOrCreate(
            ['plate_number' => 'B 1290 ABC'],
            [
                'vehicle_category_id' => $catPickup->id,
                'name' => 'Daihatsu GranMax Pickup Heavy Duty',
                'capacity' => '1.5 Ton',
                'status' => Vehicle::STATUS_AVAILABLE,
                'year' => 2023,
                'notes' => 'Unit shuttle operasional intra-kota.',
            ]
        );
    }
}
