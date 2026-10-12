import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tools } from '../src/app/tools/registry';
import { generateSitemap } from '../src/app/tools/sitemap';

writeFile(resolve('dist/sitemap.xml'), generateSitemap(tools), 'utf8').catch((error: unknown) => {
  console.error('[generate-sitemap] Ошибка:', error);
  process.exitCode = 1;
});
