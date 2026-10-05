import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function RentalInvoice({ invoice }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isMechanic = invoice.damage_fee_type === 'mechanic';
    const isInsurance = invoice.damage_fee_type === 'insurance';
    const hasDamage = invoice.damage_fee > 0;
    const hasLate = invoice.late_penalty_fee > 0;

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 py-6 sm:py-10 px-3 sm:px-6 font-sans print:bg-white print:p-0 print:text-black">
            <Head title={`Invoice #${invoice.invoice_number} - ${invoice.renter_name} | Maitri Company`} />

            {/* Action Bar (Hidden on Print) */}
            <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200/90 print:hidden">
                <div className="flex items-center gap-2.5">
                    <img
                        alt="Maitri Company"
                        className="h-8 w-auto object-contain"
                        src="/images/maitricomplogo.png"
                    />
                    <div>
                        <div className="text-xs font-black text-slate-900 leading-tight">
                            Kwitansi Pelunasan &amp; Invoice Resmi
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            {invoice.invoice_number}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300/70 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {copied ? 'check' : 'content_copy'}
                        </span>
                        <span>{copied ? 'Link Tersalin!' : 'Salin Tautan'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Cetak Kwitansi / PDF</span>
                    </button>
                    <Link
                        href="/"
                        className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold transition-all"
                    >
                        Beranda
                    </Link>
                </div>
            </div>

            {/* Main Printable Document Card */}
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md border border-slate-200/80 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:max-w-none">
                {/* Header Kop Surat Perusahaan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-6">
                    <div className="flex items-center gap-4">
                        <img
                            alt="Maitri Company Logo"
                            className="h-16 w-auto object-contain"
                            src="/images/maitricomplogo.png"
                        />
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                {invoice.company.name}
                            </h1>
                            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mt-0.5">
                                {invoice.company.division}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                                {invoice.company.hq_address}
                            </p>
                        </div>
                    </div>

                    <div className="text-left sm:text-right flex flex-col sm:items-end">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs uppercase tracking-wider">
                            LUNAS / PAID
                        </span>
                        <div className="mt-2 font-mono text-sm font-bold text-slate-900">
                            {invoice.invoice_number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Waktu Cetak: {invoice.payment_date}
                        </div>
                    </div>
                </div>

                {/* Sub-header Information Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Diterima Dari (Pihak Penyewa):
                        </span>
                        <div className="text-base font-extrabold text-slate-900">{invoice.renter_name}</div>
                        <div className="text-slate-600 font-mono text-[11px]">
                            No. KTP / San Andreas ID: <strong className="text-slate-900">{invoice.san_andreas_id_card}</strong>
                        </div>
                        <div className="text-slate-600 font-mono text-[11px]">
                            Kontak Telepon: <strong className="text-slate-900">{invoice.contact_phone}</strong>
                        </div>
                    </div>

                    <div className="space-y-1 text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Informasi Transaksi &amp; Kasir:
                        </span>
                        <div className="font-mono text-xs font-bold text-brand-700">
                            Kontrak: {invoice.contract_number}
                        </div>
                        <div className="text-slate-900 font-semibold text-xs">
                            Kasir: {invoice.admin?.name || 'Administrator'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Jabatan: {invoice.admin?.position || 'Staff Operasional'}
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                        </div>
                        <div>
                            <div className="font-extrabold text-sm text-slate-900">
                                {invoice.vehicle?.name} ({invoice.vehicle?.plate_number})
                            </div>
                            <div className="text-slate-500 text-[11px]">
                                {invoice.vehicle?.category || 'Kategori Armada Niaga'} • Disewa {invoice.duration} {invoice.rental_type}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs bg-white px-3.5 py-2 rounded-xl border border-blue-200/50">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Health Awal</div>
                            <div className="font-extrabold text-slate-800">{invoice.initial_health} HP</div>
                        </div>
                        <span className="text-slate-300 font-bold">→</span>
                        <div className="text-center">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Health Kembali</div>
                            <div className={`font-extrabold ${invoice.return_health < invoice.initial_health ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {invoice.return_health} HP
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Table Itemized */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="py-3 px-5">Rincian Pos Pembayaran</th>
                                <th className="py-3 px-4 text-center">Durasi / Kondisi</th>
                                <th className="py-3 px-4 text-right">Tarif</th>
                                <th className="py-3 px-5 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* 1. Sewa Pokok */}
                            <tr>
                                <td className="py-3.5 px-5">
                                    <div className="font-bold text-slate-900 text-sm">Biaya Pokok Sewa Armada</div>
                                    <div className="text-[11px] text-slate-500">
                                        Penyewaan operasional truk {invoice.vehicle?.name} ({invoice.duration} {invoice.rental_type})
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono">
                                    {invoice.duration} {invoice.rental_type}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                    Rp {invoice.rate_per_unit?.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                                    Rp {invoice.rental_price?.toLocaleString('id-ID')}
                                </td>
                            </tr>

                            {/* 2. Denda Keterlambatan */}
                            <tr>
                                <td className="py-3.5 px-5">
                                    <div className={`font-bold text-sm ${hasLate ? 'text-rose-700' : 'text-slate-800'}`}>
                                        Denda Keterlambatan Waktu
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {hasLate
                                            ? `Terlambat ${invoice.late_duration_hours} jam melewati batas sewa (${invoice.expected_return_time})`
                                            : 'Pengembalian tepat waktu — Bebas sanksi keterlambatan'}
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono">
                                    {hasLate ? `${invoice.late_duration_hours} Jam` : '-'}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                    {hasLate ? 'Sanksi Jam' : '-'}
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono font-bold text-sm">
                                    {hasLate ? (
                                        <span className="text-rose-700">+ Rp {invoice.late_penalty_fee?.toLocaleString('id-ID')}</span>
                                    ) : (
                                        <span className="text-slate-400">Rp 0</span>
                                    )}
                                </td>
                            </tr>

                            {/* 3. Kompensasi Kerusakan */}
                            <tr>
                                <td className="py-3.5 px-5">
                                    <div className={`font-bold text-sm ${hasDamage ? 'text-amber-800' : 'text-slate-800'}`}>
                                        Kompensasi Kondisi Fisik &amp; Pemulihan Unit
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        {isInsurance
                                            ? 'Unit Meledak / Hancur Total (Health 0) — Biaya Penggantian Tebus Asuransi'
                                            : isMechanic
                                            ? `Penurunan ${invoice.initial_health - invoice.return_health} HP (> 100 HP) — Alokasi Biaya Servis Bengkel Mechanic`
                                            : 'Kondisi wajar / penurunan ≤ 100 HP — Bebas Denda Kerusakan'}
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono">
                                    {hasDamage ? (isInsurance ? 'Asuransi' : 'Mechanic') : 'Normal'}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                    {hasDamage ? 'Dana Reparasi' : '-'}
                                </td>
                                <td className="py-3.5 px-5 text-right font-mono font-bold text-sm">
                                    {hasDamage ? (
                                        <span className="text-amber-700">+ Rp {invoice.damage_fee?.toLocaleString('id-ID')}</span>
                                    ) : (
                                        <span className="text-slate-400">Rp 0</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white">
                                <td colSpan="3" className="py-4 px-5 text-right text-xs uppercase tracking-wider font-bold">
                                    TOTAL KAS DIBAYARKAN (LUNAS):
                                </td>
                                <td className="py-4 px-5 text-right font-mono text-lg font-black text-emerald-400">
                                    Rp {invoice.total_cost?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Accounting Note Alert */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1 mb-8">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <span className="material-symbols-outlined text-[16px]">account_balance</span>
                        <span>Penjelasan Pos Arus Kas Perusahaan (Accounting Policy):</span>
                    </div>
                    <p className="leading-relaxed">
                        • <strong>Kas Masuk Perusahaan (Laba Operasional Bersih):</strong> Rp {(invoice.rental_price + invoice.late_penalty_fee)?.toLocaleString('id-ID')} (Sewa Pokok + Denda Keterlambatan Waktu).
                    </p>
                    {hasDamage && (
                        <p className="leading-relaxed">
                            • <strong>Alokasi Dana Talangan Pemulihan Armada:</strong> Rp {invoice.damage_fee?.toLocaleString('id-ID')} dicatat sebagai kas talangan khusus yang wajib disetorkan/dibayarkan ke bengkel mechanic untuk perbaikan unit {invoice.vehicle?.name}.
                        </p>
                    )}
                </div>

                {/* Signature & Watermark Stamp */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end relative">
                    {/* Watermark Stamp */}
                    <div className="absolute right-12 top-4 pointer-events-none select-none border-4 border-emerald-600/35 text-emerald-700/35 rounded-2xl px-6 py-2 text-2xl font-black uppercase tracking-widest rotate-[-12deg]">
                        LUNAS / PAID
                    </div>

                    <div className="space-y-14">
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Pihak Kedua (Penyewa):
                            </span>
                            <div className="h-16"></div>
                            <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5 inline-block min-w-[200px]">
                                {invoice.renter_name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                KTP: {invoice.san_andreas_id_card}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-14 text-left sm:text-right">
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Pihak Pertama (Petugas Kasir):
                            </span>
                            <div className="h-16"></div>
                            <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5 inline-block min-w-[200px]">
                                {invoice.admin?.name || 'Administrator Utama'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                {invoice.admin?.position || 'Chief Executive Officer'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Hash & Audit */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Maitri Enterprise OS v2.4 • Finance &amp; Accounting Audited</span>
                    <span>Document Code: {invoice.invoice_code}</span>
                </div>
            </div>
        </div>
    );
}
