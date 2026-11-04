import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DailyGlobeRadioPlayer from '@/Components/DailyGlobeRadioPlayer';

export default function DailyGlobeShow({ article, relatedArticles = [], communityChannels = {}, radioBroadcast = null }) {
    const [copied, setCopied] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1); // 0.85 to 1.3
    const [commentSubmitted, setCommentSubmitted] = useState(false);

    const { data: commentForm, setData: setCommentForm, post: postComment, processing: submittingComment, reset: resetComment } = useForm({
        author: '',
        region: '',
        role_badge: 'Warga San Andreas',
        text: '',
    });

    const handleCopy = () => {
        navigator.clipboard?.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentForm.author.trim() || !commentForm.text.trim()) return;

        postComment(route('dailyglobe.comments.store', article.slug), {
            preserveScroll: true,
            onSuccess: () => {
                resetComment();
                setCommentSubmitted(true);
                setTimeout(() => setCommentSubmitted(false), 3500);
            },
        });
    };

    const discordUrl = communityChannels.discord || 'https://discord.gg/QKfsxuKzU5';
    const centralUrl = communityChannels.central || 'https://bit.ly/TheDailyGlobesCentral';

    const layout = {
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
        ...(article.layoutSettings || {}),
    };

    const comments = article.comments || [];

    // Fallback plain paragraphs if contentBlocks is empty
    const blocks =
        article.contentBlocks && article.contentBlocks.length > 0
            ? article.contentBlocks
            : (article.content ? article.content.split('\n\n').filter((p) => p.trim()) : [article.excerpt]).map(
                  (para, idx) => {
                      if (para.startsWith('BAB ') || (para.includes('—') && para.length < 95)) {
                          return { id: `p_${idx}`, type: 'heading', text: para };
                      }
                      return {
                          id: `p_${idx}`,
                          type: 'paragraph',
                          text: para,
                          dropCap: idx === 0 && layout.drop_cap,
                          columns: layout.columns || 1,
                          align: layout.text_align || 'left',
                          highlight: false,
                      };
                  }
              );

    const imageFilterClass =
        layout.image_filter === 'grayscale'
            ? 'grayscale contrast-125'
            : layout.image_filter === 'high_contrast'
            ? 'contrast-125 brightness-95'
            : '';

    const renderAdBlock = (blk, idx) => {
        const hasImage = Boolean(blk.image && blk.image.trim()) && blk.adStyle !== 'classified';
        const hasUrl = Boolean(blk.url && blk.url.trim());
        const adStyle = blk.adStyle || 'compact_card';

        const innerContent = (
            <div
                className={`relative rounded-xl border border-white/10 bg-gradient-to-r from-[#14171e] via-[#171a22] to-[#14171e] transition-all overflow-hidden ${
                    hasUrl ? 'hover:border-amber-500/40 group cursor-pointer' : ''
                } ${adStyle === 'classified' ? 'p-4 border-dashed border-stone-700' : 'p-4 sm:p-5'}`}
            >
                {/* Subtle Top Corner Sponsor Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[9px] font-label-sm uppercase tracking-widest text-stone-400 font-semibold">
                            {blk.badge || 'IKLAN SPONSOR'}
                        </span>
                        {blk.sponsor && (
                            <span className="text-[11px] font-label-sm uppercase tracking-wider text-amber-400/90 font-bold">
                                • {blk.sponsor}
                            </span>
                        )}
                    </div>
                    {hasUrl && (
                        <span className="text-[10px] font-label-sm uppercase tracking-wider text-stone-400 group-hover:text-amber-300 flex items-center gap-0.5 transition">
                            <span>Tautan Mitra</span>
                            <span className="material-symbols-outlined text-[13px]">north_east</span>
                        </span>
                    )}
                </div>

                {/* Ad Layout Variations */}
                {adStyle === 'banner_split' && hasImage ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-5 aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
                            <img
                                src={blk.image}
                                alt={blk.title || 'Sponsor'}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                        </div>
                        <div className="sm:col-span-7 space-y-2">
                            <h4 className="font-headline text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition leading-snug">
                                {blk.title}
                            </h4>
                            {blk.text && (
                                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{blk.text}</p>
                            )}
                            {hasUrl && (
                                <div className="pt-1">
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/15 group-hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-label-sm uppercase tracking-wider font-bold transition">
                                        <span>{blk.ctaText || 'Kunjungi Sekarang'}</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 flex-1 min-w-0">
                            {hasImage && (
                                <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden bg-black border border-white/10 shrink-0">
                                    <img
                                        src={blk.image}
                                        alt={blk.title || 'Sponsor'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                            )}
                            <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="font-headline text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-300 transition leading-snug">
                                    {blk.title}
                                </h4>
                                {blk.text && (
                                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">{blk.text}</p>
                                )}
                            </div>
                        </div>

                        {hasUrl && (
                            <div className="shrink-0 self-end sm:self-center">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 group-hover:bg-amber-500/20 border border-white/10 group-hover:border-amber-500/30 text-stone-200 group-hover:text-amber-300 text-xs font-label-sm uppercase tracking-wider font-bold transition">
                                    <span>{blk.ctaText || 'Selengkapnya'}</span>
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );

        if (hasUrl) {
            const isExternal = blk.url.startsWith('http://') || blk.url.startsWith('https://');
            return (
                <aside key={blk.id || idx} className="my-5" aria-label="Sponsorship">
                    <a
                        href={blk.url}
                        target={isExternal ? '_blank' : '_self'}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="block no-underline"
                    >
                        {innerContent}
                    </a>
                </aside>
            );
        }

        return (
            <aside key={blk.id || idx} className="my-5" aria-label="Sponsorship">
                {innerContent}
            </aside>
        );
    };

    return (
        <div className="bg-[#0e0f12] text-stone-100 font-body-md antialiased min-h-screen selection:bg-rose-600 selection:text-white">
            <Head>
                <title>{`${article.title} — The Daily Globes`}</title>
                <meta name="description" content={article.excerpt} />
            </Head>

            {/* ========================================================= */}
            {/* 1. TOP STICKY BAR                                         */}
            {/* ========================================================= */}
            <header className="w-full bg-[#090a0c] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <Link
                            href={route('dailyglobe.index')}
                            className="inline-flex items-center gap-1.5 text-stone-300 hover:text-rose-400 transition font-label-sm text-xs uppercase font-bold shrink-0"
                        >
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            <span>Halaman Utama Daily Globes</span>
                        </Link>
                        <span className="hidden md:inline text-stone-700">|</span>
                        <div className="hidden md:flex items-center gap-2 font-label-sm text-[11px] uppercase text-stone-400 truncate">
                            <span className="text-amber-400 font-bold">EDISI SAN ANDREAS</span>
                            <span>•</span>
                            <span className="truncate">{article.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 font-label-sm text-[11px] uppercase text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-sm transition cursor-pointer font-bold"
                        >
                            <span className="material-symbols-outlined text-[14px]">share</span>
                            <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
                        </button>
                        <a
                            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-label-sm text-[11px] px-2.5 sm:px-3 py-1 rounded-sm flex items-center gap-1 uppercase tracking-wider font-bold transition"
                            href={discordUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <span className="material-symbols-outlined text-[14px]">forum</span>
                            <span className="hidden xs:inline">Discord</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* 2. ARTICLE BREADCRUMB STRIP                               */}
            {/* ========================================================= */}
            <div className="w-full bg-[#121419] border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-stone-400 font-label-sm text-[11px] uppercase tracking-wider">
                    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <Link
                            href={route('dailyglobe.index')}
                            className="hover:text-rose-400 transition flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[15px]">home</span>
                            <span>Beranda</span>
                        </Link>
                        <span className="text-stone-600">/</span>
                        <Link
                            href={route('dailyglobe.index', { category: article.category || 'all' })}
                            className="hover:text-rose-400 transition"
                        >
                            {article.categoryLabel || 'Investigasi'}
                        </Link>
                        <span className="text-stone-600">/</span>
                        <span className="text-amber-400 font-bold">Berkas #{article.id}</span>
                    </nav>

                    <div className="hidden md:flex items-center gap-3 text-stone-400">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-amber-400">verified</span>
                            LEMBARAN INVESTIGASI RESMI
                        </span>
                        <span>•</span>
                        <span>{article.views || '1,200'} Pembaca</span>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. EDITORIAL HEADLINE HEADER SECTION                      */}
            {/* ========================================================= */}
            <section
                className={`w-full border-b border-white/10 ${
                    layout.header_style === 'noir_dossier'
                        ? 'bg-gradient-to-b from-[#1a1115] to-[#111318]'
                        : 'bg-[#14161c]'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
                    <div
                        className={`flex flex-wrap items-center gap-2 mb-4 ${
                            layout.header_style === 'centered' ? 'justify-center' : ''
                        }`}
                    >
                        <span className="bg-rose-600 text-white px-3 py-1 rounded-xs font-label-md text-xs uppercase font-bold tracking-widest shadow-md">
                            {article.badge || 'INVESTIGASI EKSKLUSIF'}
                        </span>
                        <span className="bg-white/10 text-amber-300 px-3 py-1 rounded-xs font-label-md text-xs uppercase font-semibold tracking-wider">
                            {article.categoryLabel || 'INVESTIGASI'}
                        </span>
                        {article.location && (
                            <span className="bg-white/5 border border-white/10 text-stone-300 px-2.5 py-1 rounded-xs font-label-sm text-xs uppercase flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-rose-400">pin_drop</span>
                                {article.location}
                            </span>
                        )}
                    </div>

                    <div className={layout.header_style === 'centered' ? 'text-center max-w-4xl mx-auto' : 'max-w-5xl'}>
                        <h1 className="font-headline text-2xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight tracking-tight mb-4">
                            {article.title}
                        </h1>

                        {article.subtitle && (
                            <p className="font-newsreader text-base sm:text-xl text-stone-300 italic leading-relaxed mb-6">
                                {article.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Byline & Reader Controls Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0f1115] p-4 rounded-xl border border-white/10">
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-stone-300 text-xs">
                            <div className="flex items-center gap-2.5">
                                <span className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {article.author
                                        ? article.author
                                              .split(' ')
                                              .map((n) => n[0])
                                              .join('')
                                              .slice(0, 2)
                                              .toUpperCase()
                                        : 'RV'}
                                </span>
                                <div>
                                    <span className="text-white font-bold block">
                                        {article.author || 'Raymond "Gull" Vance'}
                                    </span>
                                    <span className="text-stone-400 text-[11px] block">
                                        {article.authorRole || 'Kepala Biro Investigasi'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-stone-400">
                                <span className="material-symbols-outlined text-[16px] text-rose-400">
                                    calendar_today
                                </span>
                                <span>
                                    {article.date || '24 Oktober 2026'} • {article.time || '22:15 SAST'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                <span>{article.readTime || '4 Menit Baca'}</span>
                            </div>
                        </div>

                        {/* Interactive Utilities: Text Size, Share, Discord */}
                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                            <span className="text-[11px] font-label-sm uppercase text-stone-400 mr-1 hidden sm:inline">
                                Ukuran Teks:
                            </span>
                            <button
                                type="button"
                                onClick={() => setFontSizeScale((prev) => Math.max(0.85, +(prev - 0.1).toFixed(2)))}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                                title="Kecilkan Teks"
                            >
                                A-
                            </button>
                            <button
                                type="button"
                                onClick={() => setFontSizeScale((prev) => Math.min(1.3, +(prev + 0.1).toFixed(2)))}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                                title="Besarkan Teks"
                            >
                                A+
                            </button>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-xs font-label-sm uppercase flex items-center gap-1 font-bold cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[15px]">link</span>
                                <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 4. MAIN 2-COLUMN EDITORIAL CONTENT                        */}
            {/* ========================================================= */}
            <main className="w-full py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* LEFT COLUMN: ARTICLE BODY (8 COLS) */}
                    <article className="lg:col-span-8 flex flex-col gap-6">
                        {/* Hero Evidence Photo Card */}
                        {article.image && (
                            <figure className="bg-[#15171c] rounded-xl overflow-hidden shadow-xl border border-white/10">
                                <div className="relative w-full aspect-video bg-black overflow-hidden">
                                    <img
                                        className={`w-full h-full object-cover ${imageFilterClass}`}
                                        src={article.image}
                                        alt={article.title}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';
                                        }}
                                    />
                                    <div className="absolute top-3 left-3 bg-rose-600 text-white font-label-sm text-[10px] px-2.5 py-0.5 rounded-xs uppercase tracking-wider font-bold shadow-md">
                                        EVIDENCE #{article.id}
                                    </div>
                                    {article.location && (
                                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-stone-200 border border-white/15 font-label-sm text-[11px] px-2.5 py-1 rounded-xs flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[13px] text-amber-400">
                                                location_on
                                            </span>
                                            <span>{article.location}</span>
                                        </div>
                                    )}
                                </div>
                                {article.imageCaption && (
                                    <figcaption className="p-3.5 text-xs text-stone-400 italic bg-[#121419] flex items-start gap-2 border-t border-white/10">
                                        <span className="material-symbols-outlined text-[16px] text-rose-400 shrink-0 mt-0.5">
                                            photo_camera
                                        </span>
                                        <span>{article.imageCaption}</span>
                                    </figcaption>
                                )}
                            </figure>
                        )}

                        {/* Data Metric Breakdown Bento (if defined) */}
                        {article.metrics && article.metrics.length > 0 && (
                            <div
                                className={`grid grid-cols-1 ${
                                    article.metrics.length === 1
                                        ? 'sm:grid-cols-1'
                                        : article.metrics.length === 2
                                        ? 'sm:grid-cols-2'
                                        : 'sm:grid-cols-3'
                                } gap-3 bg-[#14161c] p-4 rounded-xl border border-white/10`}
                            >
                                {article.metrics.map((m, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#1b1e26] p-4 rounded-lg border border-white/5 flex flex-col justify-between"
                                    >
                                        <div className="text-stone-400 font-label-sm text-[10px] uppercase tracking-wider font-bold">
                                            {m.label}
                                        </div>
                                        <div className="font-headline text-2xl sm:text-3xl text-rose-400 font-black my-1">
                                            {m.value}
                                        </div>
                                        <div className="text-stone-400 text-xs">{m.desc}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dynamic Content Blocks Renderer */}
                        <div
                            className={`space-y-5 text-stone-200 leading-relaxed ${
                                layout.font_style === 'classic_serif' ? 'font-newsreader' : 'font-body-md'
                            }`}
                            style={{ fontSize: `${fontSizeScale}rem` }}
                        >
                            {blocks.map((blk, idx) => {
                                if (blk.type === 'heading') {
                                    return (
                                        <div
                                            key={blk.id || idx}
                                            className="pt-4 pb-1.5 border-b border-white/10"
                                        >
                                            <h2 className="font-headline text-xl sm:text-2xl text-rose-400 font-bold tracking-tight">
                                                {blk.text}
                                            </h2>
                                        </div>
                                    );
                                }

                                if (blk.type === 'quote') {
                                    return (
                                        <blockquote
                                            key={blk.id || idx}
                                            className="bg-[#171920] p-5 sm:p-6 rounded-xl shadow-lg relative overflow-hidden border-l-4 border-rose-600 my-4"
                                        >
                                            <p className="font-newsreader text-lg sm:text-xl text-white italic leading-snug relative z-10 mb-2">
                                                &ldquo;{blk.text}&rdquo;
                                            </p>
                                            {blk.author && (
                                                <footer className="font-label-md text-xs uppercase tracking-wider text-amber-400 font-bold relative z-10 flex items-center gap-2">
                                                    <span className="w-4 h-0.5 bg-amber-400"></span>
                                                    <span>{blk.author}</span>
                                                </footer>
                                            )}
                                        </blockquote>
                                    );
                                }

                                if (blk.type === 'image' && blk.url) {
                                    return (
                                        <figure
                                            key={blk.id || idx}
                                            className="bg-[#15171c] rounded-xl overflow-hidden shadow-md border border-white/10 my-4"
                                        >
                                            <div className="relative w-full aspect-video bg-black overflow-hidden">
                                                <img
                                                    className="w-full h-full object-cover"
                                                    src={blk.url}
                                                    alt={blk.caption || 'Dokumentasi'}
                                                />
                                                {blk.badge && (
                                                    <div className="absolute bottom-2.5 left-3 bg-black/80 backdrop-blur-xs px-2.5 py-0.5 rounded-xs font-label-sm text-[10px] text-amber-300 font-bold uppercase border border-white/10">
                                                        {blk.badge}
                                                    </div>
                                                )}
                                            </div>
                                            {blk.caption && (
                                                <figcaption className="p-3 text-xs text-stone-400 italic bg-[#121419]">
                                                    {blk.caption}
                                                </figcaption>
                                            )}
                                        </figure>
                                    );
                                }

                                if (blk.type === 'callout') {
                                    const toneClasses =
                                        blk.tone === 'amber'
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                                            : blk.tone === 'police'
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                                            : 'border-rose-500 bg-rose-500/10 text-rose-300';
                                    return (
                                        <div
                                            key={blk.id || idx}
                                            className={`p-5 rounded-xl border-l-4 ${toneClasses} space-y-1.5 my-4`}
                                        >
                                            <div className="flex items-center gap-2 font-label-md text-xs uppercase tracking-wider font-bold">
                                                <span className="material-symbols-outlined text-[18px]">campaign</span>
                                                <span>{blk.title || 'CATATAN PENTING REDAKSI'}</span>
                                            </div>
                                            <p className="text-sm text-stone-200 leading-relaxed">{blk.text}</p>
                                        </div>
                                    );
                                }

                                if (blk.type === 'ad') {
                                    return renderAdBlock(blk, idx);
                                }

                                if (blk.type === 'divider') {
                                    return (
                                        <div key={blk.id || idx} className="flex items-center justify-center py-3">
                                            <span className="w-16 h-px bg-white/15"></span>
                                            <span className="mx-3 text-rose-500 text-xs">✦ ✦ ✦</span>
                                            <span className="w-16 h-px bg-white/15"></span>
                                        </div>
                                    );
                                }

                                // Default: Paragraph Block
                                const text = blk.text || '';
                                const useDropCap = Boolean(blk.dropCap);
                                const colClass = blk.columns === 2 ? 'md:columns-2 md:gap-8' : '';
                                const alignClass =
                                    (blk.align || layout.text_align) === 'justify' ? 'text-justify' : 'text-left';
                                const highlightClass = blk.highlight
                                    ? 'bg-[#171a21] p-5 rounded-xl border border-white/10 shadow-inner'
                                    : '';

                                return (
                                    <p
                                        key={blk.id || idx}
                                        className={`leading-relaxed ${colClass} ${alignClass} ${highlightClass}`}
                                    >
                                        {useDropCap && text.length > 1 ? (
                                            <>
                                                <span className="float-left text-5xl sm:text-6xl font-headline text-rose-500 font-bold pr-3 leading-[0.82] pt-1">
                                                    {text.charAt(0)}
                                                </span>
                                                {text.slice(1)}
                                            </>
                                        ) : (
                                            text
                                        )}
                                    </p>
                                );
                            })}
                        </div>

                        {/* Authority Warning Bulletin (Dynamic per Article — Only shown when enabled & has content) */}
                        {layout.show_authority_box && (layout.authority_title || layout.authority_body) && (
                            <div className="bg-[#15171c] p-5 sm:p-6 rounded-xl space-y-2 border-l-4 border-amber-500 border border-white/10 mt-2">
                                <div className="flex items-center gap-2 text-amber-400 font-label-md text-xs uppercase tracking-wider font-bold">
                                    <span className="material-symbols-outlined text-[18px]">local_police</span>
                                    <span>{layout.authority_badge || 'MAKLUMAT OTORITAS & REDAKSI'}</span>
                                </div>
                                {layout.authority_title && (
                                    <h3 className="font-headline text-lg sm:text-xl text-white font-bold">
                                        {layout.authority_title}
                                    </h3>
                                )}
                                {layout.authority_body && (
                                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                                        {layout.authority_body}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* 5. DYNAMIC ROLEPLAY CITIZEN FORUM / COMMENTS              */}
                        {/* ========================================================= */}
                        {layout.enable_comments !== false && (
                            <section className="bg-[#15171c] p-5 sm:p-6 rounded-xl space-y-5 shadow-lg border border-white/10 mt-4">
                                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-rose-500">chat</span>
                                        <h3 className="font-headline text-lg sm:text-xl text-white font-bold">
                                            Suara Warga San Andreas ({comments.length} Respon)
                                        </h3>
                                    </div>
                                    <span className="font-label-sm text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded uppercase font-bold">
                                        FORUM ROLEPLAY IC
                                    </span>
                                </div>

                                <form
                                    onSubmit={handleAddComment}
                                    className="space-y-3 bg-[#101216] p-4 rounded-xl border border-white/5"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-label-sm text-[11px] uppercase text-stone-400 mb-1 font-bold">
                                                Nama Karakter / Alias IC *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={commentForm.author}
                                                onChange={(e) => setCommentForm('author', e.target.value)}
                                                placeholder="Misal: Johnny_Vercetti"
                                                className="w-full bg-[#171a21] text-white text-xs p-2.5 rounded-lg outline-none border border-white/10 focus:border-rose-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-label-sm text-[11px] uppercase text-stone-400 mb-1 font-bold">
                                                Domisili / Wilayah
                                            </label>
                                            <input
                                                type="text"
                                                value={commentForm.region}
                                                onChange={(e) => setCommentForm('region', e.target.value)}
                                                placeholder="Misal: Dillimore, Red County"
                                                className="w-full bg-[#171a21] text-white text-xs p-2.5 rounded-lg outline-none border border-white/10 focus:border-rose-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-label-sm text-[11px] uppercase text-stone-400 mb-1 font-bold">
                                                Peran / Identitas Warga
                                            </label>
                                            <select
                                                value={commentForm.role_badge}
                                                onChange={(e) => setCommentForm('role_badge', e.target.value)}
                                                className="w-full bg-[#171a21] text-white text-xs p-2.5 rounded-lg outline-none border border-white/10 focus:border-rose-500"
                                            >
                                                <option value="Warga San Andreas">Warga San Andreas</option>
                                                <option value="Pengemudi & Logistik">Pengemudi &amp; Logistik</option>
                                                <option value="Komunitas Otomotif">Komunitas Otomotif</option>
                                                <option value="Pelaku Bisnis">Pelaku Bisnis / Korporasi</option>
                                                <option value="Aparat / Birokrasi">Aparat / Birokrasi</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-label-sm text-[11px] uppercase text-stone-400 mb-1 font-bold">
                                            Pendapat / Kesaksian *
                                        </label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={commentForm.text}
                                            onChange={(e) => setCommentForm('text', e.target.value)}
                                            placeholder="Tuliskan pengalaman, opini, atau kesaksian warga terkait laporan berita ini..."
                                            className="w-full bg-[#171a21] text-white text-xs p-2.5 rounded-lg outline-none border border-white/10 focus:border-rose-500 resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        {commentSubmitted && (
                                            <span className="text-emerald-400 font-label-sm text-xs font-bold">
                                                ✓ Komentar IC Anda berhasil tersimpan di artikel ini!
                                            </span>
                                        )}
                                        <div className="ml-auto">
                                            <button
                                                type="submit"
                                                disabled={submittingComment}
                                                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-label-md text-xs uppercase tracking-wider px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[15px]">send</span>
                                                <span>
                                                    {submittingComment ? 'Mengirim...' : 'Kirim Pendapat IC'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {comments.length === 0 ? (
                                    <div className="p-6 rounded-xl bg-[#101216] border border-white/5 text-center">
                                        <span className="material-symbols-outlined text-2xl text-stone-500 mb-1">
                                            forum
                                        </span>
                                        <p className="text-xs text-stone-400">
                                            Belum ada tanggapan warga pada laporan ini. Jadilah yang pertama memberikan opini IC Anda!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((c) => (
                                            <div
                                                key={c.id}
                                                className="p-3.5 rounded-xl bg-[#101216] flex flex-col gap-1.5 border border-white/5"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-label-md text-xs font-bold text-rose-400">
                                                            {c.author}
                                                        </span>
                                                        <span className="text-stone-400 text-[11px]">
                                                            (@{c.region})
                                                        </span>
                                                        {c.roleBadge && (
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-label-sm text-amber-300">
                                                                {c.roleBadge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-label-sm text-[11px] text-stone-500">
                                                        {c.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                                                    {c.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </article>

                    {/* ========================================================= */}
                    {/* RIGHT COLUMN: EDITORIAL STICKY SIDEBAR (4 COLS)           */}
                    {/* ========================================================= */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-[#15171c] p-5 rounded-xl shadow-lg space-y-4 border border-white/10">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <span className="font-label-sm text-xs uppercase font-bold text-rose-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    BERITA TERKAIT LAINNYA
                                </span>
                                <span className="font-label-sm text-[10px] text-stone-500 uppercase">ARSIP REDAKSI</span>
                            </div>

                            <div className="space-y-3">
                                {relatedArticles.map((rel) => (
                                    <Link
                                        key={rel.id}
                                        href={route('dailyglobe.show', rel.slug)}
                                        className="block bg-[#1b1e25] p-3.5 rounded-lg hover:bg-white/10 transition group border border-white/5"
                                    >
                                        <span className="font-label-sm text-[10px] text-amber-400 uppercase font-bold block mb-1">
                                            {rel.categoryLabel || rel.category}
                                        </span>
                                        <h4 className="font-headline text-base text-white font-bold group-hover:text-rose-400 transition leading-snug">
                                            {rel.title}
                                        </h4>
                                        <p className="text-xs text-stone-400 line-clamp-2 mt-1">{rel.excerpt}</p>
                                        <div className="flex items-center gap-1 text-stone-500 font-label-sm text-[10px] mt-2">
                                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                                            <span>{rel.readTime || '4 Menit Baca'}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#15171c] p-5 rounded-xl shadow-lg border border-white/10 space-y-3">
                            <span className="font-label-sm text-xs uppercase tracking-wider text-amber-400 font-bold block">
                                SALURAN KOMUNITAS PERS
                            </span>
                            <a
                                href={discordUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 flex items-center gap-3 text-white transition"
                            >
                                <span className="material-symbols-outlined text-[#5865F2]">forum</span>
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-[11px] font-bold uppercase">
                                        Discord Server Resmi
                                    </span>
                                    <span className="text-xs text-stone-300 font-mono">discord.gg/QKfsxuKzU5</span>
                                </div>
                            </a>

                            <a
                                href={centralUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center gap-3 text-white transition"
                            >
                                <span className="material-symbols-outlined text-amber-400">language</span>
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-[11px] font-bold uppercase">
                                        Portal Arsip Pusat
                                    </span>
                                    <span className="text-xs text-stone-300 font-mono">
                                        bit.ly/TheDailyGlobesCentral
                                    </span>
                                </div>
                            </a>
                        </div>

                        <div className="bg-[#15171c] p-5 rounded-xl text-center border border-white/10">
                            <span className="material-symbols-outlined text-3xl text-rose-500 mb-1">newspaper</span>
                            <h4 className="font-headline text-lg text-white font-bold">
                                Ingin Membaca Laporan Lainnya?
                            </h4>
                            <p className="text-xs text-stone-400 my-2 leading-relaxed">
                                Kembali ke lembaran utama The Daily Globes untuk melihat warta investigasi, opini, dan bursa kargo.
                            </p>
                            <Link
                                href={route('dailyglobe.index')}
                                className="block w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-label-md text-xs uppercase font-bold tracking-wider transition"
                            >
                                Ke Halaman Utama
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>

            {/* ========================================================= */}
            {/* 6. BROADSHEET FOOTER                                      */}
            {/* ========================================================= */}
            <footer className="w-full bg-[#090a0d] border-t border-white/10 text-stone-400 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <p>© 2026 The Daily Globes Publishing Co. San Andreas Statewide Distribution.</p>
                    <div className="flex items-center gap-4">
                        <Link href={route('dailyglobe.index')} className="hover:text-rose-400 transition">
                            Indeks Berita
                        </Link>
                        <span>/</span>
                        <a
                            className="text-[#5865F2] hover:underline font-bold"
                            href={discordUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Discord Pers Resmi
                        </a>
                    </div>
                </div>
            </footer>

            <DailyGlobeRadioPlayer initialBroadcast={radioBroadcast} />
        </div>
    );
}
