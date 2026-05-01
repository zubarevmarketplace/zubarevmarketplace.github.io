import { Mail, Phone, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10 md:mb-12 items-start">
          <div className="space-y-4">
            <img src="/logo.svg" alt="Zubarev Lab" className="w-16 h-16" />
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              Аудит, аналитика и консультационное сопровождение для продавцов на Wildberries и Ozon.
            </p>
          </div>

          <div className="md:justify-self-center">
            <h4 className="text-sm mb-4 text-white/90">Навигация</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="/" className="hover:text-white/90 transition-colors">Главная</a></li>
              <li><a href="/calculator" className="hover:text-white/90 transition-colors">Калькулятор</a></li>
              <li><a href="/#formats" className="hover:text-white/90 transition-colors">Услуги</a></li>
              <li><a href="/#cases" className="hover:text-white/90 transition-colors">Кейсы</a></li>
              <li><a href="/#contacts" className="hover:text-white/90 transition-colors">Контакты</a></li>
              <li><a href="/privacy.html" className="hover:text-white/90 transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>

          <div className="md:justify-self-end">
            <h4 className="text-sm mb-4 text-white/90">Контакты</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-3"><Send className="w-4 h-4 text-[#0088cc]" /><span>Telegram: @Kolyanist</span></li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#25D366]" /><span>WhatsApp/Max: +7 (904) 632-00-24</span></li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-cyan-400" /><span>Email: zubarev.marketplace@gmail.com</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>Маркетплейс-диагностика, аналитика и управленческие решения.</p>
          <p>© 2026. Зубарев Николай</p>
        </div>
      </div>
    </footer>
  );
}
