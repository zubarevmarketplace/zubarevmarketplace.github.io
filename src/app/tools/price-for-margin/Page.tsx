import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ToolPage from '../../components/tools/ToolPage';
import CategorySelect from '../../components/tools/CategorySelect';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { findCommission, tariffRegistry } from '../../config/tariffRegistry';
import type { CalculatorInput, ResultMode, TaxMode } from '../../types/calculator';
import { tools } from '../registry';
import { calculatePriceScenario, findMaximumInRange, findPriceForTarget, type PriceTarget } from './calc';
import { defaultInput } from './defaults';

const tool = tools.find((entry) => entry.slug === 'price-for-margin')!;
const selectClass = 'w-full min-w-0 rounded-lg border border-white/15 bg-[#0C141B] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cyan-400';

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

function Toggle({ label, checked, onChange, children }: {
  label: string; checked: boolean; onChange: (checked: boolean) => void; children: ReactNode;
}) {
  const id = useId();
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm text-white/80">{label}</label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-cyan-400 data-[state=unchecked]:bg-white/20" />
    </div>
    {checked && children}
  </div>;
}

export default function PriceForMarginPage() {
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [model, setModel] = useState<ResultMode>('fbo');
  const [target, setTarget] = useState<PriceTarget>({ kind: 'marginPercent', value: 20 });
  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) =>
    setInput((previous) => ({ ...previous, [key]: value }));
  const tariff = findCommission(input.commissionTariffId);
  const valid = input.costPrice >= 1 && input.costPrice <= 1_000_000 &&
    [input.lengthCm, input.widthCm, input.heightCm].every((value) => value >= 0.1 && value <= 300) &&
    input.weightKg > 0 && input.weightKg <= 500 && input.platformDiscountRatePercent >= 0 && input.platformDiscountRatePercent <= 95 &&
    (!input.includeAds || (input.adRate >= 0 && input.adRate <= 100)) &&
    (!input.includeTaxes || (input.taxRate >= 0 && input.taxRate <= 100)) && Number.isFinite(target.value) && target.value >= 0;
  const solution = useMemo(() => valid ? findPriceForTarget(input, target, model) : null, [input, target, model, valid]);
  const maximum = useMemo(() => valid && !solution ? findMaximumInRange(input, target, model) : null, [input, target, model, solution, valid]);
  const lowerPrice = solution ? calculatePriceScenario(input, solution.price * 0.9, model) : null;
  const result = solution?.result;
  const expenses = result ? [
    ['Себестоимость', result.costPrice], ['Комиссия WB и эквайринг, с учётом СПП', result.commission],
    ['Логистика, включая невыкупы', result.logistics], ['Хранение', result.storage],
    ['Обработка FBS', result.processing], ['Реклама', result.adCost], ['Налог', result.tax],
    ['Доставка до WB', result.deliveryToWb], ['Фулфилмент', result.fulfillment],
    ['Упаковка', result.packaging], ['Прочие расходы', result.otherCosts],
  ] as const : [];

  return <ToolPage tool={tool}
    introduction={<p>Укажите себестоимость товара и желаемую маржу или прибыль с единицы, чтобы рассчитать цену на Wildberries. Расчёт учитывает расходы FBO или FBS и сразу показывает результат без регистрации.</p>}
    howItWorks={<div className="space-y-3">
      <p>Подбираем минимальную цену для покупателя с шагом 1 ₽, при которой после себестоимости, комиссии, логистики, хранения, рекламы и налога остаётся заданный процент от цены или заданная прибыль в рублях. Поиск идёт от себестоимости до её 50-кратного значения, но не выше 1 000 000 ₽.</p>
      <p>Комиссию берём для выбранного предмета из общего справочника WB. Допущения простого режима: география — вся Россия, средний выкуп — 90%, хранение — {tariffRegistry.wb.defaults.storageDays} дней. Включён эквайринг; в FBS — обработка. Доставку до WB, фулфилмент и прочие расходы включите в себестоимость, если они есть.</p>
      <p>СПП задаётся отдельно: цена до СПП выше цены покупателя, сумма СПП уменьшает комиссию WB, а ДРР применяется к цене до СПП. При выключенных переключателях реклама и налог не учитываются. ROI — прибыль относительно себестоимости. Для недостижимой цели максимум оцениваем по 50 ценам в диапазоне.</p>
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
            <label key={scheme} className="flex items-center gap-2"><input type="radio" name="model" value={scheme} checked={model === scheme} onChange={() => setModel(scheme)} className="accent-cyan-400" />{scheme === 'fbo' ? 'FBO — склад WB' : 'FBS — склад продавца'}</label>)}</div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-sm text-white/80">Целевой показатель</legend>
          <div className="flex flex-wrap gap-4 text-sm">{(['marginPercent', 'profitPerUnit'] as const).map((kind) =>
            <label key={kind} className="flex items-center gap-2"><input type="radio" name="target" value={kind} checked={target.kind === kind} onChange={() => setTarget({ kind, value: kind === 'marginPercent' ? 20 : 500 })} className="accent-cyan-400" />{kind === 'marginPercent' ? 'Маржа, %' : 'Прибыль с единицы, ₽'}</label>)}</div>
          <NumberField label={target.kind === 'marginPercent' ? 'Целевая маржа, %' : 'Целевая прибыль, ₽'} value={target.value} onChange={(value) => setTarget({ ...target, value })} max={target.kind === 'marginPercent' ? 100 : 1_000_000} step={target.kind === 'marginPercent' ? 0.1 : 1} />
        </fieldset>
        <NumberField label="СПП, %" value={input.platformDiscountRatePercent} onChange={(value) => update('platformDiscountRatePercent', value)} max={95} step={0.1} />
        <Toggle label="Учитывать рекламу" checked={input.includeAds} onChange={(value) => update('includeAds', value)}>
          <NumberField label="ДРР, % от цены до СПП" value={input.adRate} onChange={(value) => update('adRate', value)} step={0.1} />
        </Toggle>
        <Toggle label="Учитывать налоги" checked={input.includeTaxes} onChange={(value) => update('includeTaxes', value)}>
          <label className="block space-y-2 text-sm text-white/80"><span>Налоговый режим</span>
            <select value={input.taxMode} onChange={(event) => { const taxMode = event.target.value as TaxMode; setInput((previous) => ({ ...previous, taxMode, taxRate: taxMode === 'usn6' ? 6 : 15 })); }} className={selectClass}>
              <option value="usn6">УСН Доходы</option><option value="usn15">УСН Доходы-расходы</option>
            </select>
          </label>
          <NumberField label="Налоговая ставка, %" value={input.taxRate} onChange={(value) => update('taxRate', value)} step={0.1} />
        </Toggle>
      </section>
      <section aria-labelledby="price-result" className="min-w-0 self-start space-y-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 sm:p-6">
        <h2 id="price-result" className="text-xl">Результат расчёта</h2>
        <div aria-live="polite" aria-atomic="true" className="space-y-4">
          {!valid && <p role="alert" className="text-amber-200">Укажите себестоимость от 1 до 1 000 000 ₽, габариты от 0,1 до 300 см, вес до 500 кг и неотрицательную цель. СПП должна быть от 0 до 95%, ДРР и ставка налога — от 0 до 100%.</p>}
          {valid && !solution && maximum && <p className="text-amber-200">{target.kind === 'marginPercent'
            ? 'При такой себестоимости и затратах маржа ' + formatPercent(target.value) + ' недостижима, максимум ~' + formatPercent(maximum.result.margin ?? 0) + ' при цене ' + formatCurrency(maximum.price) + '.'
            : 'При такой себестоимости и затратах прибыль ' + formatCurrency(target.value) + ' недостижима, максимум ~' + formatCurrency(maximum.result.profit) + ' при цене ' + formatCurrency(maximum.price) + '.'}</p>}
          {solution && result && <>
            <div><p className="text-sm text-white/70">Рекомендуемая цена для покупателя</p><p className="mt-2 break-words text-3xl font-semibold text-cyan-300 sm:text-4xl">{formatCurrency(solution.price)}</p></div>
            <dl className="space-y-3 text-sm">{[
              ['Цена до СПП', formatCurrency(result.priceBeforeWbDiscount)], ['Прибыль с единицы', formatCurrency(result.profit)],
              ['Маржа', formatPercent(result.margin ?? 0)], ['ROI', result.roi === null ? '—' : formatPercent(result.roi)],
            ].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-white/70">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
            {lowerPrice && <p className="rounded-xl bg-white/5 p-3 text-sm leading-relaxed">Если поставить цену на 10% ниже, прибыль составит <strong>{formatCurrency(lowerPrice.profit)}</strong> с единицы при цене покупателя {formatCurrency(lowerPrice.salePrice)}.</p>}
          </>}
        </div>
        {result && <div className="space-y-3 border-t border-white/10 pt-5">
          <h3 className="text-lg">Расходы с единицы</h3>
          <dl className="space-y-3 text-sm">{expenses.filter(([, value], index) => index < 7 || value !== 0).map(([label, value]) =>
            <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="min-w-0 text-white/70">{label}</dt><dd>{formatCurrency(value)}</dd></div>)}
            <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3"><dt>Всего расходов</dt><dd>{formatCurrency(result.totalExpenses)}</dd></div>
          </dl>
          {result.isSgt && <p className="text-xs text-amber-200">Товар может относиться к крупногабаритным. Отдельная надбавка за вес не задана; проверьте условия WB перед выбором цены.</p>}
        </div>}
      </section>
    </div>
  </ToolPage>;
}
