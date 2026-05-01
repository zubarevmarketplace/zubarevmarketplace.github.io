import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { useState, Fragment } from 'react';
import Layout from './components/layout/Layout';
import Seo from './components/Seo';
import { Send, MessageCircle, Phone, FileText, TrendingUp } from 'lucide-react';
import carloLogo from '../imports/Carlo_LexOne_(var3).png';
import phoenixLogo from '../imports/аватарка-Феникс3.png';
import formulaLogo from '../imports/Formula_Natural.jpg';
import ivalarLogo from '../imports/Ivalar2.jpg';
import kimLogo from '../imports/Ким_Медикал.png';
import authorPhoto from '../imports/2-2.jpg';
import heroPhoto from '../imports/1-1.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState('economy');
  const [serviceType, setServiceType] = useState<'onetime' | 'ongoing'>('onetime');
  const [selectedService, setSelectedService] = useState('express');
  const [activeProcessStep, setActiveProcessStep] = useState('1');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('economics');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [floatingButtonExpanded, setFloatingButtonExpanded] = useState(false);
  const [mobileDiagnosticTab, setMobileDiagnosticTab] = useState<'check' | 'problems' | 'results'>('check');
  return (

    <Layout currentPage="home">
      <Seo
        title="Zubarev Lab — инструменты и услуги для продавцов Wildberries"
        description="Инструменты, аналитика и услуги для продавцов Wildberries: юнит-экономика, логистика, комиссии, прибыль, продвижение и рост продаж."
        canonical="https://zubarevlab.ru/"
        ogUrl="https://zubarevlab.ru/"
      />
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Background gradient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/30 rounded-full blur-[150px]" />
        <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-amber-500/30 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-1/3 h-1/3 bg-purple-500/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-cyan-600/25 rounded-full blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-8 py-8 md:py-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6 relative z-10">
            <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <span className="text-sm text-cyan-300">Аудит маркетплейсов Wildberries и Ozon</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-6xl leading-[1.1] tracking-tight">
              Нахожу слабые места<br />
              и собираю понятную<br />
              модель роста
            </h1>

            <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-lg">
              Помогаю селлерам Wildberries и Ozon находить точки роста и строить прибыльный бизнес на маркетплейсах.
              От глубокого анализа до стратегии масштабирования.
            </p>

            <div className="flex gap-4">
              <a href="#contacts" className="hidden md:inline-flex px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-sm">
                Обсудить задачу
              </a>
              <a href="#cases" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-sm">
                Смотреть кейсы
              </a>
            </div>
          </div>

          {/* Right Portrait */}
          <div className="relative hidden lg:block lg:translate-y-[100px]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/5">
              <img
                src={heroPhoto}
                alt="Analytics Consultant"
                className="w-full h-[600px] object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
          </div>
        </div>

        {/* Metrics Cards + Mobile Photo */}
        <div className="relative mt-8 md:mt-12">
          {/* Desktop: Simple grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="text-xs text-white/50 mb-2">Метрики</div>
                <div className="text-2xl mb-1.5">
                  <span className="text-white/70">-3%</span>
                  <span className="text-white/40 mx-2">→</span>
                  <span className="text-cyan-400">+15%</span>
                </div>
                <div className="text-xs text-white/50">рентабельность проекта</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="text-xs text-white/50 mb-2">Метрики</div>
                <div className="text-2xl mb-1.5">
                  <span className="text-white/70">4 SKU</span>
                  <span className="text-white/40 mx-2">→</span>
                  <span className="text-cyan-400">8.07 млн ₽</span>
                </div>
                <div className="text-xs text-white/50">оборот нового магазина</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div className="text-xs text-white/50 mb-2">Метрики</div>
                <div className="text-2xl mb-1.5">
                  <span className="text-white/70">5.52</span>
                  <span className="text-white/40 mx-2">→</span>
                  <span className="text-cyan-400">19.18 млн ₽</span>
                </div>
                <div className="text-xs text-white/50">рост WB-направления</div>
              </div>
            </div>
          </div>

          {/* Mobile: Cards left, photo right with overlap */}
          <div className="md:hidden relative">
            <div className="flex gap-3">
              {/* Cards column */}
              <div className="flex-1 space-y-3 relative z-10">
                <div className="relative p-3 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="text-[10px] text-white/50 mb-1">Метрики</div>
                  <div className="text-sm mb-0.5">
                    <span className="text-white/70">-3%</span>
                    <span className="text-white/40 mx-1">→</span>
                    <span className="text-cyan-400">+15%</span>
                  </div>
                  <div className="text-[10px] text-white/50">рентабельность</div>
                </div>

                <div className="relative p-3 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="text-[10px] text-white/50 mb-1">Метрики</div>
                  <div className="text-sm mb-0.5">
                    <span className="text-white/70">4 SKU</span>
                    <span className="text-white/40 mx-1">→</span>
                    <span className="text-cyan-400">8.07 млн</span>
                  </div>
                  <div className="text-[10px] text-white/50">оборот магазина</div>
                </div>

                <div className="relative p-3 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="text-[10px] text-white/50 mb-1">Метрики</div>
                  <div className="text-sm mb-0.5">
                    <span className="text-white/70">5.52</span>
                    <span className="text-white/40 mx-1">→</span>
                    <span className="text-cyan-400">19.18 млн</span>
                  </div>
                  <div className="text-[10px] text-white/50">рост WB</div>
                </div>
              </div>

              {/* Photo column */}
              <div className="w-[45%] relative -ml-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-60" />
                <div className="relative rounded-2xl overflow-hidden border border-white/5">
                  <img
                    src={heroPhoto}
                    alt="Analytics Consultant"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How I Work Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto">
        <div className="space-y-6 md:space-y-12">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3 md:mb-6">
              <span className="text-sm text-white/70">Подход</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight mb-4 md:mb-8">
              Маркетплейс — это бизнес-система,<br />
              а не набор действий
            </h2>

            <p className="text-sm md:text-lg text-white/60 leading-relaxed">
              Я не "кручу рекламу" и не веду кабинеты в операционке. Я собираю управляемую модель: где проект зарабатывает,
              где теряет, и какие решения дадут рост без хаоса.
            </p>
          </div>

          {/* What I DON'T do & What I DO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* I DON'T do */}
            <div className="p-5 md:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl">
              <h3 className="text-base md:text-xl mb-4 md:mb-6 text-white/90">Что я не продаю</h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-red-400/60 mt-0.5 text-sm md:text-base">✕</span>
                  <span className="text-white/60 text-sm md:text-base">Ежедневное ведение кабинетов «под ключ»</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-red-400/60 mt-0.5 text-sm md:text-base">✕</span>
                  <span className="text-white/60 text-sm md:text-base">"Давайте попробуем" без расчётов и приоритетов</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-red-400/60 mt-0.5 text-sm md:text-base">✕</span>
                  <span className="text-white/60 text-sm md:text-base">Упаковку активности вместо результата</span>
                </li>
              </ul>
            </div>

            {/* I DO */}
            <div className="p-5 md:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl">
              <h3 className="text-base md:text-xl mb-4 md:mb-6 text-white/90">Что я делаю</h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-cyan-400 mt-0.5 text-sm md:text-base">✓</span>
                  <span className="text-white/60 text-sm md:text-base">Нахожу потери в экономике/рекламе/остатках/ассортименте</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-cyan-400 mt-0.5 text-sm md:text-base">✓</span>
                  <span className="text-white/60 text-sm md:text-base">Перевожу хаос в систему: цифры → решения → контроль</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <span className="text-cyan-400 mt-0.5 text-sm md:text-base">✓</span>
                  <span className="text-white/60 text-sm md:text-base">Даю план действий и логику, которую можно внедрить командой</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Principles Cards - compact layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 md:p-5 bg-gradient-to-br from-cyan-500/5 to-transparent backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl hover:border-cyan-500/30 transition-all group">
              <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 rounded-lg md:rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                <span className="text-lg md:text-xl">🔍</span>
              </div>
              <h4 className="text-sm md:text-base mb-1.5 md:mb-2">Диагностика</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                Сначала разбираю причины, потом назначаю действия.
              </p>
            </div>

            <div className="p-4 md:p-5 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl hover:border-amber-500/30 transition-all group">
              <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                <span className="text-lg md:text-xl">📊</span>
              </div>
              <h4 className="text-sm md:text-base mb-1.5 md:mb-2">Экономика</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                Маржа, unit-экономика, ДРР, оборачиваемость — база решений.
              </p>
            </div>

            <div className="p-4 md:p-5 bg-gradient-to-br from-purple-500/5 to-transparent backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl hover:border-purple-500/30 transition-all group">
              <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 rounded-lg md:rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                <span className="text-lg md:text-xl">🎯</span>
              </div>
              <h4 className="text-sm md:text-base mb-1.5 md:mb-2">Приоритеты</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                Не "всё сразу", а 3–5 шагов с максимальным эффектом.
              </p>
            </div>

            <div className="p-4 md:p-5 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 backdrop-blur-sm border border-white/10 rounded-xl md:rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
                <span className="text-lg md:text-xl">🎁</span>
              </div>
              <h4 className="text-sm md:text-base mb-1.5 md:mb-2">Передача системы</h4>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                После меня остаётся модель и правила управления, а не "магия".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What I Check Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto" id="diagnostics">
        <div className="space-y-6 md:space-y-12">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3 md:mb-6">
              <span className="text-sm text-white/70">Что я проверяю в проекте</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight mb-4 md:mb-8">
              Где обычно теряются<br />
              деньги на маркетплейсах
            </h2>

            <p className="text-sm md:text-lg text-white/60 leading-relaxed">
              Проблема редко находится в одном месте. Поэтому я смотрю не только рекламу или карточки,
              а всю связку: от экономики товара до процессов внутри команды.
            </p>
          </div>

          {/* Tab System */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Menu - Desktop */}
            <div className="hidden lg:block lg:col-span-3 space-y-2">
              {diagnosticTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-sm ${activeTab === tab.id ? 'text-cyan-400' : 'text-white/40'}`}>
                      {tab.number}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-base mb-2 ${activeTab === tab.id ? 'text-white' : 'text-white/70'}`}>
                        {tab.title}
                      </h3>
                      {activeTab === tab.id && (
                        <p className="text-sm text-white/60 leading-relaxed">
                          {tab.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile Accordion */}
            <div className="lg:hidden space-y-3">
              {diagnosticTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveTab(activeTab === tab.id ? '' : tab.id)}
                    className="w-full text-left p-3 flex items-start gap-2"
                  >
                    <span className="text-[10px] text-cyan-400">{tab.number}</span>
                    <div className="flex-1">
                      <h3 className="text-sm mb-1">{tab.title}</h3>
                      {activeTab === tab.id && (
                        <p className="text-xs text-white/60 mb-2">{tab.description}</p>
                      )}
                    </div>
                    <span className="text-white/40 text-sm">{activeTab === tab.id ? '−' : '+'}</span>
                  </button>

                  {activeTab === tab.id && (
                    <div className="px-3 pb-3">
                      {/* Browser-style tabs */}
                      <div className="flex gap-1 mb-3 border-b border-white/5">
                        <button
                          onClick={() => setMobileDiagnosticTab('check')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
                            mobileDiagnosticTab === 'check'
                              ? 'bg-cyan-500/10 border-t border-l border-r border-cyan-500/30 text-white'
                              : 'bg-white/[0.02] text-white/40'
                          }`}
                        >
                          {mobileDiagnosticTab === 'check' ? (
                            <>
                              <span className="text-xs">🔍</span>
                              <span className="text-xs">Что проверяю</span>
                            </>
                          ) : (
                            <span className="text-xs">🔍</span>
                          )}
                        </button>
                        <button
                          onClick={() => setMobileDiagnosticTab('problems')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
                            mobileDiagnosticTab === 'problems'
                              ? 'bg-amber-500/10 border-t border-l border-r border-amber-500/30 text-white'
                              : 'bg-white/[0.02] text-white/40'
                          }`}
                        >
                          {mobileDiagnosticTab === 'problems' ? (
                            <>
                              <span className="text-xs">⚠️</span>
                              <span className="text-xs">Признаки</span>
                            </>
                          ) : (
                            <span className="text-xs">⚠️</span>
                          )}
                        </button>
                        <button
                          onClick={() => setMobileDiagnosticTab('results')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
                            mobileDiagnosticTab === 'results'
                              ? 'bg-green-500/10 border-t border-l border-r border-green-500/30 text-white'
                              : 'bg-white/[0.02] text-white/40'
                          }`}
                        >
                          {mobileDiagnosticTab === 'results' ? (
                            <>
                              <span className="text-xs">✓</span>
                              <span className="text-xs">Результат</span>
                            </>
                          ) : (
                            <span className="text-xs">✓</span>
                          )}
                        </button>
                      </div>

                      {/* Tab content */}
                      <div className="text-xs">
                        {mobileDiagnosticTab === 'check' && (
                          <ul className="space-y-1.5 text-white/60">
                            {tab.whatICheck.map((item, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {mobileDiagnosticTab === 'problems' && (
                          <ul className="space-y-1.5 text-white/60">
                            {tab.problemSigns.map((item, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {mobileDiagnosticTab === 'results' && (
                          <ul className="space-y-1.5 text-white/60">
                            {tab.results.map((item, idx) => (
                              <li key={idx} className="flex gap-1.5">
                                <span>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Content - Desktop 3 Columns */}
            <div className="hidden lg:block lg:col-span-9">
              <div className="h-full p-8 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-3xl flex items-stretch">
                <div className="grid grid-cols-3 gap-0 divide-x divide-white/5 flex-1">
                  {/* What I Check */}
                  <div className="px-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <span className="text-cyan-400">🔍</span>
                      </div>
                      <h4 className="text-sm text-white/90">Что проверяю</h4>
                    </div>
                    <ul className="space-y-4">
                      {diagnosticTabs.find(t => t.id === activeTab)?.whatICheck.map((item, idx) => (
                        <li key={idx} className="text-[15px] text-white/60 leading-relaxed flex items-start gap-2">
                          <span className="text-cyan-400/40 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Problem Signs */}
                  <div className="px-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="text-amber-400">⚠️</span>
                      </div>
                      <h4 className="text-sm text-white/90">Признаки проблемы</h4>
                    </div>
                    <ul className="space-y-4">
                      {diagnosticTabs.find(t => t.id === activeTab)?.problemSigns.map((item, idx) => (
                        <li key={idx} className="text-[15px] text-white/60 leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400/40 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Results */}
                  <div className="px-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-400">✓</span>
                      </div>
                      <h4 className="text-sm text-white/90">Какой результат даю</h4>
                    </div>
                    <ul className="space-y-4">
                      {diagnosticTabs.find(t => t.id === activeTab)?.results.map((item, idx) => (
                        <li key={idx} className="text-[15px] text-white/60 leading-relaxed flex items-start gap-2">
                          <span className="text-green-400/40 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Formats Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 max-w-[1400px] mx-auto" id="formats">
        <div className="space-y-6">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3">
              <span className="text-sm text-white/70">Формат работы</span>
            </div>

            <h2 className="text-3xl md:text-4xl leading-[1.15] tracking-tight mb-3">
              Можно начать с разового разбора —<br />
              и при необходимости перейти к сопровождению
            </h2>

            <p className="text-sm text-white/60 leading-relaxed">
              Я не забираю на себя ежедневную операционку. Мой фокус — диагностика, расчёты, обучение,
              контроль решений и помощь владельцу или специалисту в управлении проектом.
            </p>
          </div>

          {/* Service Type Toggle */}
          <div className="inline-flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl">
            <button
              onClick={() => {
                setServiceType('onetime');
                setSelectedService('express');
              }}
              className={`px-6 py-3 rounded-xl transition-all text-sm ${
                serviceType === 'onetime'
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Разовые задачи
            </button>
            <button
              onClick={() => {
                setServiceType('ongoing');
                setSelectedService('immersion');
              }}
              className={`px-6 py-3 rounded-xl transition-all text-sm ${
                serviceType === 'ongoing'
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Программы
            </button>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Menu */}
            <div className="lg:col-span-4 space-y-1.5 md:space-y-2">
              {(serviceType === 'onetime' ? oneTimeServices : ongoingServices).map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full text-left p-2.5 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                    selectedService === service.id
                      ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <span className={`text-[10px] md:text-xs ${selectedService === service.id ? 'text-cyan-400' : 'text-white/40'}`}>
                      {service.number}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-xs md:text-base mb-0.5 md:mb-1 ${selectedService === service.id ? 'text-white' : 'text-white/70'}`}>
                        {service.title}
                      </h3>
                      {selectedService === service.id && (
                        <p className="text-xs md:text-sm text-white/60 leading-relaxed hidden md:block">
                          {service.short}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <div className="p-4 md:p-6 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl">
                {(() => {
                  const currentService = serviceType === 'onetime'
                    ? oneTimeServices.find(s => s.id === selectedService)
                    : ongoingServices.find(s => s.id === selectedService);

                  if (!currentService) return null;

                  return (
                    <div className="space-y-3 md:space-y-5">
                      {/* Title and Description */}
                      <div>
                        <h3 className="text-lg md:text-2xl mb-2 md:mb-3">{currentService.title}</h3>
                        <p className="text-xs md:text-base text-white/70 leading-relaxed mb-3 md:mb-4">
                          {currentService.short}
                        </p>
                        <div className="p-2.5 md:p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl md:rounded-2xl">
                          <p className="text-xs md:text-sm text-white/80">
                            <span className="text-cyan-400">Для кого:</span> {currentService.forWhom}
                          </p>
                        </div>
                      </div>

                      {/* What's Included */}
                      <div>
                        <h4 className="text-sm md:text-base mb-2 md:mb-3 text-white/90">Что входит</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
                          {currentService.included.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 md:gap-2">
                              <span className="text-cyan-400 mt-0.5 text-xs md:text-sm">•</span>
                              <span className="text-xs md:text-sm text-white/60">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Result */}
                      <div className="p-3 md:p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-xl md:rounded-2xl">
                        <h4 className="text-sm md:text-base mb-1.5 md:mb-2 text-white/90">Результат</h4>
                        <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                          {currentService.result}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <div>
                        <button
                          onClick={() => {
                            const contactsSection = document.getElementById('contacts');
                            contactsSection?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full md:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-sm"
                        >
                          {currentService.cta}
                        </button>
                        {currentService.note && (
                          <p className="text-xs text-white/40 mt-2">{currentService.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-32 max-w-[1400px] mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left - Header */}
          <div className="lg:col-span-4">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3 md:mb-6">
              <span className="text-sm text-white/70">Как проходит работа</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight mb-3 md:mb-6">
              Как проходит разбор
            </h2>

            <p className="text-sm md:text-base text-white/60 leading-relaxed">
              Работа строится так, чтобы на выходе у вас был не поток общих советов,
              а понятные выводы, расчёты и порядок действий.
            </p>
          </div>

          {/* Right - Tabs and Content */}
          <div className="lg:col-span-8 space-y-4 md:space-y-8">
            {/* Horizontal Tabs - Carousel for mobile, fixed for desktop */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
              <div className="flex justify-between items-start min-w-max md:min-w-0">
                {processSteps.map((step, idx) => (
                  <Fragment key={step.number}>
                    {/* Tab Circle */}
                    <div className="flex flex-col items-center gap-2 md:gap-3 relative z-10">
                      <button
                        onClick={() => setActiveProcessStep(step.number)}
                        className={`w-12 h-12 md:w-20 md:h-20 rounded-full border-2 transition-all ${
                          activeProcessStep === step.number
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 scale-110'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                        }`}
                      >
                        <span className="text-sm md:text-lg">{step.number}</span>
                      </button>
                      <span className={`text-xs md:text-sm text-center whitespace-nowrap ${
                        activeProcessStep === step.number ? 'text-white' : 'text-white/60'
                      }`}>
                        {step.title}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    {idx < processSteps.length - 1 && (
                      <div className="flex items-center" style={{ paddingTop: '24px', flex: 1 }}>
                        <div className="w-2 md:w-4" />
                        <div className="flex-1 h-0.5 bg-white/10 min-w-[20px]" />
                        <div className="w-2 md:w-4" />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Active Step Content */}
            <div className="min-h-[300px] md:min-h-[400px] p-4 md:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl">
              {(() => {
                const step = processSteps.find(s => s.number === activeProcessStep);
                if (!step) return null;

                return (
                  <div className="space-y-4 md:space-y-6">
                    <p className="text-xs md:text-base text-white/70 leading-relaxed">{step.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {step.content.map((item, idx) => (
                        <div key={idx} className="space-y-2 md:space-y-3">
                          <h4 className="text-xs md:text-sm text-cyan-400/90 uppercase tracking-wider">
                            {item.label}
                          </h4>
                          <ul className="space-y-1.5 md:space-y-2">
                            {item.points.map((point, pidx) => (
                              <li key={pidx} className="text-xs md:text-sm text-white/60 leading-relaxed flex items-start gap-1.5 md:gap-2">
                                <span className="text-cyan-400/40 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Cases and Results Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto" id="cases">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3 md:mb-4">
              <span className="text-sm text-white/70">Кейсы и результаты</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight mb-4 md:mb-6">
              Результаты в запуске, росте,<br />
              антикризисе и систематизации
            </h2>

            <p className="text-base text-white/60 leading-relaxed">
              В проектах я работал с запуском магазинов, масштабированием, ростом рентабельности,
              управлением ассортиментом, аналитикой и построением процессов.
            </p>
          </div>

          {/* Case Cards Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeCaseIndex * 100}%)` }}
              >
                {caseStudies.map((caseStudy, idx) => (
                  <div
                    key={idx}
                    className="w-full flex-shrink-0 px-2 md:px-4"
                  >
                    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl">
                      {/* Logo and Company Name */}
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <img
                          src={caseStudy.logo}
                          alt={caseStudy.company}
                          className={`object-contain ${
                            caseStudy.company === 'Carlo LexOne' ? 'w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-white p-1.5 md:p-2' :
                            caseStudy.company === 'Феникс' ? 'w-16 h-16 md:w-24 md:h-24' :
                            caseStudy.company === 'Formula Natural' ? 'w-20 h-20 md:w-28 md:h-28' :
                            caseStudy.company === 'Ivalar' ? 'w-20 h-20 md:w-28 md:h-28' :
                            caseStudy.company === 'Ким Медикал' ? 'w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-xl bg-white/95 p-1.5 md:p-2' :
                            'w-14 h-14 md:w-20 md:h-20'
                          }`}
                        />
                        <h3 className="text-lg md:text-2xl">{caseStudy.company}</h3>
                      </div>

                      {/* Task */}
                      <div className="mb-3 md:mb-5">
                        <h4 className="text-[10px] md:text-xs text-cyan-400/70 mb-1.5 md:mb-2 uppercase tracking-wider">Задача</h4>
                        <p className="text-xs md:text-sm text-white/70 leading-relaxed line-clamp-2 md:line-clamp-none">{caseStudy.task}</p>
                      </div>

                      {/* Top Results (first 2) */}
                      <div className="mb-3 md:mb-5 p-3 md:p-4 bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 rounded-xl md:rounded-2xl">
                        <h4 className="text-[10px] md:text-xs text-amber-400/90 mb-2 md:mb-3 uppercase tracking-wider">Ключевые результаты</h4>
                        <ul className="space-y-1.5 md:space-y-2">
                          {caseStudy.results.slice(0, 2).map((result, resultIdx) => (
                            <li key={resultIdx} className="text-xs md:text-sm text-white/80 leading-relaxed line-clamp-1 md:line-clamp-none">
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => setSelectedCase(idx)}
                        className="w-full px-4 md:px-5 py-2 md:py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm"
                      >
                        Смотреть кейс
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setActiveCaseIndex(Math.max(0, activeCaseIndex - 1))}
              disabled={activeCaseIndex === 0}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg md:text-2xl"
            >
              ←
            </button>
            <button
              onClick={() => setActiveCaseIndex(Math.min(caseStudies.length - 1, activeCaseIndex + 1))}
              disabled={activeCaseIndex === caseStudies.length - 1}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg md:text-2xl"
            >
              →
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {caseStudies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCaseIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeCaseIndex ? 'bg-cyan-400 w-8' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Additional CTA */}
          <div className="mt-8 md:mt-16 p-6 md:p-12 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl md:rounded-3xl text-center">
            <h3 className="text-xl md:text-3xl mb-4 md:mb-6">Нужен индивидуальный разбор вашего проекта?</h3>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <button
                onClick={() => {
                  const contactsSection = document.getElementById('contacts');
                  contactsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 md:px-8 md:py-4 bg-cyan-500 hover:bg-cyan-400 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-sm md:text-base"
              >
                Обсудить задачу
              </button>
              <a
                href="https://drive.google.com/uc?export=download&id=15tT4SJQlCEIzag-Ske7feCRRUBaLJLhn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 md:px-8 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl transition-all text-sm md:text-base"
              >
                Скачать PDF-кейсбук
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Case Details Modal */}
      {selectedCase !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedCase(null)}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#0a1117] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 animate-[scaleIn_0.4s_ease-out] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-6">
                <img
                  src={caseStudies[selectedCase].logo}
                  alt={caseStudies[selectedCase].company}
                  className={`object-contain ${
                    caseStudies[selectedCase].company === 'Carlo LexOne' ? 'w-28 h-28 rounded-xl bg-white p-3' :
                    caseStudies[selectedCase].company === 'Феникс' ? 'w-32 h-32' :
                    caseStudies[selectedCase].company === 'Formula Natural' ? 'w-36 h-36' :
                    caseStudies[selectedCase].company === 'Ivalar' ? 'w-36 h-36' :
                    caseStudies[selectedCase].company === 'Ким Медикал' ? 'w-32 h-32 rounded-xl bg-white/95 p-3' :
                    'w-28 h-28'
                  }`}
				  loading="lazy"
                />
                <h3 className="text-4xl">{caseStudies[selectedCase].company}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Task */}
            <div className="mb-8">
              <h4 className="text-sm text-cyan-400/70 mb-3 uppercase tracking-wider">Задача</h4>
              <p className="text-lg text-white/70 leading-relaxed">{caseStudies[selectedCase].task}</p>
            </div>

            {/* What was done */}
            <div className="mb-8">
              <h4 className="text-sm text-cyan-400/70 mb-3 uppercase tracking-wider">Что делал</h4>
              <ul className="space-y-3">
                {caseStudies[selectedCase].whatDid.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-white/70 leading-relaxed flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results */}
            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 rounded-2xl">
              <h4 className="text-sm text-amber-400/90 mb-4 uppercase tracking-wider">Результаты</h4>
              <ul className="space-y-3">
                {caseStudies[selectedCase].results.map((result, resultIdx) => (
                  <li key={resultIdx} className="text-lg text-white/90 leading-relaxed">
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3 md:mb-4">
              <span className="text-sm text-white/70">Управленческая аналитика</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight mb-4 md:mb-6">
              Превращаю цифры<br />
              в управленческие решения
            </h2>

            <p className="text-sm md:text-base text-white/60 leading-relaxed">
              Для меня таблица — не отчёт ради отчёта, а инструмент управления магазином. Она помогает видеть риски
              по товару, рекламе, остаткам, марже и оборачиваемости до того, как проблема станет дорогой.
            </p>
          </div>

          {/* Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left - Tabs and Data */}
            <div className="lg:col-span-8 space-y-3 md:space-y-4">
              {/* Tabs - Browser style for mobile */}
              <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 border-b border-white/5 md:border-b-0">
                {analyticsData.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveAnalyticsTab(item.id)}
                    className={`px-3 py-2 md:px-6 md:py-3 rounded-t-xl md:rounded-xl border-t border-l border-r md:border whitespace-nowrap transition-all text-xs md:text-base ${
                      activeAnalyticsTab === item.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white -mb-px md:mb-0'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:border-white/10 hover:text-white/80'
                    }`}
                  >
                    {item.tabName}
                  </button>
                ))}
              </div>

              {/* Active Content */}
              {(() => {
                const activeData = analyticsData.find(d => d.id === activeAnalyticsTab);
                if (!activeData) return null;

                return (
                  <div className="space-y-3 md:space-y-4">
                    {/* Title and Description */}
                    <div className="p-3 md:p-4 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl md:rounded-2xl">
                      <h3 className="text-base md:text-xl mb-1.5 md:mb-2">{activeData.title}</h3>
                      <p className="text-xs md:text-sm text-white/60 leading-relaxed">{activeData.description}</p>
                    </div>

                    {/* Mock Table */}
                    <div className="p-3 md:p-5 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl md:rounded-2xl overflow-x-auto">
                      <table className="w-full text-[10px] md:text-xs">
                        <thead>
                          <tr className="border-b border-white/5">
                            {activeData.tableHeaders.map((header, idx) => (
                              <th key={idx} className="text-left py-1.5 md:py-2 px-2 md:px-3 text-white/50 font-normal whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeData.mockData.map((row, idx) => (
                            <tr key={idx} className="border-b border-white/5">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className={`py-1.5 md:py-2 px-2 md:px-3 whitespace-nowrap ${
                                  typeof cell === 'string' && (cell.includes('+') || cell.includes('−'))
                                    ? cell.includes('+') ? 'text-green-400' : 'text-red-400'
                                    : 'text-white/70'
                                }`}>
                                  {typeof cell === 'string' && cell.startsWith('SKU ') ? cell.replace('SKU ', '') : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right - Insights */}
            <div className="lg:col-span-4 space-y-2 md:space-y-3">
              {analyticsInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 md:p-4 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl md:rounded-2xl hover:border-white/10 transition-all"
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 text-sm">{insight.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-xs mb-0.5 md:mb-1">{insight.title}</h4>
                      <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto" id="about">
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4">
              <span className="text-sm text-white/70">Обо мне</span>
            </div>

            <h2 className="text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              Я работаю на стыке<br />
              маркетплейсов, аналитики<br />
              и управления
            </h2>

            <div className="space-y-3 text-sm text-white/60 leading-relaxed">
              <p>
                Я не смотрю на WB и Ozon как на набор отдельных действий: карточки, реклама, поставки, SEO.
                Для меня маркетплейс — это бизнес-система, где каждый элемент влияет на прибыльность и рост.
              </p>
              <p>
                Поэтому в работе я сначала ищу логику проекта: где деньги зарабатываются, где теряются,
                какие решения дают результат, а какие только создают видимость активности.
              </p>
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {aboutFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                >
                  <div className="w-8 h-8 mb-3 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <span className="text-cyan-400 text-sm">{fact.icon}</span>
                  </div>
                  <h4 className="text-xs mb-1.5">{fact.title}</h4>
                  <p className="text-xs text-white/60 leading-relaxed">{fact.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const contactsSection = document.getElementById('contacts');
                contactsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex px-8 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-sm"
            >
              Обсудить задачу
            </button>
          </div>

          {/* Right Photo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/5">
              <img
                src={authorPhoto}
                alt="Консультант по маркетплейсам"
                className="w-full h-[650px] object-cover object-[center_20%]"
				loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-3">
            <span className="text-sm text-white/70">Обо мне</span>
          </div>

          <h2 className="text-2xl md:text-3xl leading-[1.15] tracking-tight mb-4">
            Я работаю на стыке<br />
            маркетплейсов, аналитики<br />
            и управления
          </h2>

          <div className="space-y-2 text-xs text-white/60 leading-relaxed mb-4">
            <p>
              Я не смотрю на WB и Ozon как на набор отдельных действий: карточки, реклама, поставки, SEO.
              Для меня маркетплейс — это бизнес-система, где каждый элемент влияет на прибыльность и рост.
            </p>
            <p>
              Поэтому в работе я сначала ищу логику проекта: где деньги зарабатываются, где теряются,
              какие решения дают результат, а какие только создают видимость активности.
            </p>
          </div>

          {/* Photo Left + Cards Right with Overlap */}
          <div className="relative flex gap-3">
            {/* Photo */}
            <div className="w-[45%] relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-60" />
              <div className="relative rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={authorPhoto}
                  alt="Консультант по маркетплейсам"
                  className="w-full h-[400px] object-cover object-[center_20%]"
				  loading="lazy"
                />
              </div>
            </div>

            {/* Cards with Different Overlaps */}
            <div className="flex-1 space-y-2.5 -ml-12 relative z-10">
              {aboutFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl hover:border-white/20 transition-all ${
                    idx === 0 ? 'ml-8' : idx === 1 || idx === 2 ? 'ml-4' : 'ml-8'
                  }`}
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 text-xs">{fact.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] mb-0.5 leading-tight">{fact.title}</h4>
                      <p className="text-[9px] text-white/60 leading-tight line-clamp-2">{fact.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 max-w-[1400px] mx-auto" id="faq">
        <div className="space-y-6">
          {/* Header */}
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4">
              <span className="text-sm text-white/70">FAQ</span>
            </div>

            <h2 className="text-4xl md:text-5xl leading-[1.15] tracking-tight mb-3">
              Частые вопросы
            </h2>

            <p className="text-white/60 leading-relaxed">
              Здесь собраны ответы на вопросы, которые чаще всего возникают перед началом работы.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className={`p-4 bg-white/[0.02] backdrop-blur-sm border rounded-2xl transition-all cursor-pointer ${
                  openFaqIndex === idx
                    ? 'border-cyan-500/30 bg-cyan-500/5'
                    : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-xs mt-1 ${openFaqIndex === idx ? 'text-cyan-400' : 'text-white/40'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h3 className={`mb-2 ${openFaqIndex === idx ? 'text-white' : 'text-white/80'}`}>
                        {faq.question}
                      </h3>
                      {openFaqIndex === idx && (
                        <div className="text-sm text-white/60 leading-relaxed space-y-2 animate-[fadeIn_0.3s_ease-out]">
                          {faq.answer.split('\n').map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white/40 text-sm">
                    {openFaqIndex === idx ? '−' : '+'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-6 p-5 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">?</span>
                </div>
                <div>
                  <h3 className="mb-1">Не нашли ответ на свой вопрос?</h3>
                  <p className="text-sm text-white/60">
                    Напишите — отвечу лично и помогу понять, какой формат подойдёт под вашу задачу.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const contactsSection = document.getElementById('contacts');
                  contactsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap text-sm"
              >
                Обсудить задачу
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA / Contacts Section */}
      <section className="relative z-10 px-4 md:px-8 py-12 md:py-20 max-w-[1400px] mx-auto" id="contacts">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          {/* Header */}
          <div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight mb-4 md:mb-8">Разберу ваш проект<br />и найду точки роста</h2>

            <p className="text-sm md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Напишите мне — обсудим задачу и выберем подходящий формат: аудит, расчёт товара,
              разбор ниши, консультацию или сопровождение специалиста.
            </p>
          </div>

          {/* Main Contact Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <a
              href="http://t.me/Kolyanist"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 md:px-8 md:py-4 bg-[#0088cc] hover:bg-[#0077b5] rounded-2xl transition-all shadow-lg flex items-center gap-2.5 md:gap-3 w-full sm:w-auto justify-center text-sm md:text-base"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              Написать в Telegram
            </a>
            <a
              href="https://max.ru/u/f9LHodD0cOKdiwyIiwHGKtFSWeoAJzQyPOwo6s9KLlZZ455SYkfsLtM9Tn0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 md:px-8 md:py-4 bg-[#0066FF] hover:bg-[#0052CC] rounded-2xl transition-all shadow-lg flex items-center gap-2.5 md:gap-3 w-full sm:w-auto justify-center text-sm md:text-base"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              Написать в Max
            </a>
            <a
              href="https://wa.me/79046320024"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 md:px-8 md:py-4 bg-[#1ea855] hover:bg-[#188f48] rounded-2xl transition-all shadow-lg flex items-center gap-2.5 md:gap-3 w-full sm:w-auto justify-center text-sm md:text-base"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              Написать в WhatsApp
            </a>
          </div>

          {/* Additional Links */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-3 md:pt-4">
            <a
              href="https://drive.google.com/uc?export=download&id=15tT4SJQlCEIzag-Ske7feCRRUBaLJLhn"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex items-center gap-3"
            >
              <FileText className="w-4 h-4" />
              Скачать PDF-кейсбук
            </a>
            <a
              href="#cases"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex items-center gap-3"
            >
              <TrendingUp className="w-4 h-4" />
              Смотреть кейсы
            </a>
          </div>
        </div>
      </section>

      {/* Floating CTA Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-8 right-0 z-50">
        <button
          onClick={() => {
            if (floatingButtonExpanded) {
              const contactsSection = document.getElementById('contacts');
              contactsSection?.scrollIntoView({ behavior: 'smooth' });
              setFloatingButtonExpanded(false);
            } else {
              setFloatingButtonExpanded(true);
            }
          }}
          className={`flex items-center gap-3 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-l-2xl shadow-lg shadow-cyan-500/20 transition-all duration-300 ${
            floatingButtonExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-30px)]'
          }`}
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap text-sm font-medium">Обсудить задачу</span>
        </button>
      </div>
    </Layout>
  );
}

const faqData = [
  {
    question: 'Вы ведёте кабинеты под ключ?',
    answer: 'Нет, я не продаю классическое операционное ведение. Мой фокус — аудит, аналитика, расчёты, разборы, обучение и консультационный контроль.\nЯ могу помочь вашему специалисту, команде или вам лично принимать более точные решения.'
  },
  {
    question: 'Что я получу после аудита?',
    answer: 'Вы получите список слабых мест, выводы по экономике, рекламе, ассортименту и процессам, а также приоритетный план действий: что исправлять первым, что считать, что тестировать и где теряются деньги.'
  },
  {
    question: 'Нужны ли доступы к кабинетам?',
    answer: 'Для глубокого разбора — да, нужны данные по продажам, рекламе, остаткам, карточкам и экономике.\nДля первичной консультации можно начать с вводных, выгрузок или текущих таблиц.'
  },
  {
    question: 'Можно ли работать разово?',
    answer: 'Да. Можно начать с разового аудита, расчёта товара, разбора ниши или консультации. Если после этого понадобится регулярный контроль, можно перейти к сопровождению.'
  },
  {
    question: 'Можно ли сопровождать моего специалиста?',
    answer: 'Да. Это один из удобных форматов: я не забираю операционку на себя, а помогаю специалисту или команде двигаться по правильной логике, проверять решения и не терять фокус.'
  },
  {
    question: 'С какими проектами вы работаете?',
    answer: 'С продавцами и командами на Wildberries и Ozon: от запуска новых товаров до работающих магазинов, где нужно найти причины просадок, повысить рентабельность или навести порядок в управлении.'
  }
];

const aboutFacts = [
  {
    icon: '🚀',
    title: 'Запуск и масштабирование',
    description: 'Опыт запуска и масштабирования магазинов на Wildberries и Ozon.'
  },
  {
    icon: '⚙️',
    title: 'Системный подход',
    description: 'Работа с ассортиментом, рекламой, экономикой, командой и процессами.'
  },
  {
    icon: '📈',
    title: 'Реальные результаты',
    description: 'Кейсы с ростом оборота, рентабельности и оборачиваемости.'
  },
  {
    icon: '🎯',
    title: 'Фокус работы',
    description: 'Аудит, расчёты, обучение и консультационное сопровождение без ежедневной операционки.'
  }
];

const analyticsData = [
  {
    id: 'economics',
    tabName: 'Экономика',
    title: 'РНП и прибыльность',
    description: 'Видно, какие SKU зарабатывают, а какие съедают деньги.',
    whatHelps: [
      'где реальная прибыль',
      'какие товары работают в минус',
      'где маржа уходит в скидки, рекламу или логистику',
      'какие SKU стоит усиливать, пересчитать или убрать'
    ],
    tableHeaders: ['SKU', 'Продажи', 'РНП %', 'ДРР %', 'Маржа %', 'Прибыль'],
    mockData: [
      ['SKU 001', '156 шт', '+14.2%', '8.5%', '42%', '+22 тыс ₽'],
      ['SKU 002', '89 шт', '−2.1%', '15.2%', '28%', '−5 тыс ₽'],
      ['SKU 003', '234 шт', '+18.5%', '6.8%', '51%', '+48 тыс ₽'],
      ['SKU 004', '45 шт', '+5.3%', '12.1%', '35%', '+8 тыс ₽']
    ]
  },
  {
    id: 'inventory',
    tabName: 'Остатки',
    title: 'Остатки и оборачиваемость',
    description: 'Понятно, где дефицит, неликвид и замороженные деньги.',
    whatHelps: [
      'какие товары заканчиваются слишком быстро',
      'где деньги лежат на складе',
      'какие позиции тормозят оборот',
      'как планировать поставки осознаннее'
    ],
    tableHeaders: ['SKU', 'Остаток', 'Оборач., дн', 'Статус', 'В пути', 'Рекомендация'],
    mockData: [
      ['SKU 001', '23 шт', '12 дн', 'Дефицит', '100 шт', 'Ускорить поставку'],
      ['SKU 002', '456 шт', '89 дн', 'Неликвид', '0 шт', 'Остановить закупки'],
      ['SKU 003', '67 шт', '18 дн', 'Норма', '80 шт', 'По плану'],
      ['SKU 004', '189 шт', '45 дн', 'Избыток', '0 шт', 'Снизить остаток']
    ]
  },
  {
    id: 'advertising',
    tabName: 'Реклама',
    title: 'Реклама и ДРР',
    description: 'Видно, где реклама масштабируется, а где просто сжигает бюджет.',
    whatHelps: [
      'какие кампании дают результат',
      'где рекламные расходы выше нормы',
      'какие товары не выдерживают рекламу по экономике',
      'что отключить, усилить или протестировать'
    ],
    tableHeaders: ['SKU', 'Расход', 'ДРР %', 'Продажи', 'ROI', 'Действие'],
    mockData: [
      ['SKU 001', '8.5 тыс ₽', '8.5%', '156 шт', '3.2x', 'Масштабировать'],
      ['SKU 002', '12.1 тыс ₽', '15.2%', '89 шт', '0.9x', 'Отключить'],
      ['SKU 003', '6.8 тыс ₽', '6.8%', '234 шт', '4.1x', 'Усилить'],
      ['SKU 004', '10.2 тыс ₽', '12.1%', '45 шт', '1.8x', 'Оптимизировать']
    ]
  },
  {
    id: 'assortment',
    tabName: 'Ассортимент',
    title: 'Ассортимент и точки роста',
    description: 'Видно, какие товары развивать, какие пересчитать и где есть потенциал расширения.',
    whatHelps: [
      'какие SKU дают основу проекта',
      'какие товары мешают росту',
      'где есть потенциал новой линейки',
      'как смотреть на ассортимент как на систему'
    ],
    tableHeaders: ['SKU', 'Категория', 'Доля выручки', 'Рентабельность', 'Потенциал', 'Решение'],
    mockData: [
      ['SKU 001', 'Основная', '42%', '+14.2%', 'Высокий', 'Расширять'],
      ['SKU 002', 'Доп.', '8%', '−2.1%', 'Низкий', 'Убрать'],
      ['SKU 003', 'Основная', '38%', '+18.5%', 'Высокий', 'Усиливать'],
      ['SKU 004', 'Тестовая', '12%', '+5.3%', 'Средний', 'Наблюдать']
    ]
  }
];

const analyticsInsights = [
  {
    icon: '💰',
    title: 'РНП и прибыльность',
    description: 'Видно, какие SKU зарабатывают, а какие съедают деньги.'
  },
  {
    icon: '📦',
    title: 'Остатки и оборачиваемость',
    description: 'Понятно, где дефицит, неликвид и замороженные деньги.'
  },
  {
    icon: '📢',
    title: 'Реклама и ДРР',
    description: 'Видно, где реклама масштабируется, а где просто сжигает бюджет.'
  },
  {
    icon: '✓',
    title: 'План действий',
    description: 'Цифры превращаются в конкретные решения: что отключить, что усилить, что пересчитать и что проверить следующим шагом.'
  }
];

const caseStudies = [
  {
    company: 'Carlo LexOne',
    logo: carloLogo,
    task: 'Масштабировать бренд и параллельно запустить новый магазин.',
    whatDid: [
      'управлял ассортиментом и ценообразованием',
      'усиливал карточки и SEO, ставил ТЗ на контент',
      'контролировал рекламу и масштабирование',
      'запускал новые SKU и новый магазин'
    ],
    results: [
      'Ozon: 1,83 → 10,0 млн ₽ (окт 2024 → дек 2024)',
      'Wildberries: 5,52 → 19,18 млн ₽ (апр 2025 → авг 2025)',
      'Новый магазин: 4 SKU → 8,07 млн ₽ (во 2-й месяц работы)'
    ]
  },
  {
    company: 'Феникс',
    logo: phoenixLogo,
    task: 'Вывести проект из минусовой экономики и собрать управляемую модель роста.',
    whatDid: [
      'пересчитал юнит-экономику и прибыльность',
      'оптимизировал логистику/схемы поставок',
      'убрал перекосы по остаткам и неликвиду',
      'собрал команду и внедрил управленческие таблицы/калькуляторы'
    ],
    results: [
      'рентабельность: −3% → +15%',
      'запущен второй магазин с нуля: до 1,4 млн ₽ оборота',
      'прибыль нового магазина: ~350 тыс ₽'
    ]
  },
  {
    company: 'Formula Natural',
    logo: formulaLogo,
    task: 'Запустить неизвестный бренд в рознице через маркетплейсы и довести до продаж.',
    whatDid: [
      'запустил кабинеты и базовую экономику',
      'собрал карточки, SEO, запустил рекламу',
      'координировал rich-контент/инфографику/креативы',
      'выстроил аналитику и отгрузки'
    ],
    results: [
      'старт с нуля',
      'рост до 7,72 млн ₽ за 3 месяца',
      'сформирована база для дальнейшего развития'
    ]
  },
  {
    company: 'Ivalar',
    logo: ivalarLogo,
    task: 'Усилить категорийное управление, ускорить оборачиваемость и повысить эффективность направления.',
    whatDid: [
      'управлял направлением и работой через сотрудников',
      'работал со стратегией категории, ценами, отчётностью',
      'дорабатывал аналитику и инвестиционную модель',
      'синхронизировал процессы по остаткам/контенту/операционке'
    ],
    results: [
      'сумма заказов: 6,8 → 25,1 млн ₽',
      'фактическая выручка: 5,3 → 18,5 млн ₽',
      'оборачиваемость: 136 → 97 дней',
      'рентабельность категории: +15%'
    ]
  },
  {
    company: 'Ким Медикал',
    logo: kimLogo,
    task: 'Собрать розничную функцию внутри оптовой компании практически с нуля: команда, контент, ассортимент и рост продаж.',
    whatDid: [
      'развивал маркетплейс-направление как отдельную функцию',
      'собрал и обучил сотрудников, выстроил процессы',
      'организовал производство контента и инфографики',
      'запускал новые продуктовые блоки',
      'вел ассортимент, карточки, рекламу и аналитику'
    ],
    results: [
      '800+ товаров — организовано создание инфографики',
      '1,06 млн ₽ — с 1 SKU по FBO-модели к марту 2026'
    ]
  }
];

const processSteps = [
  {
    number: '1',
    title: 'Вводные',
    description: 'Вы описываете задачу, текущую ситуацию, цели и ограничения проекта.',
    content: [
      {
        label: 'Что нужно от вас',
        points: [
          'что продаёте',
          'на каких площадках работаете',
          'какая сейчас проблема',
          'какие цели хотите достичь',
          'какие данные готовы показать'
        ]
      },
      {
        label: 'Что получаете',
        points: [
          'Понимание, какой формат работы подходит: аудит, расчёт, разбор, обучение или сопровождение'
        ]
      }
    ]
  },
  {
    number: '2',
    title: 'Данные',
    description: 'Собираю и смотрю данные, без которых невозможно сделать нормальный вывод.',
    content: [
      {
        label: 'Что анализирую',
        points: [
          'кабинеты WB/Ozon',
          'отчёты по продажам',
          'рекламу',
          'остатки',
          'карточки',
          'таблицы и расчёты'
        ]
      },
      {
        label: 'Что получаете',
        points: [
          'Чёткое понимание, какие данные есть, чего не хватает и насколько проект сейчас управляем'
        ]
      }
    ]
  },
  {
    number: '3',
    title: 'Диагностика',
    description: 'Нахожу слабые места, потери, ошибки и точки роста.',
    content: [
      {
        label: 'Что анализирую',
        points: [
          'экономику проекта',
          'рекламу и ДРР',
          'ассортимент и SKU',
          'остатки и поставки',
          'карточки и процессы'
        ]
      },
      {
        label: 'Что нахожу',
        points: [
          'скрытые потери',
          'неочевидные ошибки',
          'узкие места в росте',
          'просадки в управлении'
        ]
      }
    ]
  },
  {
    number: '4',
    title: 'Расчёты',
    description: 'Перевожу наблюдения в цифры: где проект зарабатывает, где теряет и какие решения имеют экономический смысл.',
    content: [
      {
        label: 'Что считаю',
        points: [
          'маржу',
          'рентабельность',
          'ДРР',
          'прибыльность SKU',
          'оборачиваемость',
          'потенциал роста'
        ]
      },
      {
        label: 'Что получаете',
        points: [
          'Расчёты, которые помогают принимать решения не "по ощущению", а по фактам'
        ]
      }
    ]
  },
  {
    number: '5',
    title: 'План действий',
    description: 'Собираю выводы в понятный порядок действий: что делать первым, что вторым, что тестировать и что не трогать.',
    content: [
      {
        label: 'Что входит в план',
        points: [
          'приоритеты',
          'быстрые исправления',
          'стратегические изменения',
          'рекомендации по рекламе',
          'решения по ассортименту'
        ]
      },
      {
        label: 'Что получаете',
        points: [
          'Не просто список проблем, а понятный маршрут: куда двигаться и почему именно так'
        ]
      }
    ]
  },
  {
    number: '6',
    title: 'Передача',
    description: 'Объясняю выводы владельцу, специалисту или команде. Отвечаю на вопросы и помогаю понять логику решений.',
    content: [
      {
        label: 'Формат',
        points: [
          'созвон',
          'презентация выводов',
          'комментарии по расчётам',
          'ответы на вопросы',
          'рекомендации по внедрению'
        ]
      },
      {
        label: 'Что получаете',
        points: [
          'Понимание, что происходит с проектом, что делать дальше и как контролировать выполнение'
        ]
      }
    ]
  }
];

const oneTimeServices = [
  {
    id: 'express',
    number: '01.',
    title: 'Экспресс-аудит',
    short: 'Быстро выявляю слабые места и приоритеты.',
    forWhom: 'Если нужно быстро понять, где просадки и что исправлять первым.',
    included: [
      'экономика',
      'реклама',
      'карточки',
      'остатки',
      'ассортимент',
      'базовая диагностика'
    ],
    result: 'Список слабых мест и приоритетный план действий.',
    cta: 'Заказать аудит'
  },
  {
    id: 'niche',
    number: '02.',
    title: 'Расчёт товара / ниши',
    short: 'Проверяю спрос, конкуренцию, маржу и риски.',
    forWhom: 'Если вы планируете запуск нового товара, категории или магазина и хотите заранее понять экономику.',
    included: [
      'спрос',
      'конкуренты',
      'маржа',
      'логистика',
      'комиссии',
      'риски входа'
    ],
    result: 'Понятный вывод: заходить, не заходить или заходить только при определённых условиях.',
    cta: 'Рассчитать нишу'
  },
  {
    id: 'deep',
    number: '03.',
    title: 'Глубокий разбор проекта',
    short: 'Детально разбираю проект и нахожу точки роста.',
    forWhom: 'Если магазин уже работает, но прибыль, рост или управляемость ниже ожиданий.',
    included: [
      'экономика и ДРР',
      'ассортимент',
      'оборачиваемость',
      'реклама',
      'карточки',
      'процессы и команда'
    ],
    result: 'Детальная карта проблем, выводы по ключевым зонам и план изменений.',
    cta: 'Получить разбор'
  }
];

const ongoingServices = [
  {
    id: 'immersion',
    number: '01.',
    title: '3-дневное погружение',
    short: 'Быстро нахожу корень проблем и собираю план решений.',
    forWhom: 'Если нужно "разобраться, почему не едет" и получить чёткие приоритеты без операционки.',
    included: [
      'День 1 — вводные, цели, доступы/выгрузки, карта проекта',
      'День 2 — диагностика (экономика / реклама / ассортимент / остатки / карточки / процессы)',
      'День 3 — разбор находок + план действий на 2–4 недели + "как контролировать"'
    ],
    result: 'Карта слабых мест + причины, список приоритетов (что делать первым), конкретный план действий с метриками контроля.',
    cta: 'Запросить погружение'
  },
  {
    id: 'education',
    number: '02.',
    title: 'Обучение владельца / менеджера',
    short: 'Учу принимать решения по цифрам и управлять специалистами.',
    forWhom: 'Если хочешь не зависеть от исполнителей и понимать "что происходит и что делать".',
    included: [
      'экономика и юнит-экономика (что реально приносит прибыль)',
      'реклама и ДРР: логика управления и проверки гипотез',
      'ассортимент/остатки: оборачиваемость, ликвидность, приоритеты SKU',
      'карточки/контент: что влияет на конверсию и как это проверять',
      'шаблон еженедельного контроля (план-факт-решения)'
    ],
    result: 'Понятная система контроля (чек-лист + таблица/шаблон), навык "видеть проблему → считать → решать", менеджер начинает действовать осознанно, а не "тыкать кнопки".',
    cta: 'Обсудить обучение',
    note: 'Длительность подберём: 2 недели или 1 месяц'
  },
  {
    id: 'control',
    number: '03.',
    title: 'Консультационный контроль',
    short: 'Еженедельная управленческая сессия + корректировки курса.',
    forWhom: 'Есть менеджер/команда, но нужен внешний "навигатор" и контроль качества решений.',
    included: [
      '1 созвон в неделю (60–90 мин)',
      'разбор цифр/результатов недели',
      'что делаем дальше: 3–5 приоритетов и контроль метрик',
      'помощь в сложных решениях (ассортимент, реклама, экономика)'
    ],
    result: 'Меньше хаоса, больше управляемости. Менеджер делает правильные действия и доводит до результата. Владелец видит картину и держит фокус на прибыли.',
    cta: 'Запросить контроль'
  }
];

const diagnosticTabs = [
  {
    id: 'economy',
    number: '01.',
    title: 'Экономика',
    description: 'Проверяю, зарабатывает ли проект на самом деле, а не только показывает оборот.',
    whatICheck: [
      'маржу по SKU',
      'комиссии и скидки',
      'логистику и себестоимость',
      'фактическую прибыльность',
      'экономику по категориям'
    ],
    problemSigns: [
      'продажи есть, прибыли почти нет',
      'скидки съедают маржу',
      'неочевидные расходы и потери',
      'ошибки в расчётах юнит-экономики',
      'владелец не видит реальную картину'
    ],
    results: [
      'понятную модель экономики',
      'точки потерь и риска',
      'приоритеты для исправления',
      'решения по ассортименту и ценам',
      'основание для дальнейшего роста'
    ]
  },
  {
    id: 'advertising',
    number: '02.',
    title: 'Реклама',
    description: 'Разбираю, где реклама помогает расти, а где просто сжигает бюджет.',
    whatICheck: [
      'ДРР и рекламные расходы',
      'эффективность кампаний',
      'связку реклама → карточка → продажа',
      'ставки и стратегии',
      'масштабируемость рекламных решений'
    ],
    problemSigns: [
      'реклама есть, но прибыль не растёт',
      'ДРР выше допустимого',
      'кампании работают без понятной логики',
      'бюджет уходит на слабые SKU',
      'нет контроля эффективности'
    ],
    results: [
      'понимание, что отключить, что усилить и что тестировать',
      'приоритеты по рекламным кампаниям',
      'рекомендации по ставкам и связкам',
      'логику контроля рекламных решений'
    ]
  },
  {
    id: 'assortment',
    number: '03.',
    title: 'Ассортимент',
    description: 'Смотрю, какие товары тянут проект вверх, а какие замораживают деньги и мешают росту.',
    whatICheck: [
      'сильные и слабые SKU',
      'прибыльность товаров',
      'потенциал расширения',
      'неликвид',
      'структуру товарной матрицы'
    ],
    problemSigns: [
      'часть товаров продаётся, но не зарабатывает',
      'деньги зависают в слабом ассортименте',
      'непонятно, что закупать дальше',
      'новые SKU запускаются без расчётов',
      'ассортимент растёт хаотично'
    ],
    results: [
      'понимание, какие товары усиливать',
      'какие SKU пересчитать или убрать',
      'где есть потенциал роста',
      'как смотреть на ассортимент как на систему'
    ]
  },
  {
    id: 'inventory',
    number: '04.',
    title: 'Остатки и поставки',
    description: 'Проверяю, где деньги заморожены в товаре, а где проект теряет продажи из-за дефицита.',
    whatICheck: [
      'остатки',
      'оборачиваемость',
      'планирование поставок',
      'дефицит',
      'неликвид',
      'скорость движения товара'
    ],
    problemSigns: [
      'товара много, но денег не хватает',
      'ходовые позиции заканчиваются',
      'слабые товары лежат на складах',
      'поставки планируются "на глаз"',
      'нет понятного контроля оборачиваемости'
    ],
    results: [
      'понимание, где заморожены деньги',
      'рекомендации по остаткам',
      'приоритеты по поставкам',
      'решения по неликвиду',
      'основу для планирования закупок'
    ]
  },
  {
    id: 'cards',
    number: '05.',
    title: 'Карточки и SEO',
    description: 'Смотрю, насколько карточки помогают продавать, а не просто "есть на площадке".',
    whatICheck: [
      'заголовки и ключи',
      'инфографику',
      'фото и визуальную подачу',
      'описание и характеристики',
      'конверсию карточек',
      'видимость в поиске'
    ],
    problemSigns: [
      'карточки получают трафик, но плохо конвертят',
      'инфографика не объясняет ценность товара',
      'слабая SEO-структура',
      'карточка не отвечает на вопросы покупателя',
      'товар проигрывает конкурентам в подаче'
    ],
    results: [
      'список слабых мест в карточках',
      'рекомендации по контенту',
      'направления для SEO-доработки',
      'приоритеты по улучшению конверсии'
    ]
  },
  {
    id: 'process',
    number: '06.',
    title: 'Процессы',
    description: 'Проверяю, как внутри проекта принимаются решения и почему команда может работать хаотично.',
    whatICheck: [
      'отчётность',
      'зоны ответственности',
      'скорость решений',
      'работу специалиста или команды',
      'таблицы и контрольные показатели',
      'регулярность анализа'
    ],
    problemSigns: [
      'решения принимаются без цифр',
      'задачи ставятся хаотично',
      'специалист делает действия, но не объясняет логику',
      'нет единой картины проекта',
      'владелец не понимает, что происходит'
    ],
    results: [
      'понятную систему контроля',
      'список ключевых показателей',
      'правила принятия решений',
      'рекомендации по работе команды',
      'снижение хаоса в управлении'
    ]
  }
];