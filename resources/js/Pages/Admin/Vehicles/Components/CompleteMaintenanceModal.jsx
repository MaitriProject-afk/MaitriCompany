import { useForm } from '@inertiajs/react';

export default function CompleteMaintenanceModal({ isOpen, onClose, vehicle }) {
    if (!isOpen || !vehicle) return null;

    const { data, setData, post, processing, reset } = useForm({
        maintenance_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.vehicles.complete-maintenance', vehicle.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs animate-fadeIn overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden my-auto animate-scaleUp">
                {/* Header (Pinned) */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                            <span className="material-symbols-outlined text-[22px]">build_circle</span>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                                Selesai Perbaikan &amp; Servis
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Aktifkan kembali unit kendaraan ke status Tersedia (Ready)
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer transition-colors"
                        title="Tutup"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Body */}
                    <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                        {/* Unit Overview Card */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Rincian Unit Armada
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-base font-extrabold text-slate-900">
                                        {vehicle.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white tracking-wider">
                                            {vehicle.plate_number}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {vehicle.category?.name || 'Tanpa Kategori'}
                                        </span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                    <span className="material-symbols-outlined text-[14px]">build</span>
                                    <span>Dalam Perawatan</span>
                                </span>
                            </div>

                            {/* Recent notes if any */}
                            {vehicle.notes && (
                                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200 max-h-24 overflow-y-auto whitespace-pre-line leading-relaxed">
                                    {vehicle.notes}
                                </div>
                            )}
                        </div>

                        {/* Confirmation info banner */}
                        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">verified</span>
                            <div className="space-y-1">
                                <div className="font-extrabold">Unit Akan Siap Disewakan Kembali</div>
                                <div className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                                    Setelah konfirmasi, status unit akan otomatis berubah dari <strong className="font-bold text-amber-800">Perawatan</strong> menjadi <strong className="font-bold text-emerald-700">Tersedia (Ready)</strong> dan langsung muncul kembali di pilihan formulir sewa truk baru.
                                </div>
                            </div>
                        </div>

                        {/* Optional notes input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                <span>Catatan Perbaikan / Hasil Servis (Opsional)</span>
                                <span className="text-[11px] text-slate-400 font-normal">Tercatat di riwayat unit</span>
                            </label>
                            <textarea
                                rows={3}
                                value={data.maintenance_notes}
                                onChange={(e) => setData('maintenance_notes', e.target.value)}
                                placeholder="Contoh: Perbaikan mesin di bengkel selesai, ganti bumper baru, health unit kembali prima 2000 HP..."
                                className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-extrabold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">done_all</span>
                            <span>{processing ? 'Menyimpan...' : 'Konfirmasi Unit Selesai Servis & Siap'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
