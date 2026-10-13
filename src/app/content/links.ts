import { contentPages, type ContentPageDefinition } from './registry';
import { tools, type ToolDefinition } from '../tools/registry';

export type ContentLink = { path: string; label: string; description: string };

export function resolveContentLink(
  target: string,
  pages: readonly ContentPageDefinition[] = contentPages,
  toolDefinitions: readonly ToolDefinition[] = tools,
): ContentLink | undefined {
  const path = target.replace(/\/+$/, '') || '/';
  const page = pages.find((entry) => entry.path === path);
  if (page) return { path: page.path, label: page.h1, description: page.description };
  const tool = toolDefinitions.find((entry) => path === entry.slug
    || path === '/tools/' + entry.slug
    || (path === '/calculator' && entry.slug === 'wb-calculator'));
  if (tool) return {
    path: path === '/calculator' ? path : '/tools/' + tool.slug,
    label: tool.h1,
    description: tool.shortDescription,
  };
  return undefined;
}
