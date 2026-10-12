import type { CalculatorInput, ResultMode } from '../../types/calculator';
import { findCommission } from '../../config/tariffRegistry';
import { calculatePriceScenario, findPriceForTarget, type PriceSolution } from '../price-for-margin/calc';

export type BreakEvenInput = CalculatorInput & { minimumProfit?: number };
export type PromoInput = CalculatorInput & { monthlySales: number };
export type BreakEvenResult = {
  breakEven: PriceSolution | null;
  target: PriceSolution | null;
  priceBuffer: number | null;
  priceBufferPercent: number | null;
};
export type PromoEvaluation = {
  currentProfit: number;
  promoProfit: number;
  promoPrice: number;
  promoSales: number;
  currentMonthlyProfit: number;
  promoMonthlyProfit: number;
  recommendation: 'ok' | 'risky' | 'loss';
};

export function isValidBreakEvenInput(input: CalculatorInput): boolean {
  const between = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;
  return Boolean(findCommission(input.commissionTariffId)) &&
    between(input.costPrice, 1, 1_000_000) && between(input.salePrice, 1, 1_000_000) &&
    [input.lengthCm, input.widthCm, input.heightCm].every((value) => between(value, 0.1, 300)) &&
    between(input.weightKg, 0.01, 500) && between(input.platformDiscountRatePercent, 0, 95) &&
    (!input.includeAds || between(input.adRate, 0, 100)) &&
    (!input.includeTaxes || between(input.taxRate, 0, 100));
}

/** Lowest whole-ruble buyer price with nonnegative after-tax profit. */
export function findBreakEvenPrice(input: BreakEvenInput, model: ResultMode): BreakEvenResult {
  // The shared solver defaults to cost price as its lower bound. WB's SPP
  // compensation can make break-even lower, so search the full supported range.
  const range = { min: 1, max: 1_000_000 };
  const valid = isValidBreakEvenInput(input);
  const breakEven = valid ? findPriceForTarget(input, { kind: 'profitPerUnit', value: 0 }, model, range) : null;
  const target = valid && input.minimumProfit !== undefined
    ? findPriceForTarget(input, { kind: 'profitPerUnit', value: input.minimumProfit }, model, range) : null;
  const priceBuffer = breakEven ? input.salePrice - breakEven.price : null;
  return { breakEven, target, priceBuffer,
    priceBufferPercent: priceBuffer === null ? null : priceBuffer / input.salePrice * 100 };
}

/** Sales mean sold/bought-out units; growth is an assumption, not a forecast. */
export function evaluatePromo(input: PromoInput, model: ResultMode, currentPrice: number,
  discountPercent: number, extraSalesPercent: number): PromoEvaluation | null {
  if (!isValidBreakEvenInput({ ...input, salePrice: currentPrice }) ||
      !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent >= 100 ||
      !Number.isFinite(extraSalesPercent) || extraSalesPercent < 0 ||
      !Number.isInteger(input.monthlySales) || input.monthlySales < 0) return null;
  const promoPrice = currentPrice * (1 - discountPercent / 100);
  // Do not allow the shared calculator's 1-ruble clamp to change the promo price.
  if (promoPrice < 1) return null;
  const currentProfit = calculatePriceScenario(input, currentPrice, model).profit;
  const promoProfit = calculatePriceScenario(input, promoPrice, model).profit;
  const promoSales = input.monthlySales * (1 + extraSalesPercent / 100);
  const currentMonthlyProfit = input.monthlySales * currentProfit;
  const promoMonthlyProfit = promoSales * promoProfit;
  if (![currentProfit, promoProfit, promoSales, currentMonthlyProfit, promoMonthlyProfit].every(Number.isFinite)) return null;
  const recommendation = promoProfit < 0 ? 'loss' : promoMonthlyProfit >= currentMonthlyProfit ? 'ok' : 'risky';
  return { currentProfit, promoProfit, promoPrice, promoSales, currentMonthlyProfit, promoMonthlyProfit, recommendation };
}
