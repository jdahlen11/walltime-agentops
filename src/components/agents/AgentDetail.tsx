import { useState } from 'react'
import { Send, Loader, X } from 'lucide-react'
import type { AgentView, AgentId } from '../../lib/types'
import { useDispatch } from '../../hooks/useDispatch'
import AgentOutput from './AgentOutput'
import DispatchModal from './DispatchModal'
import { TOPIC_NAMES } from '../../config/agents'

interface AgentDetailProps {
  agent: AgentView
  onClose?: () => void
}

type ActionType = 'dispatch' | 'linkedin' | 'email' | 'pr' | 'deploy' | null

// Cron schedule for countdown
const CRON_SCHEDULES: Record<string, { name: string; hour: number }[]> = {
  scout: [{ name: 'research', hour: 8 }, { name: 'competitors', hour: 9 }, { name: 'ai-tools-radar', hour: 14 }],
  engineer: [{ name: 'product-expansion', hour: 15 }],
  command: [{ name: 'ops-healthcheck', hour: 5 }, { name: 'morning-brief', hour: 6 }, { name: 'task-dispatch', hour: 8 }],
  capital: [{ name: 'vc-tracking', hour: 10 }],
  content: [{ name: 'content', hour: 11 }, { name: 'outreach-warmup', hour: 12 }],
  analyst: [{ name: 'emsa-compliance', hour: 7 }],
}

function getNextTaskCountdown(agentId: string): string | null {
  const schedule = CRON_SCHEDULES[agentId]
  if (!schedule) return null
  const now = new Date()
  const pstStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const pst = new Date(pstStr)
  const currentHour = pst.getHours()
  const currentMinute = pst.getMinutes()

  for (const task of schedule) {
    if (task.hour > currentHour) {
      const diffMin = (task.hour - currentHour) * 60 - currentMinute
      const h = Math.floor(diffMin / 60)
      const m = diffMin % 60
      return `${task.name} in ${h}h ${m}m`
    }
  }
  return `${schedule[0].name} tomorrow at ${schedule[0].hour}AM PST`
}

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [chatText, setChatText] = useState('')
  const [activeModal, setActiveModal] = useState<ActionType>(null)
  const cronLogs = agent.recentCrons
  const { dispatch, sending } = useDispatch()

  const sendChat = async () => {
    if (!chatText.trim()) return
    await dispatch(agent.id, chatText.trim())
    setChatText('')
  }

  const getModalProps = () => {
    switch (activeModal) {
      case 'linkedin':
        return { agentId: 'content' as AgentId, title: 'Draft LinkedIn Post', presetTask: 'Write a LinkedIn post about: ' }
      case 'email':
        return { agentId: 'content' as AgentId, title: 'Draft Email', presetTask: 'Draft an email to [recipient] about: ' }
      case 'pr':
        return { agentId: 'engineer' as AgentId, title: 'Create PR', presetTask: 'Create a PR for: ' }
      case 'deploy':
        return { agentId: 'engineer' as AgentId, title: 'Approve & Deploy', presetTask: 'Merge the latest PR and deploy to production for: ' }
      default:
        return { agentId: agent.id, title: undefined, presetTask: '' }
    }
  }

  const latestCron = cronLogs[0]
  const isActive = agent.status === 'active' || agent.status === 'processing'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: `linear-gradient(135deg, ${agent.color}12 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 40 }}>{agent.emoji}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{agent.name}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{agent.role}</div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  background: statusPillColor(agent.status),
                  borderRadius: 9999,
                  padding: '2px 10px',
                  letterSpacing: '0.06em',
                }}
              >
                {agent.status.toUpperCase()}
              </div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* Currently Working On card */}
        <Section title="Currently Working On">
          <div
            style={{
              padding: '12px 16px',
              background: '#141A22',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {isActive && latestCron ? (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  Running: {latestCron.job_name}
                </div>
                {latestCron.telegram_topic_id && (
                  <span
                    style={{
                      fontSize: 10,
                      background: agent.color + '20',
                      color: agent.color,
                      borderRadius: 4,
                      padding: '1px 6px',
                      marginTop: 4,
                      display: 'inline-block',
                    }}
                  >
                    {TOPIC_NAMES[latestCron.telegram_topic_id] ?? `Topic ${latestCron.telegram_topic_id}`}
                  </span>
                )}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                  Started {formatTimeSince(latestCron.executed_at)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Standing by</div>
                {(() => {
                  const next = getNextTaskCountdown(agent.id)
                  return next ? (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                      Next: {next}
                    </div>
                  ) : null
                })()}
              </>
            )}
          </div>
        </Section>

        {/* Actions row */}
        <Section title="Actions">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <ActionButton label="Dispatch Task" color={agent.color} filled onClick={() => setActiveModal('dispatch')} />
            <ActionButton label="Draft LinkedIn Post" color={agent.color} onClick={() => setActiveModal('linkedin')} />
            <ActionButton label="Draft Email" color={agent.color} onClick={() => setActiveModal('email')} />
            <ActionButton label="Create PR" color={agent.color} onClick={() => setActiveModal('pr')} />
            <ActionButton label="Approve and Deploy" color={agent.color} onClick={() => setActiveModal('deploy')} />
          </div>
        </Section>

        {/* Recent Output */}
        <Section title="Recent Output">
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {cronLogs.length === 0 && agent.pendingDispatches.length === 0 ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', padding: '8px 0' }}>
                No output yet — daemon polling Telegram every 30s. Agent cron jobs will appear here when they run.
              </div>
            ) : (
              <AgentOutput cronLogs={cronLogs} dispatches={agent.pendingDispatches} />
            )}
          </div>
        </Section>
      </div>

      {/* Dispatch input — fixed at bottom */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(8,12,20,0.9)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={`Send task to ${agent.name}...`}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat() } }}
          />
          <button
            onClick={sendChat}
            disabled={sending || !chatText.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: sending ? 'rgba(59,130,246,0.3)' : agent.color,
              border: 'none',
              cursor: sending || !chatText.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
              opacity: !chatText.trim() ? 0.5 : 1,
            }}
          >
            {sending ? <Loader size={16} className="lucide-loader" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <DispatchModal
          {...getModalProps()}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function ActionButton({ label, color, filled, onClick }: { label: string; color: string; filled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: filled ? color : 'transparent',
        border: `1px solid ${color}4D`,
        borderRadius: 8,
        color: filled ? '#fff' : color,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!filled) (e.target as HTMLButtonElement).style.background = color + '33'
      }}
      onMouseLeave={(e) => {
        if (!filled) (e.target as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {label}
    </button>
  )
}

function statusPillColor(status: string): string {
  switch (status) {
    case 'active': return '#10B981'
    case 'processing': return '#F59E0B'
    case 'error': return '#EF4444'
    default: return '#475569'
  }
}

function formatTimeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}
