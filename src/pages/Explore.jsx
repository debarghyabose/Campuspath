import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import CampusScene from '../scene/CampusScene.jsx';
import SceneControls, { SceneHint } from '../components/SceneControls.jsx';
import LocationDetails from '../components/LocationDetails.jsx';
import { LOCATIONS, CATEGORIES, UNIVERSITY } from '../data/campus.js';
import { useCampusStore } from '../store/useCampusStore.js';

export default function Explore() {
  const search = useCampusStore((s) => s.search);
  const setSearch = useCampusStore((s) => s.setSearch);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const setCategoryFilter = useCampusStore((s) => s.setCategoryFilter);
  const selectedId = useCampusStore((s) => s.selectedId);
  const hoveredId = useCampusStore((s) => s.hoveredId);
  const select = useCampusStore((s) => s.select);
  const setHovered = useCampusStore((s) => s.setHovered);
  const [panelOpen, setPanelOpen] = useState(true);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LOCATIONS.filter(
      (l) =>
        (!categoryFilter || l.category === categoryFilter) &&
        (!q ||
          l.name.toLowerCase().includes(q) ||
          l.code.toLowerCase() === q ||
          l.facilities.some((f) => f.toLowerCase().includes(q)))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [search, categoryFilter]);

  const counts = useMemo(
    () => Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, LOCATIONS.filter((l) => l.category === c).length])),
    []
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <CampusScene mode="explore" />

      {/* left: search + directory */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex max-h-[calc(100%-1.5rem)] sm:inset-x-auto sm:left-4 sm:top-4 sm:w-[340px]">
        {panelOpen ? (
          <div className="panel-floating pointer-events-auto flex max-h-full w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
              <div>
                <div className="eyebrow">Campus directory</div>
                <div className="mt-0.5 text-sm font-medium">{UNIVERSITY}</div>
              </div>
              <button className="icon-btn" onClick={() => setPanelOpen(false)} aria-label="Collapse panel">
                <PanelLeftClose size={16} />
              </button>
            </div>

            <div className="space-y-3 border-b border-ink-700 p-3">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                <input
                  className="field pl-9 pr-8"
                  placeholder="Search buildings or facilities"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(CATEGORIES).map(([key, c]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`chip ${categoryFilter === key ? 'chip-active' : ''}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                    {c.label}
                    <span className="font-mono text-2xs text-fg-subtle">{counts[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 pb-1 pt-3">
              <span className="eyebrow">{results.length} locations</span>
              {(search || categoryFilter) && (
                <button
                  className="text-2xs text-fg-muted hover:text-fg"
                  onClick={() => {
                    setSearch('');
                    if (categoryFilter) setCategoryFilter(categoryFilter);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
              {results.map((l) => {
                const active = selectedId === l.id;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => select(l.id)}
                      onMouseEnter={() => setHovered(l.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`group flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                        active ? 'bg-accent-soft' : hoveredId === l.id ? 'bg-ink-750' : 'hover:bg-ink-750'
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-ink-600 bg-ink-900 font-mono text-2xs text-fg-muted">
                        {l.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${active ? 'text-fg' : 'text-fg'}`}>{l.name}</span>
                        <span className="flex items-center gap-1.5 text-2xs text-fg-subtle">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORIES[l.category].color }} />
                          {CATEGORIES[l.category].label}
                        </span>
                      </span>
                      <ChevronRight size={14} className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                );
              })}
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-fg-muted">No locations match “{search}”.</li>
              )}
            </ul>
          </div>
        ) : (
          <button className="panel-floating pointer-events-auto flex h-10 items-center gap-2 px-3 text-sm" onClick={() => setPanelOpen(true)}>
            <PanelLeftOpen size={16} />
            Directory
          </button>
        )}
      </div>

      {/* right: details */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 sm:inset-x-auto sm:bottom-auto sm:right-16 sm:top-4 sm:w-[360px]">
        <AnimatePresence mode="wait">
          {selectedId && (
            <div className="pointer-events-auto max-h-[60vh] overflow-y-auto sm:max-h-[calc(100vh-6rem)]">
              <LocationDetails id={selectedId} onClose={() => select(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <SceneControls className="absolute right-4 top-4 z-30 hidden sm:flex" />
      <SceneHint className="absolute z-30 bottom-4 left-1/2 -translate-x-1/2" />
    </div>
  );
}
