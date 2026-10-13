import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CommissionTariff } from '../src/app/config/tariffRegistry';
import { groupCommissions, type SubjectSearchRow } from '../src/app/content/wb-commissions/calc';

export function writeCommissionReference(tariffs: readonly CommissionTariff[], root = process.cwd()): void {
  const groups = groupCommissions(tariffs);
  const dataDirectory = path.resolve(root, 'src/calculator/data');
  const categoryDirectory = path.join(dataDirectory, 'commissions');
  fs.mkdirSync(categoryDirectory, { recursive: true });
  const files = new Set(groups.map(({ summary }) => summary.slug + '.json'));
  const search: SubjectSearchRow[] = [];
  groups.forEach(({ summary, subjects }, categoryIndex) => {
    fs.writeFileSync(path.join(categoryDirectory, summary.slug + '.json'), JSON.stringify(subjects) + '\n', 'utf8');
    for (const row of subjects) {
      search.push([row.subject, categoryIndex, row.fboCommissionRate, row.fbsCommissionRate]);
    }
  });
  fs.writeFileSync(path.join(dataDirectory, 'commissionCategories.json'), JSON.stringify(groups.map(({ summary }) => summary)) + '\n', 'utf8');
  fs.writeFileSync(path.join(dataDirectory, 'commissionSubjects.json'), JSON.stringify(search) + '\n', 'utf8');
  // Only obsolete generated JSON files in this exact directory are removed.
  for (const filename of fs.readdirSync(categoryDirectory)) {
    if (/^[a-z0-9-]+\.json$/.test(filename) && !files.has(filename)) {
      fs.unlinkSync(path.join(categoryDirectory, filename));
    }
  }
}

export function generateCommissionReference(root = process.cwd()): void {
  const tariffs = JSON.parse(fs.readFileSync(path.resolve(root, 'src/calculator/data/commissionTariffs.json'), 'utf8')) as CommissionTariff[];
  writeCommissionReference(tariffs, root);
  console.info('[wb-commissions] Generated categories:', new Set(tariffs.map((row) => row.category)).size);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  generateCommissionReference();
}
