import { useSimStore } from '../hooks/useAgentSimulation'
import { AGENTS } from '../data/agentProfiles'

const STATE_COLORS: Record<string, string> = {
  working: '#22c55e', thinking: '#8b5cf6', walking: '#f97316',
  coffee: '#eab308', meeting: '#06b6d4', idle: '#475569',
}

function hexRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`
}

export default function AgentCardStrip() {
  const states = useSimStore(s => s.agentStates)
  const setSelected = useSimStore(s => s.setSelected)
  const selectedId = useSimStore(s => s.selectedAgent)

  return (
    <div style={{
      position: 'absolute', top: 56, left: 12,
      display: 'flex', flexDirection: 'column', gap: 5,
      width: 210, pointerEvents: 'auto',
    }}>
      {AGENTS.map(a => {
        const sim = states[a.id]
        const isSelected = selectedId === a.id
        return (
          <div
            key={a.id}
            onClick={() => setSelected(isSelected ? null : a.id)}
            style={{
              background: isSelected ? `rgba(${hexRgb(a.color)},0.12)` : 'rgba(10,14,23,0.82)',
              border: `1px solid rgba(${hexRgb(a.color)},${isSelected ? 0.6 : 0.25})`,
              borderLeft: `3px solid ${a.color}`,
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
              fontFamily: 'monospace', transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{a.emoji}</span>
              <span style={{ color: a.color, fontSize: 12, fontWeight: 700, flex: 1 }}>{a.name}</span>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: STATE_COLORS[sim?.state ?? 'working'] ?? '#22c55e',
                boxShadow: `0 0 4px ${STATE_COLORS[sim?.state ?? 'working']}`,
                display: 'inline-block',
              }} />
            </div>
            <div style={{ color: '#475569', fontSize: 9, marginTop: 2 }}>{sim?.lastAction ?? '—'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ color: '#334155', fontSize: 8 }}>{a.model}</span>
              <span style={{ color: '#475569', fontSize: 9 }}>{((sim?.tokens ?? 0) / 1000).toFixed(0)}k</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
