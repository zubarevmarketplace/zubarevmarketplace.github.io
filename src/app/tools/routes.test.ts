import { describe, expect, it } from 'vitest';
import { tools } from './registry';
import { resolveRoute } from './routes';
import { contentPages } from '../content/registry';

describe('маршруты', () => {
  it('сохраняет главную и открывает список инструментов', () => {
    expect(resolveRoute('/')).toEqual({ kind: 'home' });
    expect(resolveRoute('/tools/')).toEqual({ kind: 'tools' });
  });
  it('основной адрес и алиас WB открывают одну запись реестра', () => {
    expect(resolveRoute('/calculator')).toEqual({ kind: 'tool', tool: tools[0] });
    expect(resolveRoute('/tools/wb-calculator/')).toEqual(resolveRoute('/calculator/'));
  });
  it('новая запись доступна без изменения маршрутизации', () => {
    const newTool = { ...tools[0], slug: 'new-tool' };
    expect(resolveRoute('/tools/new-tool', [...tools, newTool])).toEqual({ kind: 'tool', tool: newTool });
  });
  it('открывает хаб справочников и нормализует завершающий слеш', () => {
    const page = contentPages.find((entry) => entry.path === '/reference');
    expect(resolveRoute('/reference')).toEqual({ kind: 'content', page });
    expect(resolveRoute('/reference/')).toEqual(resolveRoute('/reference'));
  });
  it.each(['/reference/glossary/drr', '/templates/example', '/reference/checklists/example'])('находит новую страницу %s без изменения маршрутизации', (path) => {
    const page = { ...contentPages[0], path, data: { term: 'ДРР' } };
    expect(resolveRoute(path, tools, [...contentPages, page])).toEqual({ kind: 'content', page });
  });
  it.each(['/unknown', '/tools/missing', '/tools/wb-calculator/extra', '/calculator-extra'])('неизвестный адрес %s показывает 404', (path) => {
    expect(resolveRoute(path)).toEqual({ kind: 'not-found' });
  });
});
