import { describe, expect, it } from 'vitest';
import { render } from '../../../entry-server';
import { tools } from '../registry';
import { resolveRoute } from '../routes';
import { generateSitemap } from '../sitemap';
import { formatCurrency, formatPercent } from '../../lib/formatters';

describe('страница ДРР', () => {
  it('рендерит три работающих режима и результат по умолчанию без браузера', async () => {
    const { html } = await render('/tools/drr');
    for (const label of ['Допустимый ДРР', 'Бюджет по заказам', 'Заказы по бюджету', 'Показы', 'Клики', 'Заказы', 'Бюджет', 'CPO', 'ДРР', 'ROMI', 'Ожидаемые заказы в месяц', 'Как считается', 'Тарифы актуальны на']) expect(html).toContain(label);
    for (const value of [formatPercent(15), formatCurrency(375), formatCurrency(180000), formatCurrency(600), formatPercent(24), formatPercent(45.833333)]) expect(html).toContain(value);
    expect(html).toContain('выше допустимого');
    expect(html).toContain('border-red-400/30');
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('href="/calculator"');
    expect(html).toContain('узнайте свою маржу без рекламы в калькуляторе');
  });
  it('публикует SEO, FAQ, смежные ссылки и адрес в sitemap', async () => {
    const { html, head } = await render('/tools/drr');
    const tool = tools.find((entry) => entry.slug === 'drr')!;
    expect(head).toContain('<title>' + tool.title + '</title>');
    expect(head).toContain('name="description" content="' + tool.description + '"');
    expect(head).toContain('rel="canonical" href="https://zubarevlab.ru/tools/drr"');
    expect(head).toContain('property="og:url" content="https://zubarevlab.ru/tools/drr"');
    expect(head).toContain('property="og:title" content="' + tool.title + '"');
    expect(head).toContain('property="og:description" content="' + tool.description + '"');
    const json = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity).toHaveLength(4);
    for (const faq of tool.faq) {
      expect(html).toContain(faq.question);
      expect(json.mainEntity).toContainEqual({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } });
    }
    expect(tool.related).toEqual(['wb-calculator', 'price-for-margin', 'break-even']);
    for (const slug of tool.related) expect(html).toContain('href="/tools/' + slug + '"');
    const faqHtml = html.slice(html.indexOf('id="tool-faq"'), html.indexOf('id="related-tools"'));
    expect(faqHtml).toContain('href="/#formats"');
    expect(resolveRoute('/tools/drr/')).toEqual({ kind: 'tool', tool });
    expect(generateSitemap(tools)).toContain('<loc>https://zubarevlab.ru/tools/drr</loc>');
  });
});
