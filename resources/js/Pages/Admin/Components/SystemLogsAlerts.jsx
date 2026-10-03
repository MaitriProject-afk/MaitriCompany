export default function SystemLogsAlerts() {
    const alerts = [
        {
            icon: 'build',
            iconBg: 'bg-amber-100 text-amber-800',
            title: 'Jadwal Servis Berkala Armada',
            time: '10 mnt lalu',
            desc: '8 Unit Scania Heavy Duty di Hub Cikampek memerlukan inspeksi oli gardan & kalibrasi rem ABS.',
        },
        {
            icon: 'thumb_up',
            iconBg: 'bg-emerald-100 text-emerald-800',
            title: 'Persetujuan Desain 3D Diterima',
            time: '42 mnt lalu',
            desc: 'Klien Fintech SCBD telah menyetujui layout mezzanine executive lounge. Pengadaan material dimulai.',
        },
        {
            icon: 'verified_user',
            iconBg: 'bg-blue-100 text-brand-800',
            title: 'Surat Jalan e-POD #MT-8812 Valid',
            time: '1 jam lalu',
            desc: 'Penerima di Semarang telah menandatangani digital receipt lengkap dengan foto stempel gudang.',
        },
    ];

    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Log &amp; Peringatan Sistem
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                        Tandai Dibaca
                    </button>
                </div>

                {/* Alerts List */}
                <div className="flex flex-col gap-2.5">
                    {alerts.map((a, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 transition-colors"
                        >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${a.iconBg}`}>
                                <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                            </span>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-800 truncate">
                                        {a.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                        {a.time}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    {a.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span>Integritas Data: Sinkron 100%</span>
                </span>
                <button
                    type="button"
                    className="text-brand-600 hover:text-brand-700 font-bold cursor-pointer"
                >
                    Lihat Audit Trail →
                </button>
            </div>
        </div>
    );
}
