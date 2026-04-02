import { useMemo } from 'react'
import * as THREE from 'three'

interface AgentDeskProps {
  position: [number, number, number]
  color: string
  active?: boolean
}

export default function AgentDesk({ position, color, active = false }: AgentDeskProps) {
  const emissiveIntensity = active ? 0.6 : 0.2

  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh castShadow position={[0, 0.77, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>

      {/* Desk legs */}
      {[[-0.55, 0.35, -0.35], [0.55, 0.35, -0.35], [-0.55, 0.35, 0.35], [0.55, 0.35, 0.35]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
          <meshStandardMaterial color="#6B5214" />
        </mesh>
      ))}

      {/* Monitor base */}
      <mesh position={[0, 0.82, -0.25]}>
        <boxGeometry args={[0.15, 0.04, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.9, -0.26]}>
        <boxGeometry args={[0.03, 0.12, 0.03]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Monitor screen */}
      <mesh position={[0, 1.05, -0.27]}>
        <boxGeometry args={[0.6, 0.4, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Screen face */}
      <mesh position={[0, 1.05, -0.26]}>
        <boxGeometry args={[0.56, 0.36, 0.001]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.8, 0.05]}>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Chair seat */}
      <mesh position={[0, 0.45, 0.55]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, 0.75, 0.8]}>
        <boxGeometry args={[0.5, 0.5, 0.06]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>
      {/* Chair legs */}
      {[[-0.2, 0.22, 0.35], [0.2, 0.22, 0.35], [-0.2, 0.22, 0.75], [0.2, 0.22, 0.75]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, 0.44, 6]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}

      {/* Per-desk point light */}
      <pointLight color={color} intensity={0.3} distance={3} position={[0, 1.5, 0]} />
    </group>
  )
}
