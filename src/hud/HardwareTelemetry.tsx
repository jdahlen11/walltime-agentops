import { useEffect } from 'react'
import { useHardwareStore } from '../store/hardwareStore'

function Bar({ value, color = '#22c55e' }: { value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`, height: '100%', background: color,
          boxShadow: `0 0 4px ${color}`,
          borderRadius: 3, transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ color: '#94a3b8', fontSize: 10, minWidth: 30, textAlign: 'right', fontFamily: 'monospace' }}>
        {value.toFixed(0)}%
      </span>
    </div>
  )
}

function Row({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
      <span style={{ color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: 10, fontFamily: 'monospace' }}>{value}{unit}</span>
    </div>
  )
}

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(10,10,20,0.82)',
      border: `1px solid rgba(${hexToRgb(color)},0.3)`,
      borderRadius: 6,
      padding: '8px 10px',
    }}>
      <div style={{ color, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', marginBottom: 6, letterSpacing: 1 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

export default function HardwareTelemetry() {
  const { rtx, mac, jitter } = useHardwareStore()

  useEffect(() => {
    const id = setInterval(jitter, 2000)
    return () => clearInterval(id)
  }, [jitter])

  return (
    <div style={{
      position: 'absolute',
      top: 56,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      pointerEvents: 'none',
      width: 200,
      marginTop: 130,
    }}>
      <Card title="RTX 5090" color="#22c55e">
        <Row label="Tok/s" value={rtx.tokPerSec.toFixed(2)} />
        <Row label="Temp" value={rtx.tempC.toFixed(0)} unit="°C" />
        <div style={{ marginTop: 4, marginBottom: 2 }}>
          <div style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 }}>VRAM</div>
          <Bar value={rtx.vram} color="#22c55e" />
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 }}>GPU</div>
          <Bar value={rtx.gpuUtil} color="#4ade80" />
        </div>
      </Card>

      <Card title="Mac Mini M4" color="#06B6D4">
        <Row label="Crons" value={mac.crons} />
        <Row label="Status" value={mac.online ? '● Online' : '○ Offline'} />
        <div style={{ marginTop: 4, marginBottom: 2 }}>
          <div style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 }}>CPU</div>
          <Bar value={mac.cpu} color="#06B6D4" />
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 }}>Memory</div>
          <Bar value={mac.mem} color="#22d3ee" />
        </div>
      </Card>
    </div>
  )
}
