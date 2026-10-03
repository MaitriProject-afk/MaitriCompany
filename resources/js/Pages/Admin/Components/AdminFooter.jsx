export default function AdminFooter() {
    return (
        <footer className="w-full bg-white py-4 px-6 lg:px-8 border-t border-slate-200/80 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs font-medium">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/images/maitricomplogo.png"
                        alt="Maitri Company"
                        className="h-4 w-auto object-contain opacity-75"
                    />
                    <span>© 2026 PT Maitri Perkasa Indonesia. Seluruh hak cipta dilindungi.</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                    <a href="#api" className="hover:text-brand-600 transition-colors">Dokumentasi API</a>
                    <a href="#help" className="hover:text-brand-600 transition-colors">Bantuan Support</a>
                    <a href="#privacy" className="hover:text-brand-600 transition-colors">Kebijakan Privasi</a>
                </div>
            </div>
        </footer>
    );
}
