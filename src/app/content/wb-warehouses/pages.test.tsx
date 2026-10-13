import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import xlsx from 'xlsx';
import { warehouseTariffs } from '../../../calculator/config/warehouseTariffs';
import { geoPresets } from '../../config/geoPresets';
import { tariffMeta } from '../../config/tariffMeta';
import { calculateBaseLogistics, calculateVolumeLiters } from '../../lib/calculateUnitEconomics';
import { formatCurrency } from '../../lib/formatters';
import { escapeHtml, getPageMetadata } from '../../seo/metadata';
import { resolveContentLink } from '../links';
import { contentPages } from '../registry';
import ReferenceIndexPage from '../reference/ReferenceIndexPage';
import { getPrerenderPaths, render, renderSitemap } from '../../../entry-server';
import { calculateWarehouseExample, formatCoefficient, formatWeight, getWarehousePresets, type WarehouseSlug } from './calc';
import { pages, warehouseIndex, warehousePath } from './pages';

const warehousePages = pages.filter((page) => page.path !== warehousePath);
const entries = Object.entries(warehouseTariffs) as [WarehouseSlug, (typeof warehouseTariffs)[WarehouseSlug]][];

describe('справочник складов Wildberries', () => {
  it('создаёт одну страницу на склад, уникальные slug и согласованный индекс без тарифов', () => {
    expect(warehousePages).toHaveLength(entries.length);
    expect(pages).toHaveLength(entries.length + 1);
    expect(warehouseIndex).toEqual(entries.map(([slug, { label }]) => ({ slug, label })));
    expect(new Set(warehouseIndex.map(({ slug }) => slug)).size).toBe(entries.length);
    for (const [slug] of entries) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(warehousePages.some((page) => page.path === warehousePath + '/' + slug)).toBe(true);
    }
  });

  it('сохраняет все строки коробов с логистикой и хранением из XLSX без вымышленных складов', () => {
    const workbook = xlsx.readFile('data/raw/warehouse-coefficients.xlsx');
    const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets['Короба'], { defval: '' });
    const parse = (value: unknown) => {
      if (value === '' || value == null) return null;
      const number = Number(String(value).replace(',', '.').replace('%', '').trim());
      return Number.isFinite(number) ? (number > 10 ? number / 100 : number) : null;
    };
    const source = rows.flatMap((row) => {
      const logistics = parse(row['Коэффициент логистики, %']);
      const storage = parse(row['Коэффициент хранения, %']);
      return logistics === null || storage === null ? [] : [{
        label: String(row['Склад']), logistics, storage, fbs: parse(row['Коэффициент FBS, %']),
      }];
    });
    expect(entries).toHaveLength(new Set(source.map(({ label }) => label)).size);
    expect(entries.map(([, warehouse]) => warehouse)).toEqual(expect.arrayContaining(source));
    // The selected identities remain compatible with the existing calculator.
    expect(warehouseTariffs.koledino).toEqual({ label: 'Коледино', logistics: 1.95, storage: 1.45, fbs: 1.95 });
    expect(warehouseTariffs.podolsk).toEqual({ label: 'Подольск', logistics: 2, storage: 1.7, fbs: 1.95 });
    expect(warehouseTariffs.ekaterinburg.label).toBe('Екатеринбург - Испытателей 14г');
  });

  it('рендерит на хабе все строки, коэффициенты и явное отсутствие FBS', async () => {
    const { html } = await render(warehousePath);
    expect(html).toMatch(/<h1\b/);
    expect(html).toContain('<table');
    expect([...html.matchAll(/data-warehouse-slug=/g)]).toHaveLength(entries.length);
    for (const [slug, warehouse] of entries) {
      const rowHtml = html.split(`data-warehouse-slug="${slug}"`)[1].split('</tr>')[0];
      expect(rowHtml).toContain(escapeHtml(warehouse.label));
      expect(rowHtml).toContain('href="' + warehousePath + '/' + slug + '"');
      expect(rowHtml).toContain(formatCoefficient(warehouse.logistics));
      expect(rowHtml).toContain(formatCoefficient(warehouse.storage));
      expect(rowHtml).toContain(warehouse.fbs === null ? 'FBS недоступен' : formatCoefficient(warehouse.fbs));
    }
  });

  it.each(entries)('%s: пример, коэффициенты и дата попадают в статический HTML', async (slug, warehouse) => {
    const expected = calculateBaseLogistics(calculateVolumeLiters(30, 20, 10)) * warehouse.logistics;
    expect(calculateWarehouseExample(slug)).toEqual({ volumeLiters: 6, baseLogistics: 116,
      coefficient: warehouse.logistics, logistics: expected });
    const page = warehousePages.find((entry) => entry.path === warehousePath + '/' + slug)!;
    const { html, head } = await render(page.path);
    expect(html).toContain('<h1');
    expect(html).toContain(escapeHtml(page.h1));
    expect(html).toContain('<table');
    expect(html).toContain(`data-logistics-example="${expected}"`);
    expect(html).toContain(formatCurrency(expected, 2));
    expect(html).toContain('30×20×10 см');
    expect(html).toContain('Как читать коэффициенты');
    expect(html).toContain(`dateTime="${tariffMeta.updatedAt}"`);
    expect(html).toContain('href="' + warehousePath + '/' + (slug === 'koledino' ? 'podolsk' : 'koledino') + '"');
    expect(html).not.toContain('Адрес склада');
    expect(head).toContain('<title>' + escapeHtml(page.title) + '</title>');
    expect(head).toContain('<meta name="description" content="' + escapeHtml(page.description) + '"');
    expect(head).toContain('<link rel="canonical" href="https://zubarevlab.ru' + page.path + '"');
    expect(head).toContain('<meta property="og:url" content="https://zubarevlab.ru' + page.path + '"');
    const memberships = getWarehousePresets(slug);
    expect([...html.matchAll(/data-preset-id=/g)]).toHaveLength(memberships.length);
    for (const membership of memberships) {
      const row = html.split(`data-preset-id="${membership.presetId}"`)[1].split('</tr>')[0];
      expect(row).toContain(membership.label);
      expect(row).toContain(formatWeight(membership.weight));
    }
    if (memberships.length === 0) expect(html).toContain('Этот склад не участвует в текущих гео-пресетах');
  });

  it('берёт прямые веса и веса групп из geoPresets, отдельно выбирая минимум для каждого тарифа', () => {
    expect(getWarehousePresets('tula').map(({ presetId, weight }) => [presetId, weight])).toEqual([
      ['allRussia', geoPresets.allRussia.warehouseWeights.find((entry) => entry.warehouse === 'tula')!.weight],
      ['cfo', geoPresets.cfo.warehouseWeights.find((entry) => entry.warehouse === 'tula')!.weight],
    ]);
    expect(getWarehousePresets('koledino').map(({ presetId, weight, logisticsSelected, storageSelected }) =>
      [presetId, weight, logisticsSelected, storageSelected])).toEqual([
      ['allRussia', 0.25, true, true], ['cfo', 0.5, true, true], ['moscow', 1, true, true],
    ]);
    expect(getWarehousePresets('podolsk').every((row) => !row.logisticsSelected && !row.storageSelected)).toBe(true);
    expect(getWarehousePresets('krasnodar')[0]).toMatchObject({ weight: 0.1, logisticsSelected: false, storageSelected: false });
    expect(getWarehousePresets('nevinnomyssk')[0]).toMatchObject({ weight: 0.1, logisticsSelected: true, storageSelected: true });
    expect(getWarehousePresets('penza')).toEqual([]);
  });

  it('включает все страницы в sitemap и пререндер, задаёт метаданные и скрывает будущую ссылку', async () => {
    for (const page of pages) {
      expect(renderSitemap()).toContain('<loc>https://zubarevlab.ru' + page.path + '</loc>');
      expect(getPrerenderPaths()).toContain(page.path);
      expect(page.updatedAt).toBe(tariffMeta.updatedAt);
      expect(page.description.length).toBeLessThanOrEqual(160);
      expect(getPageMetadata(page.path).title).toBe(page.title);
      expect(page.related).toContain('/tools/wb-logistics');
    }
    expect(resolveContentLink('/tools/wb-logistics')).toBeUndefined();
    for (const path of [warehousePath, warehousePath + '/koledino']) {
      expect((await render(path)).html).not.toContain('href="/tools/wb-logistics"');
    }
  });

  it('показывает карточку «Склады WB» на /reference', () => {
    const page = contentPages.find((entry) => entry.path === '/reference')!;
    const html = renderToString(createElement(ReferenceIndexPage, { page }));
    expect(html).toContain('href="/reference/wb-warehouses"');
    expect(html).toContain('Склады WB');
  });
});
