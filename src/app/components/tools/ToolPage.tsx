import type { ReactNode } from 'react';
import Layout from '../layout/Layout';
import Seo from '../Seo';
import { tools, type ToolDefinition } from '../../tools/registry';
import { getToolMetadata } from '../../seo/metadata';
import TariffDateNote from './TariffDateNote';

export type ToolPageProps = {
  tool: ToolDefinition;
  children: ReactNode;
  howItWorks: ReactNode;
  introduction?: ReactNode;
};

export default function ToolPage({ tool, children, howItWorks, introduction }: ToolPageProps) {
  const metadata = getToolMetadata(tool);
  const relatedTools = tool.related
    .map((slug) => tools.find((entry) => entry.slug === slug))
    .filter((entry): entry is ToolDefinition => Boolean(entry));

  return (
    <Layout currentPage="tools">
      <Seo {...metadata} ogUrl={metadata.canonical} />
      <article className="relative mx-auto max-w-[1240px] space-y-10 px-4 py-10 md:px-8 md:py-16">
        <header className="max-w-3xl space-y-4">
          <h1 className="text-2xl tracking-tight md:text-4xl">{tool.h1}</h1>
          <div className="text-sm leading-relaxed text-white/70 md:text-base">
            {introduction ?? <p>{tool.description} Измените исходные данные, чтобы оценить свой товар: результат доступен сразу, без регистрации.</p>}
          </div>
        </header>
        <div className="min-w-0">{children}</div>
        <section aria-labelledby="how-it-works" className="space-y-4">
          <h2 id="how-it-works" className="text-xl md:text-2xl">Как считается</h2>
          <div className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">{howItWorks}</div>
        </section>
        <section aria-labelledby="tool-faq" className="space-y-4">
          <h2 id="tool-faq" className="text-xl md:text-2xl">Частые вопросы</h2>
          <div className="max-w-3xl divide-y divide-white/10">
            {tool.faq.map(({ question, answer, link }) => (
              <details key={question} className="py-4">
                <summary className="cursor-pointer rounded-sm text-white/90 focus-visible:outline-2 focus-visible:outline-cyan-400">{question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{answer}{link && tools.some((entry) => entry.slug === link.slug) && <> <a href={'/tools/' + link.slug} className="text-cyan-300 underline underline-offset-4">{link.label}</a></>}</p>
              </details>
            ))}
          </div>
        </section>
        <TariffDateNote />
        {relatedTools.length > 0 && (
          <section aria-labelledby="related-tools" className="space-y-4">
            <h2 id="related-tools" className="text-xl md:text-2xl">Смежные инструменты</h2>
            <ul className="flex flex-wrap gap-4">
              {relatedTools.map((entry) => (
                <li key={entry.slug}><a href={'/tools/' + entry.slug} className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">{entry.h1}</a></li>
              ))}
            </ul>
          </section>
        )}
        <aside className="flex flex-col items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-white/70">Нужна помощь с экономикой вашего товара? Разберём расходы и возможности роста на платном разборе.</p>
          <a href="/#formats" className="cta-button shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">Посмотреть форматы разбора</a>
        </aside>
      </article>
    </Layout>
  );
}
