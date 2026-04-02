import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function Hardware() {
  return (
    <group>
      <RTX5090 />
      <MacMini />
    </group>
  )
}

function RTX5090() {
  const fan1 = useRef<THREE.Mesh>(null)
  const fan2 = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (fan1.current) fan1.current.rotation.z += delta * 5
    if (fan2.current) fan2.current.rotation.z -= delta * 5
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(t.current * 2) * 0.15
    }
  })

  return (
    <group position={[10, 0, -4]}>
      {/* Tower body */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Green edge glow */}
      <mesh ref={glowRef} position={[0, 0.75, 0]}>
        <boxGeometry args={[0.82, 1.52, 0.62]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Fan 1 */}
      <mesh ref={fan1} position={[-0.15, 0.9, -0.31]}>
        <torusGeometry args={[0.18, 0.04, 6, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Fan 2 */}
      <mesh ref={fan2} position={[0.15, 0.6, -0.31]}>
        <torusGeometry args={[0.18, 0.04, 6, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.7, 0]} center distanceFactor={10}>
        <div style={{
          background: 'rgba(10,10,20,0.9)',
          border: '1px solid #22c55e',
          borderRadius: 4,
          padding: '3px 8px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#22c55e',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          RTX 5090 | 59.89 tok/s
        </div>
      </Html>
    </group>
  )
}

function MacMini() {
  const ledRef = useRef<THREE.Mesh>(null)
  const lineRef = useRef<THREE.Line>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(t.current * 3) * 0.3
    }
  })

  return (
    <group position={[10, 0, -1]}>
      {/* Mac Mini body */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#c8c8c8" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* LED */}
      <mesh ref={ledRef} position={[0.4, 0.15, -0.4]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      {/* Tailscale line to RTX */}
      <TailscaleLine />

      {/* Label */}
      <Html position={[0, 0.7, 0]} center distanceFactor={10}>
        <div style={{
          background: 'rgba(10,10,20,0.9)',
          border: '1px solid #06B6D4',
          borderRadius: 4,
          padding: '3px 8px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#06B6D4',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          Mac Mini M4 | 18 Crons | Online
        </div>
      </Html>
    </group>
  )
}

function TailscaleLine() {
  const ref = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.abs(Math.sin(t.current * 2)) * 0.5
    }
  })

  // Line from MacMini (10,0.15,-1) to RTX (10,0.75,-4) — dashed
  const length = 3
  return (
    <mesh ref={ref} position={[0, 0.3, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.01, 0.01, length, 4]} />
      <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.4} transparent opacity={0.6} />
    </mesh>
  )
}
