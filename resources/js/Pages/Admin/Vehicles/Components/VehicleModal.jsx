import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function VehicleModal({ isOpen, onClose, vehicle = null, categories = [], availableUsers = [] }) {
    const isEditing = Boolean(vehicle);
    const [userSearch, setUserSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        vehicle_category_id: '',
        name: '',
        plate_number: '',
        capacity: '',
        status: 'tersedia',
        year: new Date().getFullYear(),
        notes: '',
        user_ids: [],
    });

    useEffect(() => {
        if (vehicle) {
            setData({
                vehicle_category_id: vehicle.vehicle_category_id || '',
                name: vehicle.name || '',
                plate_number: vehicle.plate_number || '',
                capacity: vehicle.capacity || '',
                status: vehicle.status || 'tersedia',
                year: vehicle.year || new Date().getFullYear(),
                notes: vehicle.notes || '',
                user_ids: vehicle.users ? vehicle.users.map((u) => u.id) : [],
            });
        } else {
            reset();
            if (categories.length > 0) {
                setData((prev) => ({
                    ...prev,
                    vehicle_category_id: categories[0].id,
                    user_ids: [],
                }));
            }
        }
        setUserSearch('');
        clearErrors();
    }, [vehicle, isOpen]);

    if (!isOpen) return null;

    const toggleUser = (userId) => {
        const current = [...data.user_ids];
        const index = current.indexOf(userId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(userId);
        }
        setData('user_ids', current);
    };

    const handleSelectAllUsers = () => {
        if (data.user_ids.length === filteredUsers.length) {
            setData('user_ids', []);
        } else {
            setData('user_ids', filteredUsers.map((u) => u.id));
        }
    };

    const filteredUsers = availableUsers.filter((u) => {
        const query = userSearch.toLowerCase();
        return (
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.role && u.role.toLowerCase().includes(query))
        );
    });

    const selectedCategory = categories.find((c) => String(c.id) === String(data.vehicle_category_id));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('admin.vehicles.update', vehicle.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('admin.vehicles.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 my-8 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                                {isEditing ? 'Edit Unit Armada Hauling' : 'Tambah Unit Kendaraan Hauling Baru'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Lengkapi spesifikasi kendaraan dan tetapkan personil penanggung jawab
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info: Name & Plate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Nama Unit / Tipe Kendaraan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Scania R620 Heavy Hauler #01"
                                required
                                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                            {errors.name && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Nomor Plat / Polisi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.plate_number}
                                onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                placeholder="Contoh: KT 8821 MM"
                                required
                                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono uppercase"
                            />
                            {errors.plate_number && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.plate_number}</p>
                            )}
                        </div>
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Kategori Kendaraan <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.vehicle_category_id}
                                onChange={(e) => setData('vehicle_category_id', e.target.value)}
                                required
                                className="w-full h-10 px-3 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {selectedCategory && (
                                <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 space-y-1 mt-1">
                                    <div className="font-bold text-amber-800 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">payments</span>
                                        <span>Tarif Sewa Kategori:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {selectedCategory.rental_price_per_hour ? (
                                            <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200/80 text-slate-800 font-bold">
                                                Rp {Number(selectedCategory.rental_price_per_hour).toLocaleString('id-ID')} <span className="text-slate-500 font-normal">/jam</span>
                                            </span>
                                        ) : null}
                                        {selectedCategory.rental_price_per_day ? (
                                            <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200/80 text-slate-800 font-bold">
                                                Rp {Number(selectedCategory.rental_price_per_day).toLocaleString('id-ID')} <span className="text-slate-500 font-normal">/hari</span>
                                            </span>
                                        ) : null}
                                        {selectedCategory.rental_price_per_trip ? (
                                            <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200/80 text-slate-800 font-bold">
                                                Rp {Number(selectedCategory.rental_price_per_trip).toLocaleString('id-ID')} <span className="text-slate-500 font-normal">/trip</span>
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                            {errors.vehicle_category_id && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.vehicle_category_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Status Unit <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                required
                                className="w-full h-10 px-3 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            >
                                <option value="tersedia">Tersedia (Ready for Hauling)</option>
                                <option value="disewa">Sedang Disewa (Active Rental)</option>
                                <option value="perawatan">Dalam Perawatan (Maintenance)</option>
                            </select>
                            {errors.status && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Capacity & Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Kapasitas Angkut / Muatan
                            </label>
                            <input
                                type="text"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', e.target.value)}
                                placeholder="Contoh: 120 Ton, 30 m³, 4.5 Ton"
                                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                            {errors.capacity && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.capacity}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Tahun Perakitan / Pembelian
                            </label>
                            <input
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder={String(new Date().getFullYear())}
                                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                            {errors.year && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.year}</p>
                            )}
                        </div>
                    </div>

                    {/* Linked Users / Penanggung Jawab Kendaraan (Multi-select) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>Penanggung Jawab / Personil Unit</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                                        {data.user_ids.length} dipilih
                                    </span>
                                </label>
                                <p className="text-[11px] text-slate-500">
                                    Tautkan satu atau beberapa user/driver yang memegang dan bertanggung jawab atas unit hauling ini.
                                </p>
                            </div>
                            {filteredUsers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAllUsers}
                                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                                >
                                    {data.user_ids.length === filteredUsers.length ? 'Batal Semua' : 'Pilih Semua'}
                                </button>
                            )}
                        </div>

                        {/* Search input for users */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                search
                            </span>
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Cari nama personil, email, atau role..."
                                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
                            />
                        </div>

                        {/* User cards list */}
                        <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-1.5">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-400">
                                    Tidak ada personil ditemukan dengan pencarian tersebut.
                                </div>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = data.user_ids.includes(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                                isSelected
                                                    ? 'bg-brand-50/80 border-brand-300 shadow-2xs'
                                                    : 'bg-white border-slate-200/70 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // handled by parent onClick
                                                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                />
                                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 truncate">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-1.5 ml-2">
                                                <span
                                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                        user.role === 'admin'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : user.role === 'staff'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {errors.user_ids && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.user_ids}</p>
                        )}
                    </div>

                    {/* Operational Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                            Catatan Operasional / Kelengkapan Dokumen (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="KIR aktif s/d Des 2026, GPS Track id: #9901, riwayat servis rutin..."
                            className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
                        ></textarea>
                        {errors.notes && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.notes}</p>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {processing && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            <span>{isEditing ? 'Simpan Perubahan Unit' : 'Simpan Unit Armada'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
