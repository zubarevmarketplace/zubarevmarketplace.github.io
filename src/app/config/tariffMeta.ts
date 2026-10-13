import generatedMeta from '../../calculator/data/tariffMeta.json';

// Общие метаданные без загрузки комиссий и складских тарифов.
export const tariffMeta = {
  ...generatedMeta,
  source: 'Тарифы WB из личного кабинета, файлы в data/raw',
  nextReviewHint: 'проверяйте тарифы в кабинете WB перед поставкой',
};

export function formatTariffDate(date: string = tariffMeta.updatedAt): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).formatToParts(new Date(date))
    .filter((part) => ['day', 'month', 'year'].includes(part.type))
    .map((part) => part.value)
    .join(' ');
}
