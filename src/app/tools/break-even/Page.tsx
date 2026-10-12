import { useId, useMemo, useState } from 'react';
import ToolPage from '../../components/tools/ToolPage';
import CategorySelect from '../../components/tools/CategorySelect';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { findCommission, tariffRegistry } from '../../config/tariffRegistry';
import type { CalculatorInput, ResultMode, TaxMode } from '../../types/calculator';
import { tools } from '../registry';
import { defaultInput } from '../price-for-margin/defaults';
import { evaluatePromo, findBreakEvenPrice, isValidBreakEvenInput } from './calc';

const tool = tools.find((entry) => entry.slug === 'break-even')!;
const verdicts = {
  ok: { text: 'Акция выгодна', style: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  risky: { text: 'Акция съедает прибыль', style: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  loss: { text: 'В минус', style: 'border-red-400/30 bg-red-400/10 text-red-200' },
};

function NumberField({ label, value, onChange, min = 0, max = 100, step = 1 }: {
  label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number;
}) {
  const id = useId();
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block text-sm text-white/80">{label}</label>
    <Input id={id} type="number" inputMode="decimal" value={value} min={min} max={max} step={step}
      onChange={(event) => onChange(Number(event.target.value))} className="bg-[#0C141B]" />
  </div>;
}

function PriceScale({ currentPrice, promoPrice, breakEvenPrice }: {
  currentPrice: number; promoPrice: number; breakEvenPrice: number | null;
}) {
  const position = (price: number) => Math.min(100, Math.max(0, price / currentPrice * 100));
  return <div className="min-w-0 space-y-3" role="img"
    aria-label={'Шкала от нуля до ' + formatCurrency(currentPrice) + '. Цена акции ' + formatCurrency(promoPrice) +
      (breakEvenPrice === null ? '. Безубыток недостижим в диапазоне поиска.' : '. Безубыток ' + formatCurrency(breakEvenPrice))}>
    <p className="text-sm text-white/70">Шкала цены</p>
    <div className="relative h-6 rounded-full bg-emerald-400/25">
      <div className="absolute inset-y-0 left-0 rounded-l-full bg-red-400/40"
        style={{ width: position(breakEvenPrice ?? currentPrice) + '%' }} />
      {breakEvenPrice !== null && <span aria-hidden="true" className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-red-200"
        style={{ left: position(breakEvenPrice) + '%' }} />}
      <span aria-hidden="true" className="absolute -top-1 -bottom-1 w-1 -translate-x-1/2 bg-cyan-300"
        style={{ left: position(promoPrice) + '%' }} />
    </div>
    <div aria-hidden="true" className="flex justify-between gap-2 text-xs text-white/60"><span>{formatCurrency(0)}</span><span>{formatCurrency(currentPrice)}</span></div>
    <div className="space-y-2 text-sm">
      <p><span className="text-red-200">● Безубыток:</span> {breakEvenPrice === null ? 'недостижим до 1 000 000 ₽' : formatCurrency(breakEvenPrice)}
        {breakEvenPrice !== null && breakEvenPrice > currentPrice && ' — выше текущей цены, отметка у правого края'}</p>
      <p><span className="text-cyan-300">● Цена акции:</span> {formatCurrency(promoPrice)}</p>
    </div>
  </div>;
}

export default function BreakEvenPage() {
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [model, setModel] = useState<ResultMode>('fbo');
  const [discount, setDiscount] = useState(15);
  const [growth, setGrowth] = useState(30);
  const [monthlySales, setMonthlySales] = useState(100);
  const [minimumProfit, setMinimumProfit] = useState(0);
  const discountId = useId();
  const adsId = useId();
  const taxesId = useId();
  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) =>
    setInput((previous) => ({ ...previous, [key]: value }));
  const valid = isValidBreakEvenInput(input);
  const prices = useMemo(() => findBreakEvenPrice({ ...input, minimumProfit }, model), [input, minimumProfit, model]);
  const promo = useMemo(() => evaluatePromo({ ...input, monthlySales }, model, input.salePrice, discount, growth),
    [input, monthlySales, model, discount, growth]);
  const tariff = findCommission(input.commissionTariffId);
  const verdict = promo ? verdicts[promo.recommendation] : null;
  const salesFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  return <ToolPage tool={tool}
    introduction={<p>Узнайте, ниже какой цены товар на Wildberries уходит в минус и стоит ли участвовать в акции WB. Укажите расходы, скидку и ожидаемый прирост продаж: калькулятор сразу сравнит прибыль за месяц без регистрации.</p>}
    howItWorks={<div className="space-y-3">
      <p>Точка безубыточности — минимальная целая цена для покупателя, при которой прибыль после налога неотрицательна. Подбираем её бинарным поиском с точностью 1 ₽ через общую модель юнит-экономики в диапазоне от 1 до 1 000 000 ₽. Так же ищем цену для заданной минимальной прибыли.</p>
      <p>Из цены вычитаем себестоимость, комиссию WB с эквайрингом и компенсацией СПП, логистику с невыкупами, хранение, обработку FBS, рекламу и налог. Цена акции = текущая цена × (1 − скидка / 100). Запас = текущая цена − безубыток; запас в процентах делим на текущую цену.</p>
      <p>Без акции: выкупленные продажи за месяц × прибыль с единицы. С акцией: те же продажи × (1 + прирост / 100) × прибыль по акции. Зелёный вердикт означает, что месячная прибыль не уменьшилась; жёлтый — уменьшилась без убытка с единицы; красный — каждая продажа убыточна. Прирост продаж — ваше допущение, проверьте также сценарий 0%.</p>
      <p>Используем комиссии выбранного предмета, географию «Вся Россия», выкуп 90% и хранение {tariffRegistry.wb.defaults.storageDays} дней. СПП сохраняется в обоих сценариях; ДРР считается от цены до СПП. Доставку до WB, упаковку, фулфилмент и прочие расходы включите в себестоимость. УСН Доходы-расходы учитывает минимальный налог 1% выручки. Модель не учитывает изменение складских коэффициентов и выкупа во время акции.</p>
    </div>}>
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <section aria-label="Исходные данные" className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#0C141B]/80 p-4 sm:p-6">
        <h2 className="text-xl">Исходные данные</h2>
        <CategorySelect value={input.commissionTariffId} onChange={(value) => update('commissionTariffId', value)} />
        {tariff && <p className="text-xs text-white/60">Комиссия {model.toUpperCase()}: {formatPercent(model === 'fbo' ? tariff.fboCommissionRate : tariff.fbsCommissionRate)} до компенсации СПП.</p>}
        <NumberField label="Себестоимость, ₽" value={input.costPrice} onChange={(value) => update('costPrice', value)} min={1} max={1_000_000} />
        <fieldset className="min-w-0 space-y-3">
          <legend className="text-sm text-white/80">Габариты в упаковке</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumberField label="Длина, см" value={input.lengthCm} onChange={(value) => update('lengthCm', value)} min={0.1} max={300} step={0.1} />
            <NumberField label="Ширина, см" value={input.widthCm} onChange={(value) => update('widthCm', value)} min={0.1} max={300} step={0.1} />
            <NumberField label="Высота, см" value={input.heightCm} onChange={(value) => update('heightCm', value)} min={0.1} max={300} step={0.1} />
          </div>
        </fieldset>
        <NumberField label="Вес, кг" value={input.weightKg} onChange={(value) => update('weightKg', value)} min={0.01} max={500} step={0.01} />
        <fieldset className="space-y-2">
          <legend className="text-sm text-white/80">Схема продажи</legend>
          <div className="flex flex-wrap gap-4 text-sm">{(['fbo', 'fbs'] as const).map((scheme) =>
            <label key={scheme} className="flex items-center gap-2"><input type="radio" name="break-even-model" checked={model === scheme} onChange={() => setModel(scheme)} className="accent-cyan-400" />{scheme === 'fbo' ? 'FBO — склад WB' : 'FBS — склад продавца'}</label>)}</div>
        </fieldset>
        <NumberField label="Текущая цена для покупателя, ₽" value={input.salePrice} onChange={(value) => update('salePrice', value)} min={1} max={1_000_000} />
        <NumberField label="СПП, %" value={input.platformDiscountRatePercent} onChange={(value) => update('platformDiscountRatePercent', value)} max={95} step={0.1} />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4"><label htmlFor={adsId} className="text-sm text-white/80">Учитывать рекламу</label><Switch id={adsId} checked={input.includeAds} onCheckedChange={(value) => update('includeAds', value)} className="data-[state=checked]:bg-cyan-400 data-[state=unchecked]:bg-white/20" /></div>
          {input.includeAds && <NumberField label="ДРР, % от цены до СПП" value={input.adRate} onChange={(value) => update('adRate', value)} step={0.1} />}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4"><label htmlFor={taxesId} className="text-sm text-white/80">Учитывать налоги</label><Switch id={taxesId} checked={input.includeTaxes} onCheckedChange={(value) => update('includeTaxes', value)} className="data-[state=checked]:bg-cyan-400 data-[state=unchecked]:bg-white/20" /></div>
          {input.includeTaxes && <>
            <label className="block space-y-2 text-sm text-white/80"><span>Налоговый режим</span>
              <select value={input.taxMode} onChange={(event) => { const taxMode = event.target.value as TaxMode; setInput((previous) => ({ ...previous, taxMode, taxRate: taxMode === 'usn6' ? 6 : 15 })); }} className="w-full min-w-0 rounded-lg border border-white/15 bg-[#0C141B] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cyan-400">
                <option value="usn6">УСН Доходы</option><option value="usn15">УСН Доходы-расходы</option>
              </select>
            </label>
            <NumberField label="Налоговая ставка, %" value={input.taxRate} onChange={(value) => update('taxRate', value)} step={0.1} />
          </>}
        </div>
        <div className="space-y-3">
          <label htmlFor={discountId} className="block text-sm text-white/80">Скидка акции: {formatPercent(discount)}</label>
          <input id={discountId} type="range" min={0} max={50} step={1} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="block h-8 w-full accent-cyan-400" />
          <div className="flex justify-between text-xs text-white/60"><span>0%</span><span>50%</span></div>
        </div>
        <NumberField label="Ожидаемый прирост продаж, %" value={growth} onChange={setGrowth} max={10_000} step={1} />
        <NumberField label="Текущие продажи в месяц, шт." value={monthlySales} onChange={setMonthlySales} max={1_000_000} />
        <p className="text-xs text-white/60">Укажите выкупленные товары. Прирост — предположение о продажах за весь сравниваемый месяц.</p>
        <NumberField label="Целевая минимальная прибыль с единицы, ₽" value={minimumProfit} onChange={setMinimumProfit} max={1_000_000} />
      </section>
      <section aria-labelledby="break-even-result" className="min-w-0 self-start space-y-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 sm:p-6">
        <h2 id="break-even-result" className="text-xl">Результат расчёта</h2>
        <div aria-live="polite" aria-atomic="true" className="space-y-5">
          {(!valid || !promo) && <p role="alert" className="text-amber-200">Проверьте данные: себестоимость и цена от 1 до 1 000 000 ₽, габариты 0,1–300 см, вес 0,01–500 кг, СПП 0–95%, ДРР и налог 0–100%. Продажи — целое неотрицательное число, прирост — неотрицательный процент. Цена акции должна быть не ниже 1 ₽.</p>}
          {valid && promo && <>
            <div><p className="text-sm text-white/70">Точка безубыточности — цена для покупателя</p>
              {prices.breakEven ? <p className="mt-2 text-3xl text-cyan-300 break-words">{formatCurrency(prices.breakEven.price)}</p>
                : <p className="mt-2 text-amber-200">Безубыток недостижим при цене до 1 000 000 ₽. Проверьте комиссию, ДРР и расходы.</p>}
            </div>
            {prices.priceBuffer !== null && <p className="text-sm">Запас до безубытка: <strong>{formatCurrency(prices.priceBuffer)}</strong> ({formatPercent(prices.priceBufferPercent!)} от текущей цены).
              {prices.priceBuffer < 0 && ' Текущая цена уже ниже безубытка.'}</p>}
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div><dt className="text-sm text-white/70">Прибыль при текущей цене, за единицу</dt><dd className="mt-1 text-xl break-words">{formatCurrency(promo.currentProfit)}</dd></div>
              <div><dt className="text-sm text-white/70">Прибыль при цене акции, за единицу</dt><dd className="mt-1 text-xl break-words">{formatCurrency(promo.promoProfit)}</dd></div>
              <div><dt className="text-sm text-white/70">Итог за месяц без акции · {salesFormat.format(monthlySales)} шт.</dt><dd className="mt-1 text-xl break-words">{formatCurrency(promo.currentMonthlyProfit)}</dd></div>
              <div><dt className="text-sm text-white/70">Итог за месяц с акцией · {salesFormat.format(promo.promoSales)} шт.</dt><dd className="mt-1 text-xl break-words">{formatCurrency(promo.promoMonthlyProfit)}</dd></div>
            </dl>
            {verdict && <div className={'rounded-xl border p-4 ' + verdict.style}><p className="text-xl">{verdict.text}</p><p className="mt-2 text-sm">Изменение прибыли за месяц: {formatCurrency(promo.promoMonthlyProfit - promo.currentMonthlyProfit)} при приросте продаж {formatPercent(growth)}.</p></div>}
            <PriceScale currentPrice={input.salePrice} promoPrice={promo.promoPrice} breakEvenPrice={prices.breakEven?.price ?? null} />
            {minimumProfit > 0 && <p className="text-sm text-white/80">Цена для прибыли {formatCurrency(minimumProfit)} с единицы: {prices.target ? formatCurrency(prices.target.price) : 'недостижима до 1 000 000 ₽'}.</p>}
            {(!Number.isFinite(minimumProfit) || minimumProfit < 0) && <p role="alert" className="text-amber-200">Целевая прибыль должна быть неотрицательным числом.</p>}
          </>}
        </div>
      </section>
    </div>
  </ToolPage>;
}
