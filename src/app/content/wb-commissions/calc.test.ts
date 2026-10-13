import { describe, expect, it } from 'vitest';
import type { CommissionTariff } from '../../config/tariffRegistry';
import { commissionDifference, filterAndSortSubjects, formatRange, groupCommissions, searchSubjects, type SubjectSearchRow } from './calc';

const rows: CommissionTariff[] = [
  { id: '1', category: 'Красота', subject: 'Шампуни', fboCommissionRate: 10, fbsCommissionRate: 15 },
  { id: '2', category: 'Красота', subject: 'Бальзамы', fboCommissionRate: 20, fbsCommissionRate: 18 },
  { id: '3', category: 'Красота', subject: 'Щётки', fboCommissionRate: 0.5, fbsCommissionRate: 0.5 },
];

describe('поиск и сортировка комиссий', () => {
  it('фильтрует по названию без учёта регистра, ё и пробелов по краям', () => {
    expect(filterAndSortSubjects(rows, '  ЩЕТ  ', 'subject', 'asc').map((row) => row.id)).toEqual(['3']);
    expect(filterAndSortSubjects(rows, 'нет такого предмета', 'subject', 'asc')).toEqual([]);
  });
  it('сортирует все четыре столбца в обоих направлениях и сохраняет исходный массив', () => {
    for (const [column, expected] of [
      ['subject', ['2', '1', '3']], ['fboCommissionRate', ['3', '1', '2']],
      ['fbsCommissionRate', ['3', '1', '2']], ['difference', ['2', '3', '1']],
    ] as const) {
      expect(filterAndSortSubjects(rows, '', column, 'asc').map((row) => row.id)).toEqual(expected);
      expect(filterAndSortSubjects(rows, '', column, 'desc').map((row) => row.id)).toEqual([...expected].reverse());
    }
    expect(rows.map((row) => row.id)).toEqual(['1', '2', '3']);
    expect(commissionDifference(rows[1])).toBe(-2);
  });
  it('ищет по всем совпадениям, сохраняет категорию и обе ставки, пустой запрос не выдаёт 7 тысяч строк', () => {
    const index: SubjectSearchRow[] = [['Щётки', 0, 0.5, 0.5], ['Щётки для обуви', 1, 10, 15], ['Бальзамы', 0, 20, 18]];
    expect(searchSubjects(index, '  щЕТКИ ')).toEqual(index.slice(0, 2));
    expect(searchSubjects(index, '  ')).toEqual([]);
    expect(searchSubjects(index, 'неизвестный')).toEqual([]);
  });
  it('считает диапазон и невзвешенную среднюю, сохраняет ставки меньше 1%', () => {
    const [{ summary, subjects }] = groupCommissions(rows);
    expect(summary.count).toBe(3);
    expect(summary.fbo).toEqual({ min: 0.5, max: 20, average: 30.5 / 3 });
    expect(summary.fbs).toEqual({ min: 0.5, max: 18, average: 33.5 / 3 });
    expect(formatRange(summary.fbo)).toBe('0,5–20%');
    expect(subjects).toEqual(rows);
    expect(groupCommissions([])).toEqual([]);
  });
  it('выделяет уникальные slug при совпадении транслитерации категорий', () => {
    const groups = groupCommissions([rows[0], { ...rows[1], category: 'Krasota' }]);
    expect(new Set(groups.map(({ summary }) => summary.slug)).size).toBe(2);
  });
});
