import { describe, expect, it } from 'vitest';
import commissionTariffs from '../../calculator/data/commissionTariffs.json';
import tariffMeta from '../../calculator/data/tariffMeta.json';
import { warehouseTariffs } from '../../calculator/config/warehouseTariffs';
import { defaults, palletConfig } from './tariffs';
import { geoPresets } from './geoPresets';
import { findCommission, formatTariffDate, listCategories, tariffRegistry } from './tariffRegistry';
import { tariffMeta as sharedMeta, formatTariffDate as formatSharedDate } from './tariffMeta';

describe('единый справочник тарифов WB', () => {
  it('находит запись по id и возвращает undefined для неизвестного id', () => {
    const tariff = tariffRegistry.wb.commissions[0];
    expect(tariff).toBeDefined();
    expect(findCommission(tariff.id)).toBe(tariff);
    expect(findCommission('unknown-tariff-id')).toBeUndefined();
    expect(findCommission('')).toBeUndefined();
  });

  it('форматирует дату по-русски без суффикса года', () => {
    expect(formatTariffDate('2026-10-13')).toBe('13 октября 2026');
    expect(formatTariffDate('2026-01-01')).toBe('1 января 2026');
    expect(formatTariffDate()).toBe(formatTariffDate(tariffMeta.updatedAt));
  });

  it('использует общие метаданные и сохраняет совместимость импортов', () => {
    expect(tariffRegistry.meta).toBe(sharedMeta);
    expect(formatTariffDate).toBe(formatSharedDate);
    expect(tariffRegistry.meta.updatedAt).toBe(tariffMeta.updatedAt);
    expect(tariffRegistry.meta.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tariffRegistry.wb.commissions).toBe(commissionTariffs);
    expect(tariffRegistry.wb.warehouses).toBe(warehouseTariffs);
    expect(tariffRegistry.wb.defaults).toBe(defaults);
    expect(tariffRegistry.wb.pallet).toBe(palletConfig);
    expect(tariffRegistry.wb.geoPresets).toBe(geoPresets);
  });

  it('выдаёт отсортированные категории без повторов', () => {
    const categories = listCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toEqual([...new Set(commissionTariffs.map((tariff) => tariff.category))]
      .sort((left, right) => left.localeCompare(right, 'ru')));
  });

  it('содержит только конечные комиссии FBO и FBS от 0 до 100 процентов', () => {
    expect(tariffRegistry.wb.commissions.length).toBeGreaterThan(0);
    for (const tariff of tariffRegistry.wb.commissions) {
      for (const rate of [tariff.fboCommissionRate, tariff.fbsCommissionRate]) {
        expect(Number.isFinite(rate), tariff.id).toBe(true);
        expect(rate, tariff.id).toBeGreaterThanOrEqual(0);
        expect(rate, tariff.id).toBeLessThanOrEqual(100);
      }
    }
  });
});
