import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  Scissors,
  RotateCcw,
} from 'lucide-react';
import LocationSelect from '../components/LocationSelect.jsx';
import { useCampusStore } from '../store/useCampusStore.js';
import { buildCampusGraph } from '../dsa/campusGraph.js';
import { ALGORITHMS } from '../dsa/pathfinding.js';
import { edgeKey } from '../dsa/graph.js';
import { LOCATIONS, EDGES, LOCATION_BY_ID } from '../data/campus.js';

const ALGO_IDS = ['dijkstra', 'astar', 'bfs', 'dfs'];
const FRONTIER_NAME = { dijkstra: 'Min-heap (priority queue)', astar: 'Open set (min-heap on f)', bfs: 'Queue (FIFO)', dfs: 'Stack (LIFO)' };
const KEY_NAME = { dijkstra: 'dist', astar: 'f', bfs: 'depth', dfs: 'depth' };
const fmt = (v) => (v === Infinity || v === undefined ? '∞' : v);

/* ---------- graph canvas ---------- */

function GraphCanvas({ graph, step, run, source, target, closed, onToggleEdge }) {
  const xs = LOCATIONS.map((l) => l.pos[0]);
  const zs = LOCATIONS.map((l) => l.pos[1]);
  const pad = 9;
  const minX = Math.min(...xs) - pad;
  const minZ = Math.min(...zs) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...zs) - Math.min(...zs) + pad * 2;

  const visited = new Set(step?.visited ?? []);
  const frontier = new Set((step?.frontier ?? []).map((f) => f.id));
  const done = step?.kind === 'done';
  const finalPath = done && run.path ? run.path : null;
  const pathEdges = new Set();
  if (finalPath) for (let i = 0; i < finalPath.length - 1; i++) pathEdges.add(edgeKey(finalPath[i], finalPath[i + 1]));
  const treeEdges = new Set();
  if (step?.prev) for (const [v, u] of Object.entries(step.prev)) if (u) treeEdges.add(edgeKey(u, v));
  const activeEdge = step?.edge ? edgeKey(step.edge[0], step.edge[1]) : null;

  return (
    <svg viewBox={`${minX} ${minZ} ${w} ${h}`} className="h-full w-full select-none" role="img" aria-label="Campus graph">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#294968" strokeWidth="0.25" />
        </pattern>
      </defs>
      <rect x={minX} y={minZ} width={w} height={h} fill="url(#grid)" />

      {EDGES.map((e) => {
        const key = edgeKey(e.a, e.b);
        const [ax, az] = LOCATION_BY_ID[e.a].pos;
        const [bx, bz] = LOCATION_BY_ID[e.b].pos;
        const isClosed = closed.has(key);
        const onPath = pathEdges.has(key);
        const isActive = activeEdge === key;
        const inTree = treeEdges.has(key);
        let stroke = '#527394';
        let width = 0.55;
        if (inTree) (stroke = '#38BDF8'), (width = 0.8);
        if (onPath) (stroke = '#3B82F6'), (width = 1.5);
        if (isActive) (stroke = step.improved ? '#F1F5F9' : '#D58A78'), (width = 1.3);
        const mx = (ax + bx) / 2;
        const mz = (az + bz) / 2;
        return (
          <g key={key} className="cursor-pointer" onClick={() => onToggleEdge(e.a, e.b)}>
            <title>{`${e.name} — ${e.weight} m. Click to ${isClosed ? 'reopen' : 'close'} this pathway.`}</title>
            <line x1={ax} y1={az} x2={bx} y2={bz} stroke="transparent" strokeWidth="4" />
            <line
              x1={ax}
              y1={az}
              x2={bx}
              y2={bz}
              stroke={isClosed ? '#B5643F' : stroke}
              strokeWidth={isClosed ? 0.6 : width}
              strokeDasharray={isClosed ? '1.2 1' : undefined}
              strokeLinecap="round"
              style={{ transition: 'stroke 160ms, stroke-width 160ms' }}
            />
            <rect x={mx - 3.4} y={mz - 1.5} width="6.8" height="3" rx="0.6" fill="#10243D" stroke={isClosed ? '#B5643F' : '#294968'} strokeWidth="0.2" />
            <text x={mx} y={mz + 0.75} textAnchor="middle" fontSize="1.9" fontFamily="JetBrains Mono, monospace" fill={isClosed ? '#F0A184' : onPath ? '#7DD3FC' : '#A9BCD2'}>
              {isClosed ? '×' : e.weight}
            </text>
          </g>
        );
      })}

      {LOCATIONS.map((l) => {
        const [x, z] = l.pos;
        const isCurrent = step?.current === l.id && !done;
        const isVisited = visited.has(l.id);
        const inFrontier = frontier.has(l.id) && !isVisited;
        const onPath = finalPath?.includes(l.id);
        let fill = '#193957';
        let stroke = '#527394';
        let text = '#A9BCD2';
        if (inFrontier) (stroke = '#38BDF8'), (text = '#F1F5F9');
        if (isVisited) (fill = '#1E4163'), (stroke = '#3B82F6'), (text = '#DCEBFA');
        if (onPath) (fill = '#3B82F6'), (stroke = '#60A5FA'), (text = '#FFFFFF');
        if (isCurrent) (fill = '#3B82F6'), (stroke = '#7DD3FC'), (text = '#FFFFFF');
        const d = step?.dist?.[l.id];
        return (
          <g key={l.id}>
            {(l.id === source || l.id === target) && (
              <circle cx={x} cy={z} r="5.1" fill="none" stroke={l.id === source ? '#F1F5F9' : '#38BDF8'} strokeWidth="0.35" strokeDasharray={l.id === target ? '1 0.6' : undefined} />
            )}
            <circle
              cx={x}
              cy={z}
              r="3.9"
              fill={fill}
              stroke={stroke}
              strokeWidth={inFrontier ? 0.55 : 0.4}
              strokeDasharray={inFrontier ? '1.1 0.6' : undefined}
              style={{ transition: 'fill 160ms, stroke 160ms' }}
            />
            <text x={x} y={z + 0.8} textAnchor="middle" fontSize="2.3" fontWeight="600" fontFamily="JetBrains Mono, monospace" fill={text}>
              {l.code}
            </text>
            <text x={x} y={z + 7.3} textAnchor="middle" fontSize="1.8" fontFamily="JetBrains Mono, monospace" fill={d === undefined || d === Infinity ? '#7890A9' : '#A9BCD2'}>
              {fmt(d)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- page ---------- */

export default function AlgorithmLab() {
  const closedEdges = useCampusStore((s) => s.closedEdges);
  const toggleEdge = useCampusStore((s) => s.toggleEdge);
  const reopenAll = useCampusStore((s) => s.reopenAll);
  const [algo, setAlgo] = useState('dijkstra');
  const [source, setSource] = useState('gate');
  const [target, setTarget] = useState('hostel');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timer = useRef(null);

  const graph = useMemo(() => buildCampusGraph(closedEdges), [closedEdges]);
  const closed = useMemo(() => new Set(closedEdges), [closedEdges]);
  const run = useMemo(
    () => (source && target && source !== target ? ALGORITHMS[algo].fn(graph, source, target, { record: true }) : null),
    [graph, algo, source, target]
  );
  const steps = run?.steps ?? [];
  const step = steps[Math.min(index, steps.length - 1)];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [run]);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(timer.current);
  }, [playing, speed, steps.length]);

  const comparison = useMemo(() => {
    if (!source || !target || source === target) return [];
    return ALGO_IDS.map((id) => {
      const r = ALGORITHMS[id].fn(graph, source, target);
      return { id, ...r };
    });
  }, [graph, source, target]);
  const optimum = Math.min(...comparison.map((c) => c.distance));

  const meta = ALGORITHMS[algo];
  const tableRows = LOCATIONS.map((l) => ({
    l,
    d: step?.dist?.[l.id],
    p: step?.prev?.[l.id],
    settled: step?.visited?.includes(l.id),
  })).sort((a, b) => (a.d ?? Infinity) - (b.d ?? Infinity) || a.l.name.localeCompare(b.l.name));

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Algorithm Lab</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Step through the search on the real campus graph</h1>
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">
            {graph.vertexCount} vertices, {graph.edgeCount} weighted edges (metres). Click any edge to close or reopen that pathway — the
            navigator uses the same graph.
          </p>
        </div>
        {closedEdges.length > 0 && (
          <button className="btn" onClick={reopenAll}>
            <RotateCcw size={14} /> Reopen {closedEdges.length} closed pathway{closedEdges.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* controls */}
      <div className="panel mb-4 grid gap-3 p-3 md:grid-cols-[1fr_1fr_auto] lg:grid-cols-[auto_1fr_1fr_auto]">
        <div className="grid grid-cols-4 gap-1 rounded-md border border-ink-700 bg-ink-900 p-1 md:col-span-3 lg:col-span-1">
          {ALGO_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setAlgo(id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${algo === id ? 'bg-ink-700 text-fg' : 'text-fg-muted hover:text-fg'}`}
            >
              {ALGORITHMS[id].short}
            </button>
          ))}
        </div>
        <LocationSelect value={source} onChange={setSource} icon={<span className="block h-2.5 w-2.5 rounded-full border-2 border-fg" />} />
        <LocationSelect value={target} onChange={setTarget} icon={<span className="block h-2.5 w-2.5 rounded-full bg-accent" />} />
        <div className="flex items-center gap-1">
          <button className="icon-btn" onClick={() => setIndex(0)} aria-label="First step" title="First step">
            <ChevronsLeft size={16} />
          </button>
          <button className="icon-btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} aria-label="Previous step" title="Previous step">
            <SkipBack size={15} />
          </button>
          <button
            className="btn-primary h-8 w-20"
            onClick={() => {
              if (index >= steps.length - 1) setIndex(0);
              setPlaying((p) => !p);
            }}
            disabled={!steps.length}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="icon-btn" onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} aria-label="Next step" title="Next step">
            <SkipForward size={15} />
          </button>
          <button className="icon-btn" onClick={() => setIndex(steps.length - 1)} aria-label="Last step" title="Last step">
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* graph */}
        <div className="panel flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 px-4 py-2.5">
            <div className="flex items-center gap-4 text-2xs text-fg-muted">
              <Legend swatch={<span className="h-2.5 w-2.5 rounded-full bg-accent" />} label="Current" />
              <Legend swatch={<span className="h-2.5 w-2.5 rounded-full border border-[#3B82F6] bg-[#1E4163]" />} label="Settled" />
              <Legend swatch={<span className="h-2.5 w-2.5 rounded-full border border-dashed border-accent" />} label="In frontier" />
              <Legend swatch={<span className="h-0.5 w-3 bg-accent" />} label="Shortest path" />
              <Legend swatch={<Scissors size={11} className="text-[#D9774A]" />} label="Closed" />
            </div>
            <div className="flex items-center gap-2 text-2xs text-fg-subtle">
              Speed
              <input
                type="range"
                min="150"
                max="1400"
                step="50"
                value={1550 - speed}
                onChange={(e) => setSpeed(1550 - Number(e.target.value))}
                className="h-1 w-24 accent-[#3B82F6]"
                aria-label="Playback speed"
              />
            </div>
          </div>
          <div className="aspect-[0.95] w-full bg-ink-900 p-2 sm:aspect-auto sm:h-[640px]">
            {run && (
              <GraphCanvas graph={graph} step={step} run={run} source={source} target={target} closed={closed} onToggleEdge={toggleEdge} />
            )}
          </div>
          <div className="border-t border-ink-700 px-4 py-3">
            <div className="flex items-center justify-between text-2xs text-fg-subtle">
              <span className="font-mono">
                Step {steps.length ? index + 1 : 0} / {steps.length}
              </span>
              <span className="uppercase tracking-wider">{step?.kind}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-700">
              <div className="h-full bg-accent transition-all" style={{ width: `${steps.length ? ((index + 1) / steps.length) * 100 : 0}%` }} />
            </div>
            <p className="mt-2 min-h-[2.5rem] font-mono text-xs leading-relaxed text-fg">{step?.message ?? 'Choose two different locations.'}</p>
          </div>
        </div>

        {/* inspector */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">{meta.name}</h2>
              <span className="font-mono text-2xs text-fg-muted">{meta.time}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">{meta.blurb}</p>

            <div className="mt-4">
              <div className="eyebrow mb-1.5">{FRONTIER_NAME[algo]}</div>
              <div className="flex min-h-[2.25rem] flex-wrap gap-1.5 rounded-md border border-ink-700 bg-ink-900 p-1.5">
                {(step?.frontier ?? []).length === 0 && <span className="px-1.5 py-1 text-2xs text-fg-subtle">empty</span>}
                {(step?.frontier ?? []).slice(0, 14).map((f, i) => (
                  <span
                    key={`${f.id}-${i}`}
                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-2xs ${
                      i === 0 ? 'border-accent/50 bg-accent-soft text-fg' : 'border-ink-600 text-fg-muted'
                    } ${step?.visited?.includes(f.id) ? 'line-through opacity-50' : ''}`}
                  >
                    {LOCATION_BY_ID[f.id].code}
                    <span className="text-fg-subtle">{KEY_NAME[algo]}={fmt(f.key)}</span>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-2xs text-fg-subtle">
                {algo === 'dfs' ? 'Top of stack first.' : algo === 'bfs' ? 'Front of queue first.' : 'Smallest key first. Struck-through entries are stale (lazy deletion).'}
              </p>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
              <span className="eyebrow">{algo === 'bfs' || algo === 'dfs' ? 'Depth' : 'Distance'} table</span>
              <span className="font-mono text-2xs text-fg-subtle">{step?.visited?.length ?? 0} settled</span>
            </div>
            <div className="max-h-[340px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-ink-850 text-left text-2xs uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <th className="px-4 py-2 font-medium">Vertex</th>
                    <th className="px-2 py-2 text-right font-medium">{algo === 'astar' ? 'g' : algo === 'bfs' || algo === 'dfs' ? 'depth' : 'dist'}</th>
                    <th className="px-4 py-2 font-medium">prev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/70">
                  {tableRows.map(({ l, d, p, settled }) => (
                    <tr key={l.id} className={step?.current === l.id ? 'bg-accent-soft' : ''}>
                      <td className="px-4 py-1.5">
                        <span className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${settled ? 'bg-accent' : 'bg-ink-600'}`} />
                          <span className="font-mono text-fg-muted">{l.code}</span>
                          <span className="truncate text-fg">{l.name}</span>
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono text-fg">{fmt(d)}</td>
                      <td className="px-4 py-1.5 font-mono text-fg-muted">{p ? LOCATION_BY_ID[p].code : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* comparison */}
      <div className="panel mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 px-4 py-3">
          <div>
            <div className="eyebrow">Head-to-head</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm">
              {LOCATION_BY_ID[source]?.name} <ArrowRight size={13} className="text-fg-subtle" /> {LOCATION_BY_ID[target]?.name}
            </div>
          </div>
          <span className="text-2xs text-fg-subtle">Same graph, same endpoints. Measured live in your browser.</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-2xs uppercase tracking-wider text-fg-subtle">
              <tr className="border-b border-ink-700">
                <th className="px-4 py-2.5 font-medium">Algorithm</th>
                <th className="px-3 py-2.5 font-medium">Frontier</th>
                <th className="px-3 py-2.5 text-right font-medium">Distance</th>
                <th className="px-3 py-2.5 text-right font-medium">Segments</th>
                <th className="px-3 py-2.5 text-right font-medium">Nodes expanded</th>
                <th className="px-3 py-2.5 text-right font-medium">Edge checks</th>
                <th className="px-4 py-2.5 font-medium">Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/70">
              {comparison.map((c) => (
                <tr key={c.id} className={c.id === algo ? 'bg-ink-800/60' : ''}>
                  <td className="px-4 py-2.5 font-medium">{ALGORITHMS[c.id].name}</td>
                  <td className="px-3 py-2.5 text-fg-muted">{ALGORITHMS[c.id].structure}</td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {c.path ? `${c.distance} m` : '—'}
                    {c.path && c.distance === optimum && <span className="ml-1.5 text-2xs text-accent">optimal</span>}
                    {c.path && c.distance > optimum && <span className="ml-1.5 text-2xs text-fg-subtle">+{c.distance - optimum}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-fg-muted">{c.path ? c.hops : '—'}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-fg-muted">{c.visitedOrder.length}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-fg-muted">{c.relaxations}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{ALGORITHMS[c.id].time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* adjacency list */}
      <details className="panel group mt-4 overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="eyebrow">Adjacency list · current graph</span>
          <span className="text-2xs text-fg-subtle group-open:hidden">Show</span>
          <span className="hidden text-2xs text-fg-subtle group-open:inline">Hide</span>
        </summary>
        <div className="grid gap-x-8 gap-y-1 border-t border-ink-700 p-4 font-mono text-xs sm:grid-cols-2 xl:grid-cols-3">
          {graph.vertices().map((v) => (
            <div key={v} className="truncate">
              <span className="text-accent">{LOCATION_BY_ID[v].code}</span>
              <span className="text-fg-subtle"> → </span>
              <span className="text-fg-muted">
                {[...graph.neighbors(v)].map(([n, w]) => `${LOCATION_BY_ID[n].code}(${w})`).join(', ') || '∅'}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  );
}
