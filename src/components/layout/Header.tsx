import { Wifi, WifiOff } from 'lucide-react'
import type { AgentView } from '../../lib/types'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'
import { TELEGRAM_CONFIGURED } from '../../lib/telegram'
import { GITHUB_CONFIGURED } from '../../lib/github'

interface HeaderProps {
  agents: AgentView[]
}

export default function Header({ agents }: HeaderProps) {
  const online = agents.filter((a) => a.status === 'active' || a.status === 'processing').length
  const allConfigured = SUPABASE_CONFIGURED && TELEGRAM_CONFIGURED && GITHUB_CONFIGURED

  return (
    <header
      style={{
        background: 'rgba(10,14,23,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Left — branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.04em' }}>
            APOT SOLUTIONS
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            WALLTIME HQ · OPERATIONS CENTER
          </div>
        </div>
      </div>

      {/* Center — agent status dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              title={`${agent.name}: ${agent.status}`}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: statusColor(agent.status),
                boxShadow: agent.status === 'active' ? `0 0 6px ${agent.color}` : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>{online}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}> / {agents.length} ONLINE</span>
        </div>
      </div>

      {/* Right — connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ConnectionBadge label="SUPABASE" ok={SUPABASE_CONFIGURED} />
        <ConnectionBadge label="TELEGRAM" ok={TELEGRAM_CONFIGURED} />
        <ConnectionBadge label="GITHUB" ok={GITHUB_CONFIGURED} />
        {!allConfigured && (
          <div
            style={{
              fontSize: 11,
              color: '#F59E0B',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            Configure .env.local
          </div>
        )}
      </div>
    </header>
  )
}

function ConnectionBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        color: ok ? '#10B981' : 'rgba(255,255,255,0.3)',
      }}
    >
      {ok ? <Wifi size={12} /> : <WifiOff size={12} />}
      {label}
    </div>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return '#10B981'
    case 'processing': return '#F59E0B'
    case 'error': return '#EF4444'
    default: return 'rgba(255,255,255,0.2)'
  }
}
