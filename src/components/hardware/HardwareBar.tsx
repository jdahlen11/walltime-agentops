import type { HardwareSnapshot } from '../../lib/types'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'

interface HardwareBarProps {
  snapshot: HardwareSnapshot
  loading: boolean
}

export default function HardwareBar({ snapshot, loading }: HardwareBarProps) {
  const { rtx, macmini, rtxStale, macminiStale } = snapshot

  if (!SUPABASE_CONFIGURED) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          HARDWARE
        </div>
        <div style={{ fontSize: 11, color: '#F59E0B' }}>Configure Supabase — add VITE_SUPABASE_ANON_KEY to .env.local</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>HARDWARE</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Connecting...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
        HARDWARE
      </div>

      {/* RTX — real columns: gpu_load_pct, gpu_temp_c, vram_used_gb, vram_total_gb, tok_per_sec, active_model */}
      {rtx ? (
        <>
          <MetricGroup label="RTX" stale={rtxStale}>
            {rtx.gpu_load_pct != null && <Metric label="GPU" value={`${rtx.gpu_load_pct}%`} warn={rtx.gpu_load_pct > 85} />}
            {rtx.gpu_temp_c != null && <Metric label="°C" value={String(rtx.gpu_temp_c)} warn={rtx.gpu_temp_c > 80} />}
            {rtx.vram_used_gb != null && rtx.vram_total_gb != null && (
              <Metric label="VRAM" value={`${rtx.vram_used_gb.toFixed(1)}/${rtx.vram_total_gb}GB`} warn={rtx.vram_used_gb / rtx.vram_total_gb > 0.9} />
            )}
            {rtx.tok_per_sec != null && <Metric label="tok/s" value={rtx.tok_per_sec.toFixed(1)} ok={rtx.tok_per_sec > 30} />}
            {rtx.active_model && <Metric label="" value={rtx.active_model} />}
          </MetricGroup>
          <Divider />
        </>
      ) : (
        <NoData label="RTX" />
      )}

      {/* Mac Mini — real columns: cpu_load_pct, mem_used_gb, mem_total_gb, gateway_status, ollama_status, tailscale_connected */}
      {macmini ? (
        <MetricGroup label="MAC" stale={macminiStale}>
          {macmini.cpu_load_pct != null && <Metric label="CPU" value={`${macmini.cpu_load_pct}%`} warn={macmini.cpu_load_pct > 85} />}
          {macmini.mem_used_gb != null && macmini.mem_total_gb != null && (
            <Metric label="MEM" value={`${macmini.mem_used_gb.toFixed(0)}/${macmini.mem_total_gb}GB`} />
          )}
          {macmini.gateway_status != null && (
            <Metric label="GW" value={macmini.gateway_status === 'online' ? '●' : '○'}
              ok={macmini.gateway_status === 'online'} warn={macmini.gateway_status !== 'online'} />
          )}
          {macmini.ollama_status != null && (
            <Metric label="OLLAMA" value={macmini.ollama_status === 'online' ? '●' : '○'}
              ok={macmini.ollama_status === 'online'} warn={macmini.ollama_status !== 'online'} />
          )}
          {macmini.tailscale_connected != null && (
            <Metric label="VPN" value={macmini.tailscale_connected ? '●' : '○'}
              ok={macmini.tailscale_connected} warn={!macmini.tailscale_connected} />
          )}
          {macmini.n8n_status != null && (
            <Metric label="n8n" value={macmini.n8n_status === 'online' ? '●' : '○'}
              ok={macmini.n8n_status === 'online'} warn={macmini.n8n_status !== 'online'} />
          )}
        </MetricGroup>
      ) : (
        <NoData label="Mac Mini" />
      )}
    </div>
  )
}

function MetricGroup({ label, stale, children }: { label: string; stale: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: stale ? '#F59E0B' : 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
        {label}{stale ? ' ⚠' : ''}
      </span>
      {children}
    </div>
  )
}

function Metric({ label, value, warn, ok }: { label: string; value: string; warn?: boolean; ok?: boolean }) {
  const color = warn ? '#F59E0B' : ok ? '#10B981' : 'rgba(255,255,255,0.65)'
  return (
    <span style={{ fontSize: 12, color, display: 'flex', alignItems: 'center', gap: 3 }}>
      {label && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{label}</span>}
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
}

function NoData({ label }: { label: string }) {
  return <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>{label}: awaiting data</span>
}
