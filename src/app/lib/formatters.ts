export const formatCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits }).format(value);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value) + '%';
