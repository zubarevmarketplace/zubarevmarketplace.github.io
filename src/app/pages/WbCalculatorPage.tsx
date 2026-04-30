import { useEffect, useMemo, useRef, useState } from "react";
import { categories } from "../config/categories";
import { geoPresets } from "../config/geoPresets";
import {
  calculateUnitEconomics,
  getCalculationContext,
} from "../lib/calculateUnitEconomics";
import { formatCurrency, formatPercent } from "../lib/formatters";
import type {
  CalculatorInput,
  CalculatorMode,
  ResultMode,
  TaxMode,
} from "../types/calculator";

const initial: CalculatorInput = {
  categoryId: "home",
  salePrice: 2500,
  costPrice: 900,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 10,
  geoPresetId: "allRussia",
  includeAds: true,
  adRate: 0.1,
  includeTaxes: true,
  taxMode: "usn6",
  customTaxRate: 0.06,
  includeFulfillment: false,
  includeDeliveryToWb: false,
  manualKvv: 0.18,
  manualBuyoutRate: 0.9,
  manualLocalOrderShare: 0.5,
  manualStorageDays: 30,
  manualDeliveryToWbPerUnit: 0,
  packagingCost: 0,
  manualFulfillmentCost: 20,
  otherCosts: 0,
};

const field =
  "w-full appearance-none bg-[#0C141B] border border-white/8 hover:border-white/15 rounded-xl px-3 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/15";

