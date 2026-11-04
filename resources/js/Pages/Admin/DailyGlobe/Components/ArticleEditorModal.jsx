import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';

const BLOCK_TYPES = [
    { id: 'paragraph', label: 'Paragraf Teks', icon: 'notes', desc: 'Paragraf cerita standar (1 atau 2 kolom, Drop-Cap)' },
    { id: 'heading', label: 'Sub-Judul / Bab', icon: 'title', desc: 'Pemisah bab atau sub-bagian laporan' },
    { id: 'quote', label: 'Kutipan Saksi (Pull-Quote)', icon: 'format_quote', desc: 'Kotak kutipan narasumber bergaya tabloid' },
    { id: 'image', label: 'Foto Bukti / Dokumentasi', icon: 'add_a_photo', desc: 'Sisipkan foto bukti sekunder dengan caption' },
    { id: 'callout', label: 'Kotak Maklumat / Catatan', icon: 'campaign', desc: 'Kotak peringatan SAPD, fakta kunci, atau info penting' },
    { id: 'ad', label: 'Slot Iklan / Sponsor', icon: 'featured_seasonal_and_gifts', desc: 'Iklan koran elegan (dengan/tanpa gambar & URL klik)' },
    { id: 'divider', label: 'Garis Pemisah Editor', icon: 'horizontal_rule', desc: 'Garis dekoratif pemisah bagian cerita' },
];

