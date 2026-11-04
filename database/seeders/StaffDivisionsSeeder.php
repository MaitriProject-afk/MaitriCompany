<?php

namespace Database\Seeders;

use App\Models\RecruitmentDivision;
use Illuminate\Database\Seeder;

class StaffDivisionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            [
                'code' => 'marketing',
                'title' => 'Divisi Marketing',
                'department' => 'Pemasaran & Publikasi Bisnis',
                'icon' => 'campaign',
                'description' => 'Mengelola kampanye periklanan, publikasi event, penjangkauan relasi bisnis korporat, dan branding komersial Maitri Company di San Andreas.',
                'qualifications' => [
                    'Komunikatif dan memiliki wawasan publikasi promosi',
                    'Mampu merancang konsep penawaran kerjasama & iklan',
                    'Aktif dalam interaksi sosial dan relasi publik',
                ],
                'is_active' => true,
                'quota' => 5,
                'badge' => 'Divisi Aktif',
                'sort_order' => 1,
            ],
            [
                'code' => 'automotive',
                'title' => 'Divisi Automotive',
                'department' => 'Workshop & Pemeliharaan Armada',
                'icon' => 'build',
                'description' => 'Bertanggung jawab atas perawatan mesin, inspeksi kondisi bodi 2000 HP, manajemen suku cadang, dan kalibrasi unit operasional di garasi HQ.',
                'qualifications' => [
                    'Menguasai mekanikal kendaraan dan perawatan armada niaga',
                    'Disiplin dalam pengisian checklist inspeksi kelayakan jalan',
                    'Siap siaga dalam penanganan servis berkala unit',
                ],
                'is_active' => true,
                'quota' => 6,
                'badge' => 'Divisi Aktif',
                'sort_order' => 2,
            ],
            [
                'code' => 'rental',
                'title' => 'Divisi Rental',
                'department' => 'Layanan & Dispatcher Sewa Armada',
                'icon' => 'key',
                'description' => 'Melayani serah terima armada sewa warga, validasi berkas identitas & MoU, monitoring durasi peminjaman, dan inspeksi pengembalian unit.',
                'qualifications' => [
                    'Teliti dalam administrasi berkas penyewaan warga',
                    'Mampu mengoperasikan sistem pencatatan kontrak & penerbitan invoice',
                    'Tegas dalam menjalankan aturan denda lecet dan keterlambatan',
                ],
                'is_active' => true,
                'quota' => 5,
                'badge' => 'Divisi Aktif',
                'sort_order' => 3,
            ],
            [
                'code' => 'daily_globe',
                'title' => 'Divisi Daily Globe',
                'department' => 'Jurnalistik & Kantor Berita Pers',
                'icon' => 'newspaper',
                'description' => 'Meliput berita terkini kota San Andreas, investigasi lapangan, penerbitan buletin pers harian, dan penyusunan press release resmi perusahaan.',
                'qualifications' => [
                    'Keterampilan menulis artikel berita jurnalistik yang tajam & objektif',
                    'Mampu melakukan liputan lapangan dan wawancara narasumber',
                    'Memiliki etika pers yang tinggi dan integritas pemberitaan',
                ],
                'is_active' => true,
                'quota' => 4,
                'badge' => 'Divisi Aktif',
                'sort_order' => 4,
            ],
        ];

        foreach ($divisions as $div) {
            RecruitmentDivision::updateOrCreate(
                ['code' => $div['code']],
                $div
            );
        }
    }
}