export default function WbCalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>("simple");
  const [resultMode, setResultMode] = useState<ResultMode>("fbo");
  const [input, setInput] = useState<CalculatorInput>(initial);
  const [flash, setFlash] = useState(false);
  const isAdvanced = mode === "advanced";

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 350);
    return () => clearTimeout(t);
  }, [input, resultMode]);

  const context = useMemo(
    () => getCalculationContext(input, isAdvanced),
    [input, isAdvanced],
  );
  const results = useMemo(
    () => ({
      fbo: calculateUnitEconomics(input, "fbo", isAdvanced),
      fbs: calculateUnitEconomics(input, "fbs", isAdvanced),
    }),
    [input, isAdvanced],
  );
  const r = results[resultMode];
  const totalExpenses =
    r.costPrice +
    r.commission +
    r.logistics +
    r.storage +
    r.processing +
    r.adCost +
    r.tax +
    r.fulfillment +
    r.deliveryToWb +
    r.packaging +
    r.otherCosts;

  const setNumber =
    (key: keyof CalculatorInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setInput((p) => ({ ...p, [key]: Number(e.target.value) || 0 }));

  const rows = [
    ["Цена на WB", r.salePrice, true],
    ["Себестоимость", -r.costPrice, true],
    ["Комиссия WB", -r.commission, true],
    ["Логистика WB", -r.logistics, true],
    ["Хранение WB", -r.storage, resultMode === "fbo" && r.storage > 0],
    ["Обработка FBS", -r.processing, resultMode === "fbs" && r.processing > 0],
    ["Реклама", -r.adCost, r.adCost > 0],
    ["Налог", -r.tax, r.tax > 0],
    ["Фулфилмент", -r.fulfillment, r.fulfillment > 0],
    ["Доставка до WB", -r.deliveryToWb, r.deliveryToWb > 0],
    ["Прибыль", r.profit, true, true],
  ] as const;

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
            <h1 className="text-2xl md:text-4xl tracking-tight">
              Калькулятор юнит-экономики WB
            </h1>
            <p className="text-white/60 text-sm mt-2">
              Быстрый расчёт экономики по среднерыночным показателям.
            </p>
          </div>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as CalculatorMode)}
            options={[
              ["simple", "Простой"],
              ["advanced", "Расширенный"],
            ]}
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-6 p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4">
            <L label="Категория товара">
              <select
                value={input.categoryId}
                onChange={(e) =>
                  setInput((p) => ({ ...p, categoryId: e.target.value }))
                }
                className={field}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0C141B]">
                    {c.label}
                  </option>
                ))}
              </select>
            </L>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <L label="Цена продажи на WB">
                <input
                  type="number"
                  value={input.salePrice}
                  onChange={setNumber("salePrice")}
                  className={field}
                />
              </L>
              <L label="Себестоимость товара">
                <input
                  type="number"
                  value={input.costPrice}
                  onChange={setNumber("costPrice")}
                  className={field}
                />
              </L>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
              <L label="Длина, см">
                <input
                  type="number"
                  value={input.lengthCm}
                  onChange={setNumber("lengthCm")}
                  className={field}
                />
              </L>
              <span className="text-cyan-300 pt-6">×</span>
              <L label="Ширина, см">
                <input
                  type="number"
                  value={input.widthCm}
                  onChange={setNumber("widthCm")}
                  className={field}
                />
              </L>
              <span className="text-cyan-300 pt-6">×</span>
              <L label="Высота, см">
                <input
                  type="number"
                  value={input.heightCm}
                  onChange={setNumber("heightCm")}
                  className={field}
                />
              </L>
            </div>
            <L label="Куда планируете поставлять товар?">
              <select
                value={input.geoPresetId}
                onChange={(e) =>
                  setInput((p) => ({
                    ...p,
                    geoPresetId: e.target
                      .value as CalculatorInput["geoPresetId"],
                  }))
                }
                className={field}
              >
                {Object.entries(geoPresets).map(([id, g]) => (
                  <option key={id} value={id} className="bg-[#0C141B]">
                    {g.label}
                  </option>
                ))}
              </select>
            </L>

            {!isAdvanced && (
              <div className="space-y-2 py-1">
                <CompactToggle
                  label="Учитывать рекламу"
                  checked={input.includeAds}
                  onChange={(v) => setInput((p) => ({ ...p, includeAds: v }))}
                />
                <Reveal show={input.includeAds}>
                  <L label="Рекламный сценарий">
                    <select
                      value={input.adRate}
                      onChange={(e) =>
                        setInput((p) => ({
                          ...p,
                          adRate: Number(e.target.value),
                        }))
                      }
                      className={field}
                    >
                      <option value={0} className="bg-[#0C141B]">
                        Нет рекламы — 0%
                      </option>
                      <option value={0.1} className="bg-[#0C141B]">
                        Поддержание продаж — 10%
                      </option>
                      <option value={0.2} className="bg-[#0C141B]">
                        Активный запуск — 20%
                      </option>
                    </select>
                  </L>
                </Reveal>
                <CompactToggle
                  label="Учитывать налоги"
                  checked={input.includeTaxes}
                  onChange={(v) => setInput((p) => ({ ...p, includeTaxes: v }))}
                />
                <Reveal show={input.includeTaxes}>
                  <L label="Налоговый режим">
                    <select
                      value={input.taxMode}
                      onChange={(e) =>
                        setInput((p) => ({
                          ...p,
                          taxMode: e.target.value as TaxMode,
                        }))
                      }
                      className={field}
                    >
                      <option value="usn6" className="bg-[#0C141B]">
                        УСН Доходы 6%
                      </option>
                      <option value="usn15" className="bg-[#0C141B]">
                        УСН Доходы-расходы 15%
                      </option>
                      <option value="custom" className="bg-[#0C141B]">
                        Свой процент
                      </option>
                    </select>
                  </L>
                  <Reveal show={input.taxMode === "custom"}>
                    <L label="Свой налог, %">
                      <input
                        type="number"
                        value={input.customTaxRate * 100}
                        onChange={(e) =>
                          setInput((p) => ({
                            ...p,
                            customTaxRate: Number(e.target.value) / 100,
                          }))
                        }
                        className={field}
                      />
                    </L>
                  </Reveal>
                </Reveal>
                <CompactToggle
                  label="Работаю через фулфилмент"
                  checked={input.includeFulfillment}
                  onChange={(v) =>
                    setInput((p) => ({ ...p, includeFulfillment: v }))
                  }
                />
                <CompactToggle
                  label="Учитывать доставку до WB"
                  checked={input.includeDeliveryToWb}
                  onChange={(v) =>
                    setInput((p) => ({ ...p, includeDeliveryToWb: v }))
                  }
                />
                <Reveal show={input.includeDeliveryToWb}>
                  <p className="text-xs text-white/60">
                    Помещается на паллету: {context.itemsPerPallet} шт. ·
                    Средняя доставка до WB:{" "}
                    {formatCurrency(context.deliveryToWbPerUnit)}/ед.
                  </p>
                </Reveal>
              </div>
            )}

            <Reveal show={isAdvanced}>
              <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <L label="Комиссия WB, %">
                  <input
                    type="number"
                    value={input.manualKvv * 100}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        manualKvv: Number(e.target.value) / 100,
                      }))
                    }
                    className={field}
                  />
                </L>
                <L label="ДРР, %">
                  <input
                    type="number"
                    value={input.adRate * 100}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        adRate: Number(e.target.value) / 100,
                      }))
                    }
                    className={field}
                  />
                  <Hint text="Для активного запуска часто закладывают 20%. Для поддержания продаж — 10%. Если товар продаётся без рекламы, можно поставить 0%." />
                </L>
                <L label="Доля выкупа, %">
                  <input
                    type="number"
                    value={input.manualBuyoutRate * 100}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        manualBuyoutRate: Number(e.target.value) / 100,
                      }))
                    }
                    className={field}
                  />
                  <Hint text="Для одежды, обуви и размерных товаров часто ставят 30–50%. Для обычной товарки — 80–95%." />
                </L>
                <L label="Локализация продаж, %">
                  <input
                    type="number"
                    value={input.manualLocalOrderShare * 100}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        manualLocalOrderShare: Number(e.target.value) / 100,
                      }))
                    }
                    className={field}
                  />
                  <Hint text="Рекомендую ставить 50%, если вы сомневаетесь, что выбрать. У большинства продавцов локализация ниже 100%, особенно если товар распределён по складам неравномерно." />
                </L>
                <L label="Срок хранения, дней">
                  <input
                    type="number"
                    value={input.manualStorageDays}
                    onChange={setNumber("manualStorageDays")}
                    className={field}
                  />
                  <Hint text="Если партия продаётся дольше, хранение увеличит расходы." />
                </L>
                <L label="Налоговый режим">
                  <select
                    value={input.taxMode}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        taxMode: e.target.value as TaxMode,
                      }))
                    }
                    className={field}
                  >
                    <option value="usn6" className="bg-[#0C141B]">
                      УСН Доходы 6%
                    </option>
                    <option value="usn15" className="bg-[#0C141B]">
                      УСН Доходы-расходы 15%
                    </option>
                    <option value="custom" className="bg-[#0C141B]">
                      Свой процент
                    </option>
                  </select>
                </L>
                <L label="Свой налог, %">
                  <input
                    type="number"
                    value={input.customTaxRate * 100}
                    onChange={(e) =>
                      setInput((p) => ({
                        ...p,
                        customTaxRate: Number(e.target.value) / 100,
                      }))
                    }
                    className={field}
                  />
                </L>
                <L label="Доставка до WB, ₽/ед.">
                  <input
                    type="number"
                    value={input.manualDeliveryToWbPerUnit}
                    onChange={setNumber("manualDeliveryToWbPerUnit")}
                    className={field}
                  />
                </L>
                <L label="Фулфилмент, ₽">
                  <input
                    type="number"
                    value={input.manualFulfillmentCost}
                    onChange={setNumber("manualFulfillmentCost")}
                    className={field}
                  />
                </L>
                <L label="Упаковка, ₽">
                  <input
                    type="number"
                    value={input.packagingCost}
                    onChange={setNumber("packagingCost")}
                    className={field}
                  />
                </L>
                <L label="Прочие расходы, ₽">
                  <input
                    type="number"
                    value={input.otherCosts}
                    onChange={setNumber("otherCosts")}
                    className={field}
                  />
                </L>
              </div>
            </Reveal>
          </div>

          <div
            className={`xl:col-span-6 p-5 md:p-6 bg-white/[0.03] border rounded-3xl space-y-4 transition-all duration-300 ${flash ? "border-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]" : "border-white/10"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Результат</h2>
              <Segmented
                value={resultMode}
                onChange={(v) => setResultMode(v as ResultMode)}
                options={[
                  ["fbo", "FBO"],
                  ["fbs", "FBS"],
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Цена на WB"
                value={<AnimatedNumber value={r.salePrice} type="currency" />}
              />
              <Metric
                label="Прибыль"
                value={<AnimatedNumber value={r.profit} type="currency" />}
                tone={r.profit >= 0 ? "good" : "bad"}
              />
              <Metric
                label="Маржа"
                value={<AnimatedNumber value={r.margin} type="percent" />}
              />
              <Metric
                label="ROI"
                value={
                  r.roi === null ? (
                    "—"
                  ) : (
                    <AnimatedNumber value={r.roi} type="percent" />
                  )
                }
              />
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02]">
              <div className="text-xs text-white/60">Сумма всех расходов</div>
              <div className="text-2xl">
                <AnimatedNumber value={totalExpenses} type="currency" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B131A]/70">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, val, show, strong]) =>
                    show ? (
                      <Row
                        key={label}
                        label={label}
                        value={val}
                        strong={!!strong}
                      />
                    ) : null,
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/60">
              {resultMode === "fbo"
                ? "В расчёте учтены комиссия WB, средняя логистика по выбранной географии, среднерыночная локализация продаж, хранение, реклама и налоги."
                : "В расчёте учтены комиссия WB, базовая логистика FBS, обработка заказа, реклама и налоги."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnimatedNumber({
  value,
  type,
}: {
  value: number;
  type: "currency" | "percent";
}) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const s = prev.current,
      e = value,
      st = performance.now(),
      dur = 420;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - st) / dur, 1);
      setD(s + (e - s) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prev.current = e;
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{type === "currency" ? formatCurrency(d) : formatPercent(d)}</>;
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-white/65">{label}</span>
      {children}
    </label>
  );
}
function Hint({ text }: { text: string }) {
  return <p className="text-[11px] text-white/45 mt-1">{text}</p>;
}
function CompactToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full py-1.5 flex items-center justify-between text-sm"
    >
      <span className="text-white/80">{label}</span>
      <span
        className={`w-10 h-6 rounded-full p-1 transition-all ${checked ? "bg-cyan-500/40" : "bg-white/15"}`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
    </button>
  );
}
function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  const i = Math.max(
    0,
    options.findIndex((o) => o[0] === value),
  );
  return (
    <div className="relative inline-grid grid-cols-2 p-1 rounded-xl border border-white/10 bg-white/[0.03]">
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-cyan-500/20 border border-cyan-400/30 transition-transform duration-300 ${i === 1 ? "translate-x-full" : ""}`}
      />
      {options.map(([k, l]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`relative z-10 px-4 py-2 text-sm ${value === k ? "text-cyan-200" : "text-white/65"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
function Reveal({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-all duration-300 ${show ? "grid-rows-[1fr] opacity-100 translate-y-0" : "grid-rows-[0fr] opacity-0 -translate-y-1"}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "good" | "bad";
}) {
  const c =
    tone === "good"
      ? "text-green-300"
      : tone === "bad"
        ? "text-red-300"
        : "text-white";
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-[#0C141B] transition-all duration-300 hover:border-cyan-400/35">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className={`text-2xl ${c}`}>{value}</div>
    </div>
  );
}
function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <tr
      className={`border-b border-white/5 transition-all duration-300 ${strong ? "bg-cyan-500/10" : ""}`}
    >
      <td className="px-3 py-2 text-white/70">{label}</td>
      <td
        className={`px-3 py-2 text-right ${strong ? "text-cyan-200 font-semibold" : "text-white/90"}`}
      >
        <AnimatedNumber value={value} type="currency" />
      </td>
    </tr>
  );
}
