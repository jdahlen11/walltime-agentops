import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { useSimStore } from '../hooks/useAgentSimulation'
import { useCollabFeed } from '../hooks/useCollabFeed'
import { AGENTS } from '../data/agentProfiles'
import { DEBATE_MESSAGES } from '../data/debateMessages'

interface Note { id: number; text: string; priority: 'P0' | 'P1' | 'P2' }
const INITIAL_NOTES: Note[] = [
  { id: 1, text: 'Close ESO integration by Apr 16', priority: 'P0' },
  { id: 2, text: 'Submit Cedars Accelerator app', priority: 'P0' },
  { id: 3, text: 'Close $500K SAFE round', priority: 'P1' },
  { id: 4, text: 'Achieve 95% RLS compliance', priority: 'P1' },
  { id: 5, text: 'Launch AB-40 content campaign', priority: 'P2' },
  { id: 6, text: 'Optimize dashboard p95 to <2s', priority: 'P2' },
]
const P_COLORS: Record<'P0'|'P1'|'P2', string> = { P0: '#ef4444', P1: '#eab308', P2: '#3b82f6' }
const TAG_COLORS: Record<string, string> = { PROPOSE: '#06b6d4', BUILD: '#22c55e', AGREE: '#22c55e', COUNTER: '#ef4444', QUESTION: '#eab308' }

function rgb(hex: string) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }

let nid = 200
let dmIdx = 0

export default function MeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const participants = useSimStore(s => s.meetingParticipants)
  const [speaking, setSpeaking] = useState(0)
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const [newNote, setNewNote] = useState('')
  const [newP, setNewP] = useState<'P0'|'P1'|'P2'>('P1')
  const [debate, setDebate] = useState(DEBATE_MESSAGES.slice(0, 3))
  const push = useCollabFeed(s => s.push)

  useEffect(() => {
    if (!open) return
    const speakId = setInterval(() => setSpeaking(s => (s + 1) % Math.max(1, participants.length)), 8000)
    const debateId = setInterval(() => {
      const msg = DEBATE_MESSAGES[dmIdx % DEBATE_MESSAGES.length]!
      setDebate(d => [msg, ...d].slice(0, 6))
      const agent = AGENTS.find(a => a.name === msg.agent)
      if (agent) push({ id: Date.now(), text: `[MEETING] ${msg.agent}: ${msg.text}`, color: agent.color, agentId: agent.id, ts: new Date() })
      dmIdx++
    }, 5000)
    return () => { clearInterval(speakId); clearInterval(debateId) }
  }, [open, participants.length, push])

  const speakingAgent = participants[speaking] ? AGENTS.find(a => a.id === participants[speaking]) : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,6,0.92)',
            display: 'flex', flexDirection: 'column', padding: '16px 20px',
            pointerEvents: 'auto', overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#fbbf24', letterSpacing: 4 }}>⚡ AGENT MEETING</div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
            {/* Left: grid + debate */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Avatar grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {participants.map((pid, i) => {
                  const ag = AGENTS.find(a => a.id === pid)
                  if (!ag) return null
                  const isSpeak = speaking === i
                  return (
                    <motion.div key={pid}
                      animate={isSpeak ? { boxShadow: [`0 0 0px ${ag.color}`, `0 0 20px ${ag.color}`, `0 0 0px ${ag.color}`] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        background: `rgba(${rgb(ag.color)},0.1)`,
                        border: `2px solid ${isSpeak ? ag.color : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 10, padding: '12px 8px', textAlign: 'center',
                        transition: 'border-color 0.3s',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{ag.emoji}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: ag.color }}>{ag.name}</div>
                      {isSpeak && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6, alignItems: 'flex-end', height: 14 }}>
                          {[1,2,3,4,5].map(j => (
                            <motion.div key={j} animate={{ height: [3, 12, 3] }} transition={{ duration: 0.4, delay: j * 0.08, repeat: Infinity }}
                              style={{ width: 3, background: ag.color, borderRadius: 1 }} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Debate transcript */}
              <div style={{ flex: 1, background: 'rgba(10,14,23,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', overflowY: 'auto', minHeight: 180 }}>
                <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 8 }}>R&D COUNCIL — LIVE DEBATE</div>
                {debate.map((m, i) => (
                  <div key={i} style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
                    <span style={{ color: TAG_COLORS[m.tag] ?? '#22c55e', fontFamily: 'monospace', fontSize: 8, padding: '1px 4px', border: `1px solid ${TAG_COLORS[m.tag] ?? '#22c55e'}44`, borderRadius: 3, whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: 1 }}>
                      {m.tag}
                    </span>
                    <div>
                      <span style={{ color: m.color, fontFamily: 'monospace', fontSize: 10, fontWeight: 700 }}>{m.agent}: </span>
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}>{m.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: whiteboard */}
            <div style={{ width: 270, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>WHITEBOARD</div>
              {/* Add note */}
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={newP} onChange={e => setNewP(e.target.value as 'P0'|'P1'|'P2')}
                  style={{ background: 'rgba(10,14,23,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 10, padding: '4px 6px' }}>
                  <option>P0</option><option>P1</option><option>P2</option>
                </select>
                <input value={newNote} onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newNote.trim()) { setNotes(n => [...n, { id: nid++, text: newNote.trim(), priority: newP }]); setNewNote('') } }}
                  placeholder="Add note…"
                  style={{ flex: 1, background: 'rgba(10,14,23,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 10, padding: '4px 8px', outline: 'none' }} />
                <button onClick={() => { if (newNote.trim()) { setNotes(n => [...n, { id: nid++, text: newNote.trim(), priority: newP }]); setNewNote('') } }}
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4, color: '#22c55e', cursor: 'pointer', padding: '4px 8px' }}>
                  <Plus size={12} />
                </button>
              </div>
              {(['P0','P1','P2'] as const).map(p => (
                <div key={p}>
                  <div style={{ color: P_COLORS[p], fontFamily: 'monospace', fontSize: 9, marginBottom: 3, letterSpacing: 1 }}>
                    {p} — {p === 'P0' ? 'CRITICAL' : p === 'P1' ? 'HIGH' : 'NORMAL'}
                  </div>
                  {notes.filter(n => n.priority === p).map(n => (
                    <div key={n.id} style={{ background: `rgba(${rgb(P_COLORS[p])},0.08)`, border: `1px solid rgba(${rgb(P_COLORS[p])},0.25)`, borderRadius: 4, padding: '4px 8px', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}>{n.text}</span>
                      <button onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))} style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer' }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
