import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useSimStore } from '../hooks/useAgentSimulation'
import { useCollabFeed } from '../hooks/useCollabFeed'
import { useHardwareTelemetry } from '../hooks/useHardwareTelemetry'
import { useTypingEffect } from '../hooks/useTypingEffect'
import { AGENTS } from '../data/agentProfiles'
import { WORK_STATES } from '../data/workSimulation'
import { format } from 'date-fns'

type Tab = 'agents' | 'monitor' | 'feed'

function rgb(hex: string) {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '3px 7px', fontFamily: 'monospace' }}>
      <div style={{ color: '#334155', fontSize: 7 }}>{label}</div>
      <div style={{ color: '#94a3b8', fontSize: 9 }}>{value}</div>
    </div>
  )
}

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
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>Tap agent to inspect</span>
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
              {(['agents', 'monitor', 'feed'] as Tab[]).map(t => (
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

// ─── MobileAgentSheet ────────────────────────────────────────────────────────

interface MobileAgentSheetProps {
  agentId: string | null
  onClose: () => void
}

function MobileAgentSheetContent({ agentId }: { agentId: string }) {
  const setSelected = useSimStore(s => s.setSelected)
  const simState = useSimStore(s => s.agentStates[agentId])
  const agent = AGENTS.find(a => a.id === agentId)
  const work = WORK_STATES.find(w => w.agentId === agentId)
  const { displayed, isTyping } = useTypingEffect(work?.liveDraft.fullContent ?? '', 18)

  if (!agent || !work || !simState) return null

  const STATUS_COLOR: Record<string, string> = {
    researching: '#06b6d4', drafting: '#22c55e', reviewing: '#f97316', delivering: '#8b5cf6',
  }
  const statusColor = STATUS_COLOR[work.currentTask.status] ?? '#22c55e'

  return (
    <>
      {/* Sticky header */}
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid rgba(${rgb(agent.color)},0.2)`,
        position: 'sticky', top: 0, background: 'rgba(8,10,18,0.99)', zIndex: 1,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{agent.emoji}</span>
            <div>
              <div style={{ color: agent.color, fontFamily: 'monospace', fontSize: 15, fontWeight: 700 }}>{agent.name}</div>
              <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 10 }}>{agent.role} Agent</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: `rgba(${rgb(statusColor)},0.15)`,
              color: statusColor,
              borderRadius: 12, padding: '2px 8px', fontSize: 9, fontFamily: 'monospace',
              border: `1px solid rgba(${rgb(statusColor)},0.4)`,
            }}>
              ● {work.currentTask.status.toUpperCase()}
            </span>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
              color: '#475569', cursor: 'pointer', padding: '4px 6px', pointerEvents: 'auto',
            }}>
              <X size={13} />
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <StatChip label="Model" value={agent.model} />
          <StatChip label="Tokens" value={`${((simState.tokens) / 1000).toFixed(0)}K`} />
          <StatChip label="State" value={simState.state} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Current task */}
        <MobileSection title="CURRENTLY WORKING ON" color={agent.color}>
          <div style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            {work.currentTask.title}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${work.currentTask.progress}%`, height: '100%', background: agent.color, boxShadow: `0 0 4px ${agent.color}`, transition: 'width 0.8s', borderRadius: 2 }} />
          </div>
          <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 9 }}>
            {work.currentTask.progress}% complete
          </div>
        </MobileSection>

        {/* Live draft */}
        <MobileSection title="LIVE DRAFT" color={agent.color}>
          <div style={{ fontFamily: 'monospace', color: agent.color, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
            {work.liveDraft.title}
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '8px 10px', fontFamily: 'monospace', fontSize: 9.5,
            color: '#94a3b8', lineHeight: 1.55, maxHeight: 160, overflowY: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {displayed}
            {isTyping && <span style={{ animation: 'blink 1s infinite', borderRight: `2px solid ${agent.color}`, marginLeft: 1 }}>&nbsp;</span>}
          </div>
        </MobileSection>

        {/* Workflow */}
        <MobileSection title="WORKFLOW" color={agent.color}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {work.workflow.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: 9,
                  color: step.status === 'active' ? agent.color : step.status === 'complete' ? '#22c55e' : '#334155',
                }}>
                  {step.agent} <span style={{ color: '#475569' }}>{step.action}</span>
                </span>
                {i < work.workflow.steps.length - 1 && <ArrowRight size={10} color="#334155" />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <StatChip label="Platform" value={work.workflow.destination.platform} />
            <StatChip label="Channel" value={work.workflow.destination.channel} />
          </div>
        </MobileSection>

        {/* Recent output */}
        <MobileSection title="RECENT OUTPUT" color={agent.color}>
          {work.recentOutput.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'flex-start' }}>
              <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10, flex: 1 }}>
                ▸ {item.title}
                <div style={{ color: '#334155', fontSize: 8, marginTop: 1 }}>{item.destination}</div>
              </div>
              <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 9, whiteSpace: 'nowrap', marginLeft: 8 }}>{item.timestamp}</div>
            </div>
          ))}
        </MobileSection>

        {/* Queue */}
        <MobileSection title="QUEUE" color={agent.color}>
          {work.queue.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 10 }}>◦ {item.title}</span>
              <span style={{ color: '#334155', fontFamily: 'monospace', fontSize: 9 }}>{item.schedule}</span>
            </div>
          ))}
        </MobileSection>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </>
  )
}

function MobileSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 8, borderBottom: `1px solid rgba(${rgb(color)},0.15)`, paddingBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function MobileAgentSheet({ agentId, onClose }: MobileAgentSheetProps) {
  const [touchStartY, setTouchStartY] = useState(0)

  return (
    <AnimatePresence>
      {agentId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 60, pointerEvents: 'auto',
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onTouchStart={e => setTouchStartY(e.touches[0]!.clientY)}
            onTouchEnd={e => { if (e.changedTouches[0]!.clientY - touchStartY > 60) onClose() }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'rgba(8,10,18,0.98)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px 16px 0 0',
              maxHeight: '88vh', overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
              pointerEvents: 'auto', zIndex: 70,
              backdropFilter: 'blur(20px)',
            }}
          >
            <MobileAgentSheetContent agentId={agentId} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
