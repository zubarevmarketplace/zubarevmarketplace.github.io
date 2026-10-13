import commissionTariffs from '../../calculator/data/commissionTariffs.json';
import { tariffMeta } from './tariffMeta';
import { warehouseTariffs } from '../../calculator/config/warehouseTariffs';

export { tariffMeta, formatTariffDate } from './tariffMeta';

export type CommissionTariff = {
  id: string;
  category: string;
  subject: string;
  fboCommissionRate: number;
  fbsCommissionRate: number;
};

const palletConfig = {
  lengthCm: 120,
  widthCm: 80,
  maxHeightCm: 160,
};

const defaults = {
  simplePlatformDiscountRate: 30,
  fbsProcessingCost: 20,
  fulfillmentCost: 20,
  storageDays: 30,
  acquiringRatePercent: 1.5,
  maxLocalizationLogisticsMarkup: 0.3,
  maxSalesDistributionIndexRate: 0.01,
};

export interface WarehouseWeight {
  warehouse?: 'koledino' | 'podolsk' | 'tula' | 'kazan' | 'krasnodar' | 'nevinnomyssk' | 'ekaterinburg';
  group?: 'kolPodolskMin' | 'krasnodarNevinnomysskMin';
  weight: number;
}

export interface GeoPreset {
  label: string;
  localOrderShare: number;
  deliveryPalletCost: number;
  warehouseWeights: WarehouseWeight[];
}

const geoPresets: Record<'allRussia' | 'cfo' | 'moscow', GeoPreset> = {
  allRussia: {
    label: 'По всей России',
    localOrderShare: 0.7,
    deliveryPalletCost: 6100,
    warehouseWeights: [
      { group: 'kolPodolskMin', weight: 0.25 },
      { warehouse: 'tula', weight: 0.25 },
      { warehouse: 'kazan', weight: 0.25 },
      { group: 'krasnodarNevinnomysskMin', weight: 0.1 },
      { warehouse: 'ekaterinburg', weight: 0.15 },
    ],
  },
  cfo: {
    label: 'Центральная Россия',
    localOrderShare: 0.5,
    deliveryPalletCost: 3000,
    warehouseWeights: [
      { group: 'kolPodolskMin', weight: 0.5 },
      { warehouse: 'tula', weight: 0.5 },
    ],
  },
  moscow: {
    label: 'Только Москва',
    localOrderShare: 0.3,
    deliveryPalletCost: 3000,
    warehouseWeights: [{ group: 'kolPodolskMin', weight: 1 }],
  },
};

export const tariffRegistry = {
  meta: tariffMeta,
  wb: {
    commissions: commissionTariffs,
    warehouses: warehouseTariffs,
    defaults,
    pallet: palletConfig,
    geoPresets,
  },
};

// Совместимый экспорт для существующих потребителей JSON комиссий.
export { commissionTariffs };

export function findCommission(tariffId: string): CommissionTariff | undefined {
  return tariffRegistry.wb.commissions.find((tariff) => tariff.id === tariffId);
}

export function listCategories(): string[] {
  return [...new Set(tariffRegistry.wb.commissions.map((tariff) => tariff.category))]
    .sort((left, right) => left.localeCompare(right, 'ru'));
}
