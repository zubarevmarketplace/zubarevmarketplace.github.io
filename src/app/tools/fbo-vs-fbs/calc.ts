import { calculateUnitEconomics } from '../../lib/calculateUnitEconomics';
import { findCommission, tariffRegistry } from '../../config/tariffRegistry';
import type { CalculatorInput, UnitEconomicsResult } from '../../types/calculator';

export type SchemeComparison = {
  fbo: UnitEconomicsResult;
  fbs: UnitEconomicsResult;
  diffPerUnit: number;
  diffPerMonth: number;
  winner: 'fbo' | 'fbs' | 'equal';
  breakdownDiff: Array<{ label: string; fbo: number; fbs: number }>;
};

export type SalesScenario = {
  monthlySales: number;
  fboProfit: number;
  fbsProfit: number;
  diffPerMonth: number;
};

export function isValidComparisonInput(input: CalculatorInput, monthlySales: number): boolean {
  const between = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;
  return Boolean(findCommission(input.commissionTariffId)) &&
    between(input.salePrice, 1, 1_000_000) && between(input.costPrice, 0, 1_000_000) &&
    [input.lengthCm, input.widthCm, input.heightCm].every((value) => between(value, 0.1, 300)) &&
    between(input.weightKg, 0.01, 500) && Object.hasOwn(tariffRegistry.wb.geoPresets, input.geoPresetId) &&
    between(input.platformDiscountRatePercent, 0, 95) && between(input.adRate, 0, 100) &&
    ['usn6', 'usn15'].includes(input.taxMode) && between(input.taxRate, 0, 100) &&
    between(input.manualBuyoutRate, 1, 100) && between(input.manualLocalOrderShare, 0, 100) &&
    between(input.manualStorageDays, 0, 365) &&
    [input.manualDeliveryToWbPerUnit, input.packagingCost, input.manualFulfillmentCost, input.otherCosts,
      input.manualProcessingCost ?? tariffRegistry.wb.defaults.fbsProcessingCost]
      .every((value) => between(value, 0, 100_000)) &&
    Number.isInteger(monthlySales) && monthlySales >= 0 && monthlySales <= 1_000_000;
}

/** Positive difference means FBO earns more after tax; never round before comparing. */
export function compareSchemes(input: CalculatorInput, monthlySales: number): SchemeComparison {
  if (!isValidComparisonInput(input, monthlySales)) throw new RangeError('Проверьте исходные данные сравнения.');
  const fbo = calculateUnitEconomics(input, 'fbo', true);
  const fbs = calculateUnitEconomics(input, 'fbs', true);
  const diffPerUnit = fbo.profit - fbs.profit;
  return {
    fbo, fbs, diffPerUnit, diffPerMonth: diffPerUnit * monthlySales,
    winner: diffPerUnit > 0 ? 'fbo' : diffPerUnit < 0 ? 'fbs' : 'equal',
    breakdownDiff: [
      { label: 'Себестоимость', fbo: fbo.costPrice, fbs: fbs.costPrice },
      { label: 'Комиссия и эквайринг', fbo: fbo.commission, fbs: fbs.commission },
      { label: 'Логистика', fbo: fbo.logistics, fbs: fbs.logistics },
      { label: 'Хранение', fbo: fbo.storage, fbs: fbs.storage },
      { label: 'Обработка / фулфилмент', fbo: fbo.processing + fbo.fulfillment, fbs: fbs.processing + fbs.fulfillment },
      { label: 'Доставка до WB', fbo: fbo.deliveryToWb, fbs: fbs.deliveryToWb },
      { label: 'Прочее (включая упаковку)', fbo: fbo.packaging + fbo.otherCosts, fbs: fbs.packaging + fbs.otherCosts },
      { label: 'Реклама', fbo: fbo.adCost, fbs: fbs.adCost },
      { label: 'Налог', fbo: fbo.tax, fbs: fbs.tax },
    ],
  };
}

/** All costs are per unit: volumes scale profit and cannot create a new crossover. */
export function compareSalesVolumes(input: CalculatorInput): {
  scenarios: SalesScenario[];
  equalAt: number[];
} {
  const scenarios: SalesScenario[] = [];
  const equalAt: number[] = [];
  for (let monthlySales = 10; monthlySales <= 1000; monthlySales += 10) {
    const comparison = compareSchemes(input, monthlySales);
    scenarios.push({ monthlySales, fboProfit: comparison.fbo.profit * monthlySales,
      fbsProfit: comparison.fbs.profit * monthlySales, diffPerMonth: comparison.diffPerMonth });
    if (comparison.winner === 'equal') equalAt.push(monthlySales);
  }
  return { scenarios, equalAt };
}
