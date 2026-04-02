import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Agent } from '../store/agentStore'

interface AgentCharacterProps {
  agent: Agent
  isMobile: boolean
}

export default function AgentCharacter({ agent, isMobile }: AgentCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const legLRef = useRef<THREE.Mesh>(null)
  const legRRef = useRef<THREE.Mesh>(null)
  const armLRef = useRef<THREE.Mesh>(null)
  const armRRef = useRef<THREE.Mesh>(null)

  const t = useRef(0)
  const legPhase = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (!groupRef.current) return

    const g = groupRef.current
    const target = new THREE.Vector3(...agent.targetPosition)
    const current = new THREE.Vector3(g.position.x, g.position.y, g.position.z)
    const dist = current.distanceTo(target)

    if (agent.state === 'walking' || agent.state === 'coffee') {
      if (dist > 0.1) {
        // Move toward target
        current.lerp(target, delta * 2)
        g.position.set(current.x, current.y, current.z)
        // Look toward target
        const dir = target.clone().sub(current)
        if (dir.length() > 0.01) {
          g.rotation.y = Math.atan2(dir.x, dir.z)
        }
        // Forward lean
        if (bodyRef.current) bodyRef.current.rotation.x = 0.1
        // Leg animation
        legPhase.current += delta * 8
        if (legLRef.current) legLRef.current.position.y = 0.2 + Math.sin(legPhase.current) * 0.08
        if (legRRef.current) legRRef.current.position.y = 0.2 + Math.sin(legPhase.current + Math.PI) * 0.08
        if (armLRef.current) armLRef.current.rotation.x = Math.sin(legPhase.current + Math.PI) * 0.4
        if (armRRef.current) armRRef.current.rotation.x = Math.sin(legPhase.current) * 0.4
      } else {
        if (bodyRef.current) bodyRef.current.rotation.x = 0
        if (legLRef.current) legLRef.current.position.y = 0.2
        if (legRRef.current) legRRef.current.position.y = 0.2
        if (armLRef.current) armLRef.current.rotation.x = 0
        if (armRRef.current) armRRef.current.rotation.x = 0
      }
    } else if (agent.state === 'working') {
      // Return toward base
      current.lerp(new THREE.Vector3(...agent.basePosition), delta * 1.5)
      g.position.set(current.x, current.y, current.z)
      // Idle bob
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.62 + Math.sin(t.current * 1.5) * 0.02
        bodyRef.current.rotation.x = 0
      }
      // Subtle head tilt while working
      if (headRef.current) headRef.current.rotation.z = Math.sin(t.current * 0.5) * 0.05
      if (armLRef.current) armLRef.current.rotation.x = 0
      if (armRRef.current) armRRef.current.rotation.x = 0
      // Face desk (backward)
      g.rotation.y = Math.PI
    } else if (agent.state === 'thinking') {
      current.lerp(new THREE.Vector3(...agent.basePosition), delta * 1.5)
      g.position.set(current.x, current.y, current.z)
      // Head tilts
      if (headRef.current) headRef.current.rotation.z = Math.sin(t.current * 2) * 0.12
      if (bodyRef.current) bodyRef.current.rotation.x = 0
      if (armLRef.current) armLRef.current.rotation.x = 0
      if (armRRef.current) armRRef.current.rotation.x = 0
      g.rotation.y = Math.PI
    }
  })

  return (
    <group ref={groupRef} position={agent.position}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color={agent.color} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.36, 0.08, 0.36]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 1.12, -0.175]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.08, 1.12, -0.175]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Left Arm */}
      <mesh ref={armLRef} castShadow position={[-0.27, 0.62, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={agent.color} roughness={0.7} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={armRRef} castShadow position={[0.27, 0.62, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={agent.color} roughness={0.7} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={legLRef} castShadow position={[-0.12, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={legRRef} castShadow position={[0.12, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </mesh>

      {/* Name tag */}
      <Html position={[0, 1.7, 0]} center distanceFactor={isMobile ? 12 : 8}>
        <div style={{
          background: 'rgba(10,10,20,0.85)',
          border: `1px solid ${agent.color}`,
          borderRadius: 4,
          padding: '2px 6px',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          fontSize: isMobile ? 9 : 11,
          color: agent.color,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: agent.state === 'coffee' ? '#F59E0B' : '#22c55e',
            display: 'inline-block',
            boxShadow: `0 0 4px ${agent.state === 'coffee' ? '#F59E0B' : '#22c55e'}`,
          }} />
          {agent.name}
        </div>
      </Html>
    </group>
  )
}
