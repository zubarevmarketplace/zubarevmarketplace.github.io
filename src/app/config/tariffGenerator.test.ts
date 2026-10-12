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
  'src/calculator/data/tariffMeta.json',
];

describe('защита результатов генерации тарифов', () => {
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
