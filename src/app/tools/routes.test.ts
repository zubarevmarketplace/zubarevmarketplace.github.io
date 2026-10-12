import { describe, expect, it } from 'vitest';
import { tools } from './registry';
import { resolveRoute } from './routes';

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
  it.each(['/unknown', '/tools/missing', '/tools/wb-calculator/extra', '/calculator-extra'])('неизвестный адрес %s показывает 404', (path) => {
    expect(resolveRoute(path)).toEqual({ kind: 'not-found' });
  });
});
