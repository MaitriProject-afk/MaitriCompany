import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function CategoryModal({ isOpen, onClose, category = null }) {
    const isEditing = Boolean(category);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        rental_price_per_hour: '',
        rental_price_per_day: '',
        rental_price_per_trip: '',
        description: '',
        icon: 'local_shipping',
    });

    useEffect(() => {
        if (category) {
            setData({
                name: category.name || '',
                rental_price_per_hour: category.rental_price_per_hour ?? '',
                rental_price_per_day: category.rental_price_per_day ?? '',
                rental_price_per_trip: category.rental_price_per_trip ?? '',
                description: category.description || '',
                icon: category.icon || 'local_shipping',
            });
        } else {
            reset();
        }
        clearErrors();
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('admin.vehicle-categories.update', category.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('admin.vehicle-categories.store'), {
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 my-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">category</span>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                                {isEditing ? 'Edit Kategori & Tarif Rental' : 'Tambah Kategori Kendaraan Baru'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Konfigurasi jenis armada hauling dan tarif sewa fleksibel
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
                    {/* Category Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                            Nama Kategori <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Pickup Truck, Lorry, Box Car, Heavy Truck, Roadtrain"
                            required
                            className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                        />
                        {errors.name && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.name}</p>
                        )}
                    </div>

                    {/* Flexible Rental Pricing Section */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-brand-600 text-[20px] shrink-0 mt-0.5">
                                payments
                            </span>
                            <div>
                                <h4 className="text-xs font-extrabold text-slate-900">
                                    Struktur Waktu Sewa &amp; Tarif (Bebas Disesuaikan)
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Pilih opsi waktu sewa yang berlaku untuk kategori ini. Isi hanya opsi yang aktif (misal hanya <strong>Per Trip</strong> saja, atau kombinasi <strong>Per Jam / Hari</strong>). Opsi yang dikosongkan akan otomatis bernilai <em>null</em>.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5 pt-1">
                            {/* 1. Per Jam */}
                            <div className="flex items-center gap-2">
                                <div className="w-24 shrink-0 text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                                    <span>Per Jam:</span>
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={data.rental_price_per_hour}
                                        onChange={(e) => setData('rental_price_per_hour', e.target.value)}
                                        placeholder="Kosongkan jika tidak disewakan per jam"
                                        className="w-full h-9 pl-9 pr-3 bg-white text-slate-900 text-xs rounded-lg border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {errors.rental_price_per_hour && (
                                <p className="text-xs text-rose-600 font-semibold pl-24">{errors.rental_price_per_hour}</p>
                            )}

                            {/* 2. Per Hari */}
                            <div className="flex items-center gap-2">
                                <div className="w-24 shrink-0 text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-slate-400">today</span>
                                    <span>Per Hari:</span>
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="10000"
                                        value={data.rental_price_per_day}
                                        onChange={(e) => setData('rental_price_per_day', e.target.value)}
                                        placeholder="Kosongkan jika tidak disewakan per hari"
                                        className="w-full h-9 pl-9 pr-3 bg-white text-slate-900 text-xs rounded-lg border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {errors.rental_price_per_day && (
                                <p className="text-xs text-rose-600 font-semibold pl-24">{errors.rental_price_per_day}</p>
                            )}

                            {/* 3. Per Trip */}
                            <div className="flex items-center gap-2">
                                <div className="w-24 shrink-0 text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-slate-400">route</span>
                                    <span>Per Trip:</span>
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="10000"
                                        value={data.rental_price_per_trip}
                                        onChange={(e) => setData('rental_price_per_trip', e.target.value)}
                                        placeholder="Kosongkan jika tidak disewakan per trip"
                                        className="w-full h-9 pl-9 pr-3 bg-white text-slate-900 text-xs rounded-lg border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {errors.rental_price_per_trip && (
                                <p className="text-xs text-rose-600 font-semibold pl-24">{errors.rental_price_per_trip}</p>
                            )}
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                            Ikon Kategori
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { id: 'local_shipping', label: 'Truk' },
                                { id: 'rv_hookup', label: 'Lorry' },
                                { id: 'inventory_2', label: 'Boks' },
                                { id: 'train', label: 'Roadtrain' },
                                { id: 'forklift', label: 'Heavy' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setData('icon', item.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        data.icon === item.id
                                            ? 'bg-brand-50 border-brand-600 text-brand-700 shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.id}</span>
                                    <span className="text-[10px] mt-0.5">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                            Deskripsi Singkat (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Karakteristik muatan, rute operasional, atau spesifikasi umum..."
                            className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
                        ></textarea>
                        {errors.description && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.description}</p>
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
                            <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
