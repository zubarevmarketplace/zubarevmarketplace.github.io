import { describe, expect, it } from 'vitest';
import { calculateUnitEconomics } from '../../lib/calculateUnitEconomics';
import { commissionTariffs } from '../../config/tariffRegistry';
import { defaultInput } from '../price-for-margin/defaults';
import { evaluatePromo, findBreakEvenPrice } from './calc';

const input = { ...defaultInput, monthlySales: 100 };

describe('безубыток и акции WB', () => {
  for (const model of ['fbo', 'fbs'] as const) {
    it.each(['usn6', 'usn15'] as const)(model + ': находит минимальную цену после налога %s', (taxMode) => {
      const scenario = { ...input, taxMode, taxRate: taxMode === 'usn6' ? 6 : 15 };
      const { breakEven } = findBreakEvenPrice(scenario, model);
      expect(breakEven).not.toBeNull();
      const result = calculateUnitEconomics({ ...scenario, salePrice: breakEven!.price }, model, 'subject-simple');
      expect(result.profit).toBeGreaterThanOrEqual(0);
      expect(Math.abs(result.profit)).toBeLessThanOrEqual(5);
      expect(Number.isInteger(breakEven!.price)).toBe(true);
      expect(calculateUnitEconomics({ ...scenario, salePrice: breakEven!.price - 1 }, model, 'subject-simple').profit).toBeLessThan(0);
    });
    it(model + ': скидка 0% сохраняет прибыль и даёт ok', () => {
      const result = evaluatePromo(input, model, 2500, 0, 30)!;
      expect(result.recommendation).toBe('ok');
      expect(result.promoProfit).toBe(result.currentProfit);
      expect(result.currentMonthlyProfit).toBe(result.currentProfit * 100);
      expect(result.promoMonthlyProfit).toBe(result.promoProfit * 130);
      expect(evaluatePromo(input, model, 2500, 0, 0)!.promoMonthlyProfit).toBe(result.currentMonthlyProfit);
    });
    it(model + ': цена акции ниже безубытка даёт loss даже при большом росте', () => {
      const { breakEven } = findBreakEvenPrice(input, model);
      const currentPrice = breakEven!.price * 1.5;
      const result = evaluatePromo(input, model, currentPrice, 50, 300)!;
      expect(result.currentProfit).toBeGreaterThan(0);
      expect(result.promoPrice).toBeLessThan(breakEven!.price);
      expect(result.promoProfit).toBeLessThan(0);
      expect(result.recommendation).toBe('loss');
    });
    it(model + ': положительная прибыль без достаточного роста даёт risky, рост компенсирует скидку', () => {
      const result = evaluatePromo(input, model, 2500, 10, 0)!;
      expect(result.promoProfit).toBeGreaterThan(0);
      expect(result.promoMonthlyProfit).toBeLessThan(result.currentMonthlyProfit);
      expect(result.recommendation).toBe('risky');
      expect(evaluatePromo(input, model, 2500, 10, 100)!.recommendation).toBe('ok');
    });
  }

  it('находит цену целевой прибыли и запас относительно текущей цены', () => {
    const result = findBreakEvenPrice({ ...input, minimumProfit: 500 }, 'fbo');
    expect(result.target!.price).toBeGreaterThan(result.breakEven!.price);
    expect(result.target!.result.profit).toBeGreaterThanOrEqual(500);
    expect(result.target!.result.profit).toBeLessThan(505);
    expect(result.priceBuffer).toBe(input.salePrice - result.breakEven!.price);
    expect(result.priceBufferPercent).toBe(result.priceBuffer! / input.salePrice * 100);
    expect(findBreakEvenPrice(input, 'fbo').target).toBeNull();
    expect(findBreakEvenPrice({ ...input, minimumProfit: 0 }, 'fbo').target).toEqual(result.breakEven);
  });

  it('ищет ниже себестоимости при компенсации СПП', () => {
    const lowCommission = commissionTariffs.reduce((best, item) => item.fboCommissionRate < best.fboCommissionRate ? item : best);
    const scenario = { ...input, commissionTariffId: lowCommission.id, platformDiscountRatePercent: 70, includeAds: false,
      lengthCm: 1, widthCm: 1, heightCm: 1 };
    const { breakEven } = findBreakEvenPrice(scenario, 'fbo');
    expect(breakEven!.price).toBeLessThan(scenario.costPrice);
    expect(breakEven!.result.profit).toBeGreaterThanOrEqual(0);
    expect(calculateUnitEconomics({ ...scenario, salePrice: breakEven!.price - 1 }, 'fbo', 'subject-simple').profit).toBeLessThan(0);
  });

  it('отделяет недостижимую цель от недостижимого безубытка', () => {
    const result = findBreakEvenPrice({ ...input, minimumProfit: 10_000_000 }, 'fbo');
    expect(result.breakEven).not.toBeNull();
    expect(result.target).toBeNull();
    const impossible = findBreakEvenPrice({ ...input, adRate: 100 }, 'fbo');
    expect(impossible.breakEven).toBeNull();
    expect(impossible.priceBuffer).toBeNull();
  });

  it('сохраняет отрицательный запас и нулевые продажи', () => {
    const { breakEven } = findBreakEvenPrice(input, 'fbo');
    expect(findBreakEvenPrice({ ...input, salePrice: breakEven!.price - 100 }, 'fbo').priceBuffer).toBe(-100);
    const result = evaluatePromo({ ...input, monthlySales: 0 }, 'fbo', 2500, 0, 0)!;
    expect(result.currentMonthlyProfit).toBe(0);
    expect(result.promoMonthlyProfit).toBe(0);
  });

  it('отклоняет недопустимые данные и цены вместо скрытого ограничения модели', () => {
    expect(findBreakEvenPrice({ ...input, costPrice: NaN }, 'fbo').breakEven).toBeNull();
    expect(evaluatePromo(input, 'fbo', 2500, -1, 30)).toBeNull();
    expect(evaluatePromo(input, 'fbo', 2500, 100, 30)).toBeNull();
    expect(evaluatePromo(input, 'fbo', 2500, 15, -1)).toBeNull();
    expect(evaluatePromo(input, 'fbo', Infinity, 15, 30)).toBeNull();
    expect(evaluatePromo({ ...input, monthlySales: 1.5 }, 'fbo', 2500, 15, 30)).toBeNull();
    expect(evaluatePromo(input, 'fbo', 1, 50, 30)).toBeNull();
  });
});
