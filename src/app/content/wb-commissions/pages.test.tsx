import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import source from '../../../calculator/data/commissionTariffs.json';
import searchIndex from '../../../calculator/data/commissionSubjects.json';
import { tariffMeta } from '../../config/tariffMeta';
import { escapeHtml, getPageMetadata } from '../../seo/metadata';
import { generateSitemap } from '../../tools/sitemap';
import { tools } from '../../tools/registry';
import { contentPages } from '../registry';
import { pages, commissionCategories, commissionPath } from './pages';
import { formatRange, formatRate, type SubjectSearchRow } from './calc';
import ReferenceIndexPage from '../reference/ReferenceIndexPage';

const categoryPages = pages.filter((page) => page.path !== commissionPath);
const files = import.meta.glob('../../../calculator/data/commissions/*.json', { eager: true, import: 'default' });

describe('справочник комиссий WB', () => {
  it('создаёт ровно одну страницу и один файл на уникальную категорию, slug уникальны', () => {
    const count = new Set(source.map((row) => row.category)).size;
    expect(categoryPages).toHaveLength(count);
    expect(Object.keys(files)).toHaveLength(count);
    expect(new Set(commissionCategories.map((category) => category.slug)).size).toBe(count);
    for (const category of commissionCategories) {
      expect(category.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(categoryPages.some((page) => page.path === commissionPath + '/' + category.slug)).toBe(true);
      expect(files[`../../../calculator/data/commissions/${category.slug}.json`])
        .toEqual(source.filter((row) => row.category === category.category));
    }
  });

  it('сохраняет все исходные предметы и ставки в компактном поисковом индексе', () => {
    expect(searchIndex).toHaveLength(source.length);
    const decoded = (searchIndex as SubjectSearchRow[]).map(([subject, categoryIndex, fboCommissionRate, fbsCommissionRate]) => ({
      category: commissionCategories[categoryIndex].category, subject, fboCommissionRate, fbsCommissionRate,
    }));
    expect(decoded).toEqual(commissionCategories.flatMap(({ category }) => source.filter((row) => row.category === category)
      .map(({ id: _id, ...row }) => row)));
  });

  it('диапазоны, средние и количество на хабе совпадают с исходными данными', async () => {
    const page = pages[0];
    const Component = (await page.load()).default;
    const html = renderToString(createElement(Component, { page }));
    expect([...html.matchAll(/data-category-slug=/g)]).toHaveLength(commissionCategories.length);
    for (const category of commissionCategories) {
      const rows = source.filter((row) => row.category === category.category);
      expect(category.count).toBe(rows.length);
      for (const [summary, key] of [[category.fbo, 'fboCommissionRate'], [category.fbs, 'fbsCommissionRate']] as const) {
        const rates = rows.map((row) => row[key]);
        expect(summary.min).toBe(Math.min(...rates));
        expect(summary.max).toBe(Math.max(...rates));
        expect(summary.average).toBeCloseTo(rates.reduce((sum, rate) => sum + rate, 0) / rates.length, 10);
      }
      const rowHtml = html.split(`data-category-slug="${category.slug}"`)[1].split('</tr>')[0];
      expect(rowHtml).toContain(formatRange(category.fbo).slice(0, -1));
      expect(rowHtml).toContain(formatRange(category.fbs).slice(0, -1));
      expect(rowHtml).toContain('href="' + commissionPath + '/' + category.slug + '"');
    }
    expect(html).toContain(`dateTime="${tariffMeta.updatedAt}"`);
  });

  it('рендерит все предметы самой большой категории в HTML без пагинации', async () => {
    const largest = [...commissionCategories].sort((a, b) => b.count - a.count)[0];
    const page = categoryPages.find((entry) => entry.path === commissionPath + '/' + largest.slug)!;
    const Component = (await page.load()).default;
    const html = renderToString(createElement(Component, { page }));
    const rows = source.filter((row) => row.category === largest.category);
    expect([...html.matchAll(/data-subject-id=/g)]).toHaveLength(rows.length);
    for (const row of rows) {
      expect(html).toContain(`data-subject-id="${escapeHtml(row.id)}"`);
      expect(html).toContain(escapeHtml(row.subject));
    }
    expect(html).toContain(formatRate(largest.fbo.average));
    expect(html).toContain(formatRate(largest.fbs.average));
    expect(html).toContain('href="/calculator"');
    expect(html).toContain('Рассчитать прибыль для этой категории');
    expect(html).toContain(`dateTime="${tariffMeta.updatedAt}"`);
    expect(html).toContain('aria-sort="ascending"');
  });

  it('включает все страницы в sitemap и отдаёт собственные метаданные', () => {
    const sitemap = generateSitemap(tools);
    for (const page of pages) {
      expect(sitemap).toContain('<loc>https://zubarevlab.ru' + page.path + '</loc>');
      expect(page.updatedAt).toBe(tariffMeta.updatedAt);
      expect(page.description.length).toBeLessThanOrEqual(160);
      const metadata = getPageMetadata(page.path);
      expect(metadata.title).toBe(page.title);
      expect(metadata.canonical).toBe('https://zubarevlab.ru' + page.path);
      expect(metadata.structuredData[0]['@type']).toBe('BreadcrumbList');
    }
    expect(categoryPages[0].title).toContain(`в ${tariffMeta.updatedAt.slice(0, 4)} году: ставки FBO и FBS по предметам`);
  });

  it('показывает карточку «Комиссии WB» в разделе /reference', () => {
    const page = contentPages.find((entry) => entry.path === '/reference')!;
    const html = renderToString(createElement(ReferenceIndexPage, { page }));
    expect(html).toContain('href="/reference/wb-commissions"');
    expect(html).toContain('Комиссии WB');
  });
});
