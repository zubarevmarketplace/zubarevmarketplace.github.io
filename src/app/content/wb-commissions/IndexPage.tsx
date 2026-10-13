import { useEffect, useMemo, useState } from 'react';
import ContentPage from '../../components/content/ContentPage';
import TariffDateNote from '../../components/tools/TariffDateNote';
import { Input } from '../../components/ui/input';
import type { ContentPageDefinition } from '../registry';
import { commissionCategories, commissionPath } from './pages';
import { formatRange, formatRate, normalizeQuery, searchSubjects, type SubjectSearchRow } from './calc';

let searchIndex: Promise<SubjectSearchRow[]> | undefined;
function loadSearchIndex(): Promise<SubjectSearchRow[]> {
  return searchIndex ??= import('../../../calculator/data/commissionSubjects.json')
    .then((module) => module.default as SubjectSearchRow[])
    .catch((error: unknown) => { searchIndex = undefined; throw error; });
}

export default function IndexPage({ page }: { page: ContentPageDefinition }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SubjectSearchRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const hasQuery = normalizeQuery(query).length > 0;
  useEffect(() => {
    if (!hasQuery || index) return;
    let active = true;
    setFailed(false);
    void loadSearchIndex().then((rows) => { if (active) setIndex(rows); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [hasQuery, index, attempt]);
  const results = useMemo(() => searchSubjects(index ?? [], query), [index, query]);

  return (
    <ContentPage page={page}>
      <div className="space-y-8">
        <section aria-labelledby="subject-search-heading" className="space-y-4">
          <h2 id="subject-search-heading" className="text-xl md:text-2xl">Найти комиссию по предмету</h2>
          <div className="max-w-xl space-y-2">
            <label htmlFor="subject-search" className="block text-sm text-white/70">Поиск по всем предметам Wildberries</label>
            <Input id="subject-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Например, шампуни или чайники" className="h-11 border-white/20 bg-[#0B141C] text-white placeholder:text-white/40" />
          </div>
          {hasQuery && (
            <div className="space-y-3">
              <p role="status" className="text-sm text-white/70">
                {failed ? 'Не удалось загрузить поиск. Можно открыть категорию в таблице ниже.'
                  : !index ? 'Загружаем список предметов…' : `Найдено предметов: ${results.length}`}
              </p>
              {failed && <button type="button" onClick={() => setAttempt((value) => value + 1)} className="rounded text-sm text-cyan-300 underline focus-visible:outline-2 focus-visible:outline-cyan-400">Повторить загрузку</button>}
              {index && (results.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#0B141C]/75">
                  <table className="w-full table-fixed text-xs sm:text-sm">
                    <caption className="sr-only">Результаты поиска комиссий по предметам</caption>
                    <thead className="border-b border-white/15 text-white/70"><tr>
                      <th scope="col" className="w-[38%] px-2 py-3 text-left sm:px-4">Предмет</th>
                      <th scope="col" className="w-[32%] px-2 py-3 text-left sm:px-4">Категория</th>
                      <th scope="col" className="px-2 py-3 text-right sm:px-4">FBO, %</th>
                      <th scope="col" className="px-2 py-3 text-right sm:px-4">FBS, %</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/10">{results.map(([subject, categoryIndex, fbo, fbs], rowIndex) => {
                      const category = commissionCategories[categoryIndex];
                      return <tr key={rowIndex}>
                        <th scope="row" className="break-words px-2 py-3 text-left font-normal sm:px-4">{subject}</th>
                        <td className="break-words px-2 py-3 sm:px-4"><a href={commissionPath + '/' + category.slug} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{category.category}</a></td>
                        <td className="px-2 py-3 text-right tabular-nums sm:px-4">{formatRate(fbo)}</td>
                        <td className="px-2 py-3 text-right tabular-nums sm:px-4">{formatRate(fbs)}</td>
                      </tr>;
                    })}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-white/60">Предмет не найден. Попробуйте часть названия.</p>)}
            </div>
          )}
        </section>
        <section aria-labelledby="categories-heading" className="space-y-4">
          <h2 id="categories-heading" className="text-xl md:text-2xl">Комиссии по категориям</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/70">Диапазон показывает минимальную и максимальную ставку по предметам категории. Откройте категорию, чтобы найти точную комиссию для своего товара.</p>
          <div className="rounded-xl border border-white/10 bg-[#0B141C]/75">
            <table className="w-full table-fixed text-xs sm:text-sm">
              <caption className="sr-only">Категории Wildberries: диапазоны комиссий FBO и FBS и число предметов</caption>
              <thead className="border-b border-white/15 text-white/70"><tr>
                <th scope="col" className="w-[38%] px-2 py-3 text-left sm:w-[52%] sm:px-4">Категория</th>
                <th scope="col" className="px-2 py-3 text-right sm:px-4">FBO, %</th>
                <th scope="col" className="px-2 py-3 text-right sm:px-4">FBS, %</th>
                <th scope="col" className="px-2 py-3 text-right text-[10px] sm:px-4 sm:text-sm">Предметов</th>
              </tr></thead>
              <tbody className="divide-y divide-white/10">{commissionCategories.map((category) => (
                <tr key={category.slug} data-category-slug={category.slug} className="hover:bg-white/[0.03]">
                  <th scope="row" className="break-words px-2 py-3 text-left font-normal sm:px-4"><a href={commissionPath + '/' + category.slug} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{category.category}</a></th>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">{formatRange(category.fbo).slice(0, -1)}</td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-4">{formatRange(category.fbs).slice(0, -1)}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-white/70 sm:px-4">{category.count}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <TariffDateNote />
      </div>
    </ContentPage>
  );
}
