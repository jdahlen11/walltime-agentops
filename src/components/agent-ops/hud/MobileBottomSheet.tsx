import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimStore } from '../hooks/useAgentSimulation'
import { useCollabFeed } from '../hooks/useCollabFeed'
import { useHardwareTelemetry } from '../hooks/useHardwareTelemetry'
import { AGENTS } from '../data/agentProfiles'
import { WORK_STATES } from '../data/workSimulation'
import { format } from 'date-fns'

type Tab = 'agents' | 'monitor' | 'feed'

export default function MobileBottomSheet({ open, setOpen, selectedAgent }: { open: boolean; setOpen: (v: boolean) => void; selectedAgent: string | null }) {
  const [tab, setTab] = useState<Tab>('agents')
  const states = useSimStore(s => s.agentStates)
  const messages = useCollabFeed(s => s.messages)
  const { rtx, mac } = useHardwareTelemetry()
  const [touchStartY, setTouchStartY] = useState(0)

  return (
    <>
      {/* Minimal bar */}
      {!open && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 16, left: 12, right: 12,
            background: 'rgba(10,14,23,0.92)', border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 12, padding: '10px 16px', pointerEvents: 'auto',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#22c55e' }}>6 active</span>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>P90: 27m</span>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3b82f6' }}>14d to ESO</span>
          <span style={{ color: '#334155', fontSize: 10 }}>↑</span>
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onTouchStart={e => setTouchStartY(e.touches[0]!.clientY)}
            onTouchEnd={e => { if (e.changedTouches[0]!.clientY - touchStartY > 50) setOpen(false) }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'rgba(8,10,18,0.97)', borderTop: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px 14px 0 0', maxHeight: '80vh', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', pointerEvents: 'auto', zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', cursor: 'pointer' }} onClick={() => setOpen(false)}>
              <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2 }} />
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 16px' }}>
              {(['agents','monitor','feed'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: '10px 0', background: 'none', border: 'none',
                  fontFamily: 'monospace', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
                  color: tab === t ? '#fbbf24' : '#334155',
                  borderBottom: tab === t ? '2px solid #fbbf24' : '2px solid transparent',
                  cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {tab === 'agents' && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {AGENTS.map(a => {
                    const sim = states[a.id]
                    const work = WORK_STATES.find(w => w.agentId === a.id)
                    return (
                      <div key={a.id} style={{
                        background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${a.color}`,
                        borderRadius: 6, padding: '8px 12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{a.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: a.color, fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                            <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 10 }}>{work?.currentTask.title ?? '—'}</div>
                          </div>
                          <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 10 }}>{sim?.state ?? '—'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {tab === 'monitor' && (
                <div style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                  <div style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>RTX 5090</div>
                  {([['Tok/s', rtx.tokPerSec.toFixed(2)], ['GPU', `${rtx.gpuUtil.toFixed(0)}%`], ['VRAM', `${rtx.vram.toFixed(0)}%`], ['Temp', `${rtx.tempC.toFixed(0)}°C`]] as string[][]).map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>{l}</span>
                      <span style={{ color: '#e2e8f0', fontSize: 12 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ color: '#06b6d4', fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: '12px 0 8px' }}>Mac Mini M4</div>
                  {([['CPU', `${mac.cpu.toFixed(0)}%`], ['Memory', `${mac.mem.toFixed(0)}%`], ['Crons', String(mac.crons)], ['Status', '● Online']] as string[][]).map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>{l}</span>
                      <span style={{ color: l === 'Status' ? '#22c55e' : '#e2e8f0', fontSize: 12 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'feed' && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {messages.map(m => (
                    <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${m.color}`, borderRadius: 4, padding: '6px 10px' }}>
                      <div style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11 }}>{m.text}</div>
                      <div style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: 9, marginTop: 2 }}>{format(m.ts, 'HH:mm:ss')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
