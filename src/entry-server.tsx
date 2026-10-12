import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app/App';
import ToolsIndexPage from './app/pages/ToolsIndexPage';
import NotFoundPage from './app/pages/NotFoundPage';
import { resolveRoute } from './app/tools/routes';
import { getPageMetadata, renderHead } from './app/seo/metadata';

export async function render(url: string): Promise<{ html: string; head: string }> {
  const pathname = new URL(url, 'https://zubarevlab.ru').pathname;
  const route = resolveRoute(pathname);
  // Await the registry loader before renderToString: no unresolved lazy/Suspense
  // boundary, and new registered tools automatically participate in SSG.
  const Tool = route.kind === 'tool' ? (await route.tool.load()).default : null;
  const page = route.kind === 'home' ? <App />
    : route.kind === 'tools' ? <ToolsIndexPage />
    : Tool ? <Tool /> : <NotFoundPage />;
  return {
    html: renderToString(<React.StrictMode>{page}</React.StrictMode>),
    head: renderHead(getPageMetadata(pathname)),
  };
}
