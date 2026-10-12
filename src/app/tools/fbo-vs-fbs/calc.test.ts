import { describe, expect, it } from 'vitest';
import { tariffRegistry } from '../../config/tariffRegistry';
import { calculateUnitEconomics } from '../../lib/calculateUnitEconomics';
import { compareSchemes, compareSalesVolumes, isValidComparisonInput } from './calc';
import { defaultInput } from './defaults';

describe('compareSchemes', () => {
  it('использует общий расширенный расчёт и одинаковую цену и себестоимость', () => {
    const before = structuredClone(defaultInput);
    const result = compareSchemes(defaultInput, 100);
    expect(result.fbo).toEqual(calculateUnitEconomics(defaultInput, 'fbo', true));
    expect(result.fbs).toEqual(calculateUnitEconomics(defaultInput, 'fbs', true));
    expect(result.fbo.salePrice).toBe(result.fbs.salePrice);
    expect(result.fbo.costPrice).toBe(result.fbs.costPrice);
    expect(result.fbo.salePrice).toBe(defaultInput.salePrice);
    expect(result.fbo.costPrice).toBe(defaultInput.costPrice);
    expect(defaultInput).toEqual(before);
  });

  it.each([0, 10, 100, 1000])('разница за месяц при %i продажах равна разнице на единицу × объём', (sales) => {
    const result = compareSchemes(defaultInput, sales);
    expect(result.diffPerUnit).toBe(result.fbo.profit - result.fbs.profit);
    expect(result.diffPerMonth).toBe(result.diffPerUnit * sales);
  });

  it.each([0, 1000])('победитель согласован со знаком разницы при обработке FBS %i ₽', (processing) => {
    const result = compareSchemes({ ...defaultInput, manualProcessingCost: processing }, 100);
    expect(result.winner).toBe(processing === 0 ? 'fbs' : 'fbo');
    expect(result.diffPerUnit > 0).toBe(result.winner === 'fbo');
    expect(result.diffPerUnit < 0).toBe(result.winner === 'fbs');
  });

  it('возвращает equal и все точки равенства, когда прибыль схем совпадает', () => {
    const base = compareSchemes({ ...defaultInput, manualProcessingCost: 0 }, 100);
    const input = { ...defaultInput, manualProcessingCost: -base.diffPerUnit };
    const result = compareSchemes(input, 100);
    expect(result.diffPerUnit).toBe(0);
    expect(result.diffPerMonth).toBe(0);
    expect(result.winner).toBe('equal');
    expect(compareSalesVolumes(input).equalAt).toEqual(Array.from({ length: 100 }, (_, index) => (index + 1) * 10));
  });
  it.each(['usn6', 'usn15'] as const)('статьи расходов объясняют разницу прибыли после налога %s', (taxMode) => {
    const result = compareSchemes({ ...defaultInput, taxMode, taxRate: taxMode === 'usn6' ? 6 : 15,
      packagingCost: 10, manualDeliveryToWbPerUnit: 30, otherCosts: 5 }, 100);
    const saving = result.breakdownDiff.reduce((sum, row) => sum + row.fbs - row.fbo, 0);
    expect(saving).toBeCloseTo(result.diffPerUnit, 8);
    expect(result.breakdownDiff.map((row) => row.label)).toEqual(expect.arrayContaining([
      'Комиссия и эквайринг', 'Логистика', 'Хранение', 'Обработка / фулфилмент',
      'Доставка до WB', 'Прочее (включая упаковку)', 'Налог',
    ]));
  });

  it('обработка применяется только к FBS, а старые вызовы сохраняют тариф по умолчанию', () => {
    const input = { ...defaultInput, manualProcessingCost: undefined };
    const original = compareSchemes(input, 100);
    expect(original.fbs.processing).toBe(tariffRegistry.wb.defaults.fbsProcessingCost);
    const changed = compareSchemes({ ...input, manualProcessingCost: 75 }, 100);
    expect(changed.fbo).toEqual(original.fbo);
    expect(changed.fbs.processing).toBe(75);
    expect(changed.fbs.profit).toBeCloseTo(original.fbs.profit - 75 + original.fbs.processing, 8);
    expect(calculateUnitEconomics({ ...input, manualProcessingCost: 75 }, 'fbs', false).processing)
      .toBe(tariffRegistry.wb.defaults.fbsProcessingCost);
  });

  it.each([-1, 0.5, NaN, Infinity, 1_000_001])('отклоняет некорректный объём %s', (sales) => {
    expect(isValidComparisonInput(defaultInput, sales)).toBe(false);
    expect(() => compareSchemes(defaultInput, sales)).toThrow(RangeError);
  });

  it('не показывает результат для некорректных параметров товара и расходов', () => {
    for (const input of [{ ...defaultInput, salePrice: 0 }, { ...defaultInput, commissionTariffId: 'missing' },
      { ...defaultInput, lengthCm: NaN }, { ...defaultInput, manualStorageDays: 366 },
      { ...defaultInput, manualProcessingCost: -1 }, { ...defaultInput, packagingCost: Infinity }]) {
      expect(isValidComparisonInput(input, 100)).toBe(false);
      expect(() => compareSchemes(input, 100)).toThrow(RangeError);
    }
  });
});

describe('compareSalesVolumes', () => {
  it('перебирает от 10 до 1000 с шагом 10 и не придумывает точку равенства', () => {
    const { scenarios, equalAt } = compareSalesVolumes(defaultInput);
    const result = compareSchemes(defaultInput, 100);
    expect(scenarios).toHaveLength(100);
    expect(scenarios.map((row) => row.monthlySales)).toEqual(Array.from({ length: 100 }, (_, index) => (index + 1) * 10));
    expect(equalAt).toEqual([]);
    for (const row of scenarios) {
      expect(row.fboProfit).toBe(result.fbo.profit * row.monthlySales);
      expect(row.fbsProfit).toBe(result.fbs.profit * row.monthlySales);
      expect(row.diffPerMonth).toBe(result.diffPerUnit * row.monthlySales);
    }
  });
});
