/**
 * Shortest-path and traversal algorithms, implemented from scratch.
 *
 * Every function returns the same result shape:
 *   {
 *     algorithm, path: string[] | null, distance: number,
 *     hops, visitedOrder: string[], relaxations, steps (if record), elapsedMs
 *   }
 *
 * `steps` is an array of snapshots used by the Algorithm Lab to replay the run.
 */
import { MinHeap, Queue, Stack } from './minHeap.js';
import { edgeKey } from './graph.js';

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

function reconstructPath(prev, source, target) {
  if (source === target) return [source];
  if (prev[target] === undefined || prev[target] === null) return null;
  const path = [];
  for (let at = target; at !== null && at !== undefined; at = prev[at]) {
    path.push(at);
    if (at === source) break;
  }
  path.reverse();
  return path[0] === source ? path : null;
}

function initTables(graph) {
  const dist = {};
  const prev = {};
  for (const v of graph.vertices()) {
    dist[v] = Infinity;
    prev[v] = null;
  }
  return { dist, prev };
}

function blocked(u, v, excludedNodes, excludedEdges) {
  return excludedNodes.has(v) || excludedEdges.has(edgeKey(u, v));
}

function finish(algorithm, graph, path, extra) {
  return {
    algorithm,
    path,
    distance: path ? graph.pathCost(path) : Infinity,
    hops: path ? path.length - 1 : 0,
    ...extra,
  };
}

/* ------------------------------------------------------------------ */
/* Dijkstra — O((V + E) log V) with a binary heap                      */
/* ------------------------------------------------------------------ */
export function dijkstra(graph, source, target, opts = {}) {
  const { record = false, excludedNodes = new Set(), excludedEdges = new Set() } = opts;
  const t0 = now();
  const { dist, prev } = initTables(graph);
  const visited = new Set();
  const visitedOrder = [];
  const steps = [];
  const heap = new MinHeap();
  let relaxations = 0;

  const snap = (kind, extra) => {
    if (!record) return;
    steps.push({
      kind,
      dist: { ...dist },
      prev: { ...prev },
      visited: [...visited],
      frontier: heap.snapshot().map((e) => ({ id: e.value, key: e.priority })),
      ...extra,
    });
  };

  dist[source] = 0;
  heap.push(source, 0);
  snap('init', { current: source, message: `Initialise: dist(${source}) = 0, all others = ∞. Push ${source} into the min-heap.` });

  while (!heap.isEmpty()) {
    const { value: u, priority: d } = heap.pop();
    if (visited.has(u) || d > dist[u]) {
      snap('stale', { current: u, message: `Pop ${u} (key ${d}) — stale entry, already settled. Skip.` });
      continue;
    }
    visited.add(u);
    visitedOrder.push(u);
    snap('visit', { current: u, message: `Pop ${u} with smallest tentative distance ${d} m. Mark as settled.` });
    if (u === target) break;

    for (const [v, w] of graph.neighbors(u)) {
      if (visited.has(v) || blocked(u, v, excludedNodes, excludedEdges)) continue;
      relaxations++;
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        prev[v] = u;
        heap.push(v, nd);
        snap('relax', {
          current: u,
          edge: [u, v],
          improved: true,
          message: `Relax ${u}→${v}: ${dist[u]} + ${w} = ${nd} < ${old === Infinity ? '∞' : old}. Update and push ${v}.`,
        });
      } else {
        snap('relax', {
          current: u,
          edge: [u, v],
          improved: false,
          message: `Relax ${u}→${v}: ${dist[u]} + ${w} = ${nd} ≥ ${dist[v]}. No improvement.`,
        });
      }
    }
  }

  const path = reconstructPath(prev, source, target);
  snap('done', { current: target, path, message: path ? `Target reached. Shortest distance = ${dist[target]} m.` : 'Target unreachable.' });
  return finish('dijkstra', graph, path, { visitedOrder, relaxations, steps, elapsedMs: now() - t0 });
}

