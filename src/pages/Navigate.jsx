import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  Route as RouteIcon,
  RotateCcw,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  CircleDot,
  MapPin,
  Info,
  AlertTriangle,
  History,
  Navigation,
} from 'lucide-react';
import CampusScene from '../scene/CampusScene.jsx';
import SceneControls from '../components/SceneControls.jsx';
import LocationSelect from '../components/LocationSelect.jsx';
import LocationDetails from '../components/LocationDetails.jsx';
import { useCampusStore } from '../store/useCampusStore.js';
import { ALGORITHMS } from '../dsa/pathfinding.js';
import {
  LOCATION_BY_ID,
  formatDistance,
  formatDuration,
  WALK_SPEED_MPS,
  JUNCTION_DELAY_S,
} from '../data/campus.js';

const NAV_ALGOS = ['dijkstra', 'astar', 'bfs'];

const TURN_ICON = {
  start: CircleDot,
  straight: ArrowUp,
  'slight-left': ArrowUpLeft,
  'slight-right': ArrowUpRight,
  left: CornerUpLeft,
  right: CornerUpRight,
  'sharp-left': CornerUpLeft,
  'sharp-right': CornerUpRight,
  arrive: Flag,
};

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-md border border-ink-700 bg-ink-900/60 px-3 py-2.5">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="mt-0.5 text-2xs text-fg-subtle">{sub}</div>}
    </div>
  );
}

