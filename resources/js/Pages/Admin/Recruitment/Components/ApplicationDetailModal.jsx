import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ApplicationDetailModal({ isOpen, onClose, application }) {
    if (!isOpen || !application) return null;

    const { data, setData, patch, processing } = useForm({
        status: application.status || 'pending',
        admin_notes: application.admin_notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.recruitment.applications.update', application.id), {
            onSuccess: () => onClose(),
        });
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'accepted':
                return { label: 'Diterima Jadi Karyawan', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
            case 'interview':
                return { label: 'Tahap Wawancara HQ', bg: 'bg-blue-100 text-brand-800 border-blue-300' };
            case 'rejected':
                return { label: 'Ditolak', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
            default:
                return { label: 'Menunggu Seleksi Berkas', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
        }
    };

    const statusBadge = getStatusBadge(application.status);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                                #{application.ticket_number}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                                {statusBadge.label}
                            </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                            Lamaran: {application.full_name} — {application.position_title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
                    {/* 1. DATA KARAKTER (IC) */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-brand-700">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            <span>Data Karakter Pelamar (In-Character / IC)</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Nama Karakter</span>
                                <span className="font-bold text-slate-900">{application.full_name}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Email Akun</span>
                                <span>{application.email}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">No. HP San Andreas</span>
                                <span className="font-mono font-bold text-slate-900">{application.sa_phone}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">No. KTP / ID Card</span>
                                <span className="font-mono font-bold text-slate-900">{application.sa_id_card}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Usia Karakter</span>
                                <span>{application.age} Tahun</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Domisili</span>
                                <span>{application.domicile || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Pengalaman Kerja</span>
                                <span className="capitalize">{application.experience_level?.replace(/_/g, ' ') || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Ketersediaan Shift</span>
                                <span className="capitalize">{application.shift?.replace(/_/g, ' ') || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Akun Pengguna</span>
                                <span>{application.user?.name} (ID: #{application.user?.id})</span>
                            </div>
                        </div>

                        {/* Lisensi yang dimiliki */}
                        <div className="pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Lisensi yang Dimiliki:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(application.licenses) && application.licenses.length > 0 ? (
                                    application.licenses.map((lic, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-[11px] text-slate-700">
                                            ✓ {lic}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 italic">Tidak mencantumkan lisensi</span>
                                )}
                            </div>
                        </div>

                        {/* Jawaban Pertanyaan IC Tambahan */}
                        {application.ic_answers && Object.keys(application.ic_answers).length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Jawaban Kustom IC / Khusus Divisi:</span>
                                {Object.entries(application.ic_answers).map(([key, val], idx) => (
                                    <div key={idx} className="p-2 rounded bg-white border border-slate-200 text-slate-700">
                                        <span className="font-bold text-[10px] text-brand-700 block uppercase">{key.replace(/_/g, ' ')}</span>
                                        <p className="mt-0.5 whitespace-pre-wrap">{val || '-'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Motivasi */}
                        {application.motivation && (
                            <div className="pt-2 border-t border-slate-200/60">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Motivasi &amp; Alasan Melamar:</span>
                                <p className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed italic">
                                    "{application.motivation}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 2. DATA OOC (OUT OF CHARACTER) */}
                    {application.ooc_answers && Object.keys(application.ooc_answers).length > 0 && (
                        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                            <div className="font-extrabold text-purple-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                                <span className="material-symbols-outlined text-[16px]">psychology</span>
                                <span>Jawaban Seksi OOC (Out of Character Pelamar)</span>
                            </div>

                            <div className="space-y-2.5">
                                {Object.entries(application.ooc_answers).map(([key, val], idx) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-purple-100">
                                        <span className="text-[10px] font-bold text-purple-700 block uppercase">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        <p className="text-slate-800 font-medium mt-0.5 whitespace-pre-wrap leading-relaxed">
                                            {val || '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. REVIEW FORM OLEH ADMIN / HRD */}
                    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                        <div className="font-extrabold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <span className="material-symbols-outlined text-[16px]">rate_review</span>
                            <span>Keputusan Seleksi HRD / Admin</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Ubah Status Lamaran:
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                >
                                    <option value="pending">Menunggu Seleksi Berkas (Pending)</option>
                                    <option value="interview">Tahap Wawancara di HQ Verona Beach</option>
                                    <option value="accepted">Diterima Menjadi Karyawan (Lolos)</option>
                                    <option value="rejected">Ditolak (Tidak Memenuhi Syarat)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Catatan / Feedback untuk Pelamar:
                                </label>
                                <input
                                    type="text"
                                    value={data.admin_notes}
                                    onChange={(e) => setData('admin_notes', e.target.value)}
                                    placeholder="Contoh: Datang ke HQ besok jam 19.00 / Harap hubungi Discord..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-slate-500">
                                {application.reviewer && (
                                    <span>Terakhir ditinjau oleh: <strong>{application.reviewer.name}</strong></span>
                                )}
                            </span>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Perbarui Status Seleksi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
