import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, Color } from 'three';
import { EDGES, LOCATION_BY_ID } from '../data/campus.js';
import { edgeKey } from '../dsa/graph.js';
import { FOOTPRINT } from './Buildings.jsx';
import { useCampusStore } from '../store/useCampusStore.js';

export const BOUNDS = { minX: -56, maxX: 56, minZ: -62, maxZ: 60 };
const ROAD = { x: 51, zN: -57, zS: 51, w: 4 };

/* deterministic PRNG so the campus looks the same on every load */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

const segments = EDGES.map((e) => {
  const a = LOCATION_BY_ID[e.a].pos;
  const b = LOCATION_BY_ID[e.b].pos;
  return { ...e, ax: a[0], az: a[1], bx: b[0], bz: b[1], len: Math.hypot(b[0] - a[0], b[1] - a[1]), angle: Math.atan2(b[0] - a[0], b[1] - a[1]) };
});

function clearOfEverything(x, z, margin = 2.4) {
  for (const id in FOOTPRINT) {
    const [lx, lz] = LOCATION_BY_ID[id].pos;
    if (Math.hypot(x - lx, z - lz) < FOOTPRINT[id] + 1) return false;
  }
  for (const s of segments) if (distToSegment(x, z, s.ax, s.az, s.bx, s.bz) < margin) return false;
  // ring road
  if (Math.abs(Math.abs(x) - ROAD.x) < ROAD.w) return false;
  if (Math.abs(z - ROAD.zN) < ROAD.w || Math.abs(z - ROAD.zS) < ROAD.w) return false;
  if (Math.abs(x) < 5 && z > 45) return false; // gate approach
  return true;
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial color="#0B172A" roughness={1} />
      </mesh>
      {/* campus plinth, like an architectural model base */}
      <mesh position={[0, -0.02, -1]} receiveShadow>
        <boxGeometry args={[BOUNDS.maxX - BOUNDS.minX + 2, 0.06, BOUNDS.maxZ - BOUNDS.minZ + 2]} />
        <meshStandardMaterial color="#142D4A" roughness={1} />
      </mesh>
    </group>
  );
}

function Walls() {
  const h = 1.1;
  const t = 0.5;
  const tone = '#294968';
  const W = BOUNDS.maxX - BOUNDS.minX;
  const D = BOUNDS.maxZ - BOUNDS.minZ;
  const cz = (BOUNDS.maxZ + BOUNDS.minZ) / 2;
  const gap = 8;
  const half = (W - gap) / 2;
  return (
    <group>
      {/* north */}
      <mesh position={[0, h / 2, BOUNDS.minZ]} castShadow receiveShadow>
        <boxGeometry args={[W, h, t]} />
        <meshStandardMaterial color={tone} />
      </mesh>
      {/* east / west */}
      {[BOUNDS.minX, BOUNDS.maxX].map((x) => (
        <mesh key={x} position={[x, h / 2, cz]} castShadow receiveShadow>
          <boxGeometry args={[t, h, D]} />
          <meshStandardMaterial color={tone} />
        </mesh>
      ))}
      {/* south, with a gap for the Main Gate */}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * (gap / 2 + half / 2), h / 2, BOUNDS.maxZ]} castShadow receiveShadow>
          <boxGeometry args={[half, h, t]} />
          <meshStandardMaterial color={tone} />
        </mesh>
      ))}
    </group>
  );
}

function Roads() {
  const color = '#10243D';
  const line = '#294968';
  const lenX = ROAD.x * 2 + ROAD.w;
  const lenZ = ROAD.zS - ROAD.zN + ROAD.w;
  const cz = (ROAD.zS + ROAD.zN) / 2;
  return (
    <group position={[0, 0.03, 0]}>
      {[ROAD.zN, ROAD.zS].map((z) => (
        <group key={z}>
          <mesh position={[0, 0, z]} receiveShadow>
            <boxGeometry args={[lenX, 0.06, ROAD.w]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.04, z]}>
            <boxGeometry args={[lenX - ROAD.w, 0.01, 0.12]} />
            <meshStandardMaterial color={line} />
          </mesh>
        </group>
      ))}
      {[-ROAD.x, ROAD.x].map((x) => (
        <group key={x}>
          <mesh position={[x, 0, cz]} receiveShadow>
            <boxGeometry args={[ROAD.w, 0.06, lenZ]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
          <mesh position={[x, 0.04, cz]}>
            <boxGeometry args={[0.12, 0.01, lenZ - ROAD.w]} />
            <meshStandardMaterial color={line} />
          </mesh>
        </group>
      ))}
      {/* approach road outside the gate, and the western link to the car park */}
      <mesh position={[0, 0, 72]} receiveShadow>
        <boxGeometry args={[6, 0.06, 36]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[-45, 0, 40]} receiveShadow>
        <boxGeometry args={[8, 0.06, 4]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* zebra crossing in front of the gate */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-2.5 + i, 0.05, ROAD.zS]}>
          <boxGeometry args={[0.5, 0.01, ROAD.w - 0.6]} />
          <meshStandardMaterial color="#C8CBD0" />
        </mesh>
      ))}
    </group>
  );
}

