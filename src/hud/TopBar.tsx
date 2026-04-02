import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAgentStore } from '../store/agentStore'

interface TopBarProps {
  onMeetingClick: () => void
}

export default function TopBar({ onMeetingClick }: TopBarProps) {
  const [time, setTime] = useState(new Date())
  const agents = useAgentStore(s => s.agents)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 48,
      background: 'rgba(10,10,20,0.88)',
      borderBottom: '1px solid rgba(251,191,36,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      pointerEvents: 'auto',
      zIndex: 20,
    }}>
      {/* Left: title */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: 700,
        color: '#fbbf24',
        letterSpacing: 3,
        textTransform: 'uppercase',
        flex: 1,
      }}>
        WALLTIME HQ
      </div>

      {/* Center: title + agents */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 2 }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 15,
          fontWeight: 700,
          color: '#fbbf24',
          letterSpacing: 4,
          textShadow: '0 0 8px rgba(251,191,36,0.6)',
        }}>
          WALLTIME HEADQUARTERS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <span style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: 12,
            padding: '1px 8px',
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#22c55e',
          }}>
            6 AGENTS
          </span>
          {agents.map(a => (
            <span key={a.id} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: a.color,
              boxShadow: `0 0 4px ${a.color}`,
              display: 'inline-block',
            }} />
          ))}
        </div>
      </div>

      {/* Right: time + meeting button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
          {format(time, 'HH:mm:ss')}
        </div>
        <button
          onClick={onMeetingClick}
          style={{
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.6)',
            borderRadius: 6,
            padding: '4px 10px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#a78bfa',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          MEET
        </button>
      </div>
    </div>
  )
}
