import { useState, useEffect } from 'react'
import { differenceInSeconds, addSeconds } from 'date-fns'

// ESO deadline: April 16 2026 09:00 PST (UTC-8)
const TARGET = new Date('2026-04-16T17:00:00Z')

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

export default function ESOCountdown() {
  const [diff, setDiff] = useState(() => Math.max(0, differenceInSeconds(TARGET, new Date())))

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, differenceInSeconds(TARGET, new Date())))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const mins = Math.floor((diff % 3600) / 60)
  const secs = diff % 60

  return (
    <div style={{
      position: 'absolute',
      top: 56,
      right: 12,
      background: 'rgba(10,10,20,0.85)',
      border: '1px solid rgba(59,130,246,0.4)',
      borderRadius: 8,
      padding: '10px 14px',
      pointerEvents: 'none',
      fontFamily: 'monospace',
      minWidth: 200,
    }}>
      <div style={{ color: '#64748b', fontSize: 9, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
        ESO Integration Countdown
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        {[
          { v: days, label: 'DAYS' },
          { v: hours, label: 'HRS' },
          { v: mins, label: 'MIN' },
          { v: secs, label: 'SEC' },
        ].map(({ v, label }, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 22,
              fontWeight: 700,
              color: '#60a5fa',
              minWidth: 36,
              letterSpacing: 1,
              textShadow: '0 0 10px rgba(96,165,250,0.5)',
            }}>
              {pad2(v)}
            </div>
            <div style={{ color: '#475569', fontSize: 8, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ color: '#475569', fontSize: 9, marginTop: 6, textAlign: 'right' }}>
        Apr 16 2026 · 09:00 PST
      </div>
    </div>
  )
}
