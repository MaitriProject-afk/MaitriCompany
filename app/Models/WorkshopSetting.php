<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'workshop_name',
    'shifts',
    'weekly_ssrp_quota',
    'min_weekly_duty_days',
    'duty_miss_penalty_points',
    'ssrp_miss_penalty_points',
    'max_warning_points',
    'sop_notice',
])]
class WorkshopSetting extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'shifts' => 'array',
            'weekly_ssrp_quota' => 'integer',
            'min_weekly_duty_days' => 'integer',
            'duty_miss_penalty_points' => 'integer',
            'ssrp_miss_penalty_points' => 'integer',
            'max_warning_points' => 'integer',
        ];
    }

    /**
     * Default shift presets when none are configured yet.
     *
     * @return array<int, array<string, string>>
     */
    public static function defaultShifts(): array
    {
        return [
            [
                'id' => 'shift_pagi',
                'name' => 'Shift Pagi',
                'start_time' => '08:00',
                'end_time' => '14:00',
                'description' => 'Operasional garasi pagi & inspeksi unit keluar.',
            ],
            [
                'id' => 'shift_sore',
                'name' => 'Shift Sore',
                'start_time' => '14:00',
                'end_time' => '20:00',
                'description' => 'Perbaikan reguler, body repair, & tune-up 2000 HP.',
            ],
            [
                'id' => 'shift_malam',
                'name' => 'Shift Malam',
                'start_time' => '20:00',
                'end_time' => '02:00',
                'description' => 'Piket mekanik malam & servis darurat konvoi hauling.',
            ],
        ];
    }

    /**
     * Retrieve or create the singleton workshop setting record.
     */
    public static function current(): self
    {
        $setting = static::first();

        if (! $setting) {
            $setting = static::create([
                'workshop_name' => 'Maitri Automotive & Workshop HQ',
                'shifts' => static::defaultShifts(),
                'weekly_ssrp_quota' => 3,
                'min_weekly_duty_days' => 6,
                'duty_miss_penalty_points' => 1,
                'ssrp_miss_penalty_points' => 1,
                'max_warning_points' => 3,
                'sop_notice' => 'Setiap mekanik wajib mengunggah bukti Screenshot (SS) On-Duty sesuai jam shift harian dan memenuhi target laporan SSRP Roleplay mingguan. Ketidakhadiran tanpa pengajuan Izin/Absen resmi akan tercatat sebagai Alpha (+1 Poin Peringatan).',
            ]);
        } elseif (empty($setting->shifts)) {
            $setting->update(['shifts' => static::defaultShifts()]);
        }

        return $setting;
    }
}
