import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersIndex({ users, filters, counts }) {
    const { auth, flash } = usePage().props;
    const currentUser = auth.user;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || 'all');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Modal state for editing role & position
    const [editModal, setEditModal] = useState({
        isOpen: false,
        user: null,
        role: 'warga',
        position: '',
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

    const openEditModal = (user) => {
        setEditModal({
            isOpen: true,
            user,
            role: user.role,
            position: user.position || '',
        });
    };

    const closeEditModal = () => {
        setEditModal({
            isOpen: false,
            user: null,
            role: 'warga',
            position: '',
        });
    };

    const handleSaveUser = (e) => {
        e.preventDefault();
        if (!editModal.user) return;

        setUpdatingUserId(editModal.user.id);
        const targetUserId = editModal.user.id;

        router.patch(
            route('admin.users.update-role', targetUserId),
            {
                role: editModal.role,
                position: editModal.role === 'warga' ? '' : editModal.position.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEditModal();
                },
                onFinish: () => setUpdatingUserId(null),
            }
        );
    };

    const adminPositionPresets = [
        'Chief Executive Officer',
        'Fleet Operations Director',
        'Chief Operating Officer',
        'General Fleet Manager',
        'Fleet Supervisor Lead',
    ];

    const staffPositionPresets = [
        'Fleet Operations Manager',
        'Dispatcher Lead',
        'Hauling Logistics Coordinator',
        'Fleet Maintenance Staff',
        'Field Logistics Officer',
    ];

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
            <Head title="Manajemen Pengguna, Role & Jabatan - Maitri Company" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. PAGE HEADER BANNER */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
                                Tata Kelola Akun &amp; Jabatan Resmi
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                Maitri Company HQ Verona Beach
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Manajemen Pengguna, Role &amp; Jabatan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                            Kelola hak akses dan penugasan jabatan struktural. Administrator dapat menetapkan jabatan resmi untuk <span className="font-semibold text-purple-700">Admin</span> dan <span className="font-semibold text-amber-700">Staff</span> yang secara otomatis tercetak pada dokumen perjanjian sewa (MoU) armada.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center">
                        <span className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200/60 text-xs font-bold text-brand-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            <span>Akses Otoritas Admin</span>
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

                {/* 3. METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Terdaftar</div>
                            <div className="text-2xl font-black text-slate-900 mt-1">{counts.total}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Semua Pengguna</div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Administrator</div>
                            <div className="text-2xl font-black text-purple-900 mt-1">{counts.admin}</div>
                            <div className="text-[11px] text-purple-600/80 mt-0.5">Akses Penuh &amp; Eksekutif</div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Staff Operasional</div>
                            <div className="text-2xl font-black text-amber-900 mt-1">{counts.staff}</div>
                            <div className="text-[11px] text-amber-600/80 mt-0.5">Dispatcher &amp; Pengawas</div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">badge</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Warga / Publik</div>
                            <div className="text-2xl font-black text-emerald-900 mt-1">{counts.warga}</div>
                            <div className="text-[11px] text-emerald-600/80 mt-0.5">Penyewa Truk</div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">person</span>
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
                                    <th className="px-4 py-3">Role Sistem</th>
                                    <th className="px-4 py-3">Jabatan Resmi (MoU Representatif)</th>
                                    <th className="px-4 py-3">Terdaftar Sejak</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
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

                                                {/* Position / Jabatan */}
                                                <td className="px-4 py-3.5">
                                                    {u.role === 'warga' ? (
                                                        <span className="text-slate-400 italic text-[11px] flex items-center gap-1">
                                                            <span>—</span>
                                                            <span>(Tidak ada jabatan)</span>
                                                        </span>
                                                    ) : u.position ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-brand-800 border border-blue-200 text-xs font-bold">
                                                            <span className="material-symbols-outlined text-[15px] text-brand-600">work</span>
                                                            <span>{u.position}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-slate-500 text-[11px] italic">
                                                            <span className="material-symbols-outlined text-[14px] text-slate-400">help</span>
                                                            <span>Default: {u.position_title}</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Registered At */}
                                                <td className="px-4 py-3.5 text-slate-500">
                                                    {u.created_at}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    {isBusy ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                                                            <span className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
                                                            Menyimpan...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(u)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-200 transition-all cursor-pointer shadow-2xs"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                            <span>Kelola Role &amp; Jabatan</span>
                                                        </button>
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

            {/* EDIT ROLE & JABATAN MODAL */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Kelola Role &amp; Jabatan Pengguna
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Atur hak akses dan titel jabatan resmi di Maitri Company
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* User Identity Box */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Nama Pengguna:</span>
                                <strong className="text-slate-900 font-bold">{editModal.user?.name}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Alamat Email:</span>
                                <span className="font-mono text-slate-700">{editModal.user?.email}</span>
                            </div>
                            {editModal.user?.id === currentUser.id && (
                                <div className="pt-1.5 border-t border-slate-200 text-amber-700 font-medium flex items-center gap-1 text-[11px]">
                                    <span className="material-symbols-outlined text-[15px]">info</span>
                                    <span>Anda sedang mengedit akun Anda sendiri. Role tidak dapat diubah demi keamanan sesi.</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-800">
                                    Pilih Role Sistem:
                                </label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {/* Warga */}
                                    <label
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                                            editModal.role === 'warga'
                                                ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                        } ${editModal.user?.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="userRole"
                                            value="warga"
                                            checked={editModal.role === 'warga'}
                                            disabled={editModal.user?.id === currentUser.id}
                                            onChange={(e) => setEditModal((prev) => ({ ...prev, role: e.target.value }))}
                                            className="sr-only"
                                        />
                                        <span className="material-symbols-outlined text-[20px] text-emerald-600">person</span>
                                        <span className="text-xs">Warga</span>
                                    </label>

                                    {/* Staff */}
                                    <label
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                                            editModal.role === 'staff'
                                                ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-2xs font-bold'
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                        } ${editModal.user?.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="userRole"
                                            value="staff"
                                            checked={editModal.role === 'staff'}
                                            disabled={editModal.user?.id === currentUser.id}
                                            onChange={(e) => setEditModal((prev) => ({ ...prev, role: e.target.value }))}
                                            className="sr-only"
                                        />
                                        <span className="material-symbols-outlined text-[20px] text-amber-600">badge</span>
                                        <span className="text-xs">Staff</span>
                                    </label>

                                    {/* Admin */}
                                    <label
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                                            editModal.role === 'admin'
                                                ? 'bg-purple-50/80 border-purple-500 text-purple-900 shadow-2xs font-bold'
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                        } ${editModal.user?.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="userRole"
                                            value="admin"
                                            checked={editModal.role === 'admin'}
                                            disabled={editModal.user?.id === currentUser.id}
                                            onChange={(e) => setEditModal((prev) => ({ ...prev, role: e.target.value }))}
                                            className="sr-only"
                                        />
                                        <span className="material-symbols-outlined text-[20px] text-purple-600">admin_panel_settings</span>
                                        <span className="text-xs">Administrator</span>
                                    </label>
                                </div>
                            </div>

                            {/* Position Input (Only for Admin & Staff) */}
                            {editModal.role === 'warga' ? (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
                                        <span>Tidak Ada Penugasan Jabatan</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed">
                                        Pengguna dengan peran Warga adalah konsumen publik / penyewa mandiri sehingga tidak memiliki struktur jabatan di Maitri Company.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-1 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="user_position" className="text-xs font-bold text-slate-800">
                                            Jabatan / Posisi Resmi di Perusahaan:
                                        </label>
                                        <span className="text-[11px] text-slate-400">
                                            Maks. 100 karakter
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                            work
                                        </span>
                                        <input
                                            id="user_position"
                                            type="text"
                                            value={editModal.position}
                                            onChange={(e) => setEditModal((prev) => ({ ...prev, position: e.target.value }))}
                                            placeholder={
                                                editModal.role === 'admin'
                                                    ? 'Contoh: Chief Executive Officer / Fleet Director'
                                                    : 'Contoh: Fleet Operations Manager'
                                            }
                                            maxLength={100}
                                            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    {/* Preset Chips */}
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[11px] font-bold text-slate-500 block">
                                            Preset Cepat Jabatan:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(editModal.role === 'admin' ? adminPositionPresets : staffPositionPresets).map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setEditModal((prev) => ({ ...prev, position: preset }))}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                                        editModal.position === preset
                                                            ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                                        *Jabatan ini akan otomatis dicetak pada kolom <strong>PIHAK PERTAMA (PENYEDIA)</strong> di dokumen resmi Memorandum of Understanding (MoU) sewa truk.
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingUserId !== null}
                                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {updatingUserId !== null && (
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
