import { useState } from 'react';

export default function InvoiceModal({ isOpen, onClose, rental }) {
    if (!isOpen || !rental) return null;

    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (!rental.invoice_url) return;
        navigator.clipboard.writeText(rental.invoice_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    const isMechanic = rental.damage_fee_type === 'mechanic';
    const isInsurance = rental.damage_fee_type === 'insurance';
    const hasDamage = rental.damage_fee > 0;
    const hasLate = rental.late_penalty_fee > 0;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-none">
                {/* Modal Action Bar (Hidden on Print) */}
                <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-brand-400">receipt_long</span>
                        <span className="font-bold text-sm tracking-wide">Kwitansi &amp; Invoice Resmi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <span className="material-symbols-outlined text-[15px]">print</span>
                            <span>Cetak Kwitansi</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Container */}
                <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs print:p-8" id="printable-invoice">
                    {/* Header Kop Surat */}
                    <div className="flex items-start justify-between border-b-2 border-slate-900/80 pb-5">
                        <div className="flex items-center gap-3.5">
                            <img
                                alt="Maitri Company"
                                className="h-12 w-auto object-contain"
                                src="/images/maitricomplogo.png"
                            />
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                    MAITRI COMPANY
                                </h2>
                                <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
                                    Divisi Logistik &amp; Armada Niaga
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Maitri HQ Verona Beach No 12 Los Santos, San Andreas
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] uppercase tracking-wider">
                                LUNAS / PAID
                            </span>
                            <div className="mt-1 font-mono text-[11px] font-bold text-slate-900">
                                {rental.invoice_number}
                            </div>
                            <div className="text-[10px] text-slate-500">
                                Tanggal: {rental.actual_return_time || rental.created_at}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid (Pihak & Unit) */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        {/* Pihak Penyewa */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Diterima Dari (Penyewa):
                            </span>
                            <div className="font-bold text-sm text-slate-900">{rental.renter_name}</div>
                            <div className="text-[11px] text-slate-600 font-mono">
                                No. ID Card / KTP: <strong className="text-slate-800">{rental.san_andreas_id_card}</strong>
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono">
                                No. Telepon: <strong className="text-slate-800">{rental.contact_phone}</strong>
                            </div>
                        </div>

                        {/* Kasir & Kontrak */}
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Referensi &amp; Kasir Penerbit:
                            </span>
                            <div className="font-mono text-[11px] font-bold text-brand-700">
                                MoU: {rental.contract_number}
                            </div>
                            <div className="text-[11px] text-slate-800 font-semibold">
                                Petugas: {rental.admin?.name || 'Administrator'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                                {rental.admin?.position || 'Staff Operasional'}
                            </div>
                        </div>
                    </div>

                    {/* Unit Armada Info Strip */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-[11px]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-brand-600">local_shipping</span>
                            <span className="font-bold text-slate-900">
                                {rental.vehicle?.name || 'Armada'} ({rental.vehicle?.plate_number || '-'})
                            </span>
                            <span className="text-slate-500">• {rental.vehicle?.category || 'Kategori Truk'}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-slate-500">Health:</span>
                            <span className="font-bold text-slate-700">Awal {rental.initial_health} HP</span>
                            <span className="text-slate-400">→</span>
                            <span className={`font-bold ${rental.return_health < rental.initial_health ? 'text-amber-700' : 'text-emerald-700'}`}>
                                Kembali {rental.return_health} HP
                            </span>
                        </div>
                    </div>

                    {/* Itemized Table of Costs */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/90 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="py-2.5 px-4">Deskripsi Pos Keuangan</th>
                                    <th className="py-2.5 px-3 text-center">Durasi / Satuan</th>
                                    <th className="py-2.5 px-3 text-right">Tarif</th>
                                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {/* 1. Sewa Pokok */}
                                <tr>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-900">
                                            Biaya Pokok Sewa Armada
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Sewa operasional resmi unit {rental.vehicle?.name} ({rental.duration} {rental.rental_type})
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono">
                                        {rental.duration} {rental.rental_type}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                                        Rp {rental.rate_per_unit?.toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                        Rp {rental.rental_price?.toLocaleString('id-ID')}
                                    </td>
                                </tr>

                                {/* 2. Denda Keterlambatan */}
                                <tr>
                                    <td className="py-3 px-4">
                                        <div className={`font-bold ${hasLate ? 'text-rose-700' : 'text-slate-800'}`}>
                                            Denda Keterlambatan Pengembalian
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {hasLate
                                                ? `Terlambat ${rental.late_duration_hours} jam dari batas pengembalian (${rental.expected_return_time})`
                                                : 'Tepat waktu — Bebas denda keterlambatan'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono">
                                        {hasLate ? `${rental.late_duration_hours} Jam` : '-'}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                                        {hasLate ? 'Sanksi Waktu' : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold">
                                        {hasLate ? (
                                            <span className="text-rose-700">+ Rp {rental.late_penalty_fee?.toLocaleString('id-ID')}</span>
                                        ) : (
                                            <span className="text-slate-400">Rp 0</span>
                                        )}
                                    </td>
                                </tr>

                                {/* 3. Denda Kerusakan / Mechanic / Asuransi */}
                                <tr>
                                    <td className="py-3 px-4">
                                        <div className={`font-bold ${hasDamage ? 'text-amber-800' : 'text-slate-800'}`}>
                                            Kompensasi Kerusakan Fisik / Pemulihan Unit
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {isInsurance
                                                ? 'Truk Meledak / Rusak Total (Health 0) — Biaya Klaim Tebus Asuransi'
                                                : isMechanic
                                                ? `Penurunan ${rental.initial_health - rental.return_health} HP (> 100 HP) — Alokasi Biaya Reparasi Bengkel Mechanic`
                                                : 'Penurunan dalam batas toleransi wajar (≤ 100 HP) — Bebas Biaya Reparasi'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono">
                                        {hasDamage ? (isInsurance ? 'Asuransi' : 'Mechanic') : 'Normal'}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                                        {hasDamage ? 'Dana Servis' : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold">
                                        {hasDamage ? (
                                            <span className="text-amber-700">+ Rp {rental.damage_fee?.toLocaleString('id-ID')}</span>
                                        ) : (
                                            <span className="text-slate-400">Rp 0</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 text-white font-bold">
                                    <td colSpan="3" className="py-3.5 px-4 text-right text-xs uppercase tracking-wider">
                                        TOTAL KAS DIBAYARKAN (LUNAS):
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono text-base font-extrabold text-emerald-400">
                                        Rp {rental.total_cost?.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Accounting Notes & Allocation Breakdown */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-950">
                            <span className="material-symbols-outlined text-[13px]">account_balance</span>
                            <span>Catatan Pembukuan Arus Kas Perusahaan:</span>
                        </div>
                        <p className="leading-relaxed">
                            • <strong>Kas Masuk Perusahaan (Laba Bersih):</strong> Rp {(rental.rental_price + rental.late_penalty_fee)?.toLocaleString('id-ID')} (Sewa Pokok + Denda Telat).
                        </p>
                        {hasDamage && (
                            <p className="leading-relaxed">
                                • <strong>Alokasi Dana Talangan Pemulihan:</strong> Rp {rental.damage_fee?.toLocaleString('id-ID')} dialokasikan khusus untuk pembayaran mekanik bengkel / asuransi unit armada {rental.vehicle?.name}.
                            </p>
                        )}
                    </div>

                    {/* Signatures & Stamp */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 items-end">
                        <div className="space-y-12">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Penyewa / Pihak Kedua:
                                </span>
                                <div className="h-14"></div>
                                <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5 inline-block min-w-[160px]">
                                    {rental.renter_name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                    KTP: {rental.san_andreas_id_card}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12 text-right relative">
                            {/* Paid Stamp Watermark */}
                            <div className="absolute right-8 top-0 pointer-events-none select-none border-4 border-emerald-600/40 text-emerald-700/40 rounded-xl px-4 py-1 text-xl font-black uppercase tracking-widest rotate-[-12deg]">
                                LUNAS PAID
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Petugas Kasir &amp; Penerbit:
                                </span>
                                <div className="h-14"></div>
                                <div className="font-bold text-slate-900 border-b border-slate-300 pb-0.5 inline-block min-w-[160px]">
                                    {rental.admin?.name || 'Administrator'}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {rental.admin?.position || 'Staff Operasional'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer System Hash */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>Maitri Enterprise OS v2.4 • Financial Audit Verified</span>
                        <span>Doc Code: {rental.invoice_code}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
