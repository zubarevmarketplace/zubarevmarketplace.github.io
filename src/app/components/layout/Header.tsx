import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type HeaderProps = {
  currentPage: 'home' | 'calculator';
};

const landingLinks = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#formats', label: 'Услуги' },
  { href: '/#cases', label: 'Кейсы' },
  { href: '/#contacts', label: 'Контакты' },
];

export default function Header({ currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-50 border-b border-white/5">
        <nav className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 h-24 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center shrink-0" aria-label="На главную">
            <img src="/logo.svg" alt="Zubarev Lab" className="w-12 h-12 md:w-14 md:h-14" />
          </a>

          <div className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-10 xl:gap-12 min-w-0">
            {landingLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-white/60 hover:text-white/90 transition-colors whitespace-nowrap">
                {link.label}
              </a>
            ))}
            <a
              href="/calculator"
              className={`text-sm transition-colors whitespace-nowrap ${currentPage === 'calculator' ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
            >
              Калькулятор
            </a>
          </div>

          <div className="hidden md:flex items-center shrink-0">
            <a href="/#contacts" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all whitespace-nowrap">
              Связаться
            </a>
          </div>

          <div className="flex md:hidden items-center shrink-0 ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white/90 transition-colors"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-24 left-0 right-0 z-40 bg-[#050A0E]/95 backdrop-blur-lg border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-5 py-6 space-y-4">
            {landingLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white/60 hover:text-white/90 transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className={`block transition-colors py-2 ${currentPage === 'calculator' ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
            >
              Калькулятор
            </a>
            <a
              href="/#contacts"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/60 hover:text-white/90 transition-colors py-2"
            >
              Связаться
            </a>
          </div>
        </div>
      )}
    </>
  );
}
