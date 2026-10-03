import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminHeader from '@/Pages/Admin/Components/AdminHeader';
import AdminFooter from '@/Pages/Admin/Components/AdminFooter';

export default function AdminLayout({ children, activeMenu = 'overview' }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const navItems = [
        {
            section: 'Core Navigation',
            items: [
                { id: 'overview', label: 'Overview / Ringkasan', icon: 'grid_view', href: route('admin.dashboard') },
                { id: 'armada', label: 'Divisi Armada & Muatan', icon: 'local_shipping', href: '#armada' },
                { id: 'proyek', label: 'Divisi Proyek Desain & Interior', icon: 'architecture', href: '#proyek' },
                { id: 'dispatch', label: 'Jadwal & Dispatch', icon: 'calendar_clock', href: '#dispatch' },
            ],
        },
        {
            section: 'Finance & Governance',
            items: [
                { id: 'keuangan', label: 'Keuangan & Invoice', icon: 'receipt_long', href: '#keuangan' },
                { id: 'tim', label: 'Manajemen Tim & Mitra', icon: 'group_work', href: '#tim' },
                { id: 'sistem', label: 'Pengaturan & Log Sistem', icon: 'settings_account_box', href: '#sistem' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased flex flex-col">
            {/* MOBILE SIDEBAR OVERLAY */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 lg:hidden"
                />
            )}

            {/* SIDEBAR ASIDE */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Brand Logo Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                alt="Maitri Company"
                                className="h-8 w-auto object-contain"
                                src="/images/maitricomplogo.png"
                            />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">
                                    Maitri
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                                    Enterprise OS
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Operational Active Status Pill */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200/60 px-3 py-2 rounded-xl text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                                Operations Active
                            </span>
                            <span className="ml-auto text-brand-600 font-extrabold text-[11px]">
                                PROD v2.4
                            </span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
                        {navItems.map((group, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="px-3 pb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {group.section}
                                    </span>
                                </div>
                                {group.items.map((item) => {
                                    const isActive = activeMenu === item.id;
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                                                isActive
                                                    ? 'bg-brand-600 text-white shadow-sm font-bold shadow-brand-600/30'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom Authenticated User Info */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-slate-900 font-bold truncate">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Keluar dari sistem"
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* TOP HEADER & MAIN VIEW WRAPPER */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                <AdminHeader onQuickAction={() => alert('Fitur Tindakan Cepat: Siap membuat penugasan armada atau proyek baru.')} />
                
                {/* Mobile Header Toggle */}
                <div className="lg:hidden fixed top-3 left-4 z-50">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700"
                    >
                        <span className="material-symbols-outlined text-[22px]">menu</span>
                    </button>
                </div>

                <main className="w-full pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
                    {children}
                </main>

                <AdminFooter />
            </div>
        </div>
    );
}
