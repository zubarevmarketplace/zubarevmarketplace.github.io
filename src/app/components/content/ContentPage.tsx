import type { ReactNode } from 'react';
import Layout from '../layout/Layout';
import Seo from '../Seo';
import type { ContentPageDefinition } from '../../content/registry';
import { resolveContentLink, type ContentLink } from '../../content/links';
import { getContentMetadata } from '../../seo/metadata';

export type ContentPageProps = { page: ContentPageDefinition; children: ReactNode };

export default function ContentPage({ page, children }: ContentPageProps) {
  const metadata = getContentMetadata(page);
  const related = (page.related ?? [])
    .map((path) => resolveContentLink(path))
    .filter((link): link is ContentLink => link !== undefined && link.path !== page.path)
    .filter((link, index, links) => links.findIndex((entry) => entry.path === link.path) === index);
  const updatedAt = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(page.updatedAt));

  return (
    <Layout currentPage="reference">
      <Seo {...metadata} ogUrl={metadata.canonical} />
      <article className="relative mx-auto max-w-[1240px] space-y-8 px-4 py-10 md:px-8 md:py-16">
        <nav aria-label="Хлебные крошки">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-white/60">
            {page.breadcrumbs.map(({ label, path }, index) => (
              <li key={path} className="flex min-w-0 items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {path === page.path
                  ? <span aria-current="page" className="break-words text-white/80">{label}</span>
                  : <a href={path} className="break-words hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">{label}</a>}
              </li>
            ))}
          </ol>
        </nav>
        <header className="max-w-3xl space-y-4">
          <h1 className="text-2xl leading-tight tracking-tight md:text-4xl">{page.h1}</h1>
          <p className="text-sm leading-relaxed text-white/70 md:text-base">{page.description}</p>
        </header>
        <div className="min-w-0">{children}</div>
        <p className="text-sm text-white/60">Обновлено: <time dateTime={page.updatedAt}>{updatedAt}</time></p>
        {related.length > 0 && (
          <section aria-labelledby="related-content" className="space-y-4">
            <h2 id="related-content" className="text-xl md:text-2xl">Смотрите также</h2>
            <ul className="flex flex-wrap gap-4">
              {related.map((link) => (
                <li key={link.path} className="min-w-0"><a href={link.path} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{link.label}</a></li>
              ))}
            </ul>
          </section>
        )}
        <aside className="flex flex-col items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-white/70">На платном разборе поможем применить справочные данные к экономике вашего товара.</p>
          <a href="/#formats" className="cta-button shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">Посмотреть форматы разбора</a>
        </aside>
      </article>
    </Layout>
  );
}
