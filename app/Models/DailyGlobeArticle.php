<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

#[Fillable([
    'title',
    'short_title',
    'slug',
    'subtitle',
    'excerpt',
    'content',
    'content_blocks',
    'layout_settings',
    'category',
    'category_label',
    'badge',
    'location',
    'author',
    'author_role',
    'published_date',
    'published_time',
    'read_time',
    'views_count',
    'image',
    'image_caption',
    'secondary_image',
    'secondary_caption',
    'quote',
    'quote_author',
    'metrics',
    'is_featured',
    'is_published',
    'sort_order',
])]
class DailyGlobeArticle extends Model
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
            'content_blocks' => 'array',
            'layout_settings' => 'array',
            'metrics' => 'array',
            'views_count' => 'integer',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Comments submitted by citizens on this article.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(DailyGlobeComment::class, 'daily_globe_article_id')->latest();
    }

    /**
     * Default layout settings for an article.
     *
     * @return array<string, mixed>
     */
    public static function defaultLayoutSettings(): array
    {
        return [
            'drop_cap' => true,
            'columns' => 1, // 1 = single column standard, 2 = two-column newspaper flow
            'text_align' => 'left', // 'left' | 'justify'
            'font_style' => 'editorial_sans', // 'editorial_sans' | 'classic_serif'
            'header_style' => 'standard', // 'standard' | 'centered' | 'noir_dossier'
            'image_filter' => 'none', // 'none' | 'grayscale' | 'high_contrast'
            'show_authority_box' => false,
            'authority_badge' => 'MAKLUMAT OTORITAS & REDAKSI',
            'authority_title' => '',
            'authority_body' => '',
            'enable_comments' => true,
        ];
    }

    /**
     * Format the model for frontend consumption matching the DailyGlobe UI structure.
     *
     * @return array<string, mixed>
     */
    public function toFrontendArray(bool $includeComments = false): array
    {
        $layout = array_merge(static::defaultLayoutSettings(), $this->layout_settings ?? []);

        $commentsList = [];
        $commentsCount = 0;

        if (Schema::hasTable('daily_globe_comments')) {
            $commentsCount = $this->relationLoaded('comments')
                ? $this->comments->count()
                : ($this->comments_count ?? $this->comments()->count());

            if ($includeComments) {
                $commentsList = ($this->relationLoaded('comments') ? $this->comments : $this->comments()->get())
                    ->map(fn (DailyGlobeComment $c) => $c->toFrontendArray())
                    ->values()
                    ->all();
            }
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'shortTitle' => $this->short_title ?: $this->title,
            'subtitle' => $this->subtitle,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'contentBlocks' => $this->content_blocks ?? [],
            'layoutSettings' => $layout,
            'category' => $this->category,
            'categoryLabel' => $this->category_label,
            'badge' => $this->badge,
            'location' => $this->location,
            'author' => $this->author,
            'authorRole' => $this->author_role,
            'date' => $this->published_date ?: ($this->created_at ? $this->created_at->format('d F Y') : '24 Oktober 2026'),
            'time' => $this->published_time ?: '22:15 SAST',
            'readTime' => $this->read_time ?: '4 Menit Baca',
            'views' => number_format((int) $this->views_count),
            'viewsCount' => (int) $this->views_count,
            'image' => $this->image,
            'imageCaption' => $this->image_caption,
            'secondaryImage' => $this->secondary_image,
            'secondaryCaption' => $this->secondary_caption,
            'quote' => $this->quote,
            'quoteAuthor' => $this->quote_author,
            'metrics' => $this->metrics ?? [],
            'featured' => (bool) $this->is_featured,
            'isPublished' => (bool) $this->is_published,
            'sortOrder' => (int) $this->sort_order,
            'commentsCount' => $commentsCount,
            'comments' => $commentsList,
        ];
    }

    /**
     * Ensure default articles exist in the database if table is empty.
     */
    public static function ensureDefaultArticlesExist(): void
    {
        if (static::count() > 0) {
            static::syncLegacyDefaults();

            return;
        }

        foreach (static::defaultSeedArticles() as $index => $item) {
            $layout = static::defaultLayoutSettings();
            if ($index === 0) {
                $layout['show_authority_box'] = true;
                $layout['authority_badge'] = 'PERNYATAAN OTORITAS KEAMANAN';
                $layout['authority_title'] = 'Patroli Wilayah Flint County Diperketat Mulai Akhir Pekan';
                $layout['authority_body'] = 'Menanggapi laporan eksklusif ini, perwakilan divisi patroli jalan raya San Andreas State Police mengonfirmasi bahwa pihaknya tengah mengkaji penambahan pos pemeriksaan knalpot brong dan verifikasi nomor rangka mesin di koridor barat daya. Warga sipil diimbau tetap melapor bila menjumpai konvoi ilegal mencurigakan di malam hari.';
            }

            $created = static::create([
                'title' => $item['title'],
                'short_title' => $item['shortTitle'] ?? null,
                'slug' => $item['slug'] ?? Str::slug($item['title']),
                'subtitle' => $item['subtitle'] ?? null,
                'excerpt' => $item['excerpt'],
                'content' => $item['content'] ?? $item['excerpt'],
                'content_blocks' => $item['contentBlocks'] ?? static::convertPlainTextToBlocks($item['content'] ?? $item['excerpt'], $item),
                'layout_settings' => $item['layoutSettings'] ?? $layout,
                'category' => $item['category'] ?? 'investigasi',
                'category_label' => $item['categoryLabel'] ?? 'Investigasi Khusus',
                'badge' => $item['badge'] ?? 'Liputan Khusus',
                'location' => $item['location'] ?? 'San Andreas',
                'author' => $item['author'] ?? 'Redaksi The Daily Globes',
                'author_role' => $item['authorRole'] ?? 'Jurnalis Investigasi',
                'published_date' => $item['date'] ?? '24 Oktober 2026',
                'published_time' => $item['time'] ?? '20:00 SAST',
                'read_time' => $item['readTime'] ?? '4 Menit Baca',
                'views_count' => (int) str_replace(',', '', (string) ($item['views'] ?? 1500)),
                'image' => $item['image'] ?? null,
                'image_caption' => $item['imageCaption'] ?? null,
                'secondary_image' => $item['secondaryImage'] ?? null,
                'secondary_caption' => $item['secondaryCaption'] ?? null,
                'quote' => $item['quote'] ?? null,
                'quote_author' => $item['quoteAuthor'] ?? null,
                'metrics' => $item['metrics'] ?? [],
                'is_featured' => (bool) ($item['featured'] ?? ($index === 0)),
                'is_published' => true,
                'sort_order' => $index + 1,
            ]);

            if ($index === 0 && Schema::hasTable('daily_globe_comments')) {
                $created->comments()->createMany(static::defaultFlintComments());
            }
        }
    }

    /**
     * Clean up legacy static authority box defaults on non-Flint articles and ensure initial comments exist.
     */
    public static function syncLegacyDefaults(): void
    {
        if (! Schema::hasTable('daily_globe_comments')) {
            return;
        }

        $flintSlug = 'misteri-bengkel-flint-county-24-jam-tanpa-henti-dan-antrean-kendaraan-tak-lazim';
        $flintArticle = static::where('slug', $flintSlug)->first();

        if ($flintArticle && DailyGlobeComment::count() === 0) {
            $flintArticle->comments()->createMany(static::defaultFlintComments());
        }

        $otherArticles = static::where('slug', '!=', $flintSlug)->get();
        foreach ($otherArticles as $article) {
            $ls = $article->layout_settings ?? [];
            $dirty = false;

            if (($ls['authority_title'] ?? '') === 'Patroli Wilayah Flint County Diperketat Mulai Akhir Pekan') {
                $ls['show_authority_box'] = false;
                $ls['authority_title'] = '';
                $ls['authority_body'] = '';
                $dirty = true;
            }

            $metrics = $article->metrics ?? [];
            if (count($metrics) === 1 && ($metrics[0]['label'] ?? '') === 'Estimasi Trafik' && ($metrics[0]['value'] ?? '') === '48+') {
                $metrics = [];
                $dirty = true;
            }

            if ($dirty) {
                $article->update([
                    'layout_settings' => $ls,
                    'metrics' => $metrics,
                ]);
            }
        }
    }

    /**
     * Default IC comments for the Flint County investigation article.
     *
     * @return array<int, array<string, string>>
     */
    public static function defaultFlintComments(): array
    {
        return [
            [
                'author' => 'Frank_Castiglione',
                'region' => 'Angel Pine, Flint County',
                'role_badge' => 'Warga & Pengemudi Truk',
                'text' => 'Jangan dibocorkan semua min! Itu bengkel langganan trucker pas alternator jebol tengah malam di hutan. Kalau polisi ngetem di sana, repot kita yang nyari nafkah legal.',
                'published_time' => '18:32 SAST',
            ],
            [
                'author' => 'Sergeant_Mendoza',
                'region' => 'LSPD Traffic Div',
                'role_badge' => 'Aparat SAPD',
                'text' => 'Unit kami sudah mencatat koordinat bengkel terkait. Setiap modifikasi mesin yang melanggar baku emisi dan batas desibel San Andreas Code akan ditindak tegas di checkpoint berikutnya.',
                'published_time' => '19:10 SAST',
            ],
            [
                'author' => 'Speedy_Clover',
                'region' => 'Doherty, San Fierro',
                'role_badge' => 'Komunitas Otomotif',
                'text' => 'Pelayanan bodi 12 menit itu nyata bukan mitos. Kemarin mobil gue penyok abis nyenggol pagar ladang gandum, kelar dalam sebatang rokok. Mantap rekomen!',
                'published_time' => '20:45 SAST',
            ],
        ];
    }

    /**
     * Convert legacy plain text content into structured paragraph blocks.
     *
     * @param  array<string, mixed>  $item
     * @return array<int, array<string, mixed>>
     */
    public static function convertPlainTextToBlocks(string $text, array $item = []): array
    {
        $paragraphs = array_values(array_filter(array_map('trim', explode("\n\n", $text))));
        $blocks = [];

        foreach ($paragraphs as $idx => $para) {
            if (str_starts_with($para, 'BAB ') || (str_contains($para, '—') && strlen($para) < 90)) {
                $blocks[] = [
                    'id' => 'blk_'.($idx + 1),
                    'type' => 'heading',
                    'text' => $para,
                    'align' => 'left',
                ];
            } else {
                $blocks[] = [
                    'id' => 'blk_'.($idx + 1),
                    'type' => 'paragraph',
                    'text' => $para,
                    'dropCap' => $idx === 0,
                    'columns' => 1,
                    'align' => 'left',
                    'highlight' => false,
                ];
            }
        }

        if (! empty($item['quote'])) {
            $blocks[] = [
                'id' => 'blk_quote',
                'type' => 'quote',
                'text' => $item['quote'],
                'author' => $item['quoteAuthor'] ?? 'Narasumber Lapangan',
            ];
        }

        if (! empty($item['secondaryImage'])) {
            $blocks[] = [
                'id' => 'blk_img_sec',
                'type' => 'image',
                'url' => $item['secondaryImage'],
                'caption' => $item['secondaryCaption'] ?? 'Bukti dokumentasi sekunder di lokasi.',
                'badge' => 'BUKTI INV-02',
            ];
        }

        return $blocks;
    }

    /**
     * Default seed articles catalog.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function defaultSeedArticles(): array
    {
        return [
            [
                'slug' => 'misteri-bengkel-flint-county-24-jam-tanpa-henti-dan-antrean-kendaraan-tak-lazim',
                'title' => 'Workshop Pedesaan Ini Tak Pernah Sepi, Ini Alasannya: Dari Modifikasi Rahasia Hingga Pelayanan Cepat 24 Jam',
                'shortTitle' => 'Misteri Bengkel Flint County: 24 Jam Tanpa Henti dan Antrean Kendaraan Tak Lazim',
                'subtitle' => '“WORKSHOP PEDESAAN INI TAK PERNAH SEPI, INI ALASANNYA.”',
                'excerpt' => 'Menembus dinginnya kabut malam Flint Range, bengkel terpencil beratap seng dengan siluet mural jembatan merah ini menjadi titik kumpul para pengemudi dan pelarian malam San Andreas...',
                'content' => "FLINT COUNTY — Di sebuah belokan tajam yang menghubungkan dataran sunyi Flint County dengan akses lingkar San Fierro, kepulan asap knalpot dan deru mesin silinder ganda terdengar memecah keheningan rimba pinus. Bangunan beratap seng dengan struktur logam abu-abu kusam ini bukanlah bengkel resmi berlisensi merk kota besar, namun namanya menggema di kalangan pengemudi malam, kurir kargo lintas batas, hingga para pembalap jalanan bawah tanah.\n\nFenomena tingginya antrean kendaraan di garasi ini menarik perhatian investigasi The Daily Globes. Mengapa bengkel yang terletak berkilo-kilometer dari gemerlap neon Los Santos dan kasino Las Venturas ini hampir tidak pernah sepi, bahkan saat jarum jam menunjuk angka 03:00 dini hari?\n\nBAB I — ETOS BAWAH TANAH: KERAHASIAAN & KEAHLIAN\n\nTidak ada ruang tunggu mewah berpendingin udara. Yang ada hanyalah sebuah mesin pendingin minuman kaleng kusam di bibir pintu dan mesin ATM sewaan di pojok trotoar. Namun yang ditawarkan bengkel ini jauh melampaui fasilitas konvensional: kerahasiaan penuh dan keterampilan membongkar mesin blok V8 yang sulit ditandingi teknisi kota.\n\n\"Di sini kita nggak banyak tanya siapa kamu atau dari mana mobil ini berasal. Yang penting mesin dingin, bodi mulus kembali ke jalan, dan bayaran beres di muka tanpa nota birokrasi berbelit,\" tutur seorang mekanik senior yang mengenakan kaos abu-abu lusuh penuh noda oli saat ditemui tim Globes pada pergantian shift dini hari.\n\nBAB II — GEOGRAFIS CELAH HUKUM & YURISDIKSI ABU-ABU\n\nSecara yurisdiksi, bengkel ini berdiri persis pada garis abu-abu demarkasi patroli antara Los Santos Police Department (LSPD) dan San Fierro Sheriff Department (SFSD). Laporan patroli lintas instansi sering kali berujung pada saling lempar tanggung jawab penertiban ketika sebuah mobil sedan sport tanpa plat terdeteksi memasuki garasi perbaikan.\n\nSemua transaksi modifikasi dan suku cadang diselesaikan secara tunai melalui unit ATM mandiri yang terpasang di pelataran depan tanpa faktur bank terlacak.\n\n\"Kami memantau peningkatan pergerakan kendaraan berkecepatan tinggi sepanjang jalur Flint Range. Operasi gabungan razia kelayakan teknis dan registrasi fisik kendaraan akan digencarkan mulai akhir pekan ini,\" tegas Letnan H. Vance dari Divisi Keamanan Jalur Tol Pedesaan.",
                'category' => 'investigasi',
                'categoryLabel' => 'Investigasi Khusus',
                'badge' => 'Liputan Khusus',
                'location' => 'Flint County Route 89',
                'author' => 'Raymond "Gull" Vance',
                'authorRole' => 'Kepala Biro Flint County',
                'date' => '24 Oktober 2026',
                'time' => '22:15 SAST',
                'readTime' => '4 Menit Baca',
                'views' => '6,412',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkofH48K2G4fhjENzwyuIHsEDRB6UjpHLMJZFrKPiGgcgas4g9p_yJiO8kPxaOo5apgF35_uADv0ceyb6nc-rEZ2p1LDAcyElaNsIYvX2RVHqsgRyd7JTnGjpcylhDrszisiCfyNnJlOUI082vsQ6RH4Fgp3HfqgkcUooyMLjcuBpPi1uj8cwW_ODP4_qV3TiFdVn2R_dPciL9qsbU41eNH8wyaIwmmuatPRtmGyZ28ZX6kCLCfIQ53w',
                'imageCaption' => 'DOKUMENTASI EKSKLUSIF: Tampak muka bengkel Flint County kala senja dengan plang iklan lecet HUGE SALE dan OPEN 7 DAYS TIL MIDNIGHT.',
                'secondaryImage' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLFJyV-HJSrz10xpzPswk_oqzMfzTVjpu7cI8Tq4A-dqgm2Q5ry7JQ9SSHNqycSxvbYglBKwp9bhX2OyQ5NWrKOlB8Pf_QeMiFd5w8CDFl83eqkLEcoUY-_6L67ckAuxM6xskvW3yw60JIj0OY8HWG8aMqXpNWAZd_LOXrbYyCtawbm4aXrr42nBOwe4WxpC8dOYwuMsnUGXFUTdIiGmAzGrBKxOiowEdSBg8xfXCBwH9xYCtYmUf5Hg',
                'secondaryCaption' => 'Unit ATM mandiri terpasang tepat di gerbang bengkel. Semua transaksi modifikasi dan suku cadang diselesaikan secara tunai tanpa faktur bank terlacak.',
                'quote' => 'Di sini kita nggak banyak tanya siapa kamu atau dari mana mobil ini berasal. Yang penting mesin dingin, bodi mulus kembali ke jalan, dan bayaran beres di muka tanpa nota birokrasi berbelit.',
                'quoteAuthor' => 'Mekanik Senior (Anonim), Kaos Abu-Abu Flint Workshop',
                'metrics' => [
                    ['label' => 'Estimasi Trafik', 'value' => '48+', 'desc' => 'Unit armada per 24 jam rotasi kerja.'],
                    ['label' => 'Respon Servis', 'value' => '~12m', 'desc' => 'Pengerjaan bodi & kalibrasi kilat.'],
                    ['label' => 'Kepuasan Pengemudi', 'value' => '99.4%', 'desc' => 'Tingkat kepuasan sopir malam.'],
                ],
                'featured' => true,
            ],
            [
                'slug' => 'operasi-terpadu-lintas-palomino-aparat-tertibkan-jalur-ekspedisi-liar',
                'title' => 'Operasi Terpadu Lintas Palomino: Aparat Tertibkan Ekspedisi Liar dan Amankan Ratusan Ton Muatan Ilegal',
                'subtitle' => 'Penyelidikan berbulan-bulan mengungkap jaringan pengiriman muatan tanpa izin uji KIR dan manipulasi dokumen manifesto jalan.',
                'excerpt' => 'Aparat gabungan menggelar razia besar-besaran di perbatasan Red County dan Las Venturas, menyasar konvoi logistik berisiko tinggi tanpa kelengkapan berkas resmi.',
                'content' => "PALOMINO CREEK — Dalam operasi fajar terkoordinasi paling masif sepanjang tahun ini, Satuan Patroli Jalan Raya bersama Dinas Transportasi San Andreas berhasil menyekat 18 armada truk pengangkut muatan berat yang terbukti beroperasi tanpa sertifikasi keselamatan laik jalan (KIR).\n\nOperasi yang dipusatkan di tikungan strategis Jembatan Hanky Panky Palomino tersebut membongkar pola penyelundupan kargo bernilai miliaran dolar yang diduga menghindari pos timbang resmi di Bone County.\n\n\"Kami tidak memberikan toleransi bagi perusahaan ekspedisi atau operator independen yang membahayakan pengguna jalan umum demi memangkas biaya operasional,\" tegas Inspektur Senior Raymond Vance kepada The Daily Globes di lokasi penyekatan.\n\nBerdasarkan investigasi lapangan, sebagian besar pengemudi mengaku ditekan oleh pihak vendor untuk membawa muatan melebihi batas tonase maksimum (ODOL - Over Dimension Over Load) hingga 65% dari kapasitas standar. Hal ini secara signifikan merusak infrastruktur aspal negara bagian dan memicu angka kecelakaan lalu lintas tertinggi pada ruas tol lintas distrik.\n\nSejumlah barang bukti dokumen manifes palsu, stempel dinas bodong, serta radio komunikasi tanpa izin frekuensi telah diamankan pihak kejaksaan untuk pengembangan kasus lebih lanjut.",
                'category' => 'investigasi',
                'categoryLabel' => 'Investigasi Khusus',
                'badge' => 'Headline Eksklusif',
                'location' => 'Palomino Creek, Red County',
                'author' => 'Alexander Hayes',
                'authorRole' => 'Kepala Desk Investigasi',
                'date' => '13 Oktober 2026',
                'time' => '06:15 SAST',
                'readTime' => '6 Menit Baca',
                'views' => '4,892',
                'image' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
                'imageCaption' => 'Barisan armada muatan berat disekat oleh otoritas gabungan di pos pemeriksaan Jembatan Palomino Creek saat fajar merekah.',
                'featured' => false,
            ],
            [
                'slug' => 'operasi-zebra-sapd-razia-balap-liar-montgomery',
                'title' => 'Operasi Zebra SAPD: Razia Balap Liar Montgomery Menyita 14 Sportscar',
                'subtitle' => 'Aksi kejar-kejaran berkecepatan tinggi pecah di jalur perbukitan Red County.',
                'excerpt' => 'Aksi kejar-kejaran berkecepatan tinggi berakhir di tikungan pom bensin lama Montgomery. Empat unit Sultan RS dan sepuluh kurir diamankan petugas gabungan.',
                'content' => "MONTGOMERY — Razia malam terkoordinasi oleh unit interceptor San Andreas Police Department berhasil melumpuhkan arena balap liar yang kerap memblokir persimpangan strategis Montgomery Hill.\n\nSebanyak 14 mobil sport modifikasi disita, beberapa di antaranya kedapatan menggunakan sistem NOS ilegal dan pemindai frekuensi radio polisi.",
                'category' => 'kriminal',
                'categoryLabel' => 'Kriminal & Hukum',
                'badge' => 'Kilas Hukum',
                'location' => 'Montgomery, Red County',
                'author' => 'Victor Cole',
                'authorRole' => 'Desk Kriminal SAPD',
                'date' => '24 Oktober 2026',
                'time' => '19:42 SAST',
                'readTime' => '3 Menit Baca',
                'views' => '3,120',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlSpy-yvIPbeUkNnWsTKIZ1D71jRsbbFQ8rZVGJatBRMPXaRMvLxuf7oxmjPzkSKJuFoBfpjMLA49q61DrFW67cDqSy8r8G_nlUmP-hv0Fl-A0qRGblFrwuZ0C_hD2mUbtLyHO1MnpJoVSMjPqn14CG1Vgz3kxAnbKJROIa1OEzIW0KuaYa2cKZoiKVMlykfrBsWoKYHQiwFgXH1AsP1WOYcDp3u3n-jygifBieFDHEkjuod_cT8r1sg',
                'imageCaption' => 'Petugas patroli SAPD memasang garis pengamanan di titik penyekatan Montgomery.',
                'featured' => false,
            ],
            [
                'slug' => 'pasar-properti-red-county-gudang-tua-diborong-investor-anonim',
                'title' => 'Pasar Properti Red County: Gudang Tua Diborong Investor Anonim',
                'subtitle' => 'Lonjakan transaksi properti terbengkalai memicu spekulasi pencucian uang sindikat kargo.',
                'excerpt' => 'Peralihan kepemilikan mendadak atas 6 petak pergudangan kayu memicu kecurigaan sindikat cuci uang antar-kota Los Santos dan San Fierro.',
                'content' => "RED COUNTY — Sedikitnya enam komplek pergudangan tua di pinggiran Blueberry dan Dillimore telah berpindah tangan dalam dua pekan terakhir melalui transaksi kas tunai tertutup.\n\nPemerhati tata kota mendesak otoritas pajak menyelidiki sumber dana yang dicurigai terkait dengan jaringan penyelundupan kargo bebas bea.",
                'category' => 'otomotif',
                'categoryLabel' => 'Otomotif & Bisnis',
                'badge' => 'Ekonomi Gelap',
                'location' => 'Blueberry, Red County',
                'author' => 'Clara Montgomery',
                'authorRole' => 'Editor Ekonomi & Bisnis',
                'date' => '24 Oktober 2026',
                'time' => '17:10 SAST',
                'readTime' => '4 Menit Baca',
                'views' => '2,890',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNc8YNxMwPwoZWOxtrVD-0wtNGJKCDs5lMLMhw_X8fkls_48BbXi0Jr6d4n6pX7RxC4dOQoZ2mX3BtUy7m-2fP81ZS1F5dFoMsD6FYj4-wwEUdjQrbl-nK7SwmKslQ9czLn0xEZOzJLjbk66AhbBn3oAQOW2K5wNJw4b2RxeApmxqrRU7_CQxH6ii8RSLDBXPgeWClortyfWPS3Y6xgzLNVDltwa-9bmiCoo_hQDAY9qAt65byiIJdBg',
                'imageCaption' => 'Deretan gudang kargo tua di Red County yang kini dijaga ketat oleh petugas keamanan swasta.',
                'featured' => false,
            ],
            [
                'slug' => 'kabut-tebal-selimuti-jembatan-fallow-bridge',
                'title' => 'Kabut Tebal Selimuti Jembatan Fallow Bridge: Jarak Pandang 5 Meter',
                'subtitle' => 'Polisi patroli pedesaan himbau konvoi truk muatan berat batasi kecepatan di bawah 30 km/jam.',
                'excerpt' => 'Kabut lembap yang turun dari pegunungan Whetstone menyelimuti lintasan Fallow Bridge, meningkatkan risiko kecelakaan bagi pengemudi tronton.',
                'content' => "FALLOW BRIDGE — Otoritas patroli jalan raya mengaktifkan sinyal peringatan bahaya di kedua sisi jembatan gantung Fallow Bridge akibat kabut tebal yang membatasi jarak pandang secara ekstrem.\n\nPengemudi disarankan menggunakan jalur alternatif melintasi Red County hingga kondisi atmosfer membaik pada siang hari.",
                'category' => 'pedesaan',
                'categoryLabel' => 'Pedesaan (Flint & Bone)',
                'badge' => 'Iklim & Trafik',
                'location' => 'Fallow Bridge, Flint Co.',
                'author' => 'Julian Drake',
                'authorRole' => 'Koresponden Cuaca & Jalur',
                'date' => '24 Oktober 2026',
                'time' => '14:05 SAST',
                'readTime' => '2 Menit Baca',
                'views' => '1,740',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXevhg9C4ik9fiw94fyDbafkqYqalWqNXnE4n7VIB7z6NS0w4Kk9iwqZqsXKWq7UAonr52MYWfFhHQU09-EFbp_DzmSlq5ucNdjh1CAk8appBjzIuHyBJ-yxCL7eO_fGlgP1dS7K7MrFS2YLF5nMHjE1V_EUG7YP0uubG2TjBbG5w9hzmqIVSQv41Di88HtKELVDvVeV_SWqzQvUOF9Fwntk_vFdIzTyVJ3sVLLV_gO0TyyVNDB_9BKA',
                'imageCaption' => 'Siluet kendaraan yang merayap menembus kabut pekat di atas bentang jembatan.',
                'featured' => false,
            ],
            [
                'slug' => 'toko-perhiasan-rodeo-dibobol-komplotan-bersenjata-otomatis',
                'title' => 'Toko Perhiasan Rodeo Dibobol Komplotan Bersenjata Otomatis',
                'subtitle' => 'Pelaku menerobos brankas utama dalam waktu kurang dari empat menit sebelum regu SWAT tiba.',
                'excerpt' => 'Komplotan bertopeng menerobos etalase perhiasan Rodeo Drive dengan senjata laras panjang dan melarikan diri menggunakan van hitam tanpa plat.',
                'content' => 'RODEO — Kawasan pertokoan mewah Rodeo Drive diguncang aksi perampokan bersenjata kilat dini hari tadi. Pelaku yang diperkirakan berjumlah empat orang berhasil menggasak berlian dan emas murni senilai $1.8 juta sebelum menghilang ke arah kanal Los Santos.',
                'category' => 'kriminal',
                'categoryLabel' => 'Kriminal & Hukum',
                'badge' => 'Kasus Aktif #882',
                'location' => 'Rodeo Drive, Los Santos',
                'author' => 'Victor Cole',
                'authorRole' => 'Desk Kriminal SAPD',
                'date' => '23 Oktober 2026',
                'time' => '23:10 SAST',
                'readTime' => '3 Menit Baca',
                'views' => '5,100',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFWYwbXEUhDyXc5AyaCQUwFy1g-3gx3IDREhwi28shcTcGkC45C-w7TBtvWJS_nS945kfhpSJVUzq4L9oIip0ckaKvZU6FlU9zFSapheTQ5xrY6F4aT5WyVhzEuebzgtd8eoFuBsAvaxQ-k9OtrOq0_l1dTBTAUzRabXtGIrsV4xBUEvLvVNipbnBCUSvOkuYnZi3CynKlObf5enUM_1q8Aj7fYR7FPZypZW4hszraOvQQPCphKLXwmQ',
                'imageCaption' => 'Garis polisi kuning membentang di depan etalase toko perhiasan Rodeo yang hancur.',
                'featured' => false,
            ],
            [
                'slug' => 'konvoi-20-chopper-gangster-melintasi-jembatan-san-fierro',
                'title' => 'Konvoi 20 Chopper Gangster Melintasi Jembatan San Fierro',
                'subtitle' => 'Warga resah atas provokasi knalpot blong dan pemblokiran simpang jalan raya.',
                'excerpt' => 'Puluhan motor chopper modifikasi melintas secara bergerombol di perbatasan San Fierro, memicu kenaikan status kesiagaan kepolisian pedesaan.',
                'content' => 'SAN FIERRO — Barisan motor besar tanpa plat nomor terlihat melaju kencang melintasi Garver Bridge menuju arah Angel Pine. Petugas Sheriff telah dikerahkan untuk memantau pergerakan konvoi.',
                'category' => 'kriminal',
                'categoryLabel' => 'Kriminal & Hukum',
                'badge' => 'Patroli Malam',
                'location' => 'Garver Bridge, San Fierro',
                'author' => 'A. Vance',
                'authorRole' => 'San Fierro Bureau',
                'date' => '22 Oktober 2026',
                'time' => '21:00 SAST',
                'readTime' => '3 Menit Baca',
                'views' => '3,800',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXevhg9C4ik9fiw94fyDbafkqYqalWqNXnE4n7VIB7z6NS0w4Kk9iwqZqsXKWq7UAonr52MYWfFhHQU09-EFbp_DzmSlq5ucNdjh1CAk8appBjzIuHyBJ-yxCL7eO_fGlgP1dS7K7MrFS2YLF5nMHjE1V_EUG7YP0uubG2TjBbG5w9hzmqIVSQv41Di88HtKELVDvVeV_SWqzQvUOF9Fwntk_vFdIzTyVJ3sVLLV_gO0TyyVNDB_9BKA',
                'imageCaption' => 'Konvoi kendaraan roda dua melintas di jalur sepi pedesaan di bawah penerangan minim.',
                'featured' => false,
            ],
            [
                'slug' => 'gudang-modifikasi-ilegal-di-las-colinas-digerebek-detektif',
                'title' => 'Gudang Modifikasi Ilegal di Las Colinas Digerebek Detektif',
                'subtitle' => 'Tabung nitrous terlarang dan perangkat pemalsu nomor rangka mesin (VIN) diamankan ke kantor forensik.',
                'excerpt' => 'Penggerebekan terhadap hangar tersembunyi di lereng bukit Las Colinas mengungkap sindikat pemalsuan identitas truk dan mobil curian.',
                'content' => 'LAS COLINAS — Unit forensik kendaraan bermotor mengamankan puluhan pelat nomor kosong, laser pembuat VIN palsu, dan empat belas mesin V8 hasil selundupan dari sebuah bengkel rahasia.',
                'category' => 'kriminal',
                'categoryLabel' => 'Kriminal & Hukum',
                'badge' => 'Evidensi Sitaan',
                'location' => 'Las Colinas, Los Santos',
                'author' => 'Victor Cole',
                'authorRole' => 'Desk Keamanan & Kriminal',
                'date' => '21 Oktober 2026',
                'time' => '16:30 SAST',
                'readTime' => '3 Menit Baca',
                'views' => '2,950',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL-rp6VeFsc2uwB1mfHHo3MlPOTQngopTQYKFrBIvgJqpoTxc6j_prkXEhYHRIzOpUJfcFxqOVuEg8oosSbdRbYxoav3UfXODpM7YB2nHk1xZKMVKHNgAMhffpux2qdDpdNvJm-jM37DCB3A5xHus4HEteDCKc5ofgOxVDoCcRZ1BbhQsE_-lbB6YfG5wDHvmcT-sTNeNKP3Zy8sQuPdCp95px20CKLKUY05xMo3BobsLReVvPWhLY-w',
                'imageCaption' => 'Komponen mesin performa tinggi dan tabung modifikasi yang disita penyidik kepolisian.',
                'featured' => false,
            ],
            [
                'slug' => 'merawat-pompa-hidrolik-lowrider-di-musim-panas-san-andreas',
                'title' => 'Merawat Pompa Hidrolik Lowrider di Musim Panas San Andreas',
                'subtitle' => 'Tekanan fluida dan keausan silinder kerap memicu korsleting kelistrikan baterai belakang.',
                'excerpt' => 'Panduan komprehensif dari teknisi spesialis suspensi untuk menjaga sistem pompa hidrolik tetap responsif dan aman dari bahaya korsleting kelistrikan.',
                'content' => 'LOS SANTOS — Suhu terik di musim panas San Andreas menuntut perawatan ekstra bagi para pecinta kultur lowrider. Cairan hidrolik yang mengalami degradasi viskositas dapat menyebabkan kerusakan permanen pada silinder pengangkat.',
                'category' => 'otomotif',
                'categoryLabel' => 'Otomotif & Bisnis',
                'badge' => 'Panduan Teknikal',
                'location' => 'Idlewood, Los Santos',
                'author' => 'Mekanik Senior Idlewood',
                'authorRole' => 'Spesialis Hidrolik & Suspensi',
                'date' => '20 Oktober 2026',
                'time' => '10:00 SAST',
                'readTime' => '4 Menit Baca',
                'views' => '3,600',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe9UZqiL-bC2uy3HKHxSWGM4SyXBweSlnh7vVTSY57w2-IheGHZ9aSO0tjdTjvjVn-55SR8C6imLdYcgVUGa5fNCGYXCoDzhHHR39U_dzv1C-Z1uQ1XzA1kd6qVfSwQogKSje3wCbOamJGkxbaV0K0-1S7U_G0iu1LLdxPx0scvATT_D3zSZEKQqCb21Sj5EK9qyGAWak24fQ9ekVY4JOYcGDrlpNmsh6omso8iUhHeWuD4sdhsQawzA',
                'imageCaption' => 'Pemeriksaan kompartemen hidrolik mobil kustom di garasi bengkel spesialis.',
                'featured' => false,
            ],
            [
                'slug' => 'aturan-emisi-knalpot-bebas-diberlakukan-di-kawasan-bisnis-market',
                'title' => 'Aturan Emisi Knalpot Bebas Diberlakukan di Kawasan Bisnis Market',
                'subtitle' => 'Denda tilang siap menanti kendaraan bertabung pipa langsung (straight pipe) tanpa muffler resmi.',
                'excerpt' => 'Balai pengujian kendaraan bermotor Los Santos mulai menerapkan sanksi tilang bagi kendaraan bermuffler bising di zona tertib perkantoran.',
                'content' => 'MARKET — Mulai pekan depan, aparat gabungan Dishub dan Kepolisian akan menempatkan alat pengukur desibel di beberapa titik lampu merah kawasan Market untuk menindak knalpot modifikasi bising.',
                'category' => 'otomotif',
                'categoryLabel' => 'Otomotif & Bisnis',
                'badge' => 'Regulasi Kota',
                'location' => 'Market, Los Santos',
                'author' => 'Biro Transportasi San Andreas',
                'authorRole' => 'Regulasi Emisi',
                'date' => '19 Oktober 2026',
                'time' => '13:00 SAST',
                'readTime' => '3 Menit Baca',
                'views' => '2,400',
                'image' => 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80',
                'imageCaption' => 'Pengujian tingkat kebisingan gas buang armada di gerbang kawasan Market.',
                'featured' => false,
            ],
            [
                'slug' => 'kolom-opini-merawat-martabat-dan-kesejahteraan-para-pengemudi-lintas-provinsi',
                'title' => 'Opini: Merawat Martabat dan Kesejahteraan Para Sopir Pengawal Rantai Pasok San Andreas',
                'subtitle' => 'Di balik ketersediaan bahan pangan segar di kota-kota besar, ada keringat pengemudi yang menempuh ribuan kilometer tanpa jaminan memadai.',
                'excerpt' => 'Sebuah refleksi tajam mengenai pentingnya rest area manusiawi, asuransi kesehatan wajib, dan etika penghargaan terhadap profesi pengemudi angkutan berat.',
                'content' => "OPINI WARGA — Jam dinding di pos istirahat perbatasan Angel Pine baru saja berdentang dua kali lewat tengah malam ketika suara desah rem angin truk tronton 30 ton memecah kesunyian kabut Gunung Chiliad.\n\nPengemudinya, seorang pria paruh baya yang telah mengabdi lebih dari dua dekade di aspal, turun meregangkan pinggangnya yang kaku. Sudah saatnya industri logistik modern menempatkan martabat manusia di atas sekadar kalkulasi margin keuntungan. Perlindungan jaminan kesehatan, transparansi honor per trip, dan fasilitas istirahat yang layak bukanlah kemewahan, melainkan hak asasi bagi mereka yang menjaga urat nadi kehidupan San Andreas tetap berdenyut.",
                'category' => 'opini',
                'categoryLabel' => 'Opini & Warga',
                'badge' => 'Editorial Pilihan',
                'location' => 'Angel Pine, Whetstone',
                'author' => 'Prof. Bramantyo Wicaksono',
                'authorRole' => 'Pemerhati Sosial & Logistik Publik',
                'date' => '18 Oktober 2026',
                'time' => '09:00 SAST',
                'readTime' => '5 Menit Baca',
                'views' => '2,510',
                'image' => 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80',
                'imageCaption' => 'Lampu sorot truk jarak jauh membelah kesunyian malam di jalur lintas hutan Whetstone.',
                'featured' => false,
            ],
        ];
    }
}
