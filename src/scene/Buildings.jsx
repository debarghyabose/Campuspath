/**
 * Architectural models for each IEM College location, built from primitive
 * geometry. Each model is centred on its graph vertex (local origin).
 */
import { Box, Cyl, Block, Mat } from './primitives.jsx';

function MainGate() {
  return (
    <group position={[0, 0, 3]}>
      <Box p={[-5, 2.6, 0]} s={[1.6, 5.2, 1.6]} tone="body" />
      <Box p={[5, 2.6, 0]} s={[1.6, 5.2, 1.6]} tone="body" />
      <Box p={[0, 5.6, 0]} s={[11.6, 1, 2]} tone="roof" />
      <Box p={[0, 5.6, 1.02]} s={[7, 0.5, 0.05]} tone="accent" shadow={false} />
      {/* guard booth */}
      <Box p={[8.5, 1.3, 0.5]} s={[3, 2.6, 2.6]} tone="body" />
      <Box p={[8.5, 1.5, 0.5]} s={[3.06, 0.8, 2.66]} tone="glass" shadow={false} />
      <Box p={[8.5, 2.75, 0.5]} s={[3.6, 0.3, 3.2]} tone="roof" />
      {/* barrier arm */}
      <Box p={[2.5, 1.1, -0.6]} s={[5, 0.18, 0.18]} tone="#C9C3B6" />
    </group>
  );
}

function AcademicA() {
  return (
    <group>
      <Block p={[0, -2]} w={19} d={7} h={7} floors={3} />
      <Block p={[-6.5, 4]} w={6} d={7} h={7} floors={3} />
      {/* entrance portico */}
      <Box p={[3, 2.2, 2.3]} s={[5, 0.3, 2.6]} tone="roof" />
      <Cyl p={[1, 1.1, 3.3]} args={[0.18, 0.18, 2.2, 10]} tone="trim" />
      <Cyl p={[5, 1.1, 3.3]} args={[0.18, 0.18, 2.2, 10]} tone="trim" />
      <Box p={[0, 7.6, -2]} s={[6, 0.6, 0.15]} tone="accent" shadow={false} />
    </group>
  );
}

function AcademicB() {
  return (
    <group>
      <Block p={[0, -4]} w={18} d={5} h={8.5} floors={4} />
      <Block p={[-6.5, 2.5]} w={5} d={8} h={8.5} floors={4} />
      <Block p={[6.5, 2.5]} w={5} d={8} h={8.5} floors={4} />
      {/* courtyard */}
      <Box p={[0, 0.06, 2.5]} s={[7.6, 0.12, 8]} tone="#55705C" shadow={false} />
      <Cyl p={[0, 1.4, 2.5]} args={[0, 1.4, 2.6, 7]} tone="#5E7F63" />
      <Box p={[0, 8.95, -4]} s={[8, 0.4, 0.15]} tone="accent" shadow={false} />
    </group>
  );
}

function ComputerScience() {
  return (
    <group>
      <Box p={[0, 1.6, 0]} s={[12, 3.2, 10]} tone="glass" />
      <Box p={[0, 3.35, 0]} s={[12.4, 0.3, 10.4]} tone="body" />
      <group rotation={[0, 0.16, 0]}>
        <Box p={[0.8, 5.1, -0.5]} s={[10, 3.2, 8.6]} tone="glass" />
        <Box p={[0.8, 6.85, -0.5]} s={[10.4, 0.3, 9]} tone="body" />
      </group>
      <group rotation={[0, -0.12, 0]}>
        <Box p={[-0.6, 8.5, 0.4]} s={[8, 3, 7.4]} tone="glass" />
        <Box p={[-0.6, 10.15, 0.4]} s={[8.4, 0.3, 7.8]} tone="body" />
      </group>
      {/* vertical fins */}
      {[-5, -2.5, 0, 2.5, 5].map((x) => (
        <Box key={x} p={[x, 1.6, 5.05]} s={[0.15, 3.2, 0.2]} tone="light" shadow={false} />
      ))}
      <Box p={[3, 10.5, 0.4]} s={[2.2, 0.6, 2.2]} tone="trim" />
      <Box p={[0, 3.35, 5.25]} s={[5, 0.32, 0.1]} tone="accent" shadow={false} />
    </group>
  );
}

