import { tariffRegistry } from './tariffRegistry';

export type { GeoPreset, WarehouseWeight } from './tariffRegistry';
export const geoPresets = tariffRegistry.wb.geoPresets;
