import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
  const { renderSitemap } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href) as {
    renderSitemap: () => string;
  };
  await writeFile(resolve('dist/sitemap.xml'), renderSitemap(), 'utf8');
}

main().catch((error: unknown) => {
  console.error('[generate-sitemap] Ошибка:', error);
  process.exitCode = 1;
});
