import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersIndex({ users, filters, counts }) {
    const { auth, flash } = usePage().props;
    const currentUser = auth.user;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || 'all');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Modal state for confirmation
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        user: null,
        targetRole: '',
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            route('admin.users.index'),
            {
                search: searchTerm,
                role: selectedRoleFilter === 'all' ? '' : selectedRoleFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleTabClick = (role) => {
        setSelectedRoleFilter(role);
        router.get(
            route('admin.users.index'),
            {
                search: searchTerm,
                role: role === 'all' ? '' : role,
            },
            { preserveState: true, replace: true }
        );
    };

    const openRoleConfirm = (user, newRole) => {
        if (user.id === currentUser.id) {
            alert('Anda tidak dapat mengubah hak akses akun Anda sendiri saat sedang login.');
            return;
        }

        if (user.role === newRole) return;

        setConfirmModal({
            isOpen: true,
            user,
            targetRole: newRole,
        });
    };

    const executeRoleChange = () => {
        if (!confirmModal.user || !confirmModal.targetRole) return;

        setUpdatingUserId(confirmModal.user.id);
        const targetUserId = confirmModal.user.id;
        const newRole = confirmModal.targetRole;

        setConfirmModal({ isOpen: false, user: null, targetRole: '' });

        router.patch(
            route('admin.users.update-role', targetUserId),
            { role: newRole },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingUserId(null),
            }
        );
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                        <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                        <span>Administrator</span>
                    </span>
                );
            case 'staff':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        <span>Staff Khusus</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        <span>Warga / Publik</span>
                    </span>
                );
        }
    };

    return (
        <AdminLayout activeMenu="users">
            <Head title="Manajemen Pengguna & Otoritas Hak Akses" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. PAGE HEADER BANNER */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
                                Tata Kelola Akun &amp; Hak Akses
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                Database Terverifikasi
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Manajemen Pengguna &amp; Peran (Role)
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                            Pantau semua akun terdaftar di sistem. Anda dapat mempromosikan atau mengalihkan hak akses pengguna antara <span className="font-semibold text-emerald-700">Warga</span>, <span className="font-semibold text-amber-700">Staff</span>, dan <span className="font-semibold text-purple-700">Administrator</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center">
                        <span className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200/60 text-xs font-bold text-brand-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            <span>Akses Khusus Admin</span>
                        </span>
                    </div>
                </div>

                {/* 2. FLASH NOTIFICATIONS */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-fadeIn">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-fadeIn">
                        <span className="material-symbols-outlined text-rose-600 text-[20px]">error</span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* 3. METRIC STATS TILES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                                {counts.total}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Total Akun Terdaftar</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-purple-700 leading-none">
                                {counts.admin}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Administrator</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">badge</span>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-amber-700 leading-none">
                                {counts.staff}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Staff Khusus</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">person</span>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-700 leading-none">
                                {counts.warga}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Warga (Default)</div>
                        </div>
                    </div>
                </div>

                {/* 4. SEARCH & FILTER TABS CONTAINER */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama atau email pengguna..."
                                className="w-full h-10 pl-10 pr-20 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Cari
                            </button>
                        </form>

                        {/* Role Filter Tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-bold overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => handleRoleTabClick('all')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRoleFilter === 'all'
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Semua ({counts.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleTabClick('warga')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRoleFilter === 'warga'
                                        ? 'bg-white text-emerald-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Warga ({counts.warga})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleTabClick('staff')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRoleFilter === 'staff'
                                        ? 'bg-white text-amber-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Staff ({counts.staff})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleTabClick('admin')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRoleFilter === 'admin'
                                        ? 'bg-white text-purple-700 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Admin ({counts.admin})
                            </button>
                        </div>
                    </div>

                    {/* USERS TABLE */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                                    <th className="px-4 py-3">Pengguna</th>
                                    <th className="px-4 py-3">Role Saat Ini</th>
                                    <th className="px-4 py-3">Terdaftar Sejak</th>
                                    <th className="px-4 py-3 text-right">Ubah Otoritas Hak Akses</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-[32px] block mb-1">person_search</span>
                                            Tidak ditemukan pengguna yang cocok dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => {
                                        const isSelf = u.id === currentUser.id;
                                        const isBusy = updatingUserId === u.id;

                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* User Info */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                                <span>{u.name}</span>
                                                                {isSelf && (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-brand-700">
                                                                        Akun Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Current Role */}
                                                <td className="px-4 py-3.5">
                                                    {getRoleBadge(u.role)}
                                                </td>

                                                {/* Registered At */}
                                                <td className="px-4 py-3.5 text-slate-500">
                                                    {u.created_at}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    {isSelf ? (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            (Sedang aktif login)
                                                        </span>
                                                    ) : isBusy ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                                                            <span className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                                                            Menyimpan...
                                                        </span>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {/* Warga Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openRoleConfirm(u, 'warga')}
                                                                disabled={u.role === 'warga'}
                                                                title="Ubah peran menjadi Warga biasa"
                                                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                                    u.role === 'warga'
                                                                        ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                }`}
                                                            >
                                                                → Warga
                                                            </button>

                                                            {/* Staff Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openRoleConfirm(u, 'staff')}
                                                                disabled={u.role === 'staff'}
                                                                title="Angkat menjadi Staff operasional"
                                                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                                    u.role === 'staff'
                                                                        ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                                                                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                                                }`}
                                                            >
                                                                → Staff
                                                            </button>

                                                            {/* Admin Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openRoleConfirm(u, 'admin')}
                                                                disabled={u.role === 'admin'}
                                                                title="Angkat menjadi Administrator"
                                                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                                    u.role === 'admin'
                                                                        ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400'
                                                                        : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                                                                }`}
                                                            >
                                                                → Admin
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    Konfirmasi Perubahan Role
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Perubahan hak akses akun pengguna
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Pengguna:</span>
                                <span className="font-bold text-slate-900">{confirmModal.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span className="font-mono text-slate-700">{confirmModal.user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-slate-500">Perubahan:</span>
                                <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                                    <span className="text-slate-600">{confirmModal.user?.role}</span>
                                    <span>→</span>
                                    <span className={
                                        confirmModal.targetRole === 'admin'
                                            ? 'text-purple-700'
                                            : confirmModal.targetRole === 'staff'
                                            ? 'text-amber-700'
                                            : 'text-emerald-700'
                                    }>
                                        {confirmModal.targetRole}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin mengubah hak akses pengguna ini? Pengguna akan diarahkan ke dashboard sesuai role barunya pada saat login berikutnya.
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: false, user: null, targetRole: '' })}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeRoleChange}
                                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 cursor-pointer"
                            >
                                Ya, Ubah Hak Akses
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
