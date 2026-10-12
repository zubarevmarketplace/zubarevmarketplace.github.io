import { tools, type ToolDefinition } from './registry';

export type Route =
  | { kind: 'home' }
  | { kind: 'tools' }
  | { kind: 'tool'; tool: ToolDefinition }
  | { kind: 'not-found' };

export function resolveRoute(pathname: string, definitions: ToolDefinition[] = tools): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { kind: 'home' };
  if (path === '/tools') return { kind: 'tools' };
  const tool = definitions.find((entry) =>
    path === '/tools/' + entry.slug || (path === '/calculator' && entry.slug === 'wb-calculator'),
  );
  return tool ? { kind: 'tool', tool } : { kind: 'not-found' };
}
