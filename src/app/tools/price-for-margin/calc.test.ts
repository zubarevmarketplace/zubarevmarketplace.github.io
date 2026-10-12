import { describe, expect, it } from 'vitest';
import { calculateUnitEconomics } from '../../lib/calculateUnitEconomics';
import { commissionTariffs } from '../../config/tariffRegistry';
import { calculatePriceScenario, findMaximumInRange, findPriceForTarget, getPriceRange } from './calc';
import { defaultInput } from './defaults';

describe('цена под маржу', () => {
  it.each(['fbo', 'fbs'] as const)('%s: достигает маржи 20%% с точностью 0,2 п.п.', (model) => {
    const solution = findPriceForTarget(defaultInput, { kind: 'marginPercent', value: 20 }, model);
    expect(solution).not.toBeNull();
    const result = calculateUnitEconomics({ ...defaultInput, salePrice: solution!.price }, model, 'subject-simple');
    expect(Math.abs(result.margin! - 20)).toBeLessThanOrEqual(0.2);
    expect(result).toEqual(solution!.result);
    expect(calculatePriceScenario(defaultInput, solution!.price - 1, model).margin).toBeLessThan(20);
    expect(Number.isInteger(solution!.price)).toBe(true);
  });

  it.each(['fbo', 'fbs'] as const)('%s: достигает прибыли 500 ₽ с точностью 2 ₽', (model) => {
    const solution = findPriceForTarget(defaultInput, { kind: 'profitPerUnit', value: 500 }, model);
    expect(solution).not.toBeNull();
    const result = calculateUnitEconomics({ ...defaultInput, salePrice: solution!.price }, model, 'subject-simple');
    expect(Math.abs(result.profit - 500)).toBeLessThanOrEqual(2);
    expect(calculatePriceScenario(defaultInput, solution!.price - 1, model).profit).toBeLessThan(500);
  });

  it('возвращает null при себестоимости 10 000 ₽ и марже 95%', () => {
    const input = { ...defaultInput, costPrice: 10_000 };
    expect(findPriceForTarget(input, { kind: 'marginPercent', value: 95 }, 'fbo')).toBeNull();
    const maximum = findMaximumInRange(input, { kind: 'marginPercent', value: 95 }, 'fbo');
    expect(maximum!.price).toBe(500_000);
    expect(maximum!.result.margin).toBeLessThan(95);
  });

  it('соблюдает обе границы и возвращает нижнюю, если цель уже достигнута', () => {
    expect(getPriceRange(defaultInput)).toEqual({ min: 900, max: 45_000 });
    expect(getPriceRange({ ...defaultInput, costPrice: 30_000 })).toEqual({ min: 30_000, max: 1_000_000 });
    const input = { ...defaultInput, platformDiscountRatePercent: 90, includeAds: false, includeTaxes: false };
    expect(findPriceForTarget(input, { kind: 'profitPerUnit', value: 0 }, 'fbo')!.price).toBe(input.costPrice);
    const atLimit = calculatePriceScenario(defaultInput, 45_000, 'fbo');
    expect(findPriceForTarget(defaultInput, { kind: 'profitPerUnit', value: atLimit.profit }, 'fbo')!.price).toBe(45_000);
    expect(findPriceForTarget(defaultInput, { kind: 'profitPerUnit', value: atLimit.profit + 1 }, 'fbo')).toBeNull();
  });

  it.each([0, -1, NaN, Infinity, 1_000_001])('отклоняет некорректную себестоимость %s', (costPrice) => {
    expect(findPriceForTarget({ ...defaultInput, costPrice }, { kind: 'marginPercent', value: 20 }, 'fbo')).toBeNull();
  });
  it.each([-1, NaN, Infinity])('отклоняет некорректную цель %s', (value) => {
    expect(findPriceForTarget(defaultInput, { kind: 'marginPercent', value }, 'fbo')).toBeNull();
  });

  it('использует комиссию выбранного предмета, сохраняя простой и расширенный режимы WB', () => {
    const different = commissionTariffs.find((tariff) => tariff.fboCommissionRate !== commissionTariffs[0].fboCommissionRate)!;
    const input = { ...defaultInput, commissionTariffId: different.id };
    expect(calculatePriceScenario(input, 2500, 'fbo').commission).not.toBe(calculatePriceScenario(defaultInput, 2500, 'fbo').commission);
    expect(calculateUnitEconomics(input, 'fbo', false)).toEqual(calculateUnitEconomics(defaultInput, 'fbo', false));
    const comparable = { ...defaultInput, manualLocalOrderShare: 70, manualFulfillmentCost: 0 };
    expect(calculatePriceScenario(comparable, 2500, 'fbo')).toEqual(calculateUnitEconomics(comparable, 'fbo', true));
  });

  it('учитывает переключатели рекламы и налогов, в том числе минимальный налог УСН15', () => {
    const input = { ...defaultInput, includeAds: false, includeTaxes: false, taxMode: 'usn15' as const };
    const off = findPriceForTarget(input, { kind: 'profitPerUnit', value: 500 }, 'fbo')!;
    expect(off.result.adCost).toBe(0);
    expect(off.result.tax).toBe(0);
    const on = findPriceForTarget({ ...input, includeTaxes: true, taxRate: 15 }, { kind: 'profitPerUnit', value: 500 }, 'fbo')!;
    expect(on.result.tax).toBeGreaterThan(0);
    expect(on.price).toBeGreaterThan(off.price);
    expect(Math.abs(on.result.profit - 500)).toBeLessThanOrEqual(2);
  });

  it('не меняет исходные данные и возвращает согласованную сумму расходов', () => {
    const input = Object.freeze({ ...defaultInput });
    const result = findPriceForTarget(input, { kind: 'marginPercent', value: 20 }, 'fbo')!.result;
    expect(result.totalExpenses + result.profit).toBeCloseTo(result.salePrice);
    expect(input.salePrice).toBe(defaultInput.salePrice);
    expect(calculatePriceScenario(input, result.salePrice * 0.9, 'fbo').profit).toBeLessThan(result.profit);
  });
});
