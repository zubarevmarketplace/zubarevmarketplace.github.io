import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { toolsMetadata } from '../seo/metadata';
import { tools } from '../tools/registry';

export default function ToolsIndexPage() {
  return (
    <Layout currentPage="tools">
      <Seo {...toolsMetadata} ogUrl={toolsMetadata.canonical} />
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
