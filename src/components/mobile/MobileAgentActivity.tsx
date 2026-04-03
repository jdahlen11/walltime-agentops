import { useRef, useEffect, useState, type ReactNode } from 'react'
import { X, Send, Terminal, Clock, Bell, ChevronRight } from 'lucide-react'
import type { AgentView } from '../../lib/types'
import { TOPIC_NAMES } from '../../config/agents'
import DispatchModal from '../agents/DispatchModal'

// ── Cron schedule for computing upcoming dispatches ──────────

const CRON_SCHEDULES: Record<string, { name: string; hour: number; minute: number; days?: number[] }[]> = {
  scout: [
    { name: 'research', hour: 8, minute: 0 },
    { name: 'competitors', hour: 9, minute: 0 },
    { name: 'ai-tools-radar', hour: 14, minute: 0 },
  ],
  engineer: [{ name: 'product-expansion', hour: 15, minute: 0 }],
  command: [
    { name: 'ops-healthcheck', hour: 5, minute: 0 },
    { name: 'morning-brief', hour: 6, minute: 0 },
    { name: 'task-dispatch', hour: 8, minute: 0 },
    { name: 'task-dispatch', hour: 12, minute: 0 },
    { name: 'task-dispatch', hour: 16, minute: 0 },
  ],
  capital: [
    { name: 'vc-tracking', hour: 10, minute: 0 },
    { name: 'fundraise-pipeline', hour: 10, minute: 0, days: [2, 4] },
  ],
  content: [
    { name: 'content', hour: 11, minute: 0 },
    { name: 'outreach-warmup', hour: 12, minute: 0 },
  ],
  analyst: [{ name: 'emsa-compliance', hour: 7, minute: 0 }],
}

interface ScheduledTask {
  name: string
  timeLabel: string
}

function getUpcomingSchedule(agentId: string): ScheduledTask[] {
  const schedule = CRON_SCHEDULES[agentId]
  if (!schedule) return []
  const now = new Date()
  const pstStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  const pst = new Date(pstStr)
  const currentHour = pst.getHours()
  const currentMinute = pst.getMinutes()
  const currentDay = pst.getDay()

  const upcoming: ScheduledTask[] = []
  for (const task of schedule) {
    if (task.days && !task.days.includes(currentDay)) continue
    if (task.hour > currentHour || (task.hour === currentHour && task.minute > currentMinute)) {
      const diffMin = (task.hour - currentHour) * 60 + (task.minute - currentMinute)
      const h = Math.floor(diffMin / 60)
      const m = diffMin % 60
      const timeLabel = h > 0 ? `in ${h}h ${m}m` : `in ${m}m`
      upcoming.push({ name: task.name, timeLabel })
    }
  }
  if (upcoming.length === 0 && schedule.length > 0) {
    const first = schedule[0]
    upcoming.push({
      name: first.name,
      timeLabel: `tomorrow ${first.hour}:${String(first.minute).padStart(2, '0')} PST`,
    })
  }
  return upcoming
}

// ── Terminal log entry builder ───────────────────────────────

type LogStatus = 'running' | 'success' | 'error' | 'dispatched' | 'working' | 'done'

interface LogEntry {
  time: string
  type: LogStatus
  label: string
  detail: string | null
  topic: string | null
  duration: number | null
  tokens: number | null
}

function buildLogEntries(agent: AgentView): LogEntry[] {
  const entries: LogEntry[] = []

  for (const cron of agent.recentCrons) {
    entries.push({
      time: cron.executed_at,
      type: cron.status as LogStatus,
      label: cron.job_name,
      detail: cron.output_preview ?? cron.error_message ?? null,
      topic: cron.telegram_topic_id ? (TOPIC_NAMES[cron.telegram_topic_id] ?? null) : null,
      duration: cron.duration_ms,
      tokens: cron.tokens_used,
    })
  }

  for (const d of agent.pendingDispatches) {
    entries.push({
      time: d.dispatched_at,
      type: d.status as LogStatus,
      label: d.task_description.slice(0, 80),
      detail: d.result_preview ?? null,
      topic: d.telegram_topic_id ? (TOPIC_NAMES[d.telegram_topic_id] ?? null) : null,
      duration: null,
      tokens: null,
    })
  }

  entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  return entries
}

function formatLogTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Los_Angeles',
    })
  } catch {
    return '??:??:??'
  }
}

function statusIcon(type: LogStatus): string {
  switch (type) {
    case 'running': return '\u25B6'
    case 'success': return '\u2713'
    case 'done': return '\u2713'
    case 'error': return '\u2717'
    case 'dispatched': return '\u2192'
    case 'working': return '\u27F3'
    default: return '\u00B7'
  }
}

function statusColor(type: LogStatus): string {
  switch (type) {
    case 'running': return '#10B981'
    case 'success': return '#10B981'
    case 'done': return '#10B981'
    case 'error': return '#EF4444'
    case 'dispatched': return '#F59E0B'
    case 'working': return '#3B82F6'
    default: return 'rgba(255,255,255,0.4)'
  }
}

function formatTimeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

// ── Main Component ───────────────────────────────────────────

interface MobileAgentActivityProps {
  agent: AgentView
  onClose: () => void
}