function Planner() {
  const from = useCampusStore((s) => s.from);
  const to = useCampusStore((s) => s.to);
  const algorithm = useCampusStore((s) => s.algorithm);
  const setFrom = useCampusStore((s) => s.setFrom);
  const setTo = useCampusStore((s) => s.setTo);
  const swap = useCampusStore((s) => s.swap);
  const setAlgorithm = useCampusStore((s) => s.setAlgorithm);
  const findRoute = useCampusStore((s) => s.findRoute);
  const clearRoute = useCampusStore((s) => s.clearRoute);
  const routes = useCampusStore((s) => s.routes);
  const routeError = useCampusStore((s) => s.routeError);
  const closedEdges = useCampusStore((s) => s.closedEdges);
  const reopenAll = useCampusStore((s) => s.reopenAll);

  return (
    <div className="space-y-4 border-b border-ink-700 p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <label className="sr-only" htmlFor="from">Starting location</label>
          <LocationSelect
            id="from"
            value={from}
            onChange={setFrom}
            placeholder="Starting location"
            icon={<span className="block h-2.5 w-2.5 rounded-full border-2 border-fg" />}
          />
          <label className="sr-only" htmlFor="to">Destination</label>
          <LocationSelect
            id="to"
            value={to}
            onChange={setTo}
            placeholder="Choose destination"
            icon={<MapPin size={14} className="text-accent" />}
          />
        </div>
        <button className="icon-btn mt-6 border border-ink-600" onClick={swap} title="Swap start and destination" aria-label="Swap">
          <ArrowUpDown size={15} />
        </button>
      </div>

      <div>
        <div className="eyebrow mb-1.5">Algorithm</div>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-ink-700 bg-ink-900 p-1">
          {NAV_ALGOS.map((id) => (
            <button
              key={id}
              onClick={() => setAlgorithm(id)}
              className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                algorithm === id ? 'bg-ink-700 text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {ALGORITHMS[id].short}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-2xs leading-relaxed text-fg-subtle">{ALGORITHMS[NAV_ALGOS.includes(algorithm) ? algorithm : 'dijkstra'].blurb}</p>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={findRoute} disabled={!from || !to}>
          <RouteIcon size={15} />
          Find best route
        </button>
        {routes.length > 0 && (
          <button className="btn" onClick={clearRoute} title="Reset route">
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {routeError && (
        <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {routeError}
        </div>
      )}

      {closedEdges.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-ink-700 bg-ink-900/60 px-3 py-2 text-xs text-fg-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-[#D9774A]" />
            {closedEdges.length} pathway{closedEdges.length > 1 ? 's' : ''} closed
          </span>
          <span className="flex gap-3">
            <Link to="/lab" className="hover:text-fg">Edit</Link>
            <button onClick={reopenAll} className="hover:text-fg">Reopen all</button>
          </span>
        </div>
      )}
    </div>
  );
}

function Results() {
  const routes = useCampusStore((s) => s.routes);
  const active = useCampusStore((s) => s.activeRoute);
  const setActiveRoute = useCampusStore((s) => s.setActiveRoute);
  const lastRun = useCampusStore((s) => s.lastRun);
  const route = routes[active];
  if (!route) return null;
  const algo = ALGORITHMS[routes[0].algorithm];
  const best = Math.min(...routes.map((r) => r.distance));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 p-4">
      <div>
        <div className="eyebrow mb-2">Route summary</div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Distance" value={formatDistance(route.distance)} sub={route.distance === best ? 'Shortest found' : `+${route.distance - best} m vs shortest`} />
          <Stat label="Walking time" value={formatDuration(route.seconds)} sub={`at ${WALK_SPEED_MPS} m/s`} />
          <Stat label="Intermediate stops" value={route.intermediate} sub={`${route.path.length - 1} pathway segments`} />
          <Stat label="Algorithm" value={active === 0 ? algo.short : "Yen's"} sub={active === 0 ? algo.structure : 'K-shortest paths'} />
        </div>
        {lastRun && active === 0 && (
          <div className="mt-2 flex items-center justify-between rounded-md border border-ink-700 px-3 py-2 font-mono text-2xs text-fg-subtle">
            <span>{lastRun.visited} nodes settled</span>
            <span>{lastRun.relaxations} edge checks</span>
            <span>{lastRun.elapsedMs < 1 ? '<1' : lastRun.elapsedMs.toFixed(2)} ms</span>
          </div>
        )}
      </div>

      <div>
        <div className="eyebrow mb-2">Path</div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          {route.path.map((id, i) => (
            <span key={id} className="flex items-center gap-1.5">
              <span className={i === 0 || i === route.path.length - 1 ? 'font-medium text-fg' : 'text-fg-muted'}>
                {LOCATION_BY_ID[id].name}
              </span>
              {i < route.path.length - 1 && <span className="text-accent">→</span>}
            </span>
          ))}
        </div>
      </div>

      {routes.length > 1 && (
        <div>
          <div className="eyebrow mb-2">Routes · {routes.length}</div>
          <div className="space-y-1.5">
            {routes.map((r, i) => (
              <button
                key={r.path.join()}
                onClick={() => setActiveRoute(i)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                  i === active ? 'border-accent/50 bg-accent-soft' : 'border-ink-700 hover:border-ink-600 hover:bg-ink-800'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-fg">
                    {i === 0 ? 'Recommended' : `Alternative ${i}`}
                  </span>
                  <span className="block truncate text-2xs text-fg-subtle">
                    via {r.path.slice(1, -1).map((id) => LOCATION_BY_ID[id].code).join(' · ') || 'direct pathway'}
                  </span>
                </span>
                <span className="ml-3 shrink-0 text-right font-mono text-xs">
                  <span className="block text-fg">{formatDistance(r.distance)}</span>
                  <span className="block text-2xs text-fg-subtle">{formatDuration(r.seconds)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="eyebrow mb-2">Turn-by-turn</div>
        <ol className="relative">
          {route.instructions.map((step, i) => {
            const Icon = TURN_ICON[step.type] ?? ArrowUp;
            const last = i === route.instructions.length - 1;
            return (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {!last && <span className="absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px bg-ink-600" />}
                <span
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    last ? 'border-accent bg-accent text-white' : 'border-ink-600 bg-ink-800 text-fg'
                  }`}
                >
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm leading-snug text-fg">{step.text}</p>
                  <p className="mt-0.5 flex items-center justify-between text-2xs text-fg-subtle">
                    <span>{step.detail}</span>
                    {step.distance > 0 && <span className="font-mono">{formatDistance(step.distance)}</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex gap-2 rounded-md border border-ink-700 bg-ink-900/60 p-3 text-2xs leading-relaxed text-fg-subtle">
        <Info size={13} className="mt-0.5 shrink-0 text-fg-muted" />
        <p>
          Walking time assumes {WALK_SPEED_MPS} m/s (75 m/min) — slightly below the typical adult pace of ~1.4 m/s to allow
          for crossings, steps and foot traffic — plus {JUNCTION_DELAY_S} s at each intermediate junction. Distances are
          pathway lengths, not straight-line distances.
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const recent = useCampusStore((s) => s.recentRoutes);
  const setFrom = useCampusStore((s) => s.setFrom);
  const setTo = useCampusStore((s) => s.setTo);
  const findRoute = useCampusStore((s) => s.findRoute);
  return (
    <div className="p-4">
      {recent.length > 0 ? (
        <>
          <div className="eyebrow mb-2 flex items-center gap-1.5">
            <History size={12} /> Recent routes
          </div>
          <ul className="space-y-1">
            {recent.map((r) => (
              <li key={`${r.from}-${r.to}`}>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-ink-800 hover:text-fg"
                  onClick={() => {
                    setFrom(r.from);
                    setTo(r.to);
                    findRoute();
                  }}
                >
                  <Navigation size={13} className="shrink-0 text-fg-subtle" />
                  <span className="truncate">
                    {LOCATION_BY_ID[r.from]?.name} <span className="text-fg-subtle">→</span> {LOCATION_BY_ID[r.to]?.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-ink-600 px-4 py-6 text-center">
          <p className="text-sm text-fg">Plan a walking route</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            Pick a start and destination, or click any building on the map to set it.
          </p>
        </div>
      )}
    </div>
  );
}

function MapSelectionCard() {
  const selectedId = useCampusStore((s) => s.selectedId);
  const select = useCampusStore((s) => s.select);
  const setAsStart = useCampusStore((s) => s.setAsStart);
  const navigateTo = useCampusStore((s) => s.navigateTo);
  return (
    <AnimatePresence>
      {selectedId && (
        <div className="pointer-events-auto absolute z-30 bottom-4 left-4 right-4 sm:left-auto sm:right-16 sm:top-4 sm:bottom-auto sm:w-[320px]">
          <LocationDetails
            id={selectedId}
            compact
            onClose={() => select(null)}
            actions={
              <>
                <button className="btn flex-1" onClick={() => setAsStart(selectedId)}>
                  Set as start
                </button>
                <button className="btn-primary flex-1" onClick={() => navigateTo(selectedId)}>
                  Set as destination
                </button>
              </>
            }
          />
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Navigate() {
  const routes = useCampusStore((s) => s.routes);
  return (
    <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <aside className="order-2 flex flex-col border-ink-700 bg-ink-850 lg:order-1 lg:h-full lg:w-[400px] lg:shrink-0 lg:border-r">
        <div className="border-b border-ink-700 px-4 py-3">
          <div className="eyebrow">Route planner</div>
          <h1 className="mt-0.5 text-sm font-medium">Find the shortest walk across campus</h1>
        </div>
        <Planner />
        <div className="flex-1 lg:overflow-y-auto">{routes.length ? <Results /> : <EmptyState />}</div>
      </aside>
      <section className="relative order-1 h-[52vh] lg:order-2 lg:h-full lg:flex-1">
        <CampusScene mode="navigate" />
        <SceneControls className="absolute right-4 top-4 z-30" />
        <MapSelectionCard />
      </section>
    </div>
  );
}
