import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  Route,
  Search,
  Layers,
  GitBranch,
  Gauge,
  MousePointerClick,
  Waypoints,
  Footprints,
} from 'lucide-react';
import CampusScene from '../scene/CampusScene.jsx';
import { buildCampusGraph } from '../dsa/campusGraph.js';
import { allPairs } from '../dsa/pathfinding.js';
import { LOCATION_BY_ID, UNIVERSITY, formatDistance } from '../data/campus.js';

const FEATURES = [
  { icon: Boxes, title: 'Interactive 3D campus', body: 'A conceptual model of IEM College. Orbit, pan and zoom; click any building for details.' },
  { icon: Route, title: 'Shortest-path routing', body: "Dijkstra's algorithm over a weighted graph of real pathway lengths, rendered as a live route." },
  { icon: Waypoints, title: 'Alternative routes', body: "Yen's K-shortest-paths algorithm surfaces the next-best loopless routes with their extra distance." },
  { icon: Footprints, title: 'Turn-by-turn guidance', body: 'Turn directions are derived from the change in bearing at every junction along the route.' },
  { icon: Search, title: 'Search and filters', body: 'Find buildings by name or facility and filter by academic, food, residential and more.' },
  { icon: GitBranch, title: 'Pathway closures', body: 'Close a pathway in the Algorithm Lab and every route recomputes around it. Saved locally.' },
];

const STEPS = [
  { icon: MousePointerClick, title: 'Choose two places', body: 'Pick a start and destination from the list, or click buildings directly on the 3D map.' },
  { icon: Layers, title: 'The graph is searched', body: 'Each location is a vertex and each pathway an edge weighted in metres. The algorithm settles vertices nearest-first.' },
  { icon: Gauge, title: 'Follow the route', body: 'Distance, walking time and turn-by-turn directions appear alongside an animated path on the map.' },
];

const SNIPPET = `while (!heap.isEmpty()) {
  const { value: u, priority: d } = heap.pop();
  if (visited.has(u) || d > dist[u]) continue;  // stale entry
  visited.add(u);
  if (u === target) break;

  for (const [v, w] of graph.neighbors(u)) {
    const nd = dist[u] + w;
    if (nd < dist[v]) {         // relax edge (u, v)
      dist[v] = nd;
      prev[v] = u;
      heap.push(v, nd);
    }
  }
}`;

