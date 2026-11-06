import { createContext, useContext } from 'react';
import { Color } from 'three';

const DIM_TARGET = new Color('#10243D');
const dimCache = new Map();
function dimHex(hex) {
  if (!dimCache.has(hex)) dimCache.set(hex, '#' + new Color(hex).lerp(DIM_TARGET, 0.65).getHexString());
  return dimCache.get(hex);
}

/**
 * Buildings are drawn from a few tones (body, roof, glass…). The surrounding
 * <ToneContext.Provider> decides what those tones look like for the current
 * interaction state, so every model highlights consistently.
 */
export const ToneContext = createContext({ state: 'default', accent: '#8aa' });

const PALETTES = {
  default: { body: '#D9D6CF', roof: '#B7B2A8', glass: '#46525F', trim: '#9D988E', dark: '#3A3F47', light: '#EEECE7' },
  hover: { body: '#E6E4DF', roof: '#C6C2B9', glass: '#53606E', trim: '#ABA69C', dark: '#454A53', light: '#F5F4F0' },
  selected: { body: '#DCE7FB', roof: '#B9CDF0', glass: '#2F5FB0', trim: '#97B2E3', dark: '#304A78', light: '#EEF4FF' },
  endpoint: { body: '#DCE7FB', roof: '#B9CDF0', glass: '#2F5FB0', trim: '#97B2E3', dark: '#304A78', light: '#EEF4FF' },
  dim: { body: '#42566D', roof: '#334B65', glass: '#263F5A', trim: '#3A526B', dark: '#203750', light: '#587087' },
};

export function useTone(tone) {
  const { state, accent } = useContext(ToneContext);
  const p = PALETTES[state] ?? PALETTES.default;
  if (tone === 'accent') return state === 'dim' ? '#55585E' : accent;
  if (p[tone]) return p[tone];
  return state === 'dim' ? dimHex(tone) : tone; // raw hex colours
}

export function Mat({ tone = 'body', roughness, metalness = 0, ...rest }) {
  const { state } = useContext(ToneContext);
  const color = useTone(tone);
  const glow = state === 'selected' || state === 'endpoint';
  const isGlass = tone === 'glass';
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness ?? (isGlass ? 0.25 : 0.85)}
      metalness={isGlass ? 0.35 : metalness}
      emissive={glow ? '#1E4FA8' : '#000000'}
      emissiveIntensity={glow ? 0.28 : 0}
      {...rest}
    />
  );
}

export function Box({ p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], tone = 'body', shadow = true, ...mat }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      <Mat tone={tone} {...mat} />
    </mesh>
  );
}

export function Cyl({ p = [0, 0, 0], r = [0, 0, 0], args = [1, 1, 1, 24], tone = 'body', shadow = true, ...mat }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <cylinderGeometry args={args} />
      <Mat tone={tone} {...mat} />
    </mesh>
  );
}

/** A box-shaped block sitting on the ground (y = 0), with window bands per floor. */
export function Block({ p = [0, 0], w, d, h, floors = 3, rot = 0, tone = 'body', roofTone = 'roof', bands = true }) {
  const floorH = h / floors;
  return (
    <group position={[p[0], 0, p[1]]} rotation={[0, rot, 0]}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} tone={tone} />
      <Box p={[0, h + 0.15, 0]} s={[w + 0.3, 0.3, d + 0.3]} tone={roofTone} />
      {bands &&
        Array.from({ length: floors }, (_, i) => (
          <Box
            key={i}
            p={[0, floorH * i + floorH * 0.55, 0]}
            s={[w + 0.06, floorH * 0.32, d + 0.06]}
            tone="glass"
            shadow={false}
          />
        ))}
    </group>
  );
}
