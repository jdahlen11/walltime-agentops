import { Wifi, WifiOff } from 'lucide-react'
import type { AgentView } from '../../lib/types'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'
import { TELEGRAM_CONFIGURED } from '../../lib/telegram'
import { GITHUB_CONFIGURED } from '../../lib/github'

interface HeaderProps {
  agents: AgentView[]
  isMobile: boolean
}

export default function Header({ agents, isMobile }: HeaderProps) {
  const working = agents.filter((a) => a.status === 'active' || a.status === 'processing').length
  const idle = agents.length - working

  if (isMobile) {
    return (
      <header
        style={{
          background: 'rgba(10,14,23,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 12px',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>
          WALLTIME HQ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {agents.map((agent) => (
              <div
                key={agent.id}
                title={`${agent.name}: ${agent.status}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: statusColor(agent.status),
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>{working}</span> working ·{' '}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>{idle} idle</span>
          </span>
        </div>
      </header>
    )
  }

  return (
    <header
      style={{
        background: 'rgba(10,14,23,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px',
        height: 52,
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

      {/* Center — agent status dots + counts */}
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
          <span style={{ color: '#10B981', fontWeight: 600 }}>{working}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}> working · </span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>{idle} idle</span>
        </div>
      </div>

      {/* Right — connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ConnectionBadge label="SUPABASE" ok={SUPABASE_CONFIGURED} />
        <ConnectionBadge label="TELEGRAM" ok={TELEGRAM_CONFIGURED} />
        <ConnectionBadge label="GITHUB" ok={GITHUB_CONFIGURED} />
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
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: ok ? '#10B981' : '#EF4444',
        }}
      />
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
