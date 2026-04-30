import { useMemo, useState } from 'react';
import { categories } from '../config/categories';
import { geoPresets } from '../config/geoPresets';
import { calculateUnitEconomics, getCalculationContext } from '../lib/calculateUnitEconomics';
import { formatCurrency, formatPercent } from '../lib/formatters';
import type { CalculatorInput, CalculatorMode, ResultMode, TaxMode } from '../types/calculator';

const adPresets = [
  { label: 'Нет рекламы — 0%', value: 0 },
  { label: 'Поддержание продаж — 10%', value: 0.1 },
  { label: 'Активный запуск — 20%', value: 0.2 },
];

const initial: CalculatorInput = {
  categoryId: 'home', salePrice: 2500, costPrice: 900, lengthCm: 30, widthCm: 20, heightCm: 10,
  geoPresetId: 'allRussia', includeAds: true, adRate: 0.1, includeTaxes: true, taxMode: 'usn6', customTaxRate: 0.06,
  includeFulfillment: false, includeDeliveryToWb: false, manualKvv: 0.18, manualBuyoutRate: 0.9, manualLocalOrderShare: 0.5,
  manualStorageDays: 30, manualDeliveryToWbPerUnit: 0, packagingCost: 0, manualFulfillmentCost: 20, otherCosts: 0,
};

const field = 'w-full bg-[#0C141B] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/35 transition-all duration-200 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15';

