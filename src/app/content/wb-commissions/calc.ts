import type { CommissionTariff } from '../../config/tariffRegistry';
import { createUniqueSlugs } from '../../lib/slugify';

export type RateSummary = { min: number; max: number; average: number };
export type CommissionCategory = {
  category: string;
  slug: string;
  count: number;
  fbo: RateSummary;
  fbs: RateSummary;
};
// The search index omits repeated category names and tariff IDs.
export type SubjectSearchRow = [subject: string, categoryIndex: number, fbo: number, fbs: number];
export type SortColumn = 'subject' | 'fboCommissionRate' | 'fbsCommissionRate' | 'difference';
export type SortDirection = 'asc' | 'desc';

function summarize(rates: number[]): RateSummary {
  return {
    min: Math.min(...rates),
    max: Math.max(...rates),
    average: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
  };
}

export function groupCommissions(tariffs: readonly CommissionTariff[]) {
  const groups = new Map<string, CommissionTariff[]>();
  for (const tariff of tariffs) {
    const rows = groups.get(tariff.category) ?? [];
    rows.push(tariff);
    groups.set(tariff.category, rows);
  }
  const names = [...groups.keys()].sort((a, b) => a.localeCompare(b, 'ru'));
  const slugs = createUniqueSlugs(names);
  return names.map((category, index) => {
    const subjects = groups.get(category)!;
    const summary: CommissionCategory = {
      category, slug: slugs[index], count: subjects.length,
      fbo: summarize(subjects.map((row) => row.fboCommissionRate)),
      fbs: summarize(subjects.map((row) => row.fbsCommissionRate)),
    };
    return { summary, subjects };
  });
}

export function normalizeQuery(value: string): string {
  return value.normalize('NFC').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim().replace(/\s+/g, ' ');
}

export function searchSubjects(rows: readonly SubjectSearchRow[], query: string): SubjectSearchRow[] {
  const normalized = normalizeQuery(query);
  return normalized ? rows.filter(([subject]) => normalizeQuery(subject).includes(normalized)) : [];
}

export function commissionDifference(row: CommissionTariff): number {
  return row.fbsCommissionRate - row.fboCommissionRate;
}

export function filterAndSortSubjects(
  rows: readonly CommissionTariff[], query: string, column: SortColumn, direction: SortDirection,
): CommissionTariff[] {
  const normalized = normalizeQuery(query);
  const filtered = rows.filter((row) => normalizeQuery(row.subject).includes(normalized));
  const sign = direction === 'asc' ? 1 : -1;
  return filtered.sort((a, b) => {
    const comparison = column === 'subject' ? a.subject.localeCompare(b.subject, 'ru')
      : column === 'difference' ? commissionDifference(a) - commissionDifference(b)
      : a[column] - b[column];
    return sign * comparison || a.subject.localeCompare(b.subject, 'ru');
  });
}

const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export function formatRate(value: number): string {
  return numberFormat.format(value);
}

export function formatRange(range: RateSummary): string {
  return `${formatRate(range.min)}–${formatRate(range.max)}%`;
}
