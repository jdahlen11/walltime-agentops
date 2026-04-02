import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Scene from './scene/Scene'
import TopBar from './hud/TopBar'
import AgentCards from './hud/AgentCards'
import ESOCountdown from './hud/ESOCountdown'
import HardwareTelemetry from './hud/HardwareTelemetry'
import MissionPriorities from './hud/MissionPriorities'
import CollabFeed from './hud/CollabFeed'
import AgentMeeting from './hud/AgentMeeting'
import APOTMonitor from './hud/APOTMonitor'
import { useFeedStore } from './store/feedStore'
import { useAgentStore } from './store/agentStore'
import { format } from 'date-fns'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

type BottomTab = 'agents' | 'monitor' | 'feed'

export default function App() {
  const isMobile = useIsMobile()
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<BottomTab>('agents')
  const messages = useFeedStore(s => s.messages)
  const agents = useAgentStore(s => s.agents)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Swipe up to open sheet
  const touchStartY = useRef(0)
  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0]!.clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dy = touchStartY.current - e.changedTouches[0]!.clientY
    if (dy > 40) setSheetOpen(true)
    if (dy < -40) setSheetOpen(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a14' }}>
      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene isMobile={isMobile} />
      </div>

      {/* HUD Overlay */}
      <div className="hud-overlay" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <TopBar onMeetingClick={() => setMeetingOpen(true)} />

        {/* Desktop panels */}
        {!isMobile && (
          <>
            <AgentCards />
            <ESOCountdown />
            <HardwareTelemetry />
            <MissionPriorities />
            <CollabFeed />
          </>
        )}

        {/* Mobile: minimal bottom bar */}
        {isMobile && !sheetOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              position: 'absolute',
              bottom: 20,
              left: 16, right: 16,
              background: 'rgba(10,10,20,0.9)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 12,
              padding: '10px 16px',
              pointerEvents: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onClick={() => setSheetOpen(true)}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#22c55e' }}>
              6 active
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
              P90: 27m
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3B82F6' }}>
              14d to ESO
            </span>
            <span style={{ color: '#475569', fontSize: 10 }}>↑ swipe</span>
          </motion.div>
        )}

        {/* Mobile: bottom sheet */}
        <AnimatePresence>
          {isMobile && sheetOpen && (
            <motion.div
              className="bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ pointerEvents: 'auto' }}
            >
              {/* Sheet handle */}
              <div
                style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0', cursor: 'pointer' }}
                onClick={() => setSheetOpen(false)}
              >
                <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 16px' }}>
                {(['agents', 'monitor', 'feed'] as BottomTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px 0',
                      background: 'none', border: 'none',
                      fontFamily: 'monospace', fontSize: 12,
                      color: activeTab === tab ? '#fbbf24' : '#475569',
                      borderBottom: activeTab === tab ? '2px solid #fbbf24' : '2px solid transparent',
                      cursor: 'pointer', letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                {activeTab === 'agents' && <MobileAgentList />}
                {activeTab === 'monitor' && <APOTMonitor />}
                {activeTab === 'feed' && <MobileFeed />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meeting modal */}
      <AgentMeeting open={meetingOpen} onClose={() => setMeetingOpen(false)} />
    </div>
  )
}

function MobileAgentList() {
  const agents = useAgentStore(s => s.agents)
  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {agents.map(a => (
        <div key={a.id} style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid rgba(${hexToRgb(a.color)},0.3)`,
          borderLeft: `3px solid ${a.color}`,
          borderRadius: 6, padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>{a.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: a.color, fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{a.name}</div>
            <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 10 }}>{a.lastAction}</div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#475569' }}>{a.state}</div>
        </div>
      ))}
    </div>
  )
}

function MobileFeed() {
  const messages = useFeedStore(s => s.messages)
  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {messages.map(m => (
        <div key={m.id} style={{
          background: 'rgba(255,255,255,0.04)',
          borderLeft: `2px solid ${m.color}`,
          borderRadius: 4, padding: '6px 10px',
        }}>
          <div style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: 12 }}>{m.text}</div>
          <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}>
            {format(m.timestamp, 'HH:mm:ss')}
          </div>
        </div>
      ))}
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
