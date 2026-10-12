// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { render } from './entry-server';
import { tools } from './app/tools/registry';

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
});
