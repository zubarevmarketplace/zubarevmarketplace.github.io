import { useMemo, useState } from 'react';
import ContentPage from '../../components/content/ContentPage';
import TariffDateNote from '../../components/tools/TariffDateNote';
import { Input } from '../../components/ui/input';
import type { CommissionTariff } from '../../config/tariffRegistry';
import type { ContentPageDefinition } from '../registry';
import {
  commissionDifference, filterAndSortSubjects, formatRange, formatRate,
  type CommissionCategory, type SortColumn, type SortDirection,
} from './calc';

const columns: { key: SortColumn; label: string }[] = [
  { key: 'subject', label: 'Предмет' },
  { key: 'fboCommissionRate', label: 'FBO, %' },
  { key: 'fbsCommissionRate', label: 'FBS, %' },
  { key: 'difference', label: 'Разница, п.п.' },
];

export default function CategoryPage({ page, category, subjects }: {
  page: ContentPageDefinition; category: CommissionCategory; subjects: CommissionTariff[];
}) {
  const [query, setQuery] = useState('');
  const [column, setColumn] = useState<SortColumn>('subject');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const rows = useMemo(() => filterAndSortSubjects(subjects, query, column, direction), [subjects, query, column, direction]);
  function sort(next: SortColumn) {
    setDirection(next === column && direction === 'asc' ? 'desc' : 'asc');
    setColumn(next);
  }

  return (
    <ContentPage page={page}>
      <div className="space-y-6">
        <p className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
          В категории «{category.category}» комиссия FBO составляет {formatRange(category.fbo)},
          {' '}средняя ставка — {formatRate(category.fbo.average)}%. Для FBS диапазон — {formatRange(category.fbs)},
          {' '}средняя ставка — {formatRate(category.fbs.average)}%. Средние рассчитаны по {category.count} предметам без учёта объёма продаж.
        </p>
        <div className="max-w-xl space-y-2">
          <label htmlFor="subject-filter" className="block text-sm">Найти предмет в категории</label>
          <Input id="subject-filter" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Введите название предмета" className="h-11 border-white/20 bg-[#0B141C] text-white placeholder:text-white/40" />
        </div>
        <p role="status" className="text-sm text-white/60">Показано предметов: {rows.length} из {category.count}</p>
        <div className="rounded-xl border border-white/10 bg-[#0B141C]/75">
          <table className="w-full table-fixed text-xs sm:text-sm">
            <caption className="sr-only">Ставки комиссий Wildberries по предметам категории «{category.category}»</caption>
            <thead className="border-b border-white/15 text-white/80">
              <tr>{columns.map((entry, index) => (
                <th key={entry.key} scope="col" aria-sort={column === entry.key ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={`px-2 py-3 font-medium sm:px-4 ${index === 0 ? 'w-[43%] text-left sm:w-[55%]' : 'text-right'}`}>
                  <button type="button" onClick={() => sort(entry.key)} className={`w-full break-words rounded py-1 text-xs hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-400 sm:text-sm ${index === 0 ? 'text-left' : 'text-right'}`}
                    aria-label={`Сортировать по столбцу «${entry.label}»`}>
                    {entry.key === 'difference' ? <>Разница <span className="block sm:inline">п.п.</span></> : entry.label}
                    {column === entry.key && <span aria-hidden="true">{direction === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </button>
                </th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((row) => (
                <tr key={row.id} data-subject-id={row.id} className="hover:bg-white/[0.03]">
                  <th scope="row" className="break-words px-2 py-3 text-left font-normal text-white/90 sm:px-4">{row.subject}</th>
                  <td className="px-2 py-3 text-right tabular-nums text-cyan-200 sm:px-4">{formatRate(row.fboCommissionRate)}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-cyan-200 sm:px-4">{formatRate(row.fbsCommissionRate)}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-white/70 sm:px-4">{commissionDifference(row) > 0 ? '+' : ''}{formatRate(commissionDifference(row))}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="p-5 text-white/70">Предмет не найден. Попробуйте часть названия или очистите фильтр.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-white/60">
          FBO — продажа со склада Wildberries, FBS — со склада продавца. Разница — ставка FBS минус ставка FBO в процентных пунктах.
          {' '}Комиссия — часть расходов: логистика, хранение, налоги и реклама учитываются отдельно.
        </p>
        <TariffDateNote />
        <a href="/calculator" className="inline-flex max-w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm text-cyan-200 hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-cyan-400">
          Рассчитать прибыль для этой категории
        </a>
      </div>
    </ContentPage>
  );
}
