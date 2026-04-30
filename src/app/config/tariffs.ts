export const warehouseTariffs = {
  koledino: { logistics: 1.95, storage: 1.45, fbs: 1.95 },
  podolsk: { logistics: 2.0, storage: 1.7, fbs: 1.95 },
  tula: { logistics: 1.5, storage: 1.1, fbs: 1.5 },
  kazan: { logistics: 2.2, storage: 1.8, fbs: null },
  krasnodar: { logistics: 1.6, storage: 1.45, fbs: 1.6 },
  nevinnomyssk: { logistics: 1.3, storage: 1.35, fbs: 1.3 },
  ekaterinburg: { logistics: 2.2, storage: 1.85, fbs: 2.2 },
} as const;

export const palletConfig = {
  lengthCm: 120,
  widthCm: 80,
  maxHeightCm: 160,
};

export const defaults = {
  simplePlatformDiscountRate: 30,
  fbsProcessingCost: 20,
  fulfillmentCost: 20,
  storageDays: 30,
  acquiringRatePercent: 1.5,
};
