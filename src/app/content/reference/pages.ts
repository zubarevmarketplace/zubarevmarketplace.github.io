import type { ContentPageDefinition } from '../registry';

export const pages: ContentPageDefinition[] = [
  {
    path: '/reference',
    title: 'Справочники для продавцов Wildberries и Ozon',
    h1: 'Справочники для продавцов Wildberries и Ozon',
    description: 'Справочники по комиссиям и складам WB, словарь продавца, лимиты полей карточки, чек-листы и шаблоны для работы на Wildberries и Ozon.',
    section: 'reference',
    updatedAt: '2026-10-13',
    load: () => import('./ReferenceIndexPage'),
    related: ['wb-calculator', '/tools/drr'],
    breadcrumbs: [
      { label: 'Главная', path: '/' },
      { label: 'Справочники', path: '/reference' },
    ],
  },
];