/* ------------------------------------------------------------------ */
/* A* — Dijkstra guided by an admissible straight-line heuristic       */
/* ------------------------------------------------------------------ */
export function aStar(graph, source, target, opts = {}) {
  const {
    record = false,
    excludedNodes = new Set(),
    excludedEdges = new Set(),
    heuristic = defaultHeuristic(graph, target),
  } = opts;
  const t0 = now();
  const { dist: g, prev } = initTables(graph);
  const closed = new Set();
  const visitedOrder = [];
  const steps = [];
  const open = new MinHeap();
  let relaxations = 0;
  const h = (v) => Math.round(heuristic(v));

  const snap = (kind, extra) => {
    if (!record) return;
    steps.push({
      kind,
      dist: { ...g },
      prev: { ...prev },
      visited: [...closed],
      frontier: open.snapshot().map((e) => ({ id: e.value, key: e.priority })),
      ...extra,
    });
  };

  g[source] = 0;
  open.push(source, h(source));
  snap('init', { current: source, message: `Initialise: g(${source}) = 0, h(${source}) = ${h(source)} m. f = g + h.` });

  while (!open.isEmpty()) {
    const { value: u, priority: f } = open.pop();
    if (closed.has(u)) {
      snap('stale', { current: u, message: `Pop ${u} (f ${f}) — already closed. Skip.` });
      continue;
    }
    closed.add(u);
    visitedOrder.push(u);
    snap('visit', { current: u, message: `Expand ${u}: g = ${g[u]}, h = ${h(u)}, f = ${f}.` });
    if (u === target) break;

    for (const [v, w] of graph.neighbors(u)) {
      if (closed.has(v) || blocked(u, v, excludedNodes, excludedEdges)) continue;
      relaxations++;
      const ng = g[u] + w;
      if (ng < g[v]) {
        g[v] = ng;
        prev[v] = u;
        open.push(v, ng + h(v));
        snap('relax', {
          current: u,
          edge: [u, v],
          improved: true,
          message: `Edge ${u}→${v}: g = ${ng}, h = ${h(v)}, f = ${ng + h(v)}. Push ${v}.`,
        });
      } else {
        snap('relax', { current: u, edge: [u, v], improved: false, message: `Edge ${u}→${v}: g = ${ng} ≥ ${g[v]}. Ignore.` });
      }
    }
  }

  const path = reconstructPath(prev, source, target);
  snap('done', { current: target, path, message: path ? `Target reached. Cost = ${g[target]} m after expanding ${visitedOrder.length} nodes.` : 'Target unreachable.' });
  return finish('astar', graph, path, { visitedOrder, relaxations, steps, elapsedMs: now() - t0 });
}

/** Straight-line distance in metres, read from vertex data {pos:[x,z], scale}. */
export function defaultHeuristic(graph, target) {
  const t = graph.getVertex(target);
  return (v) => {
    const p = graph.getVertex(v);
    if (!p?.pos || !t?.pos) return 0;
    const scale = p.scale ?? 1;
    return Math.hypot(p.pos[0] - t.pos[0], p.pos[1] - t.pos[1]) * scale;
  };
}

/* ------------------------------------------------------------------ */
/* BFS — fewest pathway segments (ignores weights) — O(V + E)          */
/* ------------------------------------------------------------------ */
export function bfs(graph, source, target, opts = {}) {
  const { record = false, excludedNodes = new Set(), excludedEdges = new Set() } = opts;
  const t0 = now();
  const { dist: depth, prev } = initTables(graph);
  const seen = new Set([source]);
  const visitedOrder = [];
  const steps = [];
  const queue = new Queue();
  let relaxations = 0;

  const snap = (kind, extra) => {
    if (!record) return;
    steps.push({
      kind,
      dist: { ...depth },
      prev: { ...prev },
      visited: [...visitedOrder],
      frontier: queue.snapshot().map((id) => ({ id, key: depth[id] })),
      ...extra,
    });
  };

  depth[source] = 0;
  queue.enqueue(source);
  snap('init', { current: source, message: `Enqueue ${source} at depth 0.` });

  while (!queue.isEmpty()) {
    const u = queue.dequeue();
    visitedOrder.push(u);
    snap('visit', { current: u, message: `Dequeue ${u} (depth ${depth[u]}).` });
    if (u === target) break;
    for (const [v] of graph.neighbors(u)) {
      if (seen.has(v) || blocked(u, v, excludedNodes, excludedEdges)) continue;
      relaxations++;
      seen.add(v);
      depth[v] = depth[u] + 1;
      prev[v] = u;
      queue.enqueue(v);
      snap('relax', { current: u, edge: [u, v], improved: true, message: `Discover ${v} at depth ${depth[v]}. Enqueue.` });
    }
  }

  const path = reconstructPath(prev, source, target);
  snap('done', { current: target, path, message: path ? `Found a route with ${path.length - 1} segments.` : 'Target unreachable.' });
  return finish('bfs', graph, path, { visitedOrder, relaxations, steps, elapsedMs: now() - t0 });
}

