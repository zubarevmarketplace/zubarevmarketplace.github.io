import { createElement } from 'react';
import categories from '../../../calculator/data/commissionCategories.json';
import { tariffMeta } from '../../config/tariffMeta';
import type { CommissionTariff } from '../../config/tariffRegistry';
import type { ContentPageDefinition } from '../registry';
import { formatRange, type CommissionCategory } from './calc';

export const commissionCategories: CommissionCategory[] = categories;
export const commissionPath = '/reference/wb-commissions';
const year = tariffMeta.updatedAt.slice(0, 4);
const categoryFiles = import.meta.glob<{ default: CommissionTariff[] }>('../../../calculator/data/commissions/*.json');
const breadcrumbs = [
  { label: 'Главная', path: '/' },
  { label: 'Справочники', path: '/reference' },
  { label: 'Комиссии WB', path: commissionPath },
];

export const pages: ContentPageDefinition[] = [
  {
    path: commissionPath,
    title: `Комиссии Wildberries в ${year} году: ставки FBO и FBS по категориям и предметам`,
    h1: 'Комиссии Wildberries по категориям и предметам',
    description: `Ставки комиссии WB для FBO и FBS: ${categories.length} категорий и ${categories.reduce((sum, row) => sum + row.count, 0).toLocaleString('ru-RU')} предметов. Найдите свой предмет и сравните комиссии.`,
    section: 'reference', updatedAt: tariffMeta.updatedAt,
    load: () => import('./IndexPage'),
    related: ['/calculator', '/tools/fbo-vs-fbs', '/reference'],
    breadcrumbs,
  },
  ...commissionCategories.map((category): ContentPageDefinition => ({
    path: commissionPath + '/' + category.slug,
    title: `Комиссия Wildberries в категории „${category.category}“ в ${year} году: ставки FBO и FBS по предметам`,
    h1: `Комиссия Wildberries в категории „${category.category}“`,
    description: `Комиссия WB: „${category.category}“. FBO ${formatRange(category.fbo)}, FBS ${formatRange(category.fbs)}. Ставки по предметам и сравнение схем продаж.`.slice(0, 160),
    section: 'reference', updatedAt: tariffMeta.updatedAt,
    data: category,
    load: async () => {
      const loadSubjects = categoryFiles[`../../../calculator/data/commissions/${category.slug}.json`];
      if (!loadSubjects) throw new Error('Нет данных комиссий для категории: ' + category.category);
      const [{ default: CategoryPage }, { default: subjects }] = await Promise.all([
        import('./CategoryPage'), loadSubjects(),
      ]);
      return {
        default: ({ page }: { page: ContentPageDefinition }) => createElement(CategoryPage, { page, category, subjects }),
      };
    },
    related: [commissionPath, '/calculator', '/tools/fbo-vs-fbs'],
    breadcrumbs: [...breadcrumbs, { label: category.category, path: commissionPath + '/' + category.slug }],
  })),
];
