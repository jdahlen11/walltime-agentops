const MISSIONS = [
  { label: 'Cedars Accelerator', pct: 72, color: '#8B5CF6' },
  { label: 'ESO Integration', pct: 45, color: '#3B82F6' },
  { label: '$500K SAFE', pct: 30, color: '#F59E0B' },
  { label: 'RLS Compliance', pct: 95, color: '#22c55e' },
]

const R = 14
const CIRC = 2 * Math.PI * R

function Ring({ pct, color }: { pct: number; color: string }) {
  const dash = (pct / 100) * CIRC
  return (
    <svg width={36} height={36} viewBox="0 0 36 36">
      <circle cx={18} cy={18} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle
        cx={18} cy={18} r={R}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={`${dash} ${CIRC - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
      <text x={18} y={22} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace" fontWeight="bold">
        {pct}%
      </text>
    </svg>
  )
}

export default function MissionPriorities() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {MISSIONS.map(m => (
        <div key={m.label} style={{
          background: 'rgba(10,10,20,0.85)',
          border: `1px solid rgba(${hexToRgb(m.color)},0.3)`,
          borderRadius: 8,
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 120,
        }}>
          <Ring pct={m.pct} color={m.color} />
          <div>
            <div style={{ color: m.color, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>{m.label}</div>
            <div style={{ color: '#475569', fontSize: 9, fontFamily: 'monospace' }}>Priority</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
