import { motion } from 'framer-motion'
import { Clock, Cpu } from 'lucide-react'
import type { AgentView } from '../../lib/types'

interface AgentCardProps {
  agent: AgentView
  selected: boolean
  onClick: () => void
}

export default function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  const timeSince = agent.lastActionAt ? formatTimeSince(agent.lastActionAt) : null

  return (
    <motion.div
      layout
      onClick={onClick}
      style={{
        background: selected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${selected ? agent.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `3px solid ${agent.color}`,
        borderRadius: 8,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 12px ${agent.color}20` : 'none',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {/* Name + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{agent.emoji}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 }}>
              {agent.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {agent.role}
            </div>
          </div>
        </div>
        <StatusDot status={agent.status} color={agent.color} />
      </div>

      {/* Current task */}
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.65)',
          marginBottom: 8,
          minHeight: 16,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {agent.currentTask ?? (
          <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
            {agent.status === 'idle' ? 'Idle' : 'Awaiting data...'}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MetaTag icon={<Cpu size={10} />} text={agent.model} />
        {agent.tokensUsed > 0 && (
          <MetaTag text={`${formatTokens(agent.tokensUsed)} tok`} />
        )}
        {timeSince && (
          <MetaTag icon={<Clock size={10} />} text={timeSince} />
        )}
        <StatusBadge status={agent.status} color={agent.color} />
      </div>
    </motion.div>
  )
}

function StatusDot({ status, color }: { status: string; color: string }) {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: statusBgColor(status, color),
        boxShadow: status === 'active' ? `0 0 6px ${color}` : 'none',
        flexShrink: 0,
        animation: status === 'active' ? 'pulse 2s infinite' : 'none',
      }}
    />
  )
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  const labels: Record<string, string> = {
    active: 'ACTIVE',
    processing: 'PROCESSING',
    idle: 'IDLE',
    error: 'ERROR',
  }
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: statusBgColor(status, color),
        background: statusBgColor(status, color) + '18',
        border: `1px solid ${statusBgColor(status, color)}40`,
        borderRadius: 3,
        padding: '1px 5px',
        marginLeft: 'auto',
      }}
    >
      {labels[status] ?? status.toUpperCase()}
    </div>
  )
}

function MetaTag({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
      }}
    >
      {icon}
      {text}
    </div>
  )
}

function statusBgColor(status: string, agentColor: string) {
  switch (status) {
    case 'active': return agentColor
    case 'processing': return '#F59E0B'
    case 'error': return '#EF4444'
    default: return 'rgba(255,255,255,0.25)'
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

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
