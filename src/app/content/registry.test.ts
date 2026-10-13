import { describe, expect, it } from 'vitest';
import { contentPages, type ContentPageDefinition } from './registry';
import { resolveContentLink } from './links';
import { tools } from '../tools/registry';
import { resolveRoute } from '../tools/routes';

describe('реестр контентных страниц', () => {
  it('собирает все модули-поставщики без дублирования путей и конфликтов с инструментами', () => {
    const providers = import.meta.glob<{ pages: ContentPageDefinition[] }>('./*/pages.ts', { eager: true });
    expect(contentPages).toEqual(Object.keys(providers).sort().flatMap((path) => providers[path].pages));
    expect(contentPages.some((page) => page.path === '/reference')).toBe(true);
    const paths = ['/', '/calculator', '/tools', ...tools.map((tool) => '/tools/' + tool.slug), ...contentPages.map((page) => page.path)];
    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(contentPages)('$path: абсолютный путь, метаданные, крошки и related корректны', (page) => {
    expect(page.path).toMatch(/^\/(?:[a-z0-9-]+)(?:\/[a-z0-9-]+)*$/);
    for (const value of [page.title, page.h1, page.description]) expect(value.trim()).not.toBe('');
    expect(['reference', 'templates', 'checklists']).toContain(page.section);
    expect(page.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/);
    expect(Number.isNaN(Date.parse(page.updatedAt))).toBe(false);
    expect(page.load).toBeTypeOf('function');
    expect(page.breadcrumbs.at(-1)?.path).toBe(page.path);
    for (const crumb of page.breadcrumbs) {
      expect(crumb.label.trim()).not.toBe('');
      expect(crumb.path.startsWith('/')).toBe(true);
      expect(resolveRoute(crumb.path).kind).not.toBe('not-found');
    }
    for (const target of page.related ?? []) {
      // Task 014's logistics tool is registered as a future link, as AGENTS.md requires.
      if (target === '/tools/wb-logistics' && !tools.some((tool) => tool.slug === 'wb-logistics')) {
        expect(resolveContentLink(target)).toBeUndefined();
        continue;
      }
      expect(resolveContentLink(target), page.path + ' → ' + target).toBeDefined();
    }
  });

  it('related поддерживает контентные пути, пути инструментов, алиас и slug; скрывает будущие страницы', () => {
    expect(resolveContentLink('/reference')?.path).toBe('/reference');
    expect(resolveContentLink('/tools/drr')?.path).toBe('/tools/drr');
    expect(resolveContentLink('drr')?.path).toBe('/tools/drr');
    expect(resolveContentLink('/calculator')?.path).toBe('/calculator');
    expect(resolveContentLink('/reference/future')).toBeUndefined();
    expect(resolveContentLink('future-tool')).toBeUndefined();
    expect(resolveContentLink('https://example.com')).toBeUndefined();
  });
});
