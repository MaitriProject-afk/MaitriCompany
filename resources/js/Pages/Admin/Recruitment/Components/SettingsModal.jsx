import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function SettingsModal({ isOpen, onClose, settings }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'ic_fields' | 'licenses' | 'ooc' | 'sop'
    const [newDomicile, setNewDomicile] = useState('');
    const [newExperience, setNewExperience] = useState('');
    const [newShift, setNewShift] = useState('');

    const { data, setData, post, processing } = useForm({
        is_recruitment_open: true,
        required_fields: ['sa_phone', 'sa_id_card', 'age', 'domicile', 'licenses', 'experience_level', 'shift', 'motivation'],
        form_sections: {
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
        },
        available_licenses: [],
        domicile_options: [],
        experience_options: [],
        shift_options: [],
        sop_commitments: [],
        ic_custom_questions: [],
        motivation_prompt: 'Ceritakan motivasi Anda dan keahlian yang ingin Anda kontribusikan untuk memajukan Maitri Company...',
        ooc_enabled: true,
        ooc_questions: [],
        instructions: '',
        contact_person: '',
    });

    useEffect(() => {
        if (settings) {
            setData({
                is_recruitment_open: settings.is_recruitment_open ?? true,
                required_fields: settings.required_fields || ['sa_phone', 'sa_id_card', 'age', 'domicile', 'licenses', 'experience_level', 'shift', 'motivation'],
                form_sections: settings.form_sections || {
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
                },
                available_licenses: Array.isArray(settings.available_licenses) ? settings.available_licenses : [
                    { id: 'driving', label: 'Driving License (SIM Mengemudi Aktif)', icon: 'badge', is_active: true },
                    { id: 'trucker', label: 'Trucker / Heavy Vehicle License (Lisensi Truk Berat)', icon: 'local_shipping', is_active: true },
                    { id: 'clean_record', label: 'Catatan Bersih Bebas Kriminal Berat (Clean Record)', icon: 'verified_user', is_active: true },
                    { id: 'mechanic_cert', label: 'Sertifikasi Bengkel / Keahlian Otomotif', icon: 'handyman', is_active: true },
                    { id: 'firearm_permit', label: 'Izin Senjata Sah (Firearm Permit)', icon: 'security', is_active: true },
                    { id: 'portfolio_design', label: 'Portofolio Desain / Arsitektur 3D', icon: 'draw', is_active: true },
                ],
                domicile_options: Array.isArray(settings.domicile_options) ? settings.domicile_options : [
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
                ],
                experience_options: Array.isArray(settings.experience_options) ? settings.experience_options : [
                    { id: 'pemula', label: 'Pemula / Baru Memulai Karier' },
                    { id: '1_2_tahun', label: '1 s.d 2 Tahun (Terbiasa Rute Hauling/Operasional)' },
                    { id: '3_tahun_lebih', label: '3+ Tahun (Sangat Berpengalaman / Senior)' },
                ],
                shift_options: Array.isArray(settings.shift_options) ? settings.shift_options : [
                    { id: 'fleksibel', label: 'Fleksibel (Kapan Saja Sesuai Jadwal)' },
                    { id: 'pagi', label: 'Shift Pagi / Siang (08:00 - 16:00)' },
                    { id: 'sore_malam', label: 'Shift Sore / Malam (16:00 - 24:00)' },
                    { id: 'dini_hari', label: 'Shift Dini Hari / Kalong (00:00 - 08:00)' },
                ],
                sop_commitments: Array.isArray(settings.sop_commitments) ? settings.sop_commitments : [
                    { id: 'sop_care', text: 'Saya bersedia menjaga keutuhan unit armada (kondisi prima 2000 HP) dan mematuhi batas toleransi lecet saat bertugas.', required: true },
                    { id: 'sop_no_failrp', text: 'Saya berjanji tidak akan meninggalkan kendaraan sembarangan, meledakkan, menceburkan, atau melarikan aset perusahaan (Fail RP / Pelanggaran Berat).', required: true },
                    { id: 'sop_interview', text: 'Saya bersedia hadir di kantor Maitri HQ Verona Beach No 12 Los Santos jika dipanggil untuk sesi wawancara dan uji coba.', required: true },
                ],
                ic_custom_questions: Array.isArray(settings.ic_custom_questions) ? settings.ic_custom_questions : [],
                motivation_prompt: settings.motivation_prompt || 'Ceritakan motivasi Anda dan keahlian yang ingin Anda kontribusikan untuk memajukan Maitri Company...',
                ooc_enabled: settings.ooc_enabled ?? true,
                ooc_questions: Array.isArray(settings.ooc_questions) ? settings.ooc_questions : [],
                instructions: settings.instructions || '',
                contact_person: settings.contact_person || '',
            });
        }
    }, [settings]);

    // Section & Required Fields Helpers
    const handleSectionToggle = (key) => {
        setData('form_sections', {
            ...data.form_sections,
            [key]: !data.form_sections[key],
        });
    };

    const handleFieldToggle = (fieldKey) => {
        const current = [...data.required_fields];
        const index = current.indexOf(fieldKey);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(fieldKey);
        }
        setData('required_fields', current);
    };

    // Domicile Helpers
    const handleAddDomicile = () => {
        if (!newDomicile.trim()) return;
        setData('domicile_options', [...data.domicile_options, newDomicile.trim()]);
        setNewDomicile('');
    };

    const handleRemoveDomicile = (index) => {
        setData('domicile_options', data.domicile_options.filter((_, i) => i !== index));
    };

    // Experience Helpers
    const handleAddExperience = () => {
        if (!newExperience.trim()) return;
        const newId = `exp_${Date.now()}`;
        setData('experience_options', [...data.experience_options, { id: newId, label: newExperience.trim() }]);
        setNewExperience('');
    };

    const handleRemoveExperience = (index) => {
        setData('experience_options', data.experience_options.filter((_, i) => i !== index));
    };

    // Shift Helpers
    const handleAddShift = () => {
        if (!newShift.trim()) return;
        const newId = `shift_${Date.now()}`;
        setData('shift_options', [...data.shift_options, { id: newId, label: newShift.trim() }]);
        setNewShift('');
    };

    const handleRemoveShift = (index) => {
        setData('shift_options', data.shift_options.filter((_, i) => i !== index));
    };

    // License Helpers
    const handleAddLicense = () => {
        const newLic = {
            id: `lic_${Date.now()}`,
            label: 'Lisensi Baru / Sertifikasi',
            icon: 'verified',
            is_active: true,
        };
        setData('available_licenses', [...data.available_licenses, newLic]);
    };

    const handleLicenseChange = (index, field, val) => {
        const updated = [...data.available_licenses];
        updated[index] = { ...updated[index], [field]: val };
        setData('available_licenses', updated);
    };

    const handleRemoveLicense = (index) => {
        setData('available_licenses', data.available_licenses.filter((_, i) => i !== index));
    };

    // IC Custom Questions
    const handleAddIcQuestion = () => {
        const newQ = {
            id: `ic_q_${Date.now()}`,
            question: '',
            placeholder: '',
            type: 'text',
            required: false,
        };
        setData('ic_custom_questions', [...data.ic_custom_questions, newQ]);
    };

    const handleIcQuestionChange = (index, field, val) => {
        const updated = [...data.ic_custom_questions];
        updated[index] = { ...updated[index], [field]: val };
        setData('ic_custom_questions', updated);
    };

    const handleRemoveIcQuestion = (index) => {
        setData('ic_custom_questions', data.ic_custom_questions.filter((_, i) => i !== index));
    };

    // OOC Questions Helpers
    const handleAddOocQuestion = () => {
        const newQuestion = {
            id: `q_${Date.now()}`,
            question: '',
            placeholder: '',
            type: 'text',
            required: true,
        };
        setData('ooc_questions', [...data.ooc_questions, newQuestion]);
    };

    const handleRemoveOocQuestion = (index) => {
        setData('ooc_questions', data.ooc_questions.filter((_, i) => i !== index));
    };

    const handleOocQuestionChange = (index, field, val) => {
        const updated = [...data.ooc_questions];
        updated[index] = { ...updated[index], [field]: val };
        setData('ooc_questions', updated);
    };

    // SOP Commitments Helpers
    const handleAddSopCommitment = () => {
        const newCommitment = {
            id: `sop_${Date.now()}`,
            text: 'Saya bersedia mematuhi peraturan perusahaan...',
            required: true,
        };
        setData('sop_commitments', [...data.sop_commitments, newCommitment]);
    };

    const handleSopCommitmentChange = (index, field, val) => {
        const updated = [...data.sop_commitments];
        updated[index] = { ...updated[index], [field]: val };
        setData('sop_commitments', updated);
    };

    const handleRemoveSopCommitment = (index) => {
        setData('sop_commitments', data.sop_commitments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.recruitment.settings.update'), {
            onSuccess: () => onClose(),
        });
    };

    const availableFields = [
        { key: 'sa_phone', label: 'Nomor Telepon San Andreas (No. HP In-Game)' },
        { key: 'sa_id_card', label: 'Nomor KTP / ID Card San Andreas' },
        { key: 'age', label: 'Usia Karakter (IC)' },
        { key: 'domicile', label: 'Wilayah Domisili Tempat Tinggal' },
        { key: 'licenses', label: 'Daftar Kepemilikan Lisensi (SIM / Trucker / Portofolio)' },
        { key: 'experience_level', label: 'Riwayat Pengalaman Kerja / Hauling' },
        { key: 'shift', label: 'Ketersediaan Shift / Jam Kerja' },
        { key: 'motivation', label: 'Cerita Motivasi & Alasan Bergabung' },
    ];

    const iconOptions = [
        { label: 'Badge / SIM', value: 'badge' },
        { label: 'Truk / Kargo', value: 'local_shipping' },
        { label: 'Keamanan / Verifikasi', value: 'verified_user' },
        { label: 'Montir / Tool', value: 'handyman' },
        { label: 'Security / Senjata', value: 'security' },
        { label: 'Desain / Portofolio', value: 'draw' },
        { label: 'Sertifikat', value: 'workspace_premium' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                        </span>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                Full Customization: Formulir Rekrutmen, IC, OOC &amp; SOP
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Konfigurasi seluruh field formulir pendaftaran warga, lisensi, pertanyaan kustom, dan aturan komitmen.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'general'
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">toggle_on</span>
                        <span>1. Status &amp; Umum</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ic_fields')}
                        className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'ic_fields'
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        <span>2. Identitas Karakter (IC)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('licenses')}
                        className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'licenses'
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>3. Lisensi &amp; Jam Terbang</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ooc')}
                        className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'ooc'
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">forum</span>
                        <span>4. Seksi OOC ({data.ooc_questions.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('sop')}
                        className={`px-3 py-2 font-bold rounded-t-lg transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'sop'
                                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        <span>5. Komitmen &amp; SOP ({data.sop_commitments.length})</span>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
                    {/* TAB 1: STATUS & INFORMASI UMUM */}
                    {activeTab === 'general' && (
                        <div className="space-y-5">
                            {/* STATUS GLOBAL REKRUTMEN */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 text-xs">
                                        Buka Pendaftaran Karyawan untuk Warga
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Jika dinonaktifkan, warga tidak dapat mengirimkan formulir dan akan melihat info pendaftaran ditutup sementara.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_recruitment_open}
                                        onChange={(e) => setData('is_recruitment_open', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {/* TOGGLE VISIBILITAS SEKSI FORMULIR */}
                            <div className="space-y-3">
                                <label className="font-extrabold text-slate-800 text-xs block">
                                    Visibilitas Seksi Formulir Utama
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer">
                                        <span className="font-medium text-slate-700">Tampilkan Seksi Identitas IC</span>
                                        <input
                                            type="checkbox"
                                            checked={data.form_sections.show_identity}
                                            onChange={() => handleSectionToggle('show_identity')}
                                            className="rounded border-slate-300 text-purple-600"
                                        />
                                    </label>
                                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer">
                                        <span className="font-medium text-slate-700">Tampilkan Seksi Lisensi &amp; Jam Terbang</span>
                                        <input
                                            type="checkbox"
                                            checked={data.form_sections.show_licenses}
                                            onChange={() => handleSectionToggle('show_licenses')}
                                            className="rounded border-slate-300 text-purple-600"
                                        />
                                    </label>
                                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer">
                                        <span className="font-medium text-slate-700">Tampilkan Seksi Pertanyaan OOC</span>
                                        <input
                                            type="checkbox"
                                            checked={data.form_sections.show_ooc}
                                            onChange={() => handleSectionToggle('show_ooc')}
                                            className="rounded border-slate-300 text-purple-600"
                                        />
                                    </label>
                                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer">
                                        <span className="font-medium text-slate-700">Tampilkan Pertanyaan Motivasi</span>
                                        <input
                                            type="checkbox"
                                            checked={data.form_sections.show_motivation}
                                            onChange={() => handleSectionToggle('show_motivation')}
                                            className="rounded border-slate-300 text-purple-600"
                                        />
                                    </label>
                                    <label className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer">
                                        <span className="font-medium text-slate-700">Tampilkan Checklist SOP / Komitmen</span>
                                        <input
                                            type="checkbox"
                                            checked={data.form_sections.show_sop}
                                            onChange={() => handleSectionToggle('show_sop')}
                                            className="rounded border-slate-300 text-purple-600"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* PROMPT PERTANYAAN MOTIVASI */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Label Pertanyaan Motivasi &amp; Alasan Bergabung (Esai IC)
                                </label>
                                <input
                                    type="text"
                                    value={data.motivation_prompt}
                                    onChange={(e) => setData('motivation_prompt', e.target.value)}
                                    placeholder="Mengapa Anda tertarik bergabung di Maitri Company?"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs"
                                />
                            </div>

                            {/* INSTRUKSI & KONTAK */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Instruksi Tambahan untuk Pelamar Warga
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        placeholder="Petunjuk proses seleksi bagi pelamar..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Info Kontak Tim Personalia / HRD
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="Contoh: HRD & Personalia Maitri Company (Verona Beach HQ No 12)"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: IDENTITAS KARAKTER (IC) */}
                    {activeTab === 'ic_fields' && (
                        <div className="space-y-6">
                            {/* Checklist Field Wajib */}
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 text-xs">
                                        Checklist Field yang Diwajibkan (Mandatory / Required)
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Pilih data apa saja yang wajib diisi oleh pelamar. Jika tidak dicentang, field tersebut berstatus opsional.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {availableFields.map((field) => {
                                        const checked = data.required_fields.includes(field.key);
                                        return (
                                            <label
                                                key={field.key}
                                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                                    checked ? 'bg-purple-50/70 border-purple-200 text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-500'
                                                }`}
                                            >
                                                <span className="text-[11px]">{field.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => handleFieldToggle(field.key)}
                                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pilihan Wilayah Domisili (Customizable List) */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-xs">
                                            Pilihan Wilayah Domisili Tempat Tinggal ({data.domicile_options.length})
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Daftar opsi dropdown wilayah tempat tinggal yang dapat dipilih pelamar.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newDomicile}
                                        onChange={(e) => setNewDomicile(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomicile())}
                                        placeholder="Tambah wilayah baru (contoh: Montgomery / Las Colinas)..."
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDomicile}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                                    >
                                        + Tambah Wilayah
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {data.domicile_options.map((dom, idx) => (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]"
                                        >
                                            <span>{dom}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDomicile(idx)}
                                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                                title="Hapus opsi wilayah ini"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pertanyaan IC Tambahan (Custom IC Questions) */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-xs">
                                            Pertanyaan Karakter Tambahan (Custom IC Questions)
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Tambahkan pertanyaan IC khusus tambahan di luar field bawaan (misal: "Riwayat Organisasi", "Nama Karakter Alt", dsb).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddIcQuestion}
                                        className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                        <span>+ Tambah Soal IC</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {data.ic_custom_questions.map((q, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-slate-700 text-[11px]">Pertanyaan IC #{idx + 1}</span>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={q.required}
                                                            onChange={(e) => handleIcQuestionChange(idx, 'required', e.target.checked)}
                                                            className="rounded border-slate-300 text-purple-600"
                                                        />
                                                        <span>Wajib Diisi</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIcQuestion(idx)}
                                                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div className="sm:col-span-2">
                                                    <input
                                                        type="text"
                                                        value={q.question}
                                                        onChange={(e) => handleIcQuestionChange(idx, 'question', e.target.value)}
                                                        placeholder="Contoh: Lampirkan Link Portofolio Render / Foto Hasil Karya Anda"
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <select
                                                        value={q.type || 'text'}
                                                        onChange={(e) => handleIcQuestionChange(idx, 'type', e.target.value)}
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                    >
                                                        <option value="text">Field Teks Biasa</option>
                                                        <option value="textarea">Jawaban Panjang (Esai)</option>
                                                        <option value="number">Angka</option>
                                                        <option value="dropdown">Pilihan Dropdown</option>
                                                        <option value="checkbox">Checkbox (Centang)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {q.type === 'dropdown' && (
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                                        Opsi Dropdown (Pisahkan dengan koma):
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q.options || ''}
                                                        onChange={(e) => handleIcQuestionChange(idx, 'options', e.target.value)}
                                                        placeholder="Contoh: Opsi 1, Opsi 2, Opsi 3"
                                                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: LISENSI, BERKAS, PENGALAMAN & SHIFT */}
                    {activeTab === 'licenses' && (
                        <div className="space-y-6">
                            {/* DAFTAR LISENSI YANG TERSEDIA */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-xs">
                                            Daftar Lisensi &amp; Berkas Resmi ({data.available_licenses.length})
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Atur lisensi apa saja yang dapat dipilih oleh pelamar warga saat mendaftar.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddLicense}
                                        className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                        <span>+ Tambah Lisensi Baru</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {data.available_licenses.map((lic, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">{lic.icon || 'verified'}</span>
                                            </div>

                                            <input
                                                type="text"
                                                value={lic.label}
                                                onChange={(e) => handleLicenseChange(idx, 'label', e.target.value)}
                                                placeholder="Nama lisensi..."
                                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            />

                                            <select
                                                value={lic.icon || 'badge'}
                                                onChange={(e) => handleLicenseChange(idx, 'icon', e.target.value)}
                                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            >
                                                {iconOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>

                                            <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={lic.is_active}
                                                    onChange={(e) => handleLicenseChange(idx, 'is_active', e.target.checked)}
                                                    className="rounded border-slate-300 text-purple-600"
                                                />
                                                <span>Aktif</span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLicense(idx)}
                                                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                                title="Hapus lisensi ini"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pilihan Pengalaman Kerja */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <h4 className="font-extrabold text-slate-900 text-xs">
                                    Pilihan Opsi Riwayat Pengalaman Kerja ({data.experience_options.length})
                                </h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newExperience}
                                        onChange={(e) => setNewExperience(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExperience())}
                                        placeholder="Tambah opsi pengalaman baru (misal: 5+ Tahun Pengalaman Truk Berat)..."
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddExperience}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                                    >
                                        + Tambah Opsi
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    {data.experience_options.map((exp, idx) => (
                                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                            <span className="font-medium text-slate-700">{exp.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExperience(idx)}
                                                className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pilihan Shift Kerja */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <h4 className="font-extrabold text-slate-900 text-xs">
                                    Pilihan Opsi Ketersediaan Shift Kerja ({data.shift_options.length})
                                </h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newShift}
                                        onChange={(e) => setNewShift(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddShift())}
                                        placeholder="Tambah opsi shift baru (misal: Khusus Weekend / Akhir Pekan)..."
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddShift}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                                    >
                                        + Tambah Shift
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    {data.shift_options.map((sh, idx) => (
                                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                            <span className="font-medium text-slate-700">{sh.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveShift(idx)}
                                                className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: PERTANYAAN OOC (OUT OF CHARACTER) */}
                    {activeTab === 'ooc' && (
                        <div className="space-y-5">
                            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                                <div>
                                    <h4 className="font-extrabold text-purple-900 text-xs">
                                        Aktifkan Seksi Pertanyaan OOC (Out of Character)
                                    </h4>
                                    <p className="text-[11px] text-purple-700 mt-0.5">
                                        Jika dinonaktifkan, formulir pendaftaran warga hanya akan memuat pertanyaan data karakter (IC).
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.ooc_enabled}
                                        onChange={(e) => setData('ooc_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {data.ooc_enabled ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-slate-600 font-bold">
                                            Daftar Pertanyaan OOC untuk Pelamar ({data.ooc_questions.length}):
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddOocQuestion}
                                            className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer text-[11px]"
                                        >
                                            <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                            <span>+ Tambah Pertanyaan OOC</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.ooc_questions.map((q, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-extrabold text-purple-700 text-[11px]">
                                                        Pertanyaan OOC #{idx + 1}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={q.required}
                                                                onChange={(e) => handleOocQuestionChange(idx, 'required', e.target.checked)}
                                                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <span>Wajib Diisi</span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOocQuestion(idx)}
                                                            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                                            title="Hapus pertanyaan ini"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            type="text"
                                                            required
                                                            value={q.question}
                                                            onChange={(e) => handleOocQuestionChange(idx, 'question', e.target.value)}
                                                            placeholder="Tuliskan pertanyaan OOC..."
                                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <select
                                                            value={q.type || 'text'}
                                                            onChange={(e) => handleOocQuestionChange(idx, 'type', e.target.value)}
                                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                        >
                                                            <option value="text">Teks Singkat</option>
                                                            <option value="textarea">Jawaban Panjang (Paragraf)</option>
                                                            <option value="number">Angka / Usia</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <input
                                                        type="text"
                                                        value={q.placeholder || ''}
                                                        onChange={(e) => handleOocQuestionChange(idx, 'placeholder', e.target.value)}
                                                        placeholder="Contoh placeholder petunjuk pengisian..."
                                                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] bg-white text-slate-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 italic text-[11px]">
                                    Seksi pertanyaan OOC saat ini dinonaktifkan. Formulir hanya akan menampilkan pertanyaan karakter (IC).
                                </p>
                            )}
                        </div>
                    )}

                    {/* TAB 5: PERNYATAAN KOMITMEN & KEPATUHAN SOP */}
                    {activeTab === 'sop' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 text-xs">
                                        Butir Pernyataan Komitmen &amp; Kepatuhan SOP ({data.sop_commitments.length})
                                    </h4>
                                    <p className="text-[11px] text-slate-500">
                                        Atur butir-butir komitmen, integritas, dan aturan perusahaan yang wajib dicentang dan disetujui pelamar sebelum mengirim formulir.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddSopCommitment}
                                    className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                    <span>+ Tambah Butir SOP</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.sop_commitments.map((sop, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-amber-700 text-[11px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[15px]">gavel</span>
                                                <span>Poin Komitmen #{idx + 1}</span>
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={sop.required}
                                                        onChange={(e) => handleSopCommitmentChange(idx, 'required', e.target.checked)}
                                                        className="rounded border-slate-300 text-purple-600"
                                                    />
                                                    <span>Wajib Dicentang</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSopCommitment(idx)}
                                                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={2}
                                            value={sop.text}
                                            onChange={(e) => handleSopCommitmentChange(idx, 'text', e.target.value)}
                                            placeholder="Tuliskan pernyataan komitmen..."
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        ></textarea>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
                        <span className="text-[11px] text-slate-400">
                            Perubahan akan langsung berpengaruh pada formulir pendaftaran warga.
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
