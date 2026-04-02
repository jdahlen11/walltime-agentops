import { useEffect } from 'react'
import { useHardwareTelemetry } from '../hooks/useHardwareTelemetry'
import type { ReactNode } from 'react'

function rgb(hex: string) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }

function Bar({ v, c = '#22c55e' }: { v: number; c?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${v}%`, height: '100%', background: c, boxShadow: `0 0 3px ${c}`, borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
      <span style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', minWidth: 28, textAlign: 'right' }}>{v.toFixed(0)}%</span>
    </div>
  )
}

function Card({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(10,14,23,0.85)', border: `1px solid rgba(${rgb(color)},0.3)`, borderRadius: 6, padding: '8px 10px', backdropFilter: 'blur(8px)' }}>
      <div style={{ color, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 5 }}>{title}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ color: '#475569', fontSize: 9, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ color: '#cbd5e1', fontSize: 9, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

export default function HardwareTelemetry() {
  const { rtx, mac, jitter } = useHardwareTelemetry()
  useEffect(() => { const id = setInterval(jitter, 2000); return () => clearInterval(id) }, [jitter])
  return (
    <div style={{ position: 'absolute', right: 12, display: 'flex', flexDirection: 'column', gap: 6, width: 195, pointerEvents: 'none', top: 198 }}>
      <Card title="RTX 5090" color="#22c55e">
        <Row label="Tok/s" value={rtx.tokPerSec.toFixed(2)} />
        <Row label="Temp" value={`${rtx.tempC.toFixed(0)}°C`} />
        <div style={{ fontSize: 8, color: '#334155', fontFamily: 'monospace', marginBottom: 2 }}>VRAM</div>
        <Bar v={rtx.vram} c="#22c55e" />
        <div style={{ fontSize: 8, color: '#334155', fontFamily: 'monospace', margin: '3px 0 2px' }}>GPU</div>
        <Bar v={rtx.gpuUtil} c="#4ade80" />
      </Card>
      <Card title="Mac Mini M4" color="#06b6d4">
        <Row label="Crons" value={String(mac.crons)} />
        <Row label="Gateway" value="● Online" />
        <div style={{ fontSize: 8, color: '#334155', fontFamily: 'monospace', marginBottom: 2 }}>CPU</div>
        <Bar v={mac.cpu} c="#06b6d4" />
        <div style={{ fontSize: 8, color: '#334155', fontFamily: 'monospace', margin: '3px 0 2px' }}>Memory</div>
        <Bar v={mac.mem} c="#22d3ee" />
      </Card>
    </div>
  )
}
