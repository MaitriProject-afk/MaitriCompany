<?php

namespace Tests\Feature;

use App\Models\EmployeeApplication;
use App\Models\RecruitmentDivision;
use App\Models\RecruitmentSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecruitmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_recruitment_console(): void
    {
        $admin = User::factory()->admin()->create();

        RecruitmentDivision::create([
            'title' => 'Supir Truk Logistik (Benson)',
            'department' => 'Divisi Operasional & Logistik',
            'icon' => 'local_shipping',
            'description' => 'Bertanggung jawab atas pengantaran kargo.',
            'qualifications' => ['Memiliki SIM Truk Heavy', 'Minimal level karakter 3'],
            'is_active' => true,
            'quota' => 5,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.recruitment.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Recruitment/Index')
            ->has('divisions', 1)
            ->has('settings')
            ->has('applications')
            ->has('stats')
        );
    }

    public function test_admin_can_create_new_recruitment_division_with_qualifications_and_licenses(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = [
            'title' => 'Staff Keamanan & Pengawalan',
            'department' => 'Divisi Keamanan Korporat',
            'icon' => 'security',
            'description' => 'Mengawal konvoi pengiriman logistik bernilai tinggi.',
            'qualifications' => [
                'Memiliki lisensi senjata sah (Firearm Permit)',
                'Tidak memiliki riwayat kriminal berat di SAPD',
                'Loyal dan disiplin tinggi',
            ],
            'required_licenses' => ['firearm_permit', 'driving'],
            'custom_questions' => [
                ['id' => 'q1', 'question' => 'Riwayat Penggunaan Senjata', 'type' => 'text', 'required' => true],
            ],
            'is_active' => true,
            'quota' => 3,
            'badge' => 'High Priority',
            'sort_order' => 1,
        ];

        $response = $this->actingAs($admin)->post(route('admin.recruitment.divisions.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('recruitment_divisions', [
            'title' => 'Staff Keamanan & Pengawalan',
            'department' => 'Divisi Keamanan Korporat',
            'badge' => 'High Priority',
            'quota' => 3,
            'is_active' => true,
        ]);

        $division = RecruitmentDivision::where('title', 'Staff Keamanan & Pengawalan')->first();
        $this->assertCount(3, $division->qualifications);
        $this->assertContains('Memiliki lisensi senjata sah (Firearm Permit)', $division->qualifications);
        $this->assertEquals(['firearm_permit', 'driving'], $division->required_licenses);
        $this->assertCount(1, $division->custom_questions);
    }

    public function test_admin_can_update_recruitment_division(): void
    {
        $admin = User::factory()->admin()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Customer Care',
            'department' => 'Layanan Pelanggan',
            'description' => 'Melayani order sewa.',
            'qualifications' => ['Ramah'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.recruitment.divisions.update', $division), [
            'title' => 'Customer Care & Dispatcher',
            'department' => 'Layanan & Operasional',
            'description' => 'Melayani order sewa dan memantau armada.',
            'qualifications' => ['Ramah', 'Menguasai peta San Andreas'],
            'is_active' => true,
            'quota' => 4,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('recruitment_divisions', [
            'id' => $division->id,
            'title' => 'Customer Care & Dispatcher',
            'quota' => 4,
        ]);
    }

    public function test_admin_can_toggle_recruitment_division_status(): void
    {
        $admin = User::factory()->admin()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Mekanik Bengkel',
            'department' => 'Teknik',
            'description' => 'Servis armada.',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.recruitment.divisions.toggle', $division));
        $response->assertRedirect();

        $this->assertFalse($division->fresh()->is_active);

        $response2 = $this->actingAs($admin)->patch(route('admin.recruitment.divisions.toggle', $division));
        $response2->assertRedirect();

        $this->assertTrue($division->fresh()->is_active);
    }

    public function test_admin_can_delete_recruitment_division(): void
    {
        $admin = User::factory()->admin()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Posisi Sementara',
            'department' => 'Umum',
            'description' => 'Posisi magang jangka pendek.',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.recruitment.divisions.destroy', $division));
        $response->assertRedirect();

        $this->assertDatabaseMissing('recruitment_divisions', [
            'id' => $division->id,
        ]);
    }

    public function test_admin_can_fully_customize_recruitment_form_sections_licenses_ooc_and_sop(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = [
            'is_recruitment_open' => true,
            'ooc_enabled' => true,
            'form_sections' => [
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
            ],
            'required_fields' => ['full_name', 'email', 'sa_phone', 'sa_id_card', 'motivation'],
            'available_licenses' => [
                ['id' => 'driving', 'label' => 'Driving License', 'icon' => 'badge', 'is_active' => true],
                ['id' => 'boat_license', 'label' => 'Lisensi Kapal Niaga', 'icon' => 'sailing', 'is_active' => true],
            ],
            'domicile_options' => ['Verona Beach', 'Palomino Creek', 'Fort Carson'],
            'experience_options' => [
                ['id' => 'pemula', 'label' => 'Baru di San Andreas'],
                ['id' => 'veteran', 'label' => 'Pengemudi Veteran'],
            ],
            'shift_options' => [
                ['id' => 'pagi', 'label' => 'Pagi Hari'],
                ['id' => 'malam', 'label' => 'Malam Hari'],
            ],
            'sop_commitments' => [
                ['id' => 'sop_1', 'text' => 'Selalu menyalakan lampu saat hauling.', 'required' => true],
            ],
            'ic_custom_questions' => [
                ['id' => 'portfolio_link', 'question' => 'Link Portofolio Desain / Foto', 'type' => 'text', 'required' => false],
            ],
            'motivation_prompt' => 'Apa visi Anda bergabung bersama keluarga besar Maitri Company?',
            'ooc_questions' => [
                [
                    'id' => 'discord_tag',
                    'question' => 'Discord Tag / Username Anda',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'Contoh: user#1234 atau @username',
                ],
                [
                    'id' => 'daily_playtime',
                    'question' => 'Berapa jam rata-rata aktif di server setiap hari?',
                    'type' => 'text',
                    'required' => true,
                    'help' => 'Misal: 3-5 jam/hari',
                ],
            ],
            'instructions' => 'Pastikan membaca peraturan server sebelum mendaftar.',
            'contact_person' => 'HRD Hotline: 555-8899 (Maitri HRD)',
        ];

        $response = $this->actingAs($admin)->post(route('admin.recruitment.settings.update'), $payload);

        $response->assertRedirect();
        $settings = RecruitmentSetting::current();
        $this->assertTrue($settings->is_recruitment_open);
        $this->assertTrue($settings->ooc_enabled);
        $this->assertCount(2, $settings->available_licenses);
        $this->assertCount(3, $settings->domicile_options);
        $this->assertEquals('Apa visi Anda bergabung bersama keluarga besar Maitri Company?', $settings->motivation_prompt);
        $this->assertEquals('Discord Tag / Username Anda', $settings->ooc_questions[0]['question']);
        $this->assertEquals('Selalu menyalakan lampu saat hauling.', $settings->sop_commitments[0]['text']);
    }

    public function test_warga_can_submit_application_with_ic_and_ooc_details(): void
    {
        $warga = User::factory()->warga()->create([
            'name' => 'Michael Corleone',
            'email' => 'michael@citizen.sa',
        ]);

        $division = RecruitmentDivision::create([
            'title' => 'Pengemudi Truk Berat (Road Train)',
            'department' => 'Logistik Ekspedisi',
            'description' => 'Driver kargo jarak jauh.',
            'is_active' => true,
        ]);

        RecruitmentSetting::create([
            'is_recruitment_open' => true,
            'ooc_enabled' => true,
            'required_fields' => ['full_name', 'email', 'sa_phone', 'sa_id_card'],
            'ooc_questions' => [
                [
                    'id' => 'discord_tag',
                    'question' => 'Discord Tag',
                    'type' => 'text',
                    'required' => true,
                ],
            ],
        ]);

        $payload = [
            'recruitment_division_id' => $division->id,
            'full_name' => 'Michael Corleone',
            'email' => 'michael@citizen.sa',
            'sa_phone' => '555-0199',
            'sa_id_card' => 'SA-998822',
            'age' => 28,
            'domicile' => 'Ganton, Los Santos',
            'licenses' => ['driving', 'trucker'],
            'experience_level' => 'berpengalaman',
            'shift' => 'siang',
            'motivation' => 'Ingin mendedikasikan pengalaman mengemudi untuk armada Maitri Company.',
            'ic_answers' => [
                'portfolio_link' => 'https://example.com/portfolio',
            ],
            'ooc_answers' => [
                'discord_tag' => 'michael_c#0001',
                'real_age' => '22',
            ],
            'sop_agreements' => [
                'sop_care' => true,
                'sop_no_failrp' => true,
            ],
        ];

        $response = $this->actingAs($warga)->post(route('warga.recruitment.apply'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('employee_applications', [
            'user_id' => $warga->id,
            'recruitment_division_id' => $division->id,
            'full_name' => 'Michael Corleone',
            'sa_id_card' => 'SA-998822',
            'status' => EmployeeApplication::STATUS_PENDING,
        ]);

        $application = EmployeeApplication::where('user_id', $warga->id)->first();
        $this->assertStringStartsWith('MTR-HRD-', $application->ticket_number);
        $this->assertEquals('michael_c#0001', $application->ooc_answers['discord_tag'] ?? null);
        $this->assertEquals('https://example.com/portfolio', $application->ic_answers['portfolio_link'] ?? null);
    }

    public function test_warga_cannot_apply_when_division_is_inactive(): void
    {
        $warga = User::factory()->warga()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Staff Gudang',
            'department' => 'Logistik',
            'description' => 'Operator gudang.',
            'is_active' => false,
        ]);

        RecruitmentSetting::create([
            'is_recruitment_open' => true,
        ]);

        $payload = [
            'recruitment_division_id' => $division->id,
            'full_name' => 'Carl Johnson',
            'email' => 'cj@grove.sa',
            'sa_phone' => '555-1234',
            'sa_id_card' => 'SA-112233',
        ];

        $response = $this->actingAs($warga)->post(route('warga.recruitment.apply'), $payload);
        $response->assertSessionHas('error');

        $this->assertDatabaseMissing('employee_applications', [
            'recruitment_division_id' => $division->id,
        ]);
    }

    public function test_warga_cannot_apply_when_global_recruitment_is_closed(): void
    {
        $warga = User::factory()->warga()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Driver Ekspedisi',
            'department' => 'Logistik',
            'description' => 'Driver.',
            'is_active' => true,
        ]);

        RecruitmentSetting::create([
            'is_recruitment_open' => false,
        ]);

        $payload = [
            'recruitment_division_id' => $division->id,
            'full_name' => 'Tommy Vercetti',
            'email' => 'tommy@vice.sa',
            'sa_phone' => '555-7788',
            'sa_id_card' => 'SA-445566',
        ];

        $response = $this->actingAs($warga)->post(route('warga.recruitment.apply'), $payload);
        $response->assertSessionHas('error');

        $this->assertDatabaseMissing('employee_applications', [
            'recruitment_division_id' => $division->id,
        ]);
    }

    public function test_admin_can_review_and_update_application_status(): void
    {
        $admin = User::factory()->admin()->create();
        $warga = User::factory()->warga()->create();

        $division = RecruitmentDivision::create([
            'title' => 'Driver Benson',
            'department' => 'Logistik',
            'description' => 'Driver.',
            'is_active' => true,
        ]);

        $application = EmployeeApplication::create([
            'ticket_number' => 'MTR-HRD-2026-0001',
            'user_id' => $warga->id,
            'recruitment_division_id' => $division->id,
            'position_title' => $division->title,
            'full_name' => 'Franklin Clinton',
            'email' => 'franklin@ls.sa',
            'sa_phone' => '555-9090',
            'sa_id_card' => 'SA-909011',
            'status' => EmployeeApplication::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin)->patch(
            route('admin.recruitment.applications.update', $application),
            [
                'status' => EmployeeApplication::STATUS_ACCEPTED,
                'admin_notes' => 'Kualifikasi sangat cocok. Diterima untuk orientasi hari Senin jam 20:00 WIB.',
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('employee_applications', [
            'id' => $application->id,
            'status' => EmployeeApplication::STATUS_ACCEPTED,
            'admin_notes' => 'Kualifikasi sangat cocok. Diterima untuk orientasi hari Senin jam 20:00 WIB.',
            'reviewed_by' => $admin->id,
        ]);
        $this->assertNotNull($application->fresh()->reviewed_at);
    }

    public function test_admin_can_create_division_with_per_division_sop_commitments_and_custom_field_types(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = [
            'title' => 'Divisi Multimedia & Desain Grafis',
            'department' => 'Media & Publikasi',
            'icon' => 'palette',
            'description' => 'Membuat materi promosi visual dan branding armada.',
            'qualifications' => [
                'Mahir Photoshop / Canva',
                'Mampu bekerja dalam tenggat waktu',
            ],
            'required_licenses' => ['driving'],
            'custom_questions' => [
                [
                    'id' => 'design_software',
                    'question' => 'Software Desain Utama',
                    'type' => 'dropdown',
                    'required' => true,
                    'options' => 'Adobe Photoshop, Adobe Illustrator, CorelDraw, Canva',
                ],
                [
                    'id' => 'have_graphics_tablet',
                    'question' => 'Memiliki Drawing Tablet / Pen Tab fisik',
                    'type' => 'checkbox',
                    'required' => false,
                ],
            ],
            'sop_commitments' => [
                [
                    'id' => 'div_sop_1',
                    'text' => 'Seluruh aset grafis wajib berlisensi bebas royalti atau buatan sendiri.',
                    'required' => true,
                ],
                [
                    'id' => 'div_sop_2',
                    'text' => 'Dilarang membocorkan materi kampanye sebelum rilis resmi.',
                    'required' => true,
                ],
            ],
            'is_active' => true,
            'quota' => 2,
        ];

        $response = $this->actingAs($admin)->post(route('admin.recruitment.divisions.store'), $payload);
        $response->assertRedirect();

        $division = RecruitmentDivision::where('title', 'Divisi Multimedia & Desain Grafis')->first();
        $this->assertNotNull($division);
        $this->assertCount(2, $division->custom_questions);
        $this->assertEquals('dropdown', $division->custom_questions[0]['type']);
        $this->assertEquals('Adobe Photoshop, Adobe Illustrator, CorelDraw, Canva', $division->custom_questions[0]['options']);
        $this->assertEquals('checkbox', $division->custom_questions[1]['type']);
        $this->assertCount(2, $division->sop_commitments);
        $this->assertStringContainsString('bebas royalti', $division->sop_commitments[0]['text']);
    }

    public function test_warga_cannot_access_admin_recruitment_endpoints(): void
    {
        $warga = User::factory()->warga()->create();

        $this->actingAs($warga)->get(route('admin.recruitment.index'))->assertStatus(403);
        $this->actingAs($warga)->post(route('admin.recruitment.divisions.store'), [])->assertStatus(403);
        $this->actingAs($warga)->post(route('admin.recruitment.settings.update'), [])->assertStatus(403);
    }
}
