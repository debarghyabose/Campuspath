// Sanity tests for the hand-written graph algorithms. Run: npm test
import { buildCampusGraph } from '../src/dsa/campusGraph.js';
import { dijkstra, aStar, bfs, dfs, kShortestPaths } from '../src/dsa/pathfinding.js';
import { buildInstructions } from '../src/dsa/instructions.js';
import { Graph } from '../src/dsa/graph.js';
import { MinHeap } from '../src/dsa/minHeap.js';

let failures = 0;
const check = (cond, msg) => {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
};

// Heap ordering
const h = new MinHeap();
[5, 3, 9, 1, 7, 1, 4].forEach((p, i) => h.push(`v${i}`, p));
const popped = [];
while (!h.isEmpty()) popped.push(h.pop().priority);
check(popped.join() === '1,1,3,4,5,7,9', `heap order ${popped}`);

// Graph basics
const g0 = new Graph();
g0.addEdge('a', 'b', 2).addEdge('b', 'c', 3).addEdge('a', 'c', 10);
check(g0.edgeCount === 3, 'edge count');
check(dijkstra(g0, 'a', 'c').distance === 5, 'toy dijkstra');
g0.removeVertex('b');
check(dijkstra(g0, 'a', 'c').distance === 10, 'after removeVertex');
g0.removeEdge('a', 'c');
check(dijkstra(g0, 'a', 'c').path === null, 'unreachable after removeEdge');

// Brute-force reference: shortest over all simple paths
function bruteForce(g, s, t) {
  let best = Infinity;
  const seen = new Set([s]);
  const go = (u, cost) => {
    if (cost >= best) return;
    if (u === t) return void (best = cost);
    for (const [v, w] of g.neighbors(u)) {
      if (seen.has(v)) continue;
      seen.add(v);
      go(v, cost + w);
      seen.delete(v);
    }
  };
  go(s, 0);
  return best;
}

const g = buildCampusGraph();
console.log(`Campus graph: ${g.vertexCount} vertices, ${g.edgeCount} edges`);
const V = g.vertices();
let pairs = 0;
for (const s of V) {
  for (const t of V) {
    if (s === t) continue;
    pairs++;
    const ref = bruteForce(g, s, t);
    const d = dijkstra(g, s, t, { record: true });
    const a = aStar(g, s, t);
    const b = bfs(g, s, t);
    const f = dfs(g, s, t);
    check(d.distance === ref, `dijkstra ${s}->${t}: ${d.distance} vs ${ref}`);
    check(a.distance === ref, `astar ${s}->${t}: ${a.distance} vs ${ref}`);
    check(a.visitedOrder.length <= d.visitedOrder.length, `astar expands <= dijkstra ${s}->${t}`);
    check(b.path && f.path, `bfs/dfs found path ${s}->${t}`);
    check(f.distance >= ref && b.distance >= ref, `bfs/dfs never shorter ${s}->${t}`);
    const ks = kShortestPaths(g, s, t, 3);
    check(ks[0].distance === ref, `yen first ${s}->${t}`);
    for (let i = 1; i < ks.length; i++) check(ks[i].distance >= ks[i - 1].distance, `yen sorted ${s}->${t}`);
    check(new Set(ks.map((k) => k.path.join())).size === ks.length, `yen unique ${s}->${t}`);
    ks.forEach((k) => check(new Set(k.path).size === k.path.length, `yen loopless ${s}->${t}`));
    check(buildInstructions(d.path, g).length === d.path.length, `instructions ${s}->${t}`);
  }
}
console.log(`Checked ${pairs} ordered pairs against brute force.`);

const sample = dijkstra(g, 'gate', 'ece');
console.log('Example gate -> ece:', sample.path.join(' -> '), `${sample.distance} m`);
buildInstructions(sample.path, g).forEach((s) => console.log('  ', s.text, s.distance ? `(${s.distance} m)` : ''));
console.log('Alternatives:', kShortestPaths(g, 'gate', 'ece', 3).map((k) => `${k.path.join('>')} ${k.distance}m`));

if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log('All tests passed.');
