import { useState, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function RentalsTab({
    rentals = [],
    availableVehiclesCount = 0,
    onOpenRentalModal,
    onOpenReturnModal,
    onProcessReturn,
    onCompleteMaintenance,
}) {
    const handleReturnClick = onOpenReturnModal || onProcessReturn;
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'all' | 'active' | 'completed'
    const [copiedRentalId, setCopiedRentalId] = useState(null);


    const activeCount = useMemo(() => rentals.filter((r) => r.status === 'active').length, [rentals]);
    const overdueCount = useMemo(() => rentals.filter((r) => r.is_overdue).length, [rentals]);
    const completedCount = useMemo(() => rentals.filter((r) => r.status === 'completed').length, [rentals]);

    const filteredRentals = useMemo(() => {
        return rentals.filter((r) => {
            // Status match
            if (statusFilter === 'active' && r.status !== 'active') return false;
            if (statusFilter === 'completed' && r.status !== 'completed') return false;

            // Search match
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const renterMatch = r.renter_name.toLowerCase().includes(q);
                const phoneMatch = r.san_andreas_phone.toLowerCase().includes(q);
                const truckMatch = r.vehicle?.name?.toLowerCase().includes(q);
                const plateMatch = r.vehicle?.plate_number?.toLowerCase().includes(q);
                return renterMatch || phoneMatch || truckMatch || plateMatch;
            }

            return true;
        });
    }, [rentals, statusFilter, searchTerm]);

    const getConditionBadge = (condition, health) => {
        switch (condition) {
            case 'hancur_meledak':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                        <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
                        <span>Meledak / Hancur ({health}%)</span>
                    </span>
                );
            case 'rusak_berat':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                        <span className="material-symbols-outlined text-[13px]">car_crash</span>
                        <span>Rusak Berat ({health}%)</span>
                    </span>
                );
            case 'rusak_ringan':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        <span>Lecet / Ringan ({health}%)</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Mulus ({health}%)</span>
                    </span>
                );
        }
    };

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
            {/* Top Bar Filter & Quick Dispatch CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama penyewa, no. San Andreas, atau plat truk..."
                        className="w-full h-10 pl-9 pr-4 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                    />
                </div>

                {/* Status Sub-Filters & Sewa Button */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('active')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'active'
                                    ? 'bg-white text-brand-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Sedang Disewa</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                overdueCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-100 text-brand-700'
                            }`}>
                                {activeCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'completed'
                                    ? 'bg-white text-brand-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Selesai Dikembalikan</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                                {completedCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-white text-brand-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Semua ({rentals.length})
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenRentalModal}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-[17px]">add_circle</span>
                        <span>+ Form Sewa Truk</span>
                    </button>
                </div>
            </div>

            {/* Overdue Warning Alert Banner */}
            {overdueCount > 0 && statusFilter !== 'completed' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between gap-3 shadow-2xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 text-[20px] animate-bounce">
                            warning
                        </span>
                        <span>
                            Terdapat <strong>{overdueCount} unit truk</strong> yang telah melewati batas waktu pengembalian! Silakan hubungi nomor San Andreas penyewa atau proses pengembalian denda.
                        </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-black bg-rose-600 text-white shrink-0">
                        Perhatian Khusus
                    </span>
                </div>
            )}

            {/* Rentals Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            <th className="px-4 py-3">Penyewa &amp; Lisensi</th>
                            <th className="px-4 py-3">Unit Armada Truk</th>
                            <th className="px-4 py-3">Skema &amp; Waktu Sewa</th>
                            <th className="px-4 py-3">Petugas Penerbit</th>
                            <th className="px-4 py-3">Status &amp; Kondisi</th>
                            <th className="px-4 py-3">Biaya &amp; Denda</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRentals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-[36px] text-slate-300">
                                            no_crash
                                        </span>
                                        <p className="font-semibold">
                                            {statusFilter === 'active'
                                                ? 'Tidak ada truk yang sedang disewa saat ini. Semua unit siap beroperasi!'
                                                : 'Tidak ada data penyewaan yang cocok dengan filter.'}
                                        </p>
                                        {statusFilter === 'active' && availableVehiclesCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={onOpenRentalModal}
                                                className="mt-1 text-xs text-brand-600 hover:text-brand-800 font-bold cursor-pointer"
                                            >
                                                + Buat Transaksi Sewa Sekarang
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRentals.map((r) => {
                                const isIssuer = !r.admin_id || r.admin_id === currentUser?.id;
                                const issuerName = r.admin?.name || r.admin_name || 'Admin Penerbit';
                                const issuerPosition = r.admin?.position || (r.admin?.role === 'staff' ? 'Staff Operasional' : 'Administrator');

                                return (
                                    <tr key={r.id} className={`hover:bg-slate-50/70 transition-colors ${r.is_overdue ? 'bg-rose-50/20' : ''}`}>
                                        {/* 1. Renter & Licenses */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                                    <span>{r.renter_name}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 mt-1 text-[11px] font-mono">
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <span className="material-symbols-outlined text-[13px] text-brand-600">badge</span>
                                                        <span>KTP: <strong className="text-slate-800">{r.san_andreas_id_card || r.san_andreas_phone}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-500">
                                                        <span className="material-symbols-outlined text-[13px] text-slate-400">call</span>
                                                        <span>Kontak: <strong>{r.contact_phone || r.san_andreas_phone}</strong></span>
                                                    </div>
                                                </div>

                                                {/* Licenses badges */}
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {r.licenses && r.licenses.length > 0 ? (
                                                        r.licenses.map((lic) => (
                                                            <span
                                                                key={lic}
                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                                                    lic === 'trucker'
                                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                        : lic === 'lumber'
                                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                }`}
                                                            >
                                                                {lic === 'trucker' ? 'Trucker' : lic === 'lumber' ? 'Lumber' : 'Driver'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Tanpa Lisensi</span>
                                                    )}
                                                </div>

                                                {/* Contract number & MoU quick link */}
                                                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                                                    <a
                                                        href={r.mou_url || `/mou/${r.mou_code || r.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                                                        title="Buka Dokumen Kontrak MoU Publik"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px] text-brand-600">description</span>
                                                        <span>MoU Resmi</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const targetUrl = r.mou_url || `${window.location.origin}/mou/${r.mou_code || r.id}`;
                                                            navigator.clipboard?.writeText(targetUrl);
                                                            setCopiedRentalId(r.id);
                                                            setTimeout(() => setCopiedRentalId(null), 2000);
                                                        }}
                                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                                        title="Salin Link MoU untuk penyewa"
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">
                                                            {copiedRentalId === r.id ? 'check' : 'content_copy'}
                                                        </span>
                                                        <span>{copiedRentalId === r.id ? 'Tersalin' : 'Link'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Vehicle & Health Initial */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <div className="font-bold text-slate-900 text-xs">
                                                    {r.vehicle?.name || 'Unit Dihapus'}
                                                </div>
                                                <div className="font-mono text-[11px] font-semibold text-slate-600 mt-0.5">
                                                    {r.vehicle?.plate_number}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                                        {r.vehicle?.category?.name || 'Armada Hauling'}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Awal: {r.initial_health || 2000} HP
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 3. Schedule */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                                                        {r.duration} {r.rental_type}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-600">
                                                    <span className="text-slate-400">Mulai:</span> {r.start_time}
                                                </div>
                                                <div className="text-[11px] font-semibold text-slate-800">
                                                    <span className="text-slate-400">Batas:</span>{' '}
                                                    <span className={r.is_overdue ? 'text-rose-600 font-bold' : 'text-blue-700'}>
                                                        {r.expected_return_time}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Petugas Penerbit (Admin / Staff) */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                                                        {issuerName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                            <span className="truncate">{issuerName}</span>
                                                            {r.admin_id && r.admin_id === currentUser?.id && (
                                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-brand-700 shrink-0">
                                                                    Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 truncate" title={issuerPosition}>
                                                            {issuerPosition}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pl-9">
                                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                    <span>{r.created_at || r.start_time}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 5. Status & Condition */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1.5">
                                                {r.status === 'active' ? (
                                                    r.is_overdue ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                                                            <span className="material-symbols-outlined text-[14px]">warning</span>
                                                            <span>TERLAMBAT ({r.overdue_hours} Jam)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                                                            <span>Sedang Berjalan</span>
                                                        </span>
                                                    )
                                                ) : (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="material-symbols-outlined text-[13px]">done_all</span>
                                                            <span>Selesai Dikembalikan</span>
                                                        </span>
                                                        <div>{getConditionBadge(r.vehicle_condition, r.return_health ?? r.truck_health)}</div>
                                                        <div className="text-[10px] font-mono text-slate-500">
                                                            Kembali: {r.return_health ?? r.truck_health} HP
                                                            {(r.initial_health || 2000) - (r.return_health ?? r.truck_health) > 0 && (
                                                                <span className="text-rose-600 font-bold ml-1">
                                                                    (-{(r.initial_health || 2000) - (r.return_health ?? r.truck_health)} HP)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 6. Costs */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-0.5 text-xs">
                                                <div className="font-bold text-slate-900">
                                                    Rp {r.total_cost.toLocaleString('id-ID')}
                                                </div>
                                                {r.status === 'completed' && (r.late_penalty_fee > 0 || r.damage_fee > 0) ? (
                                                    <div className="text-[10px] text-slate-500 space-y-0.5">
                                                        {r.late_penalty_fee > 0 && (
                                                            <span className="text-rose-600 block">
                                                                + Telat: Rp {r.late_penalty_fee.toLocaleString('id-ID')}
                                                            </span>
                                                        )}
                                                        {r.damage_fee > 0 && (
                                                            <span className="text-amber-700 block font-semibold">
                                                                {r.damage_fee_type === 'insurance'
                                                                    ? `+ Asuransi: Rp ${r.damage_fee.toLocaleString('id-ID')}`
                                                                    : `+ Mechanic: Rp ${r.damage_fee.toLocaleString('id-ID')}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-slate-400">
                                                        Tarif: Rp {r.rate_per_unit.toLocaleString('id-ID')}/{r.rental_type}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 7. Action */}
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex flex-col items-end gap-1.5">
                                                {r.status === 'active' ? (
                                                    isIssuer ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReturnClick && handleReturnClick(r)}
                                                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                                                                r.is_overdue
                                                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                            }`}
                                                        >
                                                            <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                                                            <span>Pengembalian</span>
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold cursor-not-allowed select-none shadow-2xs"
                                                                title={`Hanya petugas penerbit (${issuerName}) yang berhak mengonfirmasi pengembalian unit.`}
                                                            >
                                                                <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                                                <span>Pengembalian</span>
                                                            </div>
                                                            <span className="text-[9px] font-semibold text-slate-400 max-w-[125px] text-right truncate">
                                                                Penerbit: {issuerName}
                                                            </span>
                                                        </div>
                                                    )
                                                ) : r.vehicle?.status === 'perawatan' ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                            <span className="material-symbols-outlined text-[12px]">build</span>
                                                            <span>Perawatan</span>
                                                        </span>
                                                        {onCompleteMaintenance && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onCompleteMaintenance(r.vehicle)}
                                                                className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                                                                title="Tandai perbaikan unit telah selesai & siap disewa"
                                                            >
                                                                <span className="material-symbols-outlined text-[13px]">build_circle</span>
                                                                <span>Selesai Servis</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        Terselesaikan
                                                    </span>
                                                )}

                                                <div className="flex items-center gap-1.5">
                                                    {r.status === 'completed' && r.invoice_url && (
                                                        <a
                                                            href={r.invoice_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                            title="Lihat & Cetak Kwitansi Resmi"
                                                        >
                                                            <span className="material-symbols-outlined text-[13px] text-emerald-600">receipt</span>
                                                            <span>Kwitansi</span>
                                                        </a>
                                                    )}

                                                    <a
                                                        href={r.mou_url || `/mou/${r.mou_code || r.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                                                        title="Lihat MoU Lengkap"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px] text-brand-600">visibility</span>
                                                        <span>Lihat MoU</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
