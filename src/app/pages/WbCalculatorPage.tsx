import { useEffect, useMemo, useRef, useState } from 'react';
import { categories } from '../config/categories';
import { geoPresets } from '../config/geoPresets';
import { calculateUnitEconomics, getCalculationContext } from '../lib/calculateUnitEconomics';
import { formatCurrency, formatPercent } from '../lib/formatters';
import type { CalculatorInput, CalculatorMode, ResultMode, TaxMode } from '../types/calculator';

const initial: CalculatorInput = {
  categoryId: 'home', salePrice: 2500, costPrice: 900, lengthCm: 30, widthCm: 20, heightCm: 10,
  geoPresetId: 'allRussia', includeAds: true, adRate: 0.1, includeTaxes: true, taxMode: 'usn6', taxRate: 6,
  includeFulfillment: false, includeDeliveryToWb: false, manualKvv: 18, manualBuyoutRate: 90, manualLocalOrderShare: 50,
  manualStorageDays: 30, manualDeliveryToWbPerUnit: 0, packagingCost: 0, manualFulfillmentCost: 20, otherCosts: 0,
};

const cls = 'w-full appearance-none bg-[#0C141B] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15';

const tips: Record<string, string> = {
  sale: 'Цена, по которой товар продаётся покупателю на Wildberries с учётом вашей скидки.',
  cost: 'Закупочная или производственная стоимость одной единицы товара. Если вы уже включили сюда упаковку, фулфилмент или доставку до WB, не дублируйте эти расходы в отдельных полях.',
  dims: 'Укажите габариты товара в индивидуальной упаковке. Они используются для расчёта объёма, логистики, хранения и вместимости паллеты.',
  geo: 'Выберите средний сценарий поставки. Калькулятор учтёт среднюю логистику и складские коэффициенты по выбранной географии.',
  ads: 'Рекламные расходы считаются как процент от цены продажи. Для поддержания продаж часто закладывают 10%, для активного запуска — 20%.',
  taxMode: 'Выберите режим налогообложения. Для УСН Доходы налог считается от цены продажи, для УСН Доходы-расходы — от прибыли до налога с учётом минимального налога 1% от дохода.',
  taxRate: 'Укажите ставку налога для вашего региона. Для УСН Доходы часто используют 6%, для УСН Доходы-расходы — 15%, но ставка может отличаться.',
  ff: 'Добавьте расход на подготовку товара, если пользуетесь сторонним фулфилментом. Не включайте повторно, если этот расход уже заложен в себестоимость.',
  delivery: 'Калькулятор рассчитывает доставку до WB через вместимость паллеты по габаритам товара и среднюю стоимость доставки по выбранной географии.',
};

