import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    const [count, setCount] = useState(0);

    return (
        <>
            <Head title="Welcome to Maitri Company" />
            <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
                {/* Navbar */}
                <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
                                M
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">Maitri Company</span>
                        </div>

                        <nav className="flex items-center space-x-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/30"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition hover:bg-slate-800"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/30"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        React 19 + Inertia.js + Tailwind CSS Aktif
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
                        Website Modern Siap Dikembangkan
                    </h1>

                    <p className="mt-5 text-lg text-slate-400 max-w-2xl leading-relaxed">
                        Halaman ini dirender langsung oleh komponen React JSX (<code className="text-indigo-400 bg-slate-800 px-2 py-0.5 rounded font-mono text-sm">resources/js/Pages/Welcome.jsx</code>) melalui Inertia.js tanpa reload browser.
                    </p>

                    {/* Interactive Proof of React State */}
                    <div className="mt-8 p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 max-w-md w-full shadow-xl">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                            Tes Interaktivitas React State:
                        </p>
                        <div className="flex items-center justify-center gap-4 my-2">
                            <span className="text-2xl font-bold text-white font-mono">{count}</span>
                            <button
                                onClick={() => setCount(count + 1)}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-md shadow-emerald-600/30 active:scale-95"
                            >
                                Klik untuk Tambah +1
                            </button>
                            {count > 0 && (
                                <button
                                    onClick={() => setCount(0)}
                                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-xs transition"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Jika angka bertambah saat tombol diklik, React client-side berjalan 100% normal.
                        </p>
                    </div>

                    {/* Stack Information Cards */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
                        <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Backend</div>
                            <div className="text-lg font-bold text-white mt-1">Laravel 13</div>
                            <p className="text-xs text-slate-400 mt-1">Routing, Auth, Database SQLite & API Handlers</p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Frontend</div>
                            <div className="text-lg font-bold text-white mt-1">React 19 & Tailwind</div>
                            <p className="text-xs text-slate-400 mt-1">Komponen reaktif SPA dengan utility-first styling</p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Bridge</div>
                            <div className="text-lg font-bold text-white mt-1">Inertia.js v2</div>
                            <p className="text-xs text-slate-400 mt-1">Menghubungkan controller Laravel ke React tanpa API boilerplate</p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
                    Laravel v{laravelVersion} • PHP v{phpVersion} • Siap Deploy ke cPanel
                </footer>
            </div>
        </>
    );
}
