import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function CategoryModal({ isOpen, onClose, category = null }) {
    const isEditing = Boolean(category);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        rental_price_per_day: '',
        description: '',
        icon: 'local_shipping',
    });

    useEffect(() => {
        if (category) {
            setData({
                name: category.name || '',
                rental_price_per_day: category.rental_price_per_day || '',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
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
                                Konfigurasi jenis armada hauling dan biaya rental per hari
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

                    {/* Rental Price Per Day */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                            Biaya Rental per Hari (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-slate-400">Rp</span>
                            <input
                                type="number"
                                min="0"
                                step="10000"
                                value={data.rental_price_per_day}
                                onChange={(e) => setData('rental_price_per_day', e.target.value)}
                                placeholder="Contoh: 4500000"
                                required
                                className="w-full h-10 pl-10 pr-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400">Tarif acuan sewa per hari untuk kendaraan di kategori ini.</p>
                        {errors.rental_price_per_day && (
                            <p className="text-xs text-rose-600 font-semibold">{errors.rental_price_per_day}</p>
                        )}
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
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Karakteristik muatan, rute, atau spesifikasi umum kategori ini..."
                            className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
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
