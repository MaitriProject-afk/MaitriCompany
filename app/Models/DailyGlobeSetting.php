<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'edition_date',
    'edition_meta',
    'breaking_news',
    'weather_report',
    'market_index',
    'community_channels',
    'categories',
])]
class DailyGlobeSetting extends Model
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
            'edition_meta' => 'array',
            'breaking_news' => 'array',
            'weather_report' => 'array',
            'market_index' => 'array',
            'community_channels' => 'array',
            'categories' => 'array',
        ];
    }

    /**
     * Default categories for The Daily Globes.
     *
     * @return array<int, array<string, string>>
     */
    public static function defaultCategories(): array
    {
        return [
            ['id' => 'all', 'name' => 'Home / Beranda', 'icon' => 'home'],
            ['id' => 'investigasi', 'name' => 'Investigasi Khusus', 'icon' => 'policy'],
            ['id' => 'kriminal', 'name' => 'Kriminal & Hukum', 'icon' => 'local_police'],
            ['id' => 'otomotif', 'name' => 'Otomotif & Bisnis', 'icon' => 'tune'],
            ['id' => 'pedesaan', 'name' => 'Pedesaan (Flint & Bone)', 'icon' => 'forest'],
            ['id' => 'opini', 'name' => 'Opini & Warga', 'icon' => 'record_voice_over'],
            ['id' => 'edisi-cetak', 'name' => 'Edisi Cetak', 'icon' => 'menu_book'],
        ];
    }

    /**
     * Default breaking news headlines ticker.
     *
     * @return array<int, string>
     */
    public static function defaultBreakingNews(): array
    {
        return [
            '[FLINT CO.] Suara letusan knalpot dan dentuman mesin berat dilaporkan tak kunjung henti di perbatasan jembatan tol selatan. Warga minta ketegasan SAPD.',
            '[LSPD CODE 3] Baku tembak terjadi di Commerce • Kantong persidangan Balai Kota dibatalkan.',
            '[SAN FIERRO] Kabut tebal selimuti jembatan Fallow Bridge; jarak pandang pengemudi kargo terbatas 5 meter.',
            '[RED COUNTY] Lonjakan transaksi properti gudang tua picu spekulasi investigasi pencucian uang.',
            '[RODEO] Toko perhiasan Rodeo dibobol komplotan bersenjata otomatis; kerugian diperkirakan capai jutaan dollar.',
        ];
    }

    /**
     * Default weather forecast across major San Andreas districts.
     *
     * @return array<int, array<string, string>>
     */
    public static function defaultWeatherReport(): array
    {
        return [
            ['city' => 'Los Santos', 'temp' => '24°C', 'condition' => 'Cerah Berawan', 'icon' => 'sunny'],
            ['city' => 'Flint County', 'temp' => '18°C', 'condition' => 'Berkabut Tebal', 'icon' => 'foggy'],
            ['city' => 'San Fierro', 'temp' => '20°C', 'condition' => 'Lembap Berangin', 'icon' => 'cloud'],
            ['city' => 'Las Venturas', 'temp' => '33°C', 'condition' => 'Terik Kering', 'icon' => 'sunny'],
            ['city' => 'Red County', 'temp' => '22°C', 'condition' => 'Gerimis Hutan', 'icon' => 'grain'],
        ];
    }

    /**
     * Default commodity & freight hauling market index.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function defaultMarketIndex(): array
    {
        return [
            ['name' => 'Freight Index LS-LV', 'value' => '$480/trip', 'change' => '+3.4%', 'up' => true],
            ['name' => 'Solar Industri', 'value' => '$1.25/L', 'change' => '-0.8%', 'up' => false],
            ['name' => 'Kayu Palomino', 'value' => '$320/ton', 'change' => '+2.1%', 'up' => true],
            ['name' => 'Logistik Petikemas', 'value' => '$890/boks', 'change' => '+1.5%', 'up' => true],
            ['name' => 'Besi Baja Bayside', 'value' => '$640/ton', 'change' => '0.0%', 'up' => true],
        ];
    }

    /**
     * Default edition metadata.
     *
     * @return array<string, string>
     */
    public static function defaultEditionMeta(): array
    {
        return [
            'volume' => 'Vol. XLVIII No. 1,204',
            'circulation' => 'San Andreas Statewide Distribution',
            'issn' => 'ISSN 2407-8911',
            'publisher' => 'PT Daily Globe Media Nusantara / San Andreas Publishing Corp.',
        ];
    }

    /**
     * Default community channels.
     *
     * @return array<string, string>
     */
    public static function defaultCommunityChannels(): array
    {
        return [
            'discord' => 'https://discord.gg/QKfsxuKzU5',
            'central' => 'https://bit.ly/TheDailyGlobesCentral',
            'tipLine' => 'redaksi@dailyglobe.sa',
        ];
    }

    /**
     * Get or create the singleton Daily Globe setting record.
     */
    public static function current(): self
    {
        $setting = static::firstOrCreate([], [
            'edition_date' => 'Selasa, 13 Oktober 2026',
            'edition_meta' => static::defaultEditionMeta(),
            'breaking_news' => static::defaultBreakingNews(),
            'weather_report' => static::defaultWeatherReport(),
            'market_index' => static::defaultMarketIndex(),
            'community_channels' => static::defaultCommunityChannels(),
            'categories' => static::defaultCategories(),
        ]);

        return $setting;
    }
}
