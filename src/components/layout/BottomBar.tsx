import type { AgentId } from '../../lib/types'
import { useHardwareTelemetry } from '../../hooks/useHardwareTelemetry'
import { useMissionPriorities } from '../../hooks/useMissionPriorities'
import MissionPriorities from '../hardware/MissionPriorities'
import HardwareBar from '../hardware/HardwareBar'
import LiveFeed from '../feed/LiveFeed'

interface BottomBarProps {
  selectedAgentId: AgentId | null
}

export default function BottomBar({ selectedAgentId }: BottomBarProps) {
  const { snapshot, loading: hwLoading } = useHardwareTelemetry()
  const { priorities, update } = useMissionPriorities()

  return (
    <div
      style={{
        height: 84,
        flexShrink: 0,
        background: 'rgba(8,12,20,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
      }}
    >
      {/* Mission priorities */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 14px',
          overflow: 'hidden',
        }}
      >
        <MissionPriorities priorities={priorities} onUpdate={update} />
      </div>

      {/* Hardware stats */}
      <div
        style={{
          flex: 1,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <HardwareBar snapshot={snapshot} loading={hwLoading} />
      </div>

      {/* Live feed */}
      <div
        style={{
          width: 420,
          flexShrink: 0,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <LiveFeed filterAgentId={selectedAgentId} />
      </div>
    </div>
  )
}
