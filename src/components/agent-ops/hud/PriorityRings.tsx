const MISSIONS = [
  { label: 'Cedars Accelerator', pct: 72, color: '#8b5cf6' },
  { label: 'ESO Integration',    pct: 45, color: '#3b82f6' },
  { label: '$500K SAFE',         pct: 30, color: '#eab308' },
  { label: 'RLS Compliance',     pct: 95, color: '#22c55e' },
]
const R = 14, C = 2 * Math.PI * R

function Ring({ pct, color }: { pct: number; color: string }) {
  const d = (pct / 100) * C
  return (
    <svg width={36} height={36} viewBox="0 0 36 36">
      <circle cx={18} cy={18} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3} />
      <circle cx={18} cy={18} r={R} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${d} ${C-d}`} strokeLinecap="round" transform="rotate(-90 18 18)"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
      <text x={18} y={22} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace" fontWeight="bold">{pct}%</text>
    </svg>
  )
}

function rgb(hex: string) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }

export default function PriorityRings() {
  return (
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, pointerEvents: 'none',
    }}>
      {MISSIONS.map(m => (
        <div key={m.label} style={{
          background: 'rgba(10,14,23,0.85)', border: `1px solid rgba(${rgb(m.color)},0.3)`,
          borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 116,
          backdropFilter: 'blur(6px)',
        }}>
          <Ring pct={m.pct} color={m.color} />
          <div>
            <div style={{ color: m.color, fontSize: 9, fontFamily: 'monospace', fontWeight: 700 }}>{m.label}</div>
            <div style={{ color: '#334155', fontSize: 8, fontFamily: 'monospace' }}>Mission</div>
          </div>
        </div>
      ))}
    </div>
  )
}
