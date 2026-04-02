import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { useAgentStore } from '../store/agentStore'
import { useFeedStore } from '../store/feedStore'

interface StickyNote {
  id: number
  text: string
  priority: 'P0' | 'P1' | 'P2'
}

const INITIAL_NOTES: StickyNote[] = [
  { id: 1, text: 'Close ESO integration by Apr 16', priority: 'P0' },
  { id: 2, text: 'Submit Cedars Accelerator app', priority: 'P0' },
  { id: 3, text: 'Close $500K SAFE round', priority: 'P1' },
  { id: 4, text: 'Achieve 95% RLS compliance', priority: 'P1' },
  { id: 5, text: 'Launch AB-40 content campaign', priority: 'P2' },
  { id: 6, text: 'Reduce dashboard p95 to <2s', priority: 'P2' },
]

const P_COLORS: Record<string, string> = {
  P0: '#ef4444', P1: '#eab308', P2: '#3b82f6',
}

interface AgentMeetingProps {
  open: boolean
  onClose: () => void
}

export default function AgentMeeting({ open, onClose }: AgentMeetingProps) {
  const agents = useAgentStore(s => s.agents)
  const messages = useFeedStore(s => s.messages)
  const [speaking, setSpeaking] = useState(0)
  const [notes, setNotes] = useState<StickyNote[]>(INITIAL_NOTES)
  const [newNote, setNewNote] = useState('')
  const [newPriority, setNewPriority] = useState<'P0'|'P1'|'P2'>('P1')
  let noteId = useRef(100)

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => {
      setSpeaking(s => (s + 1) % 6)
    }, 3000)
    return () => clearInterval(id)
  }, [open])

  function addNote() {
    if (!newNote.trim()) return
    setNotes(n => [...n, { id: noteId.current++, text: newNote.trim(), priority: newPriority }])
    setNewNote('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            padding: 24,
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 18, color: '#fbbf24', letterSpacing: 3 }}>
              AGENT MEETING
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8',
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
            {/* Left: agent grid + transcript */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {/* Agent avatars 3x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {agents.map((a, i) => (
                  <motion.div
                    key={a.id}
                    animate={speaking === i ? {
                      boxShadow: [`0 0 0px ${a.color}`, `0 0 20px ${a.color}`, `0 0 0px ${a.color}`],
                    } : { boxShadow: 'none' }}
                    transition={{ duration: 0.8, repeat: speaking === i ? Infinity : 0 }}
                    style={{
                      background: `rgba(${hexToRgb(a.color)},0.15)`,
                      border: `2px solid ${speaking === i ? a.color : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'border-color 0.3s',
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{a.emoji}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: a.color }}>{a.name}</div>
                    {speaking === i && (
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                        {[1, 2, 3, 4, 5].map(j => (
                          <motion.div
                            key={j}
                            animate={{ height: [4, 14, 4] }}
                            transition={{ duration: 0.5, delay: j * 0.1, repeat: Infinity }}
                            style={{ width: 3, background: a.color, borderRadius: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Transcript */}
              <div style={{
                flex: 1, background: 'rgba(10,10,20,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: 12, overflowY: 'auto',
              }}>
                <div style={{ color: '#475569', fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>TRANSCRIPT</div>
                {messages.slice(0, 6).map(m => (
                  <div key={m.id} style={{ marginBottom: 8 }}>
                    <span style={{ color: m.color, fontFamily: 'monospace', fontSize: 11 }}>{m.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: whiteboard */}
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 }}>WHITEBOARD</div>

              {/* Add note */}
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as 'P0'|'P1'|'P2')}
                  style={{
                    background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 4, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 11, padding: '4px 6px',
                  }}
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
                <input
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  placeholder="Add note…"
                  style={{
                    flex: 1, background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 4, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 11,
                    padding: '4px 8px', outline: 'none',
                  }}
                />
                <button onClick={addNote} style={{
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 4, color: '#22c55e', cursor: 'pointer', padding: '4px 8px',
                }}>
                  <Plus size={14} />
                </button>
              </div>

              {/* Notes by priority */}
              {(['P0', 'P1', 'P2'] as const).map(p => (
                <div key={p}>
                  <div style={{ color: P_COLORS[p], fontFamily: 'monospace', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>
                    {p} — {p === 'P0' ? 'CRITICAL' : p === 'P1' ? 'HIGH' : 'NORMAL'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {notes.filter(n => n.priority === p).map(n => (
                      <div key={n.id} style={{
                        background: `rgba(${hexToRgb(P_COLORS[p])},0.1)`,
                        border: `1px solid rgba(${hexToRgb(P_COLORS[p])},0.3)`,
                        borderRadius: 4, padding: '5px 8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11, flex: 1 }}>{n.text}</span>
                        <button
                          onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))}
                          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0 0 0 6px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
