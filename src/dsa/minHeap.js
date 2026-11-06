/**
 * Binary min-heap priority queue, implemented on a plain array.
 *
 *   parent(i) = (i - 1) >> 1,  left(i) = 2i + 1,  right(i) = 2i + 2
 *
 * push / pop: O(log n), peek: O(1).
 *
 * Dijkstra and A* use "lazy deletion" instead of decrease-key: when a shorter
 * distance is found we push a new entry and skip stale entries on pop. This
 * keeps the heap simple and still gives O((V + E) log V).
 *
 * Ties are broken by insertion order (seq) so results are deterministic.
 */
export class MinHeap {
  constructor() {
    this.items = [];
    this.seq = 0;
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  peek() {
    return this.items[0];
  }

  push(value, priority) {
    this.items.push({ value, priority, seq: this.seq++ });
    this.#siftUp(this.items.length - 1);
  }

  pop() {
    const items = this.items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  /** Sorted copy of the contents, for visualisation only. O(n log n) */
  snapshot() {
    return [...this.items]
      .sort((a, b) => this.#compare(a, b))
      .map(({ value, priority }) => ({ value, priority }));
  }

  #compare(a, b) {
    return a.priority - b.priority || a.seq - b.seq;
  }

  #siftUp(i) {
    const items = this.items;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.#compare(items[i], items[p]) >= 0) break;
      [items[i], items[p]] = [items[p], items[i]];
      i = p;
    }
  }

  #siftDown(i) {
    const items = this.items;
    const n = items.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.#compare(items[l], items[smallest]) < 0) smallest = l;
      if (r < n && this.#compare(items[r], items[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [items[i], items[smallest]] = [items[smallest], items[i]];
      i = smallest;
    }
  }
}

/** FIFO queue with O(1) amortised enqueue/dequeue (head index, no shift()). */
export class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }
  get size() {
    return this.items.length - this.head;
  }
  isEmpty() {
    return this.size === 0;
  }
  enqueue(v) {
    this.items.push(v);
  }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const v = this.items[this.head++];
    if (this.head > 32 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return v;
  }
  snapshot() {
    return this.items.slice(this.head);
  }
}

/** LIFO stack. */
export class Stack {
  constructor() {
    this.items = [];
  }
  get size() {
    return this.items.length;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  push(v) {
    this.items.push(v);
  }
  pop() {
    return this.items.pop();
  }
  snapshot() {
    return [...this.items].reverse(); // top first
  }
}
