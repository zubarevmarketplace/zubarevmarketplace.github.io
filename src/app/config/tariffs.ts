export const warehouseCoefficients = {
  koledino: 2.05,
  podolsk: 1.95,
  tula: 1.6,
  kazan: 1.4,
  krasnodar: 1.7,
  nevinnomyssk: 1.5,
  ekaterinburg: 1.8,
} as const;

export const palletConfig = {
  lengthCm: 120,
  widthCm: 80,
  maxHeightCm: 160,
};

export const defaults = {
  adRate: 0.1,
  fulfillmentCost: 20,
  fbsProcessingCost: 20,
  storageDays: 30,
};
