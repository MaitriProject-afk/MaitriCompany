import { useState } from 'react';

export default function RentalDashboard({ user, division }) {
    const [rentalCheckForm, setRentalCheckForm] = useState({
        rentalCode: '',
        checkType: 'handover',
        fuelLevel: '100%',
        bodyCondition: 'Mulus 2000 HP',
        officerNotes: '',
    });
    const [submittedAlert, setSubmittedAlert] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rentalCheckForm.rentalCode) return;
        setSubmittedAlert(true);
        setTimeout(() => setSubmittedAlert(false), 4000);
        setRentalCheckForm({
            rentalCode: '',
            checkType: 'handover',
            fuelLevel: '100%',
            bodyCondition: 'Mulus 2000 HP',
            officerNotes: '',
        });
    };

    const dummyActiveRentals = [
        {
            id: 'MTR-RN-2026-0041',
            citizen: 'Michael Corleone',
            phone: '555-0199',
            unit: 'Roadtrain (Scania R450 Double Trailer)',
            duration: '2 Hari (Sisa 12 Jam)',
            status: 'Sedang Disewa',
            statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
            id: 'MTR-RN-2026-0042',
            citizen: 'Tommy Vercetti',
            phone: '555-7788',
            unit: 'Heavy Truck (Hino 500 Wingbox)',
            duration: 'Jatuh Tempo Hari Ini (19:00 WIB)',
            status: 'Jatuh Tempo',
            statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        {
            id: 'MTR-RN-2026-0043',
            citizen: 'Carl Johnson',
            phone: '555-1234',
            unit: 'Pickup Truck (GranMax Heavy Duty)',
            duration: '1 Hari (Sewa Baru)',
            status: 'Menunggu Serah Kunci',
            statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
    ];

    const fleetReadiness = [
        { category: 'Pickup Truck', available: 3, rented: 2, total: 5 },
        { category: 'Lorry', available: 2, rented: 1, total: 3 },
        { category: 'Box Car', available: 1, rented: 2, total: 3 },
        { category: 'Heavy Truck', available: 2, rented: 3, total: 5 },
        { category: 'Roadtrain', available: 1, rented: 1, total: 2 },
    ];

    return (
        <div className="space-y-6">
            {/* 1. HERO DIVISION BANNER */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border border-emerald-500/30 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                            <span className="material-symbols-outlined text-[32px]">key</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    Divisi Rental &amp; Dispatcher
                                </span>
                                <span className="text-xs text-slate-400">Front Desk Verona Beach</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                                Layanan &amp; Administrasi Sewa Armada
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                Melayani pemesanan sewa truk warga, kontrak MoU, serah terima unit, dan pemeriksaan denda pengembalian.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Petugas Dispatcher</div>
                            <div className="text-sm font-black text-emerald-300">{user.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KPI / STATS METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <span className="material-symbols-outlined text-[24px]">rv_hookup</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Unit Sedang Disewa</div>
                        <div className="text-lg font-black text-white">9 Unit Jalan</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                        <span className="material-symbols-outlined text-[24px]">local_parking</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Siap di Pool Garasi</div>
                        <div className="text-lg font-black text-white">9 Unit Standby</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <span className="material-symbols-outlined text-[24px]">alarm</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Kembali Hari Ini</div>
                        <div className="text-lg font-black text-white">3 Unit</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400">Kontrak MoU Aktif</div>
                        <div className="text-lg font-black text-white">14 Dokumen</div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN SECTION: ACTIVE RENTALS & HANDOVER FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Rentals Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400 text-[18px]">receipt_long</span>
                                <span>Daftar Unit Aktif Disewa Warga</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">Monitoring Sewa</span>
                        </div>

                        <div className="space-y-3">
                            {dummyActiveRentals.map((rental) => (
                                <div
                                    key={rental.id}
                                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-emerald-400 text-xs font-bold">{rental.id}</span>
                                            <span className="text-slate-500">•</span>
                                            <span className="font-bold text-white text-xs sm:text-sm">{rental.citizen}</span>
                                            <span className="text-[11px] text-slate-400">({rental.phone})</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Unit: <strong className="text-slate-300">{rental.unit}</strong>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Durasi: <strong className="text-slate-300">{rental.duration}</strong>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${rental.statusColor}`}>
                                            {rental.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fleet Pool Availability Status */}
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-400 text-[18px]">local_shipping</span>
                                <span>Kesiapan Armada di Pool Garasi</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">Total 18 Armada</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs text-center">
                            {fleetReadiness.map((cat, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                                    <div className="font-bold text-slate-300 text-[11px] truncate">{cat.category}</div>
                                    <div className="text-base font-black text-emerald-400 mt-1">{cat.available} Ready</div>
                                    <div className="text-[10px] text-slate-500">{cat.rented} Disewa</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Handover & Check Inspection Form */}
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-400 text-[18px]">fact_check</span>
                                <span>Inspeksi Serah Terima Unit</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Catat serah terima kunci saat armada keluar atau periksa kondisi fisik bodi saat unit dikembalikan.
                            </p>
                        </div>

                        {submittedAlert && (
                            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span>Lembar inspeksi serah terima rental berhasil disimpan!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Nomor Kontrak / Invoice Sewa
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={rentalCheckForm.rentalCode}
                                    onChange={(e) => setRentalCheckForm((prev) => ({ ...prev, rentalCode: e.target.value }))}
                                    placeholder="Contoh: MTR-RN-2026-0041"
                                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Tahap Pemeriksaan
                                </label>
                                <select
                                    value={rentalCheckForm.checkType}
                                    onChange={(e) => setRentalCheckForm((prev) => ({ ...prev, checkType: e.target.value }))}
                                    className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="handover">Serah Kunci ke Penyewa (Awal)</option>
                                    <option value="return">Pengembalian Unit &amp; Cek Denda (Akhir)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                        Bahan Bakar
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalCheckForm.fuelLevel}
                                        onChange={(e) => setRentalCheckForm((prev) => ({ ...prev, fuelLevel: e.target.value }))}
                                        placeholder="100%"
                                        className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                        Kondisi Bodi
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalCheckForm.bodyCondition}
                                        onChange={(e) => setRentalCheckForm((prev) => ({ ...prev, bodyCondition: e.target.value }))}
                                        placeholder="Mulus / Ada Lecet"
                                        className="w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                    Catatan Petugas Dispatcher
                                </label>
                                <textarea
                                    rows={3}
                                    value={rentalCheckForm.officerNotes}
                                    onChange={(e) => setRentalCheckForm((prev) => ({ ...prev, officerNotes: e.target.value }))}
                                    placeholder="Keterangan kelengkapan surat, KTP penyewa, atau catatan denda lecet..."
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                <span>Simpan Lembar Inspeksi</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