function Electronics() {
  return (
    <group>
      <Block p={[0, 0]} w={16} d={10} h={7} floors={3} />
      {/* rooftop solar array */}
      {[-5, -1.6, 1.8, 5.2].map((x) =>
        [-2.4, 1.6].map((z) => (
          <Box key={`${x}${z}`} p={[x, 7.75, z]} r={[-0.45, 0, 0]} s={[3, 0.1, 2.4]} tone="#24364F" metalness={0.4} roughness={0.35} />
        ))
      )}
      {/* antenna mast */}
      <Cyl p={[-6.4, 11, 3.6]} args={[0.12, 0.2, 8, 8]} tone="trim" />
      <Box p={[-6.4, 13, 3.6]} s={[1.8, 0.1, 0.1]} tone="trim" />
      <Box p={[-6.4, 14, 3.6]} s={[1.2, 0.1, 0.1]} tone="trim" />
      <Box p={[0, 7.1, 5.2]} s={[5, 0.4, 0.12]} tone="accent" shadow={false} />
    </group>
  );
}

function Library() {
  return (
    <group>
      <Block p={[0, -1]} w={18} d={10} h={7} floors={2} />
      {/* colonnade */}
      <Box p={[0, 0.25, 5.5]} s={[18, 0.5, 3]} tone="trim" />
      <Box p={[0, 6.2, 5.7]} s={[18.4, 0.6, 3.2]} tone="roof" />
      {Array.from({ length: 8 }, (_, i) => (
        <Cyl key={i} p={[-7.7 + i * 2.2, 3.3, 6.6]} args={[0.32, 0.36, 5.6, 12]} tone="light" />
      ))}
      {/* reading rotunda */}
      <Cyl p={[0, 8.2, -1]} args={[4.2, 4.4, 2.4, 32]} tone="body" />
      <mesh position={[0, 9.4, -1]} castShadow>
        <sphereGeometry args={[4.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat tone="roof" />
      </mesh>
      <Cyl p={[0, 13.8, -1]} args={[0.5, 0.6, 0.8, 12]} tone="trim" />
    </group>
  );
}

function Research() {
  return (
    <group>
      <Block p={[-1, 0]} w={9} d={9} h={15} floors={6} />
      {/* cantilever */}
      <Box p={[4.5, 11, 0]} s={[11, 3.2, 7]} tone="glass" />
      <Box p={[4.5, 12.75, 0]} s={[11.3, 0.3, 7.3]} tone="body" />
      <Box p={[4.5, 9.25, 0]} s={[11.3, 0.3, 7.3]} tone="body" />
      {/* cylindrical lab wing */}
      <Cyl p={[5.5, 3, 4]} args={[3.6, 3.6, 6, 32]} tone="body" />
      <Cyl p={[5.5, 3.3, 4]} args={[3.65, 3.65, 1.6, 32]} tone="glass" shadow={false} />
      <Cyl p={[5.5, 6.15, 4]} args={[3.8, 3.8, 0.3, 32]} tone="roof" />
      <Box p={[-1, 15.6, 0]} s={[3, 0.9, 3]} tone="trim" />
      <Box p={[-1, 14.2, 4.55]} s={[4, 0.5, 0.12]} tone="accent" shadow={false} />
    </group>
  );
}

function Auditorium() {
  return (
    <group>
      <Cyl p={[0, 3, 0]} args={[8, 8.4, 6, 40]} tone="body" />
      <Cyl p={[0, 3.6, 0]} args={[8.05, 8.45, 0.6, 40]} tone="glass" shadow={false} />
      {/* raked roof */}
      <mesh position={[0, 7, 0]} rotation={[0.12, 0, 0]} castShadow>
        <cylinderGeometry args={[7.2, 8.6, 2, 40]} />
        <Mat tone="roof" />
      </mesh>
      <Cyl p={[0, 8.3, 0]} args={[5, 7.2, 0.8, 40]} tone="trim" />
      {/* fly tower */}
      <Box p={[0, 6, -5.5]} s={[7, 10, 3.5]} tone="body" />
      {/* entrance canopy */}
      <Box p={[0, 3.2, 9.4]} s={[9, 0.35, 3.4]} tone="roof" />
      {[-4, 4].map((x) => (
        <Cyl key={x} p={[x, 1.6, 10.6]} args={[0.18, 0.18, 3.2, 10]} tone="trim" />
      ))}
      <Box p={[0, 3.6, 11.12]} s={[6, 0.5, 0.1]} tone="accent" shadow={false} />
    </group>
  );
}

function Cafeteria() {
  return (
    <group>
      <Box p={[0, 1.75, -1]} s={[14, 3.5, 8]} tone="glass" />
      <Box p={[-4.5, 1.75, -1]} s={[5, 3.5, 8.06]} tone="body" />
      {/* floating canopy */}
      <Box p={[1, 4.2, 0.4]} s={[17, 0.4, 12]} tone="roof" />
      {[[-6.5, 5.8], [8.8, 5.8], [8.8, -5], [-6.5, -5]].map(([x, z]) => (
        <Cyl key={`${x}${z}`} p={[x, 2.05, z]} args={[0.18, 0.18, 4.1, 10]} tone="trim" />
      ))}
      {/* terrace tables */}
      {[-2, 2, 6].map((x) =>
        [4.6].map((z) => (
          <group key={x} position={[x, 0, z]}>
            <Cyl p={[0, 0.75, 0]} args={[0.9, 0.9, 0.08, 16]} tone="light" />
            <Cyl p={[0, 0.38, 0]} args={[0.08, 0.08, 0.75, 8]} tone="dark" />
          </group>
        ))
      )}
      <Box p={[-4.5, 3.75, 3.06]} s={[4, 0.4, 0.1]} tone="accent" shadow={false} />
    </group>
  );
}

function SportsComplex() {
  return (
    <group>
      {/* track */}
      <Box p={[0, 0.06, 0]} s={[30, 0.12, 19]} tone="#7A4E3E" shadow={false} />
      {/* field */}
      <Box p={[0, 0.14, 0]} s={[24, 0.06, 13]} tone="#3F6B4A" shadow={false} />
      {/* field markings */}
      <Box p={[0, 0.18, 0]} s={[0.12, 0.02, 13]} tone="#E6E6E6" shadow={false} />
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.35, 40]} />
        <meshBasicMaterial color="#E6E6E6" />
      </mesh>
      {[-12, 12].map((x) => (
        <Box key={x} p={[x * 0.92, 0.18, 0]} s={[2.4, 0.02, 6]} tone="#4A7B56" shadow={false} />
      ))}
      {/* goals */}
      {[-11.6, 11.6].map((x) => (
        <Box key={x} p={[x, 0.9, 0]} s={[0.15, 1.8, 3.6]} tone="#EDEDED" />
      ))}
      {/* stepped spectator stand */}
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} p={[0, 0.5 + i * 0.6, 11 + i * 1.1]} s={[20, 1 + i * 1.2, 1.2]} tone="body" />
      ))}
      <Box p={[0, 5.8, 12.6]} s={[21, 0.25, 5.4]} r={[-0.12, 0, 0]} tone="roof" />
      {/* pavilion */}
      <Block p={[-18.5, 4]} w={5} d={9} h={4} floors={1} />
      <Box p={[-18.5, 4.45, 8.56]} s={[3, 0.4, 0.1]} tone="accent" shadow={false} />
    </group>
  );
}

