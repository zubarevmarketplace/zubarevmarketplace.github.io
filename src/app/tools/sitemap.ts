import type { ToolDefinition } from './registry';

type SitemapTool = Pick<ToolDefinition, 'slug' | 'updatedAt'>;

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export function generateSitemap(definitions: readonly SitemapTool[], origin = 'https://zubarevlab.ru'): string {
  const baseUrl = origin.replace(/\/+$/, '');
  const calculator = definitions.find((tool) => tool.slug === 'wb-calculator');
  const latestRevision = definitions.map((tool) => tool.updatedAt).sort().at(-1);
  const routes = [
    { path: '/', updatedAt: undefined },
    { path: '/calculator', updatedAt: calculator?.updatedAt },
    { path: '/tools', updatedAt: latestRevision },
    ...definitions.map((tool) => ({ path: '/tools/' + tool.slug, updatedAt: tool.updatedAt })),
  ];

  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + routes.map(({ path, updatedAt }) => '  <url>\n'
      + '    <loc>' + escapeXml(baseUrl + path) + '</loc>\n'
      + (updatedAt ? '    <lastmod>' + escapeXml(updatedAt) + '</lastmod>\n' : '')
      + '  </url>').join('\n')
    + '\n</urlset>\n';
}
