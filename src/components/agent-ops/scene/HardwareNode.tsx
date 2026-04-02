import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function HardwareNodes() {
  return (
    <>
      <RTX5090 />
      <MacMiniM4 />
    </>
  )
}

function RTX5090() {
  const fan1 = useRef<THREE.Mesh>(null)
  const fan2 = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Mesh>(null)

  useFrame((s, d) => {
    if (fan1.current) fan1.current.rotation.z += d * 6
    if (fan2.current) fan2.current.rotation.z -= d * 6
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(s.clock.elapsedTime * 1.5) * 0.15
    }
  })

  return (
    <group position={[11, 0, -4]}>
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh ref={glow} position={[0, 0.75, 0]}>
        <boxGeometry args={[0.82, 1.52, 0.62]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh ref={fan1} position={[-0.17, 0.9, -0.32]}>
        <torusGeometry args={[0.17, 0.04, 6, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={fan2} position={[0.17, 0.6, -0.32]}>
        <torusGeometry args={[0.17, 0.04, 6, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Html position={[0, 1.75, 0]} center distanceFactor={10}>
        <div style={{ background:'rgba(10,10,20,0.9)', border:'1px solid #22c55e', borderRadius:4, padding:'3px 8px', fontFamily:'monospace', fontSize:10, color:'#22c55e', whiteSpace:'nowrap', pointerEvents:'none' }}>
          RTX 5090 | 59.89 tok/s
        </div>
      </Html>
    </group>
  )
}

function MacMiniM4() {
  const led = useRef<THREE.Mesh>(null)
  const line = useRef<THREE.Mesh>(null)

  useFrame((s, _d) => {
    if (led.current) {
      const mat = led.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 2.5) * 0.35
    }
    if (line.current) {
      const mat = line.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.abs(Math.sin(s.clock.elapsedTime * 2)) * 0.4
    }
  })

  return (
    <group position={[11, 0, -1]}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh ref={led} position={[0.42, 0.15, -0.42]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={line} position={[0, 0.5, -1.5]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 3, 4]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.35} transparent opacity={0.55} />
      </mesh>
      <Html position={[0, 0.7, 0]} center distanceFactor={10}>
        <div style={{ background:'rgba(10,10,20,0.9)', border:'1px solid #06b6d4', borderRadius:4, padding:'3px 8px', fontFamily:'monospace', fontSize:10, color:'#06b6d4', whiteSpace:'nowrap', pointerEvents:'none' }}>
          Mac Mini M4 | 18 Crons | Online
        </div>
      </Html>
    </group>
  )
}
