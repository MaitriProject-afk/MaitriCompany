<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'is_recruitment_open',
    'required_fields',
    'form_sections',
    'available_licenses',
    'domicile_options',
    'experience_options',
    'shift_options',
    'sop_commitments',
    'ic_custom_questions',
    'motivation_prompt',
    'ooc_enabled',
    'ooc_questions',
    'instructions',
    'contact_person',
])]
class RecruitmentSetting extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_recruitment_open' => 'boolean',
            'required_fields' => 'array',
            'form_sections' => 'array',
            'available_licenses' => 'array',
            'domicile_options' => 'array',
            'experience_options' => 'array',
            'shift_options' => 'array',
            'sop_commitments' => 'array',
            'ic_custom_questions' => 'array',
            'ooc_enabled' => 'boolean',
            'ooc_questions' => 'array',
        ];
    }

    /**
     * Get default form sections visibility.
     */
    public static function defaultSections(): array
    {
        return [
            'show_identity' => true,
            'show_phone' => true,
            'show_id_card' => true,
            'show_age' => true,
            'show_domicile' => true,
            'show_licenses' => true,
            'show_experience' => true,
            'show_shift' => true,
            'show_motivation' => true,
            'show_ooc' => true,
            'show_sop' => true,
        ];
    }

    /**
     * Get default available licenses.
     */
    public static function defaultLicenses(): array
    {
        return [
            ['id' => 'driving', 'label' => 'Driving License (SIM Mengemudi Aktif)', 'icon' => 'badge', 'is_active' => true],
            ['id' => 'trucker', 'label' => 'Trucker / Heavy Vehicle License (Lisensi Truk Berat)', 'icon' => 'local_shipping', 'is_active' => true],
            ['id' => 'clean_record', 'label' => 'Catatan Bersih Bebas Kriminal Berat (Clean Record)', 'icon' => 'verified_user', 'is_active' => true],
            ['id' => 'mechanic_cert', 'label' => 'Sertifikasi Bengkel / Keahlian Otomotif', 'icon' => 'handyman', 'is_active' => true],
            ['id' => 'firearm_permit', 'label' => 'Izin Senjata Sah (Firearm Permit)', 'icon' => 'security', 'is_active' => true],
            ['id' => 'portfolio_design', 'label' => 'Portofolio Desain / Arsitektur 3D', 'icon' => 'draw', 'is_active' => true],
        ];
    }

    /**
     * Get default domicile options.
     */
    public static function defaultDomiciles(): array
    {
        return [
            'Verona Beach (Dekat Kantor HQ)',
            'Marina',
            'Commerce / Pusat Kota',
            'Idlewood',
            'Ganton',
            'Temple / Vinewood',
            'Red County / Desa Sekitar',
            'San Fierro',
            'Las Venturas',
            'Wilayah Lainnya',
        ];
    }

    /**
     * Get default experience options.
     */
    public static function defaultExperiences(): array
    {
        return [
            ['id' => 'pemula', 'label' => 'Pemula / Baru Memulai Karier'],
            ['id' => '1_2_tahun', 'label' => '1 s.d 2 Tahun (Terbiasa Rute Hauling/Operasional)'],
            ['id' => '3_tahun_lebih', 'label' => '3+ Tahun (Sangat Berpengalaman / Senior)'],
        ];
    }

    /**
     * Get default shift options.
     */
    public static function defaultShifts(): array
    {
        return [
            ['id' => 'fleksibel', 'label' => 'Fleksibel (Kapan Saja Sesuai Jadwal)'],
            ['id' => 'pagi', 'label' => 'Shift Pagi / Siang (08:00 - 16:00)'],
            ['id' => 'sore_malam', 'label' => 'Shift Sore / Malam (16:00 - 24:00)'],
            ['id' => 'dini_hari', 'label' => 'Shift Dini Hari / Kalong (00:00 - 08:00)'],
        ];
    }

    /**
     * Get default SOP commitments.
     */
    public static function defaultSopCommitments(): array
    {
        return [
            [
                'id' => 'sop_care',
                'text' => 'Saya bersedia menjaga keutuhan unit armada (kondisi prima 2000 HP) dan mematuhi batas toleransi lecet saat bertugas.',
                'required' => true,
            ],
            [
                'id' => 'sop_no_failrp',
                'text' => 'Saya berjanji tidak akan meninggalkan kendaraan sembarangan, meledakkan, menceburkan, atau melarikan aset perusahaan (Fail RP / Pelanggaran Berat).',
                'required' => true,
            ],
            [
                'id' => 'sop_interview',
                'text' => 'Saya bersedia hadir di kantor Maitri HQ Verona Beach No 12 Los Santos jika dipanggil untuk sesi wawancara dan uji coba.',
                'required' => true,
            ],
        ];
    }

    /**
     * Get default OOC questions.
     */
    public static function defaultOocQuestions(): array
    {
        return [
            [
                'id' => 'discord_tag',
                'question' => 'Username & Tag Discord Aktif',
                'placeholder' => 'Contoh: alex_turner atau #1234 (Wajib untuk panggilan interview)',
                'type' => 'text',
                'required' => true,
            ],
            [
                'id' => 'real_age',
                'question' => 'Usia OOC Anda (Dunia Nyata)',
                'placeholder' => 'Contoh: 21 Tahun',
                'type' => 'number',
                'required' => false,
            ],
            [
                'id' => 'daily_hours',
                'question' => 'Rata-rata Jam Online / Aktif di Server per Hari',
                'placeholder' => 'Contoh: 3 - 5 Jam per hari',
                'type' => 'text',
                'required' => true,
            ],
            [
                'id' => 'ucp_name',
                'question' => 'Nama Akun UCP / Game Profile',
                'placeholder' => 'Contoh: AlexTurner99',
                'type' => 'text',
                'required' => false,
            ],
            [
                'id' => 'rules_understanding',
                'question' => 'Jelaskan apa itu Fail RP dan mengapa dilarang meninggalkan/menceburkan armada truk perusahaan:',
                'placeholder' => 'Jelaskan pemahaman Anda tentang roleplay hauling yang baik...',
                'type' => 'textarea',
                'required' => true,
            ],
        ];
    }

    /**
     * Get or create the singleton recruitment setting record.
     */
    public static function current(): self
    {
        $setting = static::firstOrCreate([], [
            'is_recruitment_open' => true,
            'required_fields' => ['sa_phone', 'sa_id_card', 'age', 'domicile', 'licenses', 'experience_level', 'shift', 'motivation'],
            'form_sections' => static::defaultSections(),
            'available_licenses' => static::defaultLicenses(),
            'domicile_options' => static::defaultDomiciles(),
            'experience_options' => static::defaultExperiences(),
            'shift_options' => static::defaultShifts(),
            'sop_commitments' => static::defaultSopCommitments(),
            'ic_custom_questions' => [],
            'motivation_prompt' => 'Ceritakan motivasi Anda dan keahlian yang ingin Anda kontribusikan untuk memajukan Maitri Company...',
            'ooc_enabled' => true,
            'ooc_questions' => static::defaultOocQuestions(),
            'instructions' => 'Pastikan seluruh informasi karakter (IC) dan data OOC diisi secara jujur. Pelamar yang lolos seleksi berkas akan dihubungi melalui Discord atau Radio IC untuk sesi wawancara di Maitri HQ Verona Beach No 12.',
            'contact_person' => 'HRD & Personalia Maitri Company (Verona Beach HQ No 12)',
        ]);

        // Auto-fill attributes if existing database record has nulls for new columns
        $dirty = false;
        if (empty($setting->form_sections)) {
            $setting->form_sections = static::defaultSections();
            $dirty = true;
        }
        if (empty($setting->available_licenses)) {
            $setting->available_licenses = static::defaultLicenses();
            $dirty = true;
        }
        if (empty($setting->domicile_options)) {
            $setting->domicile_options = static::defaultDomiciles();
            $dirty = true;
        }
        if (empty($setting->experience_options)) {
            $setting->experience_options = static::defaultExperiences();
            $dirty = true;
        }
        if (empty($setting->shift_options)) {
            $setting->shift_options = static::defaultShifts();
            $dirty = true;
        }
        if (empty($setting->sop_commitments)) {
            $setting->sop_commitments = static::defaultSopCommitments();
            $dirty = true;
        }
        if ($setting->ic_custom_questions === null) {
            $setting->ic_custom_questions = [];
            $dirty = true;
        }
        if (empty($setting->motivation_prompt)) {
            $setting->motivation_prompt = 'Ceritakan motivasi Anda dan keahlian yang ingin Anda kontribusikan untuk memajukan Maitri Company...';
            $dirty = true;
        }
        if ($dirty) {
            $setting->save();
        }

        return $setting;
    }
}
