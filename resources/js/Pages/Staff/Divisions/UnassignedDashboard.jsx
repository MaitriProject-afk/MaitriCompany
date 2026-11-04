export default function UnassignedDashboard({ user, allDivisions = [] }) {
    return (
        <div className="space-y-6">
            {/* 1. HERO ONBOARDING BANNER */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 shrink-0">
                            <span className="material-symbols-outlined text-[32px]">badge</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Tahap Onboarding Staf
                                </span>
                                <span className="text-xs text-slate-400">Status Kepegawaian Aktif</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                                Selamat Bergabung, Staf {user.name}!
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                Akun staf Anda telah berhasil diverifikasi dalam sistem korporat internal Maitri Company.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Penugasan Divisi</div>
                            <div className="text-sm font-black text-amber-300 flex items-center gap-1 justify-end">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>Menunggu Penempatan HRD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ONBOARDING STATUS CARD & EXPLANATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                            <span className="material-symbols-outlined text-[22px]">info</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Status Penugasan Divisi Anda Saat Ini</h3>
                            <p className="text-xs text-slate-400">Informasi Alur Orientasi Kepegawaian</p>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Anda saat ini telah terdaftar resmi sebagai <strong className="text-amber-300">Staff Maitri Company</strong>, namun divisi kerja operasional (Marketing, Automotive, Rental, atau Daily Globe) Anda sedang dalam tahap finalisasi oleh Direksi atau HRD.
                    </p>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2 text-xs">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                            <span>Langkah yang Perlu Dilakukan:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                            <li>Hubungi HRD atau Direksi penanggung jawab melalui radio faksi / kontak Discord perusahaan.</li>
                            <li>Sampaikan bukti penerimaan atau nomor ID staf Anda: <strong className="font-mono text-white">#{user.id}</strong>.</li>
                            <li>Setelah Admin menetapkan divisi penugasan Anda di panel, dashboard ini akan <strong>otomatis berubah</strong> menjadi workspace divisi Anda.</li>
                        </ol>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-400 text-[18px]">support_agent</span>
                            <span>Kontak Hotline HRD</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Butuh konfirmasi penempatan divisi atau jadwal orientasi kerja?
                        </p>

                        <div className="mt-4 space-y-2 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-amber-400 text-[18px]">call</span>
                                <div>
                                    <div className="text-[10px] text-slate-400">Hotline San Andreas</div>
                                    <div className="font-bold text-white font-mono">555-8899 (HRD Maitri)</div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-indigo-400 text-[18px]">location_on</span>
                                <div>
                                    <div className="text-[10px] text-slate-400">Headquarter</div>
                                    <div className="font-bold text-white">Maitri HQ, Verona Beach</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 italic text-center">
                        *Menunggu penetapan resmi penempatan divisi
                    </div>
                </div>
            </div>

            {/* 3. ACTIVE DIVISIONS AT MAITRI COMPANY */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-cyan-400 text-[18px]">domain</span>
                        <span>4 Divisi Operasional Resmi Maitri Company</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Pilihan Penugasan Divisi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Marketing Card */}
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-purple-500/30 space-y-3 hover:border-purple-500/60 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                            <span className="material-symbols-outlined text-[22px]">campaign</span>
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Divisi Marketing</div>
                            <div className="text-[11px] text-purple-300 font-medium">Pemasaran &amp; Relasi Publik</div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Mengelola promosi iklan, media Weazel, event sponsorship, dan jangkauan kemitraan bisnis.
                        </p>
                    </div>

                    {/* Automotive Card */}
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-3 hover:border-amber-500/60 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                            <span className="material-symbols-outlined text-[22px]">build</span>
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Divisi Automotive</div>
                            <div className="text-[11px] text-amber-300 font-medium">Workshop &amp; Mekanikal</div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Memelihara mesin 2000 HP armada, kelayakan bodi, kalibrasi garasi, dan stok suku cadang.
                        </p>
                    </div>

                    {/* Rental Card */}
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-3 hover:border-emerald-500/60 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                            <span className="material-symbols-outlined text-[22px]">key</span>
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Divisi Rental</div>
                            <div className="text-[11px] text-emerald-300 font-medium">Layanan &amp; Dispatcher</div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Melayani serah terima kunci armada sewa warga, validasi kontrak MoU, dan verifikasi denda.
                        </p>
                    </div>

                    {/* Daily Globe Card */}
                    <div className="p-5 rounded-2xl bg-slate-800/60 border border-sky-500/30 space-y-3 hover:border-sky-500/60 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                            <span className="material-symbols-outlined text-[22px]">newspaper</span>
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Divisi Daily Globe</div>
                            <div className="text-[11px] text-sky-300 font-medium">Kantor Berita &amp; Pers</div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Meliput berita investigasi kota San Andreas, penulisan artikel buletin, dan siaran pers resmi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
