<<<<<<< HEAD
# CampusPath 3D — Intelligent Campus Navigation System

A Data Structures & Algorithms project: shortest-path navigation across a conceptual IEM College
campus, shown on an interactive 3D model. All graph algorithms are written
by hand — no pathfinding libraries.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # verifies every algorithm against brute force on all 210 location pairs
npm run build    # production build in dist/
```

Requires Node 18+. No backend, no API keys. Settings, closed pathways and recent routes are saved in LocalStorage.

## Pages

| Route       | Page            | What it does |
|-------------|-----------------|--------------|
| `/`         | Overview        | Landing page with a live 3D campus preview, features, how it works, DSA summary |
| `/explore`  | Explore Campus  | Full 3D map, search, category filters, building details, "Navigate here" |
| `/navigate` | Navigate        | Route planner: start/destination, algorithm choice, animated route, alternatives, turn-by-turn |
| `/lab`      | Algorithm Lab   | Step-by-step replay of Dijkstra / A* / BFS / DFS on the campus graph, heap/queue/stack view, distance table, head-to-head comparison, pathway closures |
| `/about`    | About           | Modelling, algorithms, walking-time method, code structure, limitations |

## Data structures and algorithms

| File | Contents |
|------|----------|
| `src/dsa/graph.js` | `Graph` — weighted undirected adjacency list (`Map<id, Map<id, weight>>`): `addVertex`, `addEdge`, `removeEdge`, `removeVertex`, `hasEdge`, `getWeight`, `neighbors`, `degree`, `edges`, `pathCost`, `clone` |
| `src/dsa/minHeap.js` | `MinHeap` (binary heap, O(log n) push/pop), `Queue` (O(1) amortised), `Stack` |
| `src/dsa/pathfinding.js` | `dijkstra`, `aStar`, `bfs`, `dfs`, `kShortestPaths` (Yen), `allPairs`. Each can record per-step snapshots for the visualiser |
| `src/dsa/instructions.js` | Bearing calculation and turn-by-turn instruction generation |
| `src/dsa/campusGraph.js` | Builds the campus graph from data, skipping closed pathways |

| Algorithm | Frontier | Time | Optimal (metres) |
|-----------|----------|------|------------------|
| Dijkstra | Binary min-heap, lazy deletion | O((V + E) log V) | Yes |
| A* | Min-heap on f = g + h (straight-line h) | O((V + E) log V) worst case | Yes (h is admissible) |
| BFS | FIFO queue | O(V + E) | No — minimises segments |
| DFS | LIFO stack | O(V + E) | No |
| Yen's K-shortest | Repeated Dijkstra | O(K·V·(V + E) log V) | Gives 2nd/3rd best routes |

### Distances and walking time

- 1 world unit = 5 m. Edge weight = straight-line length × winding factor (1.02–1.12), rounded **up** to 5 m,
  so weights are never below straight-line distance (keeps A* admissible).
- Walking time = distance / 1.25 m/s + 10 s per intermediate junction. 1.25 m/s is a little below the typical
  adult pace (~1.4 m/s) to account for crossings, steps and other pedestrians.

## Project structure

```
src/
  data/campus.js            locations, pathways, distance + walking-time model
  dsa/                      graph, heap/queue/stack, algorithms, instructions
  store/useCampusStore.js   Zustand store (persisted subset → LocalStorage)
  scene/                    React Three Fiber: buildings, environment, route layer, camera rig
  components/               nav bar, selects, location details, scene controls
  pages/                    Landing, Explore, Navigate, AlgorithmLab, About
scripts/test-algorithms.mjs correctness tests
```

## Stack

React 18, Vite 5, JavaScript, Tailwind CSS 3, Three.js, React Three Fiber, @react-three/drei, Framer Motion,
Zustand, Lucide React, React Router 6.
=======
# Campuspath
>>>>>>> 2647d8cb09a6dbeb8ed491e5019148bbdf3de572
