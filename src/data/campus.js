/**
 * IEM College — conceptual campus dataset.
 *
 * Coordinate system: positions are [x, z] in world units on the ground plane.
 *   +x = east, -z = north (so the Main Gate on the south edge has the largest z).
 *   1 world unit = SCALE metres.
 *
 * Pathway weights are derived from the geometry: straight-line length × a
 * "winding" factor (paths are never perfectly straight), rounded UP to the
 * nearest 5 m. Because every weight is >= the straight-line distance, the
 * Euclidean heuristic used by A* stays admissible.
 */

export const SCALE = 5; // metres per world unit
export const UNIVERSITY = 'IEM College';

export const CATEGORIES = {
  academic: { label: 'Academic', color: '#7FA6D6' },
  facilities: { label: 'Facilities', color: '#A7ADB8' },
  food: { label: 'Food', color: '#D6A66F' },
  residential: { label: 'Residential', color: '#A99BD3' },
  recreation: { label: 'Recreation', color: '#7FBF9A' },
  emergency: { label: 'Emergency', color: '#E07A7A' },
};

export const LOCATIONS = [
  {
    id: 'gate',
    code: 'MG',
    name: 'Main Gate',
    category: 'facilities',
    pos: [0, 56],
    height: 6,
    description:
      'Primary pedestrian and vehicle entrance on the southern boundary, staffed by campus security around the clock.',
    facilities: ['Security desk', 'Visitor passes', 'Campus map kiosk', 'Bicycle stand'],
    hours: 'Open 24 hours',
  },
  {
    id: 'parking',
    code: 'PK',
    name: 'Parking Area',
    category: 'facilities',
    pos: [-30, 40],
    height: 2,
    description:
      'Surface parking for staff and visitors, directly connected to the western approach road.',
    facilities: ['120 car bays', 'Two-wheeler bays', 'EV charging', 'Accessible bays'],
    hours: '06:00 – 23:00',
  },
  {
    id: 'admin',
    code: 'AD',
    name: 'Administration Building',
    category: 'facilities',
    pos: [16, 38],
    height: 16.5,
    description:
      'Houses the registrar, admissions, accounts and the office of the Vice-Chancellor. Recognisable by its clock tower.',
    facilities: ['Admissions office', 'Registrar', 'Fee counter', 'ID card services'],
    hours: 'Mon – Sat, 09:00 – 17:00',
  },
  {
    id: 'acadA',
    code: 'AA',
    name: 'Academic Block A',
    category: 'academic',
    pos: [-18, 22],
    height: 7,
    description:
      'First-year teaching block with large lecture theatres and tutorial rooms for core engineering courses.',
    facilities: ['6 lecture theatres', '24 classrooms', 'Faculty cabins', 'Printing station'],
    hours: '08:00 – 20:00',
  },
  {
    id: 'acadB',
    code: 'AB',
    name: 'Academic Block B',
    category: 'academic',
    pos: [20, 18],
    height: 8.5,
    description:
      'U-shaped block around a shaded courtyard, used for mathematics, sciences and humanities electives.',
    facilities: ['Seminar halls', 'Physics labs', 'Chemistry labs', 'Courtyard seating'],
    hours: '08:00 – 20:00',
  },
  {
    id: 'garden',
    code: 'CG',
    name: 'Central Garden',
    category: 'recreation',
    pos: [0, 6],
    height: 3,
    description:
      'The green heart of campus. Every major pathway meets at the fountain plaza, making it the main interchange.',
    facilities: ['Fountain plaza', 'Shaded benches', 'Open-air stage', 'Drinking water'],
    hours: 'Open 24 hours',
  },
  {
    id: 'library',
    code: 'LB',
    name: 'Central Library',
    category: 'academic',
    pos: [-8, -10],
    height: 14,
    description:
      'Four-level library with a domed reading rotunda, digital archives and silent study floors.',
    facilities: ['Reading rotunda', 'Digital archive', '24/7 study zone', 'Group study rooms'],
    hours: '07:00 – 23:00',
  },
  {
    id: 'cs',
    code: 'CS',
    name: 'Computer Science Department',
    category: 'academic',
    pos: [-36, 2],
    height: 10,
    description:
      'Stacked glass building with programming labs, an HPC cluster room and faculty research offices.',
    facilities: ['Programming labs', 'HPC cluster', 'AI/ML lab', 'Project rooms'],
    hours: '08:00 – 22:00',
  },
  {
    id: 'ece',
    code: 'EC',
    name: 'Electronics Department',
    category: 'academic',
    pos: [36, 0],
    height: 8,
    description:
      'Electronics and communication engineering, with rooftop solar arrays and an antenna test mast.',
    facilities: ['VLSI lab', 'Embedded systems lab', 'RF test mast', 'Component store'],
    hours: '08:00 – 20:00',
  },
  {
    id: 'research',
    code: 'RI',
    name: 'Research and Innovation Center',
    category: 'academic',
    pos: [36, -24],
    height: 16.5,
    description:
      'Interdisciplinary research tower and incubator for student start-ups, with a cylindrical wet-lab wing.',
    facilities: ['Incubator', 'Prototyping workshop', 'Wet labs', 'Conference suite'],
    hours: '08:00 – 22:00',
  },
  {
    id: 'auditorium',
    code: 'AU',
    name: 'Auditorium',
    category: 'recreation',
    pos: [-32, -26],
    height: 9.5,
    description:
      '1,200-seat auditorium for convocations, cultural festivals and guest lectures.',
    facilities: ['1,200 seats', 'Green rooms', 'AV control room', 'Foyer exhibition space'],
    hours: 'Event days',
  },
  {
    id: 'cafeteria',
    code: 'CF',
    name: 'Cafeteria',
    category: 'food',
    pos: [10, -26],
    height: 4.5,
    description:
      'Main food court with indoor seating and a covered terrace facing the sports complex.',
    facilities: ['Food court', 'Coffee bar', 'Covered terrace', 'Vegetarian counter'],
    hours: '07:30 – 22:00',
  },
  {
    id: 'medical',
    code: 'MC',
    name: 'Medical Center',
    category: 'emergency',
    pos: [40, 34],
    height: 6,
    description:
      'On-campus clinic with a doctor on duty, first-aid response and an ambulance bay near the ring road.',
    facilities: ['Doctor on duty', 'First-aid response', 'Pharmacy', 'Ambulance bay'],
    hours: 'Open 24 hours',
  },
  {
    id: 'sports',
    code: 'SC',
    name: 'Sports Complex',
    category: 'recreation',
    pos: [-10, -44],
    height: 4,
    description:
      'Football field with a 400 m-style running track, spectator stand and an indoor games pavilion.',
    facilities: ['Football field', 'Running track', 'Spectator stand', 'Indoor games'],
    hours: '05:30 – 21:00',
  },
  {
    id: 'hostel',
    code: 'HS',
    name: 'Student Hostel',
    category: 'residential',
    pos: [28, -46],
    height: 10,
    description:
      'Two residential wings linked by a sky bridge, with a common room and laundry on the ground floor.',
    facilities: ['480 rooms', 'Common room', 'Laundry', 'Warden office'],
    hours: 'Residents only after 22:00',
  },
];

