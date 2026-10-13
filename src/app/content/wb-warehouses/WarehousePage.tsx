import { warehouseTariffs } from '../../../calculator/config/warehouseTariffs';
import ContentPage from '../../components/content/ContentPage';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { formatCurrency } from '../../lib/formatters';
import type { ContentPageDefinition } from '../registry';
import { warehousePath } from './pages';
import { calculateWarehouseExample, formatCoefficient, formatWeight, getWarehousePresets, type WarehouseSlug } from './calc';
import CoefficientGuide from './CoefficientGuide';

export default function WarehousePage({ page, slug }: { page: ContentPageDefinition; slug: string }) {
  if (!Object.hasOwn(warehouseTariffs, slug)) throw new Error('Нет данных склада: ' + slug);
  const key = slug as WarehouseSlug;
  const warehouse = warehouseTariffs[key];
  const example = calculateWarehouseExample(key);
  const presets = getWarehousePresets(key);
  const others = Object.entries(warehouseTariffs).filter(([other]) => other !== slug);

  return (
    <ContentPage page={page}>
      <div className="space-y-8">
        <Card className="border-white/10 bg-[#0B141C]/75 text-white">
          <CardHeader><CardTitle>Коэффициенты склада для коробов</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full table-fixed text-sm">
              <caption className="sr-only">Коэффициенты склада {warehouse.label}</caption>
              <tbody className="divide-y divide-white/10">
                <tr><th scope="row" className="w-[55%] py-3 text-left font-normal text-white/70">Логистика</th><td className="py-3 text-right tabular-nums">{formatCoefficient(warehouse.logistics)}</td></tr>
                <tr><th scope="row" className="py-3 text-left font-normal text-white/70">Хранение</th><td className="py-3 text-right tabular-nums">{formatCoefficient(warehouse.storage)}</td></tr>
                <tr><th scope="row" className="py-3 text-left font-normal text-white/70">FBS</th><td className="py-3 text-right tabular-nums">{warehouse.fbs === null ? 'FBS недоступен' : formatCoefficient(warehouse.fbs)}</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        <section aria-labelledby="logistics-example" className="max-w-3xl space-y-4">
          <h2 id="logistics-example" className="text-xl md:text-2xl">Пример расчёта логистики: 30×20×10 см</h2>
          <p className="text-sm leading-relaxed text-white/70">Объём товара с упаковкой: 30 × 20 × 10 / 1000 = {formatCoefficient(example.volumeLiters)} л. Для такого объёма база в калькуляторе равна {formatCurrency(example.baseLogistics)}. Умножаем базу на коэффициент логистики склада.</p>
          <p data-logistics-example={example.logistics} className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-lg tabular-nums sm:text-xl">
            {formatCurrency(example.baseLogistics)} × {formatCoefficient(example.coefficient)} = <strong>{formatCurrency(example.logistics, 2)}</strong>
          </p>
          <p className="text-sm leading-relaxed text-white/60">Это учебный пример по модели и данным репозитория. Он не включает хранение, приёмку, доставку до WB, возвраты и индивидуальные надбавки. Для специальных складов проверьте допустимость товара и применимый тариф в кабинете; окончательное начисление может отличаться.</p>
        </section>
        <section aria-labelledby="geo-presets" className="space-y-4">
          <h2 id="geo-presets" className="text-xl md:text-2xl">Участие в гео-пресетах калькулятора</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/70">Вес — доля коэффициента в расчётной модели географии продаж. Он не подтверждает фактическую долю заказов или запасов на складе. Для группы расчёт отдельно выбирает минимальные коэффициенты логистики и хранения: вес принадлежит всей группе.</p>
          {presets.length === 0 ? <p className="text-sm text-white/70">Этот склад не участвует в текущих гео-пресетах калькулятора.</p> : (
            <div className="rounded-xl border border-white/10 bg-[#0B141C]/75">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <caption className="sr-only">Гео-пресеты и веса склада {warehouse.label}</caption>
                <thead className="border-b border-white/15 text-white/70"><tr>
                  <th scope="col" className="w-[31%] px-2 py-3 text-left sm:px-4">География</th>
                  <th scope="col" className="w-[16%] px-1 py-3 text-right sm:px-4">Вес</th>
                  <th scope="col" className="px-2 py-3 text-left sm:px-4">Применение</th>
                </tr></thead>
                <tbody className="divide-y divide-white/10">{presets.map((preset) => (
                  <tr key={preset.presetId} data-preset-id={preset.presetId}>
                    <th scope="row" className="break-words px-2 py-3 text-left font-normal sm:px-4">{preset.label}</th>
                    <td className="px-1 py-3 text-right tabular-nums sm:px-4">{formatWeight(preset.weight)}</td>
                    <td className="break-words px-2 py-3 text-white/70 sm:px-4">{preset.groupLabel
                      ? <>Группа «{preset.groupLabel}». Логистика: {preset.logisticsSelected ? 'выбран минимум этого склада' : 'используется минимум другого склада'}. Хранение: {preset.storageSelected ? 'выбран минимум этого склада' : 'используется минимум другого склада'}.</>
                      : 'Коэффициенты этого склада учитываются напрямую.'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <CoefficientGuide />
        <section aria-labelledby="other-warehouses" className="space-y-4">
          <h2 id="other-warehouses" className="text-xl md:text-2xl">Другие склады Wildberries</h2>
          <ul className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{others.map(([other, { label }]) => (
            <li key={other} className="min-w-0 break-words"><a href={warehousePath + '/' + other} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{label}</a></li>
          ))}</ul>
        </section>
      </div>
    </ContentPage>
  );
}
