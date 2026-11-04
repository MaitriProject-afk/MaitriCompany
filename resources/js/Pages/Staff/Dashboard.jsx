import { Head, Link, usePage } from '@inertiajs/react';
import MarketingDashboard from './Divisions/MarketingDashboard';
import AutomotiveDashboard from './Divisions/AutomotiveDashboard';
import RentalDashboard from './Divisions/RentalDashboard';
import DailyGlobeDashboard from './Divisions/DailyGlobeDashboard';
import UnassignedDashboard from './Divisions/UnassignedDashboard';

export default function StaffDashboard({
    staffUser,
    currentDivisionCode,
    allDivisions = [],
    workshopData = null,
}) {
    const { auth, flash } = usePage().props;
    const user = staffUser || auth.user;

    // Strictly lock the division workspace to the user's assigned division code from the backend
    const activeDivisionCode = currentDivisionCode || 'unassigned';

    const divisionMeta = {
        marketing: {
            title: 'Divisi Marketing',
            badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
            icon: 'campaign',
            accent: 'purple',
        },
        automotive: {
            title: 'Divisi Automotive',
            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            icon: 'build',
            accent: 'amber',
        },
        rental: {
            title: 'Divisi Rental',
            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            icon: 'key',
            accent: 'emerald',
        },
        daily_globe: {
            title: 'Divisi Daily Globe',
            badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
            icon: 'newspaper',
            accent: 'sky',
        },
        unassigned: {
            title: 'Menunggu Penugasan Divisi',
            badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600',
            icon: 'pending',
            accent: 'slate',
        },
    };

    const currentMeta = divisionMeta[activeDivisionCode] || divisionMeta.unassigned;

    // Daily Globe features the full light Admin Dashboard theme
    if (activeDivisionCode === 'daily_globe') {
        return (
            <DailyGlobeDashboard
                user={user}
                division={user.division}
                allDivisions={allDivisions}
            />
        );
    }

    // Automotive features its own full-screen professional Workshop OS layout
    if (activeDivisionCode === 'automotive') {
        return (
            <AutomotiveDashboard
                user={user}
                division={user.division}
                workshopData={workshopData}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
            <Head title={`Staff Dashboard - ${currentMeta.title}`} />

            {/* Top Bar */}
            <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3.5">
                    <img
                        src="/images/maitricomplogo.png"
                        alt="Maitri Company"
                        className="h-8 w-auto object-contain"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm sm:text-base font-black text-white">
                                Maitri Operations
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Staff Portal
                            </span>
                            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentMeta.badgeClass}`}>
                                <span className="material-symbols-outlined text-[13px]">{currentMeta.icon}</span>
                                <span>{currentMeta.title}</span>
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Portal Divisi &amp; Operasional Lapangan Internal Tim</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    {/* User Profile Summary */}
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                            <span>{user.name}</span>
                            {user.role === 'admin' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Admin
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                            {user.position || user.position_title || 'Staff Operasional'}
                        </div>
                    </div>

                    {/* Back to Admin Console if admin */}
                    {user.role === 'admin' && (
                        <Link
                            href={route('admin.dashboard')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                            <span className="hidden md:inline">Kembali ke Admin</span>
                        </Link>
                    )}

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-5">
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                        <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                        <span className="material-symbols-outlined text-rose-400 text-[20px]">error</span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {activeDivisionCode === 'marketing' && (
                    <MarketingDashboard user={user} division={user.division} />
                )}

                {activeDivisionCode === 'automotive' && (
                    <AutomotiveDashboard
                        user={user}
                        division={user.division}
                        workshopData={workshopData}
                    />
                )}

                {activeDivisionCode === 'rental' && (
                    <RentalDashboard user={user} division={user.division} />
                )}

                {activeDivisionCode === 'daily_globe' && (
                    <DailyGlobeDashboard user={user} division={user.division} />
                )}

                {activeDivisionCode === 'unassigned' && (
                    <UnassignedDashboard user={user} allDivisions={allDivisions} />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
                <p>© 2026 Maitri Company. Integrated Operational &amp; Fleet Management System. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
