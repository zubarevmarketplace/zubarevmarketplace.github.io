import ContentPage from '../../components/content/ContentPage';
import { contentPages, type ContentPageDefinition } from '../registry';
import { resolveContentLink } from '../links';

export const referenceSections = [
  { path: '/reference/wb-commissions', label: 'Комиссии WB' },
  { path: '/reference/wb-warehouses', label: 'Склады WB' },
  { path: '/reference/glossary', label: 'Словарь продавца' },
  { path: '/reference/card-limits', label: 'Лимиты полей карточки' },
  { path: '/reference/checklists', label: 'Чек-листы' },
  { path: '/templates', label: 'Шаблоны' },
];

export default function ReferenceIndexPage({ page }: { page: ContentPageDefinition }) {
  const sections = referenceSections.flatMap((section) => {
    const link = resolveContentLink(section.path, contentPages, []);
    return link ? [{ ...link, label: section.label }] : [];
  });

  return (
    <ContentPage page={page}>
      {sections.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.path} className="min-w-0">
              <a href={section.path} className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B141C]/75 p-5 transition-colors hover:border-cyan-400/40 focus-visible:outline-2 focus-visible:outline-cyan-400 md:p-6">
                <h2 className="text-xl leading-snug">{section.label}</h2>
                <p className="flex-1 text-sm leading-relaxed text-white/70">{section.description}</p>
                <span className="text-sm text-cyan-300 group-hover:text-cyan-200">Открыть раздел</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-2xl rounded-2xl border border-white/10 bg-[#0B141C]/75 p-5 text-sm leading-relaxed text-white/70">
          Справочные материалы готовятся к публикации. Пока можно воспользоваться бесплатными калькуляторами ниже.
        </p>
      )}
    </ContentPage>
  );
}
