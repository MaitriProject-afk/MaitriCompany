import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function EmployeeApplicationForm({ user, divisions = [], settings = null, myApplications = [] }) {
    const { flash } = usePage().props;

    const isOpen = settings ? settings.is_recruitment_open : true;
    const isOocEnabled = settings ? (settings.ooc_enabled && (settings.form_sections?.show_ooc ?? true)) : true;
    const formSections = settings?.form_sections || {
        show_identity: true,
        show_phone: true,
        show_id_card: true,
        show_age: true,
        show_domicile: true,
        show_licenses: true,
        show_experience: true,
        show_shift: true,
        show_motivation: true,
        show_ooc: true,
        show_sop: true,
    };

    const requiredFields = settings?.required_fields || ['sa_phone', 'sa_id_card', 'age', 'domicile', 'licenses', 'experience_level', 'shift', 'motivation'];

    // Dynamic Lists from Settings
    const availableLicenses = (Array.isArray(settings?.available_licenses) && settings.available_licenses.length > 0)
        ? settings.available_licenses.filter((l) => l.is_active !== false)
        : [
            { id: 'driving', label: 'Driving License (SIM Mengemudi Aktif)', icon: 'badge' },
            { id: 'trucker', label: 'Trucker / Heavy Vehicle License (Lisensi Truk Berat)', icon: 'local_shipping' },
            { id: 'clean_record', label: 'Catatan Bersih Bebas Kriminal Berat (Clean Record)', icon: 'verified_user' },
            { id: 'mechanic_cert', label: 'Sertifikasi Bengkel / Keahlian Otomotif', icon: 'handyman' },
        ];

    const domicileOptions = (Array.isArray(settings?.domicile_options) && settings.domicile_options.length > 0)
        ? settings.domicile_options
        : [
            'Verona Beach (Dekat Kantor HQ)',
            'Marina',
            'Commerce / Pusat Kota',
            'Idlewood',
            'Ganton',
            'Temple / Vinewood',
            'Red County / Desa Sekitar',
            'San Fierro',
            'Las Venturas',
            'Wilayah Lainnya',
        ];

    const experienceOptions = (Array.isArray(settings?.experience_options) && settings.experience_options.length > 0)
        ? settings.experience_options
        : [
            { id: 'pemula', label: 'Pemula / Baru Memulai Karier' },
            { id: '1_2_tahun', label: '1 s.d 2 Tahun (Terbiasa Rute Hauling/Operasional)' },
            { id: '3_tahun_lebih', label: '3+ Tahun (Sangat Berpengalaman / Senior)' },
        ];

    const shiftOptions = (Array.isArray(settings?.shift_options) && settings.shift_options.length > 0)
        ? settings.shift_options
        : [
            { id: 'fleksibel', label: 'Fleksibel (Kapan Saja Sesuai Jadwal)' },
            { id: 'pagi', label: 'Shift Pagi / Siang (08:00 - 16:00)' },
            { id: 'sore_malam', label: 'Shift Sore / Malam (16:00 - 24:00)' },
            { id: 'dini_hari', label: 'Shift Dini Hari / Kalong (00:00 - 08:00)' },
        ];

    const globalSopCommitments = (Array.isArray(settings?.sop_commitments) && settings.sop_commitments.length > 0)
        ? settings.sop_commitments
        : [
            { id: 'sop_care', text: 'Saya bersedia menjaga keutuhan unit armada (kondisi prima 2000 HP) dan mematuhi batas toleransi lecet saat bertugas.', required: true },
            { id: 'sop_no_failrp', text: 'Saya berjanji tidak akan meninggalkan kendaraan sembarangan, meledakkan, menceburkan, atau melarikan aset perusahaan (Fail RP / Pelanggaran Berat).', required: true },
            { id: 'sop_interview', text: 'Saya bersedia hadir di kantor Maitri HQ Verona Beach No 12 Los Santos jika dipanggil untuk sesi wawancara dan uji coba.', required: true },
        ];

    const oocQuestions = (settings && Array.isArray(settings.ooc_questions) && settings.ooc_questions.length > 0)
        ? settings.ooc_questions
        : [
            { id: 'discord_tag', question: 'Username & Tag Discord Aktif', placeholder: 'Contoh: alex_turner atau #1234', type: 'text', required: true },
            { id: 'real_age', question: 'Usia OOC Anda (Dunia Nyata)', placeholder: 'Contoh: 21 Tahun', type: 'number', required: false },
            { id: 'daily_hours', question: 'Rata-rata Jam Online di Server per Hari', placeholder: 'Contoh: 3-5 Jam', type: 'text', required: true },
            { id: 'rules_understanding', question: 'Jelaskan apa itu Fail RP dan komitmen Anda merawat armada perusahaan:', placeholder: 'Jelaskan pemahaman Anda tentang roleplay hauling...', type: 'textarea', required: true },
        ];

    const icCustomQuestions = Array.isArray(settings?.ic_custom_questions) ? settings.ic_custom_questions : [];

    const defaultDivisionId = divisions.length > 0 ? divisions[0].id : '';

    const { data, setData, post, processing, errors, reset } = useForm({
        recruitment_division_id: defaultDivisionId,
        full_name: user?.name || '',
        email: user?.email || '',
        sa_phone: '',
        sa_id_card: '',
        age: 25,
        domicile: domicileOptions[0] || 'Verona Beach',
        licenses: ['driving'],
        experience_level: experienceOptions[0]?.id || 'pemula',
        shift: shiftOptions[0]?.id || 'fleksibel',
        motivation: '',
        ic_answers: {},
        ooc_answers: {},
        sop_agreements: {},
    });

    useEffect(() => {
        if (divisions.length > 0 && !data.recruitment_division_id) {
            setData('recruitment_division_id', divisions[0].id);
        }
    }, [divisions]);

    const selectedDivision = divisions.find((d) => d.id === parseInt(data.recruitment_division_id)) || divisions[0];

    // Determine Active SOP Commitments: Prioritize Division's specific SOP if defined
    const hasDivisionSop = Array.isArray(selectedDivision?.sop_commitments) && selectedDivision.sop_commitments.length > 0;
    const activeSopCommitments = hasDivisionSop ? selectedDivision.sop_commitments : globalSopCommitments;

    // Initialize SOP agreements when division changes
    useEffect(() => {
        const initialSop = activeSopCommitments.reduce((acc, curr) => ({
            ...acc,
            [curr.id]: true,
        }), {});
        setData('sop_agreements', initialSop);
    }, [data.recruitment_division_id]);

    const handleLicenseToggle = (id) => {
        const current = [...data.licenses];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setData('licenses', current);
    };

    const handleIcAnswerChange = (qId, val) => {
        setData('ic_answers', {
            ...data.ic_answers,
            [qId]: val,
        });
    };

    const handleOocAnswerChange = (qId, val) => {
        setData('ooc_answers', {
            ...data.ooc_answers,
            [qId]: val,
        });
    };

    const handleSopToggle = (sopId) => {
        setData('sop_agreements', {
            ...data.sop_agreements,
            [sopId]: !data.sop_agreements[sopId],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check required SOP agreements for active commitments
        if (formSections.show_sop) {
            for (const sop of activeSopCommitments) {
                if (sop.required && !data.sop_agreements[sop.id]) {
                    alert(`Mohon setujui butir komitmen: "${sop.text.substring(0, 50)}..." sebelum mengirimkan formulir.`);
                    return;
                }
            }
        }

        post(route('warga.recruitment.apply'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('sa_phone', 'sa_id_card', 'motivation', 'ic_answers', 'ooc_answers');
            },
        });
    };

    // Render helper for dynamic field types (text, textarea, number, dropdown, checkbox)
    const renderFieldInput = (q, value, onChange) => {
        if (q.type === 'textarea') {
            return (
                <textarea
                    rows={2}
                    required={q.required}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={q.placeholder || 'Tuliskan jawaban Anda...'}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                ></textarea>
            );
        }

        if (q.type === 'number') {
            return (
                <input
                    type="number"
                    required={q.required}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={q.placeholder || 'Contoh: 10'}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
            );
        }

        if (q.type === 'dropdown') {
            const rawOptions = q.options ? q.options.split(',').map((o) => o.trim()).filter(Boolean) : [];
            return (
                <select
                    required={q.required}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                >
                    <option value="">-- Pilih {q.question} --</option>
                    {rawOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        if (q.type === 'checkbox') {
            return (
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">{q.placeholder || q.question}</span>
                </label>
            );
        }

        // Default 'text'
        return (
            <input
                type="text"
                required={q.required}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={q.placeholder || 'Tuliskan jawaban Anda...'}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
        );
    };

    return (
        <div className="space-y-6">
            {/* ALERT JIKA PENDAFTARAN SEDANG DITUTUP */}
            {!isOpen && (
                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-4">
                    <span className="material-symbols-outlined text-[32px] text-amber-600 shrink-0">lock</span>
                    <div>
                        <h3 className="font-extrabold text-base">Pendaftaran Karyawan Sedang Ditutup Sementara</h3>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            {settings?.instructions || 'Maitri Company saat ini belum membuka gelombang penerimaan baru. Silakan pantau pengumuman resmi atau hubungi petugas kami untuk informasi jadwal pembukaan berikutnya.'}
                        </p>
                        {settings?.contact_person && (
                            <p className="text-xs font-bold text-amber-900 mt-2">
                                Kontak Informasi: {settings.contact_person}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* FLASH SUCCESS NOTIFICATION */}
            {flash?.success && (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 flex items-start gap-3.5 shadow-sm">
                    <span className="material-symbols-outlined text-[28px] text-emerald-600 shrink-0">check_circle</span>
                    <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Formulir Pendaftaran Berhasil Dikirimkan!</h4>
                        <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                            {flash.success}
                        </p>
                    </div>
                </div>
            )}

            {/* RIWAYAT LAMARAN SAYA (JIKA ADA) */}
            {myApplications.length > 0 && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-600 text-[20px]">assignment</span>
                            <h3 className="text-sm font-extrabold text-slate-900">
                                Riwayat Berkas Lamaran Anda ({myApplications.length})
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">Pantauan Real-Time HRD</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {myApplications.map((app) => {
                            let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                            let statusText = 'Sedang Ditinjau';
                            if (app.status === 'interview') {
                                badgeStyle = 'bg-blue-50 text-brand-700 border-blue-200';
                                statusText = 'Tahap Wawancara HQ Verona';
                            } else if (app.status === 'accepted') {
                                badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                statusText = 'Diterima Lolos';
                            } else if (app.status === 'rejected') {
                                badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
                                statusText = 'Belum Memenuhi Syarat';
                            }

                            return (
                                <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono font-bold text-[11px] text-slate-700">
                                                #{app.ticket_number}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-xs text-slate-900 mt-1">
                                            {app.position_title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Diajukan: {new Date(app.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>

                                    {app.admin_notes && (
                                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 italic">
                                            <strong>Catatan HRD:</strong> "{app.admin_notes}"
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FORMULIR UTAMA */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80">
                {/* Form Header */}
                <div className="border-b border-slate-100 pb-5 mb-6">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            Maitri Recruitment Center
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Tahun Operasional 2026
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {settings?.contact_person || 'Maitri HQ Verona Beach No 12'}
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Formulir Pendaftaran &amp; Rekrutmen Karyawan
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {settings?.instructions || 'Lengkapi profil data karakter (IC), pilihan posisi, kualifikasi, dan seksi pertanyaan OOC untuk evaluasi Dewan Direksi.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* POIN 1: PILIHAN DIVISI & KUALIFIKASI SPESIFIK */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                1
                            </span>
                            <span>Pilih Divisi / Posisi Pekerjaan yang Dibuka</span>
                        </div>

                        {divisions.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                                <p className="text-xs">Saat ini belum ada divisi lowongan yang dibuka.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {divisions.map((div) => {
                                    const isSelected = parseInt(data.recruitment_division_id) === div.id;
                                    return (
                                        <div
                                            key={div.id}
                                            onClick={() => setData('recruitment_division_id', div.id)}
                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-brand-600 bg-blue-50/50 shadow-xs ring-2 ring-brand-500/20'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                                            <span className="material-symbols-outlined text-[18px]">{div.icon || 'work'}</span>
                                                        </span>
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                                                                {div.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-400 block font-medium">
                                                                {div.department}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {div.badge && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 bg-blue-50 text-brand-700 border-blue-200">
                                                            {div.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                                    {div.description}
                                                </p>

                                                {/* Kualifikasi spesifik divisi ini */}
                                                {Array.isArray(div.qualifications) && div.qualifications.length > 0 && (
                                                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                            Syarat Kualifikasi Posisi Ini:
                                                        </span>
                                                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                                                            {div.qualifications.map((q, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-emerald-600 font-bold">✓</span>
                                                                    <span>{q}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Lisensi yang Diutamakan Divisi Ini */}
                                                {Array.isArray(div.required_licenses) && div.required_licenses.length > 0 && (
                                                    <div className="mt-2 pt-1.5 flex flex-wrap gap-1">
                                                        {div.required_licenses.map((licId) => {
                                                            const licObj = availableLicenses.find((l) => l.id === licId);
                                                            return (
                                                                <span key={licId} className="px-2 py-0.5 bg-blue-100 text-brand-800 rounded font-bold text-[10px] flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[13px]">verified</span>
                                                                    <span>Wajib: {licObj?.label || licId}</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500 font-medium">
                                                    {div.quota ? `Kuota: ${div.quota} Orang` : 'Terbuka'}
                                                </span>
                                                <div className="flex items-center gap-1 font-bold text-brand-600">
                                                    {isSelected ? (
                                                        <span className="material-symbols-outlined text-[18px] text-brand-600">radio_button_checked</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[18px] text-slate-300">radio_button_unchecked</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* POIN 2: INFORMASI IDENTITAS KARAKTER (IC) */}
                    {(formSections.show_identity ?? true) && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                                <span className="w-6 h-6 rounded-lg bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                                    2
                                </span>
                                <span>Informasi Identitas &amp; Karakter Pelamar (In-Character / IC)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Nama Lengkap Karakter <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="Contoh: Alex Turner"
                                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                    />
                                    {errors.full_name && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.full_name}</span>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Alamat Email Terdaftar <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="alamat.email@contoh.com"
                                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50"
                                    />
                                </div>

                                {(formSections.show_phone ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Nomor Telepon San Andreas (No. HP In-Game) {requiredFields.includes('sa_phone') && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            required={requiredFields.includes('sa_phone')}
                                            value={data.sa_phone}
                                            onChange={(e) => setData('sa_phone', e.target.value)}
                                            placeholder="Contoh: 555-0192 atau 08123456"
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        />
                                        {errors.sa_phone && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.sa_phone}</span>}
                                    </div>
                                )}

                                {(formSections.show_id_card ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Nomor KTP / ID Card San Andreas {requiredFields.includes('sa_id_card') && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            required={requiredFields.includes('sa_id_card')}
                                            value={data.sa_id_card}
                                            onChange={(e) => setData('sa_id_card', e.target.value)}
                                            placeholder="Contoh: 91311 atau SA-10841840"
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        />
                                        {errors.sa_id_card && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.sa_id_card}</span>}
                                    </div>
                                )}

                                {(formSections.show_age ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Usia Karakter {requiredFields.includes('age') && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type="number"
                                            min="17"
                                            max="80"
                                            value={data.age}
                                            onChange={(e) => setData('age', parseInt(e.target.value) || 25)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        />
                                    </div>
                                )}

                                {(formSections.show_domicile ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Wilayah Domisili Tempat Tinggal {requiredFields.includes('domicile') && <span className="text-rose-500">*</span>}
                                        </label>
                                        <select
                                            value={data.domicile}
                                            onChange={(e) => setData('domicile', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        >
                                            {domicileOptions.map((opt, idx) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Pertanyaan IC Tambahan (Custom IC Questions) */}
                            {icCustomQuestions.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    <span className="text-xs font-bold text-slate-700 block">
                                        Pertanyaan Karakter Tambahan:
                                    </span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {icCustomQuestions.map((q) => (
                                            <div key={q.id} className={q.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                <label className="block font-bold text-slate-700 mb-1">
                                                    {q.question} {q.required && <span className="text-rose-500">*</span>}
                                                </label>
                                                {renderFieldInput(q, data.ic_answers[q.id], (val) => handleIcAnswerChange(q.id, val))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* POIN 3: KUALIFIKASI LISENSI & PENGALAMAN */}
                    {(formSections.show_licenses ?? true) && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                    3
                                </span>
                                <span>Kualifikasi Lisensi &amp; Jam Terbang</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Lisensi &amp; Berkas Resmi yang Dimiliki:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {availableLicenses.map((lic) => {
                                        const checked = data.licenses.includes(lic.id);
                                        const isRequiredForDivision = Array.isArray(selectedDivision?.required_licenses) && selectedDivision.required_licenses.includes(lic.id);
                                        return (
                                            <div
                                                key={lic.id}
                                                onClick={() => handleLicenseToggle(lic.id)}
                                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                                    checked
                                                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                } ${isRequiredForDivision ? 'ring-2 ring-emerald-500/30' : ''}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-[18px] ${checked ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {lic.icon || 'verified'}
                                                    </span>
                                                    <div>
                                                        <span className="text-xs block leading-tight">{lic.label}</span>
                                                        {isRequiredForDivision && (
                                                            <span className="text-[10px] font-bold text-emerald-700">★ Sangat Direkomendasikan</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`material-symbols-outlined text-[18px] ${checked ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                    {checked ? 'check_box' : 'check_box_outline_blank'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                                {(formSections.show_experience ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Pengalaman Kerja / Mengemudi di San Andreas
                                        </label>
                                        <select
                                            value={data.experience_level}
                                            onChange={(e) => setData('experience_level', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        >
                                            {experienceOptions.map((opt) => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(formSections.show_shift ?? true) && (
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1.5">
                                            Ketersediaan Waktu / Shift Kerja Utama
                                        </label>
                                        <select
                                            value={data.shift}
                                            onChange={(e) => setData('shift', e.target.value)}
                                            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                        >
                                            {shiftOptions.map((opt) => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {(formSections.show_motivation ?? true) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        {settings?.motivation_prompt || 'Mengapa Anda Tertarik Bergabung di Maitri Company?'} {requiredFields.includes('motivation') && <span className="text-rose-500">*</span>}
                                    </label>
                                    <textarea
                                        rows={3}
                                        required={requiredFields.includes('motivation')}
                                        value={data.motivation}
                                        onChange={(e) => setData('motivation', e.target.value)}
                                        placeholder="Ceritakan motivasi Anda dan keahlian yang ingin Anda kontribusikan..."
                                        className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                                    ></textarea>
                                    {errors.motivation && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.motivation}</span>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* POIN 4: FIELD KHUSUS DIVISI YANG DIPILIH (JIKA ADA) */}
                    {Array.isArray(selectedDivision?.custom_questions) && selectedDivision.custom_questions.length > 0 && (
                        <div className="space-y-4 p-5 rounded-2xl bg-blue-50/50 border border-brand-200">
                            <div className="flex items-center justify-between border-b border-brand-200 pb-2">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-900">
                                    <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                                        ★
                                    </span>
                                    <span>Poin Khusus Posisi: {selectedDivision.title}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-300">
                                    Kualifikasi Khusus {selectedDivision.department}
                                </span>
                            </div>

                            <p className="text-[11px] text-brand-800 leading-relaxed">
                                Divisi ini memiliki beberapa pertanyaan atau data khusus yang diatur oleh Admin departemen.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {selectedDivision.custom_questions.map((q) => (
                                    <div key={q.id} className={q.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            {q.question} {q.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        {renderFieldInput(q, data.ic_answers[q.id], (val) => handleIcAnswerChange(q.id, val))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* POIN 5: PERTANYAAN OOC (OUT OF CHARACTER) JIKA DIAKTIFKAN OLEH ADMIN */}
                    {isOocEnabled && (
                        <div className="space-y-4 p-5 rounded-2xl bg-purple-50/60 border border-purple-200">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-2">
                                <span className="w-6 h-6 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                                    4
                                </span>
                                <span>Seksi Pertanyaan OOC (Out of Character Pelamar)</span>
                            </div>

                            <p className="text-[11px] text-purple-800 leading-relaxed">
                                Bagian ini ditujukan untuk data komunikasi di luar karakter (OOC), seperti tag Discord, jam online server, dan pemahaman aturan roleplay.
                            </p>

                            <div className="space-y-3.5">
                                {oocQuestions.map((q) => (
                                    <div key={q.id}>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">
                                            {q.question} {q.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        {q.type === 'textarea' ? (
                                            <textarea
                                                rows={2}
                                                required={q.required}
                                                value={data.ooc_answers[q.id] || ''}
                                                onChange={(e) => handleOocAnswerChange(q.id, e.target.value)}
                                                placeholder={q.placeholder || 'Tuliskan jawaban Anda...'}
                                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            ></textarea>
                                        ) : (
                                            <input
                                                type={q.type || 'text'}
                                                required={q.required}
                                                value={data.ooc_answers[q.id] || ''}
                                                onChange={(e) => handleOocAnswerChange(q.id, e.target.value)}
                                                placeholder={q.placeholder || 'Tuliskan jawaban Anda...'}
                                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* POIN 6: PERNYATAAN KOMITMEN & KEPATUHAN SOP (PER DIVISI / GLOBAL) */}
                    {(formSections.show_sop ?? true) && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                            <div className="font-bold text-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-amber-600 text-[18px]">gavel</span>
                                    <span>
                                        {hasDivisionSop
                                            ? `Pernyataan Komitmen & Kepatuhan Khusus: ${selectedDivision?.title}`
                                            : 'Pernyataan Komitmen & Kepatuhan SOP Maitri Company:'}
                                    </span>
                                </div>
                                {hasDivisionSop ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        Aturan Khusus Divisi
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                        SOP Standar Perusahaan
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 pt-1">
                                {activeSopCommitments.map((sop) => {
                                    const checked = !!data.sop_agreements[sop.id];
                                    return (
                                        <label key={sop.id} className="flex items-start gap-2.5 text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleSopToggle(sop.id)}
                                                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                            />
                                            <span className="leading-relaxed">
                                                {sop.text} {sop.required && <span className="text-rose-500 font-bold">*</span>}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">
                            Berkas yang dikirim akan diverifikasi oleh Admin / Direksi Maitri Company.
                        </span>

                        <button
                            type="submit"
                            disabled={processing || !isOpen}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-extrabold tracking-wide transition-all shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>{processing ? 'Mengirimkan Berkas...' : 'Kirim Berkas Pendaftaran Karyawan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
