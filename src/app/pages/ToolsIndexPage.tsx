import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import StructuredData from '../components/tools/StructuredData';
import { tools } from '../tools/registry';

export default function ToolsIndexPage() {
  const url = 'https://zubarevlab.ru/tools';
  return (
    <Layout currentPage="tools">
      <Seo title="Бесплатные инструменты для продавцов Wildberries и Ozon"
        description="Бесплатные онлайн-инструменты для продавцов Wildberries и Ozon. Рассчитайте юнит-экономику, прибыль и расходы товара без регистрации."
        canonical={url} ogUrl={url} ogImage="https://zubarevlab.ru/og-image.jpg" />
      <StructuredData data={{
        '@context': 'https://schema.org', '@type': 'ItemList',
        itemListElement: tools.map((tool, index) => ({
          '@type': 'ListItem', position: index + 1, name: tool.h1,
          url: 'https://zubarevlab.ru/tools/' + tool.slug,
        })),
      }} />
      <section className="relative mx-auto max-w-[1240px] space-y-8 px-4 py-10 md:px-8 md:py-16">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl leading-tight tracking-tight md:text-4xl">Бесплатные инструменты для продавцов Wildberries и Ozon</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">Проверьте экономику товара перед закупкой или поставкой. Все расчёты выполняются в браузере, без регистрации и ввода контактов.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug} className="min-w-0">
              <a href={'/tools/' + tool.slug} className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B141C]/75 p-5 transition-colors hover:border-cyan-400/40 focus-visible:outline-2 focus-visible:outline-cyan-400 md:p-6">
                <h2 className="text-xl leading-snug">{tool.h1}</h2>
                <p className="flex-1 text-sm leading-relaxed text-white/70">{tool.shortDescription}</p>
                <span className="text-sm text-cyan-300 group-hover:text-cyan-200">Открыть инструмент</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
