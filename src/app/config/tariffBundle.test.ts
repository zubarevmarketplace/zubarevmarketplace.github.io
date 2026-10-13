import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { build } from 'vite';
import type { OutputChunk, RollupOutput } from 'rollup';

describe('загрузка тарифов по маршрутам', () => {
  it('оставляет главную, каталог и ДРР без справочника и укладывает ДРР в 400 КБ JS', async () => {
    const result = await build({
      logLevel: 'silent',
      mode: 'production',
      // Vitest задаёт NODE_ENV=test; измеряем тот же production React, что в dist.
      define: { 'process.env.NODE_ENV': JSON.stringify('production') },
      build: { write: false },
    });
    const outputs = (Array.isArray(result) ? result : [result]) as RollupOutput[];
    const chunks = outputs.flatMap((output) => output.output)
      .filter((output): output is OutputChunk => output.type === 'chunk');
    const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
    const entry = chunks.find((chunk) => chunk.isEntry)!;
    const drr = chunks.find((chunk) => chunk.facadeModuleId?.replaceAll('\\', '/').endsWith('/tools/drr/Page.tsx'))!;
    const tariffChunks = chunks.filter((chunk) => Object.keys(chunk.modules).some(
      (id) => /\/(commissionTariffs\.json|warehouseTariffs\.ts)$/.test(id.replaceAll('\\', '/')),
    ));
    expect(entry).toBeDefined();
    expect(drr).toBeDefined();
    expect(tariffChunks.length).toBeGreaterThan(0);

    function staticDependencies(roots: OutputChunk[]): OutputChunk[] {
      const visited = new Set<OutputChunk>();
      function visit(chunk: OutputChunk) {
        if (visited.has(chunk)) return;
        visited.add(chunk);
        for (const name of chunk.imports) {
          const dependency = byName.get(name);
          expect(dependency, name).toBeDefined();
          visit(dependency!);
        }
      }
      roots.forEach(visit);
      return [...visited];
    }

    // Главная и каталог используют только общий entry; ДРР добавляет свой Page.
    const loaded = staticDependencies([entry, drr]);
    for (const chunk of loaded) {
      for (const tariffs of tariffChunks) {
        expect(chunk, chunk.fileName).not.toBe(tariffs);
        expect(chunk.code, chunk.fileName).not.toContain(tariffs.fileName);
      }
    }
    expect(loaded.reduce((bytes, chunk) => bytes + Buffer.byteLength(chunk.code), 0))
      .toBeLessThanOrEqual(400_000);

    // Тарифы остаются доступны через прежние импорты расчётных WB-страниц.
    for (const suffix of ['/pages/WbCalculatorPage.tsx', '/tools/price-for-margin/Page.tsx',
      '/tools/break-even/Page.tsx', '/tools/fbo-vs-fbs/Page.tsx']) {
      const page = chunks.find((chunk) => chunk.facadeModuleId?.replaceAll('\\', '/').endsWith(suffix));
      expect(page, suffix).toBeDefined();
      expect(staticDependencies([page!])).toEqual(expect.arrayContaining(tariffChunks));
    }

    const html = outputs.flatMap((output) => output.output)
      .find((output) => output.type === 'asset' && output.fileName === 'index.html');
    expect(html?.type).toBe('asset');
    if (html?.type === 'asset') {
      for (const tariffs of tariffChunks) expect(String(html.source)).not.toContain(tariffs.fileName);
    }
  }, 30_000);
});
