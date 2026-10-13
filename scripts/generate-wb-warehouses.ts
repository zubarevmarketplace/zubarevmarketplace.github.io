import fs from 'node:fs';
import path from 'node:path';
import { warehouseTariffs } from '../src/calculator/config/warehouseTariffs';

// The eager route provider needs names and paths, not the full tariff registry.
export function writeWarehouseIndex(warehouses: Record<string, { label: string }>, root = process.cwd()): void {
  const output = path.resolve(root, 'src/calculator/data/warehouseIndex.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const index = Object.entries(warehouses).map(([slug, { label }]) => ({ slug, label }));
  fs.writeFileSync(output, JSON.stringify(index) + '\n', 'utf8');
}

export function generateWarehouseIndex(): void {
  writeWarehouseIndex(warehouseTariffs);
}