/* ------------------------------------------------------------------ */
/* DFS — iterative, explicit stack — O(V + E). Finds *a* path.         */
/* ------------------------------------------------------------------ */
export function dfs(graph, source, target, opts = {}) {
  const { record = false, excludedNodes = new Set(), excludedEdges = new Set() } = opts;
  const t0 = now();
  const { dist: depth, prev } = initTables(graph);
  const visited = new Set();
  const visitedOrder = [];
  const steps = [];
  const stack = new Stack();
  let relaxations = 0;

  const snap = (kind, extra) => {
    if (!record) return;
    steps.push({
      kind,
      dist: { ...depth },
      prev: { ...prev },
      visited: [...visited],
      frontier: stack.snapshot().map((id) => ({ id, key: depth[id] })),
      ...extra,
    });
  };

  depth[source] = 0;
  stack.push(source);
  snap('init', { current: source, message: `Push ${source} onto the stack.` });

  while (!stack.isEmpty()) {
    const u = stack.pop();
    if (visited.has(u)) {
      snap('stale', { current: u, message: `Pop ${u} — already visited. Skip.` });
      continue;
    }
    visited.add(u);
    visitedOrder.push(u);
    snap('visit', { current: u, message: `Pop ${u} and visit (depth ${depth[u]}).` });
    if (u === target) break;
    // Push neighbours in reverse alphabetical order so they are explored alphabetically.
    const nbrs = [...graph.neighbors(u)].map(([v]) => v).sort().reverse();
    for (const v of nbrs) {
      if (visited.has(v) || blocked(u, v, excludedNodes, excludedEdges)) continue;
      relaxations++;
      prev[v] = u;
      depth[v] = depth[u] + 1;
      stack.push(v);
      snap('relax', { current: u, edge: [u, v], improved: true, message: `Push neighbour ${v}.` });
    }
  }

  const path = reconstructPath(prev, source, target);
  snap('done', { current: target, path, message: path ? `Found a path (not necessarily shortest): ${graph.pathCost(path)} m.` : 'Target unreachable.' });
  return finish('dfs', graph, path, { visitedOrder, relaxations, steps, elapsedMs: now() - t0 });
}

/* ------------------------------------------------------------------ */
/* Yen's algorithm — K loopless shortest paths (alternative routes)    */
/* O(K · V · (V + E) log V)                                             */
/* ------------------------------------------------------------------ */
export function kShortestPaths(graph, source, target, K = 3) {
  const first = dijkstra(graph, source, target);
  if (!first.path) return [];
  const A = [{ path: first.path, distance: first.distance }];
  const B = [];
  const sameArray = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
  const known = (p) => A.some((a) => sameArray(a.path, p)) || B.some((b) => sameArray(b.path, p));

  for (let k = 1; k < K; k++) {
    const last = A[k - 1].path;
    for (let i = 0; i < last.length - 1; i++) {
      const spur = last[i];
      const root = last.slice(0, i + 1);
      const excludedEdges = new Set();
      for (const { path } of A) {
        if (path.length > i + 1 && sameArray(path.slice(0, i + 1), root)) {
          excludedEdges.add(edgeKey(path[i], path[i + 1]));
        }
      }
      const excludedNodes = new Set(root.slice(0, -1));
      const spurRes = dijkstra(graph, spur, target, { excludedNodes, excludedEdges });
      if (!spurRes.path) continue;
      const candidate = root.slice(0, -1).concat(spurRes.path);
      if (!known(candidate)) B.push({ path: candidate, distance: graph.pathCost(candidate) });
    }
    if (B.length === 0) break;
    B.sort((x, y) => x.distance - y.distance || x.path.length - y.path.length);
    A.push(B.shift());
  }
  return A;
}

/* ------------------------------------------------------------------ */
/* All-pairs shortest distances (V runs of Dijkstra) — for stats        */
/* ------------------------------------------------------------------ */
export function allPairs(graph) {
  const out = {};
  for (const s of graph.vertices()) {
    out[s] = {};
    for (const t of graph.vertices()) {
      out[s][t] = s === t ? 0 : dijkstra(graph, s, t).distance;
    }
  }
  return out;
}

export const ALGORITHMS = {
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    short: 'Dijkstra',
    fn: dijkstra,
    structure: 'Binary min-heap',
    time: 'O((V + E) log V)',
    space: 'O(V)',
    optimal: true,
    blurb: 'Guaranteed shortest walking distance. Settles nodes in order of distance from the start.',
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    short: 'A*',
    fn: aStar,
    structure: 'Binary min-heap (f = g + h)',
    time: 'O((V + E) log V) worst case',
    space: 'O(V)',
    optimal: true,
    blurb: 'Shortest distance, but uses straight-line distance to the goal to expand fewer nodes.',
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    short: 'BFS',
    fn: bfs,
    structure: 'FIFO queue',
    time: 'O(V + E)',
    space: 'O(V)',
    optimal: false,
    blurb: 'Fewest pathway segments (fewest junctions). Ignores distances, so not always the shortest walk.',
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search',
    short: 'DFS',
    fn: dfs,
    structure: 'LIFO stack',
    time: 'O(V + E)',
    space: 'O(V)',
    optimal: false,
    blurb: 'Explores one branch fully before backtracking. Finds a path, rarely the shortest.',
  },
};
