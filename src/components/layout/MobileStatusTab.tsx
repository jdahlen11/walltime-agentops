import { useHardwareTelemetry } from '../../hooks/useHardwareTelemetry'
import { useMissionPriorities } from '../../hooks/useMissionPriorities'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'
import { TELEGRAM_CONFIGURED } from '../../lib/telegram'
import { GITHUB_CONFIGURED } from '../../lib/github'

function progressColor(pct: number): string {
  if (pct > 85) return '#EF4444'
  if (pct > 60) return '#F59E0B'
  return '#10B981'
}

export default function MobileStatusTab() {
  const { snapshot, loading } = useHardwareTelemetry()
  const { priorities } = useMissionPriorities()
  const { rtx, macmini, rtxStale, macminiStale } = snapshot

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 12 }}>
      {/* Connection indicators */}
      <div
        style={{
          background: '#111827',
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
          CONNECTIONS
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <ConnectionDot label="SUPABASE" ok={SUPABASE_CONFIGURED} />
          <ConnectionDot label="TELEGRAM" ok={TELEGRAM_CONFIGURED} />
          <ConnectionDot label="GITHUB" ok={GITHUB_CONFIGURED} />
        </div>
      </div>

      {/* RTX 5090 */}
      <HardwareCard
        title="RTX 5090"
        stale={rtxStale}
        loading={loading}
        empty={!rtx}
      >
        {rtx && (
          <>
            {rtx.gpu_load_pct != null && (
              <ProgressRow label="GPU" value={`${rtx.gpu_load_pct}%`} pct={rtx.gpu_load_pct} suffix={rtx.gpu_temp_c != null ? `${rtx.gpu_temp_c}°C` : undefined} />
            )}
            {rtx.vram_used_gb != null && rtx.vram_total_gb != null && (
              <ProgressRow label="VRAM" value={`${rtx.vram_used_gb.toFixed(1)}/${rtx.vram_total_gb}GB`} pct={(rtx.vram_used_gb / rtx.vram_total_gb) * 100} />
            )}
            {rtx.active_model && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                {rtx.active_model}
                {rtx.tok_per_sec != null && <span style={{ color: '#10B981', marginLeft: 8 }}>{rtx.tok_per_sec.toFixed(1)} tok/s</span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <ServiceDot label="Ollama" status={rtx.ollama_status} />
              <ServiceDot label="LiteLLM" status={rtx.litellm_status} />
            </div>
          </>
        )}
      </HardwareCard>

      {/* Mac Mini M4 */}
      <HardwareCard
        title="Mac Mini M4"
        stale={macminiStale}
        loading={loading}
        empty={!macmini}
      >
        {macmini && (
          <>
            {macmini.cpu_load_pct != null && (
              <ProgressRow label="CPU" value={`${macmini.cpu_load_pct}%`} pct={macmini.cpu_load_pct} />
            )}
            {macmini.mem_used_gb != null && macmini.mem_total_gb != null && (
              <ProgressRow label="MEM" value={`${macmini.mem_used_gb.toFixed(1)}/${macmini.mem_total_gb}GB`} pct={(macmini.mem_used_gb / macmini.mem_total_gb) * 100} />
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <ServiceDot label="GW" status={macmini.gateway_status} />
              <ServiceDot label="VPN" status={macmini.tailscale_connected ? 'online' : macmini.tailscale_connected === false ? 'offline' : null} />
              <ServiceDot label="n8n" status={macmini.n8n_status} />
              <ServiceDot label="Ollama" status={macmini.ollama_status} />
            </div>
            {macmini.cross_machine_ping_ms != null && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                Cross-machine ping: {macmini.cross_machine_ping_ms}ms
              </div>
            )}
          </>
        )}
      </HardwareCard>

      {/* Mission priorities */}
      <div
        style={{
          background: '#111827',
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
          MISSION PRIORITIES
        </div>
        {priorities.map((p) => (
          <div key={p.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.tag && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: p.color, background: p.color + '18', border: `1px solid ${p.color}30`, borderRadius: 2, padding: '1px 4px' }}>
                    {p.tag}
                  </span>
                )}
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{p.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.progress}%</span>
            </div>
            <div style={{ height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.progress}%`, background: p.color, borderRadius: 2, transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HardwareCard({ title, stale, loading, empty, children }: { title: string; stale: boolean; loading: boolean; empty: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#111827',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{title}</span>
        {stale && <span style={{ fontSize: 10, color: '#F59E0B' }}>STALE</span>}
      </div>
      {loading ? (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Connecting...</div>
      ) : empty ? (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Awaiting data</div>
      ) : (
        children
      )}
    </div>
  )
}

function ProgressRow({ label, value, pct, suffix }: { label: string; value: string; pct: number; suffix?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {value}
          {suffix && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{suffix}</span>}
        </span>
      </div>
      <div style={{ height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: progressColor(pct), borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

function ServiceDot({ label, status }: { label: string; status: string | null }) {
  const isOnline = status === 'online'
  const color = status == null ? '#475569' : isOnline ? '#10B981' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          animation: isOnline ? 'pulse-dot 3s infinite' : 'none',
        }}
      />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
    </div>
  )
}

function ConnectionDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ok ? '#10B981' : '#EF4444',
        }}
      />
      <span style={{ fontSize: 12, color: ok ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{label}</span>
    </div>
  )
}
