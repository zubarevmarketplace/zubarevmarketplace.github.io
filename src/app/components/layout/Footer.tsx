import { Mail, Phone, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-[1400px] mx-auto px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="md:col-span-3">
            <img src="/favicon.svg" alt="Zubarev Lab" className="w-20 h-20 mb-4" />
            <p className="text-sm text-white/60 leading-relaxed">
              Аудит, аналитика и консультационное сопровождение для продавцов на Wildberries и Ozon.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-5">
            <h4 className="text-sm mb-4 text-white/90">Навигация</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="/" className="hover:text-white/90 transition-colors">Главная</a></li>
              <li><a href="/calculator" className="hover:text-white/90 transition-colors">Калькулятор</a></li>
              <li><a href="/#formats" className="hover:text-white/90 transition-colors">Услуги</a></li>
              <li><a href="/#cases" className="hover:text-white/90 transition-colors">Кейсы</a></li>
              <li><a href="/#contacts" className="hover:text-white/90 transition-colors">Контакты</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
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
