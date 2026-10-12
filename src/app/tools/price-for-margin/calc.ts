import { calculateUnitEconomics } from '../../lib/calculateUnitEconomics';
import type { CalculatorInput, ResultMode, UnitEconomicsResult } from '../../types/calculator';

export type PriceTarget = { kind: 'marginPercent' | 'profitPerUnit'; value: number };
export type PriceSolution = { price: number; result: UnitEconomicsResult };

export function getPriceRange(input: CalculatorInput): { min: number; max: number } | null {
  if (!Number.isFinite(input.costPrice) || input.costPrice <= 0 || input.costPrice > 1_000_000) return null;
  const min = Math.max(1, Math.ceil(input.costPrice));
  const max = Math.floor(Math.min(input.costPrice * 50, 1_000_000));
  return min <= max ? { min, max } : null;
}

export function calculatePriceScenario(input: CalculatorInput, price: number, model: ResultMode): UnitEconomicsResult {
  return calculateUnitEconomics({ ...input, salePrice: price }, model, 'subject-simple');
}

const metric = (result: UnitEconomicsResult, target: PriceTarget): number =>
  target.kind === 'marginPercent' ? result.margin ?? -Infinity : result.profit;

/** Lowest whole-ruble price that meets the target; economics stay in the shared calculator. */
export function findPriceForTarget(input: CalculatorInput, target: PriceTarget, model: ResultMode, priceRange?: { min: number; max: number }): PriceSolution | null {
  const defaultRange = getPriceRange(input);
  const range = priceRange ?? defaultRange;
  if (!defaultRange || !range || !Number.isInteger(range.min) || !Number.isInteger(range.max) ||
      range.min < 1 || range.max > 1_000_000 || range.min > range.max) return null;
  if (!range || !Number.isFinite(target.value) || target.value < 0) return null;
  let low = range.min;
  let high = range.max;
  const meetsTarget = (price: number) => {
    const value = metric(calculatePriceScenario(input, price, model), target);
    return Number.isFinite(value) && value >= target.value;
  };
  // With nonnegative costs, a nonnegative target is either already reached at
  // the lower bound, or reached monotonically as price grows (including USN15).
  if (meetsTarget(low)) return { price: low, result: calculatePriceScenario(input, low, model) };
  if (!meetsTarget(high)) return null;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (meetsTarget(middle)) high = middle;
    else low = middle + 1;
  }
  return { price: low, result: calculatePriceScenario(input, low, model) };
}

/** Sample 50 points, including both ends; used only to explain unreachable targets. */
export function findMaximumInRange(input: CalculatorInput, target: PriceTarget, model: ResultMode): PriceSolution | null {
  const range = getPriceRange(input);
  if (!range) return null;
  let best: PriceSolution | null = null;
  for (let index = 0; index < 50; index += 1) {
    const price = Math.round(range.min + (range.max - range.min) * index / 49);
    const result = calculatePriceScenario(input, price, model);
    if (Number.isFinite(metric(result, target)) && (!best || metric(result, target) > metric(best.result, target))) {
      best = { price, result };
    }
  }
  return best;
}
