<?php

namespace Database\Seeders;

use App\Models\RecruitmentSetting;
use Illuminate\Database\Seeder;

class RecruitmentSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RecruitmentSetting::current();
    }
}
