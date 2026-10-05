import { Link } from '@inertiajs/react';

export default function FinancialOverview({ stats = {} }) {
    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalRevenue = stats.total_revenue || 0;
    const baseRental = stats.base_rental_revenue || 0;
    const lateFines = stats.late_fines || 0;
    const damageFines = stats.damage_fines || 0;
    const totalFines = lateFines + damageFines;
    const completedCount = stats.completed_rentals_count || 0;
    const activePotential = stats.active_potential || 0;

    // Calculate dynamic percentages
    const basePercent = totalRevenue > 0 ? Math.round((baseRental / totalRevenue) * 100) : 100;
    const latePercent = totalRevenue > 0 ? Math.round((lateFines / totalRevenue) * 100) : 0;
    const damagePercent = totalRevenue > 0 ? Math.max(0, 100 - basePercent - latePercent) : 0;

    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between w-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Analisis Finansial Terpadu
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Distribusi Kas Masuk &amp; Denda Operasional
                        </h3>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
                        Sinkronisasi Real
                    </span>
                </div>

                {/* Visual Bar Ratio */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
                        <div
                            className="bg-brand-600 h-full transition-all"
                            style={{ width: `${Math.max(basePercent, 5)}%` }}
                            title={`Sewa Pokok: ${basePercent}%`}
                        ></div>
                        {latePercent > 0 && (
                            <div
                                className="bg-amber-500 h-full transition-all"
                                style={{ width: `${latePercent}%` }}
                                title={`Denda Telat: ${latePercent}%`}
                            ></div>
                        )}
                        {damagePercent > 0 && (
                            <div
                                className="bg-rose-500 h-full transition-all"
                                style={{ width: `${damagePercent}%` }}
                                title={`Denda Kerusakan: ${damagePercent}%`}
                            ></div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-brand-600 shrink-0"></span>
                            <span className="font-bold text-slate-800">Sewa Pokok ({basePercent}%)</span>
                            <span className="text-slate-500">• {formatRupiah(baseRental)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                            <span className="font-bold text-slate-800">Denda Telat ({latePercent}%)</span>
                            <span className="text-slate-500">• {formatRupiah(lateFines)}</span>
                        </div>
                        {damageFines > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                                <span className="font-bold text-slate-800">Denda Rusak ({damagePercent}%)</span>
                                <span className="text-slate-500">• {formatRupiah(damageFines)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3 Financial Metrics Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Total Kas Selesai
                        </span>
                        <span className="text-xl font-extrabold text-emerald-700 mt-1">
                            {formatRupiah(totalRevenue)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            {completedCount} Faktur Terlunasi
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Akumulasi Denda
                        </span>
                        <span className="text-xl font-extrabold text-amber-700 mt-1">
                            {formatRupiah(totalFines)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            Telat &amp; Servis Montir
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Potensi Sewa Berjalan
                        </span>
                        <span className="text-xl font-extrabold text-brand-700 mt-1">
                            {formatRupiah(activePotential)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                            {stats.rentals_active || 0} Kontrak Aktif
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Bank Sync & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Pencatatan Keuangan Resmi • Maitri Company Enterprise</span>
                </span>
                <Link
                    href={route('admin.finance.index')}
                    className="text-brand-600 hover:text-brand-700 font-bold self-start sm:self-auto hover:underline flex items-center gap-1"
                >
                    <span>Buka Modul Keuangan &amp; Invoice</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
}
