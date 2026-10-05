import { Link } from '@inertiajs/react';

export default function FleetLogisticsPillar({ dispatches = [], stats = {} }) {
    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const activeCount = stats.rentals_active || 0;
    const totalCount = stats.rentals_total || 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Header Divisi Armada */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                            Divisi Logistik &amp; Armada Niaga
                        </h2>
                        <p className="text-xs text-slate-500">
                            Pantauan Kontrak Sewa Truk, Dispatch Warga &amp; Validasi Pengembalian
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-brand-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
                        {activeCount} Sedang Disewa • {totalCount} Total Riwayat
                    </span>
                </div>
            </div>

            {/* Live Dispatches Table Container */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-slate-800 font-extrabold">
                            Manifest Dispatch &amp; Sewa Terbaru
                        </span>
                        {activeCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.vehicles.index')}
                            className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                            <span>Kelola Seluruh Armada ({stats.vehicles_total || 0})</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {dispatches.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">local_shipping</span>
                            <p className="text-sm font-semibold text-slate-600">Belum ada riwayat sewa atau dispatch unit.</p>
                            <p className="text-xs text-slate-400 mt-1">Sewa yang diterbitkan oleh Admin/Staff akan muncul otomatis di sini.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-4 py-3 font-bold">No. Kontrak &amp; Unit</th>
                                    <th className="px-4 py-3 font-bold">Penyewa</th>
                                    <th className="px-4 py-3 font-bold">Durasi &amp; Status</th>
                                    <th className="px-4 py-3 font-bold">Jadwal Selesai</th>
                                    <th className="px-4 py-3 font-bold text-right">Biaya / Dokumen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {dispatches.map((d) => (
                                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-slate-900 font-mono text-[11px]">
                                                {d.contract_number}
                                            </div>
                                            <div className="text-slate-600 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-semibold text-slate-800">{d.vehicle_name}</span>
                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                                                    {d.plate_number}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Kategori: {d.category_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-slate-900">
                                                {d.renter_name}
                                            </div>
                                            <div className="text-slate-500 font-mono text-[11px]">
                                                Telp: {d.san_andreas_phone || d.contact_phone || '-'}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Petugas: {d.admin_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="mb-1 font-semibold text-slate-700 capitalize">
                                                {d.duration} {d.rental_type}
                                            </div>
                                            {d.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    <span className="material-symbols-outlined text-[12px]">check</span>
                                                    Selesai Dikembalikan
                                                </span>
                                            ) : d.is_overdue ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 animate-pulse">
                                                    <span className="material-symbols-outlined text-[12px]">warning</span>
                                                    Terlambat (+{d.overdue_hours}j)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-700 border border-blue-200/60">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
                                                    Sedang Disewa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-slate-700">
                                                {d.status === 'completed' && d.actual_return_time ? d.actual_return_time : d.expected_return_time}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Mulai: {d.start_time}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="font-extrabold text-slate-900">
                                                {formatRupiah(d.total_cost)}
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                                <a
                                                    href={route('rentals.mou', d.mou_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                                                    title="Buka Dokumen MoU Publik"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">description</span>
                                                    <span>MoU</span>
                                                </a>
                                                <a
                                                    href={route('rentals.invoice', d.invoice_code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] transition-colors"
                                                    title="Buka Invoice Resmi"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                                    <span>Invoice</span>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
