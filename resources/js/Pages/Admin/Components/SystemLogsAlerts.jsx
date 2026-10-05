import { Link } from '@inertiajs/react';

export default function SystemLogsAlerts({ logs = [] }) {
    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between w-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Log Aktivitas &amp; Peringatan Armada
                        </h3>
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">
                        Sistem Otomatis
                    </span>
                </div>

                {/* Alerts List */}
                <div className="flex flex-col gap-2.5">
                    {logs.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                            <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">verified_user</span>
                            <p className="text-xs font-semibold text-slate-600">Semua sistem armada berjalan normal.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Belum ada peringatan atau catatan insiden.</p>
                        </div>
                    ) : (
                        logs.map((a, idx) => (
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
                                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                        {a.desc}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Status */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span>Sinkronisasi Database Aktif</span>
                </span>
                <Link
                    href={route('admin.vehicles.index')}
                    className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
                >
                    Lihat Manajemen Armada →
                </Link>
            </div>
        </div>
    );
}
