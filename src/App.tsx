import { useState, useMemo, useEffect } from 'react'
import type { AgentId, AgentView, DispatchLogRow } from './lib/types'
import { AGENTS } from './config/agents'
import { useAgentStatus } from './hooks/useAgentStatus'
import { useCronLog } from './hooks/useCronLog'
import { fetchDispatchLog } from './lib/supabase'

import DesktopLayout from './components/layout/DesktopLayout'
import MobileLayout from './components/layout/MobileLayout'
import ToastProvider from './components/ui/Toast'

export default function App() {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null)
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogRow[]>([])
  const { rows: agentStatuses } = useAgentStatus()
  const { rows: cronLogs } = useCronLog()

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    fetchDispatchLog(undefined, 50).then(setDispatchLogs)
  }, [])

  // Merge static definitions with live Supabase status
  const agents: AgentView[] = useMemo(() => {
    return AGENTS.map((def) => {
      const live = agentStatuses.find((r) => r.agent_id === def.id)
      const agentCrons = cronLogs.filter((r) => r.agent_id === def.id).slice(0, 5)
      const agentDispatches = dispatchLogs.filter((r) => r.to_agent === def.id).slice(0, 5)
      const latestCron = agentCrons[0]
      const currentTask = latestCron?.output_preview ?? null

      return {
        ...def,
        status: live?.status ?? 'idle',
        currentTask,
        currentTopic: null,
        model: 'grok-4-1-fast',
        tokensUsed: live?.token_count_session ?? 0,
        lastActionAt: live?.last_action ?? null,
        recentCrons: agentCrons,
        pendingDispatches: agentDispatches,
      }
    })
  }, [agentStatuses, cronLogs, dispatchLogs])

  const selectedAgent = selectedAgentId
    ? (agents.find((a) => a.id === selectedAgentId) ?? null)
    : null

  const handleSelectAgent = (id: AgentId | null) => {
    if (id === null) {
      setSelectedAgentId(null)
    } else {
      setSelectedAgentId((prev) => (prev === id ? null : id))
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0E17',
        color: 'rgba(255,255,255,0.87)',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {isMobile ? (
        <MobileLayout
          agents={agents}
          selectedAgentId={selectedAgentId}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
        />
      ) : (
        <DesktopLayout
          agents={agents}
          selectedAgentId={selectedAgentId}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
        />
      )}
      <ToastProvider agents={agents} isMobile={isMobile} />
    </div>
  )
}
