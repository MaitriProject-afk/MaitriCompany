import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DivisionModal from './Components/DivisionModal';
import SettingsModal from './Components/SettingsModal';
import ApplicationDetailModal from './Components/ApplicationDetailModal';

export default function RecruitmentIndex({ divisions = [], settings, applications, stats = {}, filters = {} }) {
    const [activeTab, setActiveTab] = useState('divisions'); // 'divisions' | 'applicants'
    const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    const handleCreateDivision = () => {
        setEditingDivision(null);
        setIsDivisionModalOpen(true);
    };

    const handleEditDivision = (div) => {
        setEditingDivision(div);
        setIsDivisionModalOpen(true);
    };

    const handleDeleteDivision = (div) => {
        if (confirm(`Apakah Anda yakin ingin menghapus divisi '${div.title}'? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('admin.recruitment.divisions.destroy', div.id));
        }
    };

    const handleToggleDivision = (div) => {
        router.patch(route('admin.recruitment.divisions.toggle', div.id));
    };

    const handleFilterStatus = (st) => {
        router.get(route('admin.recruitment.index'), {
            ...filters,
            status: st,
        }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.recruitment.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const getAppStatusBadge = (st) => {
        switch (st) {
            case 'accepted':
                return { label: 'Diterima Lolos', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
            case 'interview':
                return { label: 'Wawancara HQ', bg: 'bg-blue-50 text-brand-700 border-blue-200' };
            case 'rejected':
                return { label: 'Ditolak', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
            default:
                return { label: 'Pending Review', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
        }
    };

    return (
        <AdminLayout activeMenu="recruitment">
            <Head title="Manajemen Rekrutmen & Divisi - Admin Console" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. TOP HEADER BANNER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Manajemen Personalia &amp; Rekrutmen
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                stats.is_open
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stats.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {stats.is_open ? 'Pendaftaran Warga: Buka' : 'Pendaftaran Warga: Tutup'}
                            </span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                                HQ Verona Beach No 12
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Konsol Rekrutmen &amp; Kualifikasi Divisi
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Atur divisi pekerjaan yang dibuka, kualifikasi syarat per divisi, konfigurasi formulir &amp; pertanyaan OOC, serta evaluasi berkas pendaftaran warga secara terpusat.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                        <button
                            type="button"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-purple-700">tune</span>
                            <span>Kustomisasi Penuh Formulir &amp; OOC</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateDivision}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>+ Tambah Divisi Lowongan</span>
                        </button>
                    </div>
                </div>

                {/* 2. RECRUITMENT KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Berkas Masuk
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                            {stats.total_applications || 0}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Semua pelamar warga</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                            Menunggu Seleksi
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                            {stats.pending_count || 0}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Pending verifikasi berkas</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                            Tahap Wawancara
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-brand-700 mt-1">
                            {stats.interview_count || 0}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Diundang ke HQ Verona</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                            Diterima Lolos
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                            {stats.accepted_count || 0}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Karyawan resmi baru</span>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 col-span-2 lg:col-span-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Divisi Terbuka
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                            {stats.active_divisions || 0} / {divisions.length}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Posisi aktif dilamar</span>
                    </div>
                </div>

                {/* 3. TABS SWITCHER */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setActiveTab('divisions')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'divisions'
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">work</span>
                        <span>Daftar Divisi Lowongan &amp; Kualifikasi ({divisions.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('applicants')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'applicants'
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                        <span>Daftar Berkas Pelamar Warga ({stats.total_applications || 0})</span>
                        {stats.pending_count > 0 && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                                {stats.pending_count}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 sm:ml-auto"
                    >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        <span>Full Customizer Formulir (IC, OOC &amp; SOP)</span>
                    </button>
                </div>

                {/* TAB CONTENT: DIVISIONS */}
                {activeTab === 'divisions' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {divisions.map((div) => (
                                <div
                                    key={div.id}
                                    className={`bg-white rounded-2xl shadow-xs border p-5 flex flex-col justify-between transition-all ${
                                        div.is_active ? 'border-slate-200/80' : 'border-slate-200 opacity-70 bg-slate-50/60'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${div.is_active ? 'bg-blue-50 text-brand-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    <span className="material-symbols-outlined text-[22px]">{div.icon || 'work'}</span>
                                                </span>
                                                <div>
                                                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                                                        {div.title}
                                                    </h3>
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {div.department}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                div.is_active
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {div.is_active ? 'Buka' : 'Tutup'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {div.description}
                                        </p>

                                        {/* KUALIFIKASI YANG DIBUTUHKAN */}
                                        <div className="pt-3 border-t border-slate-100 space-y-1.5">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                                Kualifikasi Syarat yang Dibutuhkan:
                                            </span>
                                            {Array.isArray(div.qualifications) && div.qualifications.length > 0 ? (
                                                <ul className="space-y-1 text-xs text-slate-700">
                                                    {div.qualifications.map((q, qIdx) => (
                                                        <li key={qIdx} className="flex items-start gap-1.5">
                                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                                            <span className="leading-tight">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Belum ada syarat spesifik</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-100">
                                            <span>Pelamar Masuk: <strong className="text-slate-800">{div.applications_count || 0} Orang</strong></span>
                                            {div.quota && <span>Kuota: <strong className="text-slate-800">{div.quota} Orang</strong></span>}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleDivision(div)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                div.is_active
                                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                            }`}
                                        >
                                            {div.is_active ? 'Tutup Lowongan' : 'Buka Lowongan'}
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleEditDivision(div)}
                                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 transition-colors cursor-pointer"
                                                title="Edit Divisi"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDivision(div)}
                                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                                                title="Hapus Divisi"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: APPLICANTS */}
                {activeTab === 'applicants' && (
                    <div className="space-y-4">
                        {/* Search & Status Filters */}
                        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {['all', 'pending', 'interview', 'accepted', 'rejected'].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleFilterStatus(st)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                            (filters.status || 'all') === st
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st === 'all' ? 'Semua Berkas' : st}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, tiket, no HP..."
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64"
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs cursor-pointer"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                            <div className="overflow-x-auto">
                                {applications.data.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inbox</span>
                                        <p className="text-sm font-semibold text-slate-600">Belum ada berkas pelamar pada kriteria ini.</p>
                                        <p className="text-xs text-slate-400 mt-1">Formulir pendaftaran yang dikirim warga akan muncul otomatis di sini.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200/70">
                                                <th className="px-4 py-3 font-bold">No. Tiket &amp; Pelamar</th>
                                                <th className="px-4 py-3 font-bold">Posisi Dilamar</th>
                                                <th className="px-4 py-3 font-bold">Kontak IC</th>
                                                <th className="px-4 py-3 font-bold">Tanggal Kirim</th>
                                                <th className="px-4 py-3 font-bold">Status</th>
                                                <th className="px-4 py-3 font-bold text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {applications.data.map((app) => {
                                                const badge = getAppStatusBadge(app.status);
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-4 py-3.5">
                                                            <div className="font-mono font-bold text-slate-900 text-[11px]">
                                                                #{app.ticket_number}
                                                            </div>
                                                            <div className="font-extrabold text-slate-900 mt-0.5">
                                                                {app.full_name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">
                                                                User: {app.user?.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <div className="font-bold text-slate-800">
                                                                {app.position_title}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">
                                                                {app.division?.department || 'Divisi Maitri'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 font-mono">
                                                            <div className="text-slate-800">
                                                                HP: {app.sa_phone}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400">
                                                                KTP: {app.sa_id_card}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-slate-600">
                                                            {new Date(app.created_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedApplication(app)}
                                                                className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs transition-colors cursor-pointer"
                                                            >
                                                                Review Berkas →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <DivisionModal
                isOpen={isDivisionModalOpen}
                onClose={() => setIsDivisionModalOpen(false)}
                division={editingDivision}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={settings}
            />

            <ApplicationDetailModal
                isOpen={!!selectedApplication}
                onClose={() => setSelectedApplication(null)}
                application={selectedApplication}
            />
        </AdminLayout>
    );
}
