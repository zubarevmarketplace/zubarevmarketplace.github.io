import { useId, useMemo, useState } from 'react';
import { commissionTariffs, findCommission } from '../../config/tariffRegistry';
import { Input } from '../ui/input';

export default function CategorySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selected = findCommission(value);
  const matches = useMemo(() => {
    const words = query.toLocaleLowerCase('ru').trim().split(/\s+/);
    return commissionTariffs.filter((tariff) => {
      const label = (tariff.category + ' ' + tariff.subject).toLocaleLowerCase('ru');
      return words.every((word) => label.includes(word));
    });
  }, [query]);
  return (
    <div className="min-w-0 space-y-2">
      <label id={id + '-label'} className="text-sm text-white/80">Категория и предмет WB</label>
      <button type="button" aria-labelledby={id + '-label'} aria-expanded={open} aria-controls={id}
        onClick={() => setOpen(!open)} className="w-full rounded-xl border border-white/15 bg-[#0C141B] px-3 py-3 text-left text-sm break-words focus-visible:outline-2 focus-visible:outline-cyan-400">
        {selected ? selected.subject + ' — ' + selected.category : 'Выберите предмет'} <span aria-hidden="true">▾</span>
      </button>
      {open && <div id={id} className="space-y-2 rounded-xl border border-white/15 p-3">
        <Input aria-label="Поиск категории или предмета" placeholder="Например: посуда, кофейники" value={query}
          onChange={(event) => setQuery(event.target.value)} className="bg-[#0C141B]" />
        <ul aria-label="Предметы WB" className="max-h-64 overflow-y-auto">
          {matches.slice(0, 50).map((tariff) => <li key={tariff.id}>
            <button type="button" aria-pressed={value === tariff.id} className="w-full rounded-lg px-2 py-2 text-left text-sm break-words hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-400"
              onClick={() => { onChange(tariff.id); setOpen(false); setQuery(''); }}>
              {tariff.subject} — <span className="text-white/60">{tariff.category}</span>
            </button>
          </li>)}
        </ul>
        <p role="status" className="text-xs text-white/60">{matches.length === 0 ? 'Ничего не найдено. Измените запрос.' : matches.length > 50 ? 'Первые 50 совпадений. Уточните поиск.' : 'Найдено предметов: ' + matches.length}</p>
      </div>}
    </div>
  );
}