const fade = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export default function Landing() {
  const facts = useMemo(() => {
    const g = buildCampusGraph();
    const ap = allPairs(g);
    let diameter = { d: 0 };
    for (const s in ap) for (const t in ap[s]) if (ap[s][t] > diameter.d) diameter = { d: ap[s][t], s, t };
    const total = g.edges().reduce((sum, e) => sum + e.weight, 0);
    return {
      vertices: g.vertexCount,
      edges: g.edgeCount,
      total,
      diameter,
    };
  }, []);

  return (
    <div>
      {/* hero */}
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:pt-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1 text-xs text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Campus navigation for {UNIVERSITY}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
            Navigate your campus.
            <br />
            <span className="bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent">Smarter.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-fg-muted">
            CampusPath 3D models the university as a weighted graph and finds the shortest walking route between any two
            buildings — then shows it to you on an interactive 3D map, step by step.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/navigate" className="btn-primary h-10 px-4">
              Start navigation <ArrowRight size={15} />
            </Link>
            <Link to="/explore" className="btn h-10 px-4">
              Explore campus
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-2">
            <div className="rounded-xl border border-ink-700 bg-ink-850/80 px-3 py-3 shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-glow/50 hover:shadow-[0_12px_28px_rgba(2,8,23,0.38)] sm:px-4">
              <dt className="stat-label">Locations</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{facts.vertices}</dd>
            </div>
            <div className="rounded-xl border border-ink-700 bg-ink-850/80 px-3 py-3 shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-glow/50 hover:shadow-[0_12px_28px_rgba(2,8,23,0.38)] sm:px-4">
              <dt className="stat-label">Pathways</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{facts.edges}</dd>
            </div>
            <div className="rounded-xl border border-ink-700 bg-ink-850/80 px-3 py-3 shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-glow/50 hover:shadow-[0_12px_28px_rgba(2,8,23,0.38)] sm:px-4">
              <dt className="stat-label">Walkways</dt>
              <dd className="mt-1 font-mono text-lg font-semibold tracking-tight text-fg sm:text-2xl">{formatDistance(facts.total)}</dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-[380px] overflow-hidden rounded-[18px] border border-ink-700 bg-ink-800 shadow-[0_0_0_1px_rgba(56,189,248,0.14),0_20px_60px_rgba(2,8,23,0.55),0_0_38px_rgba(59,130,246,0.14)] sm:h-[480px] lg:h-[560px]"
        >
          <CampusScene mode="preview" />
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-glow/30 bg-ink-900/85 px-3 py-1.5 text-2xs font-medium text-fg backdrop-blur-xl shadow-[0_4px_18px_rgba(2,8,23,0.35)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-glow shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            Live 3D scene <span className="text-fg-subtle">· drag to rotate</span>
          </div>
          <Link
            to="/explore"
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-900/85 px-3 py-2 text-xs font-medium text-fg shadow-[0_4px_18px_rgba(2,8,23,0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-glow/50 hover:text-white"
          >
            Open full map <ArrowRight size={13} />
          </Link>
        </motion.div>
      </section>

      {/* features */}
      <section className="border-t border-ink-700 bg-ink-950">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <motion.div {...fade} className="max-w-xl">
            <div className="eyebrow">Features</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Everything a campus map should do</h2>
          </motion.div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ ...fade.transition, delay: i * 0.04 }} className="rounded-xl border border-ink-700 bg-ink-850/75 p-6 shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-glow/40 hover:shadow-[0_16px_34px_rgba(2,8,23,0.4)]">
                <f.icon size={18} className="text-glow" strokeWidth={1.75} />
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="border-t border-ink-700">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <motion.div {...fade} className="max-w-xl">
            <div className="eyebrow">How it works</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">From two buildings to one route</h2>
          </motion.div>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.li key={s.title} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-600 bg-ink-850 font-mono text-xs text-fg-muted">
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 bg-ink-700" />
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold">
                  <s.icon size={15} className="text-fg-muted" />
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* DSA */}
      <section className="border-t border-ink-700 bg-ink-950">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start">
          <motion.div {...fade}>
            <div className="eyebrow">Under the hood</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Graph algorithms, written from scratch</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-fg-muted">
              No routing libraries. The campus is an undirected weighted graph stored as an adjacency list. Shortest paths use
              Dijkstra with a hand-written binary min-heap; A* adds a straight-line heuristic; BFS and DFS show what happens
              when weights are ignored.
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-ink-700">
              <table className="w-full text-sm">
                <thead className="bg-ink-850 text-left text-2xs uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <th className="px-4 py-2 font-medium">Component</th>
                    <th className="px-4 py-2 font-medium">Structure</th>
                    <th className="px-4 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700 bg-ink-900">
                  {[
                    ['Campus map', 'Adjacency list', 'O(V + E) space'],
                    ['Dijkstra', 'Binary min-heap', 'O((V + E) log V)'],
                    ['A* search', 'Min-heap on g + h', 'O((V + E) log V)'],
                    ['BFS', 'FIFO queue', 'O(V + E)'],
                    ['DFS', 'LIFO stack', 'O(V + E)'],
                    ["Yen's K-shortest", 'Repeated Dijkstra', 'O(K·V·(V + E) log V)'],
                  ].map(([a, b, c]) => (
                    <tr key={a}>
                      <td className="px-4 py-2.5">{a}</td>
                      <td className="px-4 py-2.5 text-fg-muted">{b}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-fg-subtle">
              Longest shortest route on campus: {LOCATION_BY_ID[facts.diameter.s].name} to {LOCATION_BY_ID[facts.diameter.t].name},{' '}
              {formatDistance(facts.diameter.d)} (graph diameter, from {facts.vertices} runs of Dijkstra).
            </p>
          </motion.div>

          <motion.div {...fade} className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
              <span className="font-mono text-2xs text-fg-muted">src/dsa/pathfinding.js</span>
              <span className="text-2xs text-fg-subtle">dijkstra()</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fg-muted">
              <code>{SNIPPET}</code>
            </pre>
            <div className="border-t border-ink-700 px-4 py-3">
              <Link to="/lab" className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover">
                Watch it run in the Algorithm Lab <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
