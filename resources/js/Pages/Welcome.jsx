import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const TRUCK_TYPES = [
    {
        id: 'wingbox',
        name: 'Tronton Wingbox',
        capacity: 'Kapasitas 20 Ton / 45 m³',
        basePrice: 4500000,
        fullName: 'Tronton Wingbox (45 m³ / 20 Ton)',
    },
    {
        id: 'trailer',
        name: 'Trailer 40ft',
        capacity: 'Container / Flatbed 32 Ton',
        basePrice: 5500000,
        fullName: 'Trailer 40ft (Container / Flatbed)',
    },
    {
        id: 'reefer',
        name: 'Box Reefer Dingin',
        capacity: 'Frozen Food / Makanan Segar',
        basePrice: 4800000,
        fullName: 'Box Pendingin / Reefer (-20°C)',
    },
    {
        id: 'cdd',
        name: 'Engkel CDD Long',
        capacity: 'Kapasitas 5 Ton / Distribusi Kota',
        basePrice: 2200000,
        fullName: 'Engkel CDD Long Box (5 Ton)',
    },
];

const ROUTE_OPTIONS = [
    { value: '1.0', label: 'Jabodetabek & Sekitarnya' },
    { value: '1.6', label: 'Jawa - Bali (Lintas Jalur Tol)' },
    { value: '2.3', label: 'Trans Sumatra Koridor' },
    { value: '3.1', label: 'Antar Pulau Luar Jawa' },
];

const DURATION_OPTIONS = [
    { value: 'trip', label: 'Per Trip / Harian' },
    { value: 'bulan', label: 'Sewa Bulanan (Hemat 15%)' },
    { value: 'tahun', label: 'Kontrak Tahunan Terpadu' },
];

const SPACE_TYPES = [
    {
        id: 'kantor',
        name: 'Kantor Korporasi',
        desc: 'Workspace, Ruang Rapat & Lobby',
        multiplier: 1.15,
        fullName: 'Kantor Korporasi / Co-working',
    },
    {
        id: 'hunian',
        name: 'Hunian / Rumah Tinggal',
        desc: 'Apartemen, Villa & Rumah Pribadi',
        multiplier: 1.0,
        fullName: 'Hunian / Rumah Tinggal',
    },
    {
        id: 'retail',
        name: 'Retail & Kafe / Resto',
        desc: 'Display Komersial & Dining Area',
        multiplier: 1.25,
        fullName: 'Toko / Retail & Kafe',
    },
    {
        id: 'hub',
        name: 'Gudang & Hub Logistik',
        desc: 'Fasilitas Pergudangan & Pos Kontrol',
        multiplier: 0.95,
        fullName: 'Gudang & Hub Logistik',
    },
];

