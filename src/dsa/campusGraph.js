import { Graph, edgeKey } from './graph.js';
import { LOCATIONS, EDGES, SCALE } from '../data/campus.js';

/**
 * Build the IEM College campus graph. Pathways listed in `closedEdges`
 * (canonical "a|b" keys) are left out — this is how pathway closures work.
 */
export function buildCampusGraph(closedEdges = []) {
  const closed = new Set(closedEdges);
  const g = new Graph();
  for (const loc of LOCATIONS) {
    g.addVertex(loc.id, { pos: loc.pos, scale: SCALE, name: loc.name });
  }
  for (const e of EDGES) {
    if (!closed.has(edgeKey(e.a, e.b))) g.addEdge(e.a, e.b, e.weight);
  }
  return g;
}
