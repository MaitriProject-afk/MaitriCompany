import { useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

const CONDITION_PRESETS = [
    {
        id: 'normal',
        label: 'Normal / Sempurna',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: 'check_circle',
        desc: 'Health utuh tanpa lecet. Unit langsung siap disewakan kembali.',
    },
    {
        id: 'rusak_ringan',
        label: 'Lecet Pemakaian (Berkurang ≤ 100 HP)',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: 'info',
        desc: 'Baret tipis wajar / health turun ≤ 100 HP. Bebas denda perbaikan.',
    },
    {
        id: 'rusak_berat',
        label: 'Rusak Berat / Tabrakan (> 100 HP)',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: 'car_crash',
        desc: 'Mesin rusak / bumper pecah / turun > 100 HP. Wajib biaya mechanic.',
    },
    {
        id: 'hancur_meledak',
        label: 'Meledak / Hancur Total',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: 'local_fire_department',
        desc: 'Truk meledak / terbakar / tercebur. Wajib klaim asuransi.',
    },
];

export default function ReturnModal({ isOpen, onClose, rental }) {
    if (!isOpen || !rental) return null;

    const initialHealth = Number(rental.initial_health) || 2000;
    const [clientValidationError, setClientValidationError] = useState('');

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        actual_return_time: getCurrentDateTimeLocal(),
        vehicle_condition: 'normal',
        return_health: initialHealth,
        damage_fee_type: 'none', // 'none' | 'mechanic' | 'insurance'
        damage_fee: 0,
        late_penalty_fee: 0,
        return_notes: '',
    });

    // Detect late return based on actual_return_time and expected_return_time
    const lateAnalysis = useMemo(() => {
        if (!rental.expected_return_time_iso || !data.actual_return_time) {
            return { isLate: false, lateHours: 0, suggestedPenalty: 0 };
        }

        const expected = new Date(rental.expected_return_time_iso);
        const actual = new Date(data.actual_return_time);

        if (isNaN(expected.getTime()) || isNaN(actual.getTime())) {
            return { isLate: false, lateHours: 0, suggestedPenalty: 0 };
        }

        const diffMs = actual.getTime() - expected.getTime();
        if (diffMs <= 0) {
            return { isLate: false, lateHours: 0, suggestedPenalty: 0 };
        }

        const lateHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        let suggestedPenalty = 0;
        if (rental.rental_type === 'jam') {
            suggestedPenalty = Math.round(lateHours * rental.rate_per_unit * 1.5);
        } else if (rental.rental_type === 'hari') {
            const lateDays = Math.max(1, Math.ceil(lateHours / 24));
            suggestedPenalty = Math.round(lateDays * rental.rate_per_unit * 1.25);
        } else {
            suggestedPenalty = Math.round(rental.rate_per_unit * 0.5);
        }

        return {
            isLate: true,
            lateHours,
            suggestedPenalty,
        };
    }, [rental, data.actual_return_time]);

    // Strict Health Drop Analysis & Enforced Fee Category
    const healthAnalysis = useMemo(() => {
        const curHealth = Number(data.return_health) || 0;
        const loss = Math.max(0, initialHealth - curHealth);
        const isExploded = data.vehicle_condition === 'hancur_meledak' || curHealth === 0;
        const needsMechanic = loss > 100 && !isExploded;
        const isWithinTolerance = loss <= 100 && !isExploded;

        let requiredFeeType = 'none';
        if (isExploded) {
            requiredFeeType = 'insurance';
        } else if (needsMechanic) {
            requiredFeeType = 'mechanic';
        } else {
            requiredFeeType = 'none';
        }

        return {
            loss,
            isExploded,
            needsMechanic,
            isWithinTolerance,
            requiredFeeType,
        };
    }, [initialHealth, data.return_health, data.vehicle_condition]);

    // Lock and sync damage_fee_type automatically to enforced category
    useEffect(() => {
        if (data.damage_fee_type !== healthAnalysis.requiredFeeType) {
            setData((prev) => ({
                ...prev,
                damage_fee_type: healthAnalysis.requiredFeeType,
                damage_fee: healthAnalysis.requiredFeeType === 'none' ? 0 : prev.damage_fee,
            }));
            setClientValidationError('');
        }
    }, [healthAnalysis.requiredFeeType]);

    // Apply Preset Condition
    const applyConditionPreset = (preset) => {
        setClientValidationError('');
        if (preset.id === 'hancur_meledak') {
            setData((prev) => ({
                ...prev,
                vehicle_condition: 'hancur_meledak',
                return_health: 0,
                damage_fee_type: 'insurance',
            }));
        } else if (preset.id === 'normal') {
            setData((prev) => ({
                ...prev,
                vehicle_condition: 'normal',
                return_health: initialHealth,
                damage_fee_type: 'none',
                damage_fee: 0,
            }));
        } else if (preset.id === 'rusak_ringan') {
            const newHealth = Math.max(0, initialHealth - 80);
            setData((prev) => ({
                ...prev,
                vehicle_condition: 'rusak_ringan',
                return_health: newHealth,
                damage_fee_type: 'none',
                damage_fee: 0,
            }));
        } else if (preset.id === 'rusak_berat') {
            const newHealth = Math.max(0, initialHealth - 400);
            setData((prev) => ({
                ...prev,
                vehicle_condition: 'rusak_berat',
                return_health: newHealth,
                damage_fee_type: 'mechanic',
            }));
        }
    };

    // Auto update late penalty suggestion on load or late detection change
    useEffect(() => {
        if (lateAnalysis.isLate && data.late_penalty_fee === 0) {
            setData('late_penalty_fee', lateAnalysis.suggestedPenalty);
        }
    }, [lateAnalysis.isLate]);

    // Total Calculation
    const grandTotal = useMemo(() => {
        const base = Number(rental.rental_price) || 0;
        const late = Number(data.late_penalty_fee) || 0;
        const damage = Number(data.damage_fee) || 0;
        return base + late + damage;
    }, [rental.rental_price, data.late_penalty_fee, data.damage_fee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientValidationError('');

        // Strict enforcement verification before sending
        if (healthAnalysis.isExploded && (!data.damage_fee || Number(data.damage_fee) <= 0)) {
            setClientValidationError('Truk meledak / hancur total (health 0 HP). Anda WAJIB mengisi nominal biaya tebus / klaim asuransi (tidak boleh Rp 0)!');
            return;
        }

        if (healthAnalysis.needsMechanic && (!data.damage_fee || Number(data.damage_fee) <= 0)) {
            setClientValidationError(`Health truk berkurang ${healthAnalysis.loss} HP (> 100 HP). Anda WAJIB mengisi nominal biaya perbaikan dari mechanic (tidak boleh Rp 0)!`);
            return;
        }

        post(route('admin.rentals.return', rental.id), {
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                                Formulir Pengembalian Truk #{rental.id}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Cek penurunan health, denda keterlambatan, biaya mechanic / klaim asuransi
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
                        {/* Client Validation Error Alert */}
                        {clientValidationError && (
                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-start gap-2.5 animate-pulse">
                                <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">error</span>
                                <div className="space-y-0.5">
                                    <div className="font-extrabold">Validasi Denda Diperlukan:</div>
                                    <div className="font-normal text-rose-800">{clientValidationError}</div>
                                </div>
                            </div>
                        )}

                        {/* 1. Rental & Vehicle Summary Banner */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Informasi Sewa &amp; Penyewa
                                </div>
                                <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                    <span>{rental.renter_name}</span>
                                    <span className="text-slate-400 font-normal">|</span>
                                    <span className="font-mono text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                                        ID: {rental.san_andreas_id_card || rental.san_andreas_phone || '-'}
                                    </span>
                                </div>
                                <div className="text-slate-500 flex items-center gap-2">
                                    <span>No. Kontak: <strong>{rental.contact_phone || rental.san_andreas_phone}</strong></span>
                                </div>
                            </div>

                            <div className="sm:text-right space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Unit Armada
                                </div>
                                <div className="font-bold text-slate-900">
                                    {rental.vehicle?.name}
                                </div>
                                <div className="text-slate-500 font-mono text-[11px]">
                                    [{rental.vehicle?.plate_number}] • Health Awal: <strong className="text-emerald-700 font-bold">{initialHealth} HP</strong>
                                </div>
                            </div>
                        </div>

                        {/* 2. Actual Return Time & Overdue Notice */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800">
                                    Waktu Pengembalian Aktual <span className="text-rose-500">*</span>
                                </label>
                                {lateAnalysis.isLate ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        <span>Terlambat {lateAnalysis.lateHours} Jam!</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        <span>Tepat Waktu</span>
                                    </span>
                                )}
                            </div>

                            <input
                                type="datetime-local"
                                value={data.actual_return_time}
                                onChange={(e) => setData('actual_return_time', e.target.value)}
                                required
                                className="w-full h-10 px-3.5 bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                            />
                            {errors.actual_return_time && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.actual_return_time}</p>
                            )}

                            {/* Late Penalty Input */}
                            {lateAnalysis.isLate && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-rose-900 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            <span>Denda Keterlambatan Waktu Sewa:</span>
                                        </span>
                                        <span className="text-[11px] text-rose-700">
                                            Estimasi Saran: <strong>Rp {lateAnalysis.suggestedPenalty.toLocaleString('id-ID')}</strong>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={data.late_penalty_fee}
                                            onChange={(e) => setData('late_penalty_fee', e.target.value)}
                                            placeholder="0"
                                            className="w-full h-9 pl-9 pr-3 bg-white text-rose-900 font-bold text-xs rounded-lg border border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Return Health & Damage Assessment */}
                        <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px] text-amber-600">health_and_safety</span>
                                        <span>Inspeksi Health Truk Saat Kembali</span>
                                    </label>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Health awal: <strong>{initialHealth} HP</strong>. Berkurang ≤ 100 HP dihitung wajar/bebas denda, berkurang &gt; 100 HP wajib denda mechanic, 0 HP wajib klaim asuransi.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                                        Awal: {initialHealth} HP
                                    </span>
                                    <span className="material-symbols-outlined text-slate-400 text-[16px]">arrow_forward</span>
                                    <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${
                                        healthAnalysis.isExploded
                                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                            : healthAnalysis.isWithinTolerance
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : 'bg-amber-100 text-amber-800 border-amber-300'
                                    }`}>
                                        Kembali: {data.return_health} HP
                                    </span>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {CONDITION_PRESETS.map((preset) => {
                                    const isSelected = data.vehicle_condition === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => applyConditionPreset(preset)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-white border-brand-500 shadow-xs ring-2 ring-brand-400/20'
                                                    : 'bg-white/70 border-slate-200 hover:bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="material-symbols-outlined text-[16px] text-slate-700">
                                                    {preset.icon}
                                                </span>
                                                <span className="text-xs font-bold text-slate-900 truncate">
                                                    {preset.label.split(' ')[0]}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                                {preset.desc}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Health Input & Health Loss Indicator */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">
                                        Jumlah Health Saat Kembali (HP): <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={initialHealth}
                                        step="1"
                                        value={data.return_health}
                                        onChange={(e) => {
                                            setClientValidationError('');
                                            const val = parseInt(e.target.value, 10);
                                            const normalizedVal = isNaN(val) ? 0 : Math.max(0, Math.min(initialHealth, val));
                                            const loss = initialHealth - normalizedVal;
                                            let cond = 'normal';

                                            if (normalizedVal <= 0) {
                                                cond = 'hancur_meledak';
                                            } else if (loss > 100) {
                                                cond = 'rusak_berat';
                                            } else if (loss > 0) {
                                                cond = 'rusak_ringan';
                                            }

                                            setData((prev) => ({
                                                ...prev,
                                                return_health: normalizedVal,
                                                vehicle_condition: cond,
                                            }));
                                        }}
                                        required
                                        className="w-full h-10 px-3.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono"
                                    />
                                    {errors.return_health && (
                                        <p className="text-xs text-rose-600 font-semibold">{errors.return_health}</p>
                                    )}
                                </div>

                                <div className="space-y-1 flex flex-col justify-end">
                                    <div className="text-xs font-semibold text-slate-600">
                                        Status Penurunan Health:
                                    </div>
                                    <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                        healthAnalysis.isExploded
                                            ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                                            : healthAnalysis.isWithinTolerance
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                                    }`}>
                                        <span className="material-symbols-outlined text-[18px]">
                                            {healthAnalysis.isExploded ? 'local_fire_department' : healthAnalysis.isWithinTolerance ? 'check_circle' : 'warning'}
                                        </span>
                                        <div>
                                            {healthAnalysis.isExploded ? (
                                                <span>💥 Truk Meledak (Health 0 HP). Kategori terkunci: WAJIB KLAIM ASURANSI!</span>
                                            ) : healthAnalysis.isWithinTolerance ? (
                                                <span>✅ Turun {healthAnalysis.loss} HP (≤ 100 HP). Kategori terkunci: BEBAS DENDA.</span>
                                            ) : (
                                                <span>⚠️ Turun {healthAnalysis.loss} HP (&gt; 100 HP). Kategori terkunci: WAJIB BIAYA MECHANIC!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Enforced Damage Fee Category & Manual Admin Input */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-200/80">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[17px] text-slate-600">lock</span>
                                        <span>Kategori Denda Kerusakan (Terkunci Sesuai Tingkat Health):</span>
                                    </label>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        Otomatis dikunci sistem
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {/* 1. Biaya Mechanic Button */}
                                    <button
                                        type="button"
                                        disabled={healthAnalysis.requiredFeeType !== 'mechanic'}
                                        onClick={() => {
                                            if (healthAnalysis.requiredFeeType === 'mechanic') {
                                                setData('damage_fee_type', 'mechanic');
                                            }
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            healthAnalysis.requiredFeeType === 'mechanic'
                                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 text-amber-950 font-bold shadow-xs'
                                                : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs mb-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px] text-amber-600">build</span>
                                                <span>Biaya Mechanic</span>
                                            </div>
                                            {healthAnalysis.requiredFeeType === 'mechanic' ? (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-black">
                                                    WAJIB
                                                </span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-normal">
                                            {healthAnalysis.requiredFeeType === 'mechanic' ? 'Wajib input nota perbaikan' : 'Terkunci (Hanya jika turun > 100 HP)'}
                                        </div>
                                    </button>

                                    {/* 2. Klaim Asuransi Button */}
                                    <button
                                        type="button"
                                        disabled={healthAnalysis.requiredFeeType !== 'insurance'}
                                        onClick={() => {
                                            if (healthAnalysis.requiredFeeType === 'insurance') {
                                                setData('damage_fee_type', 'insurance');
                                            }
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            healthAnalysis.requiredFeeType === 'insurance'
                                                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400/20 text-rose-950 font-bold shadow-xs'
                                                : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs mb-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px] text-rose-600">security</span>
                                                <span>Klaim Asuransi</span>
                                            </div>
                                            {healthAnalysis.requiredFeeType === 'insurance' ? (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-black">
                                                    WAJIB
                                                </span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-normal">
                                            {healthAnalysis.requiredFeeType === 'insurance' ? 'Wajib input tebus asuransi' : 'Terkunci (Hanya jika truk meledak)'}
                                        </div>
                                    </button>

                                    {/* 3. Bebas Denda Button */}
                                    <button
                                        type="button"
                                        disabled={healthAnalysis.requiredFeeType !== 'none'}
                                        onClick={() => {
                                            if (healthAnalysis.requiredFeeType === 'none') {
                                                setData((prev) => ({
                                                    ...prev,
                                                    damage_fee_type: 'none',
                                                    damage_fee: 0,
                                                }));
                                            }
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            healthAnalysis.requiredFeeType === 'none'
                                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/20 text-emerald-950 font-bold shadow-xs'
                                                : 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs mb-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                                                <span>Bebas Denda</span>
                                            </div>
                                            {healthAnalysis.requiredFeeType === 'none' ? (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-black">
                                                    AKTIF
                                                </span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-normal">
                                            {healthAnalysis.requiredFeeType === 'none' ? 'Batas wajar (turun ≤ 100 HP)' : 'Terkunci (Rusak melebihi batas wajar)'}
                                        </div>
                                    </button>
                                </div>

                                {errors.damage_fee_type && (
                                    <p className="text-xs text-rose-600 font-semibold">{errors.damage_fee_type}</p>
                                )}

                                {/* Manual Amount Input by Admin */}
                                {data.damage_fee_type !== 'none' ? (
                                    <div className="p-3.5 rounded-xl bg-white border-2 border-amber-300 space-y-1.5 animate-fadeIn">
                                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                            <span>
                                                {data.damage_fee_type === 'insurance'
                                                    ? 'Jumlah Biaya Tebus Asuransi Meledak (Input Manual Admin):'
                                                    : 'Jumlah Biaya Perbaikan di Mechanic (Input Manual Admin):'}
                                                <span className="text-rose-500"> *</span>
                                            </span>
                                            <span className="text-[11px] font-semibold text-amber-700">
                                                {data.damage_fee_type === 'insurance'
                                                    ? 'Klaim harga asuransi in-game'
                                                    : 'Biaya struk nota bengkel mechanic'}
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="any"
                                                value={data.damage_fee}
                                                onChange={(e) => {
                                                    setClientValidationError('');
                                                    setData('damage_fee', e.target.value);
                                                }}
                                                placeholder="Contoh: 1500000"
                                                required
                                                className="w-full h-10 pl-9 pr-3 bg-slate-50 focus:bg-white text-slate-900 font-black text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none font-mono"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Ketikkan nominal rupiah yang harus dibayar penyewa sesuai kwitansi mechanic / asuransi.
                                        </p>
                                        {errors.damage_fee && (
                                            <p className="text-xs text-rose-600 font-semibold">{errors.damage_fee}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                                        <span>
                                            Penurunan health dalam batas wajar (≤ 100 HP). <strong>Bebas denda kerusakan (Rp 0).</strong>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5. Return Notes */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Berita Acara / Catatan Pengembalian (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={data.return_notes}
                                onChange={(e) => setData('return_notes', e.target.value)}
                                placeholder="Nomor nota bengkel, nama mechanic, kronologi insiden, atau catatan teknisi..."
                                className="w-full p-3 bg-slate-50 focus:bg-white text-slate-900 text-xs rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
                            ></textarea>
                            {errors.return_notes && (
                                <p className="text-xs text-rose-600 font-semibold">{errors.return_notes}</p>
                            )}
                        </div>

                        {/* 6. Final Reconciliation Summary */}
                        <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Rekapitulasi Tagihan Akhir
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-slate-300">
                                    <span>Biaya Pokok Sewa:</span>
                                    <span className="font-mono font-bold">
                                        Rp {Number(rental.rental_price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {Number(data.late_penalty_fee) > 0 && (
                                    <div className="flex justify-between text-rose-400">
                                        <span>Denda Keterlambatan Waktu:</span>
                                        <span className="font-mono font-bold">
                                            + Rp {Number(data.late_penalty_fee).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {Number(data.damage_fee) > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <span>
                                            {data.damage_fee_type === 'insurance'
                                                ? 'Denda Tebus Asuransi Meledak:'
                                                : 'Denda Biaya Perbaikan Mechanic:'}
                                        </span>
                                        <span className="font-mono font-bold">
                                            + Rp {Number(data.damage_fee).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                                    <span className="text-emerald-400">Total Yang Harus Dibayar:</span>
                                    <span className="font-mono text-emerald-400 text-base">
                                        Rp {grandTotal.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer (Pinned) */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-extrabold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">done_all</span>
                            <span>{processing ? 'Memproses Pengembalian...' : 'Selesaikan Pengembalian Truk'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
