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
  faq: { question: string; answer: string; link?: { slug: string; label: string } }[];
};

// Related routes reserved by the next tasks in docs/BACKLOG.md; never exposed as live tools.
export const plannedToolSlugs = ['break-even', 'drr'] as const;

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
  {
    slug: 'price-for-margin',
    title: 'Калькулятор цены под маржу для Wildberries — какую цену ставить на WB',
    h1: 'Цена под маржу: какую цену ставить на Wildberries',
    description: 'Рассчитайте цену товара на Wildberries под целевую маржу или прибыль: комиссия WB, логистика, хранение, ДРР, налоги и СПП для FBO и FBS.',
    shortDescription: 'Подберите цену для покупателя под заданную маржу или прибыль с единицы с учётом расходов Wildberries.',
    keywords: ['как рассчитать цену товара на вайлдберриз', 'калькулятор наценки wildberries', 'какую цену ставить на wb'],
    related: ['wb-calculator', 'break-even', 'drr'],
    updatedAt: '2026-10-13',
    load: () => import('./price-for-margin/Page'),
    faq: [
      { question: 'Чем маржа отличается от наценки?', answer: 'Маржа — доля прибыли после всех расходов в цене для покупателя. Наценка — превышение цены над себестоимостью, делённое на себестоимость; она сама по себе не учитывает расходы WB. ROI здесь показывает прибыль после расходов относительно себестоимости.' },
      { question: 'Учитывается ли СПП?', answer: 'Да. По умолчанию СПП составляет 30%, её можно изменить. Цена для покупателя указывается после СПП, рядом показана цена до СПП. Модель уменьшает комиссию WB на сумму СПП, а рекламу считает от цены до СПП; фактическую скидку проверьте в кабинете WB.' },
      { question: 'Почему цена зависит от габаритов?', answer: 'Объём товара в упаковке влияет на логистику и хранение. Чем больше эти расходы, тем выше цена для той же прибыли. Вес помогает определить крупногабаритный товар, но отдельная надбавка за вес в модели не задана.' },
      { question: 'Как учесть акции?', answer: 'Сравните рекомендованную цену со сниженной: инструмент сразу показывает прибыль при скидке 10%. Для оценки предельной скидки используйте инструмент «Точка безубыточности и цена для акции», когда он станет доступен.', link: { slug: 'break-even', label: 'Точка безубыточности и цена для акции' } },
    ],
  },
];
