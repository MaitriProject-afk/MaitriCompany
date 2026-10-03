export default function KpiOverview() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* KPI 1: TOTAL REVENUE */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Pendapatan (Bln Ini)
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                    </span>
                </div>
                <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                        Rp 1.482,5 M
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            +14.8% MoM
                        </span>
                        <span className="text-xs text-slate-500">vs target Rp 1.35 M</span>
                    </div>
                </div>
                <div className="w-full mt-3 pt-2">
                    <svg className="w-full h-8 overflow-visible text-brand-600" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                        <path d="M0 24 Q 25 18, 50 20 T 100 12 T 150 15 T 200 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                        <path d="M0 24 Q 25 18, 50 20 T 100 12 T 150 15 T 200 4 L 200 30 L 0 30 Z" fill="currentColor" fillOpacity="0.08"></path>
                    </svg>
                </div>
            </div>

            {/* KPI 2: ACTIVE FLEET */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Armada Aktif Operasi
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-blue-100/80 text-brand-800 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            418
                        </span>
                        <span className="text-base font-bold text-slate-400">/ 520 Unit</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="font-semibold text-brand-600">80.4% Tingkat Utilisasi</span>
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                            12 Unit Perawatan
                        </span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                    <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: '80.4%' }}></div>
                </div>
            </div>

            {/* KPI 3: ACTIVE DESIGN PROJECTS */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Proyek Desain &amp; Interior
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">brush</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            38
                        </span>
                        <span className="text-base font-bold text-slate-400">Proyek Aktif</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            9 Review Klien
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                            5 Serah Terima W12
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 mt-4 text-xs font-medium">
                    <span className="material-symbols-outlined text-[16px] text-brand-600">check_circle</span>
                    <span>98.4% Tepat Waktu Milestone</span>
                </div>
            </div>

            {/* KPI 4: CREW & TECHNICIANS */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mitra Kru &amp; Teknisi
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            395
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Personil Siap</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                            <span className="material-symbols-outlined text-[16px]">star</span>
                            <span className="ml-1 text-slate-900">4.9 / 5.0</span>
                        </div>
                        <span className="text-xs text-slate-500">Kepuasan Klien</span>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-1 text-[11px] text-slate-600 font-medium">
                    <span className="text-emerald-700 font-semibold">• 312 Driver On-Trip</span>
                    <span>• 83 Arsitek &amp; Mandor</span>
                </div>
            </div>
        </div>
    );
}
