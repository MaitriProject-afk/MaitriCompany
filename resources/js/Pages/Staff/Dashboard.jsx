import { Head, Link, usePage } from '@inertiajs/react';

export default function StaffDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
            <Head title="Dashboard Staff Operasional" />

            {/* Top Bar */}
            <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/images/maitricomplogo.png"
                        alt="Maitri Company"
                        className="h-8 w-auto object-contain"
                    />
                    <div>
                        <h1 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Maitri Operations</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Staff Khusus
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400">Portal Operasional Internal Tim</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-semibold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 flex flex-col gap-6">
                {/* Banner Status */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/50 via-orange-950/30 to-slate-800/60 border border-amber-500/30 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-600/30">
                            <span className="material-symbols-outlined text-[28px]">badge</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                Akses Otoritas Khusus Staff
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                                Selamat Datang, Staff {user.name}!
                            </h2>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                                Halaman ini khusus untuk pengujian otentikasi role <span className="font-bold text-amber-300">Staff</span>. Anda memiliki akses operasional lapangan dan kantor, namun tidak dapat mengakses dashboard Administrator ataupun Warga.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Details & Role Testing Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-400 text-[18px]">verified_user</span>
                            <span>Informasi Akun Saat Ini</span>
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-700/40">
                                <span className="text-slate-400">ID Pengguna</span>
                                <span className="font-mono text-slate-200">#{user.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700/40">
                                <span className="text-slate-400">Nama Lengkap</span>
                                <span className="font-semibold text-slate-200">{user.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700/40">
                                <span className="text-slate-400">Alamat Email</span>
                                <span className="font-mono text-slate-200">{user.email}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Role Terverifikasi</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400 text-[18px]">security</span>
                            <span>Uji Coba Proteksi Keamanan Role</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Coba akses halaman dashboard role lain untuk memastikan middleware bekerja dengan tepat:
                        </p>
                        <div className="flex flex-col gap-2 pt-2">
                            <Link
                                href="/admin/dashboard"
                                className="px-3.5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between border border-slate-600 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400 text-[18px]">admin_panel_settings</span>
                                    <span>Buka Dashboard Admin (/admin/dashboard)</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Harus Ditolak (403)</span>
                            </Link>
                            <Link
                                href="/warga/dashboard"
                                className="px-3.5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between border border-slate-600 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">person</span>
                                    <span>Buka Dashboard Warga (/warga/dashboard)</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Harus Ditolak (403)</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
