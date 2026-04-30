export type CalculatorMode = 'simple' | 'advanced';
export type ResultMode = 'fbo' | 'fbs';
export type GeoPresetId = 'allRussia' | 'cfo' | 'moscow';
export type TaxMode = 'usn6' | 'usn15';

export interface CalculatorInput {
  categoryId: string;
  salePrice: number; // buyer price
  platformDiscountRatePercent: number;
  weightKg: number;
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
  manualFboCommissionRate: number;
  manualFbsCommissionRate: number;
  manualBuyoutRate: number;
  manualLocalOrderShare: number;
  manualStorageDays: number;
  manualDeliveryToWbPerUnit: number;
  packagingCost: number;
  manualFulfillmentCost: number;
  otherCosts: number;
}

export interface LogisticsBreakdown {
  baseLogistics: number;
  warehouseCoefficientExtra: number;
  localizationExtra: number;
  salesDistributionCost: number;
  forwardLogistics: number;
  reverseLogisticsBase: number;
  reverseLogisticsPerSoldUnit: number;
}

export interface CommissionBreakdown {
  grossWbCommission: number;
  platformDiscountAmount: number;
  netWbCommission: number;
  acquiringCost: number;
}

export interface UnitEconomicsResult { model: ResultMode; salePrice: number; priceBeforeWbDiscount: number; platformDiscountAmount: number; costPrice: number; commission: number; logistics: number; storage: number; processing: number; adCost: number; tax: number; fulfillment: number; deliveryToWb: number; packaging: number; otherCosts: number; profitBeforeTax: number; profit: number; margin: number; roi: number | null; breakEvenPrice: number; totalExpenses: number; isSgt: boolean; commissionBreakdown: CommissionBreakdown; logisticsBreakdown: LogisticsBreakdown; }
export interface CalculationContext { volumeLiters: number; baseLogistics: number; itemsPerPallet: number; geoWarehouseCoefficient: number; deliveryToWbPerUnit: number; }
