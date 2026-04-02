import { ContactShadows, Text } from '@react-three/drei'
import * as THREE from 'three'

const DESK_CONFIG = [
  // Left row (Y=0) — monitor faces -Z, chair at +Z
  { pos: [-3.5, 0, -2.5] as [number, number, number], rotY: 0,       color: '#06b6d4' },
  { pos: [-3.5, 0,  0.0] as [number, number, number], rotY: 0,       color: '#22c55e' },
  { pos: [-3.5, 0,  2.5] as [number, number, number], rotY: 0,       color: '#f97316' },
  // Right row (Y=π) — monitor faces +Z, chair at -Z
  { pos: [ 3.5, 0, -2.5] as [number, number, number], rotY: Math.PI, color: '#eab308' },
  { pos: [ 3.5, 0,  0.0] as [number, number, number], rotY: Math.PI, color: '#ec4899' },
  { pos: [ 3.5, 0,  2.5] as [number, number, number], rotY: Math.PI, color: '#8b5cf6' },
]

export default function Office() {
  return (
    <group>
      <Room />
      <Furniture />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={15} blur={2.5} far={5} />
    </group>
  )
}

function Room() {
  return (
    <>
      {/* Main floor — 12x10 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.92} />
      </mesh>

      {/* Center walkway accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[1.8, 10]} />
        <meshStandardMaterial color="#22223a" roughness={0.75} />
      </mesh>

      {/* Back wall — 2.0 tall, left half only */}
      <mesh position={[-1.5, 1.0, -5]} receiveShadow>
        <boxGeometry args={[9, 2.0, 0.12]} />
        <meshStandardMaterial color="#1a1a28" roughness={0.85} />
      </mesh>

      {/* Left wall — 2.0 tall */}
      <mesh position={[-6, 1.0, -0.5]} receiveShadow>
        <boxGeometry args={[0.12, 2.0, 9]} />
        <meshStandardMaterial color="#181826" roughness={0.85} />
      </mesh>

      {/* Amber baseboard — back wall */}
      <mesh position={[-1.5, 0.03, -4.93]}>
        <boxGeometry args={[9, 0.06, 0.02]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.15} />
      </mesh>
      {/* Amber baseboard — left wall */}
      <mesh position={[-5.93, 0.03, -0.5]}>
        <boxGeometry args={[0.02, 0.06, 9]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.15} />
      </mesh>

      {/* WALLTIME HQ on back wall */}
      <Text position={[-1.5, 1.5, -4.9]} fontSize={0.4} color="#f59e0b" anchorX="center">
        WALLTIME HQ
      </Text>
    </>
  )
}

function Furniture() {
  return (
    <>
      {DESK_CONFIG.map((d, i) => (
        <Workstation key={i} position={d.pos} rotationY={d.rotY} agentColor={d.color} />
      ))}
      <MeetingArea />
      <Whiteboard />
      <Bookshelf />
      <CoffeeCorner />
      <Plant position={[-5.5, 0, -0.5]} />
      <Plant position={[5, 0, -4]} />
      <Plant position={[5, 0, 3]} />
      <FloorLamp position={[-4.5, 0, -4]} />
    </>
  )
}

function Workstation({
  position,
  rotationY,
  agentColor,
}: {
  position: [number, number, number]
  rotationY: number
  agentColor: string
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Desk surface */}
      <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.04, 0.75]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.6} metalness={0.15} />
      </mesh>

      {/* 4 legs */}
      {([-0.65, 0.65] as number[]).flatMap(x =>
        ([-0.30, 0.30] as number[]).map(z => [x, z] as [number, number])
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.365, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.73, 8]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
      ))}

      {/* Monitor */}
      <mesh position={[0, 0.925, -0.25]}>
        <boxGeometry args={[0.53, 0.35, 0.025]} />
        <meshStandardMaterial
          color="#111"
          emissive={agentColor}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.754, -0.25]}>
        <cylinderGeometry args={[0.015, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.743, 0.05]}>
        <boxGeometry args={[0.40, 0.012, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.30, 0.743, 0.05]}>
        <boxGeometry args={[0.05, 0.012, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Chair — seat at y=0.45, positioned in front of desk (+Z) */}
      <group position={[0, 0, 0.55]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.48, 0.04, 0.45]} />
          <meshStandardMaterial color="#1e1e2e" />
        </mesh>
        <mesh position={[0, 0.72, 0.20]}>
          <boxGeometry args={[0.46, 0.50, 0.04]} />
          <meshStandardMaterial color="#1e1e2e" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
          <meshStandardMaterial color="#555" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 5]} />
          <meshStandardMaterial color="#444" metalness={0.5} />
        </mesh>
      </group>

      {/* Per-desk color underglow */}
      <pointLight position={[0, 0.5, 0]} intensity={0.3} color={agentColor} distance={2.5} decay={2} />
    </group>
  )
}

function MeetingArea() {
  const chairs: [number, number, number, number][] = [
    [0, 0, -3.2, 0],
    [0, 0, -0.8, Math.PI],
    [-1.2, 0, -2, Math.PI / 2],
    [1.2, 0, -2, -Math.PI / 2],
  ]
  return (
    <group>
      <mesh position={[0, 0.73, -2]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.05, 32]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, -2]}>
        <cylinderGeometry args={[0.1, 0.25, 0.7, 12]} />
        <meshStandardMaterial color="#444" metalness={0.3} />
      </mesh>
      {chairs.map(([x, y, z, rot], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.40, 0]}>
            <boxGeometry args={[0.40, 0.04, 0.38]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.62, -0.17]}>
            <boxGeometry args={[0.38, 0.40, 0.03]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Whiteboard() {
  const stickies: [number, number, string][] = [
    [-0.5, 0.3, '#ef4444'], [-0.1, 0.3, '#eab308'], [0.3, 0.3, '#3b82f6'],
    [0.7, 0.3, '#22c55e'], [-0.3, -0.2, '#ef4444'], [0.1, -0.2, '#8b5cf6'],
  ]
  return (
    <group position={[2, 1.2, -4.9]}>
      <mesh>
        <planeGeometry args={[2.0, 1.2]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {stickies.map(([x, y, c], i) => (
        <mesh key={i} position={[x, y, 0.01]}>
          <planeGeometry args={[0.25, 0.25]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf() {
  const books = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6']
  return (
    <group position={[-5.5, 0, -3]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.8, 1.8, 0.3]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {books.map((c, i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.28, 0.05]}>
          <boxGeometry args={[0.7, 0.15, 0.22]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

function CoffeeCorner() {
  const mugColors = ['#ef4444', '#3b82f6', '#f59e0b']
  return (
    <group position={[-5.5, 0, 1]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.9, 0.4]} />
        <meshStandardMaterial color="#2d1b0e" />
      </mesh>
      <mesh position={[-0.15, 0.95, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.3} />
      </mesh>
      <mesh position={[-0.15, 1.08, 0.11]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {([0.05, 0.18, 0.30] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.93, 0]}>
          <cylinderGeometry args={[0.025, 0.02, 0.05, 8]} />
          <meshStandardMaterial color={mugColors[i]} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.24, 8]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      <mesh position={[0.04, 0.55, 0.02]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
    </group>
  )
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 8]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.15, 0.25, 12, 1, true]} />
        <meshStandardMaterial
          color="#f59e0b"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[0, 1.5, 0]} intensity={0.6} color="#fde68a" distance={4} decay={2} />
    </group>
  )
}
