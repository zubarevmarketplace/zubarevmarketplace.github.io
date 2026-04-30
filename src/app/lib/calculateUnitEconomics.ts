import { categories } from '../config/categories';
import { geoPresets } from '../config/geoPresets';
import { defaults, palletConfig, warehouseCoefficients } from '../config/tariffs';
import type { CalculationContext, CalculatorInput, ResultMode, TaxMode, UnitEconomicsResult } from '../types/calculator';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

export function getCalculationContext(input: CalculatorInput, isAdvanced: boolean): CalculationContext {
  const length = clamp(input.lengthCm, 0.1, 300);
  const width = clamp(input.widthCm, 0.1, 300);
  const height = clamp(input.heightCm, 0.1, 300);
  const volumeLiters = (length * width * height) / 1000;
  const baseLogistics = volumeLiters <= 1 ? 46 : 46 + (volumeLiters - 1) * 14;
  const variant1 = Math.floor(palletConfig.lengthCm / length) * Math.floor(palletConfig.widthCm / width);
  const variant2 = Math.floor(palletConfig.lengthCm / width) * Math.floor(palletConfig.widthCm / length);
  const itemsPerPallet = Math.max(1, Math.max(variant1, variant2) * Math.floor(palletConfig.maxHeightCm / height));
  const preset = geoPresets[input.geoPresetId];
  const groupCoefficients = { kolPodolskMin: Math.min(warehouseCoefficients.koledino, warehouseCoefficients.podolsk), krasnodarNevinnomysskMin: Math.min(warehouseCoefficients.krasnodar, warehouseCoefficients.nevinnomyssk) };
  const geoWarehouseCoefficient = preset.warehouseWeights.reduce((sum, item) => sum + item.weight * (item.group ? groupCoefficients[item.group] : item.warehouse ? warehouseCoefficients[item.warehouse] : 0), 0);
  const deliveryToWbPerUnit = isAdvanced ? clamp(input.manualDeliveryToWbPerUnit, 0, 100000) : input.includeDeliveryToWb ? preset.deliveryPalletCost / itemsPerPallet : 0;
  return { volumeLiters: Number(volumeLiters.toFixed(2)), baseLogistics: Number(baseLogistics.toFixed(2)), itemsPerPallet, geoWarehouseCoefficient: Number(geoWarehouseCoefficient.toFixed(2)), deliveryToWbPerUnit: Number(deliveryToWbPerUnit.toFixed(2)) };
}

function calculateTax(taxMode: TaxMode, taxRate: number, salePrice: number, profitBeforeTax: number) {
  const rate = clamp(taxRate, 0, 100) / 100;
  if (taxMode === 'usn6') return salePrice * rate;
  return Math.max(profitBeforeTax * rate, salePrice * 0.01);
}

export function calculateUnitEconomics(input: CalculatorInput, model: ResultMode, isAdvanced: boolean): UnitEconomicsResult {
  const category = categories.find((c) => c.id === input.categoryId) ?? categories[0];
  const salePrice = clamp(input.salePrice, 1, 1_000_000);
  const costPrice = clamp(input.costPrice, 0, 1_000_000);
  const context = getCalculationContext(input, isAdvanced);
  const commissionRate = clamp((isAdvanced ? input.manualKvv : category.kvv) * 100, 0, 100) / 100;
  const adRate = isAdvanced ? clamp(input.adRate,0,100)/100 : (input.includeAds ? clamp(input.adRate * 100, 0, 100) / 100 : 0);
  const commission = salePrice * commissionRate;
  const logistics = model === 'fbo' ? context.baseLogistics * context.geoWarehouseCoefficient : context.baseLogistics;
  const storage = model === 'fbo' ? context.volumeLiters * 0.08 * context.geoWarehouseCoefficient * clamp(isAdvanced ? input.manualStorageDays : defaults.storageDays, 0, 365) : 0;
  const processing = model === 'fbs' ? defaults.fbsProcessingCost : 0;
  const adCost = salePrice * adRate;
  const fulfillment = isAdvanced ? clamp(input.manualFulfillmentCost,0,100000) : (input.includeFulfillment ? clamp(defaults.fulfillmentCost, 0, 100000) : 0);
  const deliveryToWb = context.deliveryToWbPerUnit;
  const packaging = clamp(isAdvanced ? input.packagingCost : 0, 0, 100000);
  const otherCosts = clamp(isAdvanced ? input.otherCosts : 0, 0, 100000);
  const profitBeforeTax = salePrice - costPrice - commission - logistics - storage - processing - adCost - fulfillment - deliveryToWb - packaging - otherCosts;
  const tax = isAdvanced ? calculateTax(input.taxMode, input.taxRate, salePrice, profitBeforeTax) : (input.includeTaxes ? calculateTax(input.taxMode, input.taxRate, salePrice, profitBeforeTax) : 0);
  const profit = profitBeforeTax - tax;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  const roi = costPrice > 0 ? (profit / costPrice) * 100 : null;
  const variableWithoutTax = costPrice + commission + logistics + storage + processing + adCost + fulfillment + deliveryToWb + packaging + otherCosts;
  const breakEvenPrice = variableWithoutTax;
  return { model, salePrice, costPrice, commission, logistics, storage, processing, adCost, tax, fulfillment, deliveryToWb, packaging, otherCosts, profitBeforeTax, profit, margin, roi, breakEvenPrice };
}
