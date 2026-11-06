/**
 * Weighted, undirected graph backed by an adjacency list.
 *
 *   adjacency: Map<vertexId, Map<neighbourId, weight>>
 *   vertexData: Map<vertexId, any>   (e.g. position, name)
 *
 * Space: O(V + E). Neighbour lookup and edge weight lookup are O(1) average.
 */
export class Graph {
  constructor() {
    this.adjacency = new Map();
    this.vertexData = new Map();
  }

  /** O(1) */
  addVertex(id, data = {}) {
    if (!this.adjacency.has(id)) this.adjacency.set(id, new Map());
    this.vertexData.set(id, data);
    return this;
  }

  /** O(1). Undirected: stores the edge in both adjacency maps. */
  addEdge(a, b, weight) {
    if (a === b) throw new Error('Self-loops are not allowed');
    if (!(weight > 0)) throw new Error(`Edge ${a}-${b} needs a positive weight`);
    if (!this.adjacency.has(a)) this.addVertex(a);
    if (!this.adjacency.has(b)) this.addVertex(b);
    this.adjacency.get(a).set(b, weight);
    this.adjacency.get(b).set(a, weight);
    return this;
  }

  /** O(1) */
  removeEdge(a, b) {
    const removedA = this.adjacency.get(a)?.delete(b) ?? false;
    const removedB = this.adjacency.get(b)?.delete(a) ?? false;
    return removedA || removedB;
  }

  /** O(deg(v)) — removes the vertex and every edge incident to it. */
  removeVertex(id) {
    const neighbours = this.adjacency.get(id);
    if (!neighbours) return false;
    for (const n of neighbours.keys()) this.adjacency.get(n).delete(id);
    this.adjacency.delete(id);
    this.vertexData.delete(id);
    return true;
  }

  hasVertex(id) {
    return this.adjacency.has(id);
  }

  hasEdge(a, b) {
    return this.adjacency.get(a)?.has(b) ?? false;
  }

  getWeight(a, b) {
    return this.adjacency.get(a)?.get(b) ?? Infinity;
  }

  /** Returns an iterable of [neighbourId, weight] pairs. */
  neighbors(id) {
    return this.adjacency.get(id)?.entries() ?? [][Symbol.iterator]();
  }

  degree(id) {
    return this.adjacency.get(id)?.size ?? 0;
  }

  getVertex(id) {
    return this.vertexData.get(id);
  }

  vertices() {
    return [...this.adjacency.keys()];
  }

  /** Each undirected edge reported once. O(V + E) */
  edges() {
    const out = [];
    for (const [a, nbrs] of this.adjacency) {
      for (const [b, w] of nbrs) if (a < b) out.push({ a, b, weight: w });
    }
    return out;
  }

  get vertexCount() {
    return this.adjacency.size;
  }

  get edgeCount() {
    let sum = 0;
    for (const nbrs of this.adjacency.values()) sum += nbrs.size;
    return sum / 2;
  }

  /** Sum of the weights along a path, Infinity if any hop is missing. */
  pathCost(path) {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const w = this.getWeight(path[i], path[i + 1]);
      if (w === Infinity) return Infinity;
      cost += w;
    }
    return cost;
  }

  /** Plain-object view, handy for debugging and the About page. */
  toAdjacencyObject() {
    const obj = {};
    for (const [v, nbrs] of this.adjacency) obj[v] = Object.fromEntries(nbrs);
    return obj;
  }

  clone() {
    const g = new Graph();
    for (const [v, data] of this.vertexData) g.addVertex(v, data);
    for (const { a, b, weight } of this.edges()) g.addEdge(a, b, weight);
    return g;
  }
}

/** Canonical key for an undirected edge. */
export function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
