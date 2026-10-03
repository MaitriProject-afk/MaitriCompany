<?php

namespace Database\Seeders;

use App\Models\User;
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
        User::firstOrCreate(
            ['email' => 'admin@maitri.com'],
            [
                'name' => 'Administrator Utama',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Staff Account
        User::firstOrCreate(
            ['email' => 'staff@maitri.com'],
            [
                'name' => 'Staff Operasional',
                'password' => bcrypt('password'),
                'role' => User::ROLE_STAFF,
                'email_verified_at' => now(),
            ]
        );

        // Warga Account
        User::firstOrCreate(
            ['email' => 'warga@maitri.com'],
            [
                'name' => 'Warga Masyarakat',
                'password' => bcrypt('password'),
                'role' => User::ROLE_WARGA,
                'email_verified_at' => now(),
            ]
        );
    }
}
