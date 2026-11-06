import { motion } from 'framer-motion';
import { X, Navigation, Clock, Check, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LOCATION_BY_ID, CATEGORIES, EDGES, formatDistance } from '../data/campus.js';
import { useCampusStore } from '../store/useCampusStore.js';

export function CategoryBadge({ category }) {
  const c = CATEGORIES[category];
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-ink-600 px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wider text-fg-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

export default function LocationDetails({ id, onClose, compact = false, actions }) {
  const loc = LOCATION_BY_ID[id];
  const navigateTo = useCampusStore((s) => s.navigateTo);
  const navigate = useNavigate();
  if (!loc) return null;

  const connections = EDGES.filter((e) => e.a === id || e.b === id).map((e) => ({
    other: e.a === id ? e.b : e.a,
    weight: e.weight,
    name: e.name,
  }));

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="panel-floating w-full overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 border-b border-ink-700 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CategoryBadge category={loc.category} />
            <span className="font-mono text-2xs text-fg-subtle">{loc.code}</span>
          </div>
          <h2 className="mt-2 text-base font-semibold leading-tight">{loc.name}</h2>
        </div>
        {onClose && (
          <button className="icon-btn -mr-1 -mt-1 shrink-0" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm leading-relaxed text-fg-muted">{loc.description}</p>

        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <Clock size={13} className="text-fg-subtle" />
          {loc.hours}
        </div>

        {!compact && (
          <div>
            <div className="eyebrow mb-2">Facilities</div>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {loc.facilities.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-fg">
                  <Check size={13} className="shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!compact && (
          <div>
            <div className="eyebrow mb-2">Direct pathways · {connections.length}</div>
            <ul className="divide-y divide-ink-700 rounded-md border border-ink-700">
              {connections.map((c) => (
                <li key={c.other} className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-fg">
                    <Link2 size={12} className="shrink-0 text-fg-subtle" />
                    <span className="truncate">{LOCATION_BY_ID[c.other].name}</span>
                  </span>
                  <span className="ml-3 shrink-0 font-mono text-fg-muted">{formatDistance(c.weight)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-ink-700 p-3">
        {actions ?? (
          <button
            className="btn-primary flex-1"
            onClick={() => {
              navigateTo(id);
              navigate('/navigate');
            }}
          >
            <Navigation size={15} />
            Navigate here
          </button>
        )}
      </div>
    </motion.div>
  );
}
