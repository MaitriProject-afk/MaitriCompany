import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import KpiOverview from '@/Pages/Admin/Components/KpiOverview';
import FleetLogisticsPillar from '@/Pages/Admin/Components/FleetLogisticsPillar';
import DesignStudioPillar from '@/Pages/Admin/Components/DesignStudioPillar';
import FinancialOverview from '@/Pages/Admin/Components/FinancialOverview';
import SystemLogsAlerts from '@/Pages/Admin/Components/SystemLogsAlerts';

export default function AdminDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    const handleExport = () => {
        alert('Memulai ekspor rekap laporan operasional dan finansial Q1 2026 (PDF & XLSX)...');
    };

    const handleNewProject = () => {
        alert('Membuka formulir registrasi proyek arsitektur / interior baru...');
    };

    const handleNewDispatch = () => {
        alert('Membuka modal penugasan unit armada & manifest jalan...');
    };

    return (
        <AdminLayout activeMenu="overview">
            <Head title="Admin Dashboard - Konsol Manajemen Terintegrasi" />

            <div className="space-y-6 sm:space-y-8">
                {/* 1. TOP CONSOLE MANAGEMENT BANNER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Konsol Manajemen Terintegrasi
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Sistem Aktif — Sinkronisasi Real-Time
                            </span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                                Operasional 24/7 Aktif
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Selamat Datang, {user.name}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                            Pemantauan operasional dua pilar bisnis PT Maitri Perkasa Indonesia:{' '}
                            <span className="font-bold text-brand-700">Divisi Logistik &amp; Armada Niaga</span>{' '}
                            serta{' '}
                            <span className="font-bold text-amber-700">Divisi Studio Desain Arsitektur &amp; Interior</span>.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-brand-600">download</span>
                            <span>Ekspor Laporan</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleNewProject}
                            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-amber-700">architecture</span>
                            <span>+ Proyek Desain</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleNewDispatch}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/30 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                            <span>+ Penugasan Armada</span>
                        </button>
                    </div>
                </div>

                {/* 2. 4 CORE KPI CARDS GRID */}
                <KpiOverview />

                {/* 3. TWO CORE PILLARS SPLIT SECTION */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
                    {/* Left Pillar: Divisi Logistik (7 Cols) */}
                    <div className="xl:col-span-7">
                        <FleetLogisticsPillar />
                    </div>

                    {/* Right Pillar: Divisi Desain (5 Cols) */}
                    <div className="xl:col-span-5">
                        <DesignStudioPillar />
                    </div>
                </div>

                {/* 4. FINANCIAL OVERVIEW & OPERATIONAL LOGS SPLIT SECTION */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                    {/* Financial Overview (7 Cols) */}
                    <div className="xl:col-span-7 flex">
                        <FinancialOverview />
                    </div>

                    {/* System Logs & Alerts (5 Cols) */}
                    <div className="xl:col-span-5 flex">
                        <SystemLogsAlerts />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
