import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function DivisionModal({ isOpen, onClose, division = null }) {
    if (!isOpen) return null;

    const isEdit = !!division;
    const [useCustomSop, setUseCustomSop] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        department: 'Divisi Logistik & Armada Niaga',
        icon: 'local_shipping',
        description: '',
        qualifications: [''],
        required_licenses: [],
        custom_questions: [],
        sop_commitments: [],
        quota: 5,
        badge: 'Prioritas Tinggi',
        is_active: true,
        sort_order: 1,
    });

    useEffect(() => {
        if (division) {
            const hasSop = Array.isArray(division.sop_commitments) && division.sop_commitments.length > 0;
            setUseCustomSop(hasSop);
            setData({
                title: division.title || '',
                department: division.department || 'Divisi Logistik & Armada Niaga',
                icon: division.icon || 'local_shipping',
                description: division.description || '',
                qualifications: Array.isArray(division.qualifications) && division.qualifications.length > 0
                    ? division.qualifications
                    : [''],
                required_licenses: Array.isArray(division.required_licenses) ? division.required_licenses : [],
                custom_questions: Array.isArray(division.custom_questions) ? division.custom_questions : [],
                sop_commitments: hasSop ? division.sop_commitments : [],
                quota: division.quota ?? 5,
                badge: division.badge || '',
                is_active: division.is_active ?? true,
                sort_order: division.sort_order ?? 1,
            });
        } else {
            reset();
            setUseCustomSop(false);
            setData({
                title: '',
                department: 'Divisi Logistik & Armada Niaga',
                icon: 'local_shipping',
                description: '',
                qualifications: ['Memiliki lisensi resmi yang sesuai', 'Disiplin dan bertanggung jawab'],
                required_licenses: [],
                custom_questions: [],
                sop_commitments: [],
                quota: 5,
                badge: 'Prioritas',
                is_active: true,
                sort_order: 1,
            });
        }
    }, [division]);

    // Qualifications Helpers
    const handleAddQualification = () => {
        setData('qualifications', [...data.qualifications, '']);
    };

    const handleRemoveQualification = (index) => {
        const updated = data.qualifications.filter((_, i) => i !== index);
        setData('qualifications', updated.length > 0 ? updated : ['']);
    };

    const handleQualificationChange = (index, val) => {
        const updated = [...data.qualifications];
        updated[index] = val;
        setData('qualifications', updated);
    };

    // Licenses Helpers
    const handleLicenseToggle = (licId) => {
        const current = [...data.required_licenses];
        const index = current.indexOf(licId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(licId);
        }
        setData('required_licenses', current);
    };

    // Custom Fields/Questions Helpers
    const handleAddCustomQuestion = () => {
        const newQ = {
            id: `div_q_${Date.now()}`,
            question: '',
            placeholder: '',
            type: 'text', // 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'number'
            options: '', // comma separated for dropdown
            required: false,
        };
        setData('custom_questions', [...data.custom_questions, newQ]);
    };

    const handleCustomQuestionChange = (index, field, val) => {
        const updated = [...data.custom_questions];
        updated[index] = { ...updated[index], [field]: val };
        setData('custom_questions', updated);
    };

    const handleRemoveCustomQuestion = (index) => {
        setData('custom_questions', data.custom_questions.filter((_, i) => i !== index));
    };

    // SOP Commitments Helpers
    const handleToggleCustomSop = (e) => {
        const checked = e.target.checked;
        setUseCustomSop(checked);
        if (!checked) {
            setData('sop_commitments', []);
        } else if (data.sop_commitments.length === 0) {
            setData('sop_commitments', [
                {
                    id: `div_sop_${Date.now()}`,
                    text: 'Saya bersedia mematuhi protokoler dan instruksi khusus pimpinan divisi ini saat bertugas.',
                    required: true,
                },
            ]);
        }
    };

    const handleAddDivisionSop = () => {
        const newSop = {
            id: `div_sop_${Date.now()}`,
            text: '',
            required: true,
        };
        setData('sop_commitments', [...data.sop_commitments, newSop]);
    };

    const handleDivisionSopChange = (index, field, val) => {
        const updated = [...data.sop_commitments];
        updated[index] = { ...updated[index], [field]: val };
        setData('sop_commitments', updated);
    };

    const handleRemoveDivisionSop = (index) => {
        setData('sop_commitments', data.sop_commitments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            sop_commitments: useCustomSop ? data.sop_commitments : [],
        };

        if (isEdit) {
            put(route('admin.recruitment.divisions.update', division.id), {
                data: payload,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('admin.recruitment.divisions.store'), {
                data: payload,
                onSuccess: () => onClose(),
            });
        }
    };

    const iconOptions = [
        { label: 'Truk / Logistik', value: 'local_shipping' },
        { label: 'Montir / Bengkel', value: 'build' },
        { label: 'Dispatcher / Administrasi', value: 'assignment' },
        { label: 'Studio Desain / Arsitek', value: 'architecture' },
        { label: 'Keuangan / Kasir', value: 'receipt_long' },
        { label: 'Keamanan / Security', value: 'security' },
        { label: 'Manajemen / HRD', value: 'badge' },
    ];

    const standardLicenses = [
        { id: 'driving', label: 'Driving License (SIM Mengemudi Aktif)' },
        { id: 'trucker', label: 'Trucker / Heavy Vehicle License (Lisensi Truk Berat)' },
        { id: 'clean_record', label: 'Catatan Bersih Bebas Kriminal Berat (Clean Record)' },
        { id: 'mechanic_cert', label: 'Sertifikasi Bengkel / Keahlian Otomotif' },
        { id: 'firearm_permit', label: 'Izin Senjata Sah (Firearm Permit)' },
        { id: 'portfolio_design', label: 'Portofolio Desain / Arsitektur 3D' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[20px]">{data.icon || 'work'}</span>
                        </span>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                {isEdit ? `Edit Divisi Lowongan: ${data.title || 'Divisi'}` : 'Tambah Divisi / Posisi Lowongan Baru'}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Atur kualifikasi, lisensi wajib, field/soal kustom, dan Pernyataan Komitmen &amp; Kepatuhan SOP per divisi.
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
                    {/* BAGIAN 1: INFORMASI DASAR POSISI */}
                    <div className="space-y-4">
                        <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block border-b border-slate-100 pb-1">
                            1. Informasi Pokok &amp; Deskripsi Pekerjaan
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Posisi / Jabatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: 3D Visualizer & Drafter Studio Interior"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                                />
                                {errors.title && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.title}</span>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Departemen / Divisi Induk <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="Contoh: Divisi Studio Desain & Arsitektur"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Ikon Posisi
                                </label>
                                <select
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                >
                                    {iconOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label} ({opt.value})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1">
                                    Deskripsi Tugas &amp; Tanggung Jawab <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    required
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan secara singkat tanggung jawab tugas pekerjaan posisi ini..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                ></textarea>
                                {errors.description && <span className="text-[11px] text-rose-500 mt-0.5 block">{errors.description}</span>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Kuota Penerimaan (Orang)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.quota || ''}
                                    onChange={(e) => setData('quota', e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="Contoh: 2"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Label / Badge Highlight
                                </label>
                                <input
                                    type="text"
                                    value={data.badge}
                                    onChange={(e) => setData('badge', e.target.value)}
                                    placeholder="Contoh: Portofolio Diutamakan / High Priority"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    id="is_active_div"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="is_active_div" className="font-bold text-slate-800 cursor-pointer">
                                    Status Posisi: Terbuka untuk Dilamar Warga
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 2: KUALIFIKASI PERSYARATAN DIVISI */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                                    2. Kualifikasi &amp; Syarat Pelamar Divisi Ini
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Daftar poin syarat kualifikasi yang akan tampil di kartu lowongan warga.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddQualification}
                                className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                <span>+ Tambah Syarat</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {data.qualifications.map((qual, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={qual}
                                        onChange={(e) => handleQualificationChange(idx, e.target.value)}
                                        placeholder={`Kualifikasi syarat #${idx + 1}...`}
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQualification(idx)}
                                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                                        title="Hapus kualifikasi ini"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BAGIAN 3: LISENSI YANG DIUTAMAKAN */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div>
                            <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                                3. Lisensi &amp; Berkas yang Wajib / Diutamakan
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Centang lisensi yang menjadi prioritas divisi ini (akan di-highlight saat warga memilih lowongan ini).
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {standardLicenses.map((lic) => {
                                const checked = data.required_licenses.includes(lic.id);
                                return (
                                    <label
                                        key={lic.id}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                            checked ? 'bg-blue-50/70 border-brand-300 text-brand-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <span className="text-[11px]">{lic.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleLicenseToggle(lic.id)}
                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* BAGIAN 4: POIN PERTANYAAN / INPUT BEBAS KHUSUS DIVISI INI */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                                    4. Form Customizer Khusus Divisi Ini ({data.custom_questions.length} Field)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Tambah input bebas: Teks, Textarea, Angka, Dropdown, atau Checkbox persetujuan khusus posisi ini.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddCustomQuestion}
                                className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                <span>+ Tambah Field Khusus</span>
                            </button>
                        </div>

                        {data.custom_questions.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                                Belum ada input tambahan khusus untuk divisi ini. Klik "+ Tambah Field Khusus" jika ingin menambahkan field seperti Link Portofolio, Dropdown keahlian, atau Checkbox sertifikasi.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.custom_questions.map((q, idx) => (
                                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-purple-700 text-[11px] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[15px]">input</span>
                                                <span>Field Khusus #{idx + 1}</span>
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={q.required}
                                                        onChange={(e) => handleCustomQuestionChange(idx, 'required', e.target.checked)}
                                                        className="rounded border-slate-300 text-purple-600"
                                                    />
                                                    <span>Wajib Diisi</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCustomQuestion(idx)}
                                                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                    title="Hapus field ini"
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
                                                    onChange={(e) => handleCustomQuestionChange(idx, 'question', e.target.value)}
                                                    placeholder="Nama / Label Pertanyaan..."
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <select
                                                    value={q.type || 'text'}
                                                    onChange={(e) => handleCustomQuestionChange(idx, 'type', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                                                >
                                                    <option value="text">Field Teks Biasa</option>
                                                    <option value="textarea">Jawaban Panjang (Paragraf)</option>
                                                    <option value="number">Angka</option>
                                                    <option value="dropdown">Pilihan Dropdown</option>
                                                    <option value="checkbox">Checkbox (Centang)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {q.type === 'dropdown' ? (
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                                    Daftar Opsi Dropdown (Pisahkan dengan koma):
                                                </label>
                                                <input
                                                    type="text"
                                                    value={q.options || ''}
                                                    onChange={(e) => handleCustomQuestionChange(idx, 'options', e.target.value)}
                                                    placeholder="Contoh: Pemula, Mahir, Profesional, Master"
                                                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={q.placeholder || ''}
                                                    onChange={(e) => handleCustomQuestionChange(idx, 'placeholder', e.target.value)}
                                                    placeholder="Contoh placeholder petunjuk pengisian..."
                                                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] bg-white text-slate-600"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BAGIAN 5: PERNYATAAN KOMITMEN & KEPATUHAN SOP PER DIVISI */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                                    5. Pernyataan Komitmen &amp; Kepatuhan SOP (Per Divisi)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Atur apakah divisi ini memiliki aturan kepatuhan SOP khusus atau menggunakan aturan umum perusahaan.
                                </span>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCustomSop}
                                    onChange={handleToggleCustomSop}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>

                        {useCustomSop ? (
                            <div className="space-y-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-amber-600">gavel</span>
                                        <span>Daftar Butir Komitmen Khusus Divisi Ini ({data.sop_commitments.length})</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAddDivisionSop}
                                        className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                        <span>+ Tambah Butir SOP</span>
                                    </button>
                                </div>

                                <div className="space-y-2.5">
                                    {data.sop_commitments.map((sop, idx) => (
                                        <div key={idx} className="p-3 bg-white border border-amber-200 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-amber-800 text-[11px]">
                                                    Poin Komitmen Divisi #{idx + 1}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={sop.required}
                                                            onChange={(e) => handleDivisionSopChange(idx, 'required', e.target.checked)}
                                                            className="rounded border-slate-300 text-amber-600"
                                                        />
                                                        <span>Wajib Dicentang</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDivisionSop(idx)}
                                                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <textarea
                                                rows={2}
                                                required
                                                value={sop.text}
                                                onChange={(e) => handleDivisionSopChange(idx, 'text', e.target.value)}
                                                placeholder="Tuliskan pernyataan komitmen khusus posisi ini (misal: Menjaga kerahasiaan blueprint desain, dsb)..."
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                                Menggunakan <strong>Pernyataan Komitmen &amp; Kepatuhan SOP Global Perusahaan</strong> (default). Nyalakan saklar di atas jika Anda ingin mengatur poin-poin komitmen khusus untuk divisi ini saja.
                            </p>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
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
                            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Divisi' : 'Tambah Divisi Lowongan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
