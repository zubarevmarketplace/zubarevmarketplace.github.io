import { describe, expect, it } from 'vitest';
import { tools } from './registry';
import { generateSitemap } from './sitemap';
import { contentPages } from '../content/registry';

describe('sitemap', () => {
  it('содержит все основные адреса и все инструменты ровно один раз', () => {
    const xml = generateSitemap(tools);
    const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(locations).toEqual([
      'https://zubarevlab.ru/',
      'https://zubarevlab.ru/calculator',
      'https://zubarevlab.ru/tools',
      ...tools.map((tool) => 'https://zubarevlab.ru/tools/' + tool.slug),
      ...contentPages.map((page) => 'https://zubarevlab.ru' + page.path),
    ]);
    expect(new Set(locations).size).toBe(locations.length);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });
  it('берёт lastmod каждого инструмента из его ревизии, включая новые записи', () => {
    const entries = [
      { slug: 'wb-calculator', updatedAt: '2026-10-13' },
      { slug: 'new-tool', updatedAt: '2026-10-14' },
    ];
    const xml = generateSitemap(entries);
    expect(xml).toContain('<loc>https://zubarevlab.ru/tools/wb-calculator</loc>\n    <lastmod>2026-10-13</lastmod>');
    expect(xml).toContain('<loc>https://zubarevlab.ru/tools/new-tool</loc>\n    <lastmod>2026-10-14</lastmod>');
    expect(xml).toContain('<loc>https://zubarevlab.ru/calculator</loc>\n    <lastmod>2026-10-13</lastmod>');
    expect(xml).toContain('<loc>https://zubarevlab.ru/tools</loc>\n    <lastmod>2026-10-14</lastmod>');
  });
  it('экранирует XML и убирает завершающий слеш домена', () => {
    const xml = generateSitemap([{ slug: 'a&b', updatedAt: '2026-10-13' }], 'https://example.com/');
    expect(xml).toContain('<loc>https://example.com/tools/a&amp;b</loc>');
    expect(xml).not.toContain('example.com//');
  });
  it('содержит справочники и произвольные контентные пути с собственным lastmod', () => {
    const xml = generateSitemap(tools);
    expect(xml).toContain('<loc>https://zubarevlab.ru/reference</loc>\n    <lastmod>2026-10-13</lastmod>');
    const addedPage = { path: '/templates/example', updatedAt: '2026-10-15' };
    expect(generateSitemap(tools, 'https://example.com', [addedPage]))
      .toContain('<loc>https://example.com/templates/example</loc>\n    <lastmod>2026-10-15</lastmod>');
  });
  it('пустой реестр сохраняет основные страницы без фиктивных дат', () => {
    const xml = generateSitemap([], 'https://zubarevlab.ru', []);
    expect([...xml.matchAll(/<loc>/g)]).toHaveLength(3);
    expect(xml).not.toContain('<lastmod>');
  });
});
