import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { LOCATIONS } from '../data/campus.js';
import { useCampusStore, DEFAULT_CAMERA } from '../store/useCampusStore.js';
import { BUILDING_MODELS, FOOTPRINT } from './Buildings.jsx';
import { ToneContext } from './primitives.jsx';
import { CampusEnvironment } from './Environment.jsx';
import { RouteLayer } from './RouteLayer.jsx';
import { CATEGORIES } from '../data/campus.js';

/* ---------------- camera ---------------- */

function CameraRig({ enabled }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const request = useCampusStore((s) => s.cameraRequest);
  const zoomRequest = useCampusStore((s) => s.zoomRequest);
  const anim = useRef(null);

  useEffect(() => {
    if (!enabled || request.nonce === 0) return;
    anim.current = { position: new Vector3(...request.position), target: new Vector3(...request.target) };
  }, [request.nonce, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || !controls || zoomRequest.nonce === 0) return;
    const target = controls.target.clone();
    const offset = camera.position.clone().sub(target).multiplyScalar(zoomRequest.factor);
    const len = offset.length();
    if (len < 22 || len > 230) return;
    anim.current = { position: target.clone().add(offset), target };
  }, [zoomRequest.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // the user grabbing the camera cancels any running transition
  useEffect(() => {
    if (!controls) return;
    const cancel = () => (anim.current = null);
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls) return;
    const k = 1 - Math.pow(0.0025, dt); // frame-rate independent easing
    camera.position.lerp(a.position, k);
    controls.target.lerp(a.target, k);
    controls.update();
    if (camera.position.distanceTo(a.position) < 0.05 && controls.target.distanceTo(a.target) < 0.05) {
      anim.current = null;
    }
  });
  return null;
}

/* ---------------- buildings ---------------- */

function SelectionRing({ radius, color = '#3B82F6' }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.opacity = 0.55 + Math.sin(clock.elapsedTime * 3) * 0.25;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
      <ringGeometry args={[radius, radius + 0.45, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

function Label({ loc, state }) {
  const strong = state === 'selected' || state === 'endpoint';
  return (
    <Html
      center
      position={[0, loc.height + 3.2, 0]}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[10, 0]}
    >
      <div
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-2xs font-medium shadow-panel transition-colors ${
          strong
            ? 'border-accent/60 bg-accent text-white'
            : state === 'dim'
            ? 'border-ink-600/50 bg-ink-850/70 text-fg-subtle'
            : 'border-ink-600 bg-ink-850/90 text-fg'
        }`}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: strong ? '#fff' : CATEGORIES[loc.category].color }}
        />
        {loc.name}
      </div>
    </Html>
  );
}

function CampusBuilding({ loc, state, interactive, showLabel }) {
  const Model = BUILDING_MODELS[loc.id];
  const select = useCampusStore((s) => s.select);
  const setHovered = useCampusStore((s) => s.setHovered);
  const tone = useMemo(() => ({ state, accent: CATEGORIES[loc.category].color }), [state, loc.category]);

  const handlers = interactive
    ? {
        onPointerOver: (e) => {
          e.stopPropagation();
          setHovered(loc.id);
          document.body.style.cursor = 'pointer';
        },
        onPointerOut: () => {
          setHovered(null);
          document.body.style.cursor = '';
        },
        onClick: (e) => {
          e.stopPropagation();
          select(loc.id);
        },
      }
    : {};

  return (
    <group position={[loc.pos[0], 0, loc.pos[1]]} {...handlers}>
      <ToneContext.Provider value={tone}>
        <Model />
      </ToneContext.Provider>
      {(state === 'selected' || state === 'endpoint') && <SelectionRing radius={FOOTPRINT[loc.id]} />}
      {showLabel && <Label loc={loc} state={state} />}
    </group>
  );
}

function Buildings({ mode }) {
  const selectedId = useCampusStore((s) => s.selectedId);
  const hoveredId = useCampusStore((s) => s.hoveredId);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const search = useCampusStore((s) => s.search);
  const showLabels = useCampusStore((s) => s.showLabels);
  const routes = useCampusStore((s) => s.routes);
  const activeRoute = useCampusStore((s) => s.activeRoute);
  const route = mode === 'navigate' ? routes[activeRoute] : null;
  const q = search.trim().toLowerCase();

  return LOCATIONS.map((loc) => {
    let state = 'default';
    let label = showLabels && mode !== 'preview';
    if (mode === 'explore') {
      const matches =
        (!categoryFilter || loc.category === categoryFilter) &&
        (!q || loc.name.toLowerCase().includes(q) || loc.facilities.some((f) => f.toLowerCase().includes(q)));
      if (!matches) state = 'dim';
    }
    if (route) {
      const onRoute = route.path.includes(loc.id);
      const end = loc.id === route.path[0] || loc.id === route.path[route.path.length - 1];
      if (end) state = 'endpoint';
      else if (!onRoute) state = 'dim';
      label = label && onRoute;
    }
    if (mode !== 'preview' && hoveredId === loc.id && state !== 'endpoint') state = 'hover';
    if (mode !== 'preview' && selectedId === loc.id) state = 'selected';
    return (
      <CampusBuilding key={loc.id} loc={loc} state={state} interactive={mode !== 'preview'} showLabel={label} />
    );
  });
}

/* ---------------- scene ---------------- */

function Lights() {
  return (
    <>
      <hemisphereLight args={['#A9BCD2', '#10243D', 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-60, 90, 50]}
        intensity={1.9}
        color="#FFF4E6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={10}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[70, 40, -60]} intensity={0.35} color="#9DB7E8" />
    </>
  );
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-ink-900 p-6 text-center">
          <div>
            <p className="text-sm font-medium text-fg">3D view unavailable</p>
            <p className="mt-1 text-xs text-fg-muted">Your browser could not start WebGL. Route planning still works.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CampusScene({ mode = 'explore', className = '' }) {
  const select = useCampusStore((s) => s.select);
  const preview = mode === 'preview';
  const initial = preview ? { position: [78, 58, 92], target: [0, 0, 0] } : DEFAULT_CAMERA;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <SceneErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: initial.position, fov: 38, near: 0.5, far: 900 }}
          onPointerMissed={() => !preview && select(null)}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#0B172A']} />
          <fog attach="fog" args={['#0B172A', 170, 360]} />
          <Lights />
          <Suspense fallback={null}>
            <CampusEnvironment />
            <Buildings mode={mode} />
            {mode === 'navigate' && <RouteLayer />}
          </Suspense>
          <OrbitControls
            makeDefault
            target={initial.target}
            enableDamping
            dampingFactor={0.08}
            minDistance={22}
            maxDistance={230}
            maxPolarAngle={1.32}
            enableZoom={!preview}
            enablePan={!preview}
            autoRotate={preview}
            autoRotateSpeed={0.45}
          />
          <CameraRig enabled={!preview} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