export default function ArticleEditorModal({ isOpen, onClose, article = null, categories = [], defaultLayoutSettings = {} }) {
    const isEditing = Boolean(article?.id);
    const [activeTab, setActiveTab] = useState('meta'); // 'meta' | 'blocks' | 'layout' | 'preview'

    const initialLayout = {
        drop_cap: true,
        columns: 1,
        text_align: 'left',
        font_style: 'editorial_sans',
        header_style: 'standard',
        image_filter: 'none',
        show_authority_box: false,
        authority_badge: 'MAKLUMAT OTORITAS & REDAKSI',
        authority_title: '',
        authority_body: '',
        enable_comments: true,
        ...defaultLayoutSettings,
        ...(article?.layoutSettings || {}),
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: article?.title || '',
        short_title: article?.shortTitle || '',
        slug: article?.slug || '',
        subtitle: article?.subtitle || '',
        excerpt: article?.excerpt || '',
        content: article?.content || '',
        content_blocks: article?.contentBlocks?.length > 0 ? article.contentBlocks : [
            {
                id: 'blk_1',
                type: 'paragraph',
                text: '',
                dropCap: true,
                columns: 1,
                align: 'left',
                highlight: false,
            },
        ],
        layout_settings: initialLayout,
        category: article?.category || 'investigasi',
        category_label: article?.categoryLabel || 'Investigasi Khusus',
        badge: article?.badge || 'Liputan Khusus',
        location: article?.location || 'Los Santos, San Andreas',
        author: article?.author || 'Raymond "Gull" Vance',
        author_role: article?.authorRole || 'Kepala Desk Investigasi',
        published_date: article?.date || '24 Oktober 2026',
        published_time: article?.time || '21:00 SAST',
        read_time: article?.readTime || '4 Menit Baca',
        views_count: article?.viewsCount ?? 150,
        image: article?.image || '',
        image_caption: article?.imageCaption || '',
        secondary_image: article?.secondaryImage || '',
        secondary_caption: article?.secondaryCaption || '',
        quote: article?.quote || '',
        quote_author: article?.quoteAuthor || '',
        metrics: article?.metrics || [],
        is_featured: Boolean(article?.featured),
        is_published: article ? Boolean(article.isPublished) : true,
        sort_order: article?.sortOrder ?? 1,
    });

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab('meta');
        if (article) {
            setData({
                title: article.title || '',
                short_title: article.shortTitle || '',
                slug: article.slug || '',
                subtitle: article.subtitle || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                content_blocks:
                    article.contentBlocks && article.contentBlocks.length > 0
                        ? article.contentBlocks
                        : [
                              {
                                  id: 'blk_1',
                                  type: 'paragraph',
                                  text: article.content || article.excerpt || '',
                                  dropCap: true,
                                  columns: 1,
                                  align: 'left',
                                  highlight: false,
                              },
                          ],
                layout_settings: {
                    ...initialLayout,
                    ...(article.layoutSettings || {}),
                },
                category: article.category || 'investigasi',
                category_label: article.categoryLabel || 'Investigasi Khusus',
                badge: article.badge || 'Liputan Khusus',
                location: article.location || 'San Andreas',
                author: article.author || 'Raymond "Gull" Vance',
                author_role: article.authorRole || 'Jurnalis Investigasi',
                published_date: article.date || '24 Oktober 2026',
                published_time: article.time || '21:00 SAST',
                read_time: article.readTime || '4 Menit Baca',
                views_count: article.viewsCount ?? 150,
                image: article.image || '',
                image_caption: article.imageCaption || '',
                secondary_image: article.secondaryImage || '',
                secondary_caption: article.secondaryCaption || '',
                quote: article.quote || '',
                quote_author: article.quoteAuthor || '',
                metrics: article.metrics || [],
                is_featured: Boolean(article.featured),
                is_published: Boolean(article.isPublished ?? true),
                sort_order: article.sortOrder ?? 1,
            });
        } else {
            reset();
        }
    }, [article, isOpen]);

    if (!isOpen) return null;

    // Category change helper
    const handleCategoryChange = (catId) => {
        const found = categories.find((c) => c.id === catId);
        setData((prev) => ({
            ...prev,
            category: catId,
            category_label: found ? found.name : prev.category_label,
        }));
    };

    // Content Blocks Manipulation
    const addBlock = (type) => {
        const newBlock = {
            id: 'blk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            type,
            text: '',
            title:
                type === 'callout'
                    ? 'CATATAN PENTING REDAKSI'
                    : type === 'ad'
                    ? 'Layanan Sewa Armada Truk & Desain Interior Maitri Company'
                    : '',
            author: type === 'quote' ? 'Narasumber Lapangan' : '',
            sponsor: type === 'ad' ? 'Maitri Company Group' : '',
            url: '',
            ctaText: type === 'ad' ? 'Info Selengkapnya' : '',
            adStyle: 'compact_card', // 'compact_card' | 'classified' | 'banner_split'
            caption: '',
            badge:
                type === 'image'
                    ? 'BUKTI DOKUMENTASI'
                    : type === 'ad'
                    ? 'IKLAN SPONSOR'
                    : 'MAKLUMAT',
            dropCap: data.content_blocks.length === 0 && type === 'paragraph',
            columns: 1,
            align: 'left',
            highlight: false,
            tone: 'primary', // 'primary' (rose) | 'amber' | 'police'
        };
        setData('content_blocks', [...data.content_blocks, newBlock]);
    };

    const updateBlock = (index, field, value) => {
        const updated = [...data.content_blocks];
        updated[index] = { ...updated[index], [field]: value };
        setData('content_blocks', updated);
    };

    const removeBlock = (index) => {
        const updated = data.content_blocks.filter((_, idx) => idx !== index);
        setData('content_blocks', updated);
    };

    const moveBlock = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= data.content_blocks.length) return;
        const updated = [...data.content_blocks];
        const temp = updated[index];
        updated[index] = updated[target];
        updated[target] = temp;
        setData('content_blocks', updated);
    };

    // Metrics Manipulation
    const addMetric = () => {
        setData('metrics', [...(data.metrics || []), { label: '', value: '', desc: '' }]);
    };

    const updateMetric = (index, field, val) => {
        const updated = [...(data.metrics || [])];
        updated[index] = { ...updated[index], [field]: val };
        setData('metrics', updated);
    };

    const removeMetric = (index) => {
        setData(
            'metrics',
            (data.metrics || []).filter((_, i) => i !== index)
        );
    };

    // Layout Setting helper
    const updateLayoutSetting = (key, val) => {
        setData('layout_settings', {
            ...data.layout_settings,
            [key]: val,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.daily-globe.articles.update', article.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('admin.daily-globe.articles.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    const selectableCategories = categories.filter((c) => c.id !== 'all');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[22px]">newspaper</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block">
                                STUDIO REDAKSI THE DAILY GLOBES
                            </span>
                            <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                                {isEditing ? `Edit Artikel: ${article.title}` : 'Tulis & Rancang Artikel Berita Baru'}
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

                {/* Step / Section Tabs */}
                <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
                    {[
                        { id: 'meta', label: '1. Informasi & Headline', icon: 'article' },
                        { id: 'blocks', label: `2. Susunan Paragraf & Blok (${data.content_blocks.length})`, icon: 'view_agenda' },
                        { id: 'layout', label: '3. Kustomisasi Layout & Visual', icon: 'dashboard_customize' },
                        { id: 'preview', label: '4. Live Preview Artikel', icon: 'visibility' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-white text-rose-600 border-rose-600 shadow-2xs'
                                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modal Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* ========================================================= */}
                    {/* TAB 1: HEADLINE, METADATA & MEDIA                         */}
                    {/* ========================================================= */}
                    {activeTab === 'meta' && (
                        <div className="space-y-6">
                            {/* Title & Subtitle */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                <div className="lg:col-span-8">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Judul Utama Berita (Headline) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Operasi Terpadu Lintas Palomino: Aparat Tertibkan Ekspedisi Liar..."
                                        className="w-full rounded-xl border-slate-300 text-sm font-semibold focus:border-rose-600 focus:ring-rose-600"
                                    />
                                    {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
                                </div>

                                <div className="lg:col-span-4">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Label Stempel / Badge Atas
                                    </label>
                                    <input
                                        type="text"
                                        value={data.badge}
                                        onChange={(e) => setData('badge', e.target.value)}
                                        placeholder="Contoh: Liputan Khusus / Kasus #882"
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Sub-Judul / Deck Editorial
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                        placeholder="Kalimat penegas di bawah judul utama..."
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Lokasi Kejadian (Dateline IC)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Contoh: Flint County Route 89 / Rodeo, Los Santos"
                                        className="w-full rounded-xl border-slate-300 text-sm focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Ringkasan Berita (Lead Excerpt di Halaman Utama) *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="Tulis 1-2 kalimat ringkasan pembuka yang menarik perhatian pembaca di halaman depan..."
                                    className="w-full rounded-xl border-slate-300 text-sm focus:border-rose-600 focus:ring-rose-600"
                                />
                                {errors.excerpt && <p className="text-xs text-rose-600 mt-1">{errors.excerpt}</p>}
                            </div>

                            {/* Category, Author & Publish Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Kanal / Rubrik *
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-xs font-semibold focus:border-rose-600 focus:ring-rose-600"
                                    >
                                        {selectableCategories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nama Jurnalis / Penulis *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.author}
                                        onChange={(e) => setData('author', e.target.value)}
                                        placeholder="Raymond 'Gull' Vance"
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Jabatan / Biro Jurnalis
                                    </label>
                                    <input
                                        type="text"
                                        value={data.author_role}
                                        onChange={(e) => setData('author_role', e.target.value)}
                                        placeholder="Kepala Biro Flint County"
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Estimasi Waktu Baca
                                    </label>
                                    <input
                                        type="text"
                                        value={data.read_time}
                                        onChange={(e) => setData('read_time', e.target.value)}
                                        placeholder="4 Menit Baca"
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Tanggal Terbit (IC)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.published_date}
                                        onChange={(e) => setData('published_date', e.target.value)}
                                        placeholder="24 Oktober 2026"
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Jam Terbit (SAST)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.published_time}
                                        onChange={(e) => setData('published_time', e.target.value)}
                                        placeholder="22:15 SAST"
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Urutan Tampil (Sort Order)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 0)}
                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                    />
                                </div>

                                <div className="flex flex-col justify-center gap-2 pt-2">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Jadikan Headline Utama (Lead)
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Publikasikan Sekarang
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Hero Image & Caption */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                <div className="lg:col-span-8 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            URL Foto Utama (Hero Evidence Photo)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.image}
                                            onChange={(e) => setData('image', e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Caption / Keterangan Foto Utama
                                        </label>
                                        <input
                                            type="text"
                                            value={data.image_caption}
                                            onChange={(e) => setData('image_caption', e.target.value)}
                                            placeholder="DOKUMENTASI EKSKLUSIF: Tampak muka fasilitas saat operasi berlangsung..."
                                            className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-4">
                                    <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {data.image ? (
                                            <img
                                                src={data.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400 flex flex-col items-center gap-1">
                                                <span className="material-symbols-outlined text-2xl">image</span>
                                                Preview Foto Utama
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 2: FULL CUSTOM PARAGRAPH & CONTENT BLOCK BUILDER      */}
                    {/* ========================================================= */}
                    {activeTab === 'blocks' && (
                        <div className="space-y-6">
                            {/* Toolbar to Add New Block */}
                            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block">
                                            PARAGRAPH &amp; EDITORIAL BLOCK BUILDER
                                        </span>
                                        <h3 className="text-sm font-bold">
                                            Susun Struktur Paragraf, Bab, Kutipan Saksi, dan Bukti Foto Sesuai Keinginan
                                        </h3>
                                    </div>
                                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-semibold">
                                        {data.content_blocks.length} Blok Aktif
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {BLOCK_TYPES.map((bt) => (
                                        <button
                                            key={bt.id}
                                            type="button"
                                            onClick={() => addBlock(bt.id)}
                                            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-left transition flex flex-col justify-between group cursor-pointer border border-white/10"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="material-symbols-outlined text-[18px] text-rose-400 group-hover:text-white">
                                                    {bt.icon}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase bg-white/10 px-1.5 py-0.5 rounded">
                                                    + Tambah
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold leading-snug">{bt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Blocks List */}
                            <div className="space-y-4">
                                {data.content_blocks.map((block, index) => (
                                    <div
                                        key={block.id || index}
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-3"
                                    >
                                        {/* Block Header Controls */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                                    {BLOCK_TYPES.find((b) => b.id === block.type)?.label || block.type}
                                                </span>
                                            </div>

                                            {/* Per-Block Layout Controls for Paragraph */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {block.type === 'paragraph' && (
                                                    <>
                                                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(block.dropCap)}
                                                                onChange={(e) => updateBlock(index, 'dropCap', e.target.checked)}
                                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                                            />
                                                            <span>Huruf Awal Besar (Drop-Cap)</span>
                                                        </label>

                                                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(block.highlight)}
                                                                onChange={(e) => updateBlock(index, 'highlight', e.target.checked)}
                                                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                            />
                                                            <span>Sorot Paragraf (Highlight Box)</span>
                                                        </label>

                                                        <select
                                                            value={block.columns || 1}
                                                            onChange={(e) => updateBlock(index, 'columns', parseInt(e.target.value, 10))}
                                                            className="rounded-lg border-slate-200 text-[11px] font-semibold py-1 pl-2 pr-6 bg-white"
                                                        >
                                                            <option value={1}>Layout 1 Kolom</option>
                                                            <option value={2}>Layout 2 Kolom Koran</option>
                                                        </select>

                                                        <select
                                                            value={block.align || 'left'}
                                                            onChange={(e) => updateBlock(index, 'align', e.target.value)}
                                                            className="rounded-lg border-slate-200 text-[11px] font-semibold py-1 pl-2 pr-6 bg-white"
                                                        >
                                                            <option value="left">Rata Kiri</option>
                                                            <option value="justify">Rata Kanan-Kiri (Justify)</option>
                                                        </select>
                                                    </>
                                                )}

                                                {/* Move Up / Down / Delete */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={index === 0}
                                                        onClick={() => moveBlock(index, -1)}
                                                        className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                                        title="Geser ke Atas"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={index === data.content_blocks.length - 1}
                                                        onClick={() => moveBlock(index, 1)}
                                                        className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                                        title="Geser ke Bawah"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBlock(index)}
                                                        className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                                        title="Hapus Blok Ini"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block Specific Inputs */}
                                        {block.type === 'paragraph' && (
                                            <textarea
                                                rows={4}
                                                value={block.text || ''}
                                                onChange={(e) => updateBlock(index, 'text', e.target.value)}
                                                placeholder="Tuliskan isi paragraf berita di sini..."
                                                className="w-full rounded-xl border-slate-300 text-sm focus:border-rose-600 focus:ring-rose-600"
                                            />
                                        )}

                                        {block.type === 'heading' && (
                                            <input
                                                type="text"
                                                value={block.text || ''}
                                                onChange={(e) => updateBlock(index, 'text', e.target.value)}
                                                placeholder="Contoh: BAB I — ETOS BAWAH TANAH: KERAHASIAAN & KEAHLIAN"
                                                className="w-full rounded-xl border-slate-300 text-sm font-bold focus:border-rose-600 focus:ring-rose-600"
                                            />
                                        )}

                                        {block.type === 'quote' && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        Isi Kutipan Saksi / Narasumber
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={block.text || ''}
                                                        onChange={(e) => updateBlock(index, 'text', e.target.value)}
                                                        placeholder="Kutipan langsung dari wawancara lapangan..."
                                                        className="w-full rounded-xl border-slate-300 text-sm italic focus:border-rose-600 focus:ring-rose-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        Nama / Identitas Narasumber
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={block.author || ''}
                                                        onChange={(e) => updateBlock(index, 'author', e.target.value)}
                                                        placeholder="Mekanik Senior (Anonim)"
                                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'image' && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        URL Gambar / Foto Bukti
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={block.url || ''}
                                                        onChange={(e) => updateBlock(index, 'url', e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        Label Stempel Foto
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={block.badge || ''}
                                                        onChange={(e) => updateBlock(index, 'badge', e.target.value)}
                                                        placeholder="BUKTI INV-02: LOKASI KEJADIAN"
                                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        Caption Foto
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={block.caption || ''}
                                                        onChange={(e) => updateBlock(index, 'caption', e.target.value)}
                                                        placeholder="Penjelasan dokumentasi foto..."
                                                        className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'callout' && (
                                            <div className="space-y-2.5">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Judul Kotak Maklumat / Info
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.title || ''}
                                                            onChange={(e) => updateBlock(index, 'title', e.target.value)}
                                                            placeholder="Contoh: PERNYATAAN OTORITAS KEAMANAN SAPD"
                                                            className="w-full rounded-xl border-slate-300 text-xs font-bold focus:border-rose-600 focus:ring-rose-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Warna Tema Kotak
                                                        </label>
                                                        <select
                                                            value={block.tone || 'primary'}
                                                            onChange={(e) => updateBlock(index, 'tone', e.target.value)}
                                                            className="w-full rounded-xl border-slate-300 text-xs"
                                                        >
                                                            <option value="primary">Merah Investigasi (Darurat)</option>
                                                            <option value="amber">Emas Editorial (Fakta Kunci)</option>
                                                            <option value="police">Biru Otoritas (Maklumat SAPD)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={block.text || ''}
                                                    onChange={(e) => updateBlock(index, 'text', e.target.value)}
                                                    placeholder="Isi maklumat atau catatan penting..."
                                                    className="w-full rounded-xl border-slate-300 text-xs focus:border-rose-600 focus:ring-rose-600"
                                                />
                                            </div>
                                        )}

                                        {block.type === 'ad' && (
                                            <div className="space-y-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px]">featured_seasonal_and_gifts</span>
                                                        Konfigurasi Slot Iklan / Sponsor Native (Ramah Pembaca)
                                                    </span>
                                                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                                                        Gambar &amp; URL Opsional
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Gaya Tampilan Iklan
                                                        </label>
                                                        <select
                                                            value={block.adStyle || 'compact_card'}
                                                            onChange={(e) => updateBlock(index, 'adStyle', e.target.value)}
                                                            className="w-full rounded-xl border-slate-300 text-xs font-semibold bg-white"
                                                        >
                                                            <option value="compact_card">Kartu Sponsor Ringkas (Rekomendasi)</option>
                                                            <option value="classified">Iklan Baris Koran Klasik (Tanpa Gambar)</option>
                                                            <option value="banner_split">Banner Editorial (Gambar + Teks)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Nama Brand / Pengiklan
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.sponsor || ''}
                                                            onChange={(e) => updateBlock(index, 'sponsor', e.target.value)}
                                                            placeholder="Mis: Maitri Hauling & Interior"
                                                            className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Label Kecil Iklan
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.badge || 'IKLAN SPONSOR'}
                                                            onChange={(e) => updateBlock(index, 'badge', e.target.value)}
                                                            placeholder="IKLAN SPONSOR / PARIWARA"
                                                            className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Judul Iklan / Penawaran *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.title || ''}
                                                            onChange={(e) => updateBlock(index, 'title', e.target.value)}
                                                            placeholder="Contoh: Butuh Armada Tronton 24 Jam di San Andreas?"
                                                            className="w-full rounded-xl border-slate-300 text-xs font-bold bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            URL Gambar / Banner Iklan (Kosongkan jika tanpa gambar)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.image || ''}
                                                            onChange={(e) => updateBlock(index, 'image', e.target.value)}
                                                            placeholder="https://... (Opsional)"
                                                            className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                        Deskripsi Singkat Iklan
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={block.text || ''}
                                                        onChange={(e) => updateBlock(index, 'text', e.target.value)}
                                                        placeholder="Tulis pesan promosi singkat yang menyatu rapi dengan artikel..."
                                                        className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            URL Tujuan Saat Diklik (Kosongkan jika tidak bisa diklik)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.url || ''}
                                                            onChange={(e) => updateBlock(index, 'url', e.target.value)}
                                                            placeholder="https://wa.me/... atau / (Kosongkan bila hanya info statis)"
                                                            className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                            Teks Tombol CTA (Jika ada URL)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.ctaText || ''}
                                                            onChange={(e) => updateBlock(index, 'ctaText', e.target.value)}
                                                            placeholder="Mis: Hubungi Kami / Kunjungi"
                                                            className="w-full rounded-xl border-slate-300 text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {block.type === 'divider' && (
                                            <div className="py-2 text-center text-xs text-slate-400 font-semibold">
                                                ─── Garis Pemisah Seksi Koran (Editorial Rule) ───
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 3: LAYOUT SETTINGS, METRICS & SIDEKICK BOXES          */}
                    {/* ========================================================= */}
                    {activeTab === 'layout' && (
                        <div className="space-y-6">
                            {/* Typography & Page Layout Options */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-rose-600 text-[20px]">style</span>
                                    Gaya Tata Letak &amp; Tipografi Artikel
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Gaya Header Artikel
                                        </label>
                                        <select
                                            value={data.layout_settings.header_style || 'standard'}
                                            onChange={(e) => updateLayoutSetting('header_style', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs font-semibold"
                                        >
                                            <option value="standard">Broadsheet Standar (Rata Kiri)</option>
                                            <option value="centered">Editorial Klasik (Tengah / Simetris)</option>
                                            <option value="noir_dossier">Berkas Investigasi Noir (Gelap Kontras)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Font Teks Isi Berita
                                        </label>
                                        <select
                                            value={data.layout_settings.font_style || 'editorial_sans'}
                                            onChange={(e) => updateLayoutSetting('font_style', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs font-semibold"
                                        >
                                            <option value="editorial_sans">Modern Clean Sans (Work Sans)</option>
                                            <option value="classic_serif">Koran Cetak Klasik (Newsreader Serif)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Perataan Paragraf Default
                                        </label>
                                        <select
                                            value={data.layout_settings.text_align || 'left'}
                                            onChange={(e) => updateLayoutSetting('text_align', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs font-semibold"
                                        >
                                            <option value="left">Rata Kiri (Nyaman di Layar HP)</option>
                                            <option value="justify">Rata Kanan-Kiri (Gaya Kolom Koran)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Filter Visual Foto Utama
                                        </label>
                                        <select
                                            value={data.layout_settings.image_filter || 'none'}
                                            onChange={(e) => updateLayoutSetting('image_filter', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 text-xs font-semibold"
                                        >
                                            <option value="none">Warna Asli Tajam (Full Color)</option>
                                            <option value="grayscale">Hitam-Putih Dokumenter (Noir)</option>
                                            <option value="high_contrast">Kontras Tinggi Sinematik</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center pt-5">
                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(data.layout_settings.drop_cap)}
                                                onChange={(e) => updateLayoutSetting('drop_cap', e.target.checked)}
                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800">
                                                Aktifkan Drop-Cap Otomatis di Paragraf Pertama
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex items-center pt-5">
                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(data.layout_settings.show_authority_box)}
                                                onChange={(e) => updateLayoutSetting('show_authority_box', e.target.checked)}
                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800">
                                                Tampilkan Kotak Maklumat / Pernyataan Otoritas di Bawah Artikel
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex items-center pt-5">
                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.layout_settings.enable_comments !== false}
                                                onChange={(e) => updateLayoutSetting('enable_comments', e.target.checked)}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800">
                                                Aktifkan Kolom Suara Warga (Komentar IC Dinamis)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {data.layout_settings.show_authority_box && (
                                    <div className="pt-4 border-t border-slate-200 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                    Label Badge Maklumat
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.layout_settings.authority_badge || 'MAKLUMAT OTORITAS & REDAKSI'}
                                                    onChange={(e) => updateLayoutSetting('authority_badge', e.target.value)}
                                                    placeholder="MAKLUMAT OTORITAS & REDAKSI"
                                                    className="w-full rounded-xl border-slate-300 text-xs font-bold"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                    Judul Maklumat / Pernyataan Otoritas *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.layout_settings.authority_title || ''}
                                                    onChange={(e) => updateLayoutSetting('authority_title', e.target.value)}
                                                    placeholder="Contoh: Patroli Wilayah Diperketat Mulai Akhir Pekan"
                                                    className="w-full rounded-xl border-slate-300 text-xs font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                                Isi Lengkap Maklumat / Himbauan *
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={data.layout_settings.authority_body || ''}
                                                onChange={(e) => updateLayoutSetting('authority_body', e.target.value)}
                                                placeholder="Tuliskan isi maklumat resmi kepolisian, pemerintah, atau catatan redaksi untuk artikel ini..."
                                                className="w-full rounded-xl border-slate-300 text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Metrics Bento Builder */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                            Kotak Statistik / Data Investigasi (Metrics Bento)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Ditampilkan pada kartu berita utama &amp; di dalam halaman baca artikel
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addMetric}
                                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                                    >
                                        + Tambah Statistik
                                    </button>
                                </div>

                                {(data.metrics || []).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Belum ada data metrik ditambahkan.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {data.metrics.map((m, i) => (
                                            <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-white p-3 rounded-xl border border-slate-200">
                                                <div className="sm:col-span-3">
                                                    <input
                                                        type="text"
                                                        value={m.label}
                                                        onChange={(e) => updateMetric(i, 'label', e.target.value)}
                                                        placeholder="Label (Mis: Estimasi Trafik)"
                                                        className="w-full rounded-lg border-slate-300 text-xs"
                                                    />
                                                </div>
                                                <div className="sm:col-span-3">
                                                    <input
                                                        type="text"
                                                        value={m.value}
                                                        onChange={(e) => updateMetric(i, 'value', e.target.value)}
                                                        placeholder="Angka (Mis: 48+ / 99.4%)"
                                                        className="w-full rounded-lg border-slate-300 text-xs font-bold text-rose-600"
                                                    />
                                                </div>
                                                <div className="sm:col-span-5">
                                                    <input
                                                        type="text"
                                                        value={m.desc}
                                                        onChange={(e) => updateMetric(i, 'desc', e.target.value)}
                                                        placeholder="Keterangan singkat..."
                                                        className="w-full rounded-lg border-slate-300 text-xs"
                                                    />
                                                </div>
                                                <div className="sm:col-span-1 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMetric(i)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Highlight Quote for Lead Card on Frontpage */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                    Kutipan Sorotan Halaman Utama (Lead Card Quote)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={data.quote}
                                            onChange={(e) => setData('quote', e.target.value)}
                                            placeholder="Kutipan singkat yang tampil saat berita ini menjadi Headline Utama..."
                                            className="w-full rounded-xl border-slate-300 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={data.quote_author}
                                            onChange={(e) => setData('quote_author', e.target.value)}
                                            placeholder="Sumber Kutipan (Mis: Mekanik Senior)"
                                            className="w-full rounded-xl border-slate-300 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Citizen Comments Moderation (if editing existing article) */}
                            {isEditing && (
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                                Moderasi Suara Warga ({article?.comments?.length || 0} Komentar di Artikel Ini)
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Komentar dikirim secara real-time oleh pembaca di halaman artikel. Anda dapat menghapus komentar yang melanggar aturan.
                                            </p>
                                        </div>
                                    </div>

                                    {!article?.comments || article.comments.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">
                                            Belum ada komentar warga pada artikel ini.
                                        </p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {article.comments.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3"
                                                >
                                                    <div className="text-xs">
                                                        <div className="font-bold text-slate-900">
                                                            {c.author}{' '}
                                                            <span className="text-slate-400 font-normal">
                                                                ({c.region}) • {c.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 mt-0.5">{c.text}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Hapus komentar dari ${c.author}?`)) {
                                                                router.delete(
                                                                    route('admin.daily-globe.comments.destroy', c.id),
                                                                    { preserveScroll: true }
                                                                );
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 shrink-0 cursor-pointer"
                                                        title="Hapus Komentar"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            delete
                                                        </span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* TAB 4: LIVE PREVIEW                                       */}
                    {/* ========================================================= */}
                    {activeTab === 'preview' && (
                        <div className="bg-[#0e0f12] text-stone-100 rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-rose-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs">
                                    {data.badge || 'LIPUTAN KHUSUS'}
                                </span>
                                <span className="bg-white/10 text-amber-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-xs">
                                    {data.category_label}
                                </span>
                                {data.location && (
                                    <span className="text-xs text-stone-400">• {data.location}</span>
                                )}
                            </div>

                            <div className={data.layout_settings.header_style === 'centered' ? 'text-center max-w-3xl mx-auto' : ''}>
                                <h1 className="font-headline text-2xl sm:text-4xl font-bold text-white leading-tight">
                                    {data.title || 'Judul Artikel Berita Anda'}
                                </h1>
                                {data.subtitle && (
                                    <p className="font-newsreader text-base sm:text-lg text-amber-200/90 italic mt-2">
                                        {data.subtitle}
                                    </p>
                                )}
                                <div className="text-xs text-stone-400 mt-3">
                                    Oleh <strong className="text-white">{data.author}</strong> ({data.author_role}) • {data.published_date} — {data.published_time}
                                </div>
                            </div>

                            {data.image && (
                                <figure className="rounded-xl overflow-hidden bg-black border border-white/10">
                                    <img
                                        src={data.image}
                                        alt="Preview"
                                        className={`w-full max-h-96 object-cover ${
                                            data.layout_settings.image_filter === 'grayscale'
                                                ? 'grayscale contrast-125'
                                                : data.layout_settings.image_filter === 'high_contrast'
                                                ? 'contrast-125 brightness-95'
                                                : ''
                                        }`}
                                    />
                                    {data.image_caption && (
                                        <figcaption className="p-3 text-xs text-stone-400 italic bg-[#15171c]">
                                            {data.image_caption}
                                        </figcaption>
                                    )}
                                </figure>
                            )}

                            {/* Render Blocks Preview */}
                            <div
                                className={`space-y-4 ${
                                    data.layout_settings.font_style === 'classic_serif' ? 'font-newsreader text-lg' : 'font-body-md text-base'
                                }`}
                            >
                                {data.content_blocks.map((blk, i) => {
                                    if (blk.type === 'heading') {
                                        return (
                                            <h2 key={i} className="font-headline text-xl font-bold text-rose-400 pt-3 border-b border-white/10 pb-1">
                                                {blk.text}
                                            </h2>
                                        );
                                    }
                                    if (blk.type === 'quote') {
                                        return (
                                            <blockquote key={i} className="p-4 bg-[#181b22] border-l-4 border-rose-600 rounded-r-xl italic text-stone-200">
                                                <p>&ldquo;{blk.text}&rdquo;</p>
                                                {blk.author && <footer className="text-xs text-amber-400 font-bold mt-1 not-italic">— {blk.author}</footer>}
                                            </blockquote>
                                        );
                                    }
                                    if (blk.type === 'image' && blk.url) {
                                        return (
                                            <figure key={i} className="rounded-xl overflow-hidden bg-[#15171c] border border-white/10">
                                                <img src={blk.url} alt={blk.caption || ''} className="w-full max-h-80 object-cover" />
                                                {blk.caption && <figcaption className="p-2.5 text-xs text-stone-400 italic">{blk.caption}</figcaption>}
                                            </figure>
                                        );
                                    }
                                    if (blk.type === 'callout') {
                                        return (
                                            <div key={i} className="p-4 rounded-xl bg-[#181b22] border border-amber-500/30">
                                                <div className="text-xs font-bold uppercase text-amber-400 mb-1">{blk.title}</div>
                                                <p className="text-sm text-stone-300">{blk.text}</p>
                                            </div>
                                        );
                                    }
                                    if (blk.type === 'ad') {
                                        return (
                                            <div key={i} className="my-4 p-4 rounded-xl bg-[#14171f] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                                                {blk.image && blk.adStyle !== 'classified' && (
                                                    <img src={blk.image} alt={blk.title || 'Ad'} className="w-full sm:w-36 h-24 object-cover rounded-lg shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">
                                                        <span>{blk.badge || 'IKLAN SPONSOR'}</span>
                                                        {blk.sponsor && <span className="text-stone-400">• {blk.sponsor}</span>}
                                                    </div>
                                                    <div className="font-headline text-base font-bold text-white">{blk.title}</div>
                                                    {blk.text && <p className="text-xs text-stone-400 mt-1">{blk.text}</p>}
                                                </div>
                                                {blk.url && (
                                                    <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
                                                        {blk.ctaText || 'Kunjungi'} →
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }
                                    if (blk.type === 'divider') {
                                        return <hr key={i} className="border-white/15 my-4" />;
                                    }
                                    return (
                                        <p
                                            key={i}
                                            className={`leading-relaxed text-stone-200 ${
                                                blk.columns === 2 ? 'md:columns-2 md:gap-6' : ''
                                            } ${blk.align === 'justify' ? 'text-justify' : 'text-left'} ${
                                                blk.highlight ? 'bg-white/5 p-4 rounded-xl border border-white/10' : ''
                                            }`}
                                        >
                                            {blk.dropCap && blk.text ? (
                                                <>
                                                    <span className="float-left text-5xl font-headline text-rose-500 font-bold pr-3 leading-[0.85] pt-1">
                                                        {blk.text.charAt(0)}
                                                    </span>
                                                    {blk.text.slice(1)}
                                                </>
                                            ) : (
                                                blk.text
                                            )}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Modal Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                        <div className="text-xs text-slate-500">
                            Tip: Gunakan tab <strong>Susunan Paragraf &amp; Blok</strong> untuk mengatur urutan cerita dan tata letak per-paragraf.
                        </div>
                        <div className="flex items-center gap-2.5">
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
                                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan Artikel' : 'Terbitkan Artikel Berita'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