/**
 * Pedestrian pathways — each one becomes an undirected weighted edge.
 * [from, to, name, winding factor]
 */
export const PATHWAYS = [
  ['gate', 'parking', 'West Approach', 1.05],
  ['gate', 'admin', 'Registry Walk', 1.05],
  ['gate', 'acadA', 'Scholars Walk', 1.08],
  ['gate', 'garden', 'Central Avenue', 1.02],
  ['parking', 'acadA', 'Car Park Link', 1.06],
  ['admin', 'acadB', 'Courtyard Lane', 1.06],
  ['admin', 'medical', 'Clinic Path', 1.05],
  ['acadA', 'garden', 'Garden Path West', 1.1],
  ['acadA', 'cs', 'Tech Walk', 1.06],
  ['acadB', 'garden', 'Garden Path East', 1.1],
  ['acadB', 'ece', 'Circuit Lane', 1.05],
  ['acadB', 'medical', 'East Lawn Path', 1.08],
  ['medical', 'ece', 'Eastern Ridge', 1.06],
  ['garden', 'library', 'Library Steps', 1.04],
  ['garden', 'cafeteria', 'Market Path', 1.12],
  ['library', 'cs', 'Archive Lane', 1.06],
  ['library', 'auditorium', 'Festival Walk', 1.06],
  ['library', 'cafeteria', 'Reading Lane', 1.05],
  ['cs', 'auditorium', 'West Ridge', 1.05],
  ['ece', 'research', 'Innovation Way', 1.04],
  ['research', 'cafeteria', 'Incubator Lane', 1.06],
  ['research', 'hostel', 'Residence Rise', 1.07],
  ['cafeteria', 'hostel', 'Hostel Walk', 1.05],
  ['cafeteria', 'sports', 'Terrace Path', 1.06],
  ['auditorium', 'sports', 'Stadium Path', 1.08],
  ['sports', 'hostel', 'Track Side', 1.05],
];

export const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

export function straightLineMeters(a, b) {
  const pa = LOCATION_BY_ID[a].pos;
  const pb = LOCATION_BY_ID[b].pos;
  return Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) * SCALE;
}

/** Walking distance of a pathway in metres (rounded up to 5 m). */
export function pathwayLength(a, b, winding = 1.05) {
  return Math.ceil((straightLineMeters(a, b) * winding) / 5) * 5;
}

export const EDGES = PATHWAYS.map(([a, b, name, winding]) => ({
  a,
  b,
  name,
  weight: pathwayLength(a, b, winding),
}));

export const EDGE_NAME = Object.fromEntries(
  EDGES.flatMap((e) => [
    [`${e.a}|${e.b}`, e.name],
    [`${e.b}|${e.a}`, e.name],
  ])
);

/**
 * Walking-time model.
 * Average adult walking speed on level ground is ~1.4 m/s. Campus paths have
 * crossings, steps and other pedestrians, so we use a conservative 1.25 m/s
 * (75 m/min) and add a 10 s allowance per intermediate junction.
 */
export const WALK_SPEED_MPS = 1.25;
export const JUNCTION_DELAY_S = 10;

export function walkingSeconds(distanceMeters, junctions = 0) {
  return distanceMeters / WALK_SPEED_MPS + junctions * JUNCTION_DELAY_S;
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export function formatDistance(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}
