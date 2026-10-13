/// <reference types="vite/client" />
import type { ComponentType } from 'react';

export type ContentPageDefinition = {
  path: string;
  title: string;
  h1: string;
  description: string;
  section: 'reference' | 'templates' | 'checklists';
  updatedAt: string;
  load: () => Promise<{ default: ComponentType<{ page: ContentPageDefinition }> }>;
  data?: unknown;
  related?: string[];
  breadcrumbs: { label: string; path: string }[];
};

// Each section supplies its own array. Vite discovers new providers in both
// client and SSR builds, so routing and build scripts need no section list.
const providers = import.meta.glob<{ pages: ContentPageDefinition[] }>('./*/pages.ts', { eager: true });

export const contentPages: ContentPageDefinition[] = Object.keys(providers)
  .sort()
  .flatMap((path) => providers[path].pages);
