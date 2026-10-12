import { commissionTariffs, tariffRegistry } from '../../config/tariffRegistry';
import type { CalculatorInput } from '../../types/calculator';

export const defaultInput: CalculatorInput = {
  categoryId: 'home', commissionTariffId: commissionTariffs[0].id,
  salePrice: 2500, costPrice: 900, lengthCm: 30, widthCm: 20, heightCm: 10, weightKg: 1,
  geoPresetId: 'allRussia', platformDiscountRatePercent: tariffRegistry.wb.defaults.simplePlatformDiscountRate,
  includeAds: true, adRate: 10, includeTaxes: true, taxMode: 'usn6', taxRate: 6,
  includeFulfillment: false, includeDeliveryToWb: false, manualBuyoutRate: 90,
  manualLocalOrderShare: 70, manualStorageDays: tariffRegistry.wb.defaults.storageDays,
  manualDeliveryToWbPerUnit: 0, packagingCost: 0, manualFulfillmentCost: 0, otherCosts: 0,
};
