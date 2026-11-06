import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { LOCATION_BY_ID } from '../data/campus.js';
import { useCampusStore } from '../store/useCampusStore.js';

const Y = 0.45;
const toPoints = (path) => path.map((id) => [LOCATION_BY_ID[id].pos[0], Y, LOCATION_BY_ID[id].pos[1]]);

function Pin({ id, kind }) {
  const [x, z] = LOCATION_BY_ID[id].pos;
  const color = kind === 'start' ? '#38BDF8' : '#3B82F6';
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 14 + Math.sin(clock.elapsedTime * 2) * 0.35;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[2.2, 2.8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <group ref={ref}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.9, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.55, 1.6, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        <Html center position={[0, 2, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <div className={`whitespace-nowrap rounded px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider ${kind === 'start' ? 'bg-fg text-ink-900' : 'bg-accent text-white'}`}>
            {kind === 'start' ? 'Start' : 'End'}
          </div>
        </Html>
      </group>
    </group>
  );
}

function Traveller({ points }) {
  const ref = useRef();
  const { segs, total } = useMemo(() => {
    const segs = [];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, , az] = points[i];
      const [bx, , bz] = points[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      segs.push({ ax, az, bx, bz, len, start: total });
      total += len;
    }
    return { segs, total };
  }, [points]);

  useFrame(({ clock }) => {
    if (!ref.current || total === 0) return;
    const speed = 14; // world units per second
    const d = (clock.elapsedTime * speed) % total;
    const s = segs.find((g) => d >= g.start && d <= g.start + g.len) ?? segs[segs.length - 1];
    const t = (d - s.start) / s.len;
    ref.current.position.set(s.ax + (s.bx - s.ax) * t, Y + 0.6, s.az + (s.bz - s.az) * t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.55, 16, 16]} />
      <meshBasicMaterial color="#7DD3FC" />
    </mesh>
  );
}

export function RouteLayer() {
  const routes = useCampusStore((s) => s.routes);
  const active = useCampusStore((s) => s.activeRoute);
  const dashRef = useRef();

  useFrame((_, dt) => {
    if (dashRef.current?.material) dashRef.current.material.dashOffset -= dt * 3;
  });

  if (!routes.length) return null;
  const route = routes[active] ?? routes[0];
  const points = toPoints(route.path);

  return (
    <group>
      {routes.map((r, i) =>
        i === active ? null : (
          <Line key={i} points={toPoints(r.path)} color="#8A919C" lineWidth={2.5} transparent opacity={0.55} dashed dashSize={0.6} gapSize={0.6} />
        )
      )}
      <Line points={points} color="#3B82F6" lineWidth={11} transparent opacity={0.22} />
      <Line points={points} color="#3B82F6" lineWidth={4.5} />
      <Line ref={dashRef} points={points} color="#DCEAFF" lineWidth={2} dashed dashSize={1.2} gapSize={2.4} position={[0, 0.02, 0]} />
      <Traveller points={points} />
      <Pin id={route.path[0]} kind="start" />
      <Pin id={route.path[route.path.length - 1]} kind="end" />
    </group>
  );
}
