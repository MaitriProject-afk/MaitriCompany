import { useState } from 'react';

export default function MarketingDashboard({ user, division }) {
    // State for interactive dummy form
    const [campaignForm, setCampaignForm] = useState({
        title: '',
        type: 'weazel_ad',
        budget: '',
        target: '',
        notes: '',
    });
    const [submittedAlert, setSubmittedAlert] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!campaignForm.title) return;
        setSubmittedAlert(true);
        setTimeout(() => setSubmittedAlert(false), 4000);
        setCampaignForm({
            title: '',
            type: 'weazel_ad',
            budget: '',
            target: '',
            notes: '',
        });
    };

    const dummyCampaigns = [
        {
            id: 1,
            title: 'Promo Paket Ekspedisi Hauling Akhir Pekan',
            channel: 'Weazel News Radio & Ticker',
            status: 'Sedang Tayang',
            statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            date: '10 - 13 Okt 2026',
            leads: '18 Kontak Masuk',
        },
        {
            id: 2,
            title: 'Sponsorship Konvoi Komunitas Pengemudi Truk',
            channel: 'Billboard Verona Beach',
            status: 'Review Direksi',
            statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            date: '15 Okt 2026',
            leads: 'Tahap Negosiasi',
        },
        {
            id: 3,
            title: 'Kampanye Branding Mitra Korporat Manufaktur',
            channel: 'Brosur & Direct Mail',
            status: 'Konsep Draft',
            statusColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            date: '20 Okt 2026',
            leads: '3 Calon Klien',
        },
    ];

    return (
        <div className="space-y-6">
            {/* 1. HERO DIVISION BANNER */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/30 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
                            <span className="material-symbols-outlined text-[32px]">campaign</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                    Divisi Marketing &amp; PR
                                </span>
                                <span className="text-xs text-slate-400">HQ Verona Beach</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                                Pemasaran &amp; Relasi Publik
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                Mengelola promosi komersial, kemitraan sponsorship, dan citra publik Maitri Company.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-purple-500/30 text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Petugas Aktif</div>
                            <div className="text-sm font-black text-purple-300">{user.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KPI / STATS METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <span className="material-symbols-outlined text-[24px]">trending_up</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Kampanye Aktif</div>
                        <div className="text-lg font-black text-white">4 Program</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <span className="material-symbols-outlined text-[24px]">ads_click</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Tayang Media</div>
                        <div className="text-lg font-black text-white">12 Titik Iklan</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <span className="material-symbols-outlined text-[24px]">contact_mail</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Calon Mitra / Leads</div>
                        <div className="text-lg font-black text-white">28 Kontak</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Alokasi Promosi</div>
                        <div className="text-lg font-black text-white">$15,000 / Bln</div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN SECTION: CAMPAIGNS LIST & SUBMISSION FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Campaigns Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400 text-[18px]">view_timeline</span>
                                <span>Papan Kampanye Promosi Terjadwal</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">Update Realtime</span>
                        </div>

                        <div className="space-y-3">
                            {dummyCampaigns.map((camp) => (
                                <div
                                    key={camp.id}
                                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-xs sm:text-sm">{camp.title}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                            <span>Saluran: <strong className="text-slate-300">{camp.channel}</strong></span>
                                            <span>•</span>
                                            <span>Periode: {camp.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${camp.statusColor}`}>
                                            {camp.status}
                                        </span>
                                        <span className="text-[11px] text-slate-300 font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                            {camp.leads}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marketing Assets & Materials */}
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-400 text-[18px]">folder_special</span>
                            <span>Materi &amp; Aset Promosi Resmi</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-purple-400 text-[20px]">picture_as_pdf</span>
                                    <div>
                                        <div className="font-bold text-white">Rate Card Sewa Truk 2026</div>
                                        <div className="text-[10px] text-slate-400">PDF • Brosur Resmi Klien</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">Siap Pakai</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-indigo-400 text-[20px]">palette</span>
                                    <div>
                                        <div className="font-bold text-white">Logo Pack &amp; Livery Vector</div>
                                        <div className="text-[10px] text-slate-400">ZIP • Resolusi Tinggi</div>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Aset HQ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Submission Column */}
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-400 text-[18px]">add_circle</span>
                                <span>Pengajuan Kampanye Baru</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Daftarkan rencana promosi baru untuk ditinjau oleh pimpinan divisi.
                            </p>
                        </div>

                        {submittedAlert && (
                            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span>Draf kampanye promosi berhasil didaftarkan ke meja antrean!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Nama / Judul Program Promosi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={campaignForm.title}
                                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Contoh: Promo Hauling Spesial Awal Bulan"
                                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Saluran Publikasi Utama
                                </label>
                                <select
                                    value={campaignForm.type}
                                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, type: e.target.value }))}
                                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="weazel_ad">Iklan Weazel News Radio / Ticker</option>
                                    <option value="billboard">Pemasangan Billboard Verona / Commerce</option>
                                    <option value="event">Sponsorship Acara Balap / Komunitas</option>
                                    <option value="direct">Direct Outreach Mitra Perusahaan Tambang</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Estimasi Anggaran ($)
                                </label>
                                <input
                                    type="number"
                                    value={campaignForm.budget}
                                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, budget: e.target.value }))}
                                    placeholder="Contoh: 3500"
                                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Catatan / Konsep Pesan
                                </label>
                                <textarea
                                    rows={3}
                                    value={campaignForm.notes}
                                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Ringkasan isi pesan promosi dan target audiens..."
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">send</span>
                                <span>Ajukan Program Promosi</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
