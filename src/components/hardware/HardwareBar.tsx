import type { HardwareSnapshot } from '../../lib/types'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'

interface HardwareBarProps {
  snapshot: HardwareSnapshot
  loading: boolean
}

function progressColor(pct: number): string {
  if (pct > 85) return '#EF4444'
  if (pct > 60) return '#F59E0B'
  return '#10B981'
}

export default function HardwareBar({ snapshot, loading }: HardwareBarProps) {
  const { rtx, macmini, rtxStale, macminiStale, lastUpdated } = snapshot

  const dataFresh = lastUpdated
    ? Date.now() - new Date(lastUpdated).getTime() < 60_000
    : false

  if (!SUPABASE_CONFIGURED) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <HardwareHeader fresh={false} />
        <div style={{ fontSize: 11, color: '#F59E0B' }}>Configure Supabase</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HardwareHeader fresh={false} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Connecting...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', width: '100%' }}>
      <HardwareHeader fresh={dataFresh} />

      {/* RTX 5090 card */}
      {rtx ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: rtxStale ? '#F59E0B' : 'rgba(255,255,255,0.6)' }}>
              RTX 5090 {rtxStale && '⚠'}
            </span>
          </div>
          {rtx.gpu_load_pct != null && (
            <ProgressRow label="GPU" value={`${rtx.gpu_load_pct}%`} pct={rtx.gpu_load_pct} suffix={rtx.gpu_temp_c != null ? `${rtx.gpu_temp_c}°C` : undefined} />
          )}
          {rtx.vram_used_gb != null && rtx.vram_total_gb != null && (
            <ProgressRow label="VRAM" value={`${rtx.vram_used_gb.toFixed(1)}/${rtx.vram_total_gb}GB`} pct={(rtx.vram_used_gb / rtx.vram_total_gb) * 100} />
          )}
          {rtx.active_model && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              {rtx.active_model} {rtx.tok_per_sec != null && <span style={{ color: '#10B981' }}>{rtx.tok_per_sec.toFixed(1)} tok/s</span>}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <ServiceDot label="Ollama" status={rtx.ollama_status} />
            <ServiceDot label="LiteLLM" status={rtx.litellm_status} />
          </div>
        </div>
      ) : (
        <NoData label="RTX" />
      )}

      <Divider />

      {/* Mac Mini M4 card */}
      {macmini ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: macminiStale ? '#F59E0B' : 'rgba(255,255,255,0.6)' }}>
              Mac Mini M4 {macminiStale && '⚠'}
            </span>
          </div>
          {macmini.cpu_load_pct != null && (
            <ProgressRow label="CPU" value={`${macmini.cpu_load_pct}%`} pct={macmini.cpu_load_pct} />
          )}
          {macmini.mem_used_gb != null && macmini.mem_total_gb != null && (
            <ProgressRow label="MEM" value={`${macmini.mem_used_gb.toFixed(1)}/${macmini.mem_total_gb}GB`} pct={(macmini.mem_used_gb / macmini.mem_total_gb) * 100} />
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ServiceDot label="GW" status={macmini.gateway_status} />
            <ServiceDot label="VPN" status={macmini.tailscale_connected ? 'online' : macmini.tailscale_connected === false ? 'offline' : null} />
            <ServiceDot label="n8n" status={macmini.n8n_status} />
            <ServiceDot label="Ollama" status={macmini.ollama_status} />
          </div>
          {macmini.cross_machine_ping_ms != null && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              Ping: {macmini.cross_machine_ping_ms}ms
            </div>
          )}
        </div>
      ) : (
        <NoData label="Mac Mini" />
      )}
    </div>
  )
}

function HardwareHeader({ fresh }: { fresh: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
        HARDWARE
      </span>
      {fresh && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 2s infinite' }} />
      )}
    </div>
  )
}

function ProgressRow({ label, value, pct, suffix }: { label: string; value: string; pct: number; suffix?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', width: 32, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden', minWidth: 40 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: progressColor(pct), borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, flexShrink: 0 }}>{value}</span>
      {suffix && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{suffix}</span>}
    </div>
  )
}

function ServiceDot({ label, status }: { label: string; status: string | null }) {
  const isOnline = status === 'online'
  const color = status == null ? '#475569' : isOnline ? '#10B981' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          animation: isOnline ? 'pulse-dot 3s infinite' : 'none',
        }}
      />
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
}

function NoData({ label }: { label: string }) {
  return <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>{label}: awaiting data</span>
}
