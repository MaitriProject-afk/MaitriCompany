<?php

namespace Database\Seeders;

use App\Models\RecruitmentDivision;
use Illuminate\Database\Seeder;

class RecruitmentDivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            [
                'title' => 'Driver / Supir Armada Hauling',
                'department' => 'Divisi Logistik & Armada Niaga',
                'icon' => 'local_shipping',
                'description' => 'Mengoperasikan armada truk niaga (Roadtrain, Linerunner, Flatbed) untuk rute hauling dan ekspedisi muatan kargo di seluruh wilayah San Andreas.',
                'qualifications' => [
                    'Memiliki Driving License (SIM Mengemudi) yang masih aktif',
                    'Memiliki Heavy / Trucker License resmi San Andreas',
                    'Mampu mengemudikan truk berat dengan aman dan bertanggung jawab',
                    'Paham rute hauling dan titik bongkar muat kargo',
                    'Tidak memiliki riwayat kriminal berat / buronan polisi (Clean Record)',
                ],
                'is_active' => true,
                'quota' => 10,
                'badge' => 'Prioritas Tinggi',
                'sort_order' => 1,
            ],
            [
                'title' => 'Teknisi & Montir Workshop Garasi',
                'department' => 'Divisi Workshop & Pemeliharaan',
                'icon' => 'build',
                'description' => 'Melakukan inspeksi kesehatan kendaraan standar prima 2000 HP, kalibrasi mesin, perbaikan bodi, dan servis berkala di Workshop HQ Verona Beach.',
                'qualifications' => [
                    'Menguasai mekanik otomotif dan perawatan mesin truk niaga',
                    'Mampu melakukan inspeksi kondisi fisik bodi dan kelistrikan kendaraan',
                    'Siap standby di garasi workshop Maitri HQ Verona Beach',
                    'Disiplin dalam mencatat riwayat perbaikan dan suku cadang',
                ],
                'is_active' => true,
                'quota' => 4,
                'badge' => 'Dibutuhkan Segera',
                'sort_order' => 2,
            ],
            [
                'title' => 'Staff Dispatcher & Administrasi Sewa',
                'department' => 'Divisi Layanan & Operasional',
                'icon' => 'assignment',
                'description' => 'Mengelola meja resepsionis sewa, validasi KTP warga, serah terima kunci armada, pencatatan MoU fisik, dan validasi pengembalian unit.',
                'qualifications' => [
                    'Komunikatif, ramah, dan teliti dalam administrasi berkas warga',
                    'Mampu mengoperasikan sistem pencatatan kontrak MoU & invoice',
                    'Tegas dan adil dalam menerapkan aturan denda lecet/keterlambatan',
                    'Bersedia standby di kantor operasional Verona Beach',
                ],
                'is_active' => true,
                'quota' => 3,
                'badge' => 'Tersedia 3 Kuota',
                'sort_order' => 3,
            ],
            [
                'title' => '3D Visualizer & Drafter Studio Interior',
                'department' => 'Divisi Studio Desain & Arsitektur',
                'icon' => 'architecture',
                'description' => 'Merancang konsep tata ruang properti hunian/komersial warga serta memproduksi livery stiker kustomisasi truk niaga Maitri Company.',
                'qualifications' => [
                    'Kreatif dalam visualisasi 3D rendering dan desain tata ruang',
                    'Mampu merancang konsep livery / branding stiker truk komersial',
                    'Memiliki portofolio karya arsitektur atau interior sebelumnya',
                ],
                'is_active' => true,
                'quota' => 2,
                'badge' => 'Portofolio Diutamakan',
                'sort_order' => 4,
            ],
            [
                'title' => 'Staff Kasir & Keuangan',
                'department' => 'Divisi Keuangan & Governance',
                'icon' => 'receipt_long',
                'description' => 'Pencatatan kas masuk operasional, penerbitan invoice resmi sewa, verifikasi pembayaran denda telat/montir, dan rekonsiliasi kas harian.',
                'qualifications' => [
                    'Teliti dalam hitungan, pencatatan kas, dan buku besar transaksi',
                    'Jujur, amanah, dan berintegritas tinggi dalam mengelola dana perusahaan',
                    'Mampu membuat laporan rekap kas harian dan mingguan',
                ],
                'is_active' => true,
                'quota' => 2,
                'badge' => 'Tersedia',
                'sort_order' => 5,
            ],
        ];

        foreach ($divisions as $div) {
            RecruitmentDivision::updateOrCreate(
                ['title' => $div['title']],
                $div
            );
        }
    }
}
