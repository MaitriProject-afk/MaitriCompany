import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function DailyGlobeDashboard({
    user,
    division,
    allDivisions = [],
    selectedDivisionTab = 'daily_globe',
    onSelectDivisionTab,
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

    // Quick Action / Form State
    const [articleForm, setArticleForm] = useState({
        headline: '',
        category: 'ekonomi',
        location: '',
        reporter: user?.name || 'Staff Redaksi',
        summary: '',
    });
    const [submittedAlert, setSubmittedAlert] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!articleForm.headline) return;
        setSubmittedAlert(true);
        setTimeout(() => setSubmittedAlert(false), 4000);
        setArticleForm({
            headline: '',
            category: 'ekonomi',
            location: '',
            reporter: user?.name || 'Staff Redaksi',
            summary: '',
        });
    };

    const navItems = [
        {
            section: 'Redaksi & Pemberitaan',
            items: [
                { id: 'overview', label: 'Ruang Redaksi (Overview)', icon: 'newspaper' },
                { id: 'drafts', label: 'Antrean Meja Redaktur', icon: 'edit_note' },
                { id: 'investigasi', label: 'Liputan Lapangan & Investigasi', icon: 'mic_external_on' },
                { id: 'press_release', label: 'Jadwal Siaran Pers', icon: 'campaign' },
            ],
        },
        {
            section: 'Penerbitan & Arsip',
            items: [
                { id: 'bulletin', label: 'Arsip Buletin Cetak & Digital', icon: 'menu_book' },
                { id: 'opini', label: 'Kolom Warga & Opini Publik', icon: 'rate_review' },
                { id: 'sop_etik', label: 'SOP & Kode Etik Jurnalistik', icon: 'verified_user' },
            ],
        },
    ];

    const dummyArticles = [
        {
            id: 1,
            headline: 'Lonjakan Rute Hauling San Andreas Dorong Pertumbuhan Ekonomi Verona',
            category: 'ekonomi',
            categoryLabel: 'Ekonomi & Bisnis',
            status: 'Terbit di Buletin',
            statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            author: 'Redaksi Daily Globe',
            views: '1,420 Dibaca',
            time: 'Hari ini, 08:30 WIB',
        },
        {
            id: 2,
            headline: 'Investigasi: Standar Keselamatan Konvoi Muatan Berat di Lintas Palomino Creek',
            category: 'investigasi',
            categoryLabel: 'Investigasi Khusus',
            status: 'Tahap Editing Redaktur',
            statusColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
            author: user?.name || 'Jurnalis Senior',
            views: 'Draft Review',
            time: 'Kemarin, 21:15 WIB',
        },
        {
            id: 3,
            headline: 'Wawancara Eksklusif Direksi: Rencana Penambahan Unit Truk Tronton 2026',
            category: 'korporat',
            categoryLabel: 'Wawancara Korporat',
            status: 'Pengumpulan Fakta',
            statusColor: 'bg-blue-50 text-brand-700 border-blue-200/60',
            author: 'Tim Jurnalis Liputan',
            views: 'Liputan Aktif',
            time: '09 Okt 2026',
        },
        {
            id: 4,
            headline: 'Patroli Keamanan Tol LS-LV: Koordinasi Pengawalan Logistik Bernilai Tinggi',
            category: 'hukum',
            categoryLabel: 'Keamanan & Hukum',
            status: 'Siap Cetak',
            statusColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
            author: 'Biro Kriminal & Hukum',
            views: 'Siap Rilis',
            time: '08 Okt 2026',
        },
    ];

    const upcomingAgendas = [
        {
            time: '14:00 WIB',
            event: 'Konferensi Pers Peresmian Pool Garasi Baru HQ',
            location: 'HQ Verona Beach No. 12',
            badge: 'Live Scoop',
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/60',
        },
        {
            time: '16:30 WIB',
            event: 'Wawancara Perwakilan Serikat Sopir Truk San Andreas',
            location: 'Diner Flint County',
            badge: 'Wawancara',
            badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/60',
        },
        {
            time: '20:00 WIB',
            event: 'Liputan Investigasi: Konvoi Muatan Logistik Lintas Antarkota',
            location: 'Gerbang Tol Los Santos',
            badge: 'Liputan Khusus',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
        },
        {
            time: '22:00 WIB',
            event: 'Batas Akhir (Deadline) Proofreading Edisi Malam #142',
            location: 'Meja Redaktur Pelaksana',
            badge: 'Deadline Cetak',
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
        },
    ];

    const filteredArticles = selectedCategoryFilter === 'all'
        ? dummyArticles
        : dummyArticles.filter((a) => a.category === selectedCategoryFilter);

    return (
        <div className="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased flex flex-col">
            <Head title="Daily Globe Press - Ruang Redaksi &amp; Pemberitaan" />

            {/* MOBILE SIDEBAR OVERLAY */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 lg:hidden"
                />
            )}

            {/* SIDEBAR ASIDE (EXACT ADMIN STYLE) */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Brand Logo Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                alt="Maitri Company"
                                className="h-8 w-auto object-contain"
                                src="/images/maitricomplogo.png"
                            />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">
                                    Daily Globe
                                </span>
                                <span className="text-[10px] text-sky-600 uppercase tracking-widest font-extrabold mt-0.5">
                                    Press OS • Newsroom
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Operational Active Status Pill */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-2 bg-sky-50/70 border border-sky-200/60 px-3 py-2 rounded-xl text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                                Newsroom Active
                            </span>
                            <span className="ml-auto text-sky-700 font-extrabold text-[11px]">
                                Edisi #142
                            </span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
                        {navItems.map((group, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="px-3 pb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {group.section}
                                    </span>
                                </div>
                                {group.items.map((item) => {
                                    const isActive = activeMenu === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveMenu(item.id);
                                                setMobileSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                                                isActive
                                                    ? 'bg-sky-500/10 text-sky-800 font-bold border border-sky-500/20 shadow-2xs'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-[20px] ${
                                                    isActive ? 'text-sky-600' : 'text-slate-400'
                                                }`}
                                            >
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom User Card in Sidebar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                                {user?.name}
                            </div>
                            <div className="text-[10px] text-sky-700 font-semibold truncate">
                                {user?.position || 'Jurnalis / Redaktur'}
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Logout dari Portal Staf"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* TOP HEADER (FIXED, EXACT ADMIN STYLE) */}
            <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile menu trigger + Search input */}
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>

                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari draft liputan, berita terkini, wawancara... (⌘K)"
                            className="w-full h-10 pl-10 pr-4 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-transparent focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Live System Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Newsroom Feed Live</span>
                    </div>

                    {/* Public News Portal Button */}
                    <a
                        href={route('dailyglobe.index')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                        title="Buka Portal Berita Publik The Daily Globes"
                    >
                        <span className="material-symbols-outlined text-[16px] text-amber-400">public</span>
                        <span className="hidden sm:inline">Portal Berita Publik</span>
                        <span className="material-symbols-outlined text-[14px] text-slate-400">open_in_new</span>
                    </a>

                    {/* Notifications Bell */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="Notifikasi Redaksi"
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                                    <span>Pemberitahuan Redaksi</span>
                                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                                        2 Berita Baru
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-100 pt-1 space-y-1">
                                    <div className="py-2">
                                        <div className="font-semibold text-slate-800">Headline Disetujui Redaktur</div>
                                        <div className="text-slate-500 text-[11px]">Artikel ekspedisi hauling siap masuk percetakan sore ini.</div>
                                    </div>
                                    <div className="py-2">
                                        <div className="font-semibold text-slate-800">Jadwal Wawancara Baru</div>
                                        <div className="text-slate-500 text-[11px]">Serikat sopir truk mengonfirmasi wawancara jam 16:30 WIB.</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    {/* User Profile Mini Badge */}
                    <div className="flex items-center gap-2 pl-1 p-1">
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div className="hidden lg:flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                                {user?.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                Divisi Daily Globe
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT WRAPPER (MATCHING ADMIN LAYOUT SPACING) */}
            <main className="flex-1 lg:ml-72 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
                <div className="space-y-6 sm:space-y-8">
                    {/* 1. TOP CONSOLE MANAGEMENT BANNER (EXACT ADMIN STYLE) */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Konsol Ruang Redaksi Pers
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                                    San Andreas Daily Globe • Live Feed
                                </span>
                                <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                                    Redaksi HQ Verona Beach
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Selamat Bertugas di Redaksi, {user?.name}
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                                Pusat pemantauan liputan jurnalistik, penulisan artikel, proses editing redaktur, serta penerbitan buletin harian dan siaran pers korporat{' '}
                                <span className="font-bold text-sky-700">Maitri Company</span>.
                            </p>
                        </div>

                        {/* Action Buttons (Admin Style) */}
                        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const formEl = document.getElementById('draft-form-section');
                                    formEl?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-sky-600/30 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit_document</span>
                                <span>+ Tulis Draft Berita</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const agendaEl = document.getElementById('agenda-section');
                                    agendaEl?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-sky-600">event_note</span>
                                <span>Agenda Liputan</span>
                            </button>

                            <div className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs">
                                <span className="material-symbols-outlined text-[18px] text-slate-500">newspaper</span>
                                <span>Edisi #142 Siap Cetak</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. 4 CORE KPI CARDS GRID (EXACT ADMIN KPI OVERVIEW STYLE) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        {/* KPI 1: Artikel & Buletin Terbit */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Artikel &amp; Buletin Terbit
                                </span>
                                <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                                    <span className="material-symbols-outlined text-[22px]">newspaper</span>
                                </span>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                                    28 Edisi
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                        +4 Minggu Ini
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        100% On Schedule
                                    </span>
                                </div>
                            </div>
                            <div className="w-full mt-3 pt-2">
                                <svg className="w-full h-7 overflow-visible text-sky-500" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                                    <path d="M0 25 C 40 25, 60 12, 100 16 C 140 20, 160 5, 200 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* KPI 2: Draft Antrean Meja Redaktur */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Antrean Meja Redaktur
                                </span>
                                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                    <span className="material-symbols-outlined text-[22px]">rate_review</span>
                                </span>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                                    6 Berita
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-0.5 text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                                        <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                                        2 Butuh Review
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        4 Dalam Penulisan
                                    </span>
                                </div>
                            </div>
                            <div className="w-full mt-3 pt-2">
                                <svg className="w-full h-7 overflow-visible text-amber-500" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                                    <path d="M0 18 C 50 18, 70 24, 110 10 C 150 2, 170 15, 200 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* KPI 3: Tim Liputan Lapangan Aktif */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Liputan Lapangan Aktif
                                </span>
                                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                    <span className="material-symbols-outlined text-[22px]">mic_external_on</span>
                                </span>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                                    4 Kru Liputan
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        Standby di Titik Berita
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Wilayah LS &amp; LV
                                    </span>
                                </div>
                            </div>
                            <div className="w-full mt-3 pt-2">
                                <svg className="w-full h-7 overflow-visible text-emerald-500" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                                    <path d="M0 20 C 40 10, 80 25, 120 12 C 160 8, 180 5, 200 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* KPI 4: Total Pembaca Warga */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Jangkauan Pembaca Warga
                                </span>
                                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                    <span className="material-symbols-outlined text-[22px]">visibility</span>
                                </span>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                                    18,450 Views
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-0.5 text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        100% Kredibel
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Media Resmi
                                    </span>
                                </div>
                            </div>
                            <div className="w-full mt-3 pt-2">
                                <svg className="w-full h-7 overflow-visible text-purple-500" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                                    <path d="M0 26 C 50 20, 80 15, 120 18 C 160 22, 180 6, 200 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 3. SPLIT SECTION: LEFT PILLAR (MEJA REDAKSI) & RIGHT PILLAR (AGENDA LIPUTAN) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
                        {/* LEFT PILLAR: MEJA REDAKSI & PUBLIKASI (7 COLS) */}
                        <div className="xl:col-span-7 flex flex-col gap-4">
                            {/* Card Header */}
                            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                        <span className="material-symbols-outlined text-[22px]">feed</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                                            Meja Redaksi &amp; Antrean Artikel Berita
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Monitoring Draft Berita, Persetujuan Redaktur &amp; Jadwal Cetak Buletin
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-center">
                                    <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/60 px-3 py-1 rounded-full">
                                        {filteredArticles.length} Artikel Ditampilkan
                                    </span>
                                </div>
                            </div>

                            {/* Table Container */}
                            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
                                {/* Table Toolbar & Filter Tabs */}
                                <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategoryFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                                selectedCategoryFilter === 'all'
                                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Semua ({dummyArticles.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategoryFilter('ekonomi')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                                selectedCategoryFilter === 'ekonomi'
                                                    ? 'bg-white text-sky-700 shadow-2xs font-bold'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Ekonomi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategoryFilter('investigasi')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                                selectedCategoryFilter === 'investigasi'
                                                    ? 'bg-white text-amber-700 shadow-2xs font-bold'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Investigasi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategoryFilter('korporat')}
                                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                                selectedCategoryFilter === 'korporat'
                                                    ? 'bg-white text-brand-700 shadow-2xs font-bold'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Korporat
                                        </button>
                                    </div>

                                    <div className="text-[11px] text-slate-500 font-medium">
                                        Update Real-Time Redaktur
                                    </div>
                                </div>

                                {/* Table Content */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                                                <th className="px-4 py-3">Headline Berita</th>
                                                <th className="px-4 py-3">Rubrik</th>
                                                <th className="px-4 py-3">Penulis</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs">
                                            {filteredArticles.map((art) => (
                                                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-3.5 max-w-xs">
                                                        <div className="font-bold text-slate-900 line-clamp-2">
                                                            {art.headline}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {art.time} • <span className="font-semibold text-slate-600">{art.views}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                            {art.categoryLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                                                        {art.author}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${art.statusColor}`}>
                                                            {art.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => alert(`Pratinjau Berita:\n"${art.headline}"\n\nPenulis: ${art.author}\nStatus: ${art.status}`)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 transition-all cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                            <span>Lihat</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PILLAR: AGENDA LIPUTAN LAPANGAN (5 COLS) */}
                        <div id="agenda-section" className="xl:col-span-5 flex flex-col gap-4">
                            {/* Card Header */}
                            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                        <span className="material-symbols-outlined text-[22px]">event_note</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                                            Agenda Liputan Lapangan
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Jadwal Penugasan Kru Jurnalis Hari Ini
                                        </p>
                                    </div>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            </div>

                            {/* Agenda Items List Container */}
                            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-3.5">
                                {upcomingAgendas.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2 py-0.5 rounded bg-white text-slate-900 border border-slate-200 font-mono text-[11px] font-bold">
                                                {item.time}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-900 mt-0.5">
                                            {item.event}
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                                            <span>{item.location}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-sky-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-sky-600">info</span>
                                    <span>Hubungi Radio Tim Pers jika butuh pengawalan armada di rute berisiko tinggi.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. SPLIT SECTION: FORM INPUT DRAFT (LEFT 7 COLS) & KODE ETIK (RIGHT 5 COLS) */}
                    <div id="draft-form-section" className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
                        {/* LEFT: FORMULIR INPUT DRAFT (7 COLS) */}
                        <div className="xl:col-span-7 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sky-600 text-[20px]">post_add</span>
                                        <span>Formulir Cepat Draft Berita Baru</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kirimkan bahan liputan atau siaran pers ke meja redaktur pelaksana.
                                    </p>
                                </div>
                                <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60">
                                    Biro Liputan
                                </span>
                            </div>

                            {submittedAlert && (
                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                                    <span>Draft berita berhasil disimpan dan diteruskan ke meja editor Daily Globe!</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                        Judul Headline Berita
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={articleForm.headline}
                                        onChange={(e) => setArticleForm((prev) => ({ ...prev, headline: e.target.value }))}
                                        placeholder="Contoh: Operasi Pengiriman Kargo Perdana Rute Gurun Berjalan Lancar"
                                        className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Rubrik Berita
                                        </label>
                                        <select
                                            value={articleForm.category}
                                            onChange={(e) => setArticleForm((prev) => ({ ...prev, category: e.target.value }))}
                                            className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-slate-900 transition-all outline-none font-medium text-xs"
                                        >
                                            <option value="ekonomi">Ekonomi &amp; Bisnis San Andreas</option>
                                            <option value="investigasi">Investigasi Khusus &amp; Lapangan</option>
                                            <option value="korporat">Rilis Resmi Korporat Maitri</option>
                                            <option value="otomotif">Dunia Otomotif &amp; Komunitas Truk</option>
                                            <option value="hukum">Hukum &amp; Keamanan Publik</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Lokasi Liputan Lapangan
                                        </label>
                                        <input
                                            type="text"
                                            value={articleForm.location}
                                            onChange={(e) => setArticleForm((prev) => ({ ...prev, location: e.target.value }))}
                                            placeholder="Contoh: Depo Hauling Verona Beach"
                                            className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                        Ringkasan Fakta &amp; Kutipan Narasumber (5W + 1H)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={articleForm.summary}
                                        onChange={(e) => setArticleForm((prev) => ({ ...prev, summary: e.target.value }))}
                                        placeholder="Uraikan siapa narasumber, kejadian apa yang diliput, waktu, tempat, dan kutipan penting..."
                                        className="w-full p-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium text-xs leading-relaxed"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 h-10 px-5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        <span>Kirim ke Meja Redaktur Pelaksana</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: KODE ETIK & PANDUAN JURNALISTIK (5 COLS) */}
                        <div className="xl:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">verified_user</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                                        Pedoman Etika &amp; Verifikasi Pers
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Standar Kredibilitas Harian Daily Globe
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                                        check_circle
                                    </span>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Dua Sumber Terverifikasi</span>
                                        <span>Setiap berita investigasi wajib diverifikasi minimal oleh 2 pihak independen yang berbeda.</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                                        balance
                                    </span>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Objektif &amp; Berimbang (Cover Both Sides)</span>
                                        <span>Wajib memberikan ruang klarifikasi dan hak jawab terhadap pihak yang diberitakan.</span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                                        lock
                                    </span>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Kerahasiaan Sumber Anonim</span>
                                        <span>Identitas saksi rahasia dilindungi sepenuhnya di bawah hak tolak jurnalisme Daily Globe.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 text-center text-[11px] text-slate-400 italic">
                                *Diterbitkan oleh Dewan Direksi &amp; Pemimpin Redaksi Maitri Company
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER (MATCHING ADMIN FOOTER) */}
            <footer className="lg:ml-72 border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
                <p>© 2026 Maitri Company. Daily Globe Integrated Press &amp; Editorial System. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
