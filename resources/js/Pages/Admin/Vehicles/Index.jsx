import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import VehicleModal from './Components/VehicleModal';
import CategoryModal from './Components/CategoryModal';

export default function VehiclesIndex({ vehicles = [], categories = [], availableUsers = [], filters = {}, stats = {} }) {
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'categories'
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(filters.category || '');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState(filters.status || '');

    // Modal states
    const [vehicleModal, setVehicleModal] = useState({ isOpen: false, vehicle: null });
    const [categoryModal, setCategoryModal] = useState({ isOpen: false, category: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', item: null });

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.vehicles.index'),
            {
                search: searchTerm,
                category: selectedCategoryFilter,
                status: selectedStatusFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryFilterChange = (catId) => {
        setSelectedCategoryFilter(catId);
        router.get(
            route('admin.vehicles.index'),
            {
                search: searchTerm,
                category: catId,
                status: selectedStatusFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilterChange = (status) => {
        setSelectedStatusFilter(status);
        router.get(
            route('admin.vehicles.index'),
            {
                search: searchTerm,
                category: selectedCategoryFilter,
                status,
            },
            { preserveState: true, replace: true }
        );
    };

    const executeDelete = () => {
        if (!deleteModal.item) return;

        if (deleteModal.type === 'vehicle') {
            router.delete(route('admin.vehicles.destroy', deleteModal.item.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteModal({ isOpen: false, type: '', item: null }),
            });
        } else if (deleteModal.type === 'category') {
            router.delete(route('admin.vehicle-categories.destroy', deleteModal.item.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteModal({ isOpen: false, type: '', item: null }),
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tersedia':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Tersedia (Ready)</span>
                    </span>
                );
            case 'disewa':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>Sedang Disewa</span>
                    </span>
                );
            case 'perawatan':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="material-symbols-outlined text-[13px]">build</span>
                        <span>Perawatan</span>
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AdminLayout activeMenu="vehicles">
            <Head title="Manajemen Unit Armada Hauling & Tarif Rental" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. PAGE HEADER BANNER */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
                                Divisi Logistik &amp; Hauling Berat
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                Inventaris Armada &amp; Pengemudi
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Manajemen Armada &amp; Tarif Sewa
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                            Kelola unit kendaraan hauling, hubungkan unit ke beberapa personil atau driver penanggung jawab, serta sesuaikan kategori dan tarif sewa per hari secara fleksibel.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setCategoryModal({ isOpen: true, category: null })}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300/80 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-slate-600">category</span>
                            <span>+ Kategori &amp; Tarif</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVehicleModal({ isOpen: true, vehicle: null })}
                            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            <span>+ Tambah Unit Kendaraan</span>
                        </button>
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                        </div>
                        <div>
                            <div className="text-xl font-black text-slate-900 leading-none">{stats.total || 0}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Total Unit</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">check_circle</span>
                        </div>
                        <div>
                            <div className="text-xl font-black text-emerald-700 leading-none">{stats.available || 0}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Unit Tersedia</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">key</span>
                        </div>
                        <div>
                            <div className="text-xl font-black text-blue-700 leading-none">{stats.rented || 0}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Sedang Disewa</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">build</span>
                        </div>
                        <div>
                            <div className="text-xl font-black text-amber-800 leading-none">{stats.maintenance || 0}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Perawatan</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 md:col-span-1">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">category</span>
                        </div>
                        <div>
                            <div className="text-xl font-black text-purple-700 leading-none">{stats.categories_count || 0}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1">Kategori Armada</div>
                        </div>
                    </div>
                </div>

                {/* 4. MAIN NAVIGATION TABS */}
                <div className="flex items-center gap-2 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('vehicles')}
                        className={`pb-3.5 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'vehicles'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">rv_hookup</span>
                        <span>Daftar Unit Armada Hauling ({vehicles.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className={`pb-3.5 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'categories'
                                ? 'border-brand-600 text-brand-700'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                        <span>Kategori &amp; Tarif Sewa Harian ({categories.length})</span>
                    </button>
                </div>

                {/* 5. TAB 1: VEHICLES MANAGEMENT */}
                {activeTab === 'vehicles' && (
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                        {/* Filters row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Search form */}
                            <form onSubmit={handleFilterSubmit} className="relative flex-1 max-w-md">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari nama unit atau nomor plat..."
                                    className="w-full h-10 pl-9 pr-16 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                    Cari
                                </button>
                            </form>

                            {/* Category & Status Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={selectedCategoryFilter}
                                    onChange={(e) => handleCategoryFilterChange(e.target.value)}
                                    className="h-10 px-3 bg-slate-50 hover:bg-white text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 focus:border-brand-600 outline-none cursor-pointer"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => handleStatusFilterChange('')}
                                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                            selectedStatusFilter === ''
                                                ? 'bg-white text-slate-900 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Semua Status
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusFilterChange('tersedia')}
                                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                            selectedStatusFilter === 'tersedia'
                                                ? 'bg-white text-emerald-700 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Tersedia
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusFilterChange('disewa')}
                                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                            selectedStatusFilter === 'disewa'
                                                ? 'bg-white text-blue-700 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Disewa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusFilterChange('perawatan')}
                                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                            selectedStatusFilter === 'perawatan'
                                                ? 'bg-white text-amber-800 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Perawatan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Vehicles Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                                        <th className="px-4 py-3">Unit &amp; Nomor Plat</th>
                                        <th className="px-4 py-3">Kategori &amp; Biaya Rental</th>
                                        <th className="px-4 py-3">Kapasitas Muatan</th>
                                        <th className="px-4 py-3">Personil / Pemegang Unit</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {vehicles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                                                <span className="material-symbols-outlined text-[36px] block mb-1">
                                                    no_crash
                                                </span>
                                                Tidak ditemukan unit kendaraan yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        vehicles.map((v) => (
                                            <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* Unit & Plate */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                                                            <span className="material-symbols-outlined text-[20px]">
                                                                {v.category?.icon || 'local_shipping'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{v.name}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-900 text-white tracking-wider">
                                                                    {v.plate_number}
                                                                </span>
                                                                {v.year && (
                                                                    <span className="text-[11px] text-slate-400">
                                                                        Thn {v.year}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category & Rental Rate */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                                                            {v.category?.name || 'Tanpa Kategori'}
                                                        </span>
                                                        <div className="text-[11px] font-bold text-slate-700 mt-1">
                                                            Rp {Number(v.category?.rental_price_per_day || 0).toLocaleString('id-ID')}
                                                            <span className="text-slate-400 font-normal"> / hari</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Capacity */}
                                                <td className="px-4 py-3.5">
                                                    <span className="font-bold text-slate-800">
                                                        {v.capacity || '-'}
                                                    </span>
                                                </td>

                                                {/* Linked Users */}
                                                <td className="px-4 py-3.5">
                                                    {v.users && v.users.length > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                                                            {v.users.map((user) => (
                                                                <span
                                                                    key={user.id}
                                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                                                                >
                                                                    <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px] font-bold">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="truncate max-w-[110px]" title={user.name}>
                                                                        {user.name}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Belum ditautkan
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    {getStatusBadge(v.status)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setVehicleModal({ isOpen: true, vehicle: v })}
                                                            title="Edit data unit kendaraan"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteModal({ isOpen: true, type: 'vehicle', item: v })}
                                                            title="Hapus unit kendaraan"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. TAB 2: CATEGORIES & RENTAL PRICING */}
                {activeTab === 'categories' && (
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Daftar Kategori &amp; Penetapan Tarif Sewa
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Admin dapat menentukan manual kategori kendaraan hauling (seperti Pickup Truck, Lorry, Box Car, Heavy Truck, Roadtrain) beserta harga sewa per harinya.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCategoryModal({ isOpen: true, category: null })}
                                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                <span>Tambah Kategori Baru</span>
                            </button>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/40 transition-all shadow-2xs space-y-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
                                                <span className="material-symbols-outlined text-[26px]">
                                                    {cat.icon || 'local_shipping'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-900 text-sm">
                                                    {cat.name}
                                                </h3>
                                                <div className="text-[11px] font-mono text-slate-400">
                                                    slug: {cat.slug}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setCategoryModal({ isOpen: true, category: cat })}
                                                title="Edit kategori & tarif"
                                                className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteModal({ isOpen: true, type: 'category', item: cat })}
                                                title="Hapus kategori"
                                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rental Price Badge */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                            Tarif Sewa Harian (Rental Rate)
                                        </div>
                                        <div className="text-lg font-black text-brand-700 mt-0.5">
                                            Rp {Number(cat.rental_price_per_day).toLocaleString('id-ID')}
                                            <span className="text-xs font-normal text-slate-500"> / hari</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                                        {cat.description || 'Tidak ada deskripsi spesifikasi untuk kategori ini.'}
                                    </p>

                                    {/* Linked Units count */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">rv_hookup</span>
                                            <span>Unit terdaftar:</span>
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {cat.vehicles_count ?? (cat.vehicles ? cat.vehicles.length : 0)} unit
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <VehicleModal
                isOpen={vehicleModal.isOpen}
                onClose={() => setVehicleModal({ isOpen: false, vehicle: null })}
                vehicle={vehicleModal.vehicle}
                categories={categories}
                availableUsers={availableUsers}
            />

            <CategoryModal
                isOpen={categoryModal.isOpen}
                onClose={() => setCategoryModal({ isOpen: false, category: null })}
                category={categoryModal.category}
            />

            {/* DELETE CONFIRMATION MODAL */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">warning</span>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    Konfirmasi Penghapusan
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Tindakan ini tidak dapat dibatalkan
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Apakah Anda yakin ingin menghapus {deleteModal.type === 'vehicle' ? 'unit armada' : 'kategori'}{' '}
                            <strong className="text-slate-900">{deleteModal.item?.name}</strong>?
                            {deleteModal.type === 'category' && (
                                <span className="block mt-1 text-rose-600 font-semibold">
                                    Peringatan: Kategori tidak dapat dihapus jika masih terdapat unit armada yang terhubung.
                                </span>
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, type: '', item: null })}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/30 cursor-pointer"
                            >
                                Ya, Hapus Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
