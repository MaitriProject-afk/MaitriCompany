export default function DesignStudioPillar() {
    const projects = [
        {
            category: 'Commercial Tower',
            categoryColor: 'bg-blue-50 text-brand-700 border-blue-200/60',
            code: 'Kode: #ARC-2025-018',
            title: 'Headquarters Fintech Tower — SCBD Lot 8',
            client: 'Klien: PT Digital Finansial Nusantara • Luas: 4.800 m² (4 Lantai)',
            stage: '3D Rendering Stage',
            stageColor: 'bg-blue-50 text-brand-700',
            task: 'Kemajuan Konstruksi & Desain',
            progress: 75,
            progressText: '75% (Milestone 3 dari 4)',
            barColor: 'bg-brand-600',
            footerLeftIcon: 'assignment_turned_in',
            footerLeftText: 'RAB: Rp 4.250.000.000 (Disetujui)',
            footerAction: 'Review VR Render',
            footerActionIcon: 'visibility',
        },
        {
            category: 'Automotive Showroom',
            categoryColor: 'bg-amber-50 text-amber-800 border-amber-200/60',
            code: 'Kode: #ARC-2025-014',
            title: 'Showroom Surya Kencana EV — Surabaya Barat',
            client: 'Klien: Surya Kencana Motor Group • Luas: 2.150 m²',
            stage: 'MEP & Interior Fitout',
            stageColor: 'bg-amber-50 text-amber-800',
            task: 'Instalasi Akustik & Lighting System',
            progress: 40,
            progressText: '40%',
            barColor: 'bg-amber-600',
            footerLeftIcon: 'pending',
            footerLeftText: 'Revisi Tambahan: Fasad ACP Lantai 2',
            footerAction: 'Detail Pekerja →',
            footerActionIcon: null,
        },
        {
            category: 'Luxury Hospitality',
            categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
            code: 'Kode: #ARC-2025-009',
            title: 'Villa Privat Nuansa Tropis — Uluwatu, Bali',
            client: 'Klien: PT Maitri Horizon Realty • Serah Terima: 28 Mar 2026',
            stage: 'Finalisasi RAB 90%',
            stageColor: 'bg-emerald-50 text-emerald-800',
            task: 'Penyelesaian Handover & Furniture Loose',
            progress: 90,
            progressText: '90%',
            barColor: 'bg-emerald-600',
            footerLeftIcon: 'verified',
            footerLeftText: 'Audit Kualitas 100% Lulus',
            footerAction: 'Cetak Berita Acara',
            footerActionIcon: null,
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Header Divisi Desain */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-[22px]">architecture</span>
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                            Divisi Studio &amp; Interior
                        </h2>
                        <p className="text-xs text-slate-500">
                            Rancang Bangun Korporat, 3D Rendering &amp; MEP
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="text-amber-600 font-bold text-xs hover:underline cursor-pointer"
                >
                    Lihat Portofolio
                </button>
            </div>

            {/* Active Projects Cards */}
            <div className="flex flex-col gap-3">
                {projects.map((p, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col gap-3 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${p.categoryColor}`}>
                                        {p.category}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        {p.code}
                                    </span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                                    {p.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {p.client}
                                </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${p.stageColor}`}>
                                {p.stage}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">{p.task}</span>
                                <span className="font-bold text-slate-800">{p.progressText}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`${p.barColor} h-2 rounded-full transition-all`}
                                    style={{ width: `${p.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                <span className="material-symbols-outlined text-[16px] text-brand-600">
                                    {p.footerLeftIcon}
                                </span>
                                <span>{p.footerLeftText}</span>
                            </div>
                            <button
                                type="button"
                                className="flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                            >
                                {p.footerActionIcon && (
                                    <span className="material-symbols-outlined text-[16px]">
                                        {p.footerActionIcon}
                                    </span>
                                )}
                                <span>{p.footerAction}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Studio HQ Visual Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-xs h-36 bg-slate-900 flex items-end p-4 border border-slate-800">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-45 select-none"
                    style={{ backgroundImage: `url('/images/maitricompbanner.jpg')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent"></div>
                <div className="relative z-10 text-white">
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 font-extrabold">
                        Arsitektur Terpadu
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                        Aura Global HQ • Desain Terbaik Tahun Ini
                    </h4>
                    <p className="text-xs text-slate-300">
                        Kategori Kantor Korporat Ramah Lingkungan
                    </p>
                </div>
            </div>
        </div>
    );
}
