import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import xlsx from 'xlsx';
import { describe, expect, it } from 'vitest';

const execute = promisify(execFile);
const generator = path.resolve('scripts/generate-wb-tariffs.ts');
const tsx = path.resolve('node_modules/tsx/dist/cli.mjs');
const outputs = [
  'src/calculator/data/commissionTariffs.json',
  'src/calculator/config/warehouseTariffs.ts',
  'src/calculator/data/warehouseIndex.json',
  'src/calculator/data/tariffMeta.json',
  'src/calculator/data/commissionCategories.json',
  'src/calculator/data/commissionSubjects.json',
  'src/calculator/data/commissions/testovaya-kategoriya.json',
];

describe('защита результатов генерации тарифов', () => {
  it('генерирует дополнительные склады и индекс из XLSX, сохраняя коэффициенты и null FBS', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'wb-tariff-generator-'));
    try {
      await mkdir(path.join(directory, 'data/raw'), { recursive: true });
      const commission = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(commission, xlsx.utils.aoa_to_sheet([
        ['Категория', 'Предмет', 'FBO', 'FBS'], ['Тестовая категория', 'Тестовый предмет', 10, 15],
      ]), 'Комиссии');
      xlsx.writeFile(commission, path.join(directory, 'data/raw/commission.xlsx'));
      const warehouses = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(warehouses, xlsx.utils.aoa_to_sheet([
        ['Склад', 'Логистика', 'Хранение', 'FBS'],
        ...['Коледино', 'Подольск', 'Тула', 'Казань', 'Краснодар', 'Невинномысск', 'Екатеринбург'].map((label) => [label, 150, 100, 160]),
        ['Пенза', 120, 140, '-'], ['Казань СГТ', 75, 80, 90],
        ['Пенза: Питание', '1,3', '1,5', '1,1'],
        ['Без логистики', '-', 100, 120],
      ]), 'Короба');
      xlsx.writeFile(warehouses, path.join(directory, 'data/raw/warehouse-coefficients.xlsx'));
      await execute(process.execPath, [tsx, generator], { cwd: directory, windowsHide: true });
      const text = await readFile(path.join(directory, outputs[1]), 'utf8');
      const tariffs = JSON.parse(text.replace(/^export const warehouseTariffs = /, '').replace(/ as const;\s*$/, ''));
      expect(Object.keys(tariffs)).toHaveLength(10);
      expect(tariffs.kazan).toEqual({ label: 'Казань', logistics: 1.5, storage: 1, fbs: 1.6 });
      expect(tariffs.penza).toEqual({ label: 'Пенза', logistics: 1.2, storage: 1.4, fbs: null });
      expect(tariffs['kazan-sgt']).toEqual({ label: 'Казань СГТ', logistics: 0.75, storage: 0.8, fbs: 0.9 });
      expect(tariffs['penza-pitanie']).toEqual({ label: 'Пенза: Питание', logistics: 1.3, storage: 1.5, fbs: 1.1 });
      const index = JSON.parse(await readFile(path.join(directory, 'src/calculator/data/warehouseIndex.json'), 'utf8'));
      expect(index).toEqual(Object.entries(tariffs).map(([slug, row]) => ({ slug, label: (row as { label: string }).label })));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it.each(['нечитаемый XLSX', 'отсутствующие склады'])(
    'сохраняет тарифы и дату при ошибке: %s',
    async (failure) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'wb-tariff-generator-'));
      try {
        await mkdir(path.join(directory, 'data/raw'), { recursive: true });
        for (const output of outputs) {
          await mkdir(path.dirname(path.join(directory, output)), { recursive: true });
          await writeFile(path.join(directory, output), 'previous result');
        }
        const commission = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(commission, xlsx.utils.aoa_to_sheet([
          ['Категория', 'Предмет', 'FBO', 'FBS'],
          ['Тестовая категория', 'Тестовый предмет', 10, 15],
        ]), 'Комиссии');
        xlsx.writeFile(commission, path.join(directory, 'data/raw/commission.xlsx'));
        const warehousePath = path.join(directory, 'data/raw/warehouse-coefficients.xlsx');
        if (failure === 'нечитаемый XLSX') {
          // Обрезанный ZIP-контейнер XLSX.
          await writeFile(warehousePath, Buffer.from([0x50, 0x4b, 0x03, 0x04]));
        } else {
          const warehouses = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(warehouses,
            xlsx.utils.aoa_to_sheet([['Склад', 'Логистика', 'Хранение', 'FBS']]), 'Короба');
          xlsx.writeFile(warehouses, warehousePath);
        }
        await expect(execute(process.execPath, [tsx, generator], {
          cwd: directory, windowsHide: true,
        })).rejects.toThrow();
        for (const output of outputs) {
          expect(await readFile(path.join(directory, output), 'utf8')).toBe('previous result');
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
});
