import { describe, expect, it } from 'vitest';
import { calcBudget, calcMaxDrr, calcOrdersFromBudget } from './calc';

const funnel = { cpc: 30, ctrPercent: 3, crPercent: 5 };
const input = { ...funnel, targetOrders: 300, price: 2500, marginBeforeAdsPercent: 35 };

describe('ДРР и рекламный бюджет', () => {
  it('оставляет 15% и 375 ₽ на рекламу при марже 35% и цели 20%', () => {
    expect(calcMaxDrr({ price: 2500, marginBeforeAdsPercent: 35, targetMarginPercent: 20 }))
      .toEqual({ maxDrrPercent: 15, adCostPerUnit: 375 });
  });
  it('рассчитывает воронку, CPO, ДРР и ROMI для 300 заказов', () => {
    const result = calcBudget(input)!;
    expect(result).toMatchObject({ impressions: 200000, clicks: 6000, orders: 300, budget: 180000, cpo: 600, drrPercent: 24 });
    expect(result.romiPercent).toBeCloseTo(45.8333333333);
  });
  it('обратный расчёт возвращает ту же воронку и сохраняет дробные заказы', () => {
    expect(calcOrdersFromBudget({ ...funnel, budget: 180000 }))
      .toEqual({ budget: 180000, clicks: 6000, impressions: 200000, orders: 300 });
    const reverse = calcOrdersFromBudget({ ...funnel, budget: 1000 })!;
    expect(reverse.orders).toBeCloseTo(1000 / 30 * 0.05);
    expect(calcBudget({ ...input, targetOrders: reverse.orders })!.budget).toBeCloseTo(1000);
  });
  it.each([0, -1, 101, NaN, Infinity])('не рассчитывает воронку при CR или CTR %s', (value) => {
    for (const key of ['crPercent', 'ctrPercent'] as const) {
      expect(calcBudget({ ...input, [key]: value })).toBeNull();
      expect(calcOrdersFromBudget({ ...funnel, budget: 180000, [key]: value })).toBeNull();
    }
  });
  it('не подменяет недостижимую маржу нулевым рекламным расходом', () => {
    expect(calcMaxDrr({ price: 2500, marginBeforeAdsPercent: 10, targetMarginPercent: 20 })).toBeNull();
    expect(calcMaxDrr({ price: 2500, marginBeforeAdsPercent: 20, targetMarginPercent: 20 }))
      .toEqual({ maxDrrPercent: 0, adCostPerUnit: 0 });
  });
  it('обрабатывает нулевые заказы, бюджет и CPC без деления на ноль', () => {
    expect(calcBudget({ ...input, targetOrders: 0 })).toEqual({ impressions: 0, clicks: 0, orders: 0, budget: 0, cpo: null, drrPercent: null, romiPercent: null });
    expect(calcBudget({ ...input, cpc: 0 })).toMatchObject({ budget: 0, cpo: 0, drrPercent: 0, romiPercent: null });
    expect(calcOrdersFromBudget({ ...funnel, budget: 0 })).toEqual({ impressions: 0, clicks: 0, orders: 0, budget: 0 });
    expect(calcOrdersFromBudget({ ...funnel, budget: 1000, cpc: 0 })).toBeNull();
  });
  it('вычисляет ROMI только при заданной марже и сохраняет убыток', () => {
    const { marginBeforeAdsPercent, ...withoutMargin } = input;
    expect(calcBudget(withoutMargin)!.romiPercent).toBeNull();
    expect(calcBudget({ ...input, marginBeforeAdsPercent: 0 })!.romiPercent).toBe(-100);
    expect(calcBudget({ ...input, marginBeforeAdsPercent: 24 })!.romiPercent).toBe(0);
    expect(calcBudget({ ...input, marginBeforeAdsPercent: 10 })!.romiPercent).toBeLessThan(0);
  });
  it('CTR меняет показы, а CR и CPC меняют стоимость заказа', () => {
    const baseline = calcBudget(input)!;
    expect(calcBudget({ ...input, ctrPercent: 6 })).toMatchObject({ impressions: baseline.impressions / 2, budget: baseline.budget });
    expect(calcBudget({ ...input, crPercent: 10 })!.cpo).toBe(baseline.cpo! / 2);
    expect(calcBudget({ ...input, cpc: 60 })!.cpo).toBe(baseline.cpo! * 2);
  });
  it.each([-1, NaN, Infinity])('отклоняет некорректные числа %s', (value) => {
    for (const key of ['price', 'targetOrders', 'cpc', 'marginBeforeAdsPercent'] as const)
      expect(calcBudget({ ...input, [key]: value })).toBeNull();
    expect(calcOrdersFromBudget({ ...funnel, budget: value })).toBeNull();
    for (const key of ['price', 'marginBeforeAdsPercent', 'targetMarginPercent'] as const)
      expect(calcMaxDrr({ price: 2500, marginBeforeAdsPercent: 35, targetMarginPercent: 20, [key]: value })).toBeNull();
  });
  it('отклоняет нулевую цену, проценты выше 100 и переполнение', () => {
    expect(calcBudget({ ...input, price: 0 })).toBeNull();
    expect(calcBudget({ ...input, marginBeforeAdsPercent: 101 })).toBeNull();
    expect(calcMaxDrr({ price: 0, marginBeforeAdsPercent: 35, targetMarginPercent: 20 })).toBeNull();
    expect(calcMaxDrr({ price: 2500, marginBeforeAdsPercent: 101, targetMarginPercent: 20 })).toBeNull();
    expect(calcBudget({ ...input, targetOrders: Number.MAX_VALUE })).toBeNull();
    expect(calcOrdersFromBudget({ ...funnel, budget: Number.MAX_VALUE, cpc: 0.01 })).toBeNull();
  });
});
