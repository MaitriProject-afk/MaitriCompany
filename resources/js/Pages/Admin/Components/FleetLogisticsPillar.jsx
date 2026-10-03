export default function FleetLogisticsPillar() {
    const dispatches = [
        {
            id: '#DSP-99214',
            unit: 'B 9421 UXT • Scania R450 Wingbox',
            origin: 'Jakarta (Marunda)',
            dest: 'Surabaya (Tanjung Perak)',
            cargo: 'FMCG Retail Unilever • 24.5 Ton',
            status: 'Dalam Perjalanan (Tol Cipali KM 164)',
            statusType: 'success',
            eta: '19:30 WIB',
            etaNote: 'Sesuai Jadwal',
        },
        {
            id: '#DSP-99208',
            unit: 'B 8820 KLO • Reefer ThermoKing 20ft',
            origin: 'Medan (Belawan)',
            dest: 'Pekanbaru (Riau Hub)',
            cargo: 'Bahan Farmasi & Vaksin • Temp -18°C',
            status: 'Bongkar Muatan (DC Pekanbaru)',
            statusType: 'info',
            eta: '11:15 WIB',
            etaNote: 'Progress 65%',
        },
        {
            id: '#DSP-99195',
            unit: 'L 7712 AA • Trailer Scania 40ft Multi-Axle',
            origin: 'Cikarang Dry Port',
            dest: 'Semarang (KIK Kendal)',
            cargo: 'Material Konstruksi Besi & Fabrikasi',
            status: 'Siap Muat (Menunggu Timbang)',
            statusType: 'warning',
            eta: 'Besok 06:00',
            etaNote: 'Estimasi Rute',
        },
    ];

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
                            Pantauan Perjalanan Muatan Nasional, GPS &amp; Status Bongkar
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-brand-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
                        182 Rute Terjadwal Hari Ini
                    </span>
                </div>
            </div>

            {/* Live Dispatches Table Container */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-slate-800 font-extrabold">
                            Manifest Dispatch Berjalan
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
                        >
                            Filter Hub
                        </button>
                        <button
                            type="button"
                            className="text-brand-600 hover:underline text-xs font-bold"
                        >
                            Lihat Semua (84) →
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                                <th className="px-4 py-3 font-bold">ID &amp; Unit</th>
                                <th className="px-4 py-3 font-bold">Rute &amp; Kargo</th>
                                <th className="px-4 py-3 font-bold">Status / GPS</th>
                                <th className="px-4 py-3 font-bold text-right">ETA Tujuan</th>
                                <th className="px-4 py-3 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {dispatches.map((d, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="font-bold text-slate-900">{d.id}</div>
                                        <div className="text-[11px] text-slate-500 font-medium">{d.unit}</div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                            <span>{d.origin}</span>
                                            <span className="material-symbols-outlined text-[14px] text-slate-400">trending_flat</span>
                                            <span>{d.dest}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500">{d.cargo}</div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {d.statusType === 'success' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                                                <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
                                                {d.status}
                                            </span>
                                        )}
                                        {d.statusType === 'info' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-brand-700 font-semibold text-[11px] border border-blue-200/60">
                                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                                {d.status}
                                            </span>
                                        )}
                                        {d.statusType === 'warning' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200/60">
                                                <span className="material-symbols-outlined text-[14px]">forklift</span>
                                                {d.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <div className="font-bold text-slate-900">{d.eta}</div>
                                        <div className="text-[11px] text-emerald-600 font-medium">{d.etaNote}</div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-brand-600 transition-colors"
                                            title="Lacak Lokasi GPS Live"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">location_searching</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mini Fleet Hub Health Card */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">HUB LOGISTIK MARUNDA</span>
                            <span className="text-xs font-extrabold text-slate-800">88 / 95 Unit Siap Jalan</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">HUB MEGA KUNINGAN</span>
                            <span className="text-xs font-extrabold text-slate-800">24 Unit Shuttle On-Duty</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            99.2% Kepatuhan e-POD
                        </span>
                    </div>
                </div>
            </div>

            {/* Scania Fleet Showcase Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-xs h-48 bg-slate-900 text-white flex items-end p-5 border border-slate-800">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 select-none"
                    style={{ backgroundImage: `url('/images/maitricompbanner.jpg')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div>
                        <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
                            Peremajaan Armada Tahap III
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                            Tambahan 25 Unit Scania Euro-5 Tiba di Jakarta Hub
                        </h3>
                        <p className="text-xs text-slate-300">
                            Dilengkapi sensor telemetri pintar &amp; pemantau suhu digital real-time.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                        Detail Alokasi Unit
                    </button>
                </div>
            </div>
        </div>
    );
}
