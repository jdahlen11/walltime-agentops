import { useESOCountdown } from '../hooks/useESOCountdown'

function pad(n: number) { return String(Math.max(0,n)).padStart(2,'0') }

export default function ESOCountdown() {
  const { days, hours, minutes, seconds } = useESOCountdown()
  const units = [{ v: days, l: 'DAYS' }, { v: hours, l: 'HRS' }, { v: minutes, l: 'MIN' }, { v: seconds, l: 'SEC' }]
  return (
    <div style={{
      position: 'absolute', top: 56, right: 12,
      background: 'rgba(10,14,23,0.88)', border: '1px solid rgba(59,130,246,0.35)',
      borderRadius: 8, padding: '10px 14px', pointerEvents: 'none', fontFamily: 'monospace',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ color: '#475569', fontSize: 8, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
        ESO Integration Deadline
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {units.map(({ v, l }, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 4, padding: '4px 8px', fontSize: 20, fontWeight: 700,
              color: '#60a5fa', minWidth: 34, textShadow: '0 0 12px rgba(96,165,250,0.4)',
            }}>{pad(v)}</div>
            <div style={{ color: '#334155', fontSize: 7, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ color: '#334155', fontSize: 8, marginTop: 5, textAlign: 'right' }}>Apr 16 2026 · 09:00 PST</div>
    </div>
  )
}
