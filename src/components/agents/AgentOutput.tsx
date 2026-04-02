import type { CronLogRow, DispatchLogRow } from '../../lib/types'
import { TOPIC_NAMES } from '../../config/agents'

interface AgentOutputProps {
  cronLogs: CronLogRow[]
  dispatches: DispatchLogRow[]
}

export default function AgentOutput({ cronLogs, dispatches }: AgentOutputProps) {
  if (cronLogs.length === 0 && dispatches.length === 0) {
    return (
      <div style={{ padding: '16px 0', fontSize: 13, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
        No output yet — awaiting data
      </div>
    )
  }

  type Entry = { time: string; label: string; text: string; status: string; kind: 'cron' | 'dispatch' }

  const entries: Entry[] = [
    // Real schema: executed_at (not started_at), error_message (not error_msg), telegram_topic_id (not topic_id)
    ...cronLogs.map((r): Entry => ({
      time: r.executed_at,
      label: r.job_name + (r.telegram_topic_id ? ` · ${TOPIC_NAMES[r.telegram_topic_id] ?? r.telegram_topic_id}` : ''),
      text: r.output_preview ?? r.error_message ?? '',
      status: r.status,
      kind: 'cron',
    })),
    // Real schema: task_description (not task_text), to_agent (not agent_id), completed_at (not resolved_at)
    ...dispatches.map((r): Entry => ({
      time: r.dispatched_at,
      label: `Dispatch · ${r.task_description.slice(0, 50)}`,
      text: r.result_preview ?? '',
      status: r.status,
      kind: 'dispatch',
    })),
  ].sort((a, b) => b.time.localeCompare(a.time))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((entry, i) => (
        <OutputEntry key={i} entry={entry} />
      ))}
    </div>
  )
}

function OutputEntry({ entry }: { entry: { time: string; label: string; text: string; status: string } }) {
  const statusColor =
    entry.status === 'success' || entry.status === 'done' ? '#10B981'
    : entry.status === 'error' ? '#EF4444'
    : entry.status === 'running' || entry.status === 'working' ? '#F59E0B'
    : 'rgba(255,255,255,0.35)'

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${statusColor}`, borderRadius: 6, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: statusColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{entry.status}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{entry.label}</div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatTime(entry.time)}</div>
      </div>
      {entry.text && (
        <pre style={{ margin: 0, padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 4, fontSize: 12, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 180, overflowY: 'auto', lineHeight: 1.5 }}>
          {entry.text}
        </pre>
      )}
    </div>
  )
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}
