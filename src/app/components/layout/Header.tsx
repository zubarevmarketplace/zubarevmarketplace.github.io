import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type HeaderProps = {
  currentPage: 'home' | 'calculator';
};

export default function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClass = (isActive: boolean) =>
    `text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white/90'}`;

  return (
    <>
      <nav className="relative z-50 px-4 md:px-8 py-6 flex items-center justify-between max-w-[1400px] mx-auto border-b border-white/5">
        <a href="/" className="text-xl tracking-tight">NZ</a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/" className={linkClass(currentPage === 'home')}>Главная</a>
          <a href="/tools/wb-calculator" className={linkClass(currentPage === 'calculator')}>Калькулятор</a>
          <a href="/#about" className="text-sm text-white/60 hover:text-white/90 transition-colors">Обо мне</a>
          <a href="/#contacts" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all">
            Связаться
          </a>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <a href="/#contacts" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all">
            Связаться
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/60 hover:text-white/90 transition-colors"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[73px] left-0 right-0 z-40 bg-[#050A0E]/95 backdrop-blur-lg border-b border-white/5">
          <div className="px-8 py-6 space-y-4">
            <a href="/" onClick={() => setMobileMenuOpen(false)} className={linkClass(currentPage === 'home') + ' block py-2'}>Главная</a>
            <a href="/tools/wb-calculator" onClick={() => setMobileMenuOpen(false)} className={linkClass(currentPage === 'calculator') + ' block py-2'}>Калькулятор</a>
            <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="block text-white/60 hover:text-white/90 transition-colors py-2">Обо мне</a>
            <a href="/#contacts" onClick={() => setMobileMenuOpen(false)} className="block text-white/60 hover:text-white/90 transition-colors py-2">Контакты</a>
          </div>
        </div>
      )}
    </>
  );
}
