import { ChevronDown } from 'lucide-react';
import { LOCATIONS, CATEGORIES } from '../data/campus.js';

const GROUPED = Object.keys(CATEGORIES).map((cat) => ({
  cat,
  items: LOCATIONS.filter((l) => l.category === cat).sort((a, b) => a.name.localeCompare(b.name)),
}));

export default function LocationSelect({ value, onChange, placeholder = 'Choose a location', icon, id }) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field appearance-none pr-9 ${icon ? 'pl-9' : ''} ${value ? '' : 'text-fg-subtle'}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {GROUPED.map((g) => (
          <optgroup key={g.cat} label={CATEGORIES[g.cat].label}>
            {g.items.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
    </div>
  );
}
