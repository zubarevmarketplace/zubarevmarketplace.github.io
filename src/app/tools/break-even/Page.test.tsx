import { describe, expect, it } from 'vitest';
import { render } from '../../../entry-server';
import { tools } from '../registry';
import { resolveRoute } from '../routes';
import { generateSitemap } from '../sitemap';

describe('страница безубытка', () => {
  it('сразу рендерит расчёт, свои метатеги, четыре FAQ и дату тарифов', async () => {
    const { html, head } = await render('/tools/break-even');
    const tool = tools.find((entry) => entry.slug === 'break-even')!;
    for (const text of ['Точка безубыточности — цена для покупателя', 'Запас до безубытка',
      'Прибыль при текущей цене', 'Прибыль при цене акции', 'Итог за месяц без акции', 'Итог за месяц с акцией',
      'Шкала цены', 'Безубыток:', 'Цена акции:', 'Как считается', 'Тарифы актуальны на']) expect(html).toContain(text);
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('недостижим');
    expect(head).toContain('<title>' + tool.title + '</title>');
    expect(head).toContain('name="description" content="' + tool.description + '"');
    expect(head).toContain('rel="canonical" href="https://zubarevlab.ru/tools/break-even"');
    expect(head).toContain('property="og:url" content="https://zubarevlab.ru/tools/break-even"');
    expect(head).toContain('property="og:title" content="' + tool.title + '"');
    const json = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity).toHaveLength(4);
    for (const faq of tool.faq) {
      expect(html).toContain(faq.question);
      expect(json.mainEntity).toContainEqual({ '@type': 'Question', name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer } });
    }
    expect(html).toContain('href="/tools/price-for-margin"');
    expect(html).toContain('href="/tools/wb-calculator"');
    expect(html).not.toContain('href="/tools/drr"');
    expect(html).not.toContain('href="/tools/fbo-vs-fbs"');
    expect(html).toContain('href="/#formats"');
    expect(resolveRoute('/tools/break-even/')).toEqual({ kind: 'tool', tool });
    expect(generateSitemap(tools)).toContain('<loc>https://zubarevlab.ru/tools/break-even</loc>');
    expect(tool.related).toEqual(['wb-calculator', 'price-for-margin', 'drr', 'fbo-vs-fbs']);
  });
});
