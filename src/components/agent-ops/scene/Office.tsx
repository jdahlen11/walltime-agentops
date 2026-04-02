import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Grid, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'
import CoffeeStation from './CoffeeStation'

export default function Office() {
  return (
    <group>
      <Floors />
      <Walls />
      <PartialCeiling />
      <Furniture />
      <CoffeeStation />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={28} blur={2.5} far={5} />
      <Environment preset="city" background={false} />
    </group>
  )
}

function Floors() {
  return (
    <>
      {/* Outer dark floor */}
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#0e0e1a" roughness={0.95} />
      </mesh>
      {/* Inner warm carpet */}
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[22, 16]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.92} />
      </mesh>
      {/* Center walkway */}
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[2.5, 16]} />
        <meshStandardMaterial color="#16213e" roughness={0.6} metalness={0.08} />
      </mesh>
      <Grid
        position={[0, 0.003, 0]}
        args={[22, 16]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#333355"
        sectionSize={5}
        sectionThickness={0.7}
        sectionColor="#3a3a5a"
        fadeDistance={35}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </>
  )
}

function Walls() {
  const wallColor = '#12122a'
  const wallH = 3.5
  return (
    <>
      {/* Back wall */}
      <mesh receiveShadow position={[0, wallH/2, -9]} castShadow>
        <boxGeometry args={[24, wallH, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow position={[-12, wallH/2, 0]} castShadow>
        <boxGeometry args={[0.3, wallH, 18]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Right wall */}
      <mesh receiveShadow position={[12, wallH/2, 0]} castShadow>
        <boxGeometry args={[0.3, wallH, 18]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0, 0.1, -8.85]}>
        <boxGeometry args={[24, 0.2, 0.05]} />
        <meshStandardMaterial color="#0a0a18" roughness={0.9} />
      </mesh>

      {/* WallTime logo on back wall */}
      <mesh position={[0, 2.5, -8.8]}>
        <boxGeometry args={[3, 0.4, 0.05]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
      </mesh>

      {/* Whiteboard */}
      <mesh position={[-6, 1.8, -8.5]}>
        <boxGeometry args={[3.5, 2, 0.08]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.95} />
      </mesh>
      {/* Whiteboard frame */}
      <mesh position={[-6, 1.8, -8.44]}>
        <boxGeometry args={[3.7, 2.2, 0.04]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>

      {/* Wall clock */}
      <WallClock position={[6, 2.5, -8.82]} />
    </>
  )
}

function WallClock({ position }: { position: [number, number, number] }) {
  const minuteRef = useRef<THREE.Mesh>(null)
  const hourRef = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const now = new Date()
    if (minuteRef.current) minuteRef.current.rotation.z = -(now.getMinutes() / 60) * Math.PI * 2
    if (hourRef.current) hourRef.current.rotation.z = -((now.getHours() % 12) / 12) * Math.PI * 2
  })
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
      </mesh>
      <mesh ref={minuteRef} position={[0, 0.03, 0]} rotation={[Math.PI/2, 0, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh ref={hourRef} position={[0, 0.04, 0]} rotation={[Math.PI/2, 0, 0]}>
        <boxGeometry args={[0.05, 0.28, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function PartialCeiling() {
  return (
    <group>
      {/* Ceiling panels — sides only */}
      <mesh position={[-9, 3.5, 0]}>
        <boxGeometry args={[6, 0.15, 18]} />
        <meshStandardMaterial color="#111121" roughness={0.9} />
      </mesh>
      <mesh position={[9, 3.5, 0]}>
        <boxGeometry args={[6, 0.15, 18]} />
        <meshStandardMaterial color="#111121" roughness={0.9} />
      </mesh>
      {/* Recessed lights */}
      {[-6, -2, 2, 6].map((x, i) => (
        <group key={i} position={[x, 3.42, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.08, 0.6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.5]} />
            <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, -0.1, 0]} intensity={0.4} color="#fff5e0" distance={5} />
        </group>
      ))}
    </group>
  )
}

function Furniture() {
  return (
    <>
      <MeetingTableGeometry />
      <Plant position={[-10, 0, 7]} />
      <Plant position={[-10, 0, -7]} />
      <Plant position={[7, 0, 7]} />
      <Couch position={[-10, 0, 0]} />
      <Bookshelf position={[-11, 0, -6]} />
      <FloorLamp position={[-9, 0, 6.5]} />
    </>
  )
}

function MeetingTableGeometry() {
  const chairOffsets: [number, number, number, number][] = [
    [-1.5, 0, 4.5, 0.8],
    [1.5,  0, 4.5, -0.8],
    [-1.5, 0, 6.5, Math.PI - 0.8],
    [1.5,  0, 6.5, Math.PI + 0.8],
  ]
  return (
    <group>
      <mesh castShadow position={[0, 0.76, 5.5]}>
        <cylinderGeometry args={[1.8, 1.8, 0.06, 32]} />
        <meshStandardMaterial color="#4a2e0a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.38, 5.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.76, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {chairOffsets.map(([x, y, z, ry], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.5]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          <mesh position={[0, 0.68, -0.22]}>
            <boxGeometry args={[0.5, 0.55, 0.06]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.3}>
      <group position={position}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.4, 8]} />
          <meshStandardMaterial color="#7B4F2E" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.38, 8, 6]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, 0.5, 0.1]}>
          <sphereGeometry args={[0.24, 8, 6]} />
          <meshStandardMaterial color="#3a7a32" roughness={0.8} />
        </mesh>
        <mesh position={[-0.15, 0.52, -0.1]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#265a20" roughness={0.8} />
        </mesh>
      </group>
    </Float>
  )
}

function Couch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3, 0.5, 1]} />
        <meshStandardMaterial color="#0d4a44" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.65, -0.45]}>
        <boxGeometry args={[3, 0.65, 0.12]} />
        <meshStandardMaterial color="#0d4a44" roughness={0.8} />
      </mesh>
      {([-1.45, 1.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.12, 0.6, 1]} />
          <meshStandardMaterial color="#0a3a34" />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  const books = ['#c0392b', '#2980b9', '#27ae60', '#e67e22', '#8e44ad', '#2c3e50']
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2, 0.4]} />
        <meshStandardMaterial color="#5C3D2E" roughness={0.8} />
      </mesh>
      {books.map((c, i) => (
        <mesh key={i} position={[0, 0.25 + i * 0.3, 0.02]}>
          <boxGeometry args={[1.3, 0.22, 0.36]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.2, 6]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#ffe4a0" emissive="#ffe4a0" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} intensity={0.5} color="#ffe4a0" distance={4} />
    </group>
  )
}
