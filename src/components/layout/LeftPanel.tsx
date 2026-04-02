import { motion } from 'framer-motion'
import type { AgentView, AgentId } from '../../lib/types'
import AgentCard from '../agents/AgentCard'
import { SUPABASE_CONFIGURED } from '../../lib/supabase'

interface LeftPanelProps {
  agents: AgentView[]
  selectedAgentId: AgentId | null
  onSelectAgent: (id: AgentId) => void
}

export default function LeftPanel({ agents, selectedAgentId, onSelectAgent }: LeftPanelProps) {
  const active = agents.filter((a) => a.status === 'active' || a.status === 'processing').length

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        background: 'rgba(8,12,20,0.8)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          AGENTS
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>{active}</span> working ·{' '}
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{agents.length - active} idle</span>
        </div>
      </div>

      {/* Not configured banner */}
      {!SUPABASE_CONFIGURED && (
        <div
          style={{
            margin: '10px 10px 0',
            padding: '8px 10px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 6,
            fontSize: 11,
            color: 'rgba(245,158,11,0.9)',
            lineHeight: 1.4,
          }}
        >
          Supabase not configured.
          <br />
          Add keys to .env.local to see live agent status.
        </div>
      )}

      {/* Agent list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {agents.map((agent) => (
          <motion.div key={agent.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <AgentCard
              agent={agent}
              selected={selectedAgentId === agent.id}
              onClick={() => onSelectAgent(agent.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
