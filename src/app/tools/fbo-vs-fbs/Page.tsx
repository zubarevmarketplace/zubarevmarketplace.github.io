import { useId, useMemo, useState } from 'react';
import ToolPage from '../../components/tools/ToolPage';
import CategorySelect from '../../components/tools/CategorySelect';
import { Input } from '../../components/ui/input';
import { findCommission, tariffRegistry } from '../../config/tariffRegistry';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import type { CalculatorInput, GeoPresetId, TaxMode } from '../../types/calculator';
import { tools } from '../registry';
import { compareSchemes, compareSalesVolumes, isValidComparisonInput } from './calc';
import { defaultInput, defaultMonthlySales } from './defaults';

const tool = tools.find((entry) => entry.slug === 'fbo-vs-fbs')!;
const selectClass = 'w-full min-w-0 rounded-lg border border-white/15 bg-[#0C141B] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cyan-400';
const tableClass = 'w-full table-fixed text-xs sm:text-sm [&_th]:px-1 [&_th]:py-3 [&_td]:px-1 [&_td]:py-3 [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere]';
const shownVolumes = new Set([10, 50, 100, 250, 500, 1000]);

function NumberField({ label, value, onChange, min = 0, max = 100, step = 1 }: {
  label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number;
}) {
  const id = useId();
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block text-sm text-white/80">{label}</label>
    <Input id={id} type="number" inputMode="decimal" value={value} min={min} max={max} step={step}
      onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 bg-[#0C141B]" />
  </div>;
}

export default function FboVsFbsPage() {
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [monthlySales, setMonthlySales] = useState(defaultMonthlySales);
  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) =>
    setInput((previous) => ({ ...previous, [key]: value }));
  const valid = isValidComparisonInput(input, monthlySales);
  const comparison = useMemo(() => valid ? compareSchemes(input, monthlySales) : null, [input, monthlySales, valid]);
  const volumes = useMemo(() => valid ? compareSalesVolumes(input) : null, [input, valid]);
  const tariff = findCommission(input.commissionTariffId);

  return <ToolPage tool={tool}
    introduction={<p>Сравните FBO и FBS на Wildberries для одного товара: цену, себестоимость и объём продаж используем одинаковые. Укажите свои расходы, чтобы узнать прибыль после налога и разницу за месяц. Расчёт доступен сразу, без регистрации.</p>}
    howItWorks={<div className="space-y-3">
      <p>Для каждой схемы из цены покупателя вычитаем себестоимость, комиссию с эквайрингом, прямую и обратную логистику, хранение, обработку, фулфилмент, доставку до WB, упаковку, прочие расходы, рекламу и налог. Разница на единицу — прибыль FBO после налога минус прибыль FBS после налога; месячная разница — эта величина × число выкупленных продаж.</p>
      <p>Используем расширенный расчёт калькулятора WB и комиссии выбранного предмета из единого справочника. В FBO учитываются складские коэффициенты, локализация и платное хранение; в FBS — базовая логистика и введённая обработка заказа. Фулфилмент, упаковка и доставка до WB применяются к обеим схемам одинаково. Хранение на собственном складе, аренда и фиксированная зарплата отдельно не заданы: при необходимости распределите их на единицу в прочих расходах.</p>
      <p>Цена указана после СПП. Комиссия и реклама используют цену до СПП, а сумма СПП уменьшает комиссию. УСН Доходы считаем от цены покупателя; УСН Доходы-расходы — от прибыли до налога с минимумом 1% выручки. Вес служит для определения крупногабаритного товара; отдельной надбавки за вес нет.</p>
      <p>Перебираем продажи от 10 до 1 000 с шагом 10, сохраняя расходы на единицу и срок хранения. Поэтому рост объёма сам по себе не меняет победителя: без фиксированных расходов или скидок за объём отдельная точка равенства не появляется. Таблица показывает выбранные объёмы из перебора; это сценарии, а не прогноз спроса.</p>
    </div>}>
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <section aria-label="Исходные данные" className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#0C141B]/80 p-4 sm:p-6">
        <h2 className="text-xl">Исходные данные</h2>
        <CategorySelect value={input.commissionTariffId} onChange={(value) => update('commissionTariffId', value)} />
        {tariff && <p className="text-xs text-white/60">Комиссия до компенсации СПП: FBO {formatPercent(tariff.fboCommissionRate)}, FBS {formatPercent(tariff.fbsCommissionRate)}.</p>}
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <NumberField label="Цена покупателя, ₽" value={input.salePrice} onChange={(value) => update('salePrice', value)} min={1} max={1_000_000} />
          <NumberField label="Себестоимость, ₽" value={input.costPrice} onChange={(value) => update('costPrice', value)} max={1_000_000} />
        </div>
        <fieldset className="min-w-0 space-y-3">
          <legend className="text-sm text-white/80">Габариты в упаковке</legend>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            <NumberField label="Длина, см" value={input.lengthCm} onChange={(value) => update('lengthCm', value)} min={0.1} max={300} step={0.1} />
            <NumberField label="Ширина, см" value={input.widthCm} onChange={(value) => update('widthCm', value)} min={0.1} max={300} step={0.1} />
            <NumberField label="Высота, см" value={input.heightCm} onChange={(value) => update('heightCm', value)} min={0.1} max={300} step={0.1} />
          </div>
        </fieldset>
        <NumberField label="Вес, кг" value={input.weightKg} onChange={(value) => update('weightKg', value)} min={0.01} max={500} step={0.01} />
        <NumberField label="Продажи в месяц, шт. (выкупленные)" value={monthlySales} onChange={setMonthlySales} max={1_000_000} />
        <label className="block min-w-0 space-y-2 text-sm text-white/80"><span>География продаж</span>
          <select className={selectClass} value={input.geoPresetId} onChange={(event) => {
            const geoPresetId = event.target.value as GeoPresetId;
            setInput((previous) => ({ ...previous, geoPresetId,
              manualLocalOrderShare: tariffRegistry.wb.geoPresets[geoPresetId].localOrderShare * 100 }));
          }}>
            {Object.entries(tariffRegistry.wb.geoPresets).map(([id, preset]) => <option key={id} value={id}>{preset.label}</option>)}
          </select>
        </label>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <NumberField label="СПП, %" value={input.platformDiscountRatePercent} onChange={(value) => update('platformDiscountRatePercent', value)} max={95} step={0.1} />
          <NumberField label="ДРР, % от цены до СПП" value={input.adRate} onChange={(value) => update('adRate', value)} step={0.1} />
        </div>
        <label className="block min-w-0 space-y-2 text-sm text-white/80"><span>Налоговый режим</span>
          <select className={selectClass} value={input.taxMode} onChange={(event) => {
            const taxMode = event.target.value as TaxMode;
            setInput((previous) => ({ ...previous, taxMode, taxRate: taxMode === 'usn6' ? 6 : 15 }));
          }}>
            <option value="usn6">УСН Доходы</option><option value="usn15">УСН Доходы-расходы</option>
          </select>
        </label>
        <NumberField label="Налоговая ставка, %" value={input.taxRate} onChange={(value) => update('taxRate', value)} step={0.1} />
        <fieldset className="min-w-0 space-y-4 border-t border-white/10 pt-4">
          <legend className="px-1 text-base">Обработка FBS и подготовка товара</legend>
          <NumberField label="Обработка заказа FBS, ₽/ед." value={input.manualProcessingCost ?? tariffRegistry.wb.defaults.fbsProcessingCost} onChange={(value) => update('manualProcessingCost', value)} max={100_000} />
          <p className="text-xs leading-relaxed text-white/60">Обработка заказа применяется только к FBS. Следующие расходы одинаковы для обеих схем; не дублируйте затраты, уже включённые в себестоимость.</p>
          <NumberField label="Фулфилмент, ₽/ед." value={input.manualFulfillmentCost} onChange={(value) => update('manualFulfillmentCost', value)} max={100_000} />
          <NumberField label="Упаковка, ₽/ед." value={input.packagingCost} onChange={(value) => update('packagingCost', value)} max={100_000} />
          <NumberField label="Доставка до WB, ₽/ед." value={input.manualDeliveryToWbPerUnit} onChange={(value) => update('manualDeliveryToWbPerUnit', value)} max={100_000} />
          <NumberField label="Прочие расходы, ₽/ед." value={input.otherCosts} onChange={(value) => update('otherCosts', value)} max={100_000} />
        </fieldset>
        <fieldset className="min-w-0 space-y-4 border-t border-white/10 pt-4">
          <legend className="px-1 text-base">Хранение и логистика</legend>
          <NumberField label="Хранение FBO, дней" value={input.manualStorageDays} onChange={(value) => update('manualStorageDays', value)} max={365} />
          <NumberField label="Доля выкупа, %" value={input.manualBuyoutRate} onChange={(value) => update('manualBuyoutRate', value)} min={1} />
          <NumberField label="Локализация продаж, %" value={input.manualLocalOrderShare} onChange={(value) => update('manualLocalOrderShare', value)} />
        </fieldset>
      </section>
      <section aria-label="Результат сравнения" className="min-w-0 space-y-6 rounded-2xl border border-white/10 bg-[#0C141B]/80 p-4 sm:p-6">
        <h2 className="text-xl">Сравнение FBO и FBS</h2>
        {!comparison || !volumes ? <p role="alert" className="text-sm text-amber-200">Проверьте данные: цена от 1 до 1 000 000 ₽, себестоимость от 0 до 1 000 000 ₽, габариты 0,1–300 см, вес 0,01–500 кг, продажи — целое число от 0 до 1 000 000. СПП 0–95%, выкуп 1–100%, остальные проценты 0–100%, хранение 0–365 дней, дополнительные расходы 0–100 000 ₽.</p> : <>
          <div className="grid min-w-0 grid-cols-2 gap-3">
            {(['fbo', 'fbs'] as const).map((scheme) => <div key={scheme} className={'min-w-0 space-y-3 rounded-xl border p-3 [overflow-wrap:anywhere] ' +
              (comparison.winner === scheme ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5')}>
              <h3 className="text-lg">{scheme.toUpperCase()}</h3>
              <p className="text-xs text-white/60">{scheme === 'fbo' ? 'Склад WB' : 'Склад продавца'}</p>
              <dl className="space-y-3">
                <div><dt className="text-xs text-white/60">Прибыль на единицу</dt><dd className={'mt-1 text-lg sm:text-xl ' + (comparison[scheme].profit < 0 ? 'text-red-300' : 'text-white')}>{formatCurrency(comparison[scheme].profit)}</dd></div>
                <div><dt className="text-xs text-white/60">Прибыль в месяц</dt><dd className="mt-1 text-lg sm:text-xl">{formatCurrency(comparison[scheme].profit * monthlySales)}</dd></div>
              </dl>
            </div>)}
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="space-y-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4">
            <p>{monthlySales === 0 ? 'При 0 продажах в месяц прибыль обеих схем равна нулю.' : comparison.winner === 'equal'
              ? `При ${monthlySales} продажах в месяц FBO и FBS дают одинаковую прибыль.`
              : `При ${monthlySales} продажах в месяц ${comparison.winner.toUpperCase()} выгоднее на ${formatCurrency(Math.abs(comparison.diffPerMonth))} в месяц.`}</p>
            <p className="text-xs text-white/70">Разница прибыли на единицу в пользу FBO: {formatCurrency(comparison.diffPerUnit)}. Положительное число — преимущество FBO, отрицательное — FBS.</p>
            {comparison.fbo.profit < 0 && comparison.fbs.profit < 0 && <p className="text-sm text-amber-200">Обе схемы убыточны. Более выгодная схема означает меньший убыток; пересмотрите цену и расходы.</p>}
          </div>
          {(comparison.fbo.isSgt || comparison.fbs.isSgt) && <p className="text-sm text-amber-200">Товар крупногабаритный. Отдельные тарифы и ограничения для него не учтены: проверьте условия WB перед выбором схемы.</p>}
          <table className={tableClass}>
            <caption className="pb-3 text-left text-base">Разница по статьям расходов, ₽/ед.</caption>
            <thead className="border-b border-white/15 text-white/70"><tr><th scope="col" className="w-[34%] text-left">Статья</th><th scope="col" className="text-right">FBO</th><th scope="col" className="text-right">FBS</th><th scope="col" className="text-right">FBS − FBO</th></tr></thead>
            <tbody className="divide-y divide-white/10">{comparison.breakdownDiff.map((row) => <tr key={row.label}>
              <th scope="row" className="text-left font-normal text-white/70">{row.label}</th><td className="text-right">{formatCurrency(row.fbo)}</td><td className="text-right">{formatCurrency(row.fbs)}</td><td className="text-right">{formatCurrency(row.fbs - row.fbo)}</td>
            </tr>)}</tbody>
          </table>
          <p className="text-xs leading-relaxed text-white/60">Положительная разница расходов — экономия FBO. Комиссия включает эквайринг и компенсацию СПП; логистика — невыкупы; прочее — упаковку. Налог показан отдельно, чтобы объяснить разницу прибыли после налога. Суммы округлены только при отображении.</p>
          <section className="min-w-0 space-y-3" aria-labelledby="sales-equality">
            <h3 id="sales-equality" className="text-lg">При каких продажах в месяц схемы равны</h3>
            <p className="text-sm text-white/70">{volumes.equalAt.length === 0
              ? 'Точки равенства нет в диапазоне 10–1 000 продаж в месяц (шаг 10).'
              : 'Схемы равны при всех проверенных объёмах от 10 до 1 000 продаж в месяц (шаг 10).'}</p>
            <table className={tableClass}>
              <caption className="pb-2 text-left text-sm text-white/60">Прибыль после налога за месяц</caption>
              <thead className="border-b border-white/15 text-white/70"><tr><th scope="col" className="w-1/4 text-left">Продажи, шт.</th><th scope="col" className="text-right">FBO</th><th scope="col" className="text-right">FBS</th></tr></thead>
              <tbody className="divide-y divide-white/10">{volumes.scenarios.filter((row) => shownVolumes.has(row.monthlySales)).map((row) => <tr key={row.monthlySales}>
                <th scope="row" className="text-left font-normal">{row.monthlySales}</th><td className="text-right">{formatCurrency(row.fboProfit)}</td><td className="text-right">{formatCurrency(row.fbsProfit)}</td>
              </tr>)}</tbody>
            </table>
            <p className="text-xs leading-relaxed text-white/60">Перебраны все 100 объёмов; показаны 6 примеров. При фиксированных расходах на единицу рост продаж увеличивает разницу, но не меняет победителя. Фиксированные расходы в месяц и изменение скорости оборачиваемости не моделируются.</p>
          </section>
        </>}
      </section>
    </div>
  </ToolPage>;
}
