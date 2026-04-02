import type { AgentView, AgentId, FeedMessage, HardwareSnapshot, MissionPriorityRow } from '../../lib/types'
import type { RepoStatus } from '../../lib/types'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import ThreeOffice from '../office/ThreeOffice'

interface DesktopLayoutProps {
  agents: AgentView[]
  selectedAgentId: AgentId | null
  selectedAgent: AgentView | null
  onSelectAgent: (id: AgentId | null) => void
}

export default function DesktopLayout({
  agents,
  selectedAgentId,
  selectedAgent,
  onSelectAgent,
}: DesktopLayoutProps) {
  return (
    <>
      <Header agents={agents} isMobile={false} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
        />
        <ThreeOffice
          agents={agents}
          selectedId={selectedAgentId}
          onSelect={onSelectAgent}
          isMobile={false}
        />
        <RightPanel
          selectedAgent={selectedAgent}
          onDeselect={() => onSelectAgent(null)}
        />
      </div>
      <BottomBar selectedAgentId={selectedAgentId} />
    </>
  )
}
