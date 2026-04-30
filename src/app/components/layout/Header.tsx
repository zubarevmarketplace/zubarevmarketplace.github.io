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
      <nav className="relative z-50 px-4 md:px-8 py-6 flex items-center justify-between max-w-[1400px] mx-auto border-b border-white/5 lg:px-10">
        <a href="/" className="flex items-center" aria-label="На главную">
          <img src="/favicon.svg" alt="Zubarev Lab" className="w-9 h-9" />
        </a>

        <div className="hidden md:flex items-center gap-10 lg:gap-12 xl:gap-14 ml-auto pl-14 lg:pl-20">
          {landingLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-white/60 hover:text-white/90 transition-colors whitespace-nowrap">
              {link.label}
            </a>
          ))}
          <a
            href="/tools/wb-calculator"
            className={`text-sm transition-colors ${currentPage === 'calculator' ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
          >
            Калькулятор
          </a>
          <a href="/#contacts" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all">
            Связаться
          </a>
        </div>

        <div className="flex md:hidden items-center">
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
              href="/tools/wb-calculator"
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
