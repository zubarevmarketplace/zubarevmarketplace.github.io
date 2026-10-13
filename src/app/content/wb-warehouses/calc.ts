import { warehouseTariffs } from '../../../calculator/config/warehouseTariffs';
import { geoPresets } from '../../config/geoPresets';
import type { WarehouseWeight } from '../../config/geoPresets';
import { calculateBaseLogistics, calculateVolumeLiters } from '../../lib/calculateUnitEconomics';

export type WarehouseSlug = keyof typeof warehouseTariffs;
export const exampleDimensions = { lengthCm: 30, widthCm: 20, heightCm: 10 } as const;

export function calculateWarehouseExample(slug: WarehouseSlug) {
  const { lengthCm, widthCm, heightCm } = exampleDimensions;
  const volumeLiters = calculateVolumeLiters(lengthCm, widthCm, heightCm);
  const baseLogistics = calculateBaseLogistics(volumeLiters);
  const coefficient = warehouseTariffs[slug].logistics;
  return { volumeLiters, baseLogistics, coefficient, logistics: baseLogistics * coefficient };
}

const groups: Record<NonNullable<WarehouseWeight['group']>, readonly WarehouseSlug[]> = {
  kolPodolskMin: ['koledino', 'podolsk'],
  krasnodarNevinnomysskMin: ['krasnodar', 'nevinnomyssk'],
};

export function getWarehousePresets(slug: WarehouseSlug) {
  return Object.entries(geoPresets).flatMap(([presetId, preset]) =>
    preset.warehouseWeights.flatMap((entry) => {
      if (entry.warehouse === slug) {
        return [{ presetId, label: preset.label, weight: entry.weight, groupLabel: null as string | null,
          logisticsSelected: true, storageSelected: true }];
      }
      if (!entry.group || !groups[entry.group].includes(slug)) return [];
      const members = groups[entry.group];
      return [{
        presetId, label: preset.label, weight: entry.weight,
        groupLabel: members.map((key) => warehouseTariffs[key].label).join(' / '),
        logisticsSelected: warehouseTariffs[slug].logistics === Math.min(...members.map((key) => warehouseTariffs[key].logistics)),
        storageSelected: warehouseTariffs[slug].storage === Math.min(...members.map((key) => warehouseTariffs[key].storage)),
      }];
    }));
}

export const formatCoefficient = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 4 }).format(value);

export const formatWeight = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 2 }).format(value);
