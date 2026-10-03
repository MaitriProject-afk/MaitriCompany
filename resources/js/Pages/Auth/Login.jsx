import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [role, setRole] = useState('mitra'); // 'mitra' | 'klien'
    const [showPassword, setShowPassword] = useState(false);
    const [fastAuthNotice, setFastAuthNotice] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFastAuth = (provider) => {
        if (provider === 'wa') {
            const waNumber = '6281234567890';
            const waText = encodeURIComponent(
                `Halo Admin Maitri Company, saya ingin verifikasi login OTP akun ${role === 'mitra' ? 'Mitra Logistik' : 'Klien Proyek'}.`
            );
            window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
        } else if (provider === 'google') {
            setFastAuthNotice('Integrasi Google Workspace SSO sedang menghubungkan ke direktori korporat...');
            setTimeout(() => setFastAuthNotice(''), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9ff] text-slate-800 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
            <Head title="Portal Akses Resmi - Masuk Akun" />

            {/* HEADER NAVIGATION */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
                <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/maitricomplogo.png"
                            alt="Maitri Company Logo"
                            className="h-8 w-auto object-contain transform group-hover:scale-105 transition-transform"
                        />
                        <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                            Maitri Company
                        </span>
                        <div className="hidden sm:flex items-center gap-1.5 pl-3 py-1 pr-3 bg-blue-50/80 border border-blue-200/60 rounded-full text-[11px] font-semibold text-brand-700">
                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                            <span>Portal Active</span>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
                        <Link
                            href="/"
                            className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            Beranda Publik
                        </Link>
                        <span className="px-3.5 py-2 rounded-lg bg-brand-600 text-white shadow-xs">
                            Sign In
                        </span>
                        <Link
                            href={route('register')}
                            className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            Pendaftaran Akun
                        </Link>
                    </nav>

                    {/* Right Action: Helpdesk & Back */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://wa.me/6281234567890?text=Halo%20Helpdesk%20Maitri%20Company,%20saya%20butuh%20bantuan%20akses%20login."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-blue-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
                            <span className="hidden sm:inline">Helpdesk WA</span>
                        </a>
                        <Link
                            href="/"
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                            title="Kembali ke Beranda"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 w-full pt-20 pb-12 sm:pt-24 sm:pb-16 flex items-center">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                        
                        {/* LEFT COLUMN: BRAND TRUST & OPERATIONAL VALUE (45%) */}
                        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/50 p-6 sm:p-8 lg:p-10 relative overflow-hidden border border-blue-100 shadow-sm">
                            {/* Ambient Glows */}
                            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-blue-300/20 blur-2xl pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col gap-6">
                                {/* Authority Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-brand-700 text-xs font-bold border border-blue-200/80 shadow-xs w-fit">
                                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                                    <span>Portal Akses Resmi Maitri Company</span>
                                </div>

                                {/* Headline & Subtitle */}
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                        Satu Akses Terpadu untuk Kendali Armada &amp; Proyek Desain Anda
                                    </h1>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Platform enterprise terintegrasi yang menghubungkan operasional logistik darat dengan pengawasan eksekusi proyek arsitektural.
                                    </p>
                                </div>

                                {/* Feature Image Anchor */}
                                <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden shadow-md group border border-slate-200/80 bg-slate-900">
                                    <img
                                        src="/images/maitricompbanner.jpg"
                                        alt="Maitri Fleet Hub and Interior Project Cloud"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                                        <div className="flex items-center justify-between w-full text-white">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px] text-cyan-400">verified</span>
                                                <span className="text-xs font-bold uppercase tracking-wider">Fleet Hub &amp; Project Cloud</span>
                                            </div>
                                            <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white border border-white/20">
                                                v4.8 Live
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Core Value Bullet Points */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-blue-100 shadow-xs hover:border-blue-200 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-xs font-bold text-slate-900">Mitra Pengemudi &amp; Logistik</span>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Akses jadwal jalan seketika, surat jalan digital (e-POD), telemetri GPS armada aktif, serta rincian slip insentif transparan.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-blue-100 shadow-xs hover:border-blue-200 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[22px]">architecture</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-xs font-bold text-slate-900">Klien Desain &amp; Bangun Interior</span>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Pantau progres visual 3D render, digital approval RAB, milestone jadwal renovasi, dan jalur komunikasi real-time tim lapangan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Anchor Footer */}
                            <div className="relative z-10 pt-6 mt-6 border-t border-blue-100/80 flex items-center justify-between text-slate-500 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-brand-600 text-[18px]">lock</span>
                                    <span>Enkripsi 256-Bit SSL</span>
                                </div>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-brand-600 text-[18px]">support_agent</span>
                                    <span>Layanan Siaga 24 Jam</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: INTERACTIVE LOGIN CONTAINER (55%) */}
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <div className="w-full max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/90 flex flex-col gap-6">
                                
                                {/* Card Header */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
                                            Portal Otentikasi
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            IDN / EN
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Selamat Datang Kembali
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Silakan masuk ke akun Maitri Company Anda untuk melanjutkan aktivitas operasional.
                                    </p>
                                </div>

                                {/* Flash Status Notice */}
                                {status && (
                                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                                        <span>{status}</span>
                                    </div>
                                )}

                                {fastAuthNotice && (
                                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-brand-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                                        <span className="material-symbols-outlined text-[18px] text-brand-600">info</span>
                                        <span>{fastAuthNotice}</span>
                                    </div>
                                )}

                                {/* Role Segment Switcher */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700">Tipe Akun Pengguna</span>
                                        <span className="text-[11px] text-slate-400">Pilih akses akun Anda</span>
                                    </div>
                                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200/70">
                                        <button
                                            type="button"
                                            onClick={() => setRole('mitra')}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                role === 'mitra'
                                                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                            <span>Mitra Logistik</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('klien')}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                role === 'klien'
                                                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">apartment</span>
                                            <span>Klien &amp; Proyek</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Role Instruction Notice */}
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/60 text-xs text-brand-900">
                                    <span className="material-symbols-outlined text-brand-600 text-[20px] shrink-0">
                                        {role === 'mitra' ? 'local_shipping' : 'corporate_fare'}
                                    </span>
                                    <span>
                                        {role === 'mitra'
                                            ? 'Akses pengemudi, armada vendor, dan pengelola gudang Maitri Logistik.'
                                            : 'Portal khusus klien interior, pimpinan proyek, dan arsitek penanggung jawab.'}
                                    </span>
                                </div>

                                {/* Real Inertia Login Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    {/* Email / Identifier Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="email" className="text-xs font-bold text-slate-800">
                                                {role === 'mitra'
                                                    ? 'Nomor Telepon atau Email Terdaftar'
                                                    : 'Email Korporat / Akun Klien'}
                                            </label>
                                            <span className="text-[11px] text-slate-400">Wajib diisi</span>
                                        </div>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400 material-symbols-outlined text-[20px] pointer-events-none">
                                                account_circle
                                            </span>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                autoComplete="username"
                                                required
                                                placeholder={
                                                    role === 'mitra'
                                                        ? 'nama@mitralogistik.com atau email terdaftar'
                                                        : 'nama@perusahaan.com'
                                                }
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full h-11 pl-10 pr-4 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border transition-all ${
                                                    errors.email
                                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                                                        : 'border-slate-300 focus:border-brand-600 focus:ring-brand-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[16px]">error</span>
                                                <span>{errors.email}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Password / PIN Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="text-xs font-bold text-slate-800">
                                                {role === 'mitra'
                                                    ? 'PIN Operasional / Kata Sandi'
                                                    : 'Kata Sandi Akun Proyek'}
                                            </label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                                                >
                                                    Lupa Kata Sandi?
                                                </Link>
                                            )}
                                        </div>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400 material-symbols-outlined text-[20px] pointer-events-none">
                                                key
                                            </span>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                autoComplete="current-password"
                                                required
                                                placeholder="Ketik kata sandi akun Anda"
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`w-full h-11 pl-10 pr-11 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border transition-all ${
                                                    errors.password
                                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                                                        : 'border-slate-300 focus:border-brand-600 focus:ring-brand-200'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Tampilkan atau sembunyikan kata sandi"
                                                className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[16px]">error</span>
                                                <span>{errors.password}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Persistence and Device Session */}
                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                                            />
                                            <span className="text-xs text-slate-600 font-medium">
                                                Ingat saya di perangkat ini
                                            </span>
                                        </label>
                                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                            <span>Sesi 30 Hari</span>
                                        </span>
                                    </div>

                                    {/* Primary Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-12 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/25 hover:shadow-brand-600/40 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer mt-3"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>Memverifikasi Akses...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Masuk ke Portal Resmi</span>
                                                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                                                    arrow_forward
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Alternative Fast Authentication Flow */}
                                <div className="space-y-4 pt-1">
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-full h-px bg-slate-200"></div>
                                        <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            atau masuk instan dengan
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* WhatsApp OTP */}
                                        <button
                                            type="button"
                                            onClick={() => handleFastAuth('wa')}
                                            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-slate-700 text-xs font-bold shadow-2xs hover:border-slate-300"
                                        >
                                            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                                                chat
                                            </span>
                                            <span className="truncate">WhatsApp OTP</span>
                                        </button>

                                        {/* Google Workspace SSO */}
                                        <button
                                            type="button"
                                            onClick={() => handleFastAuth('google')}
                                            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-slate-700 text-xs font-bold shadow-2xs hover:border-slate-300"
                                        >
                                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            <span className="truncate">Google Workspace</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Registration CTA */}
                                <div className="text-center pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        Belum memiliki akun akses terdaftar?{' '}
                                        <Link
                                            href={route('register')}
                                            className="text-brand-600 hover:text-brand-700 font-bold ml-1 transition-colors"
                                        >
                                            Daftar Kemitraan Baru
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200/50 px-3 py-1 rounded-full text-xs font-semibold text-brand-800">
                            <span className="material-symbols-outlined text-[16px] text-brand-600">lock</span>
                            <span>256-Bit SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200/50 px-3 py-1 rounded-full text-xs font-semibold text-brand-800">
                            <span className="material-symbols-outlined text-[16px] text-brand-600">verified_user</span>
                            <span>ISO 9001 Certified</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                        <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
                        <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
                        <span className="text-slate-400">© 2026 PT Maitri Perkasa Indonesia. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
