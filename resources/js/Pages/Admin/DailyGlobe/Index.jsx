import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ArticleEditorModal from './Components/ArticleEditorModal';
import PortalSettingsModal from './Components/PortalSettingsModal';

export default function DailyGlobeAdminIndex({
    articles = [],
    settings = {},
    defaultLayoutSettings = {},
    stats = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [isPortalSettingsOpen, setIsPortalSettingsOpen] = useState(false);

    const categories = settings.categories || [
        { id: 'all', name: 'Semua Rubrik', icon: 'home' },
        { id: 'investigasi', name: 'Investigasi Khusus', icon: 'policy' },
        { id: 'kriminal', name: 'Kriminal & Hukum', icon: 'local_police' },
        { id: 'otomotif', name: 'Otomotif & Bisnis', icon: 'tune' },
        { id: 'pedesaan', name: 'Pedesaan (Flint & Bone)', icon: 'forest' },
        { id: 'opini', name: 'Opini & Warga', icon: 'record_voice_over' },
        { id: 'edisi-cetak', name: 'Edisi Cetak', icon: 'menu_book' },
    ];

    const handleCreateArticle = () => {
        setEditingArticle(null);
        setIsEditorOpen(true);
    };

    const handleEditArticle = (article) => {
        setEditingArticle(article);
        setIsEditorOpen(true);
    };

    const handleDeleteArticle = (article) => {
        if (confirm(`Apakah Anda yakin ingin menghapus artikel '${article.title}'?`)) {
            router.delete(route('admin.daily-globe.articles.destroy', article.id));
        }
    };

    const handleToggleFeatured = (article) => {
        router.patch(route('admin.daily-globe.articles.toggle-featured', article.id));
    };

    const handleTogglePublish = (article) => {
        router.patch(route('admin.daily-globe.articles.toggle-publish', article.id));
    };

    const handleFilterChange = (newParams) => {
        router.get(
            route('admin.daily-globe.index'),
            {
                ...filters,
                ...newParams,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    return (
        <AdminLayout activeMenu="daily-globe">
            <Head title="Redaksi The Daily Globes - Admin Console" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. TOP HEADER BANNER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                                Meja Redaksi &amp; Publikasi Pers
                            </span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                                {settings.edition_meta?.volume || 'Vol. XLVIII'} • {settings.edition_date}
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Konsol Redaksi The Daily Globes
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Kelola seluruh artikel berita, susun tata letak paragraf kustom (1-2 kolom, Drop-Cap, kutipan saksi, bukti foto), serta atur ticker Breaking News, cuaca distrik, dan bursa kargo.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center shrink-0">
                        <Link
                            href={route('dailyglobe.index')}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            <span>Lihat Portal Publik</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsPortalSettingsOpen(true)}
                            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-amber-600">tune</span>
                            <span>Pengaturan Koran &amp; Ticker</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateArticle}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-rose-600/30 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_notes</span>
                            <span>+ Tulis Artikel Baru</span>
                        </button>
                    </div>
                </div>

                {/* 2. KPI SUMMARY CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total Artikel</span>
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">newspaper</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {stats.total_articles || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Arsip berita di database</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-emerald-600 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Diterbitkan</span>
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                            {stats.published_count || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Tayang di halaman publik</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-amber-600 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Draft Redaksi</span>
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                            {stats.draft_count || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Disimpan / belum rilis</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-rose-600 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Headline Utama</span>
                            <span className="material-symbols-outlined text-[20px]">star</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                            {stats.featured_count || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Lead Investigation aktif</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between text-brand-600 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pembaca</span>
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {(stats.total_views || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Akumulasi tayangan artikel</div>
                    </div>
                </div>

                {/* 3. FILTER & SEARCH BAR */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                            {categories.map((cat) => {
                                const isActive = (filters.category || 'all') === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleFilterChange({ category: cat.id })}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                                            isActive
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status & Search */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <select
                                value={filters.status || 'all'}
                                onChange={(e) => handleFilterChange({ status: e.target.value })}
                                className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 py-2 pl-3 pr-8"
                            >
                                <option value="all">Semua Status</option>
                                <option value="published">Tayang (Published)</option>
                                <option value="draft">Draft</option>
                                <option value="featured">Headline Utama</option>
                            </select>

                            <form onSubmit={handleSearchSubmit} className="relative flex items-center flex-1 sm:flex-initial">
                                <span className="material-symbols-outlined text-slate-400 text-[18px] absolute left-3">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul, penulis, lokasi..."
                                    className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:ring-rose-500"
                                />
                            </form>
                        </div>
                    </div>
                </div>

                {/* 4. ARTICLES MANAGEMENT LIST */}
                <div className="space-y-4">
                    {articles.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">newspaper</span>
                            <h3 className="text-base font-bold text-slate-800">Belum Ada Artikel Ditemukan</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Klik tombol &ldquo;+ Tulis Artikel Baru&rdquo; untuk membuat berita pertama Anda.
                            </p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div
                                key={article.id}
                                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                                    article.featured
                                        ? 'border-rose-300 ring-1 ring-rose-500/20 bg-rose-50/10'
                                        : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                {/* Left: Thumbnail & Core Info */}
                                <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                                    <div className="w-full sm:w-44 aspect-video rounded-xl bg-slate-900 overflow-hidden shrink-0 relative border border-slate-200">
                                        {article.image ? (
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                                No Image
                                            </div>
                                        )}
                                        {article.featured && (
                                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                                                ★ HEADLINE UTAMA
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                    article.isPublished
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}
                                            >
                                                {article.isPublished ? 'Tayang' : 'Draft'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                                {article.categoryLabel || article.category}
                                            </span>
                                            {article.badge && (
                                                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold uppercase">
                                                    {article.badge}
                                                </span>
                                            )}
                                            <span className="text-[11px] text-slate-400">
                                                • {article.contentBlocks?.length || 1} Blok Paragraf
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                • Layout: {article.layoutSettings?.font_style === 'classic_serif' ? 'Serif Klasik' : 'Modern Sans'}
                                            </span>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                                            {article.title}
                                        </h3>

                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">
                                                    person
                                                </span>
                                                {article.author} ({article.authorRole})
                                            </span>
                                            {article.location && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px] text-rose-500">
                                                        location_on
                                                    </span>
                                                    {article.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">
                                                    calendar_today
                                                </span>
                                                {article.date} ({article.time})
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">
                                                    visibility
                                                </span>
                                                {article.views} views
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Action Controls */}
                                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleFeatured(article)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                                            article.featured
                                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                        title="Jadikan / Cabut Headline Utama"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {article.featured ? 'star' : 'star_outline'}
                                        </span>
                                        <span>{article.featured ? 'Headline Aktif' : 'Set Headline'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(article)}
                                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {article.isPublished ? 'visibility_off' : 'publish'}
                                        </span>
                                        <span>{article.isPublished ? 'Ke Draft' : 'Terbitkan'}</span>
                                    </button>

                                    <Link
                                        href={route('dailyglobe.show', article.slug)}
                                        target="_blank"
                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center"
                                        title="Pratinjau Halaman Baca"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleEditArticle(article)}
                                        className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit_document</span>
                                        <span>Edit &amp; Layout</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteArticle(article)}
                                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center cursor-pointer"
                                        title="Hapus Artikel"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODALS */}
            <ArticleEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                article={editingArticle}
                categories={categories}
                defaultLayoutSettings={defaultLayoutSettings}
            />

            <PortalSettingsModal
                isOpen={isPortalSettingsOpen}
                onClose={() => setIsPortalSettingsOpen(false)}
                settings={settings}
            />
        </AdminLayout>
    );
}

