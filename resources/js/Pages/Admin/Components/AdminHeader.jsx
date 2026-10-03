import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminHeader({ onQuickAction }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Search Input */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari invoice, armada, dispatch, kontrak klien... (⌘K)"
                        className="w-full h-10 pl-10 pr-4 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-transparent focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 placeholder:text-slate-400 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* System Online Badge */}
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>System Online</span>
                </div>

                {/* Quick Action Button */}
                <button
                    type="button"
                    onClick={onQuickAction}
                    className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="hidden sm:inline">Tindakan Cepat</span>
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Notifikasi Operasional"
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs animate-fadeIn">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                                <span>Pemberitahuan Sistem</span>
                                <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold">3 Baru</span>
                            </div>
                            <div className="divide-y divide-slate-100 pt-1 space-y-1">
                                <div className="py-2">
                                    <div className="font-semibold text-slate-800">Jadwal Servis Berkala Armada</div>
                                    <div className="text-slate-500 text-[11px]">8 Unit Scania Hub Cikampek memerlukan inspeksi.</div>
                                </div>
                                <div className="py-2">
                                    <div className="font-semibold text-slate-800">Persetujuan Desain 3D Diterima</div>
                                    <div className="text-slate-500 text-[11px]">Klien Fintech SCBD menyetujui layout mezzanine.</div>
                                </div>
                                <div className="py-2">
                                    <div className="font-semibold text-slate-800">Surat Jalan e-POD #MT-8812 Valid</div>
                                    <div className="text-slate-500 text-[11px]">Penerima Semarang telah menandatangani receipt.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 pl-1 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                                {user.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                Administrator Utama
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            expand_more
                        </span>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-fadeIn">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <div className="font-bold text-slate-800">{user.name}</div>
                                <div className="text-slate-500 text-[11px] truncate">{user.email}</div>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-extrabold text-[10px] uppercase">
                                    {user.role}
                                </span>
                            </div>
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                <span>Pengaturan Profil</span>
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px] text-slate-400">public</span>
                                <span>Lihat Beranda Publik</span>
                            </Link>
                            <div className="border-t border-slate-100 my-1"></div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                <span>Keluar (Logout)</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
