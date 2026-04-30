import { useMemo, useState } from 'react';

interface CalculatorInput {
  sellPrice: string;
  costPrice: string;
  wbCommissionPct: string;
  logisticsPerUnit: string;
  storagePerUnit: string;
  adsPct: string;
  returnsPct: string;
  taxPct: string;
  otherPerUnit: string;
}

const initialInput: CalculatorInput = {
  sellPrice: '2500',
  costPrice: '900',
  wbCommissionPct: '18',
  logisticsPerUnit: '120',
  storagePerUnit: '20',
  adsPct: '10',
  returnsPct: '5',
  taxPct: '6',
  otherPerUnit: '50',
};

const toNumber = (value: string) => {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('ru-RU', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function WbCalculatorPage() {
  const [input, setInput] = useState<CalculatorInput>(initialInput);

  const result = useMemo(() => {
    const sellPrice = toNumber(input.sellPrice);
    const costPrice = toNumber(input.costPrice);
    const wbCommissionPct = toNumber(input.wbCommissionPct) / 100;
    const logisticsPerUnit = toNumber(input.logisticsPerUnit);
    const storagePerUnit = toNumber(input.storagePerUnit);
    const adsPct = toNumber(input.adsPct) / 100;
    const returnsPct = toNumber(input.returnsPct) / 100;
    const taxPct = toNumber(input.taxPct) / 100;
    const otherPerUnit = toNumber(input.otherPerUnit);

    const revenueNet = sellPrice * (1 - returnsPct);
    const wbFee = sellPrice * wbCommissionPct;
    const adsCost = sellPrice * adsPct;
    const taxCost = sellPrice * taxPct;

    const totalCost = costPrice + wbFee + logisticsPerUnit + storagePerUnit + adsCost + taxCost + otherPerUnit;
    const unitProfit = revenueNet - totalCost;
    const marginPct = revenueNet > 0 ? unitProfit / revenueNet : 0;
    const breakEvenPrice = 1 - returnsPct > 0 ? totalCost / (1 - returnsPct) : 0;

    return { revenueNet, wbFee, adsCost, taxCost, totalCost, unitProfit, marginPct, breakEvenPrice };
  }, [input]);

  return (
    <div className="min-h-screen bg-[#050A0E] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/30 rounded-full blur-[150px]" />
        <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-amber-500/30 rounded-full blur-[150px]" />
      </div>

      <section className="relative z-10 px-4 md:px-8 py-10 md:py-16 max-w-[1000px] mx-auto">
        <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-5">
          <span className="text-sm text-cyan-300">MVP · Калькулятор Wildberries</span>
        </div>

        <h1 className="text-3xl md:text-5xl leading-[1.1] tracking-tight mb-4">Калькулятор юнит-экономики WB</h1>
        <p className="text-sm md:text-base text-white/60 leading-relaxed mb-8 max-w-2xl">
          Страница не добавлена в меню лендинга и доступна только по прямой ссылке. Это первая версия без API — все данные вводятся вручную.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl space-y-3">
            {Object.entries({
              'Цена продажи, ₽': 'sellPrice',
              'Себестоимость, ₽': 'costPrice',
              'Комиссия WB, %': 'wbCommissionPct',
              'Логистика, ₽': 'logisticsPerUnit',
              'Хранение, ₽': 'storagePerUnit',
              'Реклама (ДРР), %': 'adsPct',
              'Возвраты, %': 'returnsPct',
              'Налог, %': 'taxPct',
              'Прочие расходы, ₽': 'otherPerUnit',
            }).map(([label, key]) => (
              <label key={key} className="block">
                <span className="text-xs text-white/60">{label}</span>
                <input
                  value={input[key as keyof CalculatorInput]}
                  onChange={(e) => setInput((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/40"
                />
              </label>
            ))}
          </div>

          <div className="p-5 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl space-y-3">
            <h2 className="text-xl">Результаты</h2>
            <MetricRow label="Выручка с учётом возвратов" value={currency.format(result.revenueNet)} />
            <MetricRow label="Комиссия WB" value={currency.format(result.wbFee)} />
            <MetricRow label="Реклама" value={currency.format(result.adsCost)} />
            <MetricRow label="Налог" value={currency.format(result.taxCost)} />
            <MetricRow label="Полные затраты" value={currency.format(result.totalCost)} />
            <MetricRow label="Прибыль на единицу" value={currency.format(result.unitProfit)} accent />
            <MetricRow label="Маржинальность" value={percent.format(result.marginPct)} accent />
            <MetricRow label="Точка безубыточности" value={currency.format(result.breakEvenPrice)} />

            <div className="pt-4">
              <a href="/" className="inline-flex px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all">Вернуться на лендинг</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5">
      <span className="text-sm text-white/60">{label}</span>
      <span className={accent ? 'text-cyan-400 font-medium' : 'text-white'}>{value}</span>
    </div>
  );
}
