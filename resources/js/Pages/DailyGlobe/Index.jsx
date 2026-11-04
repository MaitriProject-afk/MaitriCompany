import { useState, useMemo, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DailyGlobeRadioPlayer from '@/Components/DailyGlobeRadioPlayer';

export default function DailyGlobeIndex({
    articles = [],
    allArticles = [],
    leadArticle = null,
    breakingNews = [],
    trendingArticles = [],
    editorsPicks = [],
    categories = [],
    weatherReport = [],
    marketIndex = [],
    activeCategory = 'all',
    searchQuery = '',
    editionDate = 'Selasa, 13 Oktober 2026',
    editionMeta = {},
    communityChannels = {},
    radioBroadcast = null,
}) {
    const [searchTerm, setSearchTerm] = useState(searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState(activeCategory || 'all');
    const [breakingIndex, setBreakingIndex] = useState(0);
    const [featureDrawerOpen, setFeatureDrawerOpen] = useState(false);
    const [tipLineModalOpen, setTipLineModalOpen] = useState(false);
    const [tipForm, setTipForm] = useState({ name: '', phone: '', location: '', category: 'kriminal', details: '' });
    const [tipSubmitted, setTipSubmitted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // Auto-cycle breaking news ticker
    useEffect(() => {
        if (!breakingNews || breakingNews.length === 0) return;
        const timer = setInterval(() => {
            setBreakingIndex((prev) => (prev + 1) % breakingNews.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [breakingNews]);

    const sourceArticles = useMemo(() => {
        return allArticles.length > 0 ? allArticles : articles;
    }, [allArticles, articles]);

    // Filter articles based on active category & search query
    const filteredArticles = useMemo(() => {
        return sourceArticles.filter((article) => {
            const matchCategory =
                selectedCategory === 'all' ||
                article.category === selectedCategory ||
                (selectedCategory === 'pedesaan' && (article.category === 'pedesaan' || article.location?.includes('Flint'))) ||
                (selectedCategory === 'otomotif' && article.category === 'otomotif') ||
                (selectedCategory === 'kriminal' && article.category === 'kriminal') ||
                (selectedCategory === 'edisi-cetak' && article.featured);

            const matchSearch =
                !searchTerm.trim() ||
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (article.subtitle && article.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.author.toLowerCase().includes(searchTerm.toLowerCase());

            return matchCategory && matchSearch;
        });
    }, [sourceArticles, selectedCategory, searchTerm]);

    const isFiltered = selectedCategory !== 'all' || searchTerm.trim().length > 0;

    const activeLead = useMemo(() => {
        if (!isFiltered) {
            return leadArticle || filteredArticles[0] || null;
        }
        return filteredArticles[0] || null;
    }, [isFiltered, leadArticle, filteredArticles]);

    const secondaryGridArticles = useMemo(() => {
        if (!activeLead) return [];
        return filteredArticles.filter((a) => a.id !== activeLead.id);
    }, [filteredArticles, activeLead]);

    // Categorized story groups for lower broadsheet sections
    const crimeArticles = useMemo(() => {
        return sourceArticles
            .filter((a) => a.category === 'kriminal' || a.badge?.includes('Kasus') || a.badge?.includes('Patroli'))
            .slice(0, 3);
    }, [sourceArticles]);

    const tuningArticles = useMemo(() => {
        return sourceArticles
            .filter((a) => a.category === 'otomotif' || a.slug.includes('hidrolik') || a.slug.includes('emisi'))
            .slice(0, 3);
    }, [sourceArticles]);

    const ruralAndOpinionArticles = useMemo(() => {
        return sourceArticles
            .filter((a) => a.category === 'pedesaan' || a.category === 'opini' || a.category === 'investigasi')
            .filter((a) => a.id !== activeLead?.id)
            .slice(0, 3);
    }, [sourceArticles, activeLead]);

    const wireHeadlines = useMemo(() => {
        return sourceArticles
            .filter((a) => a.id !== activeLead?.id)
            .slice(0, 4);
    }, [sourceArticles, activeLead]);

    const handleTipSubmit = (e) => {
        e.preventDefault();
        if (!tipForm.details.trim()) return;
        setTipSubmitted(true);
        setTimeout(() => {
            setTipSubmitted(false);
            setTipLineModalOpen(false);
            setTipForm({ name: '', phone: '', location: '', category: 'kriminal', details: '' });
        }, 2500);
    };

    const discordUrl = communityChannels.discord || 'https://discord.gg/QKfsxuKzU5';
    const centralUrl = communityChannels.central || 'https://bit.ly/TheDailyGlobesCentral';

    return (
        <div className="bg-[#0e0f12] text-stone-100 font-body-md antialiased min-h-screen selection:bg-rose-600 selection:text-white">
            <Head>
                <title>The Daily Globes — Media Berita &amp; Investigasi San Andreas</title>
                <meta
                    name="description"
                    content="Pers investigasi independen San Andreas menyajikan dinamika kriminalitas, birokrasi, otomotif, dan kehidupan jalanan di seluruh wilayah Negara Bagian San Andreas."
                />
            </Head>

            {/* ========================================================= */}
            {/* 1. STICKY UTILITY & BREAKING NEWS BAR                     */}
            {/* ========================================================= */}
            <div className="w-full bg-[#090a0c] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-3">
                    {/* Left: Live Clock / Weather & Breaking News Ticker */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0 flex-1">
                        <div className="hidden xl:flex items-center gap-3 text-[11px] font-label-sm tracking-wider uppercase text-stone-400 shrink-0 border-r border-white/10 pr-4">
                            <span className="flex items-center gap-1 text-stone-200 font-semibold">
                                <span className="material-symbols-outlined text-[15px] text-rose-500">schedule</span>
                                22:45 SAST
                            </span>
                            <span className="text-stone-700">•</span>
                            <span className="flex items-center gap-1 text-amber-400">
                                <span className="material-symbols-outlined text-[15px]">sunny</span>
                                LS 24°C
                            </span>
                            <span className="text-stone-700">•</span>
                            <span className="flex items-center gap-1 text-stone-400">
                                <span className="material-symbols-outlined text-[15px]">foggy</span>
                                FLINT 18°C
                            </span>
                        </div>

                        {/* Breaking News Pill & Cycling Text */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-0.5 rounded-sm font-label-sm text-[10px] sm:text-[11px] uppercase font-bold tracking-wider shrink-0 shadow-sm shadow-rose-600/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                BREAKING
                            </span>
                            <p className="truncate text-xs sm:text-[13px] text-stone-300 font-medium">
                                {breakingNews[breakingIndex] ||
                                    'Aktivitas mencurigakan meningkat di pedesaan Flint County; SAPD tingkatkan patroli malam perbatasan.'}
                            </p>
                        </div>

                        {/* Ticker Controls (Desktop) */}
                        {breakingNews.length > 1 && (
                            <div className="hidden md:flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setBreakingIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length)}
                                    className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
                                    title="Berita Sebelumnya"
                                >
                                    <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBreakingIndex((prev) => (prev + 1) % breakingNews.length)}
                                    className="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400 hover:text-white transition"
                                    title="Berita Selanjutnya"
                                >
                                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Action Shortcuts */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setTipLineModalOpen(true)}
                            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-label-sm uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-2.5 py-1 rounded-sm transition cursor-pointer font-bold"
                        >
                            <span className="material-symbols-outlined text-[14px]">campaign</span>
                            <span>Tip Line #911</span>
                        </button>

                        <a
                            href={discordUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#5865F2] hover:bg-[#4752C4] text-white text-[11px] font-label-sm px-2.5 sm:px-3 py-1 rounded-sm flex items-center gap-1.5 uppercase tracking-wider font-bold transition shadow-xs"
                        >
                            <span className="material-symbols-outlined text-[14px]">forum</span>
                            <span className="hidden xs:inline">Discord</span>
                        </a>

                        <Link
                            href="/"
                            title="Kembali ke Portal Utama Maitri Company"
                            className="inline-flex items-center gap-1.5 text-[11px] font-label-sm uppercase tracking-wider text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-sm transition"
                        >
                            <span className="material-symbols-outlined text-[14px] text-cyan-400">corporate_fare</span>
                            <span className="hidden lg:inline">Maitri Portal</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. EDITORIAL BROADSHEET MASTHEAD & NAVIGATION             */}
            {/* ========================================================= */}
            <header className="w-full bg-[#131519] border-b border-white/10">
                {/* Edition Metadata Top Strip */}
                <div className="border-b border-white/5 bg-[#101216]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-label-sm uppercase tracking-widest text-stone-400">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-rose-400 font-bold">{editionMeta.volume || 'Vol. XLVIII No. 1,204'}</span>
                            <span className="text-stone-700">•</span>
                            <span>{editionDate}</span>
                            <span className="hidden md:inline text-stone-700">•</span>
                            <span className="hidden md:inline text-stone-500">{editionMeta.issn || 'ISSN 2407-8911'}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-stone-400">
                            <span>Los Santos</span>
                            <span className="text-stone-700">/</span>
                            <span>San Fierro</span>
                            <span className="text-stone-700">/</span>
                            <span>Las Venturas</span>
                            <span className="text-stone-700">/</span>
                            <span className="text-amber-400 font-semibold">Flint &amp; Red County</span>
                        </div>
                    </div>
                </div>

                {/* Main Newspaper Title Banner */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        {/* Brand Identity */}
                        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                            <Link href={route('dailyglobe.index')} className="flex items-center gap-3.5 sm:gap-5 group min-w-0">
                                <div className="relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-[#1b1d23] border border-white/15 p-1.5 flex items-center justify-center shadow-lg overflow-hidden group-hover:border-rose-500/50 transition">
                                    <img
                                        alt="The Daily Globes Emblem"
                                        className="w-full h-full object-contain filter grayscale contrast-125 group-hover:grayscale-0 transition duration-500"
                                        src="/images/dailyglobe/dailyglobe-icon.png"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://lh3.googleusercontent.com/aida/AEtjO1UUkUBlZNRaz3ijZ4WIz6A7ahzLEt6XAhyJJOm8Eas-_Qcd7tsu8cy9kGUUoZ6CtGFMVySqg23DUsCiVUAGeI2hiUYlc-CUOTpshjbA3_DGWNYd-4yp-SLBC9fRwlesV7eb7B7wNK2xJfTnCEOj8KZNa7Ot_zT8ZTs6ZQstg-7wjq12fopO23r4HTm2zJ_iXcmP9KYPDNwFCM5T8dq67iJ3TQIzn-Z_lEM9YkVmhdGX3yt5ljUml-LJWmoDz0j4TZnXD7HocZnFkL4';
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 text-[10px] font-label-sm uppercase tracking-widest bg-rose-600/15 text-rose-400 border border-rose-500/30 font-bold rounded-xs">
                                            SURAT KABAR INVESTIGASI RESMI
                                        </span>
                                        <span className="hidden sm:inline-block text-[10px] font-label-sm uppercase tracking-widest text-amber-400/90 font-semibold">
                                            • EDISI #142
                                        </span>
                                    </div>
                                    <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                                        The Daily Globes
                                    </h1>
                                    <p className="text-xs sm:text-sm text-stone-400 italic mt-1.5 font-newsreader">
                                        “Menyingkap Fakta di Balik Kabut Jalanan, Birokrasi &amp; Dinamika Kota San Andreas”
                                    </p>
                                </div>
                            </Link>

                            {/* Mobile Controls (Search & Menu) */}
                            <div className="flex items-center gap-2 lg:hidden shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-200 transition"
                                    aria-label="Cari Berita"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {mobileSearchOpen ? 'close' : 'search'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="w-10 h-10 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-rose-300 transition"
                                    aria-label="Buka Menu"
                                >
                                    <span className="material-symbols-outlined text-[22px]">
                                        {mobileMenuOpen ? 'close' : 'menu'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Weather & Freight Index Mini-Cards (Desktop) */}
                        <div className="hidden lg:flex items-stretch gap-3 shrink-0">
                            {/* Weather Box */}
                            <div className="bg-[#181a20] border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl text-amber-400">partly_cloudy_day</span>
                                <div>
                                    <div className="text-[10px] font-label-sm uppercase tracking-wider text-stone-400">
                                        CUACA SAN ANDREAS
                                    </div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                                        <span>Los Santos 24°C</span>
                                        <span className="text-xs font-normal text-stone-400">(Cerah)</span>
                                    </div>
                                    <div className="text-[11px] text-stone-400">Flint Co. 18°C • Kabut Tebal</div>
                                </div>
                            </div>

                            {/* Freight Market Highlight */}
                            <div className="bg-[#181a20] border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl text-emerald-400">monitoring</span>
                                <div>
                                    <div className="text-[10px] font-label-sm uppercase tracking-wider text-stone-400">
                                        INDEKS KARGO &amp; LOGISTIK
                                    </div>
                                    <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                                        <span>LS-LV $480/trip</span>
                                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                            +3.4%
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-stone-400">Solar Industri: $1.25/L (-0.8%)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Drawer */}
                    {mobileSearchOpen && (
                        <div className="mt-4 pt-3 border-t border-white/10 lg:hidden">
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined text-stone-400 absolute left-3 text-[18px]">search</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari judul berita, lokasi, atau nama jurnalis..."
                                    className="w-full bg-[#1b1e24] border border-white/15 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-rose-500"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 text-stone-400 hover:text-white"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile Hamburger Drawer */}
                    {mobileMenuOpen && (
                        <div className="mt-4 pt-4 border-t border-white/10 lg:hidden space-y-3">
                            <div className="text-[11px] font-label-sm uppercase tracking-wider text-stone-400 font-bold">
                                KANAL BERITA UTAMA
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {categories.map((cat) => {
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`px-3 py-2.5 rounded-lg text-xs font-label-md uppercase tracking-wider flex items-center gap-2 text-left transition ${
                                                isActive
                                                    ? 'bg-rose-600 text-white font-bold shadow-sm'
                                                    : 'bg-[#1b1e24] text-stone-300 hover:bg-white/10 border border-white/5'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                            <span className="truncate">{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        setTipLineModalOpen(true);
                                    }}
                                    className="w-full py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-label-md uppercase tracking-wider font-bold flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">campaign</span>
                                    <span>Kirim Laporan / Tip Anonim</span>
                                </button>
                                <Link
                                    href="/"
                                    className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 text-xs font-label-md uppercase tracking-wider font-bold flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    <span>Ke Portal Maitri Company</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Navigation Strip (Always scrollable on mobile/tablet, full bar on desktop) */}
                <div className="bg-[#17191e] border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-12">
                        {/* Horizontal Scrollable Category Pills */}
                        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-md font-label-md text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                                            isActive
                                                ? 'bg-rose-600 text-white font-bold shadow-xs'
                                                : 'text-stone-300 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Desktop Search Input & Whistleblower Button */}
                        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined text-[16px] text-stone-400 absolute left-2.5">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari arsip berita..."
                                    className="bg-[#101216] border border-white/15 focus:border-rose-500 rounded-md pl-8 pr-7 py-1 text-xs text-white placeholder:text-stone-500 focus:outline-none w-48 xl:w-56 transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 text-stone-400 hover:text-white text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setTipLineModalOpen(true)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-label-md text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition font-bold cursor-pointer shadow-xs"
                            >
                                <span className="material-symbols-outlined text-[15px]">campaign</span>
                                <span>Kirim Laporan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* 3. WEATHER & MARKET TICKER RIBBON (MOBILE / TABLET)       */}
            {/* ========================================================= */}
            <div className="bg-[#121418] border-b border-white/10 py-2 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs">
                    {/* Weather Pills */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
                        <span className="text-[10px] font-label-sm uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-[14px] text-amber-400">thermostat</span>
                            CUACA DISTRIK:
                        </span>
                        {weatherReport.map((w, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-stone-300 text-[11px] shrink-0">
                                <span className="font-semibold text-white">{w.city}:</span>
                                <span className="text-amber-300 font-medium">{w.temp}</span>
                                <span className="text-stone-400">({w.condition})</span>
                                {idx < weatherReport.length - 1 && <span className="text-stone-700 ml-2">•</span>}
                            </span>
                        ))}
                    </div>

                    {/* Market Index Pills */}
                    <div className="hidden xl:flex items-center gap-3 overflow-x-auto whitespace-nowrap">
                        <span className="text-[10px] font-label-sm uppercase tracking-widest text-stone-400 font-bold shrink-0">
                            BURSA LOGISTIK:
                        </span>
                        {marketIndex.slice(0, 3).map((m, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] shrink-0">
                                <span className="text-stone-300">{m.name}:</span>
                                <span className="text-white font-mono font-semibold">{m.value}</span>
                                <span className={`font-bold ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>{m.change}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. MAIN BROADSHEET CONTENT CONTAINER                      */}
            {/* ========================================================= */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
                {/* Active Filter / Search Banner */}
                {isFiltered && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#181b21] border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-label-md uppercase tracking-wider">
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">filter_alt</span>
                                FILTER AKTIF:
                            </span>
                            {selectedCategory !== 'all' && (
                                <span className="bg-rose-600/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-md font-bold">
                                    Kanal: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                                </span>
                            )}
                            {searchTerm.trim() && (
                                <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-md">
                                    Pencarian: &ldquo;{searchTerm}&rdquo;
                                </span>
                            )}
                            <span className="text-stone-400 lowercase font-sans">
                                ({filteredArticles.length} laporan ditemukan)
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchTerm('');
                            }}
                            className="text-xs font-label-sm uppercase tracking-wider text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                            <span>Tampilkan Semua Berita</span>
                        </button>
                    </div>
                )}

                {/* TOP HERO GRID: 8 COLS LEAD INVESTIGATION + 4 COLS WIRE SIDEBAR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* LEFT 8 COLS: LEAD ARTICLE + FILTERED LIST */}
                    <div className="lg:col-span-8 space-y-8">
                        {activeLead ? (
                            <article className="bg-[#15171c] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                                {/* Lead Visual Evidence Banner */}
                                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-black overflow-hidden group">
                                    <img
                                        alt={activeLead.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-110"
                                        src={activeLead.image}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#15171c] via-[#15171c]/20 to-black/40 pointer-events-none"></div>

                                    {/* Top Badges */}
                                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <span className="bg-rose-600 text-white font-label-md text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-md font-bold">
                                                {activeLead.badge || 'LIPUTAN KHUSUS'}
                                            </span>
                                            {activeLead.location && (
                                                <span className="bg-black/75 backdrop-blur-md text-stone-200 border border-white/15 font-label-md text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-sm tracking-wider flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[13px] text-rose-400">
                                                        location_on
                                                    </span>
                                                    {activeLead.location}
                                                </span>
                                            )}
                                        </div>
                                        <span className="bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30 font-label-sm text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-sm tracking-wider font-semibold">
                                            {activeLead.readTime || '4 Menit Baca'}
                                        </span>
                                    </div>

                                    {/* Bottom Photo Caption Overlay (Desktop) */}
                                    <div className="hidden sm:flex absolute bottom-3 left-4 right-4 items-center justify-between text-[11px] font-label-sm uppercase tracking-wider text-stone-300">
                                        <span className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/10">
                                            BERKAS INVESTIGASI #W-409/SAPD
                                        </span>
                                        <span className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/10 text-amber-300 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                            DOKUMENTASI EKSKLUSIF REDAKSI
                                        </span>
                                    </div>
                                </div>

                                {/* Lead Content Body */}
                                <div className="p-5 sm:p-7 lg:p-8 flex flex-col">
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-label-md uppercase tracking-wider mb-3">
                                        <span className="text-rose-400 font-bold">
                                            {activeLead.categoryLabel || 'INVESTIGASI KHUSUS'}
                                        </span>
                                        <span className="text-stone-600">•</span>
                                        <span className="text-stone-400">
                                            {activeLead.date || '24 Oktober 2026'} — {activeLead.time || '22:15 SAST'}
                                        </span>
                                        {activeLead.views && (
                                            <>
                                                <span className="text-stone-600">•</span>
                                                <span className="text-stone-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                    {activeLead.views} pembaca
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <Link href={route('dailyglobe.show', activeLead.slug)} className="group">
                                        <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-white group-hover:text-rose-400 transition-colors font-bold leading-tight mb-3">
                                            {activeLead.title}
                                        </h2>
                                    </Link>

                                    {activeLead.subtitle && (
                                        <p className="font-newsreader text-base sm:text-lg text-amber-200/90 italic mb-4">
                                            {activeLead.subtitle}
                                        </p>
                                    )}

                                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                                        {activeLead.excerpt}
                                    </p>

                                    {/* Key Metrics Row if present on Lead Article */}
                                    {activeLead.metrics && activeLead.metrics.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                            {activeLead.metrics.map((m, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-[#1c1f26] border border-white/10 rounded-lg p-3.5 flex flex-col justify-between"
                                                >
                                                    <span className="text-[10px] font-label-sm uppercase tracking-wider text-stone-400 font-bold">
                                                        {m.label}
                                                    </span>
                                                    <span className="font-headline text-2xl sm:text-3xl font-black text-rose-400 my-1">
                                                        {m.value}
                                                    </span>
                                                    <span className="text-xs text-stone-400 leading-snug">{m.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quote & Key Findings Box */}
                                    {activeLead.quote && (
                                        <div className="bg-[#1b1e25] p-4 sm:p-5 rounded-lg mb-6 border-l-4 border-rose-600">
                                            <div className="flex items-start gap-3">
                                                <span className="material-symbols-outlined text-rose-500 text-2xl shrink-0 mt-0.5">
                                                    format_quote
                                                </span>
                                                <div>
                                                    <p className="text-xs font-label-md uppercase tracking-wider text-rose-400 font-bold mb-1">
                                                        Kutipan Saksi &amp; Temuan Lapangan:
                                                    </p>
                                                    <p className="text-sm text-stone-200 italic leading-relaxed">
                                                        &ldquo;{activeLead.quote}&rdquo;
                                                    </p>
                                                    {activeLead.quoteAuthor && (
                                                        <p className="text-xs text-stone-400 mt-1.5 font-semibold">
                                                            — {activeLead.quoteAuthor}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Optional Expandable Field Notes */}
                                    {featureDrawerOpen && (
                                        <div className="bg-[#1d2028] p-4 rounded-lg mb-6 border border-white/10 space-y-2 text-xs">
                                            <div className="flex items-center justify-between text-amber-400 font-label-sm uppercase font-bold">
                                                <span>CATATAN LAPANGAN REPORTER RESMI</span>
                                                <span>STATUS: TERKONFIRMASI</span>
                                            </div>
                                            <p className="text-stone-300 leading-relaxed">
                                                Menurut penuturan sopir truk kargo lokal, sejumlah kendaraan datang tanpa pelat nomor resmi setiap pukul 03.15 SAST. Seluruh transaksi menggunakan sistem tunai mandiri untuk menghindari pelacakan perbankan.
                                            </p>
                                        </div>
                                    )}

                                    {/* Author Footer & Read Full CTA */}
                                    <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold text-sm shrink-0">
                                                {activeLead.author
                                                    ? activeLead.author
                                                          .split(' ')
                                                          .map((n) => n[0])
                                                          .join('')
                                                          .slice(0, 2)
                                                    : 'DG'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase tracking-wide">
                                                    {activeLead.author || 'Tim Investigasi Redaksi'}
                                                </div>
                                                <div className="text-xs text-stone-400">
                                                    {activeLead.authorRole || 'Koordinator Liputan Khusus'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setFeatureDrawerOpen(!featureDrawerOpen)}
                                                className="px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-label-sm uppercase tracking-wider font-bold transition cursor-pointer"
                                            >
                                                {featureDrawerOpen ? 'Tutup Catatan' : 'Catatan Biro'}
                                            </button>

                                            <Link
                                                href={route('dailyglobe.show', activeLead.slug)}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-label-md text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg font-bold transition shadow-lg shadow-rose-600/25"
                                            >
                                                <span>Baca Laporan Lengkap</span>
                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <div className="bg-[#15171c] border border-white/10 rounded-xl p-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-stone-600 mb-3">search_off</span>
                                <h3 className="font-headline text-xl text-white font-bold">
                                    Tidak Ada Laporan yang Ditemukan
                                </h3>
                                <p className="text-sm text-stone-400 mt-1 max-w-md mx-auto">
                                    Maaf, tidak ada artikel yang sesuai dengan filter kanal atau kata kunci pencarian Anda.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSearchTerm('');
                                    }}
                                    className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-label-md uppercase tracking-wider font-bold rounded-lg transition"
                                >
                                    Reset Pencarian
                                </button>
                            </div>
                        )}

                        {/* When Filter is Active, show remaining matching articles immediately below */}
                        {isFiltered && secondaryGridArticles.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-label-lg uppercase tracking-wider text-stone-300 font-bold border-b border-white/10 pb-2">
                                    Artikel Lainnya dalam Filter Ini ({secondaryGridArticles.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {secondaryGridArticles.map((art) => (
                                        <article
                                            key={art.id}
                                            className="bg-[#15171c] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-rose-500/40 transition"
                                        >
                                            <div>
                                                <div className="aspect-video bg-black overflow-hidden relative">
                                                    <img
                                                        src={art.image}
                                                        alt={art.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    />
                                                    <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-label-sm uppercase font-bold px-2 py-0.5 rounded-xs">
                                                        {art.badge || art.categoryLabel}
                                                    </span>
                                                </div>
                                                <div className="p-4">
                                                    <div className="text-[11px] font-label-sm uppercase text-stone-400 mb-1">
                                                        {art.date} • {art.readTime}
                                                    </div>
                                                    <Link href={route('dailyglobe.show', art.slug)}>
                                                        <h4 className="font-headline text-lg font-bold text-white group-hover:text-rose-400 transition leading-snug">
                                                            {art.title}
                                                        </h4>
                                                    </Link>
                                                    <p className="text-xs text-stone-400 mt-2 line-clamp-2">{art.excerpt}</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs">
                                                <span className="text-stone-400">{art.author}</span>
                                                <Link
                                                    href={route('dailyglobe.show', art.slug)}
                                                    className="text-rose-400 font-bold hover:underline"
                                                >
                                                    Baca →
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT 4 COLS: KAWAT BERITA UTAMA, TRENDING & DISCORD HUB */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* Kawat Berita Utama (Live Wire) */}
                        <div className="bg-[#15171c] border border-white/10 border-t-4 border-t-rose-600 rounded-xl p-5 shadow-xl">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <h2 className="font-label-lg text-xs sm:text-sm uppercase tracking-widest text-white font-bold">
                                        KAWAT BERITA UTAMA
                                    </h2>
                                </div>
                                <span className="text-[10px] font-label-sm uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                    TELEGRAM 911
                                </span>
                            </div>

                            <div className="divide-y divide-white/10">
                                {wireHeadlines.map((wire, index) => (
                                    <Link
                                        key={wire.id}
                                        href={route('dailyglobe.show', wire.slug)}
                                        className="group py-3.5 first:pt-0 last:pb-0 block"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-label-sm uppercase tracking-wider text-rose-400 font-bold">
                                                0{index + 1} • {wire.categoryLabel || wire.category?.toUpperCase()}
                                            </span>
                                            <span className="text-[11px] font-label-sm text-stone-400">
                                                {wire.time || '19:42 SAST'}
                                            </span>
                                        </div>
                                        <h3 className="font-headline text-base sm:text-lg font-bold text-stone-100 group-hover:text-rose-400 transition-colors leading-snug">
                                            {wire.title}
                                        </h3>
                                        <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                                            {wire.excerpt}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Indeks Pasar Kargo & Logistik (Full Card) */}
                        {marketIndex.length > 0 && (
                            <div className="bg-[#15171c] border border-white/10 rounded-xl p-5 shadow-xl">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-400 text-[18px]">
                                            local_shipping
                                        </span>
                                        <h3 className="font-label-lg text-xs uppercase tracking-widest text-white font-bold">
                                            BURSA KOMODITAS &amp; KARGO
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-label-sm text-stone-400 uppercase">SAEX INDEX</span>
                                </div>
                                <div className="space-y-2.5">
                                    {marketIndex.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-xs bg-[#1b1e25] px-3 py-2 rounded-lg border border-white/5"
                                        >
                                            <span className="text-stone-300 font-medium">{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono font-bold">{item.value}</span>
                                                <span
                                                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                                        item.up
                                                            ? 'bg-emerald-500/15 text-emerald-400'
                                                            : 'bg-rose-500/15 text-rose-400'
                                                    }`}
                                                >
                                                    {item.change}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Official RP Community & Whistleblower Card */}
                        <div className="bg-gradient-to-b from-[#1a1d24] to-[#13151a] border border-white/15 rounded-xl p-5 shadow-xl">
                            <div className="text-center pb-4 border-b border-white/10">
                                <span className="text-[10px] font-label-sm tracking-widest text-rose-400 uppercase font-bold">
                                    JARINGAN PERS RESMI SAN ANDREAS
                                </span>
                                <h3 className="font-headline text-2xl font-bold text-white mt-0.5">The Daily Globes</h3>
                                <p className="text-xs text-stone-400 mt-1">
                                    Saluran Informasi, Pengaduan Warga &amp; Komunitas Roleplay
                                </p>
                            </div>

                            <div className="space-y-2.5 my-4">
                                <a
                                    href={discordUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 p-3 rounded-lg transition group"
                                >
                                    <span className="material-symbols-outlined text-[#5865F2] text-2xl shrink-0">forum</span>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-label-sm uppercase text-stone-400 block">
                                            SERVER DISCORD RESMI
                                        </span>
                                        <span className="text-xs font-mono text-white truncate block group-hover:text-rose-300 transition">
                                            discord.gg/QKfsxuKzU5
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-stone-400 text-sm">open_in_new</span>
                                </a>

                                <a
                                    href={centralUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 p-3 rounded-lg transition group"
                                >
                                    <span className="material-symbols-outlined text-amber-400 text-2xl shrink-0">
                                        language
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-label-sm uppercase text-stone-400 block">
                                            PORTAL PUSAT ARSIP
                                        </span>
                                        <span className="text-xs font-mono text-white truncate block group-hover:text-amber-300 transition">
                                            bit.ly/TheDailyGlobesCentral
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-stone-400 text-sm">open_in_new</span>
                                </a>
                            </div>

                            <div className="bg-[#111317] p-4 rounded-lg border border-white/10">
                                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-label-md font-bold uppercase mb-1">
                                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                                    <span>Whistleblower &amp; Tip Anonim</span>
                                </div>
                                <p className="text-xs text-stone-400 leading-relaxed mb-3">
                                    Punya bukti foto razia, korupsi, atau tindak kriminal jalanan? Kirim secara rahasia ke meja redaksi.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setTipLineModalOpen(true)}
                                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-label-md text-xs uppercase tracking-wider font-bold rounded-lg transition cursor-pointer shadow-sm"
                                >
                                    Hubungi Meja Redaksi
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* ========================================================= */}
                {/* 5. SECTION: KRIMINAL & PENEGAKAN HUKUM SAPD               */}
                {/* ========================================================= */}
                <section className="pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">local_police</span>
                            </span>
                            <div>
                                <h2 className="font-headline text-xl sm:text-2xl text-white font-bold tracking-tight">
                                    Kriminal &amp; Penegakan Hukum SAPD
                                </h2>
                                <p className="text-xs text-stone-400">
                                    Laporan razia kepolisian, penyitaan barang bukti, dan insiden keamanan negara bagian
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('kriminal')}
                            className="self-start sm:self-auto text-xs font-label-md text-amber-400 hover:text-amber-300 uppercase tracking-wider flex items-center gap-1 font-bold cursor-pointer"
                        >
                            <span>Lihat Semua Berita Kriminal</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {crimeArticles.map((item) => (
                            <article
                                key={item.id}
                                className="bg-[#15171c] border border-white/10 hover:border-rose-500/40 rounded-xl flex flex-col group overflow-hidden shadow-lg transition-all"
                            >
                                <div className="relative aspect-video bg-black overflow-hidden">
                                    <img
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        src={item.image}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#15171c] via-transparent to-transparent opacity-60"></div>
                                    <span className="absolute top-3 left-3 bg-rose-600/95 text-white font-label-sm text-[10px] uppercase px-2.5 py-0.5 rounded-xs font-bold tracking-wider shadow">
                                        {item.badge || 'KASUS AKTIF'}
                                    </span>
                                    <span className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-xs text-stone-200 text-[10px] font-label-sm px-2 py-0.5 rounded-xs">
                                        {item.readTime || '3 Menit Baca'}
                                    </span>
                                </div>

                                <div className="p-5 flex flex-col flex-1 justify-between">
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] font-label-sm text-stone-400 uppercase mb-1.5">
                                            <span className="text-rose-400 font-bold">
                                                {item.location || 'SAN ANDREAS METRO'}
                                            </span>
                                            <span>{item.date}</span>
                                        </div>
                                        <Link href={route('dailyglobe.show', item.slug)}>
                                            <h3 className="font-headline text-lg sm:text-xl text-white group-hover:text-rose-400 transition-colors font-bold leading-snug mb-2">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs sm:text-sm text-stone-400 line-clamp-3 leading-relaxed">
                                            {item.excerpt}
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-4 flex items-center justify-between text-xs border-t border-white/10">
                                        <span className="text-stone-400 font-medium truncate pr-2">
                                            {item.author} • <span className="text-stone-500">{item.authorRole}</span>
                                        </span>
                                        <Link
                                            href={route('dailyglobe.show', item.slug)}
                                            className="text-amber-400 font-label-sm uppercase font-bold group-hover:translate-x-1 transition-transform inline-flex items-center shrink-0"
                                        >
                                            BACA →
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ========================================================= */}
                {/* 6. SECTION: OTOMOTIF, PEDESAAN & POJOK WARGA              */}
                {/* ========================================================= */}
                <section className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left 7 Cols: Otomotif & Warta Pedesaan */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">tune</span>
                                    </span>
                                    <div>
                                        <h2 className="font-headline text-xl sm:text-2xl text-white font-bold">
                                            Otomotif, Bisnis &amp; Lintas Pedesaan
                                        </h2>
                                        <p className="text-xs text-stone-400">
                                            Kultur modifikasi, regulasi jalan raya, dan dinamika ekonomi county
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('otomotif')}
                                    className="text-xs font-label-sm uppercase text-amber-400 hover:underline font-bold cursor-pointer hidden sm:inline"
                                >
                                    Kanal Otomotif →
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[...tuningArticles, ...ruralAndOpinionArticles.slice(0, 1)].map((item) => (
                                    <article
                                        key={item.id}
                                        className="bg-[#15171c] border border-white/10 hover:border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center shadow-md transition group"
                                    >
                                        <div className="w-full sm:w-48 aspect-video sm:aspect-[4/3] shrink-0 bg-black rounded-lg overflow-hidden relative">
                                            <img
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                src={item.image}
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80';
                                                }}
                                            />
                                            <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-amber-300 text-[10px] font-label-sm uppercase px-2 py-0.5 rounded-xs font-bold">
                                                {item.badge || item.categoryLabel}
                                            </span>
                                        </div>

                                        <div className="flex flex-col flex-1 justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 text-[11px] font-label-sm text-stone-400 uppercase mb-1">
                                                    <span className="text-amber-400 font-bold">{item.categoryLabel}</span>
                                                    <span>•</span>
                                                    <span>{item.date}</span>
                                                </div>
                                                <Link href={route('dailyglobe.show', item.slug)}>
                                                    <h3 className="font-headline text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors font-bold leading-snug">
                                                        {item.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-xs sm:text-sm text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                                                    {item.excerpt}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs">
                                                <span className="text-stone-400">
                                                    Oleh: <strong className="text-stone-200">{item.author}</strong>
                                                </span>
                                                <Link
                                                    href={route('dailyglobe.show', item.slug)}
                                                    className="text-rose-400 hover:text-rose-300 font-label-sm uppercase font-bold"
                                                >
                                                    Baca Artikel →
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* Right 5 Cols: Pojok Warga, Opini & Bulletin Board */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                                    </span>
                                    <div>
                                        <h2 className="font-headline text-xl sm:text-2xl text-white font-bold">
                                            Pojok Warga &amp; Maklumat Kota
                                        </h2>
                                        <p className="text-xs text-stone-400">
                                            Opini publik, bursa lowongan IC, dan indeks kerawanan jalur
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#15171c] border border-white/10 rounded-xl p-5 space-y-4 shadow-lg">
                                {/* Editorial Opinion Highlight */}
                                {sourceArticles
                                    .filter((a) => a.category === 'opini')
                                    .slice(0, 1)
                                    .map((op) => (
                                        <div
                                            key={op.id}
                                            className="bg-[#1c1f26] border border-amber-500/30 rounded-lg p-4 space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-label-sm uppercase px-2 py-0.5 rounded font-bold">
                                                    KOLOM OPINI PILIHAN
                                                </span>
                                                <span className="text-[11px] text-stone-400">{op.readTime}</span>
                                            </div>
                                            <Link href={route('dailyglobe.show', op.slug)}>
                                                <h4 className="font-headline text-lg text-white hover:text-amber-300 font-bold leading-snug transition">
                                                    {op.title}
                                                </h4>
                                            </Link>
                                            <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                                                {op.excerpt}
                                            </p>
                                            <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                                                <span className="text-stone-400 italic">{op.author}</span>
                                                <Link
                                                    href={route('dailyglobe.show', op.slug)}
                                                    className="text-amber-400 font-bold hover:underline"
                                                >
                                                    Baca Opini →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                {/* Lowongan IC Card */}
                                <div className="bg-[#1b1e25] border border-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="bg-rose-600 text-white text-[10px] font-label-sm uppercase px-2 py-0.5 rounded-xs font-bold">
                                            REKRUTMEN TERBUKA
                                        </span>
                                        <span className="text-[11px] font-label-sm text-emerald-400 font-bold">
                                            GAJI &amp; KOMISI KOMPETITIF
                                        </span>
                                    </div>
                                    <h4 className="font-headline text-base sm:text-lg text-white font-bold">
                                        Maitri Company &amp; The Daily Globes Membuka Lowongan Kru Baru
                                    </h4>
                                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                                        Dibutuhkan Jurnalis Investigasi, Fotografer Lapangan, Dispatcher Armada, serta Mekanik Otomotif. Daftar langsung melalui Portal Warga Maitri.
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center gap-1 text-xs font-label-sm uppercase text-rose-400 hover:text-rose-300 font-bold"
                                        >
                                            <span>Melamar via Portal Karir</span>
                                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Surat Pembaca */}
                                <div className="bg-[#1b1e25] border border-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="bg-white/10 text-stone-200 text-[10px] font-label-sm uppercase px-2 py-0.5 rounded-xs font-bold">
                                            SUARA PENGEMUDI
                                        </span>
                                        <span className="text-[11px] font-label-sm text-stone-400">SURAT PEMBACA</span>
                                    </div>
                                    <h4 className="font-headline text-base text-white font-bold">
                                        &ldquo;Jalur Fallow Bridge Gelap Gulita Saat Kabut Turun, Mohon Lampu Sorot Tambahan&rdquo;
                                    </h4>
                                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                                        Keluhan asosiasi pengemudi truk lintas kota terhadap minimnya rambu suar di jembatan perbatasan Red County pada jam rawan dini hari.
                                    </p>
                                </div>

                                {/* Indeks Kerawanan Wilayah */}
                                <div className="bg-[#101216] p-4 rounded-lg flex items-center justify-between border border-rose-500/30">
                                    <div>
                                        <p className="text-[10px] font-label-sm uppercase tracking-wider text-stone-400">
                                            STATUS KEAMANAN JALUR MALAM
                                        </p>
                                        <p className="font-headline text-lg text-amber-400 font-bold mt-0.5">
                                            WASPADA PERAMPOKAN KARGO
                                        </p>
                                        <p className="text-xs text-stone-400">Ruas Tol Flint County — Las Venturas</p>
                                    </div>
                                    <div className="text-right shrink-0 pl-3">
                                        <span className="font-headline text-3xl text-rose-500 font-black block leading-none">
                                            89%
                                        </span>
                                        <span className="text-[10px] font-label-sm text-stone-400 uppercase">
                                            INDEKS RAWAN
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================= */}
                {/* 7. PRINT ARCHIVE SUBSCRIPTION BANNER                      */}
                {/* ========================================================= */}
                <section className="bg-gradient-to-r from-[#181b22] via-[#1d1920] to-[#181b22] rounded-2xl p-6 sm:p-8 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">newspaper</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-label-sm uppercase tracking-widest text-amber-400 font-bold">
                                DISTRIBUSI NEGARA BAGIAN SAN ANDREAS
                            </span>
                            <h3 className="font-headline text-xl sm:text-2xl text-white font-bold mt-0.5">
                                Langganan Lembaran Cetak &amp; Kawat Pers ‘The Daily Globes’
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
                                Dapatkan edisi cetak mingguan di kios koran Los Santos, kantor pos Angel Pine, atau pantau pembaruan berita langsung melalui kanal Discord komunitas.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                        <a
                            href={discordUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto text-center bg-rose-600 hover:bg-rose-500 text-white font-label-md text-xs uppercase tracking-wider px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-rose-600/25"
                        >
                            Gabung Discord Komunitas
                        </a>
                        <button
                            type="button"
                            onClick={() => setTipLineModalOpen(true)}
                            className="w-full sm:w-auto text-center bg-white/10 hover:bg-white/15 text-white font-label-md text-xs uppercase tracking-wider px-4 py-3 rounded-xl font-bold transition cursor-pointer"
                        >
                            Kirim Opini / Berita
                        </button>
                    </div>
                </section>
            </main>

            {/* ========================================================= */}
            {/* 8. BROADSHEET TABLOID FOOTER                              */}
            {/* ========================================================= */}
            <footer className="w-full bg-[#090a0d] border-t border-white/10 text-stone-400 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
                        {/* Col 1 */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="material-symbols-outlined text-rose-500 text-2xl">newspaper</span>
                                <h4 className="font-headline text-xl text-white font-bold">The Daily Globes</h4>
                            </div>
                            <p className="text-xs text-stone-400 leading-relaxed mb-4">
                                PT Daily Globe Media Nusantara / San Andreas Publishing Corp. Pers investigasi independen yang menyajikan dinamika kriminalitas, birokrasi, dan kehidupan jalanan di seluruh San Andreas.
                            </p>
                            <div className="flex items-center gap-2">
                                <a
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-rose-600/20 border border-white/10 text-stone-200 hover:text-rose-400 transition flex items-center justify-center"
                                    href={discordUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    title="Discord"
                                >
                                    <span className="material-symbols-outlined text-[18px]">forum</span>
                                </a>
                                <a
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 text-stone-200 hover:text-amber-400 transition flex items-center justify-center"
                                    href={centralUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    title="Central Archive"
                                >
                                    <span className="material-symbols-outlined text-[18px]">public</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setTipLineModalOpen(true)}
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-rose-600/20 border border-white/10 text-stone-200 hover:text-rose-400 transition flex items-center justify-center cursor-pointer"
                                    title="Hotline Redaksi"
                                >
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                </button>
                            </div>
                        </div>

                        {/* Col 2 */}
                        <div>
                            <h5 className="font-label-lg text-xs uppercase tracking-wider text-white font-bold mb-3 border-l-2 border-rose-600 pl-2.5">
                                Rubrik &amp; Kanal Utama
                            </h5>
                            <ul className="space-y-2 text-xs">
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="hover:text-rose-400 transition cursor-pointer text-left flex items-center gap-1.5"
                                        >
                                            <span className="text-stone-600">›</span>
                                            <span>{cat.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3 */}
                        <div>
                            <h5 className="font-label-lg text-xs uppercase tracking-wider text-white font-bold mb-3 border-l-2 border-amber-500 pl-2.5">
                                Dewan Redaksi &amp; Biro
                            </h5>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <span className="text-stone-200 font-semibold">Redaktur Pelaksana:</span>{' '}
                                    <span>Raymond &ldquo;Gull&rdquo; Vance</span>
                                </li>
                                <li>
                                    <span className="text-stone-200 font-semibold">Biro Los Santos:</span>{' '}
                                    <span>Market &amp; Rodeo Media Tower</span>
                                </li>
                                <li>
                                    <span className="text-stone-200 font-semibold">Biro Pedesaan:</span>{' '}
                                    <span>Angel Pine &amp; Flint County</span>
                                </li>
                                <li>
                                    <span className="text-stone-200 font-semibold">Induk Korporasi:</span>{' '}
                                    <Link href="/" className="text-cyan-400 hover:underline">
                                        Maitri Company Group
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4 */}
                        <div>
                            <h5 className="font-label-lg text-xs uppercase tracking-wider text-white font-bold mb-3 border-l-2 border-stone-500 pl-2.5">
                                Maklumat Roleplay (IC)
                            </h5>
                            <p className="text-xs text-stone-400 leading-relaxed bg-[#12141a] p-3.5 rounded-lg border border-white/10">
                                Seluruh artikel, nama tokoh, peristiwa kriminal, dan instansi dalam portal ini adalah karya fiksi <strong className="text-stone-200">In-Character (IC)</strong> untuk komunitas Roleplay San Andreas.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
                        <p>© 2026 The Daily Globes • Bagian dari Ekosistem Maitri Company San Andreas.</p>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="hover:text-stone-300 transition">
                                Beranda Maitri
                            </Link>
                            <span>•</span>
                            <a
                                className="text-[#5865F2] hover:underline font-semibold"
                                href={discordUrl}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Discord Pers Resmi
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ========================================================= */}
            {/* MODAL: WHISTLEBLOWER & TIP LINE FORM                      */}
            {/* ========================================================= */}
            {tipLineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#16181f] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setTipLineModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition flex items-center justify-center"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-2 mb-1 text-rose-400">
                            <span className="material-symbols-outlined text-[20px]">campaign</span>
                            <span className="font-label-sm text-xs uppercase font-bold tracking-widest">
                                WHISTLEBLOWER HOTLINE REDAKSI
                            </span>
                        </div>
                        <h3 className="font-headline text-2xl text-white font-bold mb-1">
                            Kirim Bukti &amp; Tip Anonim
                        </h3>
                        <p className="text-xs text-stone-400 mb-5 leading-relaxed">
                            Kerahasiaan identitas saksi dan pelapor dijamin sepenuhnya di bawah perlindungan kode etik jurnalistik The Daily Globes San Andreas.
                        </p>

                        {tipSubmitted ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-2">
                                    verified
                                </span>
                                <p className="text-base text-white font-bold">Laporan Berhasil Diteruskan!</p>
                                <p className="text-xs text-stone-300 mt-1">
                                    Meja redaksi investigasi akan segera memverifikasi informasi yang Anda kirimkan.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleTipSubmit} className="space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-label-sm text-stone-300 uppercase block mb-1 font-bold">
                                            Nama Samaran / Inisial
                                        </label>
                                        <input
                                            type="text"
                                            value={tipForm.name}
                                            onChange={(e) => setTipForm({ ...tipForm, name: e.target.value })}
                                            placeholder="Anonim / J. Doe"
                                            className="w-full bg-[#101217] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-label-sm text-stone-300 uppercase block mb-1 font-bold">
                                            Kontak IC / Frekuensi
                                        </label>
                                        <input
                                            type="text"
                                            value={tipForm.phone}
                                            onChange={(e) => setTipForm({ ...tipForm, phone: e.target.value })}
                                            placeholder="#555-0192"
                                            className="w-full bg-[#101217] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-label-sm text-stone-300 uppercase block mb-1 font-bold">
                                            Lokasi Kejadian
                                        </label>
                                        <input
                                            type="text"
                                            value={tipForm.location}
                                            onChange={(e) => setTipForm({ ...tipForm, location: e.target.value })}
                                            placeholder="Flint County / Rodeo"
                                            className="w-full bg-[#101217] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-label-sm text-stone-300 uppercase block mb-1 font-bold">
                                            Kategori Perkara
                                        </label>
                                        <select
                                            value={tipForm.category}
                                            onChange={(e) => setTipForm({ ...tipForm, category: e.target.value })}
                                            className="w-full bg-[#101217] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
                                        >
                                            <option value="kriminal">Kriminalitas &amp; Perampokan</option>
                                            <option value="otomotif">Modifikasi &amp; Balap Liar</option>
                                            <option value="pedesaan">Penyelundupan Pedesaan</option>
                                            <option value="korupsi">Penyalahgunaan Wewenang</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-label-sm text-stone-300 uppercase block mb-1 font-bold">
                                        Rincian Informasi / Kronologi *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={tipForm.details}
                                        onChange={(e) => setTipForm({ ...tipForm, details: e.target.value })}
                                        placeholder="Jelaskan kronologi, ciri-ciri kendaraan, nomor pelat, atau bukti di lapangan..."
                                        className="w-full bg-[#101217] border border-white/15 rounded-lg p-3 text-xs text-white focus:border-rose-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setTipLineModalOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-label-sm uppercase font-bold transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-label-sm uppercase font-bold tracking-wider transition cursor-pointer shadow-md"
                                    >
                                        Kirim ke Redaksi
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <DailyGlobeRadioPlayer initialBroadcast={radioBroadcast} />
        </div>
    );
}
