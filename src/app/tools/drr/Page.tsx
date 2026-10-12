import { useId, useState } from 'react';
import ToolPage from '../../components/tools/ToolPage';
import { Input } from '../../components/ui/input';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { tools } from '../registry';
import { calcBudget, calcMaxDrr, calcOrdersFromBudget } from './calc';

const tool = tools.find((entry) => entry.slug === 'drr')!;
const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
const panelClass = 'min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#0C141B]/80 p-4 sm:p-6';

function NumberField({ label, value, onChange, max, step = 1 }: {
  label: string; value: number; onChange: (value: number) => void; max?: number; step?: number;
}) {
  const id = useId();
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block text-sm text-white/80">{label}</label>
    <Input id={id} type="number" inputMode="decimal" value={Number.isNaN(value) ? '' : value} min={0} max={max} step={step}
      onChange={(event) => onChange(event.target.valueAsNumber)} className="min-w-0 bg-[#0C141B]" />
  </div>;
}

function ResultTable({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return <table className="w-full table-fixed text-sm">
    <caption className="sr-only">Прогноз рекламы за месяц</caption>
    <tbody>{rows.map(([label, value]) => <tr key={label} className="border-b border-white/10 last:border-0">
      <th scope="row" className="w-1/2 py-3 pr-2 text-left font-normal text-white/70">{label}</th>
      <td className="break-words py-3 text-right font-medium">{value}</td>
    </tr>)}</tbody>
  </table>;
}

function DrrStatus({ drr, limit }: { drr: number | null; limit: number | null }) {
  if (drr === null) return <p className="text-sm text-white/70">ДРР не определён: сумма заказов равна нулю.</p>;
  if (limit === null) return <p className="text-sm text-amber-200">Сравнение с допустимым ДРР недоступно. Проверьте цену и маржу в первом блоке.</p>;
  const exceeds = drr > limit;
  return <p className={'rounded-xl border p-3 text-sm leading-relaxed ' + (exceeds
    ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200')}>
    ДРР {formatPercent(drr)} {exceeds ? 'выше допустимого' : 'в пределах допустимого'} {formatPercent(limit)}.
    {exceeds ? ' Целевая маржа не достигается.' : ' Целевая маржа сохраняется в этой модели.'}
  </p>;
}

export default function DrrPage() {
  const [price, setPrice] = useState(2500);
  const [marginBeforeAdsPercent, setMargin] = useState(35);
  const [targetMarginPercent, setTargetMargin] = useState(20);
  const [cpc, setCpc] = useState(30);
  const [ctrPercent, setCtr] = useState(3);
  const [crPercent, setCr] = useState(5);
  const [targetOrders, setTargetOrders] = useState(300);
  const [budget, setBudget] = useState(180000);
  const funnel = { cpc, ctrPercent, crPercent };
  const maxDrr = calcMaxDrr({ price, marginBeforeAdsPercent, targetMarginPercent });
  const budgetResult = calcBudget({ ...funnel, targetOrders, price, marginBeforeAdsPercent });
  const ordersResult = calcOrdersFromBudget({ ...funnel, budget });
  const reverseMetrics = ordersResult ? calcBudget({ ...funnel, targetOrders: ordersResult.orders, price, marginBeforeAdsPercent }) : null;
  const budgetRows = budgetResult ? [
    ['Показы', formatNumber(budgetResult.impressions)], ['Клики', formatNumber(budgetResult.clicks)],
    ['Заказы', formatNumber(budgetResult.orders)], ['Бюджет', formatCurrency(budgetResult.budget)],
    ['CPO — стоимость заказа', budgetResult.cpo === null ? 'Не определено' : formatCurrency(budgetResult.cpo)],
    ['ДРР', budgetResult.drrPercent === null ? 'Не определено' : formatPercent(budgetResult.drrPercent)],
    ['ROMI', budgetResult.romiPercent === null ? 'Не определено' : formatPercent(budgetResult.romiPercent)],
  ] as const : [];

  return <ToolPage tool={tool}
    introduction={<p>Узнайте, какой ДРР можете позволить себе на Wildberries или Ozon и какой рекламный бюджет нужен на целевое число заказов в месяц. Сравните сценарии по марже, стоимости клика и конверсии — все три расчёта доступны сразу без регистрации.</p>}
    howItWorks={<div className="space-y-3">
      <p>Допустимый ДРР — маржа до рекламы минус целевая маржа. Расход на единицу — цена × допустимый ДРР / 100. Маржу считайте после всех остальных расходов и на той же базе цены; если целевая маржа выше исходной, она недостижима даже без рекламы.</p>
      <p>Клики = заказы / (CR / 100), показы = клики / (CTR / 100), бюджет = клики × CPC. CPO = бюджет / заказы. ДРР = бюджет / (заказы × цена) × 100%. ROMI = ((заказы × цена × маржа до рекламы / 100) − бюджет) / бюджет × 100%.</p>
      <p>В обратном расчёте клики = бюджет / CPC, заказы = клики × CR / 100. CTR влияет на показы; при фиксированных CPC и CR он не меняет бюджет на заданное число заказов. Дробные значения — математическое ожидание, в расчёте они не округляются.</p>
      <p>Это сценарий с постоянными CPC, CTR, CR и ценой, одним товаром в заказе и без органических продаж. Отмены и возвраты отдельно не моделируются: оценка по заказам может отличаться от результата по выкупам. При нулевых CR или CTR расчёт недоступен; при нулевом бюджете ROMI не определён. Тарифы WB и Ozon в формулы не входят — используйте свою маржу.</p>
      <p>Базу и атрибуцию показателей кабинета сверяйте с <a href="https://seller.wildberries.ru/instructions/en/ru/material/statistics-and-promotion-management" className="text-cyan-300 underline underline-offset-4">инструкцией WB по статистике продвижения</a>. Нужна помощь с рекламной экономикой? <a href="/#formats" className="text-cyan-300 underline underline-offset-4">Посмотреть форматы разбора</a>.</p>
    </div>}>
    <div className="space-y-6">
      <section aria-labelledby="max-drr-heading" className={panelClass}>
        <h2 id="max-drr-heading" className="text-xl">Допустимый ДРР</h2>
        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <NumberField label="Цена товара, ₽" value={price} onChange={setPrice} step={0.01} />
          <NumberField label="Маржа до рекламы, %" value={marginBeforeAdsPercent} onChange={setMargin} max={100} step={0.1} />
          <NumberField label="Целевая маржа, %" value={targetMarginPercent} onChange={setTargetMargin} max={100} step={0.1} />
        </div>
        <a href="/calculator" className="inline-block text-sm text-cyan-300 underline underline-offset-4">узнайте свою маржу без рекламы в калькуляторе</a>
        <div aria-live="polite" aria-atomic="true">
          {maxDrr ? <div className="space-y-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-sm text-white/70">Допустимая доля расходов на рекламу</p>
            <p className="break-words text-3xl font-semibold text-cyan-300">{formatPercent(maxDrr.maxDrrPercent)}</p>
            <p>До <strong>{formatCurrency(maxDrr.adCostPerUnit)}</strong> на единицу товара.</p>
          </div> : <p role="alert" className="text-amber-200">Укажите цену больше нуля и маржу от 0 до 100%. Целевая маржа выше маржи до рекламы недостижима даже без рекламных расходов.</p>}
        </div>
      </section>
      <section aria-labelledby="funnel-heading" className={panelClass}>
        <h2 id="funnel-heading" className="text-xl">Параметры рекламы для обоих расчётов</h2>
        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <NumberField label="CPC — стоимость клика, ₽" value={cpc} onChange={setCpc} step={0.01} />
          <NumberField label="CTR — клики от показов, %" value={ctrPercent} onChange={setCtr} max={100} step={0.1} />
          <NumberField label="CR — заказы от кликов, %" value={crPercent} onChange={setCr} max={100} step={0.1} />
        </div>
        <p className="text-sm text-white/60">Цена и маржа из первого блока используются для ДРР и ROMI.</p>
      </section>
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section aria-labelledby="budget-heading" className={panelClass}>
          <h2 id="budget-heading" className="text-xl">Бюджет по заказам</h2>
          <NumberField label="Целевые заказы в месяц, шт." value={targetOrders} onChange={setTargetOrders} />
          <div aria-live="polite" aria-atomic="true" className="space-y-4">
            {budgetResult ? <>
              <ResultTable rows={budgetRows} />
              <DrrStatus drr={budgetResult.drrPercent} limit={maxDrr?.maxDrrPercent ?? null} />
              {budgetResult.romiPercent === null && <p className="text-sm text-white/60">ROMI не определён при нулевом бюджете.</p>}
            </> : <p role="alert" className="text-amber-200">Укажите неотрицательные заказы и CPC, цену больше нуля, CTR и CR больше 0 и до 100%, маржу от 0 до 100%. При нулевых CR или CTR воронку рассчитать нельзя.</p>}
          </div>
        </section>
        <section aria-labelledby="orders-heading" className={panelClass}>
          <h2 id="orders-heading" className="text-xl">Заказы по бюджету</h2>
          <NumberField label="Рекламный бюджет в месяц, ₽" value={budget} onChange={setBudget} step={0.01} />
          <div aria-live="polite" aria-atomic="true" className="space-y-4">
            {ordersResult ? <>
              <div><p className="text-sm text-white/70">Ожидаемые заказы в месяц</p><p className="mt-2 break-words text-3xl font-semibold text-cyan-300">{formatNumber(ordersResult.orders)}</p></div>
              <ResultTable rows={[
                ['Показы', formatNumber(ordersResult.impressions)], ['Клики', formatNumber(ordersResult.clicks)],
                ['Бюджет', formatCurrency(ordersResult.budget)],
              ]} />
              {reverseMetrics ? <DrrStatus drr={reverseMetrics.drrPercent} limit={maxDrr?.maxDrrPercent ?? null} />
                : <p className="text-sm text-amber-200">Для оценки ДРР проверьте цену и маржу в первом блоке.</p>}
              <p className="text-xs text-white/60">Прогноз предполагает сохранение стоимости клика и конверсии при изменении бюджета.</p>
            </> : <p role="alert" className="text-amber-200">Укажите бюджет от нуля, CPC больше нуля, CTR и CR больше 0 и до 100%. При нулевой стоимости клика число кликов по бюджету не определено.</p>}
          </div>
        </section>
      </div>
    </div>
  </ToolPage>;
}
