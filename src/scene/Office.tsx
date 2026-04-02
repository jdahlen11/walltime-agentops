import { useRef } from 'react'
import { ContactShadows, Grid } from '@react-three/drei'
import * as THREE from 'three'

export default function Office() {
  const wallMat = { color: '#2a2a3e', roughness: 0.9 }
  const wallH = 0.5

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.95} />
      </mesh>

      {/* Interior warm floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.8} />
      </mesh>

      {/* Grid overlay */}
      <Grid
        position={[0, 0.001, 0]}
        args={[30, 20]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#333355"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#444466"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Room walls */}
      {/* Front wall */}
      <mesh position={[0, wallH / 2, -7]} castShadow>
        <boxGeometry args={[22, wallH, 0.3]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, wallH / 2, 7]} castShadow>
        <boxGeometry args={[22, wallH, 0.3]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-11, wallH / 2, 0]} castShadow>
        <boxGeometry args={[0.3, wallH, 14]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* Right wall (partial — hardware side) */}
      <mesh position={[11, wallH / 2, 0]} castShadow>
        <boxGeometry args={[0.3, wallH, 14]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.4}
        scale={25}
        blur={2}
        far={4}
      />

      {/* Coffee station */}
      <CoffeeStation />

      {/* Meeting table */}
      <MeetingTable />

      {/* Decorations */}
      <Plant position={[-9, 0, 5]} />
      <Plant position={[-9, 0, -5]} />
      <Plant position={[6, 0, 5]} />
      <FloorLamp position={[-8, 0, 6]} />
      <Couch />
      <Bookshelf />
    </group>
  )
}

function CoffeeStation() {
  return (
    <group position={[8, 0, 0]}>
      {/* Counter */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.8, 0.8]} />
        <meshStandardMaterial color="#6B4226" roughness={0.7} />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[-0.4, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      {/* Machine top */}
      <mesh position={[-0.4, 1.1, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Mugs */}
      {[-0.1, 0.2, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.85, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
            <meshStandardMaterial color={i === 0 ? '#3B82F6' : i === 1 ? '#10B981' : '#F59E0B'} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function MeetingTable() {
  const chairPositions: [number, number, number, number][] = [
    [0, 0, -2, 0],
    [0, 0, 2, Math.PI],
    [-2, 0, 0, Math.PI / 2],
    [2, 0, 0, -Math.PI / 2],
  ]
  return (
    <group position={[0, 0, 0]}>
      {/* Table top */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        <meshStandardMaterial color="#5C3D2E" roughness={0.6} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.375, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.75, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Chairs */}
      {chairPositions.map(([x, y, z, rot], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, rot, 0]}>
          {/* Seat */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.05, 0.5]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.7, -0.2]}>
            <boxGeometry args={[0.5, 0.5, 0.05]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          {/* Legs */}
          {[[-0.2, -0.2], [-0.2, 0.2], [0.2, -0.2], [0.2, 0.2]].map(([lx, lz], li) => (
            <mesh key={li} position={[lx, 0.2, lz]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.45, 0.1]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#3a7a32" roughness={0.8} />
      </mesh>
    </group>
  )
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#ffe4a0" emissive="#ffe4a0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function Couch() {
  return (
    <group position={[-9, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3, 0.5, 1]} />
        <meshStandardMaterial color="#0d9488" roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.65, -0.45]}>
        <boxGeometry args={[3, 0.6, 0.1]} />
        <meshStandardMaterial color="#0d9488" roughness={0.8} />
      </mesh>
      {/* Arms */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.1, 0.4, 1]} />
          <meshStandardMaterial color="#0a7a70" />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf() {
  return (
    <group position={[-10, 0, -6]}>
      {/* Frame */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2, 0.4]} />
        <meshStandardMaterial color="#5C3D2E" roughness={0.8} />
      </mesh>
      {/* Books */}
      {[0.6, 0.9, 1.2, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.01]}>
          <boxGeometry args={[1.3, 0.2, 0.38]} />
          <meshStandardMaterial color={['#c0392b', '#2980b9', '#27ae60', '#e67e22'][i]} />
        </mesh>
      ))}
    </group>
  )
}
