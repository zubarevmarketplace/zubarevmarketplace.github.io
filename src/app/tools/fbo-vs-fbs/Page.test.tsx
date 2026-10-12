import { describe, expect, it } from 'vitest';
import { render } from '../../../entry-server';
import { tools } from '../registry';
import { resolveRoute } from '../routes';
import { generateSitemap } from '../sitemap';
import { compareSchemes } from './calc';
import { defaultInput, defaultMonthlySales } from './defaults';
import { formatCurrency } from '../../lib/formatters';

describe('страница FBO или FBS', () => {
  it('сразу показывает сравнение, таблицы, собственные метатеги и четыре FAQ', async () => {
    const { html, head } = await render('/tools/fbo-vs-fbs');
    const tool = tools.find((entry) => entry.slug === 'fbo-vs-fbs')!;
    const result = compareSchemes(defaultInput, defaultMonthlySales);
    for (const text of ['Сравнение FBO и FBS', 'Прибыль на единицу', 'Прибыль в месяц',
      'Разница по статьям расходов', 'При каких продажах в месяц схемы равны',
      'Точки равенства нет', 'Как считается', 'Тарифы актуальны на',
      'Обработка заказа FBS', 'Упаковка', 'Доставка до WB', 'География продаж', 'ДРР',
      'Хранение FBO', 'Перебраны все 100 объёмов']) expect(html).toContain(text);
    expect(html).toContain(`При 100 продажах в месяц ${result.winner.toUpperCase()} выгоднее на ${formatCurrency(Math.abs(result.diffPerMonth))} в месяц.`);
    expect(html).toContain(formatCurrency(result.fbo.profit));
    expect(html).toContain(formatCurrency(result.fbs.profit));
    expect(html).not.toContain('role="alert"');
    expect(head).toContain('<title>' + tool.title + '</title>');
    expect(head).toContain('name="description" content="' + tool.description + '"');
    expect(head).toContain('rel="canonical" href="https://zubarevlab.ru/tools/fbo-vs-fbs"');
    expect(head).toContain('property="og:url" content="https://zubarevlab.ru/tools/fbo-vs-fbs"');
    expect(head).toContain('property="og:title" content="' + tool.title + '"');
    expect(head).toContain('property="og:description" content="' + tool.description + '"');
    const json = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity).toHaveLength(4);
    for (const faq of tool.faq) {
      expect(html).toContain(faq.question);
      expect(json.mainEntity).toContainEqual({ '@type': 'Question', name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer } });
    }
    expect(tool.related).toEqual(['wb-calculator', 'break-even', 'price-for-margin']);
    for (const slug of tool.related) expect(html).toContain('href="/tools/' + slug + '"');
    expect(html).toContain('href="/#formats"');
    expect(resolveRoute('/tools/fbo-vs-fbs/')).toEqual({ kind: 'tool', tool });
    expect(generateSitemap(tools)).toContain('<loc>https://zubarevlab.ru/tools/fbo-vs-fbs</loc>');
  });
});
