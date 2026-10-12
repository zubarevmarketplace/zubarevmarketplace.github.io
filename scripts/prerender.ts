import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { tools } from '../src/app/tools/registry';
import { applyPrerender } from '../src/ssg/template';

type ServerEntry = { render: (url: string) => Promise<{ html: string; head: string }> };

async function main() {
  // Vite's build API runs the same client and SSR builds without shell-specific
  // command quoting or a recursive npm build invocation.
  await build();
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr' } });
  const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href) as ServerEntry;
  // Read the untouched template once, before overwriting the home entry.
  const template = await readFile(resolve('dist/index.html'), 'utf8');
  const routes = new Set(['/', '/calculator', '/tools', ...tools.map((tool) => '/tools/' + tool.slug)]);
  for (const route of routes) {
    const { html, head } = await render(route);
    const directory = resolve('dist', route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), applyPrerender(template, route, html, head), 'utf8');
    console.info('[prerender]', route);
  }
  // Also keep local preview output equivalent to the deployment workflow.
  await writeFile(resolve('dist/404.html'), await readFile(resolve('dist/index.html'), 'utf8'), 'utf8');
}

main().catch((error: unknown) => {
  console.error('[prerender] Ошибка:', error);
  process.exitCode = 1;
});
