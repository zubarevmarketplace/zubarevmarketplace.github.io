// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { render, getPrerenderPaths, renderSitemap } from './entry-server';
import { tools } from './app/tools/registry';
import { contentPages } from './app/content/registry';
import ContentPage from './app/components/content/ContentPage';

describe('static route rendering without DOM', () => {
  it('renders the tools index H1 and metadata with ItemList in head', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const { html, head } = await render('/tools');
    expect(html).toMatch(/<h1\b[^>]*>Бесплатные инструменты для продавцов Wildberries и Ozon<\/h1>/);
    expect(head).toContain('<title>Бесплатные инструменты для продавцов Wildberries и Ozon</title>');
    expect(head).toContain('<link rel="canonical" href="https://zubarevlab.ru/tools"');
    expect(head).toContain('"@type":"ItemList"');
    expect(head).not.toContain('"@type":"Person"');
  });

  it.each(['/calculator', '/calculator/', '/tools/wb-calculator'])('renders the calculator at %s', async (url) => {
    const { html, head } = await render(url);
    expect(html).toMatch(/<h1\b[^>]*>\s*Калькулятор юнит-экономики WB\s*<\/h1>/);
    expect(html).toContain('value="2500"');
    expect(head).toContain('<title>' + tools[0].title + '</title>');
    expect(head).toContain('<meta name="description" content="' + tools[0].description + '"');
    expect(head).toContain('<link rel="canonical" href="https://zubarevlab.ru/calculator"');
    expect(head).toContain('"@type":"FAQPage"');
    expect(html).not.toContain('The server did not finish this Suspense boundary');
  });

  it('renders the landing hero and its own metadata', async () => {
    const { html, head } = await render('/');
    expect(html).toContain('Нахожу слабые места');
    expect(html).toContain('модель роста');
    expect(head).toContain('<link rel="canonical" href="https://zubarevlab.ru/"');
    expect(head).toContain('"@type":"Person"');
  });

  it('renders an unknown route without requiring browser globals', async () => {
    expect((await render('/missing')).html).toContain('Страница не найдена');
  });

  it('renders the reference page with its own metadata and BreadcrumbList in head', async () => {
    const page = contentPages.find((entry) => entry.path === '/reference')!;
    const { html, head } = await render('/reference');
    expect(html).toMatch(/<h1\b[^>]*>Справочники для продавцов Wildberries и Ozon<\/h1>/);
    expect(head).toContain('<title>' + page.title + '</title>');
    expect(head).toContain('<meta name="description" content="' + page.description + '"');
    expect(head).toContain('<link rel="canonical" href="https://zubarevlab.ru/reference"');
    expect(head).toContain('<meta property="og:url" content="https://zubarevlab.ru/reference"');
    const json = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(JSON.parse(json!)).toEqual({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map(({ label, path }, index) => ({
        '@type': 'ListItem', position: index + 1, name: label, item: 'https://zubarevlab.ru' + path,
      })),
    });
    expect(head).not.toContain('"@type":"Person"');
    expect(html).toContain('href="/reference" aria-current="page"');
    expect((await render('/reference/')).head).toBe(head);
  });

  it('build paths and sitemap include both registries', () => {
    const paths = getPrerenderPaths();
    expect(paths).toEqual([
      '/', '/calculator', '/tools',
      ...tools.map((tool) => '/tools/' + tool.slug),
      ...contentPages.map((page) => page.path),
    ]);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) expect(renderSitemap()).toContain('<loc>https://zubarevlab.ru' + path + '</loc>');
  });

  it('passes the definition and arbitrary data to a shared component at new content paths', async () => {
    const paths = ['/reference/glossary/example', '/templates/example'];
    const addedPages = paths.map((path, index) => ({
      ...contentPages[0], path,
      title: 'Пример справочника ' + index,
      h1: 'Пример справочника ' + index,
      data: { message: 'Данные страницы ' + index },
      breadcrumbs: [{ label: 'Главная', path: '/' }, { label: 'Пример', path }],
      load: async () => ({
        default: ({ page }: { page: (typeof contentPages)[number] }) => (
          <ContentPage page={page}>{(page.data as { message: string }).message}</ContentPage>
        ),
      }),
    }));
    contentPages.push(...addedPages);
    try {
      for (const page of addedPages) {
        const { html, head } = await render(page.path);
        expect(html).toContain(page.data.message);
        expect(head).toContain('<title>' + page.title + '</title>');
        expect(head).toContain('"@type":"BreadcrumbList"');
        expect(getPrerenderPaths()).toContain(page.path);
        expect(renderSitemap()).toContain('<loc>https://zubarevlab.ru' + page.path + '</loc>');
      }
    } finally {
      contentPages.splice(-addedPages.length);
    }
  });
});
