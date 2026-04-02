import { useState, useMemo, useEffect } from 'react'
import type { AgentId, AgentView, DispatchLogRow } from './lib/types'
import { AGENTS } from './config/agents'
import { useAgentStatus } from './hooks/useAgentStatus'
import { useCronLog } from './hooks/useCronLog'
import { fetchDispatchLog } from './lib/supabase'

import Header from './components/layout/Header'
import LeftPanel from './components/layout/LeftPanel'
import RightPanel from './components/layout/RightPanel'
import BottomBar from './components/layout/BottomBar'
import ThreeOffice from './components/office/ThreeOffice'

export default function App() {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null)
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogRow[]>([])
  const { rows: agentStatuses } = useAgentStatus()
  const { rows: cronLogs } = useCronLog()

  useEffect(() => {
    fetchDispatchLog(undefined, 50).then(setDispatchLogs)
  }, [])

  // Merge static definitions with live Supabase status
  // Real schema: agent_id is the identifier (not 'id')
  const agents: AgentView[] = useMemo(() => {
    return AGENTS.map((def) => {
      const live = agentStatuses.find((r) => r.agent_id === def.id)
      const agentCrons = cronLogs.filter((r) => r.agent_id === def.id).slice(0, 5)
      // dispatch table uses 'to_agent' for the agent identifier
      const agentDispatches = dispatchLogs.filter((r) => r.to_agent === def.id).slice(0, 5)

      // Derive current task from most recent cron output_preview
      const latestCron = agentCrons[0]
      const currentTask = latestCron?.output_preview ?? null

      return {
        ...def,
        status: live?.status ?? 'idle',
        currentTask,
        currentTopic: null,             // not in real schema — derived if needed
        model: 'grok-4-1-fast',         // not stored in real schema
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
      <Header agents={agents} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
        />

        <ThreeOffice
          agents={agents}
          selectedId={selectedAgentId}
          onSelect={handleSelectAgent}
        />

        <RightPanel
          selectedAgent={selectedAgent}
          onDeselect={() => setSelectedAgentId(null)}
        />
      </div>

      <BottomBar selectedAgentId={selectedAgentId} />
    </div>
  )
}
