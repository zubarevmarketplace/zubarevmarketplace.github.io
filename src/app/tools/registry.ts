import type { ComponentType } from 'react';

export type ToolDefinition = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  shortDescription: string;
  keywords?: string[];
  related: string[];
  ogImage?: string;
  updatedAt: string;
  load: () => Promise<{ default: ComponentType }>;
  faq: { question: string; answer: string }[];
};

export const tools: ToolDefinition[] = [
  {
    slug: 'wb-calculator',
    title: 'Калькулятор юнит-экономики Wildberries — бесплатный расчёт прибыли WB',
    h1: 'Калькулятор юнит-экономики WB',
    description: 'Бесплатный калькулятор юнит-экономики Wildberries: рассчитайте прибыль, маржу, ROI, комиссии WB, логистику, хранение, рекламу, налоги и СПП.',
    shortDescription: 'Рассчитайте прибыль, маржу и ROI товара на Wildberries с учётом комиссии, логистики, рекламы и налогов для FBO и FBS.',
    keywords: ['Wildberries', 'WB', 'юнит-экономика', 'прибыль', 'FBO', 'FBS'],
    related: [],
    ogImage: 'https://zubarevlab.ru/og-wb-calculator.jpg',
    updatedAt: '2026-10-13',
    load: () => import('../pages/WbCalculatorPage'),
    faq: [
      { question: 'Что показывает калькулятор юнит-экономики WB?', answer: 'Калькулятор оценивает прибыль с единицы товара, маржу и ROI с учётом введённых затрат и выбранной модели FBO или FBS.' },
      { question: 'Можно ли учитывать рекламу и налоги?', answer: 'Да. Укажите рекламные расходы и параметры налогообложения в соответствующих полях расчёта.' },
      { question: 'Чем отличаются простой и расширенный режимы?', answer: 'Простой режим использует средние показатели категории и географии. Расширенный режим позволяет уточнить параметры товара, комиссии и логистики.' },
    ],
  },
];