export default function WbCalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>('simple');
  const [resultMode, setResultMode] = useState<ResultMode>('fbo');
  const [input, setInput] = useState<CalculatorInput>(initial);
  const isAdvanced = mode === 'advanced';

  const context = useMemo(() => getCalculationContext(input, isAdvanced), [input, isAdvanced]);
  const results = useMemo(() => ({ fbo: calculateUnitEconomics(input, 'fbo', isAdvanced), fbs: calculateUnitEconomics(input, 'fbs', isAdvanced) }), [input, isAdvanced]);
  const result = results[resultMode];

  const setNumber = (key: keyof CalculatorInput) => (e: React.ChangeEvent<HTMLInputElement>) => setInput((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }));

  return (
    <div className="min-h-screen bg-[#050A0E] text-white overflow-x-hidden">
      <style>{`input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}input[type=number]{-moz-appearance:textfield;}`}</style>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/25 rounded-full blur-[150px]" />
        <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-amber-500/20 rounded-full blur-[150px]" />
      </div>

      <section className="relative z-10 px-4 md:px-8 py-10 md:py-16 max-w-[1240px] mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-4xl tracking-tight">Калькулятор юнит-экономики WB</h1>
            <p className="text-white/60 text-sm mt-2">Быстрый расчёт в среднем сценарии с переключением между FBO и FBS.</p>
          </div>
          <Segmented value={mode} onChange={(v) => setMode(v as CalculatorMode)} options={[['simple', 'Простой'], ['advanced', 'Расширенный']]} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-6 p-5 md:p-6 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl space-y-5">
            <h2 className="text-lg">Параметры товара</h2>
            <Labeled label="Категория товара"><select value={input.categoryId} onChange={(e) => setInput((p) => ({ ...p, categoryId: e.target.value }))} className={field}>{categories.map((c) => <option key={c.id} value={c.id} className="bg-[#0C141B]">{c.label}</option>)}</select></Labeled>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Labeled label="Цена продажи на WB"><input type="number" value={input.salePrice} onChange={setNumber('salePrice')} className={field} /></Labeled>
              <Labeled label="Себестоимость товара"><input type="number" value={input.costPrice} onChange={setNumber('costPrice')} className={field} /></Labeled>
            </div>

            <div>
              <div className="text-xs text-white/65 mb-2">Габариты товара</div>
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
                <Labeled label="Длина, см"><input type="number" value={input.lengthCm} onChange={setNumber('lengthCm')} className={field} /></Labeled>
                <span className="text-cyan-300/80 text-xl pt-6">×</span>
                <Labeled label="Ширина, см"><input type="number" value={input.widthCm} onChange={setNumber('widthCm')} className={field} /></Labeled>
                <span className="text-cyan-300/80 text-xl pt-6">×</span>
                <Labeled label="Высота, см"><input type="number" value={input.heightCm} onChange={setNumber('heightCm')} className={field} /></Labeled>
              </div>
            </div>

            <Labeled label="Куда планируете поставлять товар?"><select value={input.geoPresetId} onChange={(e) => setInput((p) => ({ ...p, geoPresetId: e.target.value as CalculatorInput['geoPresetId'] }))} className={field}>{Object.entries(geoPresets).map(([id, geo]) => <option key={id} value={id} className="bg-[#0C141B]">{geo.label}</option>)}</select></Labeled>

            <Toggle label="Учитывать рекламу" checked={input.includeAds} onChange={(v) => setInput((p) => ({ ...p, includeAds: v }))} />
            <Reveal show={input.includeAds}><Labeled label="Рекламный сценарий"><select value={input.adRate} onChange={(e) => setInput((p) => ({ ...p, adRate: Number(e.target.value) }))} className={field}>{adPresets.map((ad) => <option key={ad.label} value={ad.value} className="bg-[#0C141B]">{ad.label}</option>)}</select></Labeled></Reveal>

            <Toggle label="Учитывать налоги" checked={input.includeTaxes} onChange={(v) => setInput((p) => ({ ...p, includeTaxes: v }))} />
            <Reveal show={input.includeTaxes}>
              <Labeled label="Налоговый режим">
                <select value={input.taxMode} onChange={(e) => setInput((p) => ({ ...p, taxMode: e.target.value as TaxMode }))} className={field}>
                  <option value="usn6" className="bg-[#0C141B]">УСН Доходы 6%</option>
                  <option value="usn15" className="bg-[#0C141B]">УСН Доходы-расходы 15%</option>
                  <option value="custom" className="bg-[#0C141B]">Свой процент</option>
                </select>
              </Labeled>
              <Reveal show={input.taxMode === 'custom'}><Labeled label="Свой налог, %"><input type="number" value={input.customTaxRate * 100} onChange={(e) => setInput((p) => ({ ...p, customTaxRate: Number(e.target.value) / 100 }))} className={field} /></Labeled></Reveal>
            </Reveal>

            <Toggle label="Работаю через фулфилмент" checked={input.includeFulfillment} onChange={(v) => setInput((p) => ({ ...p, includeFulfillment: v }))} />
            <Toggle label="Учитывать доставку до WB" checked={input.includeDeliveryToWb} onChange={(v) => setInput((p) => ({ ...p, includeDeliveryToWb: v }))} />
            <Reveal show={input.includeDeliveryToWb && !isAdvanced}><p className="text-xs text-white/60">Помещается на паллету: <span className="text-white">{context.itemsPerPallet} шт.</span> · Средняя доставка до WB: <span className="text-cyan-300">{formatCurrency(context.deliveryToWbPerUnit)}/ед.</span></p></Reveal>

            <Reveal show={isAdvanced}>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-sm text-white/90">Расширенные параметры</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Labeled label="Комиссия WB, %"><input type="number" value={input.manualKvv * 100} onChange={(e) => setInput((p) => ({ ...p, manualKvv: Number(e.target.value) / 100 }))} className={field} /></Labeled>
                  <Labeled label="ДРР, %"><input type="number" value={input.adRate * 100} onChange={(e) => setInput((p) => ({ ...p, adRate: Number(e.target.value) / 100 }))} className={field} /></Labeled>
                  <Labeled label="Доля выкупа, %"><input type="number" value={input.manualBuyoutRate * 100} onChange={(e) => setInput((p) => ({ ...p, manualBuyoutRate: Number(e.target.value) / 100 }))} className={field} /></Labeled>
                  <Labeled label="Локализация продаж, %"><input type="number" value={input.manualLocalOrderShare * 100} onChange={(e) => setInput((p) => ({ ...p, manualLocalOrderShare: Number(e.target.value) / 100 }))} className={field} /></Labeled>
                  <Labeled label="Срок хранения, дней"><input type="number" value={input.manualStorageDays} onChange={setNumber('manualStorageDays')} className={field} /></Labeled>
                  <Labeled label="Доставка до WB, ₽/ед."><input type="number" value={input.manualDeliveryToWbPerUnit} onChange={setNumber('manualDeliveryToWbPerUnit')} className={field} /></Labeled>
                  <Labeled label="Упаковка, ₽"><input type="number" value={input.packagingCost} onChange={setNumber('packagingCost')} className={field} /></Labeled>
                  <Labeled label="Фулфилмент, ₽"><input type="number" value={input.manualFulfillmentCost} onChange={setNumber('manualFulfillmentCost')} className={field} /></Labeled>
                  <Labeled label="Прочие расходы, ₽"><input type="number" value={input.otherCosts} onChange={setNumber('otherCosts')} className={field} /></Labeled>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="xl:col-span-6 p-5 md:p-6 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg">Результат</h2>
              <Segmented value={resultMode} onChange={(v) => setResultMode(v as ResultMode)} options={[['fbo', 'FBO'], ['fbs', 'FBS']]} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Цена на WB" value={formatCurrency(result.salePrice)} />
              <Metric label="Прибыль" value={formatCurrency(result.profit)} tone={result.profit >= 0 ? 'good' : 'bad'} />
              <Metric label="Маржа" value={formatPercent(result.margin)} />
              <Metric label="ROI" value={result.roi === null ? '—' : formatPercent(result.roi)} />
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02]">
              <div className="text-xs text-white/60 mb-1">Цена без убытка</div>
              <div className="text-2xl tracking-tight">{formatCurrency(result.breakEvenPrice)}</div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B131A]/70">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Цена на WB" value={result.salePrice} />
                  <Row label="Себестоимость" value={-result.costPrice} />
                  <Row label="Комиссия WB" value={-result.commission} />
                  <Row label="Логистика WB" value={-result.logistics} />
                  {resultMode === 'fbo' ? <Row label="Хранение WB" value={-result.storage} /> : <Row label="Обработка FBS" value={-result.processing} />}
                  <Row label="Реклама" value={-result.adCost} />
                  <Row label="Налог" value={-result.tax} />
                  {input.includeFulfillment && <Row label="Фулфилмент" value={-result.fulfillment} />}
                  {(input.includeDeliveryToWb || isAdvanced) && <Row label="Доставка до WB" value={-result.deliveryToWb} />}
                  <Row label="Прибыль" value={result.profit} strong />
                </tbody>
              </table>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              {resultMode === 'fbo' ? 'В расчёте учтены комиссия WB, средняя логистика по выбранной географии, среднерыночная локализация продаж, хранение, реклама и налоги.' : 'В расчёте учтены комиссия WB, базовая логистика FBS, обработка заказа, реклама и налоги.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5"><span className="text-xs text-white/65">{label}</span>{children}</label>; }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full p-3 rounded-xl border border-white/10 bg-[#0C141B] hover:border-cyan-400/40 transition-all duration-200 flex items-center justify-between">
      <span className="text-sm text-white/85">{label}</span>
      <span className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-cyan-500/40' : 'bg-white/15'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></span>
    </button>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  const index = Math.max(0, options.findIndex((o) => o[0] === value));
  return <div className="relative inline-grid grid-cols-2 p-1 rounded-xl border border-white/10 bg-white/[0.03]"><div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-cyan-500/20 border border-cyan-400/30 transition-transform duration-300 ${index === 1 ? 'translate-x-full' : ''}`} />{options.map(([key, label]) => <button key={key} onClick={() => onChange(key)} className={`relative z-10 px-4 py-2 text-sm transition-colors ${value === key ? 'text-cyan-200' : 'text-white/65 hover:text-white/90'}`}>{label}</button>)}</div>;
}

function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) { return <div className={`grid transition-all duration-300 ${show ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden">{children}</div></div>; }

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-green-300' : tone === 'bad' ? 'text-red-300' : 'text-white';
  return <div className="p-4 rounded-2xl border border-white/10 bg-[#0C141B]"><div className="text-xs text-white/60 mb-1">{label}</div><div className={`text-2xl tracking-tight ${color}`}>{value}</div></div>;
}

function Row({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <tr className={`border-b border-white/5 ${strong ? 'bg-cyan-500/10' : ''}`}><td className="px-3 py-2 text-white/70">{label}</td><td className={`px-3 py-2 text-right ${strong ? 'text-cyan-200 font-semibold' : 'text-white/90'}`}>{formatCurrency(value)}</td></tr>;
}
