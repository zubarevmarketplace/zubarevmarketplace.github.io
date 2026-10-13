import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { contentPages } from '../../content/registry';
import ReferenceIndexPage, { referenceSections } from '../../content/reference/ReferenceIndexPage';
import ContentPage from './ContentPage';

const reference = contentPages.find((page) => page.path === '/reference')!;

describe('шаблон контентной страницы', () => {
  it('рендерит крошки, H1, введение, содержимое, дату, ссылки и CTA без DOM', () => {
    const page = { ...reference, related: ['/reference/future', 'drr', '/tools/drr', '/reference'] };
    const html = renderToStaticMarkup(<ContentPage page={page}><p>Произвольное содержимое</p></ContentPage>);
    const article = html.slice(html.indexOf('<article'));
    const markers = ['Хлебные крошки', page.h1, page.description, 'Произвольное содержимое', 'Обновлено:', 'Смотрите также', 'Посмотреть форматы разбора'];
    const positions = markers.map((marker) => article.indexOf(marker));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(article).toContain('<time dateTime="2026-10-13">');
    expect(article).toContain('href="/"');
    expect(article).toMatch(/<span aria-current="page"[^>]*>Справочники<\/span>/);
    expect(article.match(/href="\/tools\/drr"/g)).toHaveLength(1);
    expect(article).not.toContain('/reference/future');
    expect(article).toContain('href="/#formats"');
  });

  it('не выводит пустой блок Смотрите также', () => {
    const html = renderToStaticMarkup(<ContentPage page={{ ...reference, related: ['missing'] }}>Содержимое</ContentPage>);
    expect(html).not.toContain('Смотрите также');
  });
});

describe('хаб справочников', () => {
  it('скрывает карточки ещё не опубликованных разделов', () => {
    // Isolate an empty catalog; the real registry can already contain sections.
    const originalPages = contentPages.splice(0, contentPages.length, reference);
    try {
      const html = renderToStaticMarkup(<ReferenceIndexPage page={reference} />);
      for (const section of referenceSections) expect(html).not.toContain('href="' + section.path + '"');
      expect(html).toContain('Справочные материалы готовятся к публикации.');
      expect(html).toContain('href="/tools/wb-calculator"');
    } finally {
      contentPages.splice(0, contentPages.length, ...originalPages);
    }
  });

  it('автоматически показывает карточку опубликованного раздела', () => {
    const section = referenceSections[0];
    const addedPage = { ...reference, path: section.path, h1: section.label, description: 'Описание опубликованного раздела' };
    const originalPages = contentPages.splice(0, contentPages.length, reference, addedPage);
    try {
      const html = renderToStaticMarkup(<ReferenceIndexPage page={reference} />);
      expect(html).toContain('href="' + section.path + '"');
      expect(html).toContain(section.label);
      expect(html).toContain(addedPage.description);
      expect(html).not.toContain('Справочные материалы готовятся к публикации.');
    } finally {
      contentPages.splice(0, contentPages.length, ...originalPages);
    }
  });
});
