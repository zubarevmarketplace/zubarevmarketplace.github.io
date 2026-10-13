import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app/App';
import ToolsIndexPage from './app/pages/ToolsIndexPage';
import NotFoundPage from './app/pages/NotFoundPage';
import { resolveRoute } from './app/tools/routes';
import { getPageMetadata, renderHead } from './app/seo/metadata';
import { tools } from './app/tools/registry';
import { contentPages } from './app/content/registry';
import { generateSitemap } from './app/tools/sitemap';

// Build scripts consume the Vite-compiled registry so provider discovery is
// identical to the browser build (import.meta.glob is a Vite transform).
export function getPrerenderPaths(): string[] {
  return [...new Set([
    '/', '/calculator', '/tools',
    ...tools.map((tool) => '/tools/' + tool.slug),
    ...contentPages.map((page) => page.path),
  ])];
}

export function renderSitemap(): string {
  return generateSitemap(tools);
}

export async function render(url: string): Promise<{ html: string; head: string }> {
  const pathname = new URL(url, 'https://zubarevlab.ru').pathname;
  const route = resolveRoute(pathname);
  // Await the registry loader before renderToString: no unresolved lazy/Suspense
  // boundary, and new registered tools automatically participate in SSG.
  const Tool = route.kind === 'tool' ? (await route.tool.load()).default : null;
  const Content = route.kind === 'content' ? (await route.page.load()).default : null;
  const page = route.kind === 'home' ? <App />
    : route.kind === 'tools' ? <ToolsIndexPage />
    : route.kind === 'content' && Content ? <Content page={route.page} />
    : Tool ? <Tool /> : <NotFoundPage />;
  return {
    html: renderToString(<React.StrictMode>{page}</React.StrictMode>),
    head: renderHead(getPageMetadata(pathname)),
  };
}
