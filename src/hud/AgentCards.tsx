import { useAgentStore } from '../store/agentStore'

const STATE_LABEL: Record<string, string> = {
  working: 'Working',
  thinking: 'Thinking',
  coffee: 'Coffee break',
  walking: 'Walking',
}

export default function AgentCards() {
  const agents = useAgentStore(s => s.agents)

  return (
    <div style={{
      position: 'absolute',
      top: 56,
      left: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      pointerEvents: 'none',
      width: 220,
    }}>
      {agents.map(a => (
        <div key={a.id} style={{
          background: 'rgba(10,10,20,0.82)',
          border: `1px solid rgba(${hexToRgb(a.color)},0.3)`,
          borderLeft: `3px solid ${a.color}`,
          borderRadius: 6,
          padding: '6px 10px',
          fontFamily: 'monospace',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14 }}>{a.emoji}</span>
            <span style={{ color: a.color, fontSize: 12, fontWeight: 700 }}>{a.name}</span>
            <span style={{ color: '#64748b', fontSize: 10, marginLeft: 'auto' }}>{a.role}</span>
            <StatusDot state={a.state} />
          </div>
          <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {a.lastAction}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: 9 }}>{a.model}</span>
            <span style={{ color: '#64748b', fontSize: 9 }}>{(a.tokens / 1000).toFixed(0)}k tok</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusDot({ state }: { state: string }) {
  const color = state === 'coffee' ? '#F59E0B' : state === 'thinking' ? '#8B5CF6' : '#22c55e'
  return (
    <span style={{
      width: 7, height: 7, borderRadius: '50%',
      background: color,
      boxShadow: `0 0 4px ${color}`,
      display: 'inline-block',
      animation: state === 'working' ? 'pulse 2s infinite' : 'none',
    }} />
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
