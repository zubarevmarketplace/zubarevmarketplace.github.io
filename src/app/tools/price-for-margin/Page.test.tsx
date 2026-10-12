import { describe, expect, it } from 'vitest';
import { render } from '../../../entry-server';
import { resolveRoute } from '../routes';
import { tools, plannedToolSlugs } from '../registry';

describe('страница цены под маржу', () => {
  it('рендерит результат, SEO и FAQ до выполнения браузерного JavaScript', async () => {
    const { html, head } = await render('/tools/price-for-margin');
    expect(html).toContain('<h1');
    expect(html).toContain('Цена под маржу: какую цену ставить на Wildberries');
    expect(html).toContain('Рекомендуемая цена для покупателя');
    expect(html).toContain('Цена до СПП');
    expect(html).toContain('Если поставить цену на 10% ниже');
    expect(html).toContain('Расходы с единицы');
    expect(html).toContain('Тарифы актуальны на');
    expect(html).not.toContain('недостижима');
    expect(html).not.toContain('role="alert"');
    expect(head).toContain('<title>Калькулятор цены под маржу для Wildberries');
    expect(head).toContain('name="description"');
    expect(head).toContain('rel="canonical" href="https://zubarevlab.ru/tools/price-for-margin"');
    expect(head).toContain('property="og:url" content="https://zubarevlab.ru/tools/price-for-margin"');
    const json = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity).toHaveLength(4);
    expect(resolveRoute('/tools/price-for-margin').kind).toBe('tool');
  });

  it('сохраняет будущие related без публикации неработающих маршрутов', () => {
    expect(tools.find((tool) => tool.slug === 'price-for-margin')!.related).toEqual(['wb-calculator', 'break-even', 'drr']);
    for (const slug of plannedToolSlugs) {
      if (!tools.some((tool) => tool.slug === slug)) expect(resolveRoute('/tools/' + slug).kind).toBe('not-found');
    }
  });
});
