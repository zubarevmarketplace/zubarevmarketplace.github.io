import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SiteLogo from './SiteLogo';

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
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const onWindowNavigation = () => {
      setMobileMenuOpen(false);
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!mobileMenuRef.current || !mobileMenuOpen) {
        return;
      }

      const target = event.target as Node;
      if (!mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    window.addEventListener('popstate', onWindowNavigation);
    window.addEventListener('hashchange', onWindowNavigation);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onEscape);
      window.removeEventListener('popstate', onWindowNavigation);
      window.removeEventListener('hashchange', onWindowNavigation);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-[linear-gradient(90deg,rgba(0,45,55,0.45),rgba(5,10,14,0.9),rgba(65,42,5,0.38))] bg-[#08131a]/95 supports-[backdrop-filter]:backdrop-blur-[18px] supports-[backdrop-filter]:bg-[linear-gradient(90deg,rgba(0,45,55,0.42),rgba(5,10,14,0.82),rgba(65,42,5,0.34))]">
      <nav className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 h-20 md:h-24 flex items-center justify-between gap-6 overflow-x-clip">
        <a href="/" className="flex items-center shrink-0" aria-label="На главную">
          <SiteLogo className="w-[58px] h-[58px] md:w-[67px] md:h-[67px]" />
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
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Открыть меню"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-main-menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-[110] border-b border-white/10 bg-[#08131a]/96 supports-[backdrop-filter]:backdrop-blur-[16px] supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(7,13,18,0.97),rgba(5,10,14,0.94))]">
          <div ref={mobileMenuRef} id="mobile-main-menu" className="max-w-[1400px] mx-auto px-5 py-5 space-y-3">
            {landingLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white/70 hover:text-white transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className={`block transition-colors py-2 ${currentPage === 'calculator' ? 'text-white' : 'text-white/70 hover:text-white'}`}
            >
              Калькулятор
            </a>
            <a
              href="/#contacts"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/70 hover:text-white transition-colors py-2"
            >
              Связаться
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