const INTERIOR_PACKAGES = [
    { value: 'konsep', label: 'Konsultasi Konsep & 3D Rendering (Mulai Rp 150rb/m²)' },
    { value: 'komplit', label: 'Full Desain + Gambar Kerja Teknis (DED) & RAB Detail (Rp 280rb/m²)' },
    { value: 'build', label: 'Paket Design & Build (All-In dari Gambar hingga Jadi)' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    // Tab State
    const [calcTab, setCalcTab] = useState('truk');

    // Truck Calculator State
    const [selectedTruck, setSelectedTruck] = useState(TRUCK_TYPES[0]);
    const [selectedRoute, setSelectedRoute] = useState(ROUTE_OPTIONS[1].value);
    const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1].value);
    const [trukNama, setTrukNama] = useState('');
    const [trukWa, setTrukWa] = useState('');

    // Interior Calculator State
    const [selectedSpace, setSelectedSpace] = useState(SPACE_TYPES[0]);
    const [interiorLuas, setInteriorLuas] = useState(120);
    const [interiorPaket, setInteriorPaket] = useState('komplit');
    const [interiorNama, setInteriorNama] = useState('');
    const [interiorWa, setInteriorWa] = useState('');

    // Calculations: Truck
    const truckCalculation = useMemo(() => {
        const ruteVal = parseFloat(selectedRoute);
        let finalPrice = 0;
        let note = '';

        if (selectedDuration === 'trip') {
            finalPrice = selectedTruck.basePrice * ruteVal;
            note = 'Estimasi per 1 trip perjalanan (termasuk tol & sopir).';
        } else if (selectedDuration === 'bulan') {
            finalPrice = selectedTruck.basePrice * 6.5 * (ruteVal * 0.9);
            note = 'Estimasi sewa bulanan, sudah termasuk diskon kontrak 15% & servis.';
        } else {
            finalPrice = selectedTruck.basePrice * 70 * (ruteVal * 0.85);
            note = 'Kontrak tahunan terpadu dengan SLA armada pengganti 24 jam.';
        }

        return {
            totalFormatted: 'Rp ' + Math.round(finalPrice).toLocaleString('id-ID'),
            note,
        };
    }, [selectedTruck, selectedRoute, selectedDuration]);

    // Calculations: Interior
    const interiorCalculation = useMemo(() => {
        let baseM2 = 280000;
        let waktuText = '3 - 4 Minggu';

        if (interiorPaket === 'konsep') {
            baseM2 = 150000;
            waktuText = '1 - 2 Minggu';
        } else if (interiorPaket === 'build') {
            baseM2 = 3500000;
            waktuText = '6 - 10 Minggu';
        } else {
            baseM2 = 280000;
            waktuText = interiorLuas > 300 ? '4 - 6 Minggu' : '3 - 4 Minggu';
        }

        const total = interiorLuas * baseM2 * selectedSpace.multiplier;

        return {
            totalFormatted: 'Rp ' + Math.round(total).toLocaleString('id-ID'),
            waktuText,
        };
    }, [selectedSpace, interiorLuas, interiorPaket]);

    // WhatsApp Dispatch Handlers
    const handleSendTruckWA = (e) => {
        e.preventDefault();
        const nama = trukNama.trim() || 'Calon Klien';
        const wa = trukWa.trim() || '-';
        const ruteObj = ROUTE_OPTIONS.find((r) => r.value === selectedRoute);
        const durasiObj = DURATION_OPTIONS.find((d) => d.value === selectedDuration);

        const message = `Halo Maitri Company, saya ingin pesan/sewa truk:\n\n- Nama: ${nama}\n- WhatsApp: ${wa}\n- Jenis Unit: ${selectedTruck.fullName}\n- Rute: ${ruteObj?.label || selectedRoute}\n- Durasi: ${durasiObj?.label || selectedDuration}\n- Estimasi Web: ${truckCalculation.totalFormatted}\n\nMohon informasi ketersediaan unit dan jadwalnya. Terima kasih.`;
        window.open(`https://wa.me/628119000123?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleSendInteriorWA = (e) => {
        e.preventDefault();
        const nama = interiorNama.trim() || 'Calon Klien';
        const wa = interiorWa.trim() || '-';
        const paketObj = INTERIOR_PACKAGES.find((p) => p.value === interiorPaket);

        const message = `Halo Maitri Company, saya ingin konsultasi/survey proyek interior:\n\n- Nama: ${nama}\n- WhatsApp: ${wa}\n- Tipe Ruang: ${selectedSpace.fullName}\n- Luas: ${interiorLuas} m²\n- Paket: ${paketObj?.label || interiorPaket}\n- Estimasi Web: ${interiorCalculation.totalFormatted}\n\nMohon jadwal untuk survey lokasi atau konsultasi konsep. Terima kasih.`;
        window.open(`https://wa.me/628119000123?text=${encodeURIComponent(message)}`, '_blank');
    };

    const scrollToCalc = (mode) => {
        setCalcTab(mode);
        const el = document.getElementById('kalkulator-pemesanan');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head>
                <title>Maitri Company — Layanan Sewa Truk Niaga & Studio Desain Interior</title>
            </Head>

            <div className="bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-brand-600 selection:text-white min-h-screen">
                {/* TOP BAR INFO & WHATSAPP QUICK ACCESS */}
                <div className="bg-brand-900 text-white text-xs py-2 px-4 border-b border-brand-800">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                Unit Siap Jalan &amp; Tim Desain Siaga
                            </span>
                            <span className="text-slate-200">
                                Solusi Sewa Truk Logistik &amp; Perancangan Ruang Berkualitas
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                            <a
                                href="tel:+622158904100"
                                className="hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[15px] text-cyan-300">call</span>
                                <span>(021) 5890-4100</span>
                            </a>
                            <span className="text-slate-600">|</span>
                            <a
                                href="https://wa.me/628119000123"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-white flex items-center gap-1 text-emerald-300 font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[15px]">chat</span>
                                <span>WhatsApp Hotline: 0811-9000-123</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* MAIN NAVIGATION */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                        {/* Logo Maitri Company */}
                        <a href="#" className="flex items-center gap-3 group">
                            <img
                                src="/images/maitricomplogo.png"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2AyTy_956YsCyDzbyJyxe_WMQ28JTgDJLi0bCf71kyK1CcShfFI2BUBDEmkmTGQDQ9FBrUaDjdD4luuaxdkn3iymsEEo5-LXiv8V-xC7YER6Fsh0yeQTfqRVe5o1Bhi4rA3AwsvC4nu46PMcb7VH35xojVP3uMDP5nk9BMJyT-t397tP4LsKE-Xpcyr8Ydci7nErbBd9nbTaljxyyWQtUI2Ep5aBTYMM4zXCWCECQ79tx7kdlKpClQg14NAZ34hWZww';
                                }}
                                alt="Maitri Company Logo"
                                className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                                    MAITRI <span className="text-brand-600">COMPANY</span>
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
                                    Armada Niaga &amp; Studio Desain
                                </span>
                            </div>
                        </a>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1">
                            <a
                                href="#layanan-truk"
                                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Layanan Truk
                            </a>
                            <a
                                href="#desain-interior"
                                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Desain Interior
                            </a>
                            <a
                                href="#kalkulator-pemesanan"
                                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Cek Estimasi Biaya
                            </a>
                            <a
                                href="#cara-kerja"
                                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Alur Pemesanan
                            </a>
                            <a
                                href="#testimoni"
                                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Testimoni Klien
                            </a>
                        </nav>

                        {/* CTA & Auth Action */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => scrollToCalc('truk')}
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
                            >
                                Simulasi Biaya
                            </button>

                            <a
                                href="https://wa.me/628119000123?text=Halo%20Maitri%20Company,%20saya%20tertarik%20dengan%20layanan%20Anda"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm hover:shadow transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                <span>Hubungi Sales</span>
                            </a>

                            {/* Optional Auth Link */}
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="hidden md:inline-flex text-xs font-semibold px-3 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="hidden md:inline-flex text-xs font-semibold px-3 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                                    >
                                        Log In
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </header>

                {/* HERO SECTION: LIVELY, CLEAN, COMMERCIAL */}
                <section className="relative bg-gradient-to-b from-white via-blue-50/40 to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                            {/* Live Status Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-xs mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
                                <span className="text-xs font-semibold text-brand-800 tracking-wide">
                                    Penyedia Armada Truk Terpercaya &amp; Jasa Desain Interior Profesional
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                                Solusi Cepat <span className="text-brand-600">Sewa Truk Niaga</span> &amp; <br className="hidden sm:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-cyanAccent">
                                    Desain Interior Arsitektur
                                </span>{' '}
                                Berkualitas
                            </h1>

                            {/* Subheadline */}
                            <p className="mt-6 text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl">
                                Maitri Company memberikan kemudahan akses armada sewa truk tangguh bagi para pengemudi dan pelaku usaha logistik, berdampingan dengan layanan desain interior dan arsitektur bergaransi dengan visualisasi 3D realistis serta estimasi biaya yang transparan.
                            </p>

                            {/* Direct Fast-Booking Actions */}
                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => scrollToCalc('truk')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                    <span>Pesan Sewa Truk Sekarang</span>
                                </button>
                                <button
                                    onClick={() => scrollToCalc('interior')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm hover:border-slate-400 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-brand-600">apartment</span>
                                    <span>Konsultasi Desain Interior</span>
                                </button>
                            </div>

                            {/* Social Proof Stats Badges */}
                            <div className="mt-14 w-full grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-200/80">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[26px]">local_shipping</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-extrabold text-slate-900 leading-none">520+</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Armada Truk Siap Jalan</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[26px]">draw</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-extrabold text-slate-900 leading-none">140+</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Proyek Interior Selesai</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[26px]">star</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-extrabold text-slate-900 leading-none">4.9 / 5.0</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Kepuasan Pelanggan</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[26px]">verified_user</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-extrabold text-slate-900 leading-none">24/7</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Pelayanan &amp; GPS Aktif</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: DUA JALUR LAYANAN UTAMA (PATHWAYS) */}
                <section className="py-16 bg-white border-b border-slate-200" id="layanan-utama">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                                Dua Layanan Utama
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
                                Layanan Profesional untuk Kebutuhan Mobilitas &amp; Ruang Anda
                            </h2>
                            <p className="text-slate-600 mt-2 text-sm sm:text-base">
                                Pilih jalur layanan yang Anda butuhkan dan nikmati proses pengerjaan yang praktis, transparan, dan bergaransi resmi.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {/* Pathway A: Armada Truk Niaga */}
                            <div
                                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                                id="layanan-truk"
                            >
                                <div>
                                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-200">
                                        <img
                                            src="https://lh3.googleusercontent.com/aida/AEtjO1USwvLPd87suyzP4RHsQSjhR6OiD1Q3TnhHmHjbwB1GZ_koyBaqQIx8NCB0ZFnGJUNNzSBVuSv2yU1STk0VT4GCnEHHKr7G2ON4P1VQn6fDkbwyeL37vHcyiCz5SasrhYG72tMo5SeN2uOpRByQyzWLpCPmrmCdCgGuI7iQWC6pOm7kT5mWQRXWrhyznNPIrKFEVAiO5MX5e7peThiYylZHBTKldoX7cgz8yIIreTUoYrHQ4yoRaWw4Gg4"
                                            alt="Armada Truk Niaga Maitri Company"
                                            className="w-full h-full object-cover object-center"
                                        />
                                        <div className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                                            <span>Divisi Armada Logistik</span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                                            Unit Prima &amp; Terawat Teratur
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                            Sewa &amp; Kemitraan Truk Niaga
                                        </h3>
                                        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                                            Menyediakan unit truk kelas berat (Tronton Wingbox, Trailer 40ft, Box Reefer Pendingin, CDD Long) untuk ekspedisi antar kota, pabrik, distributor, maupun kemitraan pengemudi mandiri.
                                        </p>

                                        {/* Value Props Bullet Points */}
                                        <ul className="mt-6 space-y-3 text-sm text-slate-700">
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Skema Sewa Fleksibel:</strong> Sewa per trip harian, bulanan, atau kontrak korporasi tahunan.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Kondisi Mesin Terjamin:</strong> Perawatan mesin berkala di pool resmi berstandar tinggi.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Asuransi &amp; GPS 24 Jam:</strong> Pelacakan posisi kargo real-time dan perlindungan menyeluruh.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Pemberdayaan Mitra Pengemudi:</strong> Skema kepemilikan unit ramah anggaran tanpa beban awal berlebih.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2">
                                    <button
                                        onClick={() => scrollToCalc('truk')}
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all"
                                    >
                                        <span>Pesan Sewa Truk Sekarang</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>

                            {/* Pathway B: Desain Interior & Arsitektur */}
                            <div
                                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                                id="desain-interior"
                            >
                                <div>
                                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-200">
                                        <img
                                            src="https://lh3.googleusercontent.com/aida/AEtjO1XW-O3ZLfwqrdCZRMi2F5p9DSG8z45vVd1tfigDkeYMlw40ryPKMcZbVNE9Oemx4KaNEoRf50DHcik6sZd9I4JhgHTKQgluQOi-vCpb6sxWTon1lxFozyN0uGmAPppP2b6cQJ6rHE9RaDbp1CJHN8T7xY78XvTo6H9_K4V_23lVkLX-PyVSUra31Yd2mM-Ej2Q9GbvdDv4WcfTMhRHMsp4xYmHvQoq5jtbUGyGjrMhIB5xaMt_-yswosQ"
                                            alt="Studio Rancang Bangun Maitri Company"
                                            className="w-full h-full object-cover object-center"
                                        />
                                        <div className="absolute top-4 left-4 bg-cyan-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">apartment</span>
                                            <span>Divisi Studio Spasial</span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                                            Visual 3D Fotorealistis &amp; RAB Terbuka
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                            Desain Interior &amp; Rancang Bangun
                                        </h3>
                                        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                                            Studio perancangan interior hunian modern, kantor korporasi, toko retail, dan bangunan komersial yang memadukan keindahan kontemporer, kenyamanan fungsi, serta efisiensi anggaran.
                                        </p>

                                        {/* Value Props Bullet Points */}
                                        <ul className="mt-6 space-y-3 text-sm text-slate-700">
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Visualisasi 3D Realistis:</strong> Preview ruangan mendetail sebelum proyek mulai dikerjakan di lapangan.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>RAB Transparan &amp; Terperinci:</strong> Rincian spesifikasi material dan biaya transparan tanpa markup tersembunyi.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Solusi Design &amp; Build:</strong> Kami melayani dari pembuatan gambar teknis (DED) hingga instalasi furnitur.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2.5">
                                                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                                                    check_circle
                                                </span>
                                                <span>
                                                    <strong>Garansi Pengerjaan:</strong> Supervisi teratur untuk memastikan hasil fisik sesuai konsep rendering.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2">
                                    <button
                                        onClick={() => scrollToCalc('interior')}
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all"
                                    >
                                        <span>Booking Konsultasi Interior</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: QUICK BOOKING & ESTIMATION ENGINE (INTERACTIVE UX) */}
                <section className="py-16 bg-slate-100/80 border-b border-slate-200" id="kalkulator-pemesanan">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
                                Estimasi Instan &amp; Pemesanan Cepat
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                                Kalkulator Biaya &amp; Formulir Booking
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Dapatkan simulasi biaya transparan hanya dalam hitungan detik dan hubungkan langsung dengan tim operasional Maitri Company.
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-white p-1.5 rounded-xl border border-slate-300 shadow-xs">
                                <button
                                    type="button"
                                    onClick={() => setCalcTab('truk')}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                        calcTab === 'truk'
                                            ? 'bg-brand-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                    <span>Pesan / Sewa Truk</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalcTab('interior')}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                        calcTab === 'interior'
                                            ? 'bg-brand-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">domain</span>
                                    <span>Jasa Desain Interior</span>
                                </button>
                            </div>
                        </div>

                        {/* CALCULATOR CARD CONTAINER */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
                            {/* MODULE 1: FORM SEWA TRUK */}
                            {calcTab === 'truk' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    <div className="lg:col-span-7 space-y-5">
                                        <div className="border-b border-slate-100 pb-3">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                Konfigurasi Sewa Armada Truk
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Pilih jenis unit armada, rute jangkauan pengiriman, dan skema durasi kebutuhan Anda.
                                            </p>
                                        </div>

                                        {/* Pilih Jenis Truk */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Pilih Jenis Truk
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                {TRUCK_TYPES.map((truck) => {
                                                    const isSelected = selectedTruck.id === truck.id;
                                                    return (
                                                        <button
                                                            key={truck.id}
                                                            type="button"
                                                            onClick={() => setSelectedTruck(truck)}
                                                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                                                isSelected
                                                                    ? 'border-brand-600 bg-blue-50/70 text-brand-900'
                                                                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                                                            }`}
                                                        >
                                                            <div className="font-bold text-sm">{truck.name}</div>
                                                            <div className="text-slate-500 text-[11px] mt-0.5">
                                                                {truck.capacity}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Rute dan Durasi Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                    Rute Pengiriman
                                                </label>
                                                <select
                                                    value={selectedRoute}
                                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                                    className="w-full text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 bg-slate-50 p-2.5"
                                                >
                                                    {ROUTE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                    Skema Durasi Sewa
                                                </label>
                                                <select
                                                    value={selectedDuration}
                                                    onChange={(e) => setSelectedDuration(e.target.value)}
                                                    className="w-full text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 bg-slate-50 p-2.5"
                                                >
                                                    {DURATION_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Kontak Cepat Nama & WhatsApp */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Kontak Pemesan Cepat
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={trukNama}
                                                    onChange={(e) => setTrukNama(e.target.value)}
                                                    placeholder="Nama Anda / Perusahaan"
                                                    className="text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 p-2.5 border"
                                                />
                                                <input
                                                    type="tel"
                                                    value={trukWa}
                                                    onChange={(e) => setTrukWa(e.target.value)}
                                                    placeholder="Nomor WhatsApp (Contoh: 0812xxx)"
                                                    className="text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 p-2.5 border"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Output Panel Truk */}
                                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Ringkasan Estimasi Biaya
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                                    Tarif Resmi Terbuka
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Unit Terpilih:</span>
                                                    <span className="font-bold text-slate-900 text-right">
                                                        {selectedTruck.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Status Kondisi:</span>
                                                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{' '}
                                                        Siap Jalan
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Fasilitas Termasuk:</span>
                                                    <span className="font-medium text-slate-700 text-right">
                                                        Live GPS + Asuransi Muatan
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-6 p-4 rounded-xl bg-white border border-blue-200 shadow-2xs">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                                    Perkiraan Biaya Transparan
                                                </div>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-3xl font-extrabold text-brand-700">
                                                        {truckCalculation.totalFormatted}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    {truckCalculation.note}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={handleSendTruckWA}
                                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                                <span>Kirim Pemesanan via WhatsApp</span>
                                            </button>
                                            <div className="text-center mt-2 text-[11px] text-slate-400">
                                                Tim Dispatch Maitri Company akan membalas dalam ±5 menit.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODULE 2: FORM DESAIN INTERIOR & ARSITEKTUR */}
                            {calcTab === 'interior' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    <div className="lg:col-span-7 space-y-5">
                                        <div className="border-b border-slate-100 pb-3">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                Kalkulasi Proyek Desain &amp; Bangun
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Rencanakan kebutuhan ruang interior hunian, kantor korporat, atau ruang usaha Anda.
                                            </p>
                                        </div>

                                        {/* Tipe Ruang */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Tipe Properti / Ruangan
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                {SPACE_TYPES.map((space) => {
                                                    const isSelected = selectedSpace.id === space.id;
                                                    return (
                                                        <button
                                                            key={space.id}
                                                            type="button"
                                                            onClick={() => setSelectedSpace(space)}
                                                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                                                isSelected
                                                                    ? 'border-brand-600 bg-blue-50/70 text-brand-900'
                                                                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                                                            }`}
                                                        >
                                                            <div className="font-bold text-sm">{space.name}</div>
                                                            <div className="text-slate-500 text-[11px] mt-0.5">
                                                                {space.desc}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Slider Luas Area */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Perkiraan Luas Area (m²)
                                                </label>
                                                <span className="text-sm font-extrabold text-brand-700">
                                                    {interiorLuas} m²
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="1500"
                                                step="10"
                                                value={interiorLuas}
                                                onChange={(e) => setInteriorLuas(parseInt(e.target.value, 10))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                            />
                                            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                                                <span>30 m² (Ruang Kecil)</span>
                                                <span>500 m² (Kantor Sedang)</span>
                                                <span>1.500 m² (Kawasan Terpadu)</span>
                                            </div>
                                        </div>

                                        {/* Paket Layanan */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Paket Layanan yang Diharapkan
                                            </label>
                                            <select
                                                value={interiorPaket}
                                                onChange={(e) => setInteriorPaket(e.target.value)}
                                                className="w-full text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 bg-slate-50 p-2.5"
                                            >
                                                {INTERIOR_PACKAGES.map((pkg) => (
                                                    <option key={pkg.value} value={pkg.value}>
                                                        {pkg.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Kontak Cepat Nama & WhatsApp */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Kontak untuk Jadwal Survey / Diskusi
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={interiorNama}
                                                    onChange={(e) => setInteriorNama(e.target.value)}
                                                    placeholder="Nama Lengkap Anda"
                                                    className="text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 p-2.5 border"
                                                />
                                                <input
                                                    type="tel"
                                                    value={interiorWa}
                                                    onChange={(e) => setInteriorWa(e.target.value)}
                                                    placeholder="Nomor WhatsApp Aktif"
                                                    className="text-sm rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600 p-2.5 border"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Output Panel Interior */}
                                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    Estimasi Desain &amp; Waktu
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                                                    Studio Maitri
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Tipe Ruangan:</span>
                                                    <span className="font-bold text-slate-900 text-right">
                                                        {selectedSpace.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Estimasi Waktu Pengerjaan:</span>
                                                    <span className="font-semibold text-brand-700">
                                                        {interiorCalculation.waktuText}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Revisi Desain 3D:</span>
                                                    <span className="font-medium text-slate-700">
                                                        Hingga 3x Revisi Mayor
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-6 p-4 rounded-xl bg-white border border-indigo-200 shadow-2xs">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                                    Estimasi Anggaran Jasa Desain
                                                </div>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-3xl font-extrabold text-slate-900">
                                                        {interiorCalculation.totalFormatted}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    Termasuk konsep 3D fotorealistis, layout tata letak, gambar kerja MEP, dan RAB.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={handleSendInteriorWA}
                                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                                <span>Jadwalkan Survey Lokasi / Konsultasi</span>
                                            </button>
                                            <div className="text-center mt-2 text-[11px] text-slate-400">
                                                Tim Arsitek Maitri siap berkunjung dan berdiskusi langsung ke lokasi Anda.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION 4: CARA PEMESANAN (3 LANGKAH MUDAH) */}
                <section className="py-16 bg-white border-b border-slate-200" id="cara-kerja">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                Alur Praktis
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                                3 Langkah Mudah Bekerja Bersama Maitri
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Kami memangkas birokrasi berbelit agar kebutuhan armada atau renovasi interior Anda segera terwujud tepat waktu.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Step 1 */}
                            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 relative">
                                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs mb-5">
                                    01
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Pilih Layanan &amp; Konsultasi Kebutuhan
                                </h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    Pilih sewa armada truk atau rancang interior melalui website, atau hubungi via WhatsApp untuk menyampaikan rute logistik maupun denah ruangan Anda.
                                </p>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                                    <span>Respon Cepat &lt; 15 Menit</span>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 relative">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shadow-xs mb-5">
                                    02
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Konfirmasi Unit atau Review Desain 3D
                                </h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    Dapatkan kepastian unit truk siap jalan, atau diskusikan draft 3D visual serta rincian RAB transparan bersama arsitek spesialis kami.
                                </p>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                    <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                                    <span>RAB &amp; Kontrak Resmi Terbuka</span>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 relative">
                                <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs mb-5">
                                    03
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Armada Meluncur / Pekerjaan Dimulai
                                </h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    Truk bergerak menjemput kargo dengan live tracking GPS, atau tim konstruksi interior memulai pekerjaan di lokasi dengan supervisi berkala tanpa molor.
                                </p>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                    <span>Garansi Tepat Waktu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: REAL TESTIMONIALS & TRUST PILLARS */}
                <section className="py-16 bg-slate-50 border-b border-slate-200" id="testimoni">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
                                Kepercayaan Nyata
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                                Cerita dari Mitra Pengemudi &amp; Klien Desain Kami
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Kami bangga menjadi bagian dari kesuksesan ratusan perjalanan logistik dan transformasi ruang di Indonesia.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Testi 1 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        "Skema sewa kemitraan truk di Maitri Company sangat manusiawi untuk pengemudi seperti saya. Truk terawat dengan baik, servis gratis di pool, dan muatan rutin selalu ada. Sangat membantu keluarga."
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                                        BP
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">Bambang Prayitno</div>
                                        <div className="text-xs text-slate-500">Mitra Pengemudi Tronton (Jawa Timur)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Testi 2 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        "Desain interior kantor kami selesai tepat 4 minggu sesuai kesepakatan awal. Hasil 3D rendering-nya persis dengan aslinya ketika dibangun. Karyawan merasa jauh lebih nyaman dan produktif."
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                                        CL
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">Clarissa Lim</div>
                                        <div className="text-xs text-slate-500">Direktur Operasional Fintech (Jakarta Selatan)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Testi 3 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        "Paling suka dengan sistem live GPS dan asuransinya. Pengiriman bahan baku beku dengan truk reefer Maitri selalu terpantau suhunya dan tiba aman tanpa komplain dari tim gudang kami."
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                                        HN
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">Hendra Nugroho</div>
                                        <div className="text-xs text-slate-500">Supply Chain Manager (Surabaya)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: FAQ ACCORDION */}
                <section className="py-16 bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                Pertanyaan Umum
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                                Seputar Layanan Maitri Company
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <details className="group bg-slate-50 p-5 rounded-xl border border-slate-200 open:bg-white transition-all cursor-pointer">
                                <summary className="flex justify-between items-center font-bold text-slate-900 list-none text-base">
                                    <span>Bagaimana cara memesan truk sewa untuk kebutuhan mendadak?</span>
                                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                        expand_more
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                    Anda dapat langsung menggunakan formulir simulasi biaya di atas atau menekan tombol WhatsApp Hotline kami. Tim dispatch kami siaga 24 jam untuk memverifikasi ketersediaan armada terdekat dalam waktu maksimal 15-30 menit.
                                </p>
                            </details>

                            <details className="group bg-slate-50 p-5 rounded-xl border border-slate-200 open:bg-white transition-all cursor-pointer">
                                <summary className="flex justify-between items-center font-bold text-slate-900 list-none text-base">
                                    <span>Apakah ada survey lokasi gratis untuk proyek desain interior?</span>
                                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                        expand_more
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                    Ya, untuk wilayah Jabodetabek dan kota-kota besar di Pulau Jawa, tim arsitek kami menyediakan sesi survey lokasi awal secara cuma-cuma untuk mengukur ruangan dan berdiskusi langsung mengenai konsep yang Anda inginkan.
                                </p>
                            </details>

                            <details className="group bg-slate-50 p-5 rounded-xl border border-slate-200 open:bg-white transition-all cursor-pointer">
                                <summary className="flex justify-between items-center font-bold text-slate-900 list-none text-base">
                                    <span>Bagaimana jaminan keamanan muatan pada divisi logistik?</span>
                                    <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                        expand_more
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                    Setiap perjalanan dilindungi oleh asuransi muatan komersial menyeluruh, segel digital, serta perangkat telemetri GPS ganda yang dapat dipantau langsung oleh pengirim barang selama 24 jam penuh.
                                </p>
                            </details>
                        </div>
                    </div>
                </section>

                {/* SECTION 7: DIRECT CTA BANNER */}
                <section className="py-16 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30">
                            Konsultasi &amp; Respon Cepat
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Siap Memulai Kebutuhan Armada atau Rancang Ruang Anda?
                        </h2>
                        <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                            Tim ahli Maitri Company siap membantu memberikan solusi armada terbaik dan penataan interior ruang yang memukau dengan penawaran harga paling transparan.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/628119000123?text=Halo%20Maitri%20Company,%20saya%20ingin%20berkonsultasi"
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                <span>Chat WhatsApp Sekarang (24 Jam)</span>
                            </a>
                            <a
                                href="tel:+622158904100"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">call</span>
                                <span>Telepon: (021) 5890-4100</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-white text-slate-600 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
                            {/* Brand Info */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/images/maitricomplogo.png"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC84wWX0IEY03lZgfPBgQswcNEYUzFQTUDArcjWe8IFW8lbzxoOdJE-8F_criOShTD349ekkI81BBq2hHg8UFRonPyNH0MJNOZ7dXInLZUTDEhPfBve4NWGRLqtfQuWvPglyq1pEy7jF1kFIHRrKYBo1DnEK-c2XzjNEnAw3Wsrn-F0fEA2QPiGndGUrysMch4ZAXaSHpk5EMwwkRbc7m1wu0dheJwAA0l9X8MpUgu-Txi-ToF9CKZ5GJ17zvHOVxI_mw';
                                        }}
                                        alt="Maitri Company Logo"
                                        className="h-9 w-auto object-contain"
                                    />
                                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                                        MAITRI <span className="text-brand-600">COMPANY</span>
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                                    Mitra strategis mobilitas angkutan niaga berstandar tinggi dan studio rancang interior arsitektur kontemporer terpercaya di Indonesia.
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                        <span className="material-symbols-outlined text-[16px]">verified</span> Terdaftar Resmi
                                    </span>
                                    <span>&bull;</span>
                                    <span>NIB: 9120004810294</span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="lg:col-span-3 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Layanan Unggulan
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#layanan-truk" className="hover:text-brand-600 transition-colors">
                                            Sewa Truk Tronton Wingbox
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#layanan-truk" className="hover:text-brand-600 transition-colors">
                                            Sewa Trailer 40ft &amp; Flatbed
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#layanan-truk" className="hover:text-brand-600 transition-colors">
                                            Box Pendingin (Reefer Cargo)
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#desain-interior" className="hover:text-brand-600 transition-colors">
                                            Desain Interior Kantor Korporat
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#desain-interior" className="hover:text-brand-600 transition-colors">
                                            Rancang Bangun Residensial
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Office & Contact */}
                            <div className="lg:col-span-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Kantor Pusat &amp; Pool Logistik
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Maitri Tower, Lantai 12<br />
                                    Kawasan Mega Kuningan, Jakarta Selatan 12950<br />
                                    Indonesia
                                </p>
                                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-brand-600">phone</span>
                                        <span>(021) 5890-4100</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                                        <span>WhatsApp: 0811-9000-123</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-slate-500">mail</span>
                                        <span>kontak@maitri.co.id</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                            <p>&copy; {new Date().getFullYear()} Maitri Company. Seluruh hak cipta dilindungi.</p>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-slate-800 transition-colors">
                                    Syarat &amp; Ketentuan Sewa
                                </a>
                                <a href="#" className="hover:text-slate-800 transition-colors">
                                    Kebijakan Privasi
                                </a>
                                <a href="#" className="hover:text-slate-800 transition-colors">
                                    Standard Mutu ISO
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
