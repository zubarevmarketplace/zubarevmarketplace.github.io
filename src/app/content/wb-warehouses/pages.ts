import { createElement } from 'react';
import warehouses from '../../../calculator/data/warehouseIndex.json';
import { tariffMeta } from '../../config/tariffMeta';
import type { ContentPageDefinition } from '../registry';

export const warehousePath = '/reference/wb-warehouses';
export const warehouseIndex = warehouses;
const breadcrumbs = [
  { label: 'Главная', path: '/' },
  { label: 'Справочники', path: '/reference' },
  { label: 'Склады WB', path: warehousePath },
];

export const pages: ContentPageDefinition[] = [
  {
    path: warehousePath,
    title: 'Склады Wildberries: коэффициенты логистики, хранения и FBS',
    h1: 'Склады Wildberries: коэффициенты логистики и хранения',
    description: 'Сравните коэффициенты складов WB для коробов. Откройте склад, чтобы увидеть пример стоимости логистики и его участие в географии расчёта.',
    section: 'reference', updatedAt: tariffMeta.updatedAt,
    load: () => import('./IndexPage'),
    related: ['/tools/wb-logistics', '/calculator', '/reference/wb-commissions'],
    breadcrumbs,
  },
  ...warehouses.map(({ slug, label }): ContentPageDefinition => ({
    path: warehousePath + '/' + slug,
    title: `Склад Wildberries ${label}: коэффициенты логистики, хранения и FBS`,
    h1: `Склад Wildberries ${label}: коэффициенты логистики и хранения`,
    description: `Коэффициенты WB для коробов: ${label}. Пример логистики для товара 30×20×10 см и веса склада в гео-пресетах калькулятора.`.slice(0, 160),
    section: 'reference', updatedAt: tariffMeta.updatedAt,
    data: { slug },
    load: async () => {
      const { default: WarehousePage } = await import('./WarehousePage');
      return { default: ({ page }: { page: ContentPageDefinition }) => createElement(WarehousePage, { page, slug }) };
    },
    related: [warehousePath, '/tools/wb-logistics', '/calculator'],
    breadcrumbs: [...breadcrumbs, { label, path: warehousePath + '/' + slug }],
  })),
];
