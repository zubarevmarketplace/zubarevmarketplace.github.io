import rawCommissionTariffs from '../../calculator/data/commissionTariffs.json';
import { categories } from '../config/categories';
import { geoPresets } from '../config/geoPresets';
import { defaults, palletConfig } from '../config/tariffs';
import { warehouseTariffs } from '../../calculator/config/warehouseTariffs';
import type {
  CalculationContext,
  CalculatorInput,
  CommissionBreakdown,
  LogisticsBreakdown,
  ResultMode,
  TaxMode,
  UnitEconomicsResult,
} from '../types/calculator';

type CommissionTariff = {
  id: string;
  category: string;
  subject: string;
  fboCommissionRate: number;
  fbsCommissionRate: number;
};

const commissionTariffs = rawCommissionTariffs as CommissionTariff[];
const defaultCommissionTariff = commissionTariffs[0];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

export const calculateVolumeLiters = (lengthCm: number, widthCm: number, heightCm: number) =>
  (lengthCm * widthCm * heightCm) / 1000;

export function calculateBaseLogistics(volumeLiters: number) {
  if (volumeLiters > 0 && volumeLiters <= 0.2) return volumeLiters * 23;
  if (volumeLiters <= 0.4) return volumeLiters * 26;
  if (volumeLiters <= 0.6) return volumeLiters * 29;
  if (volumeLiters <= 0.8) return volumeLiters * 30;
  if (volumeLiters <= 1) return volumeLiters * 32;
  return 46 + (volumeLiters - 1) * 14;
}

export function calculatePalletCapacity(length: number, width: number, height: number) {
  const variant1 =
    Math.floor(palletConfig.lengthCm / length) * Math.floor(palletConfig.widthCm / width);
  const variant2 =
    Math.floor(palletConfig.lengthCm / width) * Math.floor(palletConfig.widthCm / length);
  const itemsPerLayer = Math.max(variant1, variant2);
  const layers = Math.floor(palletConfig.maxHeightCm / height);
  return Math.max(1, itemsPerLayer * layers);
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

  const groupLogistics = {
    kolPodolskMin: Math.min(warehouseTariffs.koledino.logistics, warehouseTariffs.podolsk.logistics),
    krasnodarNevinnomysskMin: Math.min(
      warehouseTariffs.krasnodar.logistics,
      warehouseTariffs.nevinnomyssk.logistics,
    ),
  };
  const groupStorage = {
    kolPodolskMin: Math.min(warehouseTariffs.koledino.storage, warehouseTariffs.podolsk.storage),
    krasnodarNevinnomysskMin: Math.min(
      warehouseTariffs.krasnodar.storage,
      warehouseTariffs.nevinnomyssk.storage,
    ),
  };

  const geoWarehouseCoefficient = preset.warehouseWeights.reduce((sum, item) => {
    if (item.group) return sum + item.weight * groupLogistics[item.group];
    if (item.warehouse) return sum + item.weight * warehouseTariffs[item.warehouse].logistics;
    return sum;
  }, 0);
  const geoStorageCoefficient = preset.warehouseWeights.reduce((sum, item) => {
    if (item.group) return sum + item.weight * groupStorage[item.group];
    if (item.warehouse) return sum + item.weight * warehouseTariffs[item.warehouse].storage;
    return sum;
  }, 0);

  const deliveryToWbPerUnit = isAdvanced
    ? clamp(input.manualDeliveryToWbPerUnit, 0, 100000)
    : input.includeDeliveryToWb
      ? preset.deliveryPalletCost / itemsPerPallet
      : 0;

  return { volumeLiters, baseLogistics, itemsPerPallet, geoWarehouseCoefficient, geoStorageCoefficient, deliveryToWbPerUnit };
}

function calculateCommissionAndAcquiring(
  buyerPrice: number,
  priceBeforeWbDiscount: number,
  platformDiscountAmount: number,
  commissionRatePercent: number,
): { total: number; breakdown: CommissionBreakdown } {
  const grossWbCommission = priceBeforeWbDiscount * (commissionRatePercent / 100);
  const netWbCommission = grossWbCommission - platformDiscountAmount;
  const acquiringCost = buyerPrice * (defaults.acquiringRatePercent / 100);
  return {
    total: netWbCommission + acquiringCost,
    breakdown: { grossWbCommission, platformDiscountAmount, netWbCommission, acquiringCost },
  };
}

function calculateReverseLogistics(volumeLiters: number, buyoutRatePercent: number) {
  const reverseLogisticsBase = 46 + Math.max(0, volumeLiters - 1) * 14;
  const buyout = clamp(buyoutRatePercent, 1, 100) / 100;
  const nonBuyout = 1 - buyout;
  const reverseLogisticsPerSoldUnit = reverseLogisticsBase * (nonBuyout / buyout);
  return { reverseLogisticsBase, reverseLogisticsPerSoldUnit };
}

function calculateTax(taxMode: TaxMode, taxRate: number, buyerPrice: number, taxableProfit: number) {
  const rate = clamp(taxRate, 0, 100) / 100;
  if (taxMode === 'usn6') return buyerPrice * rate;
  return Math.max(taxableProfit * rate, buyerPrice * 0.01);
}

