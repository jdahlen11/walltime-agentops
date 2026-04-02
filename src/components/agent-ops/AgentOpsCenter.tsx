import { useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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
import MobileBottomSheet, { MobileAgentSheet } from './hud/MobileBottomSheet'

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
          {/* Locked isometric-ish camera — front-right quadrant only */}
          <PerspectiveCamera makeDefault fov={30} position={[8, 8, 8]} near={0.1} far={100} />
          <OrbitControls
            target={[0, 0.5, 0]}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 3}
            minAzimuthAngle={0}
            maxAzimuthAngle={Math.PI / 2}
            minDistance={8}
            maxDistance={18}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.4}
          />

          {/* 7-light warm rig */}
          <ambientLight color="#2a1f15" intensity={0.2} />
          {/* @ts-ignore — drei hemisphereLight prop names */}
          <hemisphereLight args={['#1a1a2e', '#3d2b1f', 0.25]} />

          {/* Key light — cool, casts shadows */}
          <directionalLight
            color="#b0c4de"
            intensity={0.5}
            position={[6, 8, 4]}
            castShadow
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
            shadow-bias={-0.0005}
            shadow-camera-near={0.1}
            shadow-camera-far={30}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Warm fill from back-left */}
          <directionalLight color="#ffe4c4" intensity={0.2} position={[-4, 5, -3]} />

          {/* Ceiling practical — dim warm overhead */}
          <pointLight color="#fff0dc" intensity={0.6} distance={8} decay={2} position={[0, 2.5, 0]} />

          {/* Floor lamp supplement */}
          <pointLight color="#fde68a" intensity={0.4} distance={5} decay={2} position={[-4.5, 1.5, -4]} />

          <SceneInner isMobile={isMobile} />

          {/* Post-processing — desktop only */}
          {!isMobile && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur />
              <Vignette offset={0.3} darkness={0.5} />
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
        {isMobile && (
          <MobileAgentSheet
            agentId={selectedAgent}
            onClose={() => useSimStore.getState().setSelected(null)}
          />
        )}
      </div>

      <MeetingModal open={meetingOpen} onClose={handleMeetingClose} />
    </div>
  )
}
