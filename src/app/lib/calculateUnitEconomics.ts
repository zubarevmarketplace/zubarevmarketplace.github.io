import { categories } from '../config/categories';
import { geoPresets } from '../config/geoPresets';
import { defaults, palletConfig, warehouseTariffs } from '../config/tariffs';
import type { CalculationContext, CalculatorInput, CommissionBreakdown, LogisticsBreakdown, ResultMode, TaxMode, UnitEconomicsResult } from '../types/calculator';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

export const calculateVolumeLiters = (lengthCm: number, widthCm: number, heightCm: number) => (lengthCm * widthCm * heightCm) / 1000;

export function calculateBaseLogistics(volumeLiters: number) {
  if (volumeLiters > 0 && volumeLiters <= 0.2) return volumeLiters * 23;
  if (volumeLiters <= 0.4) return volumeLiters * 26;
  if (volumeLiters <= 0.6) return volumeLiters * 29;
  if (volumeLiters <= 0.8) return volumeLiters * 30;
  if (volumeLiters <= 1) return volumeLiters * 32;
  return 46 + (volumeLiters - 1) * 14;
}

export function calculatePalletCapacity(length: number, width: number, height: number) {
  const variant1 = Math.floor(palletConfig.lengthCm / length) * Math.floor(palletConfig.widthCm / width);
  const variant2 = Math.floor(palletConfig.lengthCm / width) * Math.floor(palletConfig.widthCm / length);
  return Math.max(1, Math.max(variant1, variant2) * Math.floor(palletConfig.maxHeightCm / height));
}

export function detectCargoType(lengthCm: number, widthCm: number, heightCm: number, weightKg: number) {
  const maxSideCm = Math.max(lengthCm, widthCm, heightCm);
  const sumSidesCm = lengthCm + widthCm + heightCm;
  return weightKg >= 25 || maxSideCm > 200 || sumSidesCm > 280;
}

export function getCalculationContext(input: CalculatorInput, isAdvanced: boolean): CalculationContext {
  const length = clamp(input.lengthCm, 0.1, 300);
  const width = clamp(input.widthCm, 0.1, 300);
  const height = clamp(input.heightCm, 0.1, 300);
  const volumeLiters = calculateVolumeLiters(length, width, height);
  const baseLogistics = calculateBaseLogistics(volumeLiters);
  const itemsPerPallet = calculatePalletCapacity(length, width, height);
  const preset = geoPresets[input.geoPresetId];
  const groupLogistics = { kolPodolskMin: Math.min(warehouseTariffs.koledino.logistics, warehouseTariffs.podolsk.logistics), krasnodarNevinnomysskMin: Math.min(warehouseTariffs.krasnodar.logistics, warehouseTariffs.nevinnomyssk.logistics) };
  const groupStorage = { kolPodolskMin: Math.min(warehouseTariffs.koledino.storage, warehouseTariffs.podolsk.storage), krasnodarNevinnomysskMin: Math.min(warehouseTariffs.krasnodar.storage, warehouseTariffs.nevinnomyssk.storage) };
  const geoWarehouseCoefficient = preset.warehouseWeights.reduce((sum, item) => sum + item.weight * (item.group ? groupLogistics[item.group] : item.warehouse ? warehouseTariffs[item.warehouse].logistics : 0), 0);
  const geoStorageCoefficient = preset.warehouseWeights.reduce((sum, item) => sum + item.weight * (item.group ? groupStorage[item.group] : item.warehouse ? warehouseTariffs[item.warehouse].storage : 0), 0);
  const deliveryToWbPerUnit = isAdvanced ? clamp(input.manualDeliveryToWbPerUnit, 0, 100000) : input.includeDeliveryToWb ? preset.deliveryPalletCost / itemsPerPallet : 0;
  return { volumeLiters: Number(volumeLiters.toFixed(2)), baseLogistics: Number(baseLogistics.toFixed(2)), itemsPerPallet, geoWarehouseCoefficient: Number(geoWarehouseCoefficient.toFixed(2)), geoStorageCoefficient: Number(geoStorageCoefficient.toFixed(2)), deliveryToWbPerUnit: Number(deliveryToWbPerUnit.toFixed(2)) } as any;
}

function calculateCommissionAndAcquiring(buyerPrice: number, priceBeforeWbDiscount: number, platformDiscountAmount: number, commissionRatePercent: number): { total: number; breakdown: CommissionBreakdown } {
  const grossWbCommission = priceBeforeWbDiscount * (commissionRatePercent / 100);
  const netWbCommission = grossWbCommission - platformDiscountAmount;
  const acquiringCost = buyerPrice * (defaults.acquiringRatePercent / 100);
  return { total: netWbCommission + acquiringCost, breakdown: { grossWbCommission, platformDiscountAmount, netWbCommission, acquiringCost } };
}

function calculateReverseLogistics(volumeLiters: number, buyoutRatePercent: number) {
  const reverseLogisticsBase = 46 + Math.max(0, volumeLiters - 1) * 14;
  const buyout = clamp(buyoutRatePercent, 0, 100) / 100;
  const nonBuyout = 1 - buyout;
  const reverseLogisticsPerSoldUnit = buyout > 0 ? reverseLogisticsBase * (nonBuyout / buyout) : 0;
  return { reverseLogisticsBase, reverseLogisticsPerSoldUnit };
}

