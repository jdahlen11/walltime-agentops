import { useEffect } from 'react'
import { useHardwareStore } from '../store/hardwareStore'
import { useAgentStore } from '../store/agentStore'
import { useFeedStore } from '../store/feedStore'

// Shown inside the mobile bottom sheet "Monitor" tab
export default function APOTMonitor() {
  const { rtx, mac, jitter } = useHardwareStore()
  const agents = useAgentStore(s => s.agents)

  useEffect(() => {
    const id = setInterval(jitter, 2000)
    return () => clearInterval(id)
  }, [jitter])

  return (
    <div style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
      <Section title="RTX 5090" color="#22c55e">
        <Stat label="Tok/s" value={`${rtx.tokPerSec.toFixed(2)}`} />
        <Stat label="GPU Util" value={`${rtx.gpuUtil.toFixed(0)}%`} />
        <Stat label="VRAM" value={`${rtx.vram.toFixed(0)}%`} />
        <Stat label="Temp" value={`${rtx.tempC.toFixed(0)}°C`} />
      </Section>
      <Section title="Mac Mini M4" color="#06B6D4">
        <Stat label="CPU" value={`${mac.cpu.toFixed(0)}%`} />
        <Stat label="Memory" value={`${mac.mem.toFixed(0)}%`} />
        <Stat label="Crons" value={`${mac.crons}`} />
        <Stat label="Gateway" value="Online" valueColor="#22c55e" />
      </Section>
      <Section title="Agents" color="#8B5CF6">
        {agents.map(a => (
          <Stat key={a.id} label={a.name} value={a.state} valueColor={a.color} />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
}

function Stat({ label, value, valueColor = '#e2e8f0' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ color: '#64748b', fontSize: 12 }}>{label}</span>
      <span style={{ color: valueColor, fontSize: 12 }}>{value}</span>
    </div>
  )
}
