import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AnimatePresence } from 'framer-motion';
import { Scene } from './scene/Scene';
import { TopBar } from './hud/TopBar';
import { AgentCards } from './hud/AgentCards';
import { APOTMonitor } from './hud/APOTMonitor';
import { ESOCountdown } from './hud/ESOCountdown';
import { HardwareTelemetry } from './hud/HardwareTelemetry';
import { MissionPriorities } from './hud/MissionPriorities';
import { CollabFeed } from './hud/CollabFeed';
import { AgentMeeting } from './hud/AgentMeeting';

function CanvasScene({ isMobile }: { isMobile: boolean }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 18, 20], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0A0E17' }}
    >
      <Suspense fallback={null}>
        <Scene />
        {!isMobile && (
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.75}
              luminanceSmoothing={0.05}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}

export default function App() {
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0A0E17', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <CanvasScene isMobile={isMobile} />
      </div>

      {/* HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          gap: '8px',
        }}
      >
        {/* Top Bar */}
        <div style={{ pointerEvents: 'auto' }}>
          <TopBar onMeetingOpen={() => setMeetingOpen(true)} />
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, display: 'flex', gap: '8px', minHeight: 0 }}>
          {/* Left Panel - Agent Cards */}
          {!isMobile && (
            <div
              style={{
                width: isTablet ? '200px' : '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                pointerEvents: 'auto',
              }}
            >
              <AgentCards />
            </div>
          )}

          {/* Center spacer */}
          <div style={{ flex: 1 }} />

          {/* Right Panel */}
          {!isMobile && (
            <div
              style={{
                width: isTablet ? '240px' : '280px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                pointerEvents: 'auto',
              }}
            >
              <ESOCountdown />
              <APOTMonitor />
              <HardwareTelemetry />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {!isMobile && (
            <div
              style={{
                flex: 1,
                pointerEvents: 'auto',
                background: 'rgba(10, 14, 23, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                Mission Priorities
              </div>
              <MissionPriorities />
            </div>
          )}
          <div style={{ width: isTablet ? '240px' : '380px', pointerEvents: 'auto' }}>
            <CollabFeed />
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      <AnimatePresence>
        {meetingOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'auto' }}>
            <AgentMeeting onClose={() => setMeetingOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
