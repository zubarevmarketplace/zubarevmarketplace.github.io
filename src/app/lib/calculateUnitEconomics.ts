import { categories } from "../config/categories";
import { geoPresets } from "../config/geoPresets";
import {
  defaults,
  palletConfig,
  warehouseCoefficients,
} from "../config/tariffs";
import type {
  CalculationContext,
  CalculatorInput,
  ResultMode,
  TaxMode,
  UnitEconomicsResult,
} from "../types/calculator";

const clampNonNegative = (v: number) =>
  Number.isFinite(v) ? Math.max(0, v) : 0;

export function getCalculationContext(
  input: CalculatorInput,
  isAdvanced: boolean,
): CalculationContext {
  const volumeLiters = (input.lengthCm * input.widthCm * input.heightCm) / 1000;
  const baseLogistics = volumeLiters <= 1 ? 46 : 46 + (volumeLiters - 1) * 14;

  const variant1 =
    Math.floor(palletConfig.lengthCm / input.lengthCm) *
    Math.floor(palletConfig.widthCm / input.widthCm);
  const variant2 =
    Math.floor(palletConfig.lengthCm / input.widthCm) *
    Math.floor(palletConfig.widthCm / input.lengthCm);
  const itemsPerLayer = Math.max(variant1, variant2);
  const layers = Math.floor(palletConfig.maxHeightCm / input.heightCm);
  const itemsPerPallet = Math.max(1, itemsPerLayer * layers);

  const preset = geoPresets[input.geoPresetId];
  const groupCoefficients = {
    kolPodolskMin: Math.min(
      warehouseCoefficients.koledino,
      warehouseCoefficients.podolsk,
    ),
    krasnodarNevinnomysskMin: Math.min(
      warehouseCoefficients.krasnodar,
      warehouseCoefficients.nevinnomyssk,
    ),
  };

  const geoWarehouseCoefficient = preset.warehouseWeights.reduce(
    (sum, item) => {
      if (item.group) return sum + item.weight * groupCoefficients[item.group];
      if (item.warehouse)
        return sum + item.weight * warehouseCoefficients[item.warehouse];
      return sum;
    },
    0,
  );

  const deliveryToWbPerUnit = isAdvanced
    ? input.manualDeliveryToWbPerUnit
    : input.includeDeliveryToWb
      ? preset.deliveryPalletCost / itemsPerPallet
      : 0;

  return {
    volumeLiters: Number(volumeLiters.toFixed(2)),
    baseLogistics: Number(baseLogistics.toFixed(2)),
    itemsPerPallet,
    geoWarehouseCoefficient: Number(geoWarehouseCoefficient.toFixed(2)),
    deliveryToWbPerUnit: Number(deliveryToWbPerUnit.toFixed(2)),
  };
}

function calculateTax(
  taxMode: TaxMode,
  salePrice: number,
  profitBeforeTax: number,
  customTaxRate: number,
) {
  if (taxMode === "usn6") return salePrice * 0.06;
  if (taxMode === "custom") return salePrice * customTaxRate;
  return Math.max(profitBeforeTax * 0.15, salePrice * 0.01);
}

export function calculateUnitEconomics(
  input: CalculatorInput,
  model: ResultMode,
  isAdvanced: boolean,
): UnitEconomicsResult {
  const category =
    categories.find((c) => c.id === input.categoryId) ?? categories[0];
  const context = getCalculationContext(input, isAdvanced);

  const commissionRate = isAdvanced ? input.manualKvv : category.kvv;
  const adRate = input.includeAds ? input.adRate : 0;

  const commission = input.salePrice * commissionRate;
  const logistics =
    model === "fbo"
      ? context.baseLogistics * context.geoWarehouseCoefficient
      : context.baseLogistics;

  const storageDays = isAdvanced
    ? input.manualStorageDays
    : defaults.storageDays;
  const storage =
    model === "fbo"
      ? context.volumeLiters *
        0.08 *
        context.geoWarehouseCoefficient *
        storageDays
      : 0;
  const processing = model === "fbs" ? defaults.fbsProcessingCost : 0;
  const adCost = input.salePrice * adRate;
  const fulfillment = input.includeFulfillment
    ? isAdvanced
      ? input.manualFulfillmentCost
      : defaults.fulfillmentCost
    : 0;
  const deliveryToWb = context.deliveryToWbPerUnit;
  const packaging = isAdvanced ? input.packagingCost : 0;
  const otherCosts = isAdvanced ? input.otherCosts : 0;

  const profitBeforeTax =
    input.salePrice -
    input.costPrice -
    commission -
    logistics -
    storage -
    processing -
    adCost -
    fulfillment -
    deliveryToWb -
    packaging -
    otherCosts;
  const tax = input.includeTaxes
    ? calculateTax(
        input.taxMode,
        input.salePrice,
        profitBeforeTax,
        input.customTaxRate,
      )
    : 0;
  const profit = profitBeforeTax - tax;
  const margin = input.salePrice > 0 ? (profit / input.salePrice) * 100 : 0;
  const roi = input.costPrice > 0 ? (profit / input.costPrice) * 100 : null;

  const variableWithoutTax =
    input.costPrice +
    commission +
    logistics +
    storage +
    processing +
    adCost +
    fulfillment +
    deliveryToWb +
    packaging +
    otherCosts;
  const breakEvenPrice =
    input.includeTaxes &&
    (input.taxMode === "usn6" || input.taxMode === "custom")
      ? variableWithoutTax /
        (1 - (input.taxMode === "custom" ? input.customTaxRate : 0.06))
      : variableWithoutTax;

  return {
    model,
    salePrice: clampNonNegative(input.salePrice),
    costPrice: clampNonNegative(input.costPrice),
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
    breakEvenPrice,
  };
}