function Pathways() {
  const closed = useCampusStore((s) => s.closedEdges);
  const closedSet = useMemo(() => new Set(closed), [closed]);
  return (
    <group>
      {segments.map((s) => {
        const isClosed = closedSet.has(edgeKey(s.a, s.b));
        const mx = (s.ax + s.bx) / 2;
        const mz = (s.az + s.bz) / 2;
        return (
          <group key={`${s.a}-${s.b}`}>
            <mesh position={[mx, 0.05, mz]} rotation={[0, s.angle, 0]} receiveShadow>
              <boxGeometry args={[1.9, 0.06, s.len]} />
              <meshStandardMaterial color={isClosed ? '#70433F' : '#294968'} roughness={0.95} />
            </mesh>
            <mesh position={[mx, 0.045, mz]} rotation={[0, s.angle, 0]}>
              <boxGeometry args={[2.4, 0.05, s.len]} />
              <meshStandardMaterial color="#193957" roughness={1} />
            </mesh>
            {isClosed && (
              <group position={[mx, 0, mz]} rotation={[0, s.angle + Math.PI / 2, 0]}>
                <mesh position={[0, 0.6, 0]} castShadow>
                  <boxGeometry args={[2.6, 0.3, 0.15]} />
                  <meshStandardMaterial color="#D9774A" />
                </mesh>
                {[-1.1, 1.1].map((x) => (
                  <mesh key={x} position={[x, 0.35, 0]}>
                    <boxGeometry args={[0.12, 0.7, 0.12]} />
                    <meshStandardMaterial color="#C9C3B6" />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

const dummy = new Object3D();

function Trees() {
  const trunks = useRef();
  const crowns = useRef();
  const trees = useMemo(() => {
    const rand = mulberry32(20261106);
    const out = [];
    let tries = 0;
    while (out.length < 150 && tries < 6000) {
      tries++;
      const x = BOUNDS.minX + 3 + rand() * (BOUNDS.maxX - BOUNDS.minX - 6);
      const z = BOUNDS.minZ + 3 + rand() * (BOUNDS.maxZ - BOUNDS.minZ - 6);
      if (!clearOfEverything(x, z)) continue;
      if (out.some((t) => Math.hypot(t.x - x, t.z - z) < 3.2)) continue;
      out.push({ x, z, s: 0.75 + rand() * 0.6, hue: rand() });
    }
    // a line of trees outside the campus, along the approach road
    for (let i = 0; i < 6; i++) out.push({ x: -6, z: 64 + i * 5, s: 0.9, hue: 0.4 }, { x: 6, z: 64 + i * 5, s: 0.9, hue: 0.6 });
    return out;
  }, []);

  useLayoutEffect(() => {
    const c = new Color();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, 0.9 * t.s, t.z);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.rotation.set(0, t.hue * 6, 0);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 2.6 * t.s, t.z);
      dummy.updateMatrix();
      crowns.current.setMatrixAt(i, dummy.matrix);
      c.setHSL(0.3 + t.hue * 0.06, 0.22 + t.hue * 0.1, 0.27 + t.hue * 0.08);
      crowns.current.setColorAt(i, c);
    });
    trunks.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceMatrix.needsUpdate = true;
    if (crowns.current.instanceColor) crowns.current.instanceColor.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[null, null, trees.length]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.8, 6]} />
        <meshStandardMaterial color="#5A4A3C" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[null, null, trees.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

function StreetLight({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 3.2, 6]} />
        <meshStandardMaterial color="#4A4E55" />
      </mesh>
      <mesh position={[0, 3.25, 0]}>
        <boxGeometry args={[0.45, 0.14, 0.45]} />
        <meshStandardMaterial color="#FFE2B0" emissive="#FFCF85" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function Bench({ x, z, angle }) {
  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.08, 1.8]} />
        <meshStandardMaterial color="#8A6F55" />
      </mesh>
      <mesh position={[0.28, 0.75, 0]} castShadow>
        <boxGeometry args={[0.06, 0.5, 1.8]} />
        <meshStandardMaterial color="#8A6F55" />
      </mesh>
      {[-0.7, 0.7].map((zz) => (
        <mesh key={zz} position={[0, 0.22, zz]}>
          <boxGeometry args={[0.55, 0.44, 0.08]} />
          <meshStandardMaterial color="#3A3D42" />
        </mesh>
      ))}
    </group>
  );
}

function StreetFurniture() {
  const { lights, benches } = useMemo(() => {
    const lights = [];
    const benches = [];
    segments.forEach((s, i) => {
      // perpendicular unit vector
      const nx = (s.bz - s.az) / s.len;
      const nz = -(s.bx - s.ax) / s.len;
      const count = Math.max(1, Math.floor(s.len / 14));
      for (let k = 1; k <= count; k++) {
        const t = k / (count + 1);
        const side = k % 2 ? 1.7 : -1.7;
        lights.push({ x: s.ax + (s.bx - s.ax) * t + nx * side, z: s.az + (s.bz - s.az) * t + nz * side });
      }
      if (i % 2 === 0 && s.len > 14) {
        const t = 0.3;
        benches.push({ x: s.ax + (s.bx - s.ax) * t - nx * 2, z: s.az + (s.bz - s.az) * t - nz * 2, angle: s.angle });
      }
    });
    // ring-road lights
    for (let x = -44; x <= 44; x += 16) {
      lights.push({ x, z: ROAD.zS - 3 }, { x, z: ROAD.zN + 3 });
    }
    for (let z = -44; z <= 40; z += 16) {
      lights.push({ x: -ROAD.x + 3, z }, { x: ROAD.x - 3, z });
    }
    return { lights, benches };
  }, []);

  return (
    <group>
      {lights.map((l, i) => (
        <StreetLight key={i} {...l} />
      ))}
      {benches.map((b, i) => (
        <Bench key={i} {...b} />
      ))}
    </group>
  );
}

export function CampusEnvironment() {
  return (
    <group>
      <Ground />
      <Walls />
      <Roads />
      <Pathways />
      <Trees />
      <StreetFurniture />
    </group>
  );
}
