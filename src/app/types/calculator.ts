export type CalculatorMode = 'simple' | 'advanced';
export type ResultMode = 'fbo' | 'fbs';
export type GeoPresetId = 'allRussia' | 'cfo' | 'moscow';
export type TaxMode = 'usn6' | 'usn15';

export interface CalculatorInput {
  categoryId: string;
  salePrice: number;
  costPrice: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  geoPresetId: GeoPresetId;
  includeAds: boolean;
  adRate: number;
  includeTaxes: boolean;
  taxMode: TaxMode;
  taxRate: number;
  includeFulfillment: boolean;
  includeDeliveryToWb: boolean;
  manualKvv: number;
  manualBuyoutRate: number;
  manualLocalOrderShare: number;
  manualStorageDays: number;
  manualDeliveryToWbPerUnit: number;
  packagingCost: number;
  manualFulfillmentCost: number;
  otherCosts: number;
}

export interface UnitEconomicsResult { model: ResultMode; salePrice: number; costPrice: number; commission: number; logistics: number; storage: number; processing: number; adCost: number; tax: number; fulfillment: number; deliveryToWb: number; packaging: number; otherCosts: number; profitBeforeTax: number; profit: number; margin: number; roi: number | null; breakEvenPrice: number; }
export interface CalculationContext { volumeLiters: number; baseLogistics: number; itemsPerPallet: number; geoWarehouseCoefficient: number; deliveryToWbPerUnit: number; }