export default function WbCalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>('simple');
  const [resultMode, setResultMode] = useState<ResultMode>('fbo');
  const [input, setInput] = useState<CalculatorInput>(initial);
  const [flash, setFlash] = useState(false);
  const isAdvanced = mode === 'advanced';

  useEffect(() => {
    if (!input.includeTaxes) return;
    setInput((p) => ({ ...p, taxRate: p.taxMode === 'usn6' ? (p.taxRate === 15 ? 6 : p.taxRate) : (p.taxRate === 6 ? 15 : p.taxRate) }));
  }, [input.taxMode]);

  useEffect(() => { setFlash(true); const t = setTimeout(() => setFlash(false), 350); return () => clearTimeout(t); }, [input, resultMode]);

  const context = useMemo(() => getCalculationContext(input, isAdvanced), [input, isAdvanced]);
  const results = useMemo(() => ({ fbo: calculateUnitEconomics(input, 'fbo', isAdvanced), fbs: calculateUnitEconomics(input, 'fbs', isAdvanced) }), [input, isAdvanced]);
  const r = results[resultMode];
  const totalExpenses = r.costPrice + r.commission + r.logistics + r.storage + r.processing + r.adCost + r.tax + r.fulfillment + r.deliveryToWb + r.packaging + r.otherCosts;

  const rows = [
    ['Цена на WB', r.salePrice, true], ['Себестоимость', -r.costPrice, true], ['Комиссия WB', -r.commission, true], ['Логистика WB', -r.logistics, true],
    ['Хранение WB', -r.storage, resultMode === 'fbo' && r.storage > 0], ['Обработка FBS', -r.processing, resultMode === 'fbs' && r.processing > 0],
    ['Реклама', -r.adCost, r.adCost > 0], ['Налог', -r.tax, r.tax > 0], ['Фулфилмент', -r.fulfillment, r.fulfillment > 0], ['Доставка до WB', -r.deliveryToWb, r.deliveryToWb > 0],
    ['Прибыль', r.profit, true, true],
  ] as const;

  return <div className="min-h-screen bg-[#050A0E] text-white overflow-x-hidden">
    <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/25 rounded-full blur-[150px]" /><div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-amber-500/20 rounded-full blur-[150px]" /></div>
    <section className="relative z-10 px-4 md:px-8 py-10 md:py-16 max-w-[1240px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap"><div><h1 className="text-2xl md:text-4xl tracking-tight">Калькулятор юнит-экономики WB</h1><p className="text-white/60 text-sm mt-2">Быстрый расчёт экономики по среднерыночным показателям.</p></div><Segmented value={mode} onChange={(v) => setMode(v as CalculatorMode)} options={[['simple', 'Простой'], ['advanced', 'Расширенный']]} /></div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-3xl space-y-3">
          {!isAdvanced && <Field label="Категория товара"><CustomSelect value={input.categoryId} onChange={(v) => setInput((p) => ({ ...p, categoryId: v }))} options={categories.map(c => ({ value: c.id, label: c.label }))} /></Field>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Цена продажи на WB" tip={tips.sale}><NumberInput value={input.salePrice} onChange={(v) => setInput((p) => ({ ...p, salePrice: v }))} min={1} max={1_000_000} /></Field>
            <Field label="Себестоимость товара" tip={tips.cost}><NumberInput value={input.costPrice} onChange={(v) => setInput((p) => ({ ...p, costPrice: v }))} min={0} max={1_000_000} /></Field>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
            <Field label="Длина, см" tip={tips.dims}><NumberInput value={input.lengthCm} onChange={(v) => setInput((p) => ({ ...p, lengthCm: v }))} min={0.1} max={300} step={0.1} /></Field>
            <span className="text-cyan-300 pt-6">×</span>
            <Field label="Ширина, см" tip={tips.dims}><NumberInput value={input.widthCm} onChange={(v) => setInput((p) => ({ ...p, widthCm: v }))} min={0.1} max={300} step={0.1} /></Field>
            <span className="text-cyan-300 pt-6">×</span>
            <Field label="Высота, см" tip={tips.dims}><NumberInput value={input.heightCm} onChange={(v) => setInput((p) => ({ ...p, heightCm: v }))} min={0.1} max={300} step={0.1} /></Field>
          </div>
          <Field label="Куда планируете поставлять товар?" tip={tips.geo}><CustomSelect value={input.geoPresetId} onChange={(v) => setInput((p) => ({ ...p, geoPresetId: v as CalculatorInput['geoPresetId'] }))} options={Object.entries(geoPresets).map(([value, g]) => ({ value, label: g.label }))} /></Field>

          {!isAdvanced && <>
            <CompactToggle label="Учитывать рекламу" checked={input.includeAds} onChange={(v) => setInput((p) => ({ ...p, includeAds: v }))} />
            <Reveal show={input.includeAds}><Field label="Рекламный сценарий" tip={tips.ads}><CustomSelect value={String(input.adRate)} onChange={(v) => setInput((p) => ({ ...p, adRate: Number(v) }))} options={[{ value: '0', label: 'Нет рекламы — 0%' }, { value: '0.1', label: 'Поддержание продаж — 10%' }, { value: '0.2', label: 'Активный запуск — 20%' }]} /></Field></Reveal>
            <CompactToggle label="Учитывать налоги" checked={input.includeTaxes} onChange={(v) => setInput((p) => ({ ...p, includeTaxes: v }))} />
            <Reveal show={input.includeTaxes}><Field label="Налоговый режим" tip={tips.taxMode}><CustomSelect value={input.taxMode} onChange={(v) => setInput((p) => ({ ...p, taxMode: v as TaxMode }))} options={[{ value: 'usn6', label: 'УСН Доходы' }, { value: 'usn15', label: 'УСН Доходы-расходы' }]} /></Field><Field label="Налоговая ставка, %" tip={tips.taxRate}><NumberInput value={input.taxRate} onChange={(v) => setInput((p) => ({ ...p, taxRate: v }))} min={0} max={100} /></Field></Reveal>
            <CompactToggle label="Работаю через фулфилмент" checked={input.includeFulfillment} onChange={(v) => setInput((p) => ({ ...p, includeFulfillment: v }))} />
            <CompactToggle label="Учитывать доставку до WB" checked={input.includeDeliveryToWb} onChange={(v) => setInput((p) => ({ ...p, includeDeliveryToWb: v }))} />
            <Reveal show={input.includeDeliveryToWb}><p className="text-xs text-white/60">Помещается на паллету: {context.itemsPerPallet} шт. · Средняя доставка до WB: {formatCurrency(context.deliveryToWbPerUnit)}/ед.</p></Reveal>
          </>}

          <Reveal show={isAdvanced}><div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Комиссия WB, %"><NumberInput value={input.manualKvv} onChange={(v) => setInput((p) => ({ ...p, manualKvv: v }))} min={0} max={100} /></Field>
            <Field label="ДРР, %"><NumberInput value={input.adRate * 100} onChange={(v) => setInput((p) => ({ ...p, adRate: v / 100 }))} min={0} max={100} /></Field>
            <Field label="Доля выкупа, %"><NumberInput value={input.manualBuyoutRate} onChange={(v) => setInput((p) => ({ ...p, manualBuyoutRate: v }))} min={0} max={100} /></Field>
            <Field label="Локализация продаж, %"><NumberInput value={input.manualLocalOrderShare} onChange={(v) => setInput((p) => ({ ...p, manualLocalOrderShare: v }))} min={0} max={100} /></Field>
            <Field label="Срок хранения, дней"><NumberInput value={input.manualStorageDays} onChange={(v) => setInput((p) => ({ ...p, manualStorageDays: v }))} min={0} max={365} /></Field>
            <Field label="Налоговый режим"><CustomSelect value={input.taxMode} onChange={(v) => setInput((p) => ({ ...p, taxMode: v as TaxMode }))} options={[{ value: 'usn6', label: 'УСН Доходы' }, { value: 'usn15', label: 'УСН Доходы-расходы' }]} /></Field>
            <Field label="Налоговая ставка, %"><NumberInput value={input.taxRate} onChange={(v) => setInput((p) => ({ ...p, taxRate: v }))} min={0} max={100} /></Field>
            <Field label="Доставка до WB, ₽/ед."><NumberInput value={input.manualDeliveryToWbPerUnit} onChange={(v) => setInput((p) => ({ ...p, manualDeliveryToWbPerUnit: v }))} min={0} max={100000} /></Field>
            <Field label="Фулфилмент, ₽"><NumberInput value={input.manualFulfillmentCost} onChange={(v) => setInput((p) => ({ ...p, manualFulfillmentCost: v }))} min={0} max={100000} /></Field>
            <Field label="Упаковка, ₽"><NumberInput value={input.packagingCost} onChange={(v) => setInput((p) => ({ ...p, packagingCost: v }))} min={0} max={100000} /></Field>
            <Field label="Прочие расходы, ₽"><NumberInput value={input.otherCosts} onChange={(v) => setInput((p) => ({ ...p, otherCosts: v }))} min={0} max={100000} /></Field>
          </div></Reveal>
        </div>

        <div className={`xl:col-span-6 p-5 md:p-6 bg-white/[0.03] border rounded-3xl space-y-4 transition-all duration-300 ${flash ? 'border-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]' : 'border-white/10'}`}>
          <div className="flex items-center justify-between"><h2 className="text-lg">Результат</h2><Segmented value={resultMode} onChange={(v) => setResultMode(v as ResultMode)} options={[['fbo', 'FBO'], ['fbs', 'FBS']]} /></div>
          <div className="grid grid-cols-2 gap-3"><Metric label="Цена на WB" value={<AnimatedNumber value={r.salePrice} type='currency' />} /><Metric label="Прибыль" value={<AnimatedNumber value={r.profit} type='currency' />} tone={r.profit >= 0 ? 'good' : 'bad'} /><Metric label="Маржа" value={<AnimatedNumber value={r.margin} type='percent' />} /><Metric label="ROI" value={r.roi === null ? '—' : <AnimatedNumber value={r.roi} type='percent' />} /></div>
          <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02]"><div className="text-xs text-white/60">Сумма всех расходов</div><div className="text-2xl"><AnimatedNumber value={totalExpenses} type='currency' /></div></div>
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B131A]/70"><table className="w-full text-sm"><tbody>{rows.map(([label, val, show, strong]) => show ? <Row key={label} label={label} value={val} strong={!!strong} /> : null)}</tbody></table></div>
        </div>
      </div>
    </section>
  </div>;
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return <input type="number" value={text} min={min} max={max} step={step} onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setText(e.target.value)} onBlur={() => { const n = Number(text); const v = Number.isFinite(n) ? clamp(n) : min; onChange(v); setText(String(v)); }} className={cls} />;
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className={cls + ' pr-9'}>{options.map((o) => <option key={o.value} value={o.value} className="bg-[#111922] text-white">{o.label}</option>)}</select><span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none">▾</span></div>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) { return <label className="block space-y-1"><span className="text-xs text-white/65 flex items-center gap-2">{label}{tip && <Tip text={tip} />}</span>{children}</label>; }
function Tip({ text }: { text: string }) { return <span className="group relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-white/20 text-[10px] text-white/50 cursor-help">i<span className="absolute hidden group-hover:block group-active:block z-20 w-64 p-2 rounded-lg bg-[#0F1820] border border-white/15 text-white/75 text-[11px] leading-snug left-1/2 -translate-x-1/2 top-5">{text}</span></span>; }
function CompactToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) { return <button type='button' onClick={() => onChange(!checked)} className='w-full py-1.5 flex items-center justify-between text-sm'><span className='text-white/80'>{label}</span><span className={`w-10 h-6 rounded-full p-1 transition-all ${checked ? 'bg-cyan-500/40' : 'bg-white/15'}`}><span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} /></span></button>; }
function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) { const i = Math.max(0, options.findIndex((o) => o[0] === value)); return <div className='relative inline-grid grid-cols-2 p-1 rounded-xl border border-white/10 bg-white/[0.03]'><div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-cyan-500/20 border border-cyan-400/30 transition-transform duration-300 ${i === 1 ? 'translate-x-full' : ''}`} />{options.map(([k, l]) => <button key={k} onClick={() => onChange(k)} className={`relative z-10 px-4 py-2 text-sm ${value === k ? 'text-cyan-200' : 'text-white/65'}`}>{l}</button>)}</div>; }
function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) { return <div className={`grid transition-all duration-300 ${show ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className='overflow-hidden'>{children}</div></div>; }
function AnimatedNumber({ value, type }: { value: number; type: 'currency' | 'percent' }) { const [d, setD] = useState(value); const prev = useRef(value); useEffect(() => { const s = prev.current, e = value, st = performance.now(), dur = 420; let raf = 0; const tick = (t: number) => { const p = Math.min((t - st) / dur, 1); setD(s + (e - s) * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); prev.current = e; return () => cancelAnimationFrame(raf); }, [value]); return <>{type === 'currency' ? formatCurrency(d) : formatPercent(d)}</>; }
function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'bad' }) { const c = tone === 'good' ? 'text-green-300' : tone === 'bad' ? 'text-red-300' : 'text-white'; return <div className='p-4 rounded-2xl border border-white/10 bg-[#0C141B]'><div className='text-xs text-white/60 mb-1'>{label}</div><div className={`text-2xl ${c}`}>{value}</div></div>; }
function Row({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) { return <tr className={`border-b border-white/5 ${strong ? 'bg-cyan-500/10' : ''}`}><td className='px-3 py-2 text-white/70'>{label}</td><td className={`px-3 py-2 text-right ${strong ? 'text-cyan-200 font-semibold' : 'text-white/90'}`}><AnimatedNumber value={value} type='currency' /></td></tr>; }
