import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function AutomotiveDashboard({ user, division, workshopData }) {
    const { flash } = usePage().props;

    const settings = workshopData?.settings || {
        workshop_name: 'Maitri Automotive & Workshop HQ',
        shifts: [
            { id: 'shift_pagi', name: 'Shift Pagi', start_time: '08:00', end_time: '14:00', description: 'Operasional pagi' },
            { id: 'shift_sore', name: 'Shift Sore', start_time: '14:00', end_time: '20:00', description: 'Operasional sore' },
            { id: 'shift_malam', name: 'Shift Malam', start_time: '20:00', end_time: '02:00', description: 'Piket malam' },
        ],
        weekly_ssrp_quota: 3,
        min_weekly_duty_days: 6,
        duty_miss_penalty_points: 1,
        ssrp_miss_penalty_points: 1,
        max_warning_points: 3,
        sop_notice: '',
    };

    const shiftsList = settings.shifts?.length > 0 ? settings.shifts : [
        { id: 'shift_pagi', name: 'Shift Pagi', start_time: '08:00', end_time: '14:00' },
    ];

    const assignedShift = workshopData?.assignedShift || shiftsList[0];

    const weekInfo = workshopData?.weekInfo || {
        weekStart: '',
        weekEnd: '',
        weekLabel: 'Minggu Ini',
        prevWeek: '',
        nextWeek: '',
        isCurrentWeek: true,
        today: new Date().toISOString().slice(0, 10),
        todayLabel: 'Hari Ini',
    };

    const calendarDays = workshopData?.calendarDays || [];
    const weeklyStats = workshopData?.weeklyStats || {
        dutyCount: 0,
        partialDutyCount: 0,
        alphaCount: 0,
        leaveCount: 0,
    };
    const weeklySsrp = workshopData?.weeklySsrp || {
        quota: settings.weekly_ssrp_quota,
        submittedCount: 0,
        remainingCount: settings.weekly_ssrp_quota,
        isComplete: false,
        logs: [],
    };
    const leaves = workshopData?.leaves || [];
    const warnings = workshopData?.warnings || { totalPoints: 0, maxPoints: 3, items: [] };

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('overview'); // 'overview' | 'duty' | 'ssrp' | 'leave_sp'

    // Duty Upload Mode ('file' | 'url')
    const [onDutyInputMode, setOnDutyInputMode] = useState('file');
    const [offDutyInputMode, setOffDutyInputMode] = useState('file');

    // SSRP Multi-Image Upload State (1 to 6 images)
    const [ssrpInputMode, setSsrpInputMode] = useState('file');
    const [ssrpUrlInput, setSsrpUrlInput] = useState('');

    // Leave Upload Mode
    const [leaveInputMode, setLeaveInputMode] = useState('file');

    // Lightbox Gallery Modal ({ title, subtitle, images: [], activeIndex: 0 })
    const [galleryModal, setGalleryModal] = useState(null);

    // 1. Form Shift Duty Harian (On-Duty & Off-Duty) — TERKUNCI PADA HARI INI & SHIFT PENUGASAN ADMIN
    const todayDateStr = weekInfo.today || new Date().toISOString().slice(0, 10);
    const todayDayRecord = calendarDays.find((d) => d.isToday || d.date === todayDateStr);
    const existingDutyOnSelectedDate = workshopData?.todayDutyLog || todayDayRecord?.dutyLog || null;

    const dutyForm = useForm({
        duty_date: todayDateStr,
        shift_label: assignedShift?.name || shiftsList[0]?.name || 'Shift Pagi',
        shift_time: assignedShift
            ? `${assignedShift.start_time} - ${assignedShift.end_time}`
            : '08:00 - 14:00',
        caption: existingDutyOnSelectedDate?.caption || '',
        on_duty_file: null,
        on_duty_url: '',
        off_duty_file: null,
        off_duty_url: '',
    });

    // 2. Form Laporan SSRP Mingguan (1 - 6 gambar)
    const ssrpForm = useForm({
        submission_date: todayDateStr,
        title: '',
        description: '',
        proof_files: [],
        proof_urls: [],
    });

    // 3. Form Pengajuan Izin / Absen
    const leaveForm = useForm({
        start_date: todayDateStr,
        end_date: todayDateStr,
        leave_type: 'izin',
        reason: '',
        proof_file: null,
        proof_url: '',
    });

    const handleWeekChange = (targetWeekStart) => {
        if (!targetWeekStart) return;
        const params = user?.role === 'admin'
            ? { preview: 'automotive', week: targetWeekStart }
            : { week: targetWeekStart };

        router.get(route('staff.dashboard'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openTodayDutyForm = () => {
        dutyForm.setData((prev) => ({
            ...prev,
            duty_date: todayDateStr,
            shift_label: assignedShift?.name || prev.shift_label,
            shift_time: assignedShift
                ? `${assignedShift.start_time} - ${assignedShift.end_time}`
                : prev.shift_time,
            caption: existingDutyOnSelectedDate?.caption || prev.caption || '',
            on_duty_file: null,
            on_duty_url: '',
            off_duty_file: null,
            off_duty_url: '',
        }));
        setActiveMenu('duty');
    };

    const submitDutyForm = (e) => {
        e.preventDefault();
        dutyForm.post(route('staff.workshop.duty.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                dutyForm.setData((prev) => ({
                    ...prev,
                    on_duty_file: null,
                    on_duty_url: '',
                    off_duty_file: null,
                    off_duty_url: '',
                }));
            },
        });
    };

    const handleDeleteDuty = (dutyId) => {
        if (confirm('Hapus laporan Shift Duty pada tanggal ini?')) {
            router.delete(route('staff.workshop.duty.destroy', dutyId), {
                preserveScroll: true,
            });
        }
    };

    // Multi-file selection handler for SSRP (up to 6 images total)
    const handleAddSsrpFiles = (e) => {
        const pickedFiles = Array.from(e.target.files || []);
        if (pickedFiles.length === 0) return;

        const currentTotal = ssrpForm.data.proof_files.length + ssrpForm.data.proof_urls.length;
        const allowedCount = Math.max(0, 6 - currentTotal);

        if (allowedCount <= 0) {
            alert('Maksimal 6 gambar dalam sekali upload SSRP.');
            return;
        }

        const nextFiles = [...ssrpForm.data.proof_files, ...pickedFiles.slice(0, allowedCount)];
        ssrpForm.setData('proof_files', nextFiles);
        e.target.value = '';
    };

    const handleRemoveSsrpFile = (idx) => {
        ssrpForm.setData(
            'proof_files',
            ssrpForm.data.proof_files.filter((_, i) => i !== idx)
        );
    };

    const handleAddSsrpUrl = () => {
        const trimmed = ssrpUrlInput.trim();
        if (!trimmed) return;

        const currentTotal = ssrpForm.data.proof_files.length + ssrpForm.data.proof_urls.length;
        if (currentTotal >= 6) {
            alert('Maksimal 6 gambar dalam sekali upload SSRP.');
            return;
        }

        ssrpForm.setData('proof_urls', [...ssrpForm.data.proof_urls, trimmed]);
        setSsrpUrlInput('');
    };

    const handleRemoveSsrpUrl = (idx) => {
        ssrpForm.setData(
            'proof_urls',
            ssrpForm.data.proof_urls.filter((_, i) => i !== idx)
        );
    };

    const totalSelectedSsrpImages = ssrpForm.data.proof_files.length + ssrpForm.data.proof_urls.length;

    const submitSsrpForm = (e) => {
        e.preventDefault();
        if (totalSelectedSsrpImages < 1) {
            alert('Minimal pilih 1 gambar SSRP (maksimal 6 gambar).');
            return;
        }

        ssrpForm.post(route('staff.workshop.ssrp.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                ssrpForm.reset('title', 'description', 'proof_files', 'proof_urls');
                setSsrpUrlInput('');
            },
        });
    };

    const handleDeleteSsrp = (ssrpId) => {
        if (confirm('Hapus laporan SSRP ini?')) {
            router.delete(route('staff.workshop.ssrp.destroy', ssrpId), {
                preserveScroll: true,
            });
        }
    };

    const submitLeaveForm = (e) => {
        e.preventDefault();
        leaveForm.post(route('staff.workshop.leave.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                leaveForm.reset('reason', 'proof_file', 'proof_url');
            },
        });
    };

    const getDayBadgeMeta = (status) => {
        switch (status) {
            case 'duty_complete':
                return {
                    label: 'Lengkap (2/2)',
                    sublabel: 'On-Duty & Off-Duty',
                    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    card: 'border-emerald-200 bg-white',
                    dot: 'bg-emerald-500',
                };
            case 'duty_partial':
                return {
                    label: 'Parsial (1/2)',
                    sublabel: 'Belum Off-Duty',
                    pill: 'bg-amber-50 text-amber-800 border-amber-200',
                    card: 'border-amber-200 bg-amber-50/20',
                    dot: 'bg-amber-500',
                };
            case 'leave':
                return {
                    label: 'Izin Resmi',
                    sublabel: 'Bebas Alpha',
                    pill: 'bg-sky-50 text-sky-700 border-sky-200',
                    card: 'border-sky-200 bg-sky-50/20',
                    dot: 'bg-sky-500',
                };
            case 'alpha':
                return {
                    label: 'Alpha (0/2)',
                    sublabel: 'Tidak Ada Laporan',
                    pill: 'bg-rose-50 text-rose-700 border-rose-200',
                    card: 'border-rose-200 bg-rose-50/20',
                    dot: 'bg-rose-500',
                };
            case 'pending_today':
                return {
                    label: 'Hari Ini (0/2)',
                    sublabel: 'Wajib Upload Duty',
                    pill: 'bg-amber-50 text-amber-800 border-amber-300',
                    card: 'border-amber-300 bg-white',
                    dot: 'bg-amber-500',
                };
            default:
                return {
                    label: 'Terjadwal',
                    sublabel: 'Hari Mendatang',
                    pill: 'bg-slate-100 text-slate-600 border-slate-200',
                    card: 'border-slate-200/80 bg-slate-50/50',
                    dot: 'bg-slate-300',
                };
        }
    };

    const navSections = [
        {
            title: 'Operasional Workshop',
            items: [
                {
                    id: 'overview',
                    label: 'Kalender & Ringkasan Shift',
                    icon: 'calendar_month',
                    badge: `${weeklyStats.dutyCount}/7`,
                },
                {
                    id: 'duty',
                    label: 'Upload Shift Duty (On / Off)',
                    icon: 'schedule',
                    badge: '2x Upload',
                },
                {
                    id: 'ssrp',
                    label: 'Laporan SSRP Mingguan',
                    icon: 'photo_library',
                    badge: `${weeklySsrp.submittedCount}/${weeklySsrp.quota}`,
                },
                {
                    id: 'leave_sp',
                    label: 'Form Izin & Catatan SP',
                    icon: 'verified_user',
                    badge: warnings.totalPoints > 0 ? `${warnings.totalPoints} SP` : null,
                    badgeAlert: warnings.totalPoints > 0,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fb] text-slate-900 font-sans antialiased flex flex-col">
            <Head title={`Divisi Automotive - ${settings.workshop_name}`} />

            {/* MOBILE SIDEBAR BACKDROP */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            {/* LEFT SIDEBAR NAVIGATION */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Brand Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/maitricomplogo.png"
                                alt="Maitri Company"
                                className="h-8 w-auto object-contain"
                            />
                            <div>
                                <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                                    Maitri Automotive
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                                    Workshop Portal
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Assigned Shift Card in Sidebar */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Jadwal Shift Anda
                                </span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <div className="text-xs font-extrabold text-slate-900">
                                {assignedShift?.name || 'Shift Reguler'}
                            </div>
                            <div className="text-xs font-mono font-bold text-brand-600">
                                {assignedShift?.start_time} – {assignedShift?.end_time} WIB
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                        {navSections.map((sec, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {sec.title}
                                </div>
                                {sec.items.map((item) => {
                                    const active = activeMenu === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveMenu(item.id);
                                                setMobileSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                                                active
                                                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span
                                                    className={`material-symbols-outlined text-[19px] ${
                                                        active ? 'text-white' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {item.icon}
                                                </span>
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                                                        item.badgeAlert
                                                            ? 'bg-rose-600 text-white'
                                                            : active
                                                            ? 'bg-white/15 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Authenticated Employee Footer */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                    {user?.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                    {user?.position || 'Mekanik Workshop'}
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Keluar"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">menu</span>
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                                    {settings.workshop_name}
                                </h1>
                                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    Divisi Automotive
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                                Periode Kerja: {weekInfo.weekLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* Cumulative Warning Badge */}
                        <button
                            type="button"
                            onClick={() => setActiveMenu('leave_sp')}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                warnings.totalPoints > 0
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {warnings.totalPoints > 0 ? 'warning' : 'verified_user'}
                            </span>
                            <span>
                                Poin SP Kumulatif: {warnings.totalPoints}/{settings.max_warning_points}
                            </span>
                        </button>

                        {user?.role === 'admin' && (
                            <Link
                                href={route('admin.workshop.index')}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                <span className="hidden sm:inline">Konsol Admin</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Container */}
                <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-6">
                    {/* Flash Messages */}
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

                    {/* =====================================================================
                        TOP SUMMARY METRICS BAR (ALWAYS VISIBLE, CLEAN & RESPONSIVE)
                       ===================================================================== */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Shift Penugasan Anda
                            </div>
                            <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                                {assignedShift?.name}
                            </div>
                            <div className="text-xs font-mono font-bold text-brand-600 mt-0.5">
                                {assignedShift?.start_time} – {assignedShift?.end_time} WIB
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Duty Lengkap (On &amp; Off)
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                                {weeklyStats.dutyCount}{' '}
                                <span className="text-xs font-semibold text-slate-400">/ 7 Hari</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                {weeklyStats.partialDutyCount > 0
                                    ? `${weeklyStats.partialDutyCount} hari belum upload Off-Duty`
                                    : `Alpha: ${weeklyStats.alphaCount} hr • Izin: ${weeklyStats.leaveCount} hr`}
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Laporan SSRP Minggu Ini
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                                {weeklySsrp.submittedCount}{' '}
                                <span className="text-xs font-semibold text-slate-400">
                                    / {weeklySsrp.quota} Laporan
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                {weeklySsrp.isComplete
                                    ? 'Kuota mingguan sudah terpenuhi'
                                    : `Kurang ${weeklySsrp.remainingCount} laporan SSRP lagi`}
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Total Poin Pelanggaran (SP)
                            </div>
                            <div
                                className={`text-xl sm:text-2xl font-black mt-1 ${
                                    warnings.totalPoints > 0 ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                            >
                                {warnings.totalPoints}{' '}
                                <span className="text-xs font-semibold text-slate-400">
                                    / {settings.max_warning_points} Poin Kumulatif
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                                Ditetapkan oleh evaluasi Admin
                            </div>
                        </div>
                    </div>

                    {/* =====================================================================
                        VIEW 1: KALENDER MINGGUAN & RINGKASAN SHIFT (OVERVIEW)
                       ===================================================================== */}
                    {activeMenu === 'overview' && (
                        <div className="space-y-6">
                            {/* Weekly Calendar Card */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                            Kalender Kehadiran Shift Duty Mingguan
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Periode: <strong>{weekInfo.weekLabel}</strong> • Setiap hari wajib mengunggah 2 bukti gambar: <strong>On-Duty (Mulai Shift)</strong> dan <strong>Off-Duty (Selesai Shift)</strong>.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleWeekChange(weekInfo.prevWeek)}
                                            className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                            <span>Minggu Lalu</span>
                                        </button>
                                        {!weekInfo.isCurrentWeek && (
                                            <button
                                                type="button"
                                                onClick={() => handleWeekChange(weekInfo.today)}
                                                className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                                            >
                                                Minggu Ini
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleWeekChange(weekInfo.nextWeek)}
                                            className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Minggu Depan</span>
                                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 7-Day Responsive Grid */}
                                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5">
                                    {calendarDays.map((day) => {
                                        const meta = getDayBadgeMeta(day.status);
                                        const log = day.dutyLog;

                                        return (
                                            <div
                                                key={day.date}
                                                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${meta.card} ${
                                                    day.isToday ? 'ring-2 ring-slate-900' : ''
                                                }`}
                                            >
                                                <div className="space-y-3">
                                                    {/* Day Header */}
                                                    <div className="flex items-start justify-between gap-1">
                                                        <div>
                                                            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                                                <span>{day.dayName}</span>
                                                                {day.isToday && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold uppercase">
                                                                        Hari Ini
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-slate-500">
                                                                {day.shortDate}
                                                            </div>
                                                        </div>
                                                        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${meta.dot}`}></span>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div>
                                                        <span className={`inline-block w-full text-center px-2 py-1 rounded-lg text-[10px] font-extrabold border ${meta.pill}`}>
                                                            {meta.label}
                                                        </span>
                                                    </div>

                                                    {/* On-Duty & Off-Duty Status Slots */}
                                                    {day.status === 'leave' && day.leave ? (
                                                        <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-sky-900 space-y-1">
                                                            <div className="font-bold uppercase text-[10px] text-sky-700">
                                                                {day.leave.leave_type}
                                                            </div>
                                                            <p className="text-[10px] text-slate-600 line-clamp-3">
                                                                {day.leave.reason}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1.5 text-[11px]">
                                                            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                                                <span className="font-semibold text-slate-600">On-Duty</span>
                                                                {day.hasOnDuty ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setGalleryModal({
                                                                                title: `Bukti On-Duty — ${day.dayName}, ${day.shortDate}`,
                                                                                subtitle: `${log?.shift_label || ''} (${log?.shift_time || ''})`,
                                                                                images: [log.on_duty_image],
                                                                                activeIndex: 0,
                                                                            })
                                                                        }
                                                                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                                                    >
                                                                        Lihat SS
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-400">
                                                                        Belum
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                                                <span className="font-semibold text-slate-600">Off-Duty</span>
                                                                {day.hasOffDuty ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setGalleryModal({
                                                                                title: `Bukti Off-Duty — ${day.dayName}, ${day.shortDate}`,
                                                                                subtitle: `${log?.shift_label || ''} (${log?.shift_time || ''})`,
                                                                                images: [log.off_duty_image],
                                                                                activeIndex: 0,
                                                                            })
                                                                        }
                                                                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                                                    >
                                                                        Lihat SS
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-400">
                                                                        Belum
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button (Only active for TODAY; past days are locked/Alpha) */}
                                                <div className="mt-3 pt-2.5 border-t border-slate-100">
                                                    {day.isToday ? (
                                                        <button
                                                            type="button"
                                                            onClick={openTodayDutyForm}
                                                            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                                        >
                                                            {day.hasOnDuty && day.hasOffDuty
                                                                ? 'Perbarui Hari Ini'
                                                                : day.hasOnDuty
                                                                ? 'Upload Off-Duty'
                                                                : 'Upload Duty Hari Ini'}
                                                        </button>
                                                    ) : day.isPast ? (
                                                        <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold text-center flex items-center justify-center gap-1 select-none">
                                                            <span className="material-symbols-outlined text-[13px]">lock</span>
                                                            <span>
                                                                {day.status === 'alpha'
                                                                    ? 'Terkunci (Alpha)'
                                                                    : 'Arsip Terkunci'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold text-center flex items-center justify-center gap-1 select-none">
                                                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                                                            <span>Belum Dibuka</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom Quick Overview Row: All Shifts & SOP */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-extrabold text-slate-900">
                                            Daftar Jam Shift Operasional Workshop
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Ditetapkan Manajemen
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {shiftsList.map((sh, i) => {
                                            const isMine = assignedShift?.id === sh.id || assignedShift?.name === sh.name;
                                            return (
                                                <div
                                                    key={sh.id || i}
                                                    className={`p-4 rounded-xl border ${
                                                        isMine
                                                            ? 'border-slate-900 bg-slate-50'
                                                            : 'border-slate-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-extrabold text-slate-900">
                                                            {sh.name}
                                                        </span>
                                                        {isMine && (
                                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white uppercase">
                                                                Shift Anda
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-mono font-bold text-brand-600 mt-1">
                                                        {sh.start_time} – {sh.end_time}
                                                    </div>
                                                    {sh.description && (
                                                        <p className="text-[11px] text-slate-500 mt-1">
                                                            {sh.description}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Ketentuan Pelaporan &amp; Evaluasi
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {settings.sop_notice ||
                                            'Setiap mekanik wajib mengunggah bukti foto saat mulai bertugas (On-Duty) dan selesai bertugas (Off-Duty), serta memenuhi kuota laporan SSRP mingguan.'}
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu('duty')}
                                            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                                        >
                                            Buka Form Shift Duty
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveMenu('ssrp')}
                                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                                        >
                                            Upload SSRP (1–6 Foto)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================================================
                        VIEW 2: UPLOAD BUKTI SHIFT DUTY (ON-DUTY & OFF-DUTY)
                       ===================================================================== */}
                    {activeMenu === 'duty' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                                            Formulir Bukti Shift Duty Harian (On-Duty &amp; Off-Duty)
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Unggah bukti gambar saat mulai shift (On-Duty) dan saat selesai shift (Off-Duty). Anda dapat mengunggah On-Duty terlebih dahulu, lalu melengkapi Off-Duty setelah jam kerja berakhir.
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold shrink-0 self-start sm:self-center">
                                        2 Bukti / Hari
                                    </span>
                                </div>

                                <form onSubmit={submitDutyForm} className="space-y-5 text-xs">
                                    {/* Locked Date & Locked Shift Info Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Tanggal Shift Duty (Terkunci Hari Ini)
                                                </div>
                                                <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                                                    {weekInfo.todayLabel}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    Hari lewat tanpa upload otomatis berstatus Alpha &amp; tidak dapat diedit
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                                <span className="material-symbols-outlined text-[13px]">lock</span>
                                                <span>Hari Ini</span>
                                            </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Jadwal Shift Kerja (Paten dari Admin)
                                                </div>
                                                <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                                                    {assignedShift?.name || 'Shift Pagi'}
                                                </div>
                                                <div className="text-xs font-mono font-bold text-brand-600 mt-0.5">
                                                    {assignedShift?.start_time} – {assignedShift?.end_time} WIB
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                                                <span className="material-symbols-outlined text-[13px]">lock</span>
                                                <span>Paten</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2-Column Upload Boxes: 1. ON-DUTY and 2. OFF-DUTY */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* BOX 1: BUKTI ON-DUTY (MULAI SHIFT) */}
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Tahap 1
                                                    </span>
                                                    <h3 className="text-xs font-extrabold text-slate-900">
                                                        Bukti Gambar ON-DUTY (Mulai Shift)
                                                    </h3>
                                                </div>
                                                {existingDutyOnSelectedDate?.on_duty_image ? (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                        Sudah Ada
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                        Belum Ada
                                                    </span>
                                                )}
                                            </div>

                                            {existingDutyOnSelectedDate?.on_duty_image && (
                                                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                                                    <img
                                                        src={existingDutyOnSelectedDate.on_duty_image}
                                                        alt="On-Duty"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                                                        Tersimpan ({existingDutyOnSelectedDate.on_duty_at || 'On-Duty'})
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setOnDutyInputMode('file')}
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                                        onDutyInputMode === 'file'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Upload File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOnDutyInputMode('url')}
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                                        onDutyInputMode === 'url'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Link URL
                                                </button>
                                            </div>

                                            {onDutyInputMode === 'file' ? (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        dutyForm.setData('on_duty_file', e.target.files[0] || null)
                                                    }
                                                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-white p-2 rounded-xl border border-slate-200"
                                                />
                                            ) : (
                                                <input
                                                    type="url"
                                                    value={dutyForm.data.on_duty_url}
                                                    onChange={(e) => dutyForm.setData('on_duty_url', e.target.value)}
                                                    placeholder="Tempel URL gambar On-Duty..."
                                                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-slate-900"
                                                />
                                            )}
                                        </div>

                                        {/* BOX 2: BUKTI OFF-DUTY (SELESAI SHIFT) */}
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                        Tahap 2
                                                    </span>
                                                    <h3 className="text-xs font-extrabold text-slate-900">
                                                        Bukti Gambar OFF-DUTY (Selesai Shift)
                                                    </h3>
                                                </div>
                                                {existingDutyOnSelectedDate?.off_duty_image ? (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                        Sudah Ada
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                        Belum Ada
                                                    </span>
                                                )}
                                            </div>

                                            {existingDutyOnSelectedDate?.off_duty_image && (
                                                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                                                    <img
                                                        src={existingDutyOnSelectedDate.off_duty_image}
                                                        alt="Off-Duty"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                                                        Tersimpan ({existingDutyOnSelectedDate.off_duty_at || 'Off-Duty'})
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setOffDutyInputMode('file')}
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                                        offDutyInputMode === 'file'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Upload File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOffDutyInputMode('url')}
                                                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                                        offDutyInputMode === 'url'
                                                            ? 'bg-slate-900 text-white'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Link URL
                                                </button>
                                            </div>

                                            {offDutyInputMode === 'file' ? (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        dutyForm.setData('off_duty_file', e.target.files[0] || null)
                                                    }
                                                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-white p-2 rounded-xl border border-slate-200"
                                                />
                                            ) : (
                                                <input
                                                    type="url"
                                                    value={dutyForm.data.off_duty_url}
                                                    onChange={(e) => dutyForm.setData('off_duty_url', e.target.value)}
                                                    placeholder="Tempel URL gambar Off-Duty..."
                                                    className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-slate-900"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Catatan Pekerjaan / Aktivitas Shift (Opsional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={dutyForm.data.caption}
                                            onChange={(e) => dutyForm.setData('caption', e.target.value)}
                                            placeholder="Ringkasan servis kendaraan, perbaikan bodi, atau kondisi operasional garasi selama shift..."
                                            className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3 pt-2">
                                        {existingDutyOnSelectedDate && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDuty(existingDutyOnSelectedDate.id)}
                                                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold cursor-pointer"
                                            >
                                                Reset / Hapus Log Tanggal Ini
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={dutyForm.processing}
                                            className="ml-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold transition-colors cursor-pointer"
                                        >
                                            {dutyForm.processing
                                                ? 'Menyimpan Bukti...'
                                                : 'Simpan Bukti Shift Duty'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Side Summary: Log Minggu Ini (Read-Only Status) */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Status Log Duty Minggu Ini
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Pengunggahan hanya berlaku untuk hari berjalan. Hari lewat tanpa laporan terkunci sebagai Alpha.
                                    </p>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                    {calendarDays.map((day) => {
                                        const meta = getDayBadgeMeta(day.status);
                                        return (
                                            <div
                                                key={day.date}
                                                className={`py-3 flex items-center justify-between gap-2 ${
                                                    day.isToday ? 'bg-slate-50 -mx-2 px-2 rounded-xl' : ''
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                        <span>
                                                            {day.dayName}, {day.shortDate}
                                                        </span>
                                                        {day.isToday && (
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold uppercase">
                                                                Hari Ini
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        On: {day.hasOnDuty ? 'Sudah' : 'Belum'} • Off:{' '}
                                                        {day.hasOffDuty ? 'Sudah' : 'Belum'}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border select-none ${meta.pill}`}
                                                >
                                                    {meta.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================================================
                        VIEW 3: LAPORAN SSRP MINGGUAN (1 S/D 6 GAMBAR SEKALI UPLOAD)
                       ===================================================================== */}
                    {activeMenu === 'ssrp' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Upload Multi-Gambar SSRP */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
                                <div className="border-b border-slate-100 pb-3">
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                                        1 – 6 Gambar per Laporan
                                    </span>
                                    <h2 className="text-base font-extrabold text-slate-900 mt-1.5">
                                        Upload Laporan SSRP Mingguan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Target wajib: <strong>{weeklySsrp.quota} laporan SSRP per minggu</strong>. Setiap kali upload dapat melampirkan minimal 1 gambar dan maksimal 6 gambar.
                                    </p>
                                </div>

                                <form onSubmit={submitSsrpForm} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Judul Skenario Roleplay *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={ssrpForm.data.title}
                                            onChange={(e) => ssrpForm.setData('title', e.target.value)}
                                            placeholder="Contoh: Overhaul Mesin & Kalibrasi Dyno 2000 HP"
                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                                        />
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Tanggal Laporan SSRP (Hari Ini)
                                            </div>
                                            <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                                                {weekInfo.todayLabel}
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                            <span className="material-symbols-outlined text-[13px]">lock</span>
                                            <span>Otomatis</span>
                                        </span>
                                    </div>

                                    {/* Multi-Image Selector (1 to 6 images) */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="font-bold text-slate-700">
                                                Lampiran Gambar SSRP ({totalSelectedSsrpImages}/6) *
                                            </label>
                                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setSsrpInputMode('file')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                        ssrpInputMode === 'file'
                                                            ? 'bg-white text-slate-900 shadow-2xs'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Pilih File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSsrpInputMode('url')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                        ssrpInputMode === 'url'
                                                            ? 'bg-white text-slate-900 shadow-2xs'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    Link URL
                                                </button>
                                            </div>
                                        </div>

                                        {ssrpInputMode === 'file' ? (
                                            <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-1.5">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    disabled={totalSelectedSsrpImages >= 6}
                                                    onChange={handleAddSsrpFiles}
                                                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer"
                                                />
                                                <p className="text-[11px] text-slate-500">
                                                    Bisa langsung blok/pilih beberapa gambar sekaligus (maksimal 6 gambar).
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="url"
                                                    value={ssrpUrlInput}
                                                    onChange={(e) => setSsrpUrlInput(e.target.value)}
                                                    placeholder="Tempel URL gambar lalu klik + Tambah..."
                                                    className="flex-1 h-9 px-3 rounded-xl border border-slate-300 text-slate-900"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddSsrpUrl}
                                                    disabled={totalSelectedSsrpImages >= 6}
                                                    className="h-9 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer shrink-0"
                                                >
                                                    + Tambah
                                                </button>
                                            </div>
                                        )}

                                        {/* Selected Images List (1 - 6 items) */}
                                        {totalSelectedSsrpImages > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {ssrpForm.data.proof_files.map((file, idx) => (
                                                    <div
                                                        key={`f_${idx}`}
                                                        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                                                    >
                                                        <span className="truncate font-medium text-slate-700">
                                                            #{idx + 1} File: {file.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSsrpFile(idx)}
                                                            className="text-rose-600 font-bold text-[11px] cursor-pointer shrink-0"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                                {ssrpForm.data.proof_urls.map((u, idx) => (
                                                    <div
                                                        key={`u_${idx}`}
                                                        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                                                    >
                                                        <span className="truncate font-mono text-[11px] text-slate-700">
                                                            #{ssrpForm.data.proof_files.length + idx + 1} URL: {u}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSsrpUrl(idx)}
                                                            className="text-rose-600 font-bold text-[11px] cursor-pointer shrink-0"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Deskripsi Singkat Roleplay
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={ssrpForm.data.description}
                                            onChange={(e) => ssrpForm.setData('description', e.target.value)}
                                            placeholder="Ringkasan aktivitas roleplay mekanik..."
                                            className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 focus:border-slate-900 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={ssrpForm.processing || totalSelectedSsrpImages < 1}
                                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold transition-colors cursor-pointer"
                                    >
                                        {ssrpForm.processing
                                            ? 'Mengunggah SSRP...'
                                            : `Kirim Laporan SSRP (${totalSelectedSsrpImages} Gambar)`}
                                    </button>
                                </form>
                            </div>

                            {/* Daftar & Galeri SSRP Minggu Ini */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900">
                                            Arsip Laporan SSRP Anda Minggu Ini
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Periode: {weekInfo.weekLabel} • Capaian:{' '}
                                            <strong>
                                                {weeklySsrp.submittedCount} dari {weeklySsrp.quota} Laporan
                                            </strong>
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-extrabold border self-start sm:self-center ${
                                            weeklySsrp.isComplete
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                    >
                                        {weeklySsrp.isComplete
                                            ? 'Target Terpenuhi'
                                            : `Kurang ${weeklySsrp.remainingCount} Laporan`}
                                    </span>
                                </div>

                                {weeklySsrp.logs.length === 0 ? (
                                    <div className="p-10 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                                        <span className="material-symbols-outlined text-[32px] text-slate-400">
                                            photo_library
                                        </span>
                                        <div className="text-sm font-bold text-slate-800">
                                            Belum Ada SSRP Diunggah Minggu Ini
                                        </div>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                                            Unggah minimal {weeklySsrp.quota} laporan SSRP (masing-masing 1–6 gambar) untuk memenuhi target mingguan Anda.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {weeklySsrp.logs.map((item, idx) => {
                                            const imgs = item.proof_images?.length > 0
                                                ? item.proof_images
                                                : [item.proof_image];

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div
                                                            onClick={() =>
                                                                setGalleryModal({
                                                                    title: `SSRP #${idx + 1}: ${item.title}`,
                                                                    subtitle: `${item.submission_date_label} • ${imgs.length} Gambar`,
                                                                    images: imgs,
                                                                    activeIndex: 0,
                                                                })
                                                            }
                                                            className="relative aspect-video bg-slate-900 cursor-pointer group overflow-hidden"
                                                        >
                                                            <img
                                                                src={imgs[0]}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                                                                SSRP #{idx + 1} • {item.submission_date_label}
                                                            </span>
                                                            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/85 text-white text-[10px] font-bold flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[13px]">
                                                                    collections
                                                                </span>
                                                                <span>{imgs.length} Gambar</span>
                                                            </span>
                                                        </div>

                                                        {/* Mini Thumbnails Strip if > 1 image */}
                                                        {imgs.length > 1 && (
                                                            <div className="px-3 pt-2.5 flex items-center gap-1.5 overflow-x-auto">
                                                                {imgs.map((imgUrl, gIdx) => (
                                                                    <button
                                                                        key={gIdx}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setGalleryModal({
                                                                                title: `SSRP #${idx + 1}: ${item.title}`,
                                                                                subtitle: `Gambar ${gIdx + 1} dari ${imgs.length}`,
                                                                                images: imgs,
                                                                                activeIndex: gIdx,
                                                                            })
                                                                        }
                                                                        className="w-12 h-8 rounded border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:border-slate-900"
                                                                    >
                                                                        <img
                                                                            src={imgUrl}
                                                                            alt=""
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="p-4 space-y-1">
                                                            <h4 className="text-sm font-extrabold text-slate-900">
                                                                {item.title}
                                                            </h4>
                                                            {item.description && (
                                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setGalleryModal({
                                                                    title: `SSRP #${idx + 1}: ${item.title}`,
                                                                    subtitle: `${imgs.length} Gambar Terlampir`,
                                                                    images: imgs,
                                                                    activeIndex: 0,
                                                                })
                                                            }
                                                            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                                                        >
                                                            Lihat Semua ({imgs.length} Foto)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSsrp(item.id)}
                                                            className="text-rose-600 hover:underline font-bold cursor-pointer"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =====================================================================
                        VIEW 4: FORM PENGAJUAN IZIN & CATATAN POIN PERINGATAN KUMULATIF
                       ===================================================================== */}
                    {activeMenu === 'leave_sp' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Pengajuan Izin / Sakit / Cuti */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                <div className="border-b border-slate-100 pb-3">
                                    <h2 className="text-base font-extrabold text-slate-900">
                                        Formulir Izin / Absen Kerja
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Ajukan permohonan izin apabila berhalangan mengikuti shift kerja.
                                    </p>
                                </div>

                                <form onSubmit={submitLeaveForm} className="space-y-3.5 text-xs">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Mulai Tanggal *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveForm.data.start_date}
                                                onChange={(e) => leaveForm.setData('start_date', e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Sampai Tanggal *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveForm.data.end_date}
                                                onChange={(e) => leaveForm.setData('end_date', e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Jenis Ketidakhadiran *
                                        </label>
                                        <select
                                            value={leaveForm.data.leave_type}
                                            onChange={(e) => leaveForm.setData('leave_type', e.target.value)}
                                            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                                        >
                                            <option value="izin">Izin Keperluan Mendesak</option>
                                            <option value="sakit">Izin Sakit / Medis</option>
                                            <option value="cuti_ooc">Cuti OOC</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Alasan Lengkap *
                                        </label>
                                        <textarea
                                            rows={3}
                                            required
                                            value={leaveForm.data.reason}
                                            onChange={(e) => leaveForm.setData('reason', e.target.value)}
                                            placeholder="Tuliskan keterangan izin secara jelas..."
                                            className="w-full p-3 rounded-xl border border-slate-300 text-slate-900"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="font-bold text-slate-700">
                                                Bukti Pendukung (Opsional)
                                            </label>
                                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setLeaveInputMode('file')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                        leaveInputMode === 'file'
                                                            ? 'bg-white text-slate-900 shadow-2xs'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLeaveInputMode('url')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                        leaveInputMode === 'url'
                                                            ? 'bg-white text-slate-900 shadow-2xs'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    URL
                                                </button>
                                            </div>
                                        </div>

                                        {leaveInputMode === 'file' ? (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    leaveForm.setData('proof_file', e.target.files[0] || null)
                                                }
                                                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white cursor-pointer bg-slate-50 p-2 rounded-xl border border-slate-200"
                                            />
                                        ) : (
                                            <input
                                                type="url"
                                                value={leaveForm.data.proof_url}
                                                onChange={(e) => leaveForm.setData('proof_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full h-9 px-3 rounded-xl border border-slate-300 text-slate-900"
                                            />
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={leaveForm.processing}
                                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                                    >
                                        {leaveForm.processing ? 'Mengirim...' : 'Kirim Pengajuan Izin'}
                                    </button>
                                </form>
                            </div>

                            {/* Catatan Poin Pelanggaran Kumulatif & Riwayat Izin */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900">
                                                Catatan Poin Peringatan Kumulatif (SP)
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Akumulasi seluruh poin pelanggaran yang diberikan oleh Administrator.
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                                                warnings.totalPoints > 0
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}
                                        >
                                            Total Kumulatif: {warnings.totalPoints} / {settings.max_warning_points} SP
                                        </span>
                                    </div>

                                    {warnings.items.length === 0 ? (
                                        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                                            <span className="material-symbols-outlined text-emerald-600 text-[22px]">
                                                verified
                                            </span>
                                            <div>
                                                <div className="font-bold">0 Poin Peringatan Aktif</div>
                                                <div className="text-[11px] text-emerald-700">
                                                    Anda tidak memiliki catatan poin pelanggaran dari manajemen.
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 text-xs">
                                            {warnings.items.map((w) => (
                                                <div
                                                    key={w.id}
                                                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                                                                +{w.points} Poin SP
                                                            </span>
                                                            <span className="text-[11px] font-mono text-slate-500">
                                                                {w.date_label}
                                                            </span>
                                                            <span className="text-[11px] text-slate-400">
                                                                • Oleh: {w.issuer_name}
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-900">{w.reason}</div>
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase self-start sm:self-center shrink-0">
                                                        {w.category === 'alpha_duty'
                                                            ? 'Alpha Shift Duty'
                                                            : w.category === 'missed_ssrp'
                                                            ? 'Kurang SSRP'
                                                            : 'Evaluasi Admin'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                    <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                                        Riwayat Pengajuan Izin Anda
                                    </h3>
                                    {leaves.length === 0 ? (
                                        <p className="text-xs text-slate-500">Belum ada riwayat pengajuan izin.</p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 text-xs">
                                            {leaves.map((lv) => (
                                                <div
                                                    key={lv.id}
                                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900">
                                                            <span className="uppercase text-sky-700 mr-2">
                                                                [{lv.leave_type}]
                                                            </span>
                                                            {lv.date_range_label}
                                                        </div>
                                                        <p className="text-slate-600 mt-0.5">{lv.reason}</p>
                                                    </div>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border self-start sm:self-center shrink-0 ${
                                                            lv.status === 'approved'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : lv.status === 'rejected'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                                        }`}
                                                    >
                                                        {lv.status === 'approved'
                                                            ? 'Disetujui'
                                                            : lv.status === 'rejected'
                                                            ? 'Ditolak'
                                                            : 'Pending'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

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
        </div>
    );
}
