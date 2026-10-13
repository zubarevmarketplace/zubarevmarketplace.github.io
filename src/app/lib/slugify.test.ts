import { describe, expect, it } from 'vitest';
import { createUniqueSlugs, slugify } from './slugify';

describe('slugify', () => {
  it.each([
    ['Спортивный товар', 'sportivnyj-tovar'],
    ['Ёлки, щётки и чай', 'yolki-shchyotki-i-chaj'],
    ['Объём — 100 мл!', 'obyom-100-ml'],
    ['Юбки / Яркая одежда', 'yubki-yarkaya-odezhda'],
    ['  WB & Ozon --- Café 42  ', 'wb-ozon-cafe-42'],
  ])('нормализует %s в %s', (input, expected) => {
    const slug = slugify(input);
    expect(slug).toBe(expected);
    expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(slugify(slug)).toBe(slug);
  });

  it('одинаково обрабатывает составные Unicode буквы и регистр', () => {
    expect(slugify('Ёлки Йод')).toBe(slugify('Ёлки Йод'.normalize('NFD')));
    expect(slugify('СПОРТИВНЫЙ ТОВАР')).toBe(slugify('Спортивный товар'));
    expect(slugify('!!!')).toBe('');
  });

  it('сохраняет уникальность после нормализации, включая совпадение с суффиксом', () => {
    const names = ['Чай', ' чай ', 'Чай-2', 'Chaj', '', '!!!', 'page-2'];
    const slugs = createUniqueSlugs(names);
    expect(slugs).toEqual(['chaj', 'chaj-2', 'chaj-2-2', 'chaj-3', 'page', 'page-2', 'page-2-2']);
    expect(new Set(slugs).size).toBe(names.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
    expect(createUniqueSlugs(names)).toEqual(slugs);
  });
});
