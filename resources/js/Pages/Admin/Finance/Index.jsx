import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import InvoiceModal from './InvoiceModal';

export default function FinanceIndex({ stats, rentals, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [fineFilter, setFineFilter] = useState(filters.fine_type || 'all');
    const [periodFilter, setPeriodFilter] = useState(filters.period || 'all');
    const [selectedRentalForInvoice, setSelectedRentalForInvoice] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Apply client-side filter for instant responsiveness
    const filteredRentals = useMemo(() => {
        return rentals.filter((r) => {
            // Status filter
            if (statusFilter !== 'all' && r.status !== statusFilter) {
                return false;
            }

            // Fine type filter
            if (fineFilter === 'with_late' && r.late_penalty_fee <= 0) return false;
            if (fineFilter === 'with_damage' && r.damage_fee <= 0) return false;
            if (fineFilter === 'mechanic' && r.damage_fee_type !== 'mechanic') return false;
            if (fineFilter === 'insurance' && r.damage_fee_type !== 'insurance') return false;
            if (fineFilter === 'clean' && (r.late_penalty_fee > 0 || r.damage_fee > 0)) return false;

            // Search query
            if (search.trim()) {
                const q = search.toLowerCase();
                const matchName = r.renter_name?.toLowerCase().includes(q);
                const matchPhone = r.contact_phone?.toLowerCase().includes(q) || r.san_andreas_phone?.toLowerCase().includes(q);
                const matchIdCard = r.san_andreas_id_card?.toLowerCase().includes(q);
                const matchInvoice = r.invoice_number?.toLowerCase().includes(q);
                const matchContract = r.contract_number?.toLowerCase().includes(q);
                const matchTruck = r.vehicle?.name?.toLowerCase().includes(q) || r.vehicle?.plate_number?.toLowerCase().includes(q);
                const matchAdmin = r.admin?.name?.toLowerCase().includes(q);

                if (!matchName && !matchPhone && !matchIdCard && !matchInvoice && !matchContract && !matchTruck && !matchAdmin) {
                    return false;
                }
            }

            return true;
        });
    }, [rentals, statusFilter, fineFilter, search]);

    const handleCopyInvoiceUrl = (r) => {
        if (!r.invoice_url) return;
        navigator.clipboard.writeText(r.invoice_url);
        setCopiedId(r.id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handlePrintSummary = () => {
        window.print();
    };

    // Calculate percentage breakdown for visual bar
    const grossTotal = stats.total_gross_revenue || 1;
    const basePct = Math.round((stats.total_base_rental / grossTotal) * 100);
    const latePct = Math.round((stats.total_late_fines / grossTotal) * 100);
    const damagePct = Math.max(0, 100 - basePct - latePct);

    return (
        <AdminLayout activeMenu="keuangan">
            <Head title="Keuangan & Invoice - Maitri Company" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. TOP HEADER BANNER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Finance &amp; Revenue Ledger
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Pembukuan Kas Terverifikasi
                            </span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                                Audit Standar Maitri Enterprise
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Keuangan &amp; Pelaporan Invoice
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Rekapitulasi arus kas masuk operasional, pemisahan pos sewa pokok, penerimaan denda keterlambatan, serta pencatatan alokasi dana talangan perbaikan unit armada.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center print:hidden">
                        <button
                            type="button"
                            onClick={() => router.reload()}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">sync</span>
                            <span>Refresh Data</span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePrintSummary}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">print</span>
                            <span>Cetak Laporan Keuangan</span>
                        </button>
                    </div>
                </div>

                {/* 2. 4 KEY METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* A. Total Gross Revenue */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Total Kas Masuk (Gross)
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                                Rp {stats.total_gross_revenue.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                <span className="font-bold text-emerald-700">{stats.completed_count} Transaksi</span>
                                <span>telah lunas disetorkan</span>
                            </div>
                        </div>
                    </div>

                    {/* B. Net Operational Profit */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-brand-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Laba Bersih Perusahaan
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined text-[20px]">trending_up</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-brand-700 tracking-tight font-mono">
                                Rp {stats.net_profit.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                <span>Sewa Pokok + Denda Telat</span>
                                <span className="text-brand-600 font-bold">({basePct + latePct}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* C. Maintenance & Repair Fund */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-amber-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Alokasi Servis &amp; Klaim
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined text-[20px]">build_circle</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-amber-700 tracking-tight font-mono">
                                Rp {stats.total_damage_fines.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                <span>Mechanic: Rp {stats.mechanic_fines.toLocaleString('id-ID')}</span>
                                <span>• Insu: Rp {stats.insurance_fines.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* D. Late Fines Total */}
                    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group hover:border-rose-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Denda Keterlambatan
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined text-[20px]">timer</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-rose-700 tracking-tight font-mono">
                                Rp {stats.total_late_fines.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                <span>Kompensasi waktu armada</span>
                                <span className="text-rose-600 font-bold">({latePct}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FINANCIAL ALLOCATION INSIGHT CARD */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Kebijakan &amp; Struktur Akuntansi
                            </span>
                            <h3 className="text-base font-bold text-slate-900">
                                Distribusi Pos Penerimaan Kas Maitri Company
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                                Pembukuan Transparan
                            </span>
                        </div>
                    </div>

                    {/* Visual Segmented Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
                            <div
                                className="bg-brand-600 h-full transition-all"
                                style={{ width: `${basePct}%` }}
                                title={`Sewa Pokok: ${basePct}%`}
                            ></div>
                            <div
                                className="bg-rose-500 h-full transition-all"
                                style={{ width: `${latePct}%` }}
                                title={`Denda Telat: ${latePct}%`}
                            ></div>
                            <div
                                className="bg-amber-500 h-full transition-all"
                                style={{ width: `${damagePct}%` }}
                                title={`Alokasi Bengkel/Klaim: ${damagePct}%`}
                            ></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="w-3 h-3 rounded-full bg-brand-600 shrink-0 mt-0.5"></span>
                                <div>
                                    <span className="font-bold text-slate-800">1. Pendapatan Sewa Pokok ({basePct}%)</span>
                                    <p className="text-[11px] text-slate-500 font-mono">Rp {stats.total_base_rental.toLocaleString('id-ID')}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">100% Laba operasional perusahaan masuk ke kas inti.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 mt-0.5"></span>
                                <div>
                                    <span className="font-bold text-slate-800">2. Denda Keterlambatan ({latePct}%)</span>
                                    <p className="text-[11px] text-slate-500 font-mono">Rp {stats.total_late_fines.toLocaleString('id-ID')}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Laba tambahan kompensasi unit tertahan melewati batas waktu.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-0.5"></span>
                                <div>
                                    <span className="font-bold text-slate-800">3. Dana Talangan Pemulihan ({damagePct}%)</span>
                                    <p className="text-[11px] text-slate-500 font-mono">Rp {stats.total_damage_fines.toLocaleString('id-ID')}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Bukan laba murni — dialokasikan khusus untuk bayar montir mechanic / tebus insu.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. TABLE SECTION & FILTER BAR */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                    {/* Filter & Search Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === 'all'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Semua Transaksi ({rentals.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('completed')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === 'completed'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Lunas Dikembalikan ({stats.completed_count})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('active')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === 'active'
                                        ? 'bg-brand-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Sedang Berjalan ({stats.active_count})
                            </button>
                        </div>

                        {/* Fine Filter & Search */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            <select
                                value={fineFilter}
                                onChange={(e) => setFineFilter(e.target.value)}
                                className="text-xs font-semibold rounded-xl border-slate-200 bg-white py-2 px-3 text-slate-700 focus:border-brand-500 focus:ring-brand-500 shadow-2xs"
                            >
                                <option value="all">Semua Kategori Biaya</option>
                                <option value="clean">Bersih Tanpa Denda</option>
                                <option value="with_late">Ada Denda Telat</option>
                                <option value="with_damage">Ada Denda Kerusakan</option>
                                <option value="mechanic">Biaya Bengkel Mechanic</option>
                                <option value="insurance">Biaya Tebus Asuransi</option>
                            </select>

                            <div className="relative min-w-[220px]">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari invoice, penyewa, plat..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/70 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-3 px-4">No. Invoice &amp; Waktu</th>
                                    <th className="py-3 px-4">Pelanggan / Penyewa</th>
                                    <th className="py-3 px-4">Armada Truk</th>
                                    <th className="py-3 px-4 text-right">Sewa Pokok</th>
                                    <th className="py-3 px-4 text-right">Denda Telat</th>
                                    <th className="py-3 px-4 text-right">Denda Reparasi</th>
                                    <th className="py-3 px-4 text-right">Total Bayar</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4">Kasir / Penerbit</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {filteredRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-[36px] text-slate-300">
                                                    receipt_long
                                                </span>
                                                <p className="font-semibold text-slate-600">
                                                    Tidak ada catatan invoice atau transaksi yang cocok dengan filter.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRentals.map((r) => {
                                        const isCompleted = r.status === 'completed';
                                        const hasLateFee = r.late_penalty_fee > 0;
                                        const hasDamageFee = r.damage_fee > 0;

                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* 1. Invoice & Date */}
                                                <td className="py-3.5 px-4 font-mono">
                                                    <div className="font-bold text-slate-900 flex items-center gap-1">
                                                        <span>{r.invoice_number}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                                                        {r.actual_return_time || r.created_at}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-mono">
                                                        MoU: {r.contract_number}
                                                    </div>
                                                </td>

                                                {/* 2. Renter */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-xs">
                                                        {r.renter_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex flex-col">
                                                        <span>KTP: {r.san_andreas_id_card}</span>
                                                        <span>Telp: {r.contact_phone}</span>
                                                    </div>
                                                </td>

                                                {/* 3. Truck */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-800">
                                                        {r.vehicle?.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-mono">
                                                        Plat: {r.vehicle?.plate_number}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400">
                                                        {r.duration} {r.rental_type}
                                                    </div>
                                                </td>

                                                {/* 4. Base Rental Fee */}
                                                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                                                    Rp {r.rental_price.toLocaleString('id-ID')}
                                                </td>

                                                {/* 5. Late Fee */}
                                                <td className="py-3.5 px-4 text-right font-mono">
                                                    {hasLateFee ? (
                                                        <div>
                                                            <span className="font-bold text-rose-700">
                                                                + Rp {r.late_penalty_fee.toLocaleString('id-ID')}
                                                            </span>
                                                            <div className="text-[9px] text-rose-600 font-sans">
                                                                Telat {r.late_duration_hours} Jam
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">Rp 0</span>
                                                    )}
                                                </td>

                                                {/* 6. Damage Fee */}
                                                <td className="py-3.5 px-4 text-right font-mono">
                                                    {hasDamageFee ? (
                                                        <div>
                                                            <span className="font-bold text-amber-700">
                                                                + Rp {r.damage_fee.toLocaleString('id-ID')}
                                                            </span>
                                                            <div className="text-[9px] text-amber-800 font-sans font-semibold">
                                                                {r.damage_fee_type === 'insurance' ? 'Klaim Insu' : 'Mechanic'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">Rp 0</span>
                                                    )}
                                                </td>

                                                {/* 7. Total Cost */}
                                                <td className="py-3.5 px-4 text-right font-mono">
                                                    <div className="font-extrabold text-xs text-slate-900">
                                                        Rp {r.total_cost.toLocaleString('id-ID')}
                                                    </div>
                                                    {hasDamageFee && (
                                                        <div className="text-[9px] text-slate-400 font-sans">
                                                            (Laba: Rp {(r.rental_price + r.late_penalty_fee).toLocaleString('id-ID')})
                                                        </div>
                                                    )}
                                                </td>

                                                {/* 8. Status */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                            <span>Lunas</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                                                            <span>Berjalan</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 9. Cashier Admin */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-xs">
                                                        {r.admin?.name || 'Administrator'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={r.admin?.position}>
                                                        {r.admin?.position || 'Staff Operasional'}
                                                    </div>
                                                </td>

                                                {/* 10. Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedRentalForInvoice(r)}
                                                            className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[10px] border border-brand-200 transition-colors flex items-center gap-1 cursor-pointer"
                                                            title="Buka / Cetak Kwitansi Resmi"
                                                        >
                                                            <span className="material-symbols-outlined text-[13px]">receipt</span>
                                                            <span>Kwitansi</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyInvoiceUrl(r)}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                            title="Salin Tautan Invoice Publik"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                {copiedId === r.id ? 'check' : 'share'}
                                                            </span>
                                                        </button>

                                                        <a
                                                            href={r.mou_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                            title="Buka Dokumen MoU Kontrak"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">description</span>
                                                        </a>
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
            </div>

            {/* In-app Printable Invoice Modal */}
            <InvoiceModal
                isOpen={Boolean(selectedRentalForInvoice)}
                onClose={() => setSelectedRentalForInvoice(null)}
                rental={selectedRentalForInvoice}
            />
        </AdminLayout>
    );
}
