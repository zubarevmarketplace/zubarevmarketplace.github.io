import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { tools } from '../../tools/registry';
import ToolsIndexPage from '../../pages/ToolsIndexPage';
import ToolPage from './ToolPage';
import StructuredData from './StructuredData';

function readJsonLd(html: string): Record<string, unknown> {
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  expect(json).toBeDefined();
  return JSON.parse(json!);
}

describe('шаблон инструмента', () => {
  it('рендерится без браузера и показывает все блоки в порядке стандарта', () => {
    const tool = { ...tools[0], slug: 'sample', related: ['wb-calculator'] };
    const html = renderToStaticMarkup(
      <ToolPage tool={tool} howItWorks={<p>Формула расчёта</p>}>
        <div>Результат инструмента</div>
      </ToolPage>,
    );
    const markers = [tool.h1, 'Результат инструмента', 'Как считается', 'Частые вопросы', 'Дата актуальности тарифов', 'Смежные инструменты', 'Посмотреть форматы разбора'];
    const positions = markers.map((marker) => html.indexOf(marker, html.indexOf('<article')));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html.toLowerCase()).toContain('datetime="' + tool.updatedAt + '"');
    expect(html).toContain('href="/tools/wb-calculator"');
    expect(readJsonLd(html)).toEqual({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: tool.faq.map(({ question, answer }) => ({
        '@type': 'Question', name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  });
  it('JSON-LD безопасно сохраняет текст с закрывающим тегом script', () => {
    const data = { text: '</script><script>test</script>' };
    const html = renderToStaticMarkup(<StructuredData data={data} />);
    expect(readJsonLd(html)).toEqual(data);
    expect(html.match(/<script/g)).toHaveLength(1);
  });
});

describe('список инструментов', () => {
  it('карточки и ItemList получают данные из реестра при статическом рендере', () => {
    const html = renderToStaticMarkup(<ToolsIndexPage />);
    const data = readJsonLd(html);
    expect(data['@type']).toBe('ItemList');
    expect(data.itemListElement).toEqual(tools.map((tool, index) => ({
      '@type': 'ListItem', position: index + 1, name: tool.h1,
      url: 'https://zubarevlab.ru/tools/' + tool.slug,
    })));
    for (const tool of tools) {
      expect(html).toContain(tool.shortDescription);
      expect(html).toContain('href="/tools/' + tool.slug + '"');
    }
  });
});
