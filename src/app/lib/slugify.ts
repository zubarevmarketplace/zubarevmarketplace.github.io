const transliteration: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(value: string): string {
  return Array.from(value.normalize('NFC').toLowerCase(), (letter) => transliteration[letter] ?? letter)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Transliteration can collapse different names to the same slug. Suppliers
// generating many pages can use this deterministic allocator to avoid clashes.
export function createUniqueSlugs(values: readonly string[]): string[] {
  const used = new Set<string>();
  return values.map((value) => {
    const base = slugify(value) || 'page';
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = base + '-' + suffix++;
    used.add(slug);
    return slug;
  });
}
