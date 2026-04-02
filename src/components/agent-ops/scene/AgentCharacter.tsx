import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Agent } from '../types'
import { useSimStore } from '../hooks/useAgentSimulation'
import { useWaypointNavigation } from '../hooks/useWaypointNavigation'

interface Props {
  agent: Agent
  isMobile: boolean
}

const _v3a = new THREE.Vector3()
const _v3b = new THREE.Vector3()

export default function AgentCharacter({ agent, isMobile }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)

  const simState = useSimStore(s => s.agentStates[agent.id])
  const advanceWaypoint = useSimStore(s => s.advanceWaypoint)
  const updatePosition = useSimStore(s => s.updatePosition)
  const isSelected = useSimStore(s => s.selectedAgent === agent.id)
  const isHovered = useSimStore(s => s.hoveredAgent === agent.id)
  const setSelected = useSimStore(s => s.setSelected)
  const setHovered = useSimStore(s => s.setHovered)

  const { moveToward } = useWaypointNavigation()

  const t = useRef(0)
  const lastIdleFidget = useRef(0)
  const idlePhase = useRef(0)
  const posRef = useRef<[number, number, number]>([...agent.deskPos] as [number, number, number])
  const angleRef = useRef(Math.PI)

  const skinColor = '#d4a574'
  const hairColor = '#2a1a08'

  useFrame((state, delta) => {
    if (!groupRef.current || !simState) return
    t.current = state.clock.elapsedTime

    const { state: agentState, targetPosition, waypointPath } = simState

    // --- MOVEMENT ---
    if (agentState === 'walking' || (agentState === 'coffee' && waypointPath.length > 0)) {
      const { newPos, newAngle, arrived } = moveToward(
        posRef.current, targetPosition, angleRef.current, delta, 2.5
      )
      posRef.current = newPos
      angleRef.current = newAngle
      groupRef.current.position.set(...newPos)
      groupRef.current.rotation.y = newAngle

      if (arrived) {
        advanceWaypoint(agent.id)
      }
    } else {
      _v3a.set(...posRef.current)
      _v3b.set(...targetPosition)
      if (_v3a.distanceTo(_v3b) > 0.05) {
        _v3a.lerp(_v3b, delta * 3)
        posRef.current = [_v3a.x, _v3a.y, _v3a.z]
      }
      groupRef.current.position.set(...posRef.current)

      let targetAngle = angleRef.current
      if (agentState === 'working' || agentState === 'thinking') {
        targetAngle = Math.PI
      } else if (agentState === 'coffee') {
        targetAngle = 0
      } else if (agentState === 'meeting') {
        targetAngle = Math.PI + 0.3
      }
      let diff = targetAngle - angleRef.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      angleRef.current += diff * Math.min(1, delta * 5)
      groupRef.current.rotation.y = angleRef.current
    }

    updatePosition(agent.id, posRef.current, angleRef.current)

    // --- POSE ANIMATIONS ---
    if (!bodyRef.current || !headRef.current || !leftArmRef.current || !rightArmRef.current || !leftLegRef.current || !rightLegRef.current) return

    const body = bodyRef.current
    const head = headRef.current
    const la = leftArmRef.current
    const ra = rightArmRef.current
    const ll = leftLegRef.current
    const rl = rightLegRef.current

    body.rotation.set(0, 0, 0)
    head.rotation.set(0, 0, 0)

    if (agentState === 'working') {
      body.position.y = 0.3 + Math.sin(t.current * 1.8) * 0.004
      body.rotation.x = 0.05
      la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, -1.2, delta * 3)
      ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, -1.2 + Math.sin(t.current * 6) * 0.08, delta * 3)
      la.rotation.z = THREE.MathUtils.lerp(la.rotation.z, 0.2, delta * 3)
      ra.rotation.z = THREE.MathUtils.lerp(ra.rotation.z, -0.2, delta * 3)
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, -Math.PI / 2.2, delta * 4)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, -Math.PI / 2.2, delta * 4)
      const lookCycle = Math.sin(t.current * 0.15) * 0.25
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, lookCycle, delta * 0.8)
      head.rotation.x = 0.08

    } else if (agentState === 'thinking') {
      body.position.y = 0.3
      body.rotation.x = -0.08
      la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, -0.7, delta * 3)
      la.rotation.z = THREE.MathUtils.lerp(la.rotation.z, 0.4, delta * 3)
      ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, -1.0, delta * 3)
      ra.rotation.z = THREE.MathUtils.lerp(ra.rotation.z, -0.1, delta * 3)
      head.rotation.z = Math.sin(t.current * 0.4) * 0.14
      head.rotation.y = Math.sin(t.current * 0.2) * 0.2
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, -Math.PI / 2.2, delta * 4)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, -Math.PI / 2.2, delta * 4)

    } else if (agentState === 'walking') {
      body.position.y = 0.3 + Math.abs(Math.sin(t.current * 9)) * 0.03
      body.rotation.x = 0.1
      const stride = Math.sin(t.current * 8) * 0.7
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, stride, delta * 12)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, -stride, delta * 12)
      la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, -stride * 0.5, delta * 12)
      ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, stride * 0.5, delta * 12)
      la.rotation.z = THREE.MathUtils.lerp(la.rotation.z, 0.1, delta * 5)
      ra.rotation.z = THREE.MathUtils.lerp(ra.rotation.z, -0.1, delta * 5)
      head.rotation.x = -0.05

    } else if (agentState === 'coffee') {
      body.position.y = 0.3
      ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, -0.9 + Math.sin(t.current * 1.5) * 0.15, delta * 3)
      ra.rotation.z = THREE.MathUtils.lerp(ra.rotation.z, -0.3, delta * 3)
      la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, -0.3, delta * 3)
      la.rotation.z = THREE.MathUtils.lerp(la.rotation.z, 0.1, delta * 3)
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, 0, delta * 4)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, 0, delta * 4)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0.3, delta * 2)

    } else if (agentState === 'meeting') {
      body.position.y = 0.3
      body.rotation.x = 0.04
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, -Math.PI / 2.2, delta * 4)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, -Math.PI / 2.2, delta * 4)
      if (Math.sin(t.current * 0.3) > 0.5) {
        ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, -0.6 + Math.sin(t.current * 2) * 0.2, delta * 3)
        head.rotation.x = Math.sin(t.current * 1.5) * 0.08
      } else {
        ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, -1.0, delta * 2)
        head.rotation.x = Math.sin(t.current * 0.7) * 0.06
      }
      la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, -0.8, delta * 2)

    } else if (agentState === 'idle') {
      body.position.y = 0.3
      lastIdleFidget.current += delta
      if (lastIdleFidget.current > 8) {
        idlePhase.current += delta
        if (idlePhase.current < 1.5) {
          la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, 1.2, delta * 2)
          ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, 1.2, delta * 2)
        } else {
          la.rotation.x = THREE.MathUtils.lerp(la.rotation.x, 0, delta * 2)
          ra.rotation.x = THREE.MathUtils.lerp(ra.rotation.x, 0, delta * 2)
          if (idlePhase.current > 3) { idlePhase.current = 0; lastIdleFidget.current = 0 }
        }
      }
      head.rotation.y = Math.sin(t.current * 0.3) * 0.3
      ll.rotation.x = THREE.MathUtils.lerp(ll.rotation.x, 0, delta * 3)
      rl.rotation.x = THREE.MathUtils.lerp(rl.rotation.x, 0, delta * 3)
    }
  })

  return (
    <group
      ref={groupRef}
      position={agent.deskPos}
    >
      {/* Invisible touch/click hitbox */}
      <mesh
        visible={false}
        onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : agent.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(agent.id); if (!isMobile) document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(null); if (!isMobile) document.body.style.cursor = 'auto' }}
      >
        <boxGeometry args={[1.2, 2.5, 1.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Body group */}
      <group ref={bodyRef} position={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color={agent.color} roughness={0.6} />
        </mesh>
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 0.95, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.42, 0.1, 0.42]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.09, 0.04, -0.21]}>
          <boxGeometry args={[0.07, 0.07, 0.01]} />
          <meshStandardMaterial color="#1a0a00" />
        </mesh>
        <mesh position={[0.09, 0.04, -0.21]}>
          <boxGeometry args={[0.07, 0.07, 0.01]} />
          <meshStandardMaterial color="#1a0a00" />
        </mesh>
      </group>

      {/* Left arm (pivot at shoulder) */}
      <group ref={leftArmRef} position={[-0.33, 0.82, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color={agent.color} roughness={0.6} />
        </mesh>
      </group>

      {/* Right arm (pivot at shoulder) */}
      <group ref={rightArmRef} position={[0.33, 0.82, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color={agent.color} roughness={0.6} />
        </mesh>
      </group>

      {/* Left leg (pivot at hip) */}
      <group ref={leftLegRef} position={[-0.14, 0.1, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#1e2d4a" roughness={0.7} />
        </mesh>
      </group>

      {/* Right leg (pivot at hip) */}
      <group ref={rightLegRef} position={[0.14, 0.1, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#1e2d4a" roughness={0.7} />
        </mesh>
      </group>

      {/* Selection ring */}
      {(isHovered || isSelected) && (
        <SelectionRingMesh agent={agent} isSelected={isSelected} />
      )}

      {/* Billboard name tag */}
      {!isMobile && (
        <Billboard position={[0, 1.8, 0]}>
          <Text
            fontSize={0.16}
            color={agent.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {agent.name}
          </Text>
          <Text
            fontSize={0.09}
            color="#888888"
            anchorX="center"
            anchorY="top"
            position={[0, -0.05, 0]}
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {agent.role}
          </Text>
        </Billboard>
      )}
    </group>
  )
}

function SelectionRingMesh({ agent, isSelected }: { agent: Agent; isSelected: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = isSelected
      ? 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      : 0.25
  })
  return (
    <mesh ref={ref} position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.6, 32]} />
      <meshBasicMaterial color={agent.color} transparent opacity={0.25} />
    </mesh>
  )
}
