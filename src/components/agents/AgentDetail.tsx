import { useState } from 'react'
import { Send, Loader, X } from 'lucide-react'
import type { AgentView, AgentId } from '../../lib/types'
import { useCronLog } from '../../hooks/useCronLog'
import { useDispatch } from '../../hooks/useDispatch'
import AgentOutput from './AgentOutput'
import DispatchModal from './DispatchModal'
import { TOPIC_NAMES } from '../../config/agents'

interface AgentDetailProps {
  agent: AgentView
  onClose?: () => void
}

type ActionType = 'dispatch' | 'linkedin' | 'email' | 'pr' | 'deploy' | null

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [chatText, setChatText] = useState('')
  const [activeModal, setActiveModal] = useState<ActionType>(null)
  const { rows: cronLogs } = useCronLog(agent.id, 10)
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: agent.color + '25',
                border: `1px solid ${agent.color}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {agent.emoji}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{agent.role}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <StatusBadge status={agent.status} color={agent.color} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{agent.model}</span>
                {agent.tokensUsed > 0 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formatTokens(agent.tokensUsed)} tokens</span>
                )}
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

        {/* Current task */}
        <Section title="Currently Working On">
          {agent.currentTask ? (
            <div
              style={{
                padding: '10px 12px',
                background: `${agent.color}12`,
                border: `1px solid ${agent.color}30`,
                borderRadius: 6,
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.5,
              }}
            >
              {agent.currentTask}
              {agent.currentTopic && (
                <span style={{ fontSize: 11, color: agent.color, marginLeft: 8 }}>
                  #{TOPIC_NAMES[agent.currentTopic] ?? agent.currentTopic}
                </span>
              )}
            </div>
          ) : (
            <EmptyState text={agent.status === 'idle' ? 'Agent is idle' : 'Awaiting data from Supabase'} />
          )}
        </Section>

        {/* Actions */}
        <Section title="Actions">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <ActionButton label="Dispatch Task" color={agent.color} onClick={() => setActiveModal('dispatch')} />
            <ActionButton label="Draft LinkedIn Post" color="#EC4899" onClick={() => setActiveModal('linkedin')} />
            <ActionButton label="Draft Email" color="#F59E0B" onClick={() => setActiveModal('email')} />
            <ActionButton label="Create PR" color="#10B981" onClick={() => setActiveModal('pr')} />
            <ActionButton label="Approve & Deploy" color="#8B5CF6" onClick={() => setActiveModal('deploy')} />
          </div>
        </Section>

        {/* Live output */}
        <Section title="Recent Output">
          <AgentOutput cronLogs={cronLogs} dispatches={agent.pendingDispatches} />
        </Section>

        {/* Pending queue */}
        {agent.pendingDispatches.filter(d => d.status !== 'done').length > 0 && (
          <Section title="Queue">
            {agent.pendingDispatches.filter(d => d.status !== 'done').map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.task_description}
                </span>
                <span style={{ color: statusColor(d.status), marginLeft: 8, flexShrink: 0, fontSize: 11 }}>
                  {d.status}
                </span>
              </div>
            ))}
          </Section>
        )}
      </div>

      {/* Chat input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(8,12,20,0.9)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder={`Message ${agent.name}...`}
            rows={2}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
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
            {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
          Enter to send · dispatches via Telegram /dispatch {agent.id}
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

function ActionButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 12px',
        background: color + '18',
        border: `1px solid ${color}40`,
        borderRadius: 6,
        color: color,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  const c = status === 'active' ? color : status === 'processing' ? '#F59E0B' : status === 'error' ? '#EF4444' : 'rgba(255,255,255,0.3)'
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: c, background: c + '18', border: `1px solid ${c}40`, borderRadius: 3, padding: '1px 6px' }}>
      {status.toUpperCase()}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', padding: '8px 0' }}>{text}</div>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'done': return '#10B981'
    case 'error': return '#EF4444'
    case 'working': return '#F59E0B'
    default: return 'rgba(255,255,255,0.4)'
  }
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

// Augment AgentView with currentTopic for the detail panel
