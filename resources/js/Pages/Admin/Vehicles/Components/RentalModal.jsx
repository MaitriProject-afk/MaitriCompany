import { useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

const LICENSE_OPTIONS = [
    { id: 'driving', label: 'Driving License', icon: 'badge', desc: 'SIM Mengemudi Umum' },
    { id: 'trucker', label: 'Trucker License', icon: 'local_shipping', desc: 'Izin Operasional Truk Berat' },
    { id: 'lumber', label: 'Lumber License', icon: 'forest', desc: 'Izin Pengangkutan Kayu & Log' },
];

export default function RentalModal({ isOpen, onClose, availableVehicles = [] }) {
    if (!isOpen) return null;

    // Helper to format date for datetime-local input
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: availableVehicles.length > 0 ? String(availableVehicles[0].id) : '',
        renter_name: '',
        san_andreas_id_card: '',
        contact_phone: '',
        initial_health: 2000,
        licenses: ['driving', 'trucker'],
        rental_type: 'hari',
        duration: 1,
        start_time: getCurrentDateTimeLocal(),
        notes: '',
    });

    const selectedVehicle = useMemo(() => {
        return availableVehicles.find((v) => String(v.id) === String(data.vehicle_id));
    }, [availableVehicles, data.vehicle_id]);

    // Available rental types based on category rates
    const availableTypes = useMemo(() => {
        if (!selectedVehicle?.category) return [];
        const cat = selectedVehicle.category;
        const types = [];

        if (cat.rental_price_per_hour !== null && cat.rental_price_per_hour !== undefined && Number(cat.rental_price_per_hour) > 0) {
            types.push({
                id: 'jam',
                label: 'Per Jam',
                rate: Number(cat.rental_price_per_hour),
                icon: 'schedule',
                unitSuffix: '/jam',
            });
        }
        if (cat.rental_price_per_day !== null && cat.rental_price_per_day !== undefined && Number(cat.rental_price_per_day) > 0) {
            types.push({
                id: 'hari',
                label: 'Per Hari',
                rate: Number(cat.rental_price_per_day),
                icon: 'today',
                unitSuffix: '/hari',
            });
        }
        if (cat.rental_price_per_trip !== null && cat.rental_price_per_trip !== undefined && Number(cat.rental_price_per_trip) > 0) {
            types.push({
                id: 'trip',
                label: 'Per Trip',
                rate: Number(cat.rental_price_per_trip),
                icon: 'route',
                unitSuffix: '/trip',
            });
        }

        return types;
    }, [selectedVehicle]);

    // Auto-select valid rental_type when vehicle changes
    useEffect(() => {
        if (availableTypes.length > 0) {
            const hasCurrentType = availableTypes.some((t) => t.id === data.rental_type);
            if (!hasCurrentType) {
                setData('rental_type', availableTypes[0].id);
            }
        }
    }, [availableTypes]);

    // Active rate calculation
    const activeRate = useMemo(() => {
        const typeObj = availableTypes.find((t) => t.id === data.rental_type);
        return typeObj ? typeObj.rate : 0;
    }, [availableTypes, data.rental_type]);

    const estimatedTotalPrice = useMemo(() => {
        const dur = parseInt(data.duration, 10) || 1;
        return activeRate * dur;
    }, [activeRate, data.duration]);

    // Expected Return Time calculation preview
    const returnTimePreview = useMemo(() => {
        if (!data.start_time) return null;
        try {
            const start = new Date(data.start_time);
            if (isNaN(start.getTime())) return null;

            const dur = parseInt(data.duration, 10) || 1;
            const end = new Date(start.getTime());

            if (data.rental_type === 'jam') {
                end.setHours(end.getHours() + dur);
            } else if (data.rental_type === 'hari') {
                end.setDate(end.getDate() + dur);
            } else if (data.rental_type === 'trip') {
                end.setHours(end.getHours() + (dur * 24));
            }

            const formatOptions = {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };

            return {
                startFormatted: start.toLocaleDateString('id-ID', formatOptions),
                endFormatted: end.toLocaleDateString('id-ID', formatOptions),
            };
        } catch {
            return null;
        }
    }, [data.start_time, data.duration, data.rental_type]);

    const toggleLicense = (id) => {
        if (data.licenses.includes(id)) {
            setData('licenses', data.licenses.filter((l) => l !== id));
        } else {
            setData('licenses', [...data.licenses, id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.rentals.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs animate-fadeIn overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/90 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto">
                {/* Header (Pinned) */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">car_rental</span>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                                Formulir Penyewaan Armada Truk
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Registrasi data penyewa, lisensi, unit armada, dan durasi sewa aktif
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer transition-colors"
                        title="Tutup Modal"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Scrollable Form Body */}
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-4.5 flex-1 min-h-0">
                        {/* 1. Renter Info: Name, San Andreas ID Card (KTP), & Contact Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">
                                    Nama Penyewa <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.renter_name}
                                    onChange={(e) => setData('renter_name', e.target.value)}
                                    placeholder="Contoh: Carl Johnson"
                                    required
                                    className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                                />
                                {errors.renter_name && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.renter_name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">
                                    San Andreas ID Card (No. KTP) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                        badge
                                    </span>
                                    <input
                                        type="text"
                                        value={data.san_andreas_id_card}
                                        onChange={(e) => setData('san_andreas_id_card', e.target.value)}
                                        placeholder="Contoh: SA-98979 / 12345"
                                        required
                                        className="w-full h-10 pl-9 pr-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono uppercase"
                                    />
                                </div>
                                {errors.san_andreas_id_card && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.san_andreas_id_card}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800">
                                    Nomor Kontak / Telepon <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                        call
                                    </span>
                                    <input
                                        type="text"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="Contoh: 555-0192"
                                        required
                                        className="w-full h-10 pl-9 pr-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono"
                                    />
                                </div>
                                {errors.contact_phone && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.contact_phone}</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Multiple Licenses Checkboxes */}
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-brand-600">verified</span>
                                    <span>Kepemilikan Lisensi Penyewa (Bisa Lebih Dari Satu)</span>
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                                    {data.licenses.length} Tercentang
                                </span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                {LICENSE_OPTIONS.map((lic) => {
                                    const isChecked = data.licenses.includes(lic.id);
                                    return (
                                        <div
                                            key={lic.id}
                                            onClick={() => toggleLicense(lic.id)}
                                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                                isChecked
                                                    ? 'bg-white border-brand-500 shadow-2xs ring-1 ring-brand-400/30'
                                                    : 'bg-white/70 border-slate-200 hover:bg-white'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-900 leading-tight">
                                                    {lic.label}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                                    {lic.desc}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.licenses && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.licenses}</p>
                            )}
                        </div>

                        {/* 3. Select Available Vehicle */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                <span>Pilih Unit Truk (Hanya Status Tersedia) <span className="text-rose-500">*</span></span>
                                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {availableVehicles.length} Truk Siap Sewa
                                </span>
                            </label>

                            {availableVehicles.length === 0 ? (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                                    ⚠️ Saat ini tidak ada unit truk yang berstatus <strong>Tersedia</strong>. Seluruh armada sedang disewa atau dalam perawatan.
                                </div>
                            ) : (
                                <select
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                    required
                                    className="w-full h-10 px-3 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                                >
                                    {availableVehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} — [{v.plate_number}] ({v.category?.name || 'Tanpa Kategori'})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.vehicle_id && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.vehicle_id}</p>
                            )}
                        </div>

                        {/* 3.5 Initial Vehicle Health */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[17px] text-emerald-600">health_and_safety</span>
                                    <span>Durabilitas / Health Awal Unit Saat Diserahkan</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300">
                                    {data.initial_health} HP
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Catat health awal truk sebelum kunci diserahkan ke penyewa sebagai acuan kondisi saat dikembalikan.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10000"
                                        step="1"
                                        value={data.initial_health}
                                        onChange={(e) => setData('initial_health', parseInt(e.target.value, 10) || 0)}
                                        required
                                        className="w-full h-10 px-3.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setData('initial_health', 2000)}
                                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                            data.initial_health === 2000
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        2000 (Standar)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('initial_health', 1500)}
                                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                            data.initial_health === 1500
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        1500
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('initial_health', 1000)}
                                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                            data.initial_health === 1000
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        1000
                                    </button>
                                </div>
                            </div>
                            {errors.initial_health && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.initial_health}</p>
                            )}
                        </div>

                        {/* 4. Rental Scheme & Rate Selection */}
                        {selectedVehicle && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-amber-600">payments</span>
                                        <span>Skema Waktu &amp; Tarif Sewa</span>
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        Kategori: <strong className="text-slate-800">{selectedVehicle.category?.name}</strong>
                                    </span>
                                </div>

                                {availableTypes.length === 0 ? (
                                    <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                                        Kategori truk ini belum memiliki tarif sewa yang aktif. Silakan atur tarif terlebih dahulu di tab <strong>Kategori &amp; Tarif</strong>.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {availableTypes.map((type) => {
                                            const isSelected = data.rental_type === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setData('rental_type', type.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-brand-50 border-brand-500 shadow-2xs ring-2 ring-brand-500/20'
                                                            : 'bg-white border-slate-200 hover:bg-slate-100/70'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="material-symbols-outlined text-[18px] text-slate-500">
                                                            {type.icon}
                                                        </span>
                                                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                                            isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {type.label}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="text-sm font-black text-slate-900">
                                                            Rp {type.rate.toLocaleString('id-ID')}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-medium">
                                                            Tarif satuan {type.unitSuffix}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.rental_type && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.rental_type}</p>
                                )}

                                {/* Duration & Start Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-800">
                                            Waktu Mulai Sewa <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            required
                                            className="w-full h-9.5 px-3 bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none"
                                        />
                                        {errors.start_time && (
                                            <p className="text-xs text-rose-600 font-semibold">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-800">
                                            Durasi Sewa ({data.rental_type === 'jam' ? 'Jumlah Jam' : data.rental_type === 'hari' ? 'Jumlah Hari' : 'Jumlah Trip'}) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max={data.rental_type === 'jam' ? 72 : 365}
                                                value={data.duration}
                                                onChange={(e) => setData('duration', e.target.value)}
                                                required
                                                className="w-full h-9.5 px-3 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/20 outline-none"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold uppercase">
                                                {data.rental_type}
                                            </span>
                                        </div>
                                        {errors.duration && (
                                            <p className="text-xs text-rose-600 font-semibold">{errors.duration}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Rental Schedule Preview & Total Price */}
                                {returnTimePreview && (
                                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-2 mt-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[15px] text-blue-600">timelapse</span>
                                                <span>Rentang Waktu Sewa:</span>
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {data.duration} {data.rental_type.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                                            <div>
                                                <span className="text-slate-400 font-medium">Mulai: </span>
                                                <strong className="text-slate-900">{returnTimePreview.startFormatted}</strong>
                                            </div>
                                            <span className="hidden sm:inline text-slate-300">➜</span>
                                            <div>
                                                <span className="text-slate-400 font-medium">Batas Kembali: </span>
                                                <strong className="text-blue-700">{returnTimePreview.endFormatted}</strong>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                                            <span className="text-xs font-bold text-slate-700">Estimasi Total Biaya Sewa:</span>
                                            <span className="text-base font-black text-brand-700">
                                                Rp {estimatedTotalPrice.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 5. Notes */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Catatan Khusus / Rute &amp; Kebutuhan Muatan (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Tujuan rute jalan, muatan kayu/batu/logistik industri, uang muka..."
                                className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
                            ></textarea>
                            {errors.notes && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons (Pinned) */}
                    <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/95 rounded-b-2xl shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || availableVehicles.length === 0}
                            className="px-4.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {processing && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            <span>Aktifkan Sewa Truk</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