export function calculateUnitEconomics(
  input: CalculatorInput,
  model: ResultMode,
  isAdvanced: boolean,
): UnitEconomicsResult {
  const simpleCategory = categories.find((c) => c.id === input.categoryId) ?? categories[0];
  const selectedCommissionTariff =
    commissionTariffs.find((t: CommissionTariff) => t.id === input.commissionTariffId) ?? defaultCommissionTariff;

  const buyerPrice = clamp(input.salePrice, 1, 1_000_000);
  const platformDiscountRatePercent = clamp(input.platformDiscountRatePercent, 0, 95);
  const priceBeforeWbDiscount = buyerPrice / (1 - platformDiscountRatePercent / 100);
  const platformDiscountAmount = priceBeforeWbDiscount - buyerPrice;
  const costPrice = clamp(input.costPrice, 0, 1_000_000);
  const context = getCalculationContext(input, isAdvanced);

  const buyoutRatePercent = isAdvanced ? clamp(input.manualBuyoutRate, 1, 100) : clamp(simpleCategory.buyoutRate * 100, 1, 100);
  const drrPercent = isAdvanced ? clamp(input.adRate, 0, 100) : input.includeAds ? clamp(input.adRate, 0, 100) : 0;
  const adCost = priceBeforeWbDiscount * (drrPercent / 100);

  const fboCommissionRate = isAdvanced ? selectedCommissionTariff.fboCommissionRate : simpleCategory.fboCommissionRate;
  const fbsCommissionRate = isAdvanced ? selectedCommissionTariff.fbsCommissionRate : simpleCategory.fbsCommissionRate;
  const commissionRatePercent = model === 'fbo' ? fboCommissionRate : fbsCommissionRate;

  const commissionData = calculateCommissionAndAcquiring(
    buyerPrice,
    priceBeforeWbDiscount,
    platformDiscountAmount,
    commissionRatePercent,
  );
  const commission = commissionData.total;

  const localizationPercent = isAdvanced
    ? clamp(input.manualLocalOrderShare, 0, 100)
    : clamp(geoPresets[input.geoPresetId].localOrderShare * 100, 0, 100);
  const localizationPenalty = (100 - localizationPercent) / 100;
  const localizationIndexMultiplier = 1 + localizationPenalty * defaults.maxLocalizationLogisticsMarkup;
  const salesDistributionIndexRate = localizationPenalty * defaults.maxSalesDistributionIndexRate;

  const warehouseCoefficientExtra =
    model === 'fbo' ? context.baseLogistics * context.geoWarehouseCoefficient - context.baseLogistics : 0;
  const warehouseLogistics = model === 'fbo' ? context.baseLogistics * context.geoWarehouseCoefficient : context.baseLogistics;
  const localizationExtra = model === 'fbo' ? warehouseLogistics * (localizationIndexMultiplier - 1) : 0;
  const salesDistributionCost = model === 'fbo' ? priceBeforeWbDiscount * salesDistributionIndexRate : 0;
  const forwardLogistics =
    model === 'fbo' ? warehouseLogistics + localizationExtra + salesDistributionCost : context.baseLogistics;

  const rev = calculateReverseLogistics(context.volumeLiters, buyoutRatePercent);
  const logistics = forwardLogistics + rev.reverseLogisticsPerSoldUnit;

  const storageDays = clamp(isAdvanced ? input.manualStorageDays : defaults.storageDays, 0, 365);
  const storage =
    model === 'fbo' ? context.volumeLiters * 0.08 * context.geoStorageCoefficient * storageDays : 0;
  const processing = model === 'fbs' ? defaults.fbsProcessingCost : 0;
  const fulfillment = isAdvanced
    ? clamp(input.manualFulfillmentCost, 0, 100000)
    : input.includeFulfillment
      ? clamp(defaults.fulfillmentCost, 0, 100000)
      : 0;
  const deliveryToWb = context.deliveryToWbPerUnit;
  const packaging = clamp(isAdvanced ? input.packagingCost : 0, 0, 100000);
  const otherCosts = clamp(isAdvanced ? input.otherCosts : 0, 0, 100000);

  const profitBeforeTax =
    buyerPrice -
    costPrice -
    commission -
    logistics -
    storage -
    processing -
    adCost -
    deliveryToWb -
    fulfillment -
    packaging -
    otherCosts;

  const tax =
    isAdvanced || input.includeTaxes
      ? calculateTax(input.taxMode, input.taxRate, buyerPrice, profitBeforeTax)
      : 0;

  const profit = profitBeforeTax - tax;
  const margin = buyerPrice > 0 ? (profit / buyerPrice) * 100 : null;
  const roi = costPrice > 0 ? (profit / costPrice) * 100 : null;
  const totalExpenses =
    costPrice + commission + logistics + storage + processing + adCost + deliveryToWb + fulfillment + packaging + otherCosts + tax;

  const logisticsBreakdown: LogisticsBreakdown = {
    baseLogistics: context.baseLogistics,
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
