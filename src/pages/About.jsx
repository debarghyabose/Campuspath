import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EDGES, LOCATION_BY_ID, SCALE, WALK_SPEED_MPS, JUNCTION_DELAY_S, UNIVERSITY } from '../data/campus.js';

const FILES = [
  ['src/dsa/graph.js', 'Graph class — adjacency list, addVertex/addEdge/removeVertex/removeEdge, pathCost'],
  ['src/dsa/minHeap.js', 'Binary min-heap priority queue, FIFO queue, LIFO stack'],
  ['src/dsa/pathfinding.js', "Dijkstra, A*, BFS, DFS, Yen's K-shortest paths, all-pairs, step recording"],
  ['src/dsa/instructions.js', 'Bearing maths and turn-by-turn instruction generation'],
  ['src/dsa/campusGraph.js', 'Builds the campus graph from the dataset, honouring closed pathways'],
  ['src/data/campus.js', 'Locations, pathways, distance model and walking-time model'],
  ['src/scene/*', 'React Three Fiber scene — buildings, environment, route layer, camera rig'],
  ['src/store/useCampusStore.js', 'Zustand store; persists closures, recent routes and settings to LocalStorage'],
];

function Section({ eyebrow, title, children }) {
  return (
    <section className="border-t border-ink-700 py-10 first:border-t-0 first:pt-0">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

export default function About() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-12">
        <div className="eyebrow">About the project</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">CampusPath 3D</h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          An intelligent campus navigation system built as a Data Structures and Algorithms project. It answers one
          question well — <span className="text-fg">what is the shortest walk from here to there?</span> — and shows how
          the answer is computed.
        </p>
      </div>

      <Section eyebrow="01" title="Problem modelling">
        <p>
          {UNIVERSITY} is represented as a weighted, undirected graph <span className="font-mono text-fg">G = (V, E)</span>.
          Each of the 15 locations is a vertex; each of the {EDGES.length} pedestrian pathways is an edge. Pathways are
          two-way, so the graph is undirected.
        </p>
        <p>
          Edge weights are walking distances in metres. They are derived from the map geometry (1 world unit ={' '}
          {SCALE} m): straight-line length multiplied by a per-path winding factor of 1.02–1.12, rounded up to the nearest
          5 m. Every weight is therefore at least the straight-line distance, which keeps the A* heuristic admissible.
        </p>
        <p>
          Example: {EDGES[3].name} between {LOCATION_BY_ID[EDGES[3].a].name} and {LOCATION_BY_ID[EDGES[3].b].name} is{' '}
          <span className="font-mono text-fg">{EDGES[3].weight} m</span>.
        </p>
      </Section>

      <Section eyebrow="02" title="Algorithms">
        <ul className="space-y-3">
          <li>
            <span className="font-medium text-fg">Dijkstra (default).</span> Repeatedly settles the unsettled vertex with the
            smallest tentative distance, using a binary min-heap. Instead of decrease-key, improved distances are pushed
            again and stale heap entries are skipped on pop (lazy deletion). O((V + E) log V).
          </li>
          <li>
            <span className="font-medium text-fg">A*.</span> Orders the heap by f = g + h, where h is the straight-line
            distance to the destination. Same optimal answer as Dijkstra, usually with fewer vertices expanded — the Algorithm
            Lab shows the count side by side.
          </li>
          <li>
            <span className="font-medium text-fg">BFS.</span> Uses a FIFO queue and minimises the number of pathway segments,
            not metres. Useful for "fewest junctions", and a clear demonstration of why weights matter.
          </li>
          <li>
            <span className="font-medium text-fg">DFS.</span> Iterative, with an explicit stack. Finds a valid path but makes
            no optimality guarantee.
          </li>
          <li>
            <span className="font-medium text-fg">Yen's K-shortest paths.</span> Produces the alternative routes. For each
            vertex on the previous best path it removes the edges already used from that "root", runs Dijkstra from the spur
            vertex, and keeps the cheapest new loopless path.
          </li>
        </ul>
        <p>
          Correctness is checked by <span className="font-mono text-fg">npm test</span>, which compares Dijkstra and A* with a
          brute-force search over every simple path for all 210 ordered pairs of locations.
        </p>
      </Section>

      <Section eyebrow="03" title="Walking-time estimate">
        <p>
          Typical adult walking speed on level ground is about 1.4 m/s. Campus walks include road crossings, steps and other
          pedestrians, so the estimate uses <span className="font-mono text-fg">{WALK_SPEED_MPS} m/s</span> (75 m per minute)
          and adds <span className="font-mono text-fg">{JUNCTION_DELAY_S} s</span> for each intermediate junction:
        </p>
        <pre className="rounded-md border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-xs text-fg">
          time = distance / {WALK_SPEED_MPS} + {JUNCTION_DELAY_S} × intermediate_stops
        </pre>
      </Section>

      <Section eyebrow="04" title="Turn-by-turn directions">
        <p>
          For each junction the bearing of the incoming and outgoing pathway is computed with atan2. The signed difference
          classifies the manoeuvre: under 20° continue straight, under 55° bear left/right, under 140° turn, otherwise a sharp
          turn.
        </p>
      </Section>

      <Section eyebrow="05" title="Code structure">
        <ul className="divide-y divide-ink-700 overflow-hidden rounded-md border border-ink-700">
          {FILES.map(([f, d]) => (
            <li key={f} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[220px_1fr]">
              <span className="font-mono text-xs text-fg">{f}</span>
              <span className="text-xs">{d}</span>
            </li>
          ))}
        </ul>
        <p>
          Stack: React, Vite, Tailwind CSS, Three.js with React Three Fiber and Drei, Framer Motion, Zustand, React Router
          and Lucide icons. No backend and no API keys; preferences persist in LocalStorage.
        </p>
      </Section>

      <Section eyebrow="06" title="Limitations">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The campus is fictional and the graph is small (15 vertices), so all algorithms run in well under a millisecond.</li>
          <li>Routes are computed between building centres; indoor routing and floor levels are not modelled.</li>
          <li>Distances are static — crowding and time of day are not considered, beyond the fixed junction allowance.</li>
        </ul>
      </Section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/navigate" className="btn-primary">
          Try the navigator <ArrowRight size={14} />
        </Link>
        <Link to="/lab" className="btn">
          Open the Algorithm Lab
        </Link>
      </div>
    </div>
  );
}
