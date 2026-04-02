import { useHardwareStore } from '../store/hardwareStore';

function TelemetryBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.round(value * 100)}%`,
            background: color,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right shrink-0">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function Badge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        background: ok ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        color: ok ? '#22c55e' : '#ef4444',
        border: `1px solid ${ok ? '#22c55e40' : '#ef444440'}`,
      }}
    >
      {label}
    </span>
  );
}

export function HardwareTelemetry() {
  const rtx = useHardwareStore(s => s.rtx);
  const mac = useHardwareStore(s => s.mac);

  return (
    <div className="flex flex-col gap-2">
      {/* RTX 5090 */}
      <div
        className="rounded-lg p-3"
        style={{
          background: 'rgba(10, 14, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white">RTX 5090</span>
          <span className="text-xs text-slate-400">GPU Inference</span>
        </div>

        <div className="flex flex-col gap-1.5 mb-2">
          <TelemetryBar value={rtx.vramUsage} color="#10B981" label="VRAM" />
          <TelemetryBar value={rtx.gpuLoad} color="#10B981" label="GPU" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-sm font-bold font-mono" style={{ color: '#10B981' }}>
              {rtx.tokensPerSec.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">tok/s</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold font-mono text-slate-300">{Math.round(rtx.temp)}°C</div>
            <div className="text-xs text-slate-500">temp</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold font-mono text-slate-300">{Math.round(rtx.pingMs)}ms</div>
            <div className="text-xs text-slate-500">ping</div>
          </div>
        </div>

        <div className="mt-2 text-xs font-mono text-slate-500">{rtx.activeModel}</div>
      </div>

      {/* Mac Mini M4 */}
      <div
        className="rounded-lg p-3"
        style={{
          background: 'rgba(10, 14, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white">Mac Mini M4</span>
          <span className="text-xs text-slate-400">Orchestration</span>
        </div>

        <div className="flex flex-col gap-1.5 mb-2">
          <TelemetryBar value={mac.cpuUsage} color="#06B6D4" label="CPU" />
          <TelemetryBar value={mac.memUsage} color="#06B6D4" label="Mem" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-sm font-bold font-mono" style={{ color: '#06B6D4' }}>{mac.cronJobs}</div>
            <div className="text-xs text-slate-500">crons</div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge label="Gateway: Online" ok={mac.gatewayOnline} />
            <Badge label="Tailscale: Active" ok={mac.tailscaleConnected} />
          </div>
        </div>
      </div>
    </div>
  );
}