function calculateTax(taxMode: TaxMode, taxRate: number, buyerPrice: number, taxableProfit: number) {
  const rate = clamp(taxRate, 0, 100) / 100;
  if (taxMode === 'usn6') return buyerPrice * rate;
  return Math.max(taxableProfit * rate, buyerPrice * 0.01);
}

export function calculateUnitEconomics(input: CalculatorInput, model: ResultMode, isAdvanced: boolean): UnitEconomicsResult {
  const category = categories.find((c) => c.id === input.categoryId) ?? categories[0];
  const buyerPrice = clamp(input.salePrice, 1, 1_000_000);
  const platformDiscountRatePercent = clamp(input.platformDiscountRatePercent, 0, 95);
  const priceBeforeWbDiscount = buyerPrice / (1 - platformDiscountRatePercent / 100);
  const platformDiscountAmount = priceBeforeWbDiscount - buyerPrice;
  const costPrice = clamp(input.costPrice, 0, 1_000_000);
  const context = getCalculationContext(input, isAdvanced);

  const buyoutRatePercent = isAdvanced ? clamp(input.manualBuyoutRate, 0, 100) : category.buyoutRate * 100;
  const drrPercent = isAdvanced ? clamp(input.adRate, 0, 100) : (input.includeAds ? clamp(input.adRate * 100, 0, 100) : 0);
  const fboCommissionRate = isAdvanced ? clamp(input.manualFboCommissionRate, 0, 100) : category.kvv * 100;
  const fbsCommissionRate = isAdvanced ? clamp(input.manualFbsCommissionRate, 0, 100) : category.kvv * 100;
  const commissionRatePercent = model === 'fbo' ? fboCommissionRate : fbsCommissionRate;

  const commissionData = calculateCommissionAndAcquiring(buyerPrice, priceBeforeWbDiscount, platformDiscountAmount, commissionRatePercent);
  const commission = commissionData.total;

  const localizationIndexMultiplier = 1;
  const salesDistributionIndexRate = 0;

  const forwardLogisticsBase = context.baseLogistics;
  const warehouseCoefficientExtra = model === 'fbo' ? context.baseLogistics * context.geoWarehouseCoefficient - context.baseLogistics : 0;
  const localizationExtra = model === 'fbo' ? context.baseLogistics * context.geoWarehouseCoefficient * (localizationIndexMultiplier - 1) : 0;
  const salesDistributionCost = model === 'fbo' ? priceBeforeWbDiscount * salesDistributionIndexRate : 0;
  const forwardLogistics = model === 'fbo' ? (forwardLogisticsBase + warehouseCoefficientExtra + localizationExtra + salesDistributionCost) : context.baseLogistics;

  const rev = calculateReverseLogistics(context.volumeLiters, buyoutRatePercent);
  const logistics = forwardLogistics + rev.reverseLogisticsPerSoldUnit;

  const storage = model === 'fbo' ? context.volumeLiters * 0.08 * (context as any).geoStorageCoefficient * clamp(isAdvanced ? input.manualStorageDays : defaults.storageDays, 0, 365) : 0;
  const processing = model === 'fbs' ? defaults.fbsProcessingCost : 0;
  const adCost = priceBeforeWbDiscount * (drrPercent / 100);
  const fulfillment = isAdvanced ? clamp(input.manualFulfillmentCost, 0, 100000) : (input.includeFulfillment ? clamp(defaults.fulfillmentCost, 0, 100000) : 0);
  const deliveryToWb = context.deliveryToWbPerUnit;
  const packaging = clamp(isAdvanced ? input.packagingCost : 0, 0, 100000);
  const otherCosts = clamp(isAdvanced ? input.otherCosts : 0, 0, 100000);

  const profitBeforeTax = buyerPrice - costPrice - commission - logistics - storage - processing - adCost - deliveryToWb - fulfillment - packaging - otherCosts;
  const tax = isAdvanced ? calculateTax(input.taxMode, input.taxRate, buyerPrice, profitBeforeTax) : (input.includeTaxes ? calculateTax(input.taxMode, input.taxRate, buyerPrice, profitBeforeTax) : 0);
  const profit = profitBeforeTax - tax;
  const margin = buyerPrice > 0 ? (profit / buyerPrice) * 100 : 0;
  const roi = costPrice > 0 ? (profit / costPrice) * 100 : null;
  const totalExpenses = costPrice + commission + logistics + storage + processing + adCost + deliveryToWb + fulfillment + packaging + otherCosts + tax;

  const logisticsBreakdown: LogisticsBreakdown = {
    baseLogistics: forwardLogisticsBase,
    warehouseCoefficientExtra,
    localizationExtra,
    salesDistributionCost,
    forwardLogistics,
    reverseLogisticsBase: rev.reverseLogisticsBase,
    reverseLogisticsPerSoldUnit: rev.reverseLogisticsPerSoldUnit,
  };

  return {
    model,
    salePrice: buyerPrice,
    priceBeforeWbDiscount,
    platformDiscountAmount,
    costPrice,
    commission,
    logistics,
    storage,
    processing,
    adCost,
    tax,
    fulfillment,
    deliveryToWb,
    packaging,
    otherCosts,
    profitBeforeTax,
    profit,
    margin,
    roi,
    breakEvenPrice: totalExpenses - tax,
    totalExpenses,
    isSgt: detectCargoType(input.lengthCm, input.widthCm, input.heightCm, clamp(input.weightKg, 0, 500)),
    commissionBreakdown: commissionData.breakdown,
    logisticsBreakdown,
  };
}
