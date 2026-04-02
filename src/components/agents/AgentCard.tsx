import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import type { AgentView } from '../../lib/types'

interface AgentCardProps {
  agent: AgentView
  selected: boolean
  onClick: () => void
}

// Cron schedule per agent (PST / America-Los_Angeles)
const CRON_SCHEDULES: Record<string, { name: string; hour: number; minute: number; days?: number[] }[]> = {
  scout: [
    { name: 'research', hour: 8, minute: 0 },
    { name: 'competitors', hour: 9, minute: 0 },
    { name: 'ai-tools-radar', hour: 14, minute: 0 },
  ],
  engineer: [
    { name: 'product-expansion', hour: 15, minute: 0 },
  ],
  command: [
    { name: 'ops-healthcheck', hour: 5, minute: 0 },
    { name: 'morning-brief', hour: 6, minute: 0 },
    { name: 'task-dispatch', hour: 8, minute: 0 },
    { name: 'task-dispatch', hour: 12, minute: 0 },
    { name: 'task-dispatch', hour: 16, minute: 0 },
  ],
  capital: [
    { name: 'vc-tracking', hour: 10, minute: 0 },
    { name: 'fundraise-pipeline', hour: 10, minute: 0, days: [2, 4] }, // Tue, Thu
  ],
  content: [
    { name: 'content', hour: 11, minute: 0 },
    { name: 'outreach-warmup', hour: 12, minute: 0 },
  ],
  analyst: [
    { name: 'emsa-compliance', hour: 7, minute: 0 },
  ],
}

function getNextScheduledTask(agentId: string): string | null {
  const schedule = CRON_SCHEDULES[agentId]
  if (!schedule || schedule.length === 0) return null

  // Get current time in PST
  const now = new Date()
  const pstStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const pst = new Date(pstStr)
  const currentHour = pst.getHours()
  const currentMinute = pst.getMinutes()
  const currentDay = pst.getDay() // 0=Sun

  // Find next task today
  for (const task of schedule) {
    if (task.days && !task.days.includes(currentDay)) continue
    if (task.hour > currentHour || (task.hour === currentHour && task.minute > currentMinute)) {
      const diffMin = (task.hour - currentHour) * 60 + (task.minute - currentMinute)
      const h = Math.floor(diffMin / 60)
      const m = diffMin % 60
      const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`
      return `Next: ${task.name} in ${timeStr}`
    }
  }

  // All today's tasks passed, show tomorrow's first
  const first = schedule[0]
  return `Next: ${first.name} · tomorrow ${first.hour}AM`
}

export default function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  // Last activity from recentCrons
  const lastCron = agent.recentCrons[0]
  let lastActivity: string | null = null
  if (lastCron) {
    const diff = Date.now() - new Date(lastCron.executed_at).getTime()
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor(diff / 60000)
    const timeStr = hours > 0 ? `${hours}h ago` : `${mins}m ago`
    lastActivity = `Last: ${lastCron.job_name} · ${timeStr}`
  }

  const scheduledNext = !lastActivity ? getNextScheduledTask(agent.id) : null

  return (
    <motion.div
      layout
      onClick={onClick}
      style={{
        background: selected ? '#141A22' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${selected ? agent.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: selected ? `3px solid ${agent.color}` : '3px solid transparent',
        borderRadius: 8,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 12px ${agent.color}20` : 'none',
      }}
      whileHover={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {/* Name + status dot */}
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
        <StatusDot status={agent.status} />
      </div>

      {/* Status bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ height: 2, background: agent.color, borderRadius: 1, marginBottom: 3 }} />
        <div style={{ fontSize: 10, color: agent.color, fontWeight: 600, letterSpacing: '0.06em' }}>
          {agent.status.toUpperCase()}
        </div>
      </div>

      {/* Last activity or next scheduled */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6, minHeight: 16 }}>
        {lastActivity ?? scheduledNext ?? (
          <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.2)' }}>No recent activity</span>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          {agent.model}
        </span>
        {agent.tokensUsed > 0 && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {formatTokens(agent.tokensUsed)} tok
          </span>
        )}
      </div>
    </motion.div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'active' ? '#10B981'
    : status === 'error' ? '#EF4444'
    : status === 'idle' ? '#F59E0B'
    : '#475569'

  const pulseClass = status === 'active' ? 'pulse-dot-active'
    : status === 'error' ? 'pulse-dot-error'
    : ''

  return (
    <div
      className={pulseClass}
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  )
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
