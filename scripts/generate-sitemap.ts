import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tools } from '../src/app/tools/registry';
import { generateSitemap } from '../src/app/tools/sitemap';

async function main() {
  await writeFile(resolve('dist/sitemap.xml'), generateSitemap(tools), 'utf8');

  // GitHub Pages needs an HTML entry for direct navigation. Keep the existing
  // calculator metadata; full static rendering is handled by task 003.
  const html = await readFile(resolve('dist/index.html'), 'utf8');
  for (const route of ['tools', ...tools.map((tool) => 'tools/' + tool.slug)]) {
    const directory = resolve('dist', route);
    const entry = resolve(directory, 'index.html');
    try {
      await access(entry);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await mkdir(directory, { recursive: true });
      await writeFile(entry, html, 'utf8');
    }
  }
}

main().catch((error: unknown) => {
  console.error('[generate-sitemap] Ошибка:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