export default function MobileAgentActivity({ agent, onClose }: MobileAgentActivityProps) {
  const logRef = useRef<HTMLDivElement>(null)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const logEntries = buildLogEntries(agent)
  const upcomingSchedule = getUpcomingSchedule(agent.id)
  const pendingApprovals = agent.pendingDispatches.filter(
    (d) => d.status === 'dispatched' || d.status === 'working',
  )
  const isActive = agent.status === 'active' || agent.status === 'processing'

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [logEntries.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Compact Header ── */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${agent.color}12 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{agent.emoji}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
              {agent.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background:
                    agent.status === 'active' ? '#10B981'
                    : agent.status === 'processing' ? '#F59E0B'
                    : agent.status === 'error' ? '#EF4444'
                    : '#475569',
                  borderRadius: 9999,
                  padding: '1px 8px',
                  letterSpacing: '0.06em',
                }}
              >
                {agent.status.toUpperCase()}
              </div>
              {isActive && agent.recentCrons[0] && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  {agent.recentCrons[0].job_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Live Activity Terminal */}
        <div style={{ padding: '12px 16px 8px' }}>
          <SectionHeader icon={<Terminal size={12} />} label="LIVE ACTIVITY" />
          <div
            ref={logRef}
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '10px 12px',
              maxHeight: 240,
              overflowY: 'auto',
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: 11,
              lineHeight: 1.7,
            }}
          >
            {logEntries.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ color: '#475569' }}>$</span> awaiting agent output...
                <span
                  className="terminal-blink"
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 13,
                    background: agent.color,
                    marginLeft: 4,
                    verticalAlign: 'middle',
                  }}
                />
              </div>
            ) : (
              logEntries.map((entry, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                      [{formatLogTime(entry.time)}]
                    </span>
                    <span style={{ color: statusColor(entry.type), flexShrink: 0 }}>
                      {statusIcon(entry.type)}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {entry.label}
                      {entry.topic && (
                        <span style={{ color: agent.color, marginLeft: 6, fontSize: 10 }}>
                          #{entry.topic}
                        </span>
                      )}
                      {entry.duration != null && (
                        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>
                          {(entry.duration / 1000).toFixed(1)}s
                        </span>
                      )}
                      {entry.tokens != null && entry.tokens > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
                          {entry.tokens > 1000
                            ? `${(entry.tokens / 1000).toFixed(1)}K`
                            : entry.tokens}{' '}
                          tok
                        </span>
                      )}
                    </span>
                  </div>
                  {entry.detail && (
                    <div
                      style={{
                        paddingLeft: 20,
                        color: 'rgba(255,255,255,0.35)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 60,
                        overflow: 'hidden',
                        fontSize: 10,
                        lineHeight: 1.4,
                        marginTop: 1,
                      }}
                    >
                      {'\u2192'} {entry.detail.slice(0, 200)}
                    </div>
                  )}
                </div>
              ))
            )}
            {logEntries.length > 0 && (
              <div style={{ color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>
                <span style={{ color: '#475569' }}>$</span>{' '}
                <span
                  className="terminal-blink"
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 13,
                    background: agent.color,
                    verticalAlign: 'middle',
                    opacity: 0.6,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Next Dispatches */}
        <div style={{ padding: '4px 16px 8px' }}>
          <SectionHeader icon={<Clock size={12} />} label="NEXT DISPATCHES" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingApprovals.map((d) => (
              <DispatchRow
                key={d.id}
                icon={'\u23F3'}
                label={d.task_description.slice(0, 60)}
                meta={`${d.status} \u00B7 ${formatTimeSince(d.dispatched_at)}`}
                color="#F59E0B"
              />
            ))}
            {upcomingSchedule.map((task, i) => (
              <DispatchRow
                key={`sched-${i}`}
                icon={'\uD83D\uDCCB'}
                label={task.name}
                meta={task.timeLabel}
                color={agent.color}
              />
            ))}
            {pendingApprovals.length === 0 && upcomingSchedule.length === 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.2)',
                  fontStyle: 'italic',
                  padding: '4px 0',
                }}
              >
                No upcoming dispatches
              </div>
            )}
          </div>
        </div>

        {/* Telegram Approvals */}
        {pendingApprovals.length > 0 && (
          <div style={{ padding: '4px 16px 12px' }}>
            <SectionHeader icon={<Bell size={12} />} label="AWAITING ACTION" />
            {pendingApprovals.map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 6,
                }}
              >
                <div
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}
                >
                  {d.task_description.slice(0, 80)}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>
                    {d.status === 'working' ? '\u27F3 In progress' : '\u23F3 Dispatched'}
                  </span>
                  <span>{'\u00B7'}</span>
                  <span>{formatTimeSince(d.dispatched_at)}</span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#F59E0B',
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Check Telegram <ChevronRight size={10} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Dispatch Button (replaces chat input) ── */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          background: 'rgba(8,12,20,0.9)',
        }}
      >
        <button
          onClick={() => setShowDispatchModal(true)}
          style={{
            width: '100%',
            padding: '10px 0',
            background: agent.color,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Send size={14} /> Dispatch Task
        </button>
      </div>

      {showDispatchModal && (
        <DispatchModal agentId={agent.id} onClose={() => setShowDispatchModal(false)} />
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      {label}
    </div>
  )
}

function DispatchRow({
  icon,
  label,
  meta,
  color,
}: {
  icon: string
  label: string
  meta: string
  color: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: 'rgba(255,255,255,0.025)',
        borderRadius: 6,
        borderLeft: `2px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  )
}
