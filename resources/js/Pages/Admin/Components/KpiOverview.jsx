import { Link } from '@inertiajs/react';

export default function KpiOverview({ stats = {} }) {
    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalRevenue = stats.total_revenue || 0;
    const baseRentalRevenue = stats.base_rental_revenue || 0;
    const completedCount = stats.completed_rentals_count || 0;

    const vehiclesTotal = stats.vehicles_total || 0;
    const vehiclesAvailable = stats.vehicles_available || 0;
    const vehiclesRented = stats.vehicles_rented || 0;
    const vehiclesMaintenance = stats.vehicles_maintenance || 0;
    const utilization = stats.vehicles_utilization || 0;

    const rentalsTotal = stats.rentals_total || 0;
    const rentalsActive = stats.rentals_active || 0;
    const rentalsCompleted = stats.rentals_completed || 0;
    const rentalsOverdue = stats.rentals_overdue || 0;

    const usersTotal = stats.users_total || 0;
    const usersAdmin = stats.users_admin || 0;
    const usersStaff = stats.users_staff || 0;
    const usersWarga = stats.users_warga || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* KPI 1: TOTAL REVENUE (REAL) */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Pendapatan Kasir
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                    </span>
                </div>
                <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                        {formatRupiah(totalRevenue)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            {completedCount} Sewa Selesai
                        </span>
                        <span className="text-xs text-slate-500">
                            Pokok: {formatRupiah(baseRentalRevenue)}
                        </span>
                    </div>
                </div>
                <div className="w-full mt-3 pt-2">
                    <svg className="w-full h-8 overflow-visible text-brand-600" fill="none" preserveAspectRatio="none" viewBox="0 0 200 30">
                        <path d="M0 24 Q 25 18, 50 20 T 100 12 T 150 15 T 200 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                        <path d="M0 24 Q 25 18, 50 20 T 100 12 T 150 15 T 200 4 L 200 30 L 0 30 Z" fill="currentColor" fillOpacity="0.08"></path>
                    </svg>
                </div>
            </div>

            {/* KPI 2: ACTIVE FLEET (REAL) */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Status Armada Truk
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-blue-100/80 text-brand-800 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            {vehiclesAvailable}
                        </span>
                        <span className="text-base font-bold text-slate-400">/ {vehiclesTotal} Unit Tersedia</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="font-semibold text-brand-600">
                            {vehiclesRented} Disewa ({utilization}% Utilisasi)
                        </span>
                        {vehiclesMaintenance > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                                {vehiclesMaintenance} Perawatan
                            </span>
                        ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                                Semua Siap Jalan
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                    <div
                        className="bg-brand-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(Math.max(utilization, 5), 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* KPI 3: RENTAL CONTRACTS & MOU (REAL) */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kontrak Sewa &amp; MoU
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            {rentalsTotal}
                        </span>
                        <span className="text-base font-bold text-slate-400">Total Kontrak</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                        <span className="bg-blue-50 text-brand-700 border border-blue-200/60 px-2 py-0.5 rounded font-bold">
                            {rentalsActive} Aktif Berjalan
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded font-bold">
                            {rentalsCompleted} Selesai
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
                    {rentalsOverdue > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span>{rentalsOverdue} Sewa Terlambat</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Tidak Ada Keterlambatan Aktif</span>
                        </span>
                    )}
                </div>
            </div>

            {/* KPI 4: TEAM & USERS (REAL) */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Personil &amp; Pengguna
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                    </span>
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                            {usersTotal}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Akun Terdaftar</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] text-brand-600">admin_panel_settings</span>
                            {usersAdmin} Admin • {usersStaff} Staff
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-1 text-[11px] text-slate-600 font-medium">
                    <span className="text-brand-700 font-bold">• {usersStaff + usersAdmin} Tim Operasional</span>
                    <span className="text-slate-500">• {usersWarga} Warga</span>
                </div>
            </div>
        </div>
    );
}
