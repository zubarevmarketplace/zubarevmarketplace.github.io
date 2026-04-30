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

export const geoPresets: Record<'allRussia' | 'cfo' | 'moscow', GeoPreset> = {
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
    label: 'ЦФО',
    localOrderShare: 0.5,
    deliveryPalletCost: 3000,
    warehouseWeights: [
      { group: 'kolPodolskMin', weight: 0.5 },
      { warehouse: 'tula', weight: 0.5 },
    ],
  },
  moscow: {
    label: 'Москва / Подмосковье',
    localOrderShare: 0.3,
    deliveryPalletCost: 3000,
    warehouseWeights: [{ group: 'kolPodolskMin', weight: 1 }],
  },
};
