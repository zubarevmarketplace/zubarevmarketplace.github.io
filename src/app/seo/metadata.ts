import { tools, type ToolDefinition } from '../tools/registry';
import { resolveRoute } from '../tools/routes';
import { homeStructuredData } from './homeStructuredData';
import type { ContentPageDefinition } from '../content/registry';
import { escapeHtml } from './escapeHtml';

export { escapeHtml } from './escapeHtml';

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  structuredData: Record<string, unknown>[];
};

const origin = 'https://zubarevlab.ru';
const defaultImage = origin + '/og-image.jpg';

export const homeMetadata: PageMetadata = {
  title: 'Zubarev Lab — инструменты и услуги для продавцов Wildberries',
  description: 'Инструменты, аналитика и услуги для продавцов Wildberries: юнит-экономика, логистика, комиссии, прибыль, продвижение и рост продаж.',
  canonical: origin + '/',
  ogImage: defaultImage,
  structuredData: homeStructuredData,
};

export const toolsMetadata: PageMetadata = {
  title: 'Бесплатные инструменты для продавцов Wildberries и Ozon',
  description: 'Бесплатные онлайн-инструменты для продавцов Wildberries и Ozon. Рассчитайте юнит-экономику, прибыль и расходы товара без регистрации.',
  canonical: origin + '/tools',
  ogImage: defaultImage,
  structuredData: [{
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem', position: index + 1, name: tool.h1,
      url: origin + '/tools/' + tool.slug,
    })),
  }],
};

export function getPageMetadata(pathname: string): PageMetadata {
  const route = resolveRoute(pathname);
  if (route.kind === 'home') return homeMetadata;
  if (route.kind === 'tools') return toolsMetadata;
  if (route.kind === 'tool') {
    return getToolMetadata(route.tool);
  }
  if (route.kind === 'content') return getContentMetadata(route.page);
  return {
    title: 'Страница не найдена — Zubarev Lab',
    description: 'Проверьте адрес или выберите бесплатный инструмент для продавцов Wildberries и Ozon.',
    canonical: origin + pathname,
    ogImage: defaultImage,
    structuredData: [],
  };
}

export function getToolMetadata(tool: ToolDefinition): PageMetadata {
  return {
    title: tool.title,
    description: tool.description,
    // The WB tool is an alias of the existing calculator page.
    canonical: origin + (tool.slug === 'wb-calculator' ? '/calculator' : '/tools/' + tool.slug),
    ogImage: tool.ogImage ?? defaultImage,
    structuredData: tool.faq.length ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: tool.faq.map(({ question, answer }) => ({
        '@type': 'Question', name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }] : [],
  };
}

export function getContentMetadata(page: ContentPageDefinition): PageMetadata {
  return {
    title: page.title,
    description: page.description,
    canonical: origin + page.path,
    ogImage: defaultImage,
    structuredData: [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map(({ label, path }, index) => ({
        '@type': 'ListItem', position: index + 1, name: label, item: origin + path,
      })),
    }],
  };
}

export function serializeStructuredData(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function renderHead(metadata: PageMetadata): string {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const url = escapeHtml(metadata.canonical);
  const image = escapeHtml(metadata.ogImage);
  return [
    '<title>' + title + '</title>',
    '<meta name="description" content="' + description + '" />',
    '<link rel="canonical" href="' + url + '" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:title" content="' + title + '" />',
    '<meta property="og:description" content="' + description + '" />',
    '<meta property="og:url" content="' + url + '" />',
    '<meta property="og:image" content="' + image + '" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:site_name" content="Zubarev Lab" />',
    '<meta property="og:locale" content="ru_RU" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + title + '" />',
    '<meta name="twitter:description" content="' + description + '" />',
    '<meta name="twitter:url" content="' + url + '" />',
    '<meta name="twitter:image" content="' + image + '" />',
    ...metadata.structuredData.map((data) => '<script type="application/ld+json">' + serializeStructuredData(data) + '</script>'),
  ].join('\n');
}
