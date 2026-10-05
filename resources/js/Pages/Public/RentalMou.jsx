import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function RentalMou({ rental, categories = [] }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const licenseLabels = {
        driving: 'Driving License',
        trucker: 'Heavy Truck License',
        lumber: 'Lumberjack License',
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 py-6 sm:py-10 px-3 sm:px-6 font-sans print:bg-white print:p-0 print:text-black">
            <Head title={`MoU Sewa Truk #${rental.id} - ${rental.renter_name} | Maitri Company`} />

            {/* Floating Action Bar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200/90 print:hidden">
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        M
                    </span>
                    <div>
                        <div className="text-xs font-black text-slate-900 leading-tight">
                            Dokumen Resmi MoU Sewa Truk
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            {rental.contract_number}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-300/70 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px] text-slate-600">
                            {copied ? 'check' : 'content_copy'}
                        </span>
                        <span>{copied ? 'Link Tersalin!' : 'Salin Link MoU'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Cetak / Simpan PDF</span>
                    </button>
                </div>
            </div>

            {/* Official Document Paper Container */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-10 md:p-12 space-y-6 sm:space-y-7 print:shadow-none print:border-none print:p-4 print:rounded-none">
                {/* 1. DOCUMENT HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900">
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                            <span>MAITRI COMPANY</span>
                        </div>
                        <div className="text-xs font-extrabold uppercase tracking-widest text-brand-700 mt-0.5">
                            HEAVY HAULAGE &amp; TRUCK RENTAL SERVICES
                        </div>
                    </div>

                    <div className="text-[11px] sm:text-right space-y-0.5 text-slate-600">
                        <div>
                            No. Dokumen: <strong className="font-mono text-slate-900">{rental.contract_number}</strong>
                        </div>
                        <div>
                            Lokasi Server: <strong className="text-slate-900">SA-MP Roleplay Server</strong>
                        </div>
                        <div>
                            Sektor Usaha: <strong className="text-slate-900">Transportasi &amp; Logistik</strong>
                        </div>
                    </div>
                </div>

                {/* 2. TITLE BOX */}
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-center space-y-1">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                        MEMORANDUM OF UNDERSTANDING (MOU)
                    </h1>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        PERJANJIAN SEWA-MENYEWA ARMADA KENDARAAN TRUCKER RESMI
                    </p>
                </div>

                {/* 3. PREAMBULE */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                    Pada hari ini, disepakati perjanjian kerja sama sewa kendaraan antara pihak penyedia armada dan pihak pengguna
                    (penyewa) untuk operasional pekerjaan Trucker di wilayah hukum San Andreas dengan ketentuan sebagai berikut:
                </p>

                {/* 4. DUA PIHAK (PIHAK PERTAMA & PIHAK KEDUA) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PIHAK PERTAMA */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="font-black text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                            <span>PIHAK PERTAMA (PENYEDIA)</span>
                        </div>
                        <div className="space-y-1 text-slate-600">
                            <div className="flex justify-between">
                                <span>Perusahaan:</span>
                                <strong className="text-slate-900 font-bold">{rental.admin?.company}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Representatif:</span>
                                <strong className="text-slate-900 font-bold">{rental.admin?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Jabatan:</span>
                                <strong className="text-slate-900 font-bold">{rental.admin?.title}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Akun Pemroses:</span>
                                <span className="font-mono text-slate-700">{rental.admin?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kontak / HQ:</span>
                                <strong className="text-slate-900">{rental.admin?.contact}</strong>
                            </div>
                        </div>
                    </div>

                    {/* PIHAK KEDUA */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="font-black text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>PIHAK KEDUA (PENYEWA)</span>
                        </div>
                        <div className="space-y-1 text-slate-600">
                            <div className="flex justify-between">
                                <span>Nama Character IC:</span>
                                <strong className="text-slate-900 font-bold text-sm">{rental.renter_name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>San Andreas ID Card:</span>
                                <strong className="font-mono text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    {rental.san_andreas_id_card}
                                </strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Nomor Telepon IC:</span>
                                <strong className="font-mono text-slate-900">{rental.contact_phone}</strong>
                            </div>
                            <div className="flex justify-between items-center pt-0.5">
                                <span>Lisensi Terverifikasi:</span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {rental.licenses && rental.licenses.length > 0 ? (
                                        rental.licenses.map((lic) => (
                                            <span
                                                key={lic}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            >
                                                {licenseLabels[lic] || lic}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic">Standar Driving</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span>Status Kontrak:</span>
                                <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                    rental.status === 'active'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                    {rental.status === 'active' ? 'Aktif Disewa' : 'Selesai Dikembalikan'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. PASAL 1: DAFTAR ARMADA & TARIF SEWA */}
                <div className="space-y-2 text-xs sm:text-sm">
                    <h2 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        PASAL 1: DAFTAR ARMADA &amp; TARIF SEWA FLEKSIBEL
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        Pihak Pertama menyediakan unit kendaraan trucker yang siap pakai dengan rincian tarif dan besaran deposit jaminan standar sebagai berikut:
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                                    <th className="p-2 sm:p-2.5">Jenis Kendaraan</th>
                                    <th className="p-2 sm:p-2.5">Kategori Job</th>
                                    <th className="p-2 sm:p-2.5">Tarif Per Jam</th>
                                    <th className="p-2 sm:p-2.5">Tarif Harian</th>
                                    <th className="p-2 sm:p-2.5">Tarif Per Trip</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {categories && categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50">
                                            <td className="p-2 sm:p-2.5 font-bold text-slate-900">
                                                {cat.name}
                                            </td>
                                            <td className="p-2 sm:p-2.5 text-slate-600">
                                                {cat.description || 'Hauling & Freight'}
                                            </td>
                                            <td className="p-2 sm:p-2.5 font-mono">
                                                {cat.rental_price_per_hour !== null
                                                    ? `Rp ${cat.rental_price_per_hour.toLocaleString('id-ID')}`
                                                    : '-'}
                                            </td>
                                            <td className="p-2 sm:p-2.5 font-mono">
                                                {cat.rental_price_per_day !== null
                                                    ? `Rp ${cat.rental_price_per_day.toLocaleString('id-ID')}`
                                                    : '-'}
                                            </td>
                                            <td className="p-2 sm:p-2.5 font-mono">
                                                {cat.rental_price_per_trip !== null
                                                    ? `Rp ${cat.rental_price_per_trip.toLocaleString('id-ID')}`
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-3 text-center text-slate-400">
                                            Memuat daftar tarif kategori armada...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. PASAL 2: SYARAT & KETENTUAN OPERASIONAL */}
                <div className="space-y-2 text-xs sm:text-sm">
                    <h2 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        PASAL 2: SYARAT &amp; KETENTUAN OPERASIONAL
                    </h2>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed text-justify">
                        <li>
                            <strong>Lisensi Kendaraan:</strong> Pihak Kedua wajib memiliki Heavy Truck License IC yang aktif dari kepolisian lokal (SAPD) sebelum membawa dan mengemudikan kendaraan armada.
                        </li>
                        <li>
                            <strong>Penggunaan Khusus:</strong> Kendaraan hanya diperbolehkan untuk aktivitas pekerjaan legal (Hauling, Timber, Freight, Delivery). <strong>Dilarang keras</strong> dipergunakan untuk tindakan kriminal (robbing, smuggling, evading dari kejaran polisi).
                        </li>
                        <li>
                            <strong>Bahan Bakar &amp; Perawatan:</strong> Konsumsi bahan bakar (Fuel) dan biaya perbaikan harian (<em>repair/service berkala</em>) menjadi tanggung jawab penuh Pihak Kedua selama masa sewa berlangsung.
                        </li>
                        <li>
                            <strong>Aturan Server &amp; Roleplay:</strong> Pihak Kedua wajib mematuhi seluruh aturan standar server SA-MP (Drive Thru RP, dilarang Non-RP Driving, Powergaming, serta wajib melakukan RP Crash/Fear saat mengalami benturan/kecelakaan).
                        </li>
                    </ol>

                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 text-xs flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0">verified</span>
                        <div>
                            <strong>CATATAN TOLERANSI HEALTH TRUK (DEPOSIT &amp; BEBAS DENDA):</strong>
                            <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                                Health awal kendaraan diserahkan dalam kondisi <strong>{rental.initial_health} HP</strong>. Penurunan health akibat baret tipis pemakaian normal sebesar <strong>≤ 100 HP</strong> dinyatakan bebas denda perbaikan. Penurunan melebihi 100 HP diwajibkan mengganti biaya mechanic, dan health 0 HP wajib klaim tebus asuransi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 7. PASAL 3: KERUSAKAN, KEHILANGAN & SANKSI RP (IN-CHARACTER) */}
                <div className="space-y-2 text-xs sm:text-sm">
                    <h2 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        PASAL 3: KERUSAKAN, KEHILANGAN &amp; SANKSI RP (IN-CHARACTER)
                    </h2>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed text-justify">
                        <li>
                            <strong>Kendaraan Hancur / Meledak (Destroyed):</strong> Apabila kendaraan mengalami kehancuran (<em>destroy / insurance claim</em>) akibat kelalaian Pihak Kedua, maka Pihak Kedua wajib mengganti biaya klaim asuransi ditambah denda administratif.
                        </li>
                        <li>
                            <strong>Penyitaan oleh Kepolisian (Impounded):</strong> Jika kendaraan disita oleh pihak SAPD / Kepolisian karena pelanggaran lalu lintas atau tindakan ilegal Pihak Kedua, maka seluruh biaya tebusan <em>impound</em> menjadi tanggung jawab penuh Pihak Kedua.
                        </li>
                        <li>
                            <strong>Keterlambatan Pengembalian (Late Penalty Fee):</strong> Keterlambatan pengembalian unit melebihi batas waktu perjanjian sewa yang disepakati pada Pasal 4 dikenakan sanksi denda keterlambatan dengan rincian skema berikut:
                            <ul className="list-disc list-inside pl-4 mt-1 text-[11px] text-slate-600 space-y-0.5">
                                <li><strong>Skema Per Jam:</strong> Dikenakan denda sebesar <strong>1.5x tarif sewa per jam</strong> untuk setiap jam keterlambatan (dihitung proporsional per pecahan jam/menit).</li>
                                <li><strong>Skema Per Hari:</strong> Dikenakan denda sebesar <strong>1.25x tarif sewa harian</strong> per hari keterlambatan berjalan.</li>
                                <li><strong>Skema Per Trip:</strong> Dikenakan denda sebesar <strong>50% dari tarif trip</strong> jika penahanan unit melebihi batas waktu operasional rute.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Tindakan Pembangkangan (Scammed / Fail RP):</strong> Tindakan membawa lari kendaraan melebihi masa perjanjian tanpa konfirmasi perpanjangan resmi akan dilaporkan ke kepolisian IC dan diproses hukum pidana serta dilaporkan ke OOC Server Rules.
                        </li>
                    </ol>
                </div>

                {/* 8. PASAL 4: RINCIAN TRANSAKSI SEWA AKTIF */}
                <div className="space-y-2 text-xs sm:text-sm">
                    <h2 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        PASAL 4: RINCIAN TRANSAKSI SEWA
                    </h2>
                    <div className="p-4 rounded-xl bg-slate-900 text-white grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[11px]">Unit Kendaraan Armada:</span>
                            <span className="font-extrabold text-white text-sm">
                                {rental.vehicle?.name} ({rental.vehicle?.category?.name || 'Truk Hauling'})
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Nomor Plat Polisi (Plate):</span>
                            <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                                {rental.vehicle?.plate_number}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Durasi &amp; Paket Sewa:</span>
                            <strong className="text-slate-200">
                                {rental.duration} {rental.rental_type === 'jam' ? 'Jam' : rental.rental_type === 'hari' ? 'Hari' : 'Trip'}
                            </strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Kondisi Health Awal Unit:</span>
                            <strong className="text-emerald-400 font-mono">
                                {rental.initial_health} HP (Mulus / Prima)
                            </strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Waktu Serah Terima / Mulai:</span>
                            <span className="text-slate-300 font-medium">{rental.start_time}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Waktu Batas Pengembalian:</span>
                            <span className="text-slate-300 font-medium">{rental.expected_return_time}</span>
                        </div>
                        <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400">Total Biaya Pokok Sewa:</span>
                            <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
                                Rp {rental.rental_price.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 9. PASAL 5: KETENTUAN SANKSI OUT-OF-CHARACTER (OOC) & SERVER RULES */}
                <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 border-b border-rose-300 pb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                        <h2 className="font-black text-rose-950 uppercase tracking-wide">
                            PASAL 5: KETENTUAN SANKSI OUT-OF-CHARACTER (OOC) &amp; SERVER RULES
                        </h2>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        Demi menjaga kualitas roleplay, keadilan, dan mencegah tindakan <em>Fail RP / Trolling / Non-RP Behavior</em> di server SA-MP, disepakati sanksi OOC tegas terhadap tindakan kesengajaan berikut:
                    </p>

                    <div className="space-y-2.5">
                        {/* Rules 1: Meledak */}
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs space-y-1">
                            <div className="font-extrabold text-rose-950 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-rose-600">local_fire_department</span>
                                <span>1. Sengaja Meledakkan / Menghancurkan Kendaraan (Vehicle Destruction / Trolling)</span>
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                                Meninggalkan kendaraan dalam keadaan terbakar/meledak secara sengaja, melakukan <em>Car Ramming</em> tanpa alasan RP yang jelas, atau menolak melakukan <em>RP Crash</em> saat kecelakaan parah:
                            </p>
                            <div className="text-[11px] font-semibold text-rose-900 bg-white/70 p-2 rounded-lg border border-rose-200">
                                <strong>Hukuman:</strong> Wajib mengganti biaya asuransi secara IC + Dilaporkan ke Administrator Server atas pasal <em>Not Here to RP / Vehicle Destruction</em> dengan hukuman <strong>Admin Jail (60 - 120 Menit) + Warning Server</strong>.
                            </div>
                        </div>

                        {/* Rules 2: Menceburkan */}
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1">
                            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-amber-700">water</span>
                                <span>2. Sengaja Menceburkan Kendaraan ke Air / Laut / Tebing (Water Evading / Drowning)</span>
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                                Sengaja mengendarai unit truk ke perairan (laut, danau, sungai) demi menghindari razia/tilang polisi, evading perampok, atau sengaja membuang kendaraan sewa:
                            </p>
                            <div className="text-[11px] font-semibold text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                                <strong>Hukuman:</strong> Ganti rugi penuh biaya asuransi + Pelanggaran pasal <em>Powergaming / Non-RP Driving / Water Evading</em> dengan sanksi <strong>Admin Jail (60 Menit) hingga Temporary Ban</strong>.
                            </div>
                        </div>

                        {/* Rules 3: Silent Abandonment / Kabur */}
                        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-300 text-xs space-y-1">
                            <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-purple-700">directions_run</span>
                                <span>3. Mengembalikan Kendaraan Diam-diam / Meninggalkan Sembarangan lalu Kabur / Quit Game</span>
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed">
                                Memarkirkan unit sembarangan di pinggir jalan lalu /q (disconnect), atau meletakkan unit di markas tanpa serah terima dan tanpa inspeksi health oleh petugas admin:
                            </p>
                            <div className="text-[11px] font-semibold text-purple-900 bg-white/70 p-2 rounded-lg border border-purple-200">
                                <strong>Hukuman:</strong> Waktu sewa tetap dihitung berjalan (argo denda terus berjalan) + Denda 100% + Blacklist Permanen + Dilaporkan atas pelanggaran <em>Fail RP / Refuse to RP / Scamming Rental Vehicle</em> dengan hukuman <strong>Admin Jail (90 Menit) hingga Banned Akun Scamming</strong>.
                            </div>
                        </div>
                    </div>
                </div>

                {/* 10. PASAL 6: PENUTUP & PENGESAHAN */}
                <div className="space-y-4 text-xs sm:text-sm pt-2">
                    <h2 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                        PASAL 6: PENUTUP &amp; PENGESAHAN KEDUA BELAH PIHAK
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        Surat Perjanjian MoU ini dibuat secara sadar, tanpa paksaan dari pihak manapun, serta mengikat kedua belah pihak sejak disahkan di sistem. Perjanjian ini juga berlaku sebagai bukti kuitansi sewa armada yang sah di Maitri Company.
                    </p>

                    {/* Tanda Tangan Box */}
                    <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
                        {/* Pihak Pertama Signature */}
                        <div className="space-y-2 flex flex-col items-center">
                            <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                                PIHAK PERTAMA (PENYEDIA)
                            </div>
                            <div className="text-[10px] text-slate-400">Maitri Company Executive</div>

                            {/* Digital Stamp */}
                            <div className="w-36 h-20 rounded-xl border-2 border-dashed border-brand-500/70 bg-brand-50/50 flex flex-col items-center justify-center text-brand-700 my-1 p-1">
                                <span className="text-[10px] font-black uppercase tracking-wider">MAITRI COMPANY</span>
                                <span className="material-symbols-outlined text-[20px] my-0.5">verified_user</span>
                                <span className="text-[8px] font-mono font-bold tracking-tight">DIGITALLY VERIFIED</span>
                            </div>

                            <div className="font-extrabold text-slate-900 border-t border-slate-300 pt-1 w-full max-w-[200px]">
                                {rental.admin?.name}
                            </div>
                            <div className="text-[10px] text-slate-500">{rental.admin?.title}</div>
                        </div>

                        {/* Pihak Kedua Signature */}
                        <div className="space-y-2 flex flex-col items-center">
                            <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                                PIHAK KEDUA (PENYEWA)
                            </div>
                            <div className="text-[10px] text-slate-400">Penyewa / Professional Driver</div>

                            {/* Digital Stamp */}
                            <div className="w-36 h-20 rounded-xl border-2 border-dashed border-emerald-500/70 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-800 my-1 p-1">
                                <span className="text-[10px] font-black uppercase tracking-wider">SAN ANDREAS TRUCKER</span>
                                <span className="material-symbols-outlined text-[20px] my-0.5">edit_document</span>
                                <span className="text-[8px] font-mono font-bold tracking-tight">ID: {rental.san_andreas_id_card}</span>
                            </div>

                            <div className="font-extrabold text-slate-900 border-t border-slate-300 pt-1 w-full max-w-[200px]">
                                {rental.renter_name}
                            </div>
                            <div className="text-[10px] text-slate-500">Warga / Professional Trucker</div>
                        </div>
                    </div>
                </div>

                {/* 11. FOOTER NOTICE */}
                <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 italic">
                    *Dokumen ini merupakan aset resmi roleplay Maitri Company SA-MP Server. Tersimpan secara permanen dalam database sistem dan dapat diakses publik kapan saja.*
                </div>
            </div>
        </div>
    );
}
