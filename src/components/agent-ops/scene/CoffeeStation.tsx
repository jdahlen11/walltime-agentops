import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CoffeeStation() {
  return (
    <group position={[8, 0, 0]}>
      {/* Counter */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.8, 0.9]} />
        <meshStandardMaterial color="#6B4226" roughness={0.7} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[2.2, 0.04, 0.9]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      {/* Coffee machine body */}
      <mesh position={[-0.5, 1.1, 0]}>
        <boxGeometry args={[0.6, 0.55, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Machine top */}
      <mesh position={[-0.5, 1.42, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.35]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* LED indicator */}
      <BreathingLED position={[-0.25, 1.15, -0.26]} color="#22c55e" />
      {/* Mugs */}
      {[0.2, 0.5, 0.8].map((x, i) => (
        <mesh key={i} position={[x - 0.2, 0.9, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.14, 8]} />
          <meshStandardMaterial color={(['#06b6d4', '#22c55e', '#f97316'] as string[])[i]} />
        </mesh>
      ))}
      {/* Steam particles */}
      <SteamParticles />
      {/* FUEL label area */}
      <mesh position={[0, 0.83, -0.44]}>
        <boxGeometry args={[0.8, 0.12, 0.01]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function BreathingLED({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.4 + Math.sin(s.clock.elapsedTime * 2) * 0.4
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  )
}

function SteamParticles() {
  const particles = useRef<THREE.Group>(null)
  const data = useRef([0, 0.3, 0.6].map(offset => ({ y: offset, opacity: 1 - offset })))

  useFrame((_, delta) => {
    if (!particles.current) return
    particles.current.children.forEach((child, i) => {
      const d = data.current[i]!
      d.y += delta * 0.3
      d.opacity = Math.max(0, 1 - d.y * 1.5)
      child.position.y = 1.55 + d.y
      child.scale.setScalar(0.5 + d.y * 0.5)
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = d.opacity
      if (d.y > 0.8) { d.y = 0; d.opacity = 1 }
    })
  })

  return (
    <group ref={particles}>
      {[0, 0.3, 0.6].map((offset, i) => (
        <mesh key={i} position={[-0.5, 1.55 + offset, 0]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}
