export default function FinancialOverview() {
    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Analisis Finansial Terpadu
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Distribusi Pendapatan Antar Divisi
                        </h3>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/70">
                        Q1 2026
                    </span>
                </div>

                {/* Visual Bar Ratio */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
                        <div
                            className="bg-brand-600 h-full transition-all"
                            style={{ width: '68%' }}
                            title="Divisi Logistik: 68%"
                        ></div>
                        <div
                            className="bg-amber-500 h-full transition-all"
                            style={{ width: '32%' }}
                            title="Divisi Rancang Bangun: 32%"
                        ></div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-brand-600"></span>
                            <span className="font-bold text-slate-800">Divisi Logistik &amp; Armada (68%)</span>
                            <span className="text-slate-500">• Rp 1.008.100.000</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="font-bold text-slate-800">Divisi Rancang Bangun &amp; Desain (32%)</span>
                            <span className="text-slate-500">• Rp 474.400.000</span>
                        </div>
                    </div>
                </div>

                {/* 3 Financial Metrics Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Tingkat Penagihan (Collection)
                        </span>
                        <span className="text-xl font-extrabold text-emerald-700 mt-1">
                            96.2%
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            Sangat Sehat (+2.4% vs Q4)
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Faktur Tertagih (&lt; 30 Hari)
                        </span>
                        <span className="text-xl font-extrabold text-slate-900 mt-1">
                            Rp 1.426 M
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            112 Faktur Terlunasi
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Pending Invoicing Alert
                        </span>
                        <span className="text-xl font-extrabold text-amber-700 mt-1">
                            Rp 56,5 Jt
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            3 Kontrak Menunggu e-Faktur
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Bank Sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Rekonsiliasi Bank Mandiri Corporate &amp; BCA KlikBisnis • Terhubung</span>
                </span>
                <button
                    type="button"
                    className="text-brand-600 hover:text-brand-700 font-bold self-start sm:self-auto cursor-pointer"
                >
                    Buka Modul Keuangan →
                </button>
            </div>
        </div>
    );
}