function Hostel() {
  return (
    <group>
      <Block p={[0, -4]} w={17} d={4.5} h={10} floors={5} />
      <Block p={[0, 4]} w={17} d={4.5} h={10} floors={5} />
      {/* sky bridge */}
      <Box p={[0, 6.5, 0]} s={[3, 2.2, 3.6]} tone="glass" />
      <Box p={[0, 1.4, 0]} s={[5, 2.8, 3.6]} tone="body" />
      {/* balconies */}
      {[2, 4, 6, 8].map((y) => (
        <Box key={y} p={[0, y, 6.45]} s={[16, 0.12, 0.6]} tone="trim" shadow={false} />
      ))}
      <Box p={[0, 10.5, 6.33]} s={[5, 0.5, 0.12]} tone="accent" shadow={false} />
    </group>
  );
}

function Administration() {
  return (
    <group>
      <Block p={[0, 0]} w={19} d={9} h={6} floors={2} />
      {/* clock tower */}
      <Box p={[0, 7, 0.5]} s={[3.4, 14, 3.4]} tone="body" />
      <Box p={[0, 14.4, 0.5]} s={[4, 0.6, 4]} tone="roof" />
      <mesh position={[0, 15.8, 0.5]} castShadow>
        <coneGeometry args={[2.4, 2.4, 4]} />
        <Mat tone="roof" />
      </mesh>
      <Cyl p={[0, 11.5, 2.22]} r={[Math.PI / 2, 0, 0]} args={[1.1, 1.1, 0.12, 24]} tone="light" shadow={false} />
      <Box p={[0, 11.5, 2.3]} s={[0.1, 0.9, 0.05]} tone="dark" shadow={false} />
      {/* pediment entrance */}
      <Box p={[0, 3, 5.2]} s={[6, 6, 1.4]} tone="light" />
      <Box p={[0, 6.4, 5.2]} s={[7, 0.6, 1.8]} tone="roof" />
      <Box p={[0, 6.2, 6.15]} s={[4, 0.4, 0.1]} tone="accent" shadow={false} />
    </group>
  );
}

const CAR_COLORS = ['#B8BCC4', '#5B6270', '#8E2F2F', '#2D3A52', '#D9D9D9', '#3A3F47', '#6B6E73', '#C2B49A'];

