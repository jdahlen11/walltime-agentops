import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useSimStore } from '../hooks/useAgentSimulation'
import { AGENTS } from '../data/agentProfiles'

export default function TopBar({ onMeetingClick }: { onMeetingClick: () => void }) {
  const [time, setTime] = useState(new Date())
  const states = useSimStore(s => s.agentStates)
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 48,
      background: 'rgba(10,14,23,0.92)', borderBottom: '1px solid rgba(251,191,36,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', pointerEvents: 'auto', zIndex: 20,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#fbbf24', letterSpacing: 3, fontWeight: 700 }}>
        APOT SOLUTIONS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#fbbf24', letterSpacing: 4, textShadow: '0 0 12px rgba(251,191,36,0.5)' }}>
          WALLTIME HEADQUARTERS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 12, padding: '1px 8px', fontFamily: 'monospace', fontSize: 9, color: '#22c55e', letterSpacing: 1 }}>
            6 AGENTS ONLINE
          </span>
          {AGENTS.map(a => (
            <span key={a.id} style={{
              width: 7, height: 7, borderRadius: '50%', background: a.color,
              boxShadow: `0 0 5px ${a.color}`, display: 'inline-block',
              opacity: states[a.id]?.state === 'idle' ? 0.5 : 1,
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{format(time, 'HH:mm:ss')}</div>
        <button
          onClick={onMeetingClick}
          style={{
            background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)',
            borderRadius: 6, padding: '5px 12px', fontFamily: 'monospace', fontSize: 11,
            color: '#a78bfa', cursor: 'pointer', letterSpacing: 1, pointerEvents: 'auto',
          }}
        >
          ⚡ MEET
        </button>
      </div>
    </div>
  )
}
