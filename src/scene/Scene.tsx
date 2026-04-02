import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Office from './Office'
import AgentDesk from './AgentDesk'
import AgentCharacter from './AgentCharacter'
import Hardware from './Hardware'
import { useAgentStore } from '../store/agentStore'
import { useFrame } from '@react-three/fiber'

const DESK_POSITIONS: [number, number, number][] = [
  [-5, 0, -3], [0, 0, -3], [5, 0, -3],
  [-5, 0, 3],  [0, 0, 3],  [5, 0, 3],
]

function AgentSystem({ isMobile }: { isMobile: boolean }) {
  const agents = useAgentStore(s => s.agents)
  const tickAgents = useAgentStore(s => s.tickAgents)

  useFrame((_, delta) => {
    tickAgents(delta)
  })

  return (
    <>
      {agents.map((agent, i) => (
        <group key={agent.id}>
          <AgentDesk
            position={DESK_POSITIONS[i]}
            color={agent.color}
            active={agent.state === 'working'}
          />
          <AgentCharacter agent={agent} isMobile={isMobile} />
        </group>
      ))}
    </>
  )
}

interface SceneProps {
  isMobile: boolean
}

export default function Scene({ isMobile }: SceneProps) {
  return (
    <Canvas shadows gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 14, 14]} fov={50} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        // touch controls use defaults (pinch=zoom, two-finger=rotate)
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[-5, 8, 5]} intensity={0.3} color="#ffeedd" />

      {/* Scene content */}
      <Office />
      <AgentSystem isMobile={isMobile} />
      <Hardware />

      {/* Post-processing — disabled on mobile */}
      {!isMobile && (
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