function Parking() {
  const cars = [];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      if ((row * 8 + i) % 5 === 3) continue; // a few empty bays
      cars.push({ x: -8.4 + i * 2.4, z: row === 0 ? -3.6 : 3.6, c: CAR_COLORS[(i * 3 + row) % CAR_COLORS.length] });
    }
  }
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[22, 0.1, 16]} tone="#B7C9DC" shadow={false} />
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i}>
          <Box p={[-9.6 + i * 2.4, 0.12, -3.6]} s={[0.08, 0.02, 4.4]} tone="#C9CCD1" shadow={false} />
          <Box p={[-9.6 + i * 2.4, 0.12, 3.6]} s={[0.08, 0.02, 4.4]} tone="#C9CCD1" shadow={false} />
        </group>
      ))}
      {cars.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <Box p={[0, 0.55, 0]} s={[1.6, 0.7, 3.6]} tone={c.c} roughness={0.45} />
          <Box p={[0, 1.1, -0.2]} s={[1.4, 0.5, 1.9]} tone="#2C333C" roughness={0.3} />
        </group>
      ))}
      {/* EV chargers */}
      {[-6, 0, 6].map((x) => (
        <Box key={x} p={[x, 0.7, -6.4]} s={[0.4, 1.4, 0.3]} tone="accent" />
      ))}
    </group>
  );
}

function Medical() {
  return (
    <group>
      <Block p={[0, 0]} w={13} d={9} h={6} floors={2} />
      {/* rooftop cross */}
      <Box p={[0, 6.45, 0]} s={[3.6, 0.2, 1.1]} tone="#D95B5B" shadow={false} />
      <Box p={[0, 6.45, 0]} s={[1.1, 0.2, 3.6]} tone="#D95B5B" shadow={false} />
      {/* ambulance bay canopy */}
      <Box p={[-4, 3, 6.4]} s={[6, 0.3, 4]} tone="roof" />
      {[-6.6, -1.4].map((x) => (
        <Cyl key={x} p={[x, 1.5, 8.1]} args={[0.15, 0.15, 3, 8]} tone="trim" />
      ))}
      <group position={[-4, 0, 6.8]}>
        <Box p={[0, 0.9, 0]} s={[1.8, 1.4, 3.8]} tone="#EDEDED" roughness={0.4} />
        <Box p={[0, 1.2, 0]} s={[1.84, 0.25, 3.84]} tone="#D95B5B" shadow={false} />
      </group>
      <Box p={[3, 6.2, 4.56]} s={[4, 0.5, 0.12]} tone="accent" shadow={false} />
    </group>
  );
}

function Garden() {
  return (
    <group>
      <Cyl p={[0, 0.08, 0]} args={[10, 10, 0.16, 48]} tone="#466B4F" shadow={false} />
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[3.4, 4.8, 48]} />
        <Mat tone="#8F8A80" />
      </mesh>
      {/* fountain */}
      <Cyl p={[0, 0.45, 0]} args={[3, 3.2, 0.6, 40]} tone="light" />
      <Cyl p={[0, 0.72, 0]} args={[2.6, 2.6, 0.1, 40]} tone="#4C7DA8" roughness={0.15} metalness={0.2} shadow={false} />
      <Cyl p={[0, 1.4, 0]} args={[0.4, 0.6, 1.4, 16]} tone="light" />
      <Cyl p={[0, 2.15, 0]} args={[1.2, 0.8, 0.25, 24]} tone="light" />
      {/* hedges */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        return (
          <Box
            key={i}
            p={[Math.cos(a) * 7.6, 0.6, Math.sin(a) * 7.6]}
            r={[0, -a, 0]}
            s={[0.9, 1, 3]}
            tone="#3E6447"
          />
        );
      })}
      {/* open-air stage */}
      <Box p={[0, 0.4, -8.2]} s={[6, 0.6, 2.6]} tone="trim" />
    </group>
  );
}

export const BUILDING_MODELS = {
  gate: MainGate,
  acadA: AcademicA,
  acadB: AcademicB,
  cs: ComputerScience,
  ece: Electronics,
  library: Library,
  research: Research,
  auditorium: Auditorium,
  cafeteria: Cafeteria,
  sports: SportsComplex,
  hostel: Hostel,
  admin: Administration,
  parking: Parking,
  medical: Medical,
  garden: Garden,
};

/** Approximate footprint radius per model, used for selection rings and keeping trees clear. */
export const FOOTPRINT = {
  gate: 9,
  acadA: 11,
  acadB: 11,
  cs: 8.5,
  ece: 10,
  library: 11,
  research: 11,
  auditorium: 10.5,
  cafeteria: 10,
  sports: 18,
  hostel: 10.5,
  admin: 11,
  parking: 12,
  medical: 9.5,
  garden: 10.5,
};
