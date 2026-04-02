import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader } from 'lucide-react'
import type { AgentId } from '../../lib/types'
import { useDispatch } from '../../hooks/useDispatch'
import { AGENTS } from '../../config/agents'

interface DispatchModalProps {
  agentId: AgentId
  onClose: () => void
  presetTask?: string
  title?: string
}

export default function DispatchModal({ agentId, onClose, presetTask = '', title }: DispatchModalProps) {
  const [task, setTask] = useState(presetTask)
  const [sent, setSent] = useState(false)
  const { dispatch, sending, lastError, configured } = useDispatch()
  const agent = AGENTS.find((a) => a.id === agentId)!

  const handleSend = async () => {
    if (!task.trim()) return
    const ok = await dispatch(agentId, task.trim())
    if (ok) setSent(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 8 }}
          style={{
            background: '#111827',
            border: `1px solid ${agent.color}40`,
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 480,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{agent.emoji}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
                  {title ?? `Dispatch to ${agent.name}`}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{agent.role}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {!configured && (
            <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: 13, color: '#EF4444', marginBottom: 14 }}>
              Telegram not configured — add VITE_TELEGRAM_BOT_TOKEN to .env.local
            </div>
          )}

          {sent ? (
            <div style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14, color: '#10B981', fontWeight: 600 }}>Dispatched to {agent.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Check the feed for results</div>
              <button onClick={onClose} style={{ marginTop: 12, padding: '6px 16px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 6, color: '#10B981', cursor: 'pointer', fontSize: 13 }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder={`Describe the task for ${agent.name}...`}
                rows={5}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 12,
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSend() }}
              />
              {lastError && (
                <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{lastError}</div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !task.trim() || !configured}
                  style={{
                    padding: '8px 18px',
                    background: sending ? 'rgba(59,130,246,0.3)' : agent.color,
                    border: 'none',
                    borderRadius: 6,
                    color: 'white',
                    cursor: sending || !task.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: !configured ? 0.5 : 1,
                  }}
                >
                  {sending ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                  {sending ? 'Sending...' : 'Dispatch'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
