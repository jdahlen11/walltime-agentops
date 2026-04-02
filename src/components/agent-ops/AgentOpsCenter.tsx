import { useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import Office from './scene/Office'
import AgentCharacter from './scene/AgentCharacter'
import HardwareNodes from './scene/HardwareNode'
import { useSimStore } from './hooks/useAgentSimulation'
import { useCollabFeed } from './hooks/useCollabFeed'
import { AGENTS } from './data/agentProfiles'
import TopBar from './hud/TopBar'
import AgentCardStrip from './hud/AgentCardStrip'
import HardwareTelemetry from './hud/HardwareTelemetry'
import ESOCountdown from './hud/ESOCountdown'
import PriorityRings from './hud/PriorityRings'
import CollabFeed from './hud/CollabFeed'
import AgentDetailPanel from './hud/AgentDetailPanel'
import MeetingModal from './hud/MeetingModal'
import MobileBottomSheet from './hud/MobileBottomSheet'

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    /Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768
  )
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

function SceneInner({ isMobile }: { isMobile: boolean }) {
  const tickAll = useSimStore(s => s.tickAll)
  useFrame((_, delta) => { tickAll(delta) })
  return (
    <>
      <Office />
      {AGENTS.map(a => <AgentCharacter key={a.id} agent={a} isMobile={isMobile} />)}
      <HardwareNodes />
    </>
  )
}

export default function AgentOpsCenter() {
  const isMobile = useIsMobile()
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const selectedAgent = useSimStore(s => s.selectedAgent)
  const startMeeting = useSimStore(s => s.startMeeting)
  const endMeeting = useSimStore(s => s.endMeeting)
  const push = useCollabFeed(s => s.push)

  useEffect(() => {
    const id = setInterval(push, 5000)
    return () => clearInterval(id)
  }, [push])

  function handleMeetingOpen() {
    setMeetingOpen(true)
    startMeeting()
  }

  function handleMeetingClose() {
    setMeetingOpen(false)
    endMeeting()
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0e17' }}>
      {/* 3D Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          shadows
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{ antialias: !isMobile }}
        >
          <PerspectiveCamera makeDefault position={[0, 14, 16]} fov={50} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={35}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1, 0]}
          />

          {/* Lighting */}
          <ambientLight intensity={0.15} color="#b0c4de" />
          <directionalLight
            position={[0, 8, 2]}
            intensity={0.65}
            color="#fff5e6"
            castShadow
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
            shadow-bias={-0.0001}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <directionalLight position={[8, 4, 0]} intensity={0.3} color="#e6f0ff" />

          {/* Per-desk colored lights */}
          {AGENTS.map(a => (
            <pointLight
              key={a.id}
              position={[a.deskPos[0], 1.5, a.deskPos[2]]}
              intensity={0.4}
              color={a.color}
              distance={3}
              decay={2}
            />
          ))}

          <SceneInner isMobile={isMobile} />

          {/* Post-processing */}
          {!isMobile && (
            <EffectComposer>
              <N8AO aoRadius={0.5} intensity={2} distanceFalloff={0.2} />
              <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.3} intensity={0.4} mipmapBlur />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {/* HUD */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        <TopBar onMeetingClick={handleMeetingOpen} />

        {!isMobile && (
          <>
            <AgentCardStrip />
            <ESOCountdown />
            <HardwareTelemetry />
            <PriorityRings />
            <CollabFeed />
          </>
        )}

        {!isMobile && selectedAgent && (
          <AgentDetailPanel agentId={selectedAgent} />
        )}

        {isMobile && (
          <MobileBottomSheet
            open={sheetOpen}
            setOpen={setSheetOpen}
            selectedAgent={selectedAgent}
          />
        )}
      </div>

      <MeetingModal open={meetingOpen} onClose={handleMeetingClose} />
    </div>
  )
}
