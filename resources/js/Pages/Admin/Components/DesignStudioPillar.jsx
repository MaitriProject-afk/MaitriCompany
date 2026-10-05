export default function DesignStudioPillar() {
    const projects = [
        {
            category: 'Garasi & Workshop',
            categoryColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
            code: 'HQ-VERONA-01',
            title: 'Maitri Central Workshop & Fleet Garage',
            client: 'Lokasi: Maitri HQ Verona Beach No 12 Los Santos',
            stage: 'Fasilitas Operasional Aktif',
            stageColor: 'bg-emerald-50 text-emerald-800',
            task: 'Bengkel servis 2000 HP, kalibrasi armada & perawatan berkala',
            progress: 100,
            progressText: '100% Siap Operasi',
            barColor: 'bg-emerald-600',
            footerLeftIcon: 'verified',
            footerLeftText: 'Standar Armada Prima',
            footerAction: 'Lihat Fasilitas',
        },
        {
            category: 'Kustomisasi Truk',
            categoryColor: 'bg-blue-50 text-brand-700 border-blue-200/60',
            code: 'MOD-FLEET-LS',
            title: 'Branding & Custom Livery Armada Niaga',
            client: 'Klien: Mitra Hauling & Perusahaan Ekspedisi San Andreas',
            stage: 'Layanan Terbuka',
            stageColor: 'bg-blue-50 text-brand-700',
            task: 'Pemasangan livery niaga, cat korporat & stiker identitas',
            progress: 85,
            progressText: 'Katalog Aktif',
            barColor: 'bg-brand-600',
            footerLeftIcon: 'brush',
            footerLeftText: 'Kustomisasi Desain',
            footerAction: 'Konsultasi Tim',
        },
        {
            category: 'Rancang Bangun',
            categoryColor: 'bg-amber-50 text-amber-800 border-amber-200/60',
            code: 'ARC-SAN-ANDREAS',
            title: 'Studio Arsitektur & Interior Properti Komersial/Hunian',
            client: 'Klien: Warga & Korporat Los Santos',
            stage: 'Konsultasi Walk-in & Dispatch',
            stageColor: 'bg-amber-50 text-amber-800',
            task: 'Konsep tata ruang 3D, renovasi hunian & interior kantor',
            progress: 70,
            progressText: 'Konsultasi Aktif',
            barColor: 'bg-amber-600',
            footerLeftIcon: 'architecture',
            footerLeftText: 'Maitri Design Division',
            footerAction: 'Hubungi Studio',
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
                            Rancang Bangun, Desain Workshop &amp; Modifikasi Korporat
                        </p>
                    </div>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                    HQ Verona Beach
                </span>
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
                                        #{p.code}
                                    </span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                                    {p.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {p.client}
                                </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${p.stageColor}`}>
                                {p.stage}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 font-medium text-[11px]">{p.task}</span>
                                <span className="font-bold text-slate-800 text-[11px]">{p.progressText}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`${p.barColor} h-1.5 rounded-full transition-all`}
                                    style={{ width: `${p.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                                <span className="material-symbols-outlined text-[15px] text-brand-600">
                                    {p.footerLeftIcon}
                                </span>
                                <span>{p.footerLeftText}</span>
                            </span>
                            <span className="text-amber-700 font-bold text-[11px]">
                                {p.footerAction}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
