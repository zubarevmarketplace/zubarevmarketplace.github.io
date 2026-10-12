import { escapeHtml } from '../app/seo/metadata';

export function applyPrerender(template: string, route: string, html: string, head: string): string {
  if (!template.includes('<div id="root"></div>') || !template.includes('</head>')) {
    throw new Error('Не найдены точки вставки статической страницы в шаблоне Vite.');
  }
  return template.replace(/<head>([\s\S]*?)<\/head>/, (_, originalHead: string) => {
    const preservedHead = originalHead
      .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b[^>]*(?:name\s*=\s*["'](?:description|twitter:[^"']*)["']|property\s*=\s*["']og:[^"']*["'])[^>]*>/gi, '')
      .replace(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi, '')
      .replace(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
    // Verification, analytics, favicons, CSS and client scripts remain intact.
    return '<head>' + preservedHead + '\n' + head + '\n</head>';
  }).replace('<div id="root"></div>', () => '<div id="root" data-ssg-route="' + escapeHtml(route) + '">' + html + '</div>');
}
