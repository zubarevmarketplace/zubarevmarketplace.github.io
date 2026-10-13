import { warehouseTariffs } from '../../../calculator/config/warehouseTariffs';
import ContentPage from '../../components/content/ContentPage';
import type { ContentPageDefinition } from '../registry';
import { warehousePath } from './pages';
import { formatCoefficient } from './calc';
import CoefficientGuide from './CoefficientGuide';

export default function IndexPage({ page }: { page: ContentPageDefinition }) {
  return (
    <ContentPage page={page}>
      <div className="space-y-8">
        <section aria-labelledby="warehouses-heading" className="space-y-4">
          <h2 id="warehouses-heading" className="text-xl md:text-2xl">Коэффициенты складов для коробов</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/70">Все значения приведены как множители, а не проценты. Выберите склад для подробного примера расчёта.</p>
          <div className="rounded-xl border border-white/10 bg-[#0B141C]/75">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <caption className="sr-only">Склады Wildberries: коэффициенты логистики, хранения и FBS для коробов</caption>
              <thead className="border-b border-white/15 text-white/70"><tr>
                <th scope="col" className="w-[40%] px-2 py-3 text-left sm:w-[52%] sm:px-4">Склад</th>
                <th scope="col" className="break-words px-1 py-3 text-right sm:px-4">Логистика</th>
                <th scope="col" className="break-words px-1 py-3 text-right sm:px-4">Хранение</th>
                <th scope="col" className="px-1 py-3 text-right sm:px-4">FBS</th>
              </tr></thead>
              <tbody className="divide-y divide-white/10">{Object.entries(warehouseTariffs).map(([slug, warehouse]) => (
                <tr key={slug} data-warehouse-slug={slug} className="hover:bg-white/[0.03]">
                  <th scope="row" className="break-words px-2 py-3 text-left font-normal sm:px-4"><a href={warehousePath + '/' + slug} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{warehouse.label}</a></th>
                  <td className="px-1 py-3 text-right tabular-nums sm:px-4">{formatCoefficient(warehouse.logistics)}</td>
                  <td className="px-1 py-3 text-right tabular-nums sm:px-4">{formatCoefficient(warehouse.storage)}</td>
                  <td className="break-words px-1 py-3 text-right tabular-nums sm:px-4">{warehouse.fbs === null ? 'FBS недоступен' : formatCoefficient(warehouse.fbs)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <CoefficientGuide />
      </div>
    </ContentPage>
  );
}
