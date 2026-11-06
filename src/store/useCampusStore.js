import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildCampusGraph } from '../dsa/campusGraph.js';
import { ALGORITHMS, kShortestPaths } from '../dsa/pathfinding.js';
import { buildInstructions } from '../dsa/instructions.js';
import { edgeKey } from '../dsa/graph.js';
import { LOCATION_BY_ID, walkingSeconds } from '../data/campus.js';

const DEFAULT_VIEW = { position: [62, 72, 96], target: [0, 0, 2] };

function viewForLocation(id) {
  const [x, z] = LOCATION_BY_ID[id].pos;
  return { position: [x + 32, 40, z + 46], target: [x, 2, z] };
}

function viewForPath(path) {
  const xs = path.map((id) => LOCATION_BY_ID[id].pos[0]);
  const zs = path.map((id) => LOCATION_BY_ID[id].pos[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 30);
  const d = span * 1.05 + 20;
  return { position: [cx + d * 0.45, d * 0.95, cz + d * 0.8], target: [cx, 0, cz] };
}

function describeRoute(graph, path, algorithmId) {
  const distance = graph.pathCost(path);
  const intermediate = Math.max(path.length - 2, 0);
  return {
    path,
    distance,
    intermediate,
    seconds: walkingSeconds(distance, intermediate),
    instructions: buildInstructions(path, graph),
    algorithm: algorithmId,
  };
}

export const useCampusStore = create(
  persist(
    (set, get) => ({
      // ---- exploration ----
      selectedId: null,
      hoveredId: null,
      search: '',
      categoryFilter: null,
      showLabels: true,

      // ---- camera ----
      cameraRequest: { ...DEFAULT_VIEW, nonce: 0 },
      zoomRequest: { factor: 1, nonce: 0 },

      // ---- navigation ----
      from: 'gate',
      to: '',
      algorithm: 'dijkstra',
      routes: [], // [primary, ...alternatives]
      activeRoute: 0,
      lastRun: null, // { visited, relaxations, elapsedMs }
      routeError: null,
      closedEdges: [],
      recentRoutes: [],

      select: (id) => {
        set({ selectedId: id });
        if (id) get().focusLocation(id);
      },
      setHovered: (id) => set({ hoveredId: id }),
      setSearch: (search) => set({ search }),
      setCategoryFilter: (c) => set((s) => ({ categoryFilter: s.categoryFilter === c ? null : c })),
      toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

      focusLocation: (id) =>
        set((s) => ({ cameraRequest: { ...viewForLocation(id), nonce: s.cameraRequest.nonce + 1 } })),
      focusPath: (path) =>
        set((s) => ({ cameraRequest: { ...viewForPath(path), nonce: s.cameraRequest.nonce + 1 } })),
      resetCamera: () => set((s) => ({ cameraRequest: { ...DEFAULT_VIEW, nonce: s.cameraRequest.nonce + 1 } })),
      zoom: (factor) => set((s) => ({ zoomRequest: { factor, nonce: s.zoomRequest.nonce + 1 } })),

      setFrom: (from) => set({ from, routes: [], routeError: null }),
      setTo: (to) => set({ to, routes: [], routeError: null }),
      swap: () => set((s) => ({ from: s.to, to: s.from, routes: [], routeError: null })),
      setAlgorithm: (algorithm) => set({ algorithm }),
      setActiveRoute: (i) => {
        const r = get().routes[i];
        set({ activeRoute: i });
        if (r) get().focusPath(r.path);
      },

      findRoute: () => {
        const { from, to, algorithm, closedEdges } = get();
        if (!from || !to) return set({ routeError: 'Choose both a starting point and a destination.' });
        if (from === to) return set({ routeError: 'Start and destination are the same location.' });

        const graph = buildCampusGraph(closedEdges);
        const algo = ALGORITHMS[algorithm];
        const result = algo.fn(graph, from, to);
        if (!result.path) {
          return set({
            routes: [],
            routeError: 'No route exists — the destination is cut off by closed pathways.',
          });
        }

        const primary = describeRoute(graph, result.path, algorithm);
        // Alternatives: Yen's K-shortest paths, excluding whichever path the chosen algorithm returned.
        const alternatives = kShortestPaths(graph, from, to, 4)
          .filter((k) => k.path.join() !== result.path.join())
          .slice(0, 2)
          .map((k) => describeRoute(graph, k.path, 'yen'));

        const entry = { from, to, at: Date.now() };
        set((s) => ({
          routes: [primary, ...alternatives],
          activeRoute: 0,
          routeError: null,
          selectedId: null,
          lastRun: {
            visited: result.visitedOrder.length,
            relaxations: result.relaxations,
            elapsedMs: result.elapsedMs,
          },
          recentRoutes: [entry, ...s.recentRoutes.filter((r) => !(r.from === from && r.to === to))].slice(0, 5),
        }));
        get().focusPath(primary.path);
      },

      clearRoute: () => {
        set({ routes: [], activeRoute: 0, routeError: null, lastRun: null });
        get().resetCamera();
      },

      /** "Navigate here": make `id` the destination, keeping a sensible start. */
      navigateTo: (id) =>
        set((s) => ({
          to: id,
          from: s.from && s.from !== id ? s.from : id === 'gate' ? 'acadA' : 'gate',
          routes: [],
          routeError: null,
          selectedId: null,
        })),
      setAsStart: (id) => set((s) => ({ from: id, to: s.to === id ? '' : s.to, routes: [], selectedId: null })),

      toggleEdge: (a, b) => {
        const key = edgeKey(a, b);
        set((s) => ({
          closedEdges: s.closedEdges.includes(key)
            ? s.closedEdges.filter((k) => k !== key)
            : [...s.closedEdges, key],
          routes: [],
        }));
      },
      reopenAll: () => set({ closedEdges: [], routes: [] }),
    }),
    {
      name: 'campuspath-3d',
      version: 1,
      partialize: (s) => ({
        closedEdges: s.closedEdges,
        recentRoutes: s.recentRoutes,
        algorithm: s.algorithm,
        showLabels: s.showLabels,
      }),
    }
  )
);

export const DEFAULT_CAMERA = DEFAULT_VIEW;
