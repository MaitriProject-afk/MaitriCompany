import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function PortalSettingsModal({ isOpen, onClose, settings = {} }) {
    const [activeTab, setActiveTab] = useState('edition'); // 'edition' | 'breaking' | 'weather' | 'market'

    const { data, setData, post, processing } = useForm({
        edition_date: settings.edition_date || 'Selasa, 13 Oktober 2026',
        edition_meta: {
            volume: settings.edition_meta?.volume || 'Vol. XLVIII No. 1,204',
            circulation: settings.edition_meta?.circulation || 'San Andreas Statewide Distribution',
            issn: settings.edition_meta?.issn || 'ISSN 2407-8911',
            publisher: settings.edition_meta?.publisher || 'PT Daily Globe Media Nusantara / San Andreas Publishing Corp.',
        },
        breaking_news: settings.breaking_news || [],
        weather_report: settings.weather_report || [],
        market_index: settings.market_index || [],
        community_channels: {
            discord: settings.community_channels?.discord || 'https://discord.gg/QKfsxuKzU5',
            central: settings.community_channels?.central || 'https://bit.ly/TheDailyGlobesCentral',
            tipLine: settings.community_channels?.tipLine || 'redaksi@dailyglobe.sa',
        },
        categories: settings.categories || [],
    });

    useEffect(() => {
        if (!isOpen) return;
        setData({
            edition_date: settings.edition_date || 'Selasa, 13 Oktober 2026',
            edition_meta: {
                volume: settings.edition_meta?.volume || 'Vol. XLVIII No. 1,204',
                circulation: settings.edition_meta?.circulation || 'San Andreas Statewide Distribution',
                issn: settings.edition_meta?.issn || 'ISSN 2407-8911',
                publisher: settings.edition_meta?.publisher || 'PT Daily Globe Media Nusantara / San Andreas Publishing Corp.',
            },
            breaking_news: settings.breaking_news || [],
            weather_report: settings.weather_report || [],
            market_index: settings.market_index || [],
            community_channels: {
                discord: settings.community_channels?.discord || 'https://discord.gg/QKfsxuKzU5',
                central: settings.community_channels?.central || 'https://bit.ly/TheDailyGlobesCentral',
                tipLine: settings.community_channels?.tipLine || 'redaksi@dailyglobe.sa',
            },
            categories: settings.categories || [],
        });
    }, [isOpen, settings]);

    if (!isOpen) return null;

    // Breaking News Helpers
    const addBreaking = () => setData('breaking_news', [...data.breaking_news, '']);
    const updateBreaking = (i, val) => {
        const arr = [...data.breaking_news];
        arr[i] = val;
        setData('breaking_news', arr);
    };
    const removeBreaking = (i) => setData('breaking_news', data.breaking_news.filter((_, idx) => idx !== i));

    // Weather Helpers
    const addWeather = () =>
        setData('weather_report', [...data.weather_report, { city: '', temp: '24°C', condition: 'Cerah', icon: 'sunny' }]);
    const updateWeather = (i, field, val) => {
        const arr = [...data.weather_report];
        arr[i] = { ...arr[i], [field]: val };
        setData('weather_report', arr);
    };
    const removeWeather = (i) => setData('weather_report', data.weather_report.filter((_, idx) => idx !== i));

    // Market Index Helpers
    const addMarket = () =>
        setData('market_index', [...data.market_index, { name: '', value: '$100', change: '+1.0%', up: true }]);
    const updateMarket = (i, field, val) => {
        const arr = [...data.market_index];
        arr[i] = { ...arr[i], [field]: val };
        setData('market_index', arr);
    };
    const removeMarket = (i) => setData('market_index', data.market_index.filter((_, idx) => idx !== i));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.daily-globe.settings.update'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[22px]">tune</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                                PENGATURAN PORTAL THE DAILY GLOBES
                            </span>
                            <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                                Konfigurasi Edisi Koran, Ticker Breaking News, Cuaca &amp; Bursa
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
                    {[
                        { id: 'edition', label: 'Edisi & Tautan Komunitas', icon: 'menu_book' },
                        { id: 'breaking', label: `Breaking News Ticker (${data.breaking_news.length})`, icon: 'campaign' },
                        { id: 'weather', label: `Cuaca Distrik (${data.weather_report.length})`, icon: 'partly_cloudy_day' },
                        { id: 'market', label: `Bursa Logistik (${data.market_index.length})`, icon: 'monitoring' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                                activeTab === t.id
                                    ? 'bg-white text-rose-600 border-rose-600 shadow-2xs'
                                    : 'text-slate-600 border-transparent hover:text-slate-900'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'edition' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Tanggal Edisi Koran (Masthead)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.edition_date}
                                        onChange={(e) => setData('edition_date', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nomor Volume Cetakan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.edition_meta.volume}
                                        onChange={(e) =>
                                            setData('edition_meta', { ...data.edition_meta, volume: e.target.value })
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nomor ISSN Pers
                                    </label>
                                    <input
                                        type="text"
                                        value={data.edition_meta.issn}
                                        onChange={(e) =>
                                            setData('edition_meta', { ...data.edition_meta, issn: e.target.value })
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Sirkulasi Distribusi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.edition_meta.circulation}
                                        onChange={(e) =>
                                            setData('edition_meta', { ...data.edition_meta, circulation: e.target.value })
                                        }
                                        className="w-full rounded-xl border-slate-300 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                <h3 className="text-xs font-extrabold uppercase text-slate-800">
                                    Saluran Komunitas Roleplay &amp; Pengaduan
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                            Link Discord Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.community_channels.discord}
                                            onChange={(e) =>
                                                setData('community_channels', {
                                                    ...data.community_channels,
                                                    discord: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border-slate-300 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                            Link Portal Pusat Arsip
                                        </label>
                                        <input
                                            type="text"
                                            value={data.community_channels.central}
                                            onChange={(e) =>
                                                setData('community_channels', {
                                                    ...data.community_channels,
                                                    central: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border-slate-300 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'breaking' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Daftar Headline Breaking News</h3>
                                    <p className="text-xs text-slate-500">
                                        Teks berjalan bergantian otomatis di pita paling atas halaman The Daily Globes
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addBreaking}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                                >
                                    + Tambah Breaking News
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {data.breaking_news.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateBreaking(idx, e.target.value)}
                                            placeholder="[LSPD CODE 3] Tulis kalimat breaking news..."
                                            className="flex-1 rounded-xl border-slate-300 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeBreaking(idx)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'weather' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Prakiraan Cuaca Distrik San Andreas</h3>
                                    <p className="text-xs text-slate-500">Ditampilkan pada pita informasi cuaca distrik</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addWeather}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                                >
                                    + Tambah Kota
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {data.weather_report.map((w, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="sm:col-span-4">
                                            <input
                                                type="text"
                                                value={w.city}
                                                onChange={(e) => updateWeather(idx, 'city', e.target.value)}
                                                placeholder="Nama Kota (Los Santos)"
                                                className="w-full rounded-lg border-slate-300 text-xs font-semibold"
                                            />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <input
                                                type="text"
                                                value={w.temp}
                                                onChange={(e) => updateWeather(idx, 'temp', e.target.value)}
                                                placeholder="Suhu (24°C)"
                                                className="w-full rounded-lg border-slate-300 text-xs"
                                            />
                                        </div>
                                        <div className="sm:col-span-4">
                                            <input
                                                type="text"
                                                value={w.condition}
                                                onChange={(e) => updateWeather(idx, 'condition', e.target.value)}
                                                placeholder="Kondisi (Cerah Berawan)"
                                                className="w-full rounded-lg border-slate-300 text-xs"
                                            />
                                        </div>
                                        <div className="sm:col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeWeather(idx)}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'market' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Bursa Komoditas &amp; Indeks Kargo (SAEX)</h3>
                                    <p className="text-xs text-slate-500">Ditampilkan di sidebar Bursa Komoditas &amp; Kargo</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addMarket}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                                >
                                    + Tambah Komoditas
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {data.market_index.map((m, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <div className="sm:col-span-4">
                                            <input
                                                type="text"
                                                value={m.name}
                                                onChange={(e) => updateMarket(idx, 'name', e.target.value)}
                                                placeholder="Nama Komoditas (Solar Industri)"
                                                className="w-full rounded-lg border-slate-300 text-xs font-semibold"
                                            />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <input
                                                type="text"
                                                value={m.value}
                                                onChange={(e) => updateMarket(idx, 'value', e.target.value)}
                                                placeholder="Harga ($480/trip)"
                                                className="w-full rounded-lg border-slate-300 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <input
                                                type="text"
                                                value={m.change}
                                                onChange={(e) => updateMarket(idx, 'change', e.target.value)}
                                                placeholder="+3.4%"
                                                className="w-full rounded-lg border-slate-300 text-xs"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <select
                                                value={m.up ? 'up' : 'down'}
                                                onChange={(e) => updateMarket(idx, 'up', e.target.value === 'up')}
                                                className="w-full rounded-lg border-slate-300 text-xs"
                                            >
                                                <option value="up">Naik (Hijau)</option>
                                                <option value="down">Turun (Merah)</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeMarket(idx)}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan Portal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

