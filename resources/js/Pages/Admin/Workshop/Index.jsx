import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WorkshopAdminIndex({
    settings,
    filters,
    weekDaysHeader = [],
    dailySummary = {},
    staffRows = [],
    allLeaves = [],
    allWarnings = [],
    availableUsers = [],
}) {
    const { flash } = usePage().props;

    const shiftsList = settings?.shifts?.length > 0 ? settings.shifts : [
        { id: 'shift_pagi', name: 'Shift Pagi', start_time: '08:00', end_time: '14:00', description: 'Operasional pagi' },
        { id: 'shift_sore', name: 'Shift Sore', start_time: '14:00', end_time: '20:00', description: 'Operasional sore' },
        { id: 'shift_malam', name: 'Shift Malam', start_time: '20:00', end_time: '02:00', description: 'Piket malam' },
    ];

    const [activeTab, setActiveTab] = useState('weekly_matrix'); // 'weekly_matrix' | 'user_inspect' | 'daily' | 'leaves_warnings' | 'settings'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(staffRows[0]?.id || null);
    const [galleryModal, setGalleryModal] = useState(null);
    const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);

    const inspectedEmployee =
        staffRows.find((emp) => Number(emp.id) === Number(selectedEmployeeId)) || staffRows[0] || null;

    // Settings Form
    const settingsForm = useForm({
        workshop_name: settings?.workshop_name || 'Maitri Automotive & Workshop HQ',
        shifts: shiftsList,
        weekly_ssrp_quota: settings?.weekly_ssrp_quota ?? 3,
        min_weekly_duty_days: settings?.min_weekly_duty_days ?? 6,
        duty_miss_penalty_points: settings?.duty_miss_penalty_points ?? 1,
        ssrp_miss_penalty_points: settings?.ssrp_miss_penalty_points ?? 1,
        max_warning_points: settings?.max_warning_points ?? 3,
        sop_notice: settings?.sop_notice || '',
    });

    // Manual Warning Form (Admin assigns points manually)
    const warningForm = useForm({
        user_id: inspectedEmployee?.id || staffRows[0]?.id || '',
        points: 1,
        category: 'alpha_duty',
        reference_date: filters?.selectedDate || '',
        reason: '',
    });

    // Assign Staff & Shift Form
    const assignForm = useForm({
        user_id: availableUsers[0]?.id || '',
        position: 'Mekanik Workshop',
        workshop_shift_id: shiftsList[0]?.id || 'shift_pagi',
        action: 'assign',
    });

    const handleDateFilterChange = (newDate) => {
        router.get(
            route('admin.workshop.index'),
            { date: newDate, week: filters.weekStart },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleWeekFilterChange = (newWeekStart) => {
        router.get(
            route('admin.workshop.index'),
            { date: newWeekStart, week: newWeekStart },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleInspectUser = (emp) => {
        setSelectedEmployeeId(emp.id);
        warningForm.setData((prev) => ({
            ...prev,
            user_id: emp.id,
        }));
        setActiveTab('user_inspect');
    };

    const handleQuickChangeEmployeeShift = (emp, newShiftId) => {
        router.post(
            route('admin.workshop.staff.assign'),
            {
                user_id: emp.id,
                position: emp.position,
                workshop_shift_id: newShiftId,
                action: 'update_shift',
            },
            { preserveScroll: true }
        );
    };

    const handleRevokeWarning = (warningId) => {
        if (confirm('Hapus poin peringatan ini dari catatan kumulatif karyawan?')) {
            router.delete(route('admin.workshop.warnings.destroy', warningId), {
                preserveScroll: true,
            });
        }
    };

    const handleLeaveStatusChange = (leaveId, newStatus) => {
        router.patch(
            route('admin.workshop.leaves.update', leaveId),
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    // Shift list helpers
    const handleAddShift = () => {
        settingsForm.setData('shifts', [
            ...settingsForm.data.shifts,
            {
                id: 'shift_' + Date.now(),
                name: 'Shift Baru',
                start_time: '10:00',
                end_time: '16:00',
                description: 'Jadwal operasional bengkel',
            },
        ]);
    };

    const handleUpdateShiftField = (index, field, val) => {
        const updated = settingsForm.data.shifts.map((item, idx) =>
            idx === index ? { ...item, [field]: val } : item
        );
        settingsForm.setData('shifts', updated);
    };

    const handleRemoveShift = (index) => {
        if (settingsForm.data.shifts.length <= 1) {
            alert('Minimal harus terdapat 1 jadwal shift aktif.');
            return;
        }
        settingsForm.setData(
            'shifts',
            settingsForm.data.shifts.filter((_, idx) => idx !== index)
        );
    };

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.workshop.settings.update'), {
            preserveScroll: true,
        });
    };

    const submitManualWarning = (e) => {
        e.preventDefault();
        warningForm.post(route('admin.workshop.warnings.store'), {
            preserveScroll: true,
            onSuccess: () => warningForm.reset('reason'),
        });
    };

    const submitAssignStaff = (e) => {
        e.preventDefault();
        assignForm.post(route('admin.workshop.staff.assign'), {
            preserveScroll: true,
            onSuccess: () => setIsAssignStaffModalOpen(false),
        });
    };

    const handleRemoveFromWorkshop = (emp) => {
        if (confirm(`Keluarkan ${emp.name} dari Divisi Automotive?`)) {
            router.post(
                route('admin.workshop.staff.assign'),
                {
                    user_id: emp.id,
                    action: 'remove',
                },
                { preserveScroll: true }
            );
        }
    };

    return (
        <AdminLayout activeMenu="workshop">
            <Head title="Konsol Divisi Automotive & Workshop - Admin" />

            <div className="space-y-6">
                {/* 1. TOP HEADER BAR */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                Divisi Automotive &amp; Workshop
                            </span>
                            <span className="text-xs text-slate-500">
                                Target SSRP: <strong>{settings.weekly_ssrp_quota}x / Minggu</strong>
                            </span>
                            <span className="text-xs text-slate-500">
                                • Bukti Duty: <strong>2x Upload (On-Duty &amp; Off-Duty)</strong>
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Manajemen Shift Kerja, Evaluasi Mingguan &amp; Poin SP Kumulatif
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
                            Atur jam shift kerja, tetapkan shift masing-masing mekanik, periksa kelengkapan laporan On/Off Duty dan SSRP per user pada minggu tertentu, serta tetapkan poin peringatan (SP) secara kumulatif.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                        <Link
                            href={route('staff.dashboard', { preview: 'automotive' })}
                            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[17px]">visibility</span>
                            <span>Preview Tampilan Pegawai</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsAssignStaffModalOpen(true)}
                            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">person_add</span>
                            <span>+ Assign Pegawai &amp; Shift</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">schedule</span>
                            <span>Atur Jam Shift &amp; Kuota</span>
                        </button>
                    </div>
                </div>

                {/* FLASH NOTIFICATIONS */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-rose-600 text-[20px]">error</span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* 2. KPI SUMMARY ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Total Mekanik
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {dailySummary.totalStaff || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Terdaftar di Automotive</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            Duty Lengkap (2/2)
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">
                            {dailySummary.completeTodayCount || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                            On &amp; Off ({filters.selectedDate})
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                            Baru On-Duty (1/2)
                        </div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                            {dailySummary.partialTodayCount || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Belum upload Off-Duty</div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                            Belum Upload / Alpha
                        </div>
                        <div className="text-2xl font-black text-rose-600 mt-1">
                            {dailySummary.alphaOrMissingTodayCount || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                            Izin Resmi: {dailySummary.leaveTodayCount || 0} orang
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 lg:col-span-1">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            SSRP Minggu Ini ({settings.weekly_ssrp_quota}x)
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {dailySummary.ssrpCompletedWeekCount || 0} / {dailySummary.totalStaff || 0}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Karyawan sudah lengkap</div>
                    </div>
                </div>

                {/* 3. NAVIGATION TABS */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('weekly_matrix')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            activeTab === 'weekly_matrix'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                        <span>1. Matriks Mingguan &amp; Assign Shift</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('user_inspect')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            activeTab === 'user_inspect'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">person_search</span>
                        <span>2. Inspeksi Per User &amp; Assign Poin SP</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            activeTab === 'daily'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">today</span>
                        <span>3. Pantauan Harian ({filters.selectedDate})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('leaves_warnings')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            activeTab === 'leaves_warnings'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        <span>4. Daftar Izin &amp; Riwayat SP ({allWarnings.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                            activeTab === 'settings'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span>5. Pengaturan Jam Shift &amp; Kuota SSRP</span>
                    </button>
                </div>

                {/* =====================================================================
                    TAB 1: MATRIKS MINGGUAN SEMUA KARYAWAN & PENUGASAN SHIFT
                   ===================================================================== */}
                {activeTab === 'weekly_matrix' && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                    Matriks Mingguan Seluruh Pegawai Workshop ({filters.weekLabel})
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Atur shift kerja tiap pegawai, pantau kelengkapan On/Off Duty (2/2), capaian SSRP mingguan, dan klik <strong>Periksa &amp; Beri SP</strong> untuk mengevaluasi per user.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.prevWeek)}
                                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                    <span>Minggu Lalu</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.today)}
                                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                                >
                                    Minggu Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.nextWeek)}
                                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Minggu Depan</span>
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                                        <th className="py-3.5 px-4 min-w-[210px]">Pegawai &amp; Shift Kerja</th>
                                        {weekDaysHeader.map((wd) => (
                                            <th key={wd.date} className="py-3.5 px-2 text-center min-w-[86px]">
                                                <div className="text-slate-900">{wd.dayName}</div>
                                                <div className="text-[10px] font-mono text-slate-400">{wd.shortDate}</div>
                                            </th>
                                        ))}
                                        <th className="py-3.5 px-3 text-center min-w-[125px]">
                                            SSRP ({settings.weekly_ssrp_quota}x)
                                        </th>
                                        <th className="py-3.5 px-3 text-center min-w-[115px]">
                                            SP Kumulatif
                                        </th>
                                        <th className="py-3.5 px-4 text-right min-w-[130px]">
                                            Evaluasi User
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {staffRows.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/70">
                                            {/* Employee Name & Shift Selector */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-slate-900">{emp.name}</div>
                                                <div className="text-[11px] text-slate-500 mb-1.5">{emp.position}</div>
                                                <select
                                                    value={emp.workshop_shift_id}
                                                    onChange={(e) =>
                                                        handleQuickChangeEmployeeShift(emp, e.target.value)
                                                    }
                                                    className="h-7 px-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800 focus:border-slate-900 focus:outline-none"
                                                >
                                                    {shiftsList.map((sh, i) => (
                                                        <option key={sh.id || i} value={sh.id || sh.name}>
                                                            {sh.name} ({sh.start_time}-{sh.end_time})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* 7 Day Cells */}
                                            {emp.calendarDays.map((day) => {
                                                const dLog = day.dutyLog;
                                                const imgs = [
                                                    dLog?.on_duty_image,
                                                    dLog?.off_duty_image,
                                                ].filter(Boolean);

                                                return (
                                                    <td key={day.date} className="py-3 px-1.5 text-center align-middle">
                                                        {day.status === 'duty_complete' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setGalleryModal({
                                                                        title: `${emp.name} — Duty Lengkap (${day.dayName}, ${day.shortDate})`,
                                                                        subtitle: `Foto 1: On-Duty (${dLog?.on_duty_at || '-'}) • Foto 2: Off-Duty (${dLog?.off_duty_at || '-'})`,
                                                                        images: imgs,
                                                                        activeIndex: 0,
                                                                    })
                                                                }
                                                                className="w-full py-1.5 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] cursor-pointer"
                                                            >
                                                                <div>2/2 LENGKAP</div>
                                                                <div className="text-[9px] font-normal text-emerald-700">
                                                                    On &amp; Off
                                                                </div>
                                                            </button>
                                                        ) : day.status === 'duty_partial' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setGalleryModal({
                                                                        title: `${emp.name} — Duty Parsial 1/2 (${day.dayName}, ${day.shortDate})`,
                                                                        subtitle: day.hasOnDuty
                                                                            ? 'Baru upload On-Duty (Belum Off-Duty)'
                                                                            : 'Baru upload Off-Duty',
                                                                        images: imgs,
                                                                        activeIndex: 0,
                                                                    })
                                                                }
                                                                className="w-full py-1.5 px-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px] cursor-pointer"
                                                            >
                                                                <div>1/2 PARSIAL</div>
                                                                <div className="text-[9px] font-normal">
                                                                    {day.hasOnDuty ? 'Hanya On' : 'Hanya Off'}
                                                                </div>
                                                            </button>
                                                        ) : day.status === 'leave' ? (
                                                            <div
                                                                title={day.leave?.reason || 'Izin Resmi'}
                                                                className="w-full py-1.5 px-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]"
                                                            >
                                                                <div>IZIN</div>
                                                                <div className="text-[9px] font-normal uppercase">
                                                                    {day.leave?.leave_type}
                                                                </div>
                                                            </div>
                                                        ) : day.status === 'alpha' ? (
                                                            <div className="w-full py-1.5 px-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                                                                <div>0/2 ALPHA</div>
                                                                <div className="text-[9px] font-normal">Kosong</div>
                                                            </div>
                                                        ) : day.status === 'pending_today' ? (
                                                            <div className="w-full py-1.5 px-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]">
                                                                <div>0/2 BELUM</div>
                                                                <div className="text-[9px] font-normal">Hari Ini</div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full py-2 px-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[10px]">
                                                                —
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {/* Weekly SSRP Cell */}
                                            <td className="py-3.5 px-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${
                                                        emp.weeklySsrp.isComplete
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                                    }`}
                                                >
                                                    {emp.weeklySsrp.submittedCount} / {emp.weeklySsrp.quota} SSRP
                                                </span>
                                            </td>

                                            {/* Cumulative SP Cell */}
                                            <td className="py-3.5 px-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                                                        emp.warnings.totalPoints > 0
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                                >
                                                    {emp.warnings.totalPoints} / {settings.max_warning_points} SP
                                                </span>
                                            </td>

                                            {/* Action: Inspect User */}
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleInspectUser(emp)}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
                                                >
                                                    Periksa &amp; Beri SP
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    TAB 2: INSPEKSI DETAIL PER USER (PER MINGGU) & ASSIGN POIN SP MANUAL
                   ===================================================================== */}
                {activeTab === 'user_inspect' && (
                    <div className="space-y-6">
                        {/* User & Week Filter Bar */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Pilih Karyawan Workshop
                                    </label>
                                    <select
                                        value={inspectedEmployee?.id || ''}
                                        onChange={(e) => {
                                            const idVal = Number(e.target.value);
                                            setSelectedEmployeeId(idVal);
                                            warningForm.setData('user_id', idVal);
                                        }}
                                        className="h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-900 min-w-[240px]"
                                    >
                                        {staffRows.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} — {emp.position} ({emp.warnings.totalPoints} SP)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {inspectedEmployee && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Jadwal Shift Karyawan Ini
                                        </label>
                                        <select
                                            value={inspectedEmployee.workshop_shift_id}
                                            onChange={(e) =>
                                                handleQuickChangeEmployeeShift(inspectedEmployee, e.target.value)
                                            }
                                            className="h-10 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900"
                                        >
                                            {shiftsList.map((sh, i) => (
                                                <option key={sh.id || i} value={sh.id || sh.name}>
                                                    {sh.name} ({sh.start_time} – {sh.end_time})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Week Switcher */}
                            <div className="flex items-center gap-2 self-start lg:self-end">
                                <span className="text-xs font-bold text-slate-600 mr-1">
                                    Minggu Evaluasi ({filters.weekLabel}):
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.prevWeek)}
                                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer"
                                >
                                    Minggu Lalu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.today)}
                                    className="h-9 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                                >
                                    Minggu Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleWeekFilterChange(filters.nextWeek)}
                                    className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer"
                                >
                                    Minggu Depan
                                </button>
                            </div>
                        </div>

                        {inspectedEmployee && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left 2 Columns: Weekly Duty (On & Off) + Weekly SSRP of Selected User */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 1. Kelengkapan Shift Duty (On-Duty & Off-Duty) Minggu Ini */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    Rekap Shift Duty (On &amp; Off) — {inspectedEmployee.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Periode: {filters.weekLabel} • Lengkap (2/2):{' '}
                                                    <strong>{inspectedEmployee.weeklyStats.dutyCount} hari</strong> • Parsial (1/2):{' '}
                                                    <strong>{inspectedEmployee.weeklyStats.partialDutyCount || 0} hari</strong> • Alpha:{' '}
                                                    <strong>{inspectedEmployee.weeklyStats.alphaCount} hari</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-100 text-xs">
                                            {inspectedEmployee.calendarDays.map((day) => {
                                                const log = day.dutyLog;
                                                return (
                                                    <div
                                                        key={day.date}
                                                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                    >
                                                        <div className="space-y-0.5">
                                                            <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                                                <span>
                                                                    {day.dayName}, {day.shortDate}
                                                                </span>
                                                                {log?.shift_label && (
                                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                                        {log.shift_label} ({log.shift_time})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {log?.caption && (
                                                                <p className="text-slate-500 text-[11px]">
                                                                    Catatan: "{log.caption}"
                                                                </p>
                                                            )}
                                                            {day.status === 'leave' && day.leave && (
                                                                <p className="text-sky-700 font-semibold text-[11px]">
                                                                    Izin [{day.leave.leave_type.toUpperCase()}]: "{day.leave.reason}"
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* On-Duty & Off-Duty Image Previews */}
                                                        <div className="flex items-center gap-2.5 shrink-0">
                                                            {/* On-Duty Box */}
                                                            {log?.on_duty_image ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setGalleryModal({
                                                                            title: `${inspectedEmployee.name} — Bukti ON-DUTY (${day.dayName}, ${day.shortDate})`,
                                                                            subtitle: `Diunggah: ${log.on_duty_at || '-'}`,
                                                                            images: [log.on_duty_image],
                                                                            activeIndex: 0,
                                                                        })
                                                                    }
                                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <span className="material-symbols-outlined text-[15px]">
                                                                        image
                                                                    </span>
                                                                    <span>On-Duty ✓</span>
                                                                </button>
                                                            ) : (
                                                                <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-bold text-[11px]">
                                                                    On-Duty: Kosong
                                                                </span>
                                                            )}

                                                            {/* Off-Duty Box */}
                                                            {log?.off_duty_image ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setGalleryModal({
                                                                            title: `${inspectedEmployee.name} — Bukti OFF-DUTY (${day.dayName}, ${day.shortDate})`,
                                                                            subtitle: `Diunggah: ${log.off_duty_at || '-'}`,
                                                                            images: [log.off_duty_image],
                                                                            activeIndex: 0,
                                                                        })
                                                                    }
                                                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <span className="material-symbols-outlined text-[15px]">
                                                                        image
                                                                    </span>
                                                                    <span>Off-Duty ✓</span>
                                                                </button>
                                                            ) : (
                                                                <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 font-bold text-[11px]">
                                                                    Off-Duty: Kosong
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Kelengkapan SSRP Mingguan User Ini */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    Laporan SSRP Mingguan — {inspectedEmployee.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Periode: {filters.weekLabel}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                                                    inspectedEmployee.weeklySsrp.isComplete
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}
                                            >
                                                {inspectedEmployee.weeklySsrp.submittedCount} /{' '}
                                                {inspectedEmployee.weeklySsrp.quota} SSRP
                                            </span>
                                        </div>

                                        {inspectedEmployee.weeklySsrp.logs.length === 0 ? (
                                            <p className="text-xs text-slate-500 py-4 text-center">
                                                Belum ada laporan SSRP yang diunggah oleh {inspectedEmployee.name} pada minggu ini.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {inspectedEmployee.weeklySsrp.logs.map((sLog, idx) => {
                                                    const imgs =
                                                        sLog.proof_images?.length > 0
                                                            ? sLog.proof_images
                                                            : [sLog.proof_image];
                                                    return (
                                                        <div
                                                            key={sLog.id}
                                                            className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50"
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    setGalleryModal({
                                                                        title: `${inspectedEmployee.name} — SSRP #${idx + 1}: ${sLog.title}`,
                                                                        subtitle: `${sLog.submission_date_label} (${imgs.length} Gambar)`,
                                                                        images: imgs,
                                                                        activeIndex: 0,
                                                                    })
                                                                }
                                                                className="relative aspect-video bg-slate-900 cursor-pointer group overflow-hidden"
                                                            >
                                                                <img
                                                                    src={imgs[0]}
                                                                    alt={sLog.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/85 text-white text-[10px] font-bold">
                                                                    Klik Lihat ({imgs.length} Foto)
                                                                </span>
                                                            </div>
                                                            <div className="p-3.5 space-y-1">
                                                                <div className="text-[10px] font-bold text-slate-500">
                                                                    SSRP #{idx + 1} • {sLog.submission_date_label}
                                                                </div>
                                                                <div className="text-xs font-extrabold text-slate-900">
                                                                    {sLog.title}
                                                                </div>
                                                                {sLog.description && (
                                                                    <p className="text-[11px] text-slate-600">
                                                                        {sLog.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Manual Cumulative Warning Point Assignment for This User */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                        <div className="border-b border-slate-100 pb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                                    Poin Pelanggaran Kumulatif
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold">
                                                    Total: {inspectedEmployee.warnings.totalPoints} /{' '}
                                                    {settings.max_warning_points} SP
                                                </span>
                                            </div>
                                            <h3 className="text-base font-extrabold text-slate-900 mt-1">
                                                Assign Poin Peringatan ke {inspectedEmployee.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Poin bersifat kumulatif untuk seluruh minggu dan ditetapkan langsung oleh Admin berdasarkan hasil evaluasi.
                                            </p>
                                        </div>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                router.post(
                                                    route('admin.workshop.warnings.store'),
                                                    {
                                                        ...warningForm.data,
                                                        user_id: inspectedEmployee.id,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                        onSuccess: () => warningForm.reset('reason'),
                                                    }
                                                );
                                            }}
                                            className="space-y-3.5 text-xs"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block font-bold text-slate-700 mb-1">
                                                        Kategori *
                                                    </label>
                                                    <select
                                                        value={warningForm.data.category}
                                                        onChange={(e) =>
                                                            warningForm.setData('category', e.target.value)
                                                        }
                                                        className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-slate-900"
                                                    >
                                                        <option value="alpha_duty">Duty Tidak Lengkap / Alpha</option>
                                                        <option value="missed_ssrp">Kurang Kuota SSRP</option>
                                                        <option value="manual_violation">Pelanggaran Disiplin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-slate-700 mb-1">
                                                        Tambahan Poin *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={10}
                                                        required
                                                        value={warningForm.data.points}
                                                        onChange={(e) =>
                                                            warningForm.setData('points', Number(e.target.value))
                                                        }
                                                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-slate-900 font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block font-bold text-slate-700 mb-1">
                                                    Keterangan Pelanggaran *
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    required
                                                    value={warningForm.data.reason}
                                                    onChange={(e) =>
                                                        warningForm.setData('reason', e.target.value)
                                                    }
                                                    placeholder={`Contoh: Laporan Shift Duty / SSRP pada periode ${filters.weekLabel} tidak lengkap...`}
                                                    className="w-full p-3 rounded-xl border border-slate-300 text-slate-900"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={warningForm.processing}
                                                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                                            >
                                                + Berikan Poin SP ke {inspectedEmployee.name}
                                            </button>
                                        </form>

                                        {/* Existing Cumulative Warnings of This User */}
                                        <div className="pt-3 border-t border-slate-100 space-y-2">
                                            <div className="text-xs font-bold text-slate-700">
                                                Riwayat SP Kumulatif ({inspectedEmployee.warnings.items.length})
                                            </div>
                                            {inspectedEmployee.warnings.items.length === 0 ? (
                                                <p className="text-xs text-slate-400">
                                                    Belum ada catatan poin peringatan untuk karyawan ini.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {inspectedEmployee.warnings.items.map((w) => (
                                                        <div
                                                            key={w.id}
                                                            className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs flex items-start justify-between gap-2"
                                                        >
                                                            <div>
                                                                <div className="font-bold text-rose-800">
                                                                    +{w.points} SP • {w.date_label}
                                                                </div>
                                                                <div className="text-slate-700 mt-0.5">
                                                                    {w.reason}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRevokeWarning(w.id)}
                                                                className="text-rose-600 hover:underline font-bold text-[11px] shrink-0 cursor-pointer"
                                                            >
                                                                Cabut
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =====================================================================
                    TAB 3: PANTAUAN HARIAN SEMUA PEGAWAI (ON-DUTY & OFF-DUTY)
                   ===================================================================== */}
                {activeTab === 'daily' && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                    Pantauan Harian On-Duty &amp; Off-Duty ({filters.selectedDateLabel})
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cek bukti gambar mulai shift (On-Duty) dan selesai shift (Off-Duty) seluruh mekanik pada tanggal terpilih.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filters.selectedDate}
                                    onChange={(e) => handleDateFilterChange(e.target.value)}
                                    className="h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs">
                            {staffRows.map((emp) => {
                                const dLog = emp.dailyDutyLog;
                                return (
                                    <div
                                        key={emp.id}
                                        className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    {emp.name}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                                                    {emp.position}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono font-bold">
                                                    Jadwal: {emp.assignedShift?.name} ({emp.assignedShift?.start_time}-
                                                    {emp.assignedShift?.end_time})
                                                </span>
                                            </div>
                                            {dLog?.caption && (
                                                <p className="text-slate-600">Catatan: "{dLog.caption}"</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {dLog?.on_duty_image ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setGalleryModal({
                                                            title: `${emp.name} — Bukti ON-DUTY (${filters.selectedDate})`,
                                                            subtitle: `Jam Upload: ${dLog.on_duty_at || '-'}`,
                                                            images: [dLog.on_duty_image],
                                                            activeIndex: 0,
                                                        })
                                                    }
                                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                                                >
                                                    Lihat On-Duty ✓
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 font-bold">
                                                    On-Duty: Belum
                                                </span>
                                            )}

                                            {dLog?.off_duty_image ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setGalleryModal({
                                                            title: `${emp.name} — Bukti OFF-DUTY (${filters.selectedDate})`,
                                                            subtitle: `Jam Upload: ${dLog.off_duty_at || '-'}`,
                                                            images: [dLog.off_duty_image],
                                                            activeIndex: 0,
                                                        })
                                                    }
                                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                                                >
                                                    Lihat Off-Duty ✓
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 font-bold">
                                                    Off-Duty: Belum
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleInspectUser(emp)}
                                                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                                            >
                                                Evaluasi / Beri SP
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFromWorkshop(emp)}
                                                title="Keluarkan dari Divisi Automotive"
                                                className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    person_remove
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    TAB 4: DAFTAR IZIN & RIWAYAT SP KUMULATIF
                   ===================================================================== */}
                {activeTab === 'leaves_warnings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pengajuan Izin */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                Daftar Pengajuan Izin / Absen Karyawan
                            </h3>
                            {allLeaves.length === 0 ? (
                                <p className="text-xs text-slate-500">Belum ada pengajuan izin.</p>
                            ) : (
                                <div className="divide-y divide-slate-100 text-xs">
                                    {allLeaves.map((lv) => (
                                        <div
                                            key={lv.id}
                                            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-900">
                                                    {lv.user_name} —{' '}
                                                    <span className="uppercase text-sky-700">[{lv.leave_type}]</span>{' '}
                                                    {lv.date_range_label}
                                                </div>
                                                <p className="text-slate-600">{lv.reason}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {lv.proof_image && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setGalleryModal({
                                                                title: `Lampiran Izin — ${lv.user_name}`,
                                                                subtitle: lv.date_range_label,
                                                                images: [lv.proof_image],
                                                                activeIndex: 0,
                                                            })
                                                        }
                                                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold cursor-pointer"
                                                    >
                                                        Bukti
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleLeaveStatusChange(lv.id, 'approved')}
                                                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                                                        lv.status === 'approved'
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleLeaveStatusChange(lv.id, 'rejected')}
                                                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                                                        lv.status === 'rejected'
                                                            ? 'bg-rose-600 text-white'
                                                            : 'bg-rose-50 text-rose-700'
                                                    }`}
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Riwayat SP Kumulatif */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                Seluruh Riwayat Poin Peringatan Kumulatif (SP)
                            </h3>
                            {allWarnings.length === 0 ? (
                                <p className="text-xs text-slate-500">
                                    Belum ada poin peringatan yang diberikan oleh Admin.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100 text-xs">
                                    {allWarnings.map((w) => (
                                        <div
                                            key={w.id}
                                            className="py-3.5 flex items-start justify-between gap-3"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-slate-900">
                                                    {w.user_name}{' '}
                                                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold ml-1">
                                                        +{w.points} SP
                                                    </span>
                                                </div>
                                                <div className="text-slate-600">{w.reason}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {w.reference_date_label} • Oleh: {w.issuer_name}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRevokeWarning(w.id)}
                                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] shrink-0 cursor-pointer"
                                            >
                                                Hapus SP
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* =====================================================================
                    TAB 5: PENGATURAN JAM SHIFT KERJA & TARGET SSRP MINGGUAN
                   ===================================================================== */}
                {activeTab === 'settings' && (
                    <form
                        onSubmit={submitSettings}
                        className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">
                                    Pengaturan Jam Shift Kerja &amp; Target SSRP Mingguan
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Buat dan atur jam shift kerja bengkel, target wajib SSRP mingguan, serta batas maksimal poin peringatan kumulatif.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                            >
                                {settingsForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Target Wajib SSRP per Minggu *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={21}
                                    required
                                    value={settingsForm.data.weekly_ssrp_quota}
                                    onChange={(e) =>
                                        settingsForm.setData('weekly_ssrp_quota', Number(e.target.value))
                                    }
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Minimal Hari Duty per Minggu *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={7}
                                    required
                                    value={settingsForm.data.min_weekly_duty_days}
                                    onChange={(e) =>
                                        settingsForm.setData('min_weekly_duty_days', Number(e.target.value))
                                    }
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Batas Maksimal SP Kumulatif *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    required
                                    value={settingsForm.data.max_warning_points}
                                    onChange={(e) =>
                                        settingsForm.setData('max_warning_points', Number(e.target.value))
                                    }
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Daftar Jam Shift Kerja Builder */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Daftar Jam Shift Kerja (Bisa Diatur &amp; Ditambahkan)
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Jadwal shift di bawah ini dapat langsung di-assign ke masing-masing mekanik.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddShift}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                                >
                                    + Buat Jam Shift Baru
                                </button>
                            </div>

                            <div className="space-y-3">
                                {settingsForm.data.shifts.map((sh, index) => (
                                    <div
                                        key={sh.id || index}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
                                    >
                                        <div className="sm:col-span-3">
                                            <label className="block font-bold text-slate-700 mb-1">Nama Shift</label>
                                            <input
                                                type="text"
                                                required
                                                value={sh.name}
                                                onChange={(e) =>
                                                    handleUpdateShiftField(index, 'name', e.target.value)
                                                }
                                                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-bold"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                                            <input
                                                type="time"
                                                required
                                                value={sh.start_time}
                                                onChange={(e) =>
                                                    handleUpdateShiftField(index, 'start_time', e.target.value)
                                                }
                                                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block font-bold text-slate-700 mb-1">Jam Selesai</label>
                                            <input
                                                type="time"
                                                required
                                                value={sh.end_time}
                                                onChange={(e) =>
                                                    handleUpdateShiftField(index, 'end_time', e.target.value)
                                                }
                                                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono"
                                            />
                                        </div>
                                        <div className="sm:col-span-4">
                                            <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                                            <input
                                                type="text"
                                                value={sh.description || ''}
                                                onChange={(e) =>
                                                    handleUpdateShiftField(index, 'description', e.target.value)
                                                }
                                                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white"
                                            />
                                        </div>
                                        <div className="sm:col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveShift(index)}
                                                className="h-9 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* MODAL: ASSIGN PEGAWAI & SHIFT KERJA */}
            {isAssignStaffModalOpen && (
                <div
                    onClick={() => setIsAssignStaffModalOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-slate-900">
                                Assign Pegawai &amp; Jam Shift Workshop
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAssignStaffModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submitAssignStaff} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Pilih Akun Pengguna *</label>
                                <select
                                    required
                                    value={assignForm.data.user_id}
                                    onChange={(e) => assignForm.setData('user_id', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                                >
                                    {availableUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email}){' '}
                                            {u.is_workshop_member ? '— [Sudah di Workshop]' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Pilih Shift Kerja Penugasan *
                                </label>
                                <select
                                    required
                                    value={assignForm.data.workshop_shift_id}
                                    onChange={(e) => assignForm.setData('workshop_shift_id', e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 font-bold"
                                >
                                    {shiftsList.map((sh, i) => (
                                        <option key={sh.id || i} value={sh.id || sh.name}>
                                            {sh.name} ({sh.start_time} – {sh.end_time})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Jabatan di Workshop *</label>
                                <input
                                    type="text"
                                    required
                                    value={assignForm.data.position}
                                    onChange={(e) => assignForm.setData('position', e.target.value)}
                                    placeholder="Contoh: Senior Mechanic 2000 HP"
                                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignStaffModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignForm.processing}
                                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                                >
                                    Simpan Penugasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MULTI-IMAGE LIGHTBOX GALLERY MODAL */}
            {galleryModal && (
                <div
                    onClick={() => setGalleryModal(null)}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-4xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                    >
                        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-extrabold text-slate-900">{galleryModal.title}</h4>
                                {galleryModal.subtitle && (
                                    <p className="text-[11px] text-slate-500">{galleryModal.subtitle}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setGalleryModal(null)}
                                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="bg-slate-950 flex items-center justify-center relative max-h-[68vh] min-h-[280px]">
                            <img
                                src={galleryModal.images[galleryModal.activeIndex || 0]}
                                alt={galleryModal.title}
                                className="max-h-[68vh] w-auto object-contain"
                            />

                            {galleryModal.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGalleryModal((prev) => ({
                                                ...prev,
                                                activeIndex:
                                                    (prev.activeIndex - 1 + prev.images.length) %
                                                    prev.images.length,
                                            }))
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGalleryModal((prev) => ({
                                                ...prev,
                                                activeIndex: (prev.activeIndex + 1) % prev.images.length,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {galleryModal.images.length > 1 && (
                            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2 overflow-x-auto">
                                {galleryModal.images.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                            setGalleryModal((prev) => ({ ...prev, activeIndex: idx }))
                                        }
                                        className={`w-16 h-10 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                                            galleryModal.activeIndex === idx
                                                ? 'border-slate-900'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
