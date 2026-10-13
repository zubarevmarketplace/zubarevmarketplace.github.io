import { tools, type ToolDefinition } from './registry';
import { contentPages, type ContentPageDefinition } from '../content/registry';

export type Route =
  | { kind: 'home' }
  | { kind: 'tools' }
  | { kind: 'tool'; tool: ToolDefinition }
  | { kind: 'content'; page: ContentPageDefinition }
  | { kind: 'not-found' };

export function resolveRoute(
  pathname: string,
  definitions: readonly ToolDefinition[] = tools,
  pages: readonly ContentPageDefinition[] = contentPages,
): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { kind: 'home' };
  if (path === '/tools') return { kind: 'tools' };
  const tool = definitions.find((entry) =>
    path === '/tools/' + entry.slug || (path === '/calculator' && entry.slug === 'wb-calculator'),
  );
  if (tool) return { kind: 'tool', tool };
  const page = pages.find((entry) => entry.path === path);
  return page ? { kind: 'content', page } : { kind: 'not-found' };
}
