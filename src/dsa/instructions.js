import { LOCATION_BY_ID, EDGE_NAME } from '../data/campus.js';

const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];

/** Bearing in degrees clockwise from north. World: +x east, -z north. */
export function bearing(fromId, toId) {
  const a = LOCATION_BY_ID[fromId].pos;
  const b = LOCATION_BY_ID[toId].pos;
  const dx = b[0] - a[0];
  const dn = -(b[1] - a[1]);
  return (Math.atan2(dx, dn) * 180) / Math.PI + 360;
}

const compass = (deg) => COMPASS[Math.round((deg % 360) / 45) % 8];

function turnType(delta) {
  const a = Math.abs(delta);
  const side = delta > 0 ? 'right' : 'left';
  if (a < 20) return { type: 'straight', verb: 'Continue straight' };
  if (a < 55) return { type: `slight-${side}`, verb: `Bear ${side}` };
  if (a < 140) return { type: side, verb: `Turn ${side}` };
  return { type: `sharp-${side}`, verb: `Make a sharp ${side}` };
}

/**
 * Turn-by-turn instructions from a node path.
 * Turn direction comes from the change in bearing between consecutive legs.
 */
export function buildInstructions(path, graph) {
  if (!path || path.length < 2) return [];
  const steps = [];
  const name = (id) => LOCATION_BY_ID[id].name;
  const street = (a, b) => EDGE_NAME[`${a}|${b}`] ?? 'the pathway';

  const first = bearing(path[0], path[1]);
  steps.push({
    type: 'start',
    text: `Leave ${name(path[0])} heading ${compass(first)} on ${street(path[0], path[1])}`,
    detail: `toward ${name(path[1])}`,
    distance: graph.getWeight(path[0], path[1]),
    at: path[0],
  });

  for (let i = 1; i < path.length - 1; i++) {
    const inB = bearing(path[i - 1], path[i]);
    const outB = bearing(path[i], path[i + 1]);
    let delta = ((outB - inB + 540) % 360) - 180;
    const t = turnType(delta);
    steps.push({
      type: t.type,
      text: `${t.verb} at ${name(path[i])} onto ${street(path[i], path[i + 1])}`,
      detail: `toward ${name(path[i + 1])}`,
      distance: graph.getWeight(path[i], path[i + 1]),
      at: path[i],
    });
  }

  steps.push({
    type: 'arrive',
    text: `Arrive at ${name(path[path.length - 1])}`,
    detail: 'Destination',
    distance: 0,
    at: path[path.length - 1],
  });
  return steps;
}
