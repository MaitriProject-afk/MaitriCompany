import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import EmployeeApplicationForm from './Components/EmployeeApplicationForm';

export default function WargaDashboard({
    vehicleCategories = [],
    recruitmentDivisions = [],
    recruitmentSettings = null,
    myApplications = [],
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('overview');

    const formatRupiah = (val) => {
        if (!val || val === 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased flex flex-col">
            <Head title="Portal Warga & Pendaftaran Karyawan - Maitri Company" />

            {/* TOP NAVIGATION HEADER */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand Logo & Title */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img
                                alt="Maitri Company"
                                className="h-8 w-auto object-contain"
                                src="/images/maitricomplogo.png"
                            />
                            <div className="flex flex-col">
                                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                                    Maitri Portal
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                                    Layanan Warga &amp; Rekrutmen
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Tabs (Desktop) */}
                    <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'overview'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Beranda &amp; Layanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('rekrutmen')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'rekrutmen'
                                    ? 'bg-brand-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:text-slate-900'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                            <span>Pendaftaran Karyawan</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('armada')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'armada'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Tarif Sewa Truk
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('regulasi')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'regulasi'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Regulasi &amp; SOP
                        </button>
                    </div>

                    {/* User Profile & Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">home</span>
                            <span>Halaman Utama</span>
                        </Link>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left hidden lg:block">
                                <div className="text-xs font-bold text-slate-900 leading-tight">
                                    {user.name}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                    Warga San Andreas
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Keluar dari Portal"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            <span className="hidden sm:inline">Keluar</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation Tabs */}
                <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50 text-xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`py-1 px-2 font-bold ${activeTab === 'overview' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
                    >
                        Beranda
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('rekrutmen')}
                        className={`py-1 px-2 font-bold flex items-center gap-1 ${activeTab === 'rekrutmen' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
                    >
                        <span>Rekrutmen</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('armada')}
                        className={`py-1 px-2 font-bold ${activeTab === 'armada' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
                    >
                        Armada
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('regulasi')}
                        className={`py-1 px-2 font-bold ${activeTab === 'regulasi' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
                    >
                        SOP
                    </button>
                </div>
            </header>

            {/* MAIN PORTAL BODY */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* TAB 1: OVERVIEW & SERVICES */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* HERO BANNER WARGA */}
                        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
                                <span className="material-symbols-outlined text-[180px]">local_shipping</span>
                            </div>

                            <div className="relative z-10 max-w-2xl space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                                        ● Akun Warga Terverifikasi
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                                        Maitri HQ Verona Beach No 12
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                                    Selamat Datang, {user.name}!
                                </h1>

                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                    Portal resmi warga untuk mengakses layanan <strong className="text-white">Sewa Armada Truk Niaga</strong>, konsultasi <strong className="text-white">Studio Desain Arsitektur</strong>, dan pendaftaran <strong className="text-white">Karier / Lowongan Karyawan</strong> di Maitri Company.
                                </p>

                                <div className="flex items-center gap-3 pt-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('rekrutmen')}
                                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                                        <span>Daftar Jadi Karyawan</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('armada')}
                                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                        <span>Cek Tarif Sewa Truk</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3 QUICK ACTION PILLARS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Card 1: Pendaftaran Karyawan */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                            <span className="material-symbols-outlined text-[24px]">badge</span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            Rekrutmen Dibuka
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                                            Pendaftaran Karyawan
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Bergabunglah bersama keluarga besar Maitri Company sebagai Driver Truk Berat, Teknisi Montir, Dispatcher, atau Desainer 3D.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('rekrutmen')}
                                    className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <span>Buka Formulir Pendaftaran</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>

                            {/* Card 2: Layanan Sewa Truk */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-700 flex items-center justify-center font-bold">
                                            <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-700 border border-blue-200">
                                            Kondisi 2000 HP
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                                            Sewa Armada &amp; Truk Niaga
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Sewa armada truk fleksibel per jam, per hari, atau per trip dengan toleransi lecet wajar &le; 100 HP bebas denda.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('armada')}
                                    className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <span>Lihat Daftar &amp; Rate Truk</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>

                            {/* Card 3: Studio Desain & Workshop */}
                            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow group">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                                            <span className="material-symbols-outlined text-[24px]">architecture</span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            Workshop Verona
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                                            Studio Desain &amp; Kustomisasi
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Layanan kustomisasi livery stiker truk komersial, perbaikan bodi bengkel, dan konsultasi rancang bangun interior hunian warga.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('regulasi')}
                                    className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <span>Panduan &amp; Ketentuan SOP</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* INFO LOKASI HQ & WALK-IN NOTICE */}
                        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[26px]">business</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-900">
                                        Kantor Operasional &amp; Dispatcher Fisik
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                        <strong>Maitri HQ:</strong> Verona Beach No 12 Los Santos, San Andreas • Layanan Walk-in 24 Jam
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Penerbitan kunci sewa armada dan verifikasi wawancara kerja dilakukan langsung di meja resepsionis/dispatch.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start lg:self-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('rekrutmen')}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                    <span>Lamar Pekerjaan Sekarang</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: FORMULIR PENDAFTARAN KARYAWAN (CORE REQUEST) */}
                {activeTab === 'rekrutmen' && (
                    <EmployeeApplicationForm
                        user={user}
                        divisions={recruitmentDivisions}
                        settings={recruitmentSettings}
                        myApplications={myApplications}
                    />
                )}

                {/* TAB 3: KATALOG & TARIF TRUK */}
                {activeTab === 'armada' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                            <h2 className="text-lg font-extrabold text-slate-900">
                                Daftar Kategori Armada &amp; Tarif Sewa Resmi
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Seluruh armada diserahterimakan dalam kondisi prima 2000 HP dengan toleransi lecet &le; 100 HP bebas denda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {vehicleCategories.map((cat) => (
                                <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="w-10 h-10 rounded-xl bg-blue-50 text-brand-700 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[22px]">{cat.icon || 'local_shipping'}</span>
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                Kondisi 2000 HP
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-extrabold text-slate-900">{cat.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                            {cat.description || 'Armada niaga resmi Maitri Company.'}
                                        </p>

                                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Per Jam:</span>
                                                <span className="font-bold text-slate-900">
                                                    {cat.rental_price_per_hour ? formatRupiah(cat.rental_price_per_hour) : <span className="text-slate-400 font-normal">Tidak didukung</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Per Hari:</span>
                                                <span className="font-bold text-slate-900">
                                                    {cat.rental_price_per_day ? formatRupiah(cat.rental_price_per_day) : <span className="text-slate-400 font-normal">Tidak didukung</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Per Trip:</span>
                                                <span className="font-bold text-slate-900">
                                                    {cat.rental_price_per_trip ? formatRupiah(cat.rental_price_per_trip) : <span className="text-slate-400 font-normal">Tidak didukung</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                                        <span className="text-[11px] text-brand-600 font-bold">
                                            Sewa di HQ Verona Beach No 12
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 4: REGULASI & SOP */}
                {activeTab === 'regulasi' && (
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-black text-slate-900">
                                Peraturan, SOP &amp; Ketentuan Operasional
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Ketentuan resmi bagi penyewa warga dan seluruh staf/karyawan Maitri Company.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                                    <span>Standar Kondisi Awal Armada (2000 HP)</span>
                                </div>
                                <p className="text-slate-600">
                                    Setiap kendaraan diserahkan dalam kondisi mesin dan bodi prima <strong>2000 HP</strong>. Sebelum berangkat, penyewa dan dispatcher melakukan inspeksi fisik bersama.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                    <span className="material-symbols-outlined text-blue-600 text-[18px]">rule</span>
                                    <span>Toleransi Baret &amp; Lecet Wajar (&le; 100 HP)</span>
                                </div>
                                <p className="text-slate-600">
                                    Jika kendaraan kembali dengan penurunan kesehatan maksimal 100 HP (1900 - 2000 HP), penyewa <strong>DIBEBASKAN DARI SEGALA BIAYA DENDA</strong>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                    <span className="material-symbols-outlined text-amber-600 text-[18px]">build</span>
                                    <span>Kerusakan Berat &gt; 100 HP</span>
                                </div>
                                <p className="text-slate-600">
                                    Kerusakan berat di bawah 1900 HP wajib menanggung biaya jasa montir dan perbaikan onderdil di bengkel rekanan resmi Maitri Company.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                                    <span className="material-symbols-outlined text-rose-600 text-[18px]">alarm_on</span>
                                    <span>Denda Keterlambatan (1.5&times; Tarif Per Jam)</span>
                                </div>
                                <p className="text-slate-600">
                                    Keterlambatan pengembalian unit dikenakan denda proporsional sebesar <strong>1.5&times; tarif sewa per jam</strong> untuk setiap jam keterlambatan.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 md:col-span-2 space-y-2 text-rose-900">
                                <div className="font-bold flex items-center gap-1.5 text-sm text-rose-700">
                                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                                    <span>Larangan Keras Tindakan Fail RP (Aturan OOC/IC)</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">
                                    Dilarang dengan sengaja menenggelamkan truk ke laut, meledakkan kendaraan, atau mengembalikan unit diam-diam lalu melarikan diri tanpa menyelesaikan proses check-out bersama admin. Pelanggaran ini akan dilaporkan ke otoritas/admin server sebagai tindakan <strong>Fail RP</strong> dan blacklist permanen dari Maitri Company.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
