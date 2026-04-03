import { useState } from 'react'
import type { AgentView, AgentId } from '../../lib/types'
import Header from './Header'
import BottomTabs from './BottomTabs'
import type { TabId } from './BottomTabs'
import ThreeOffice from '../office/ThreeOffice'
import AgentCard from '../agents/AgentCard'
import AgentBottomSheet from '../mobile/AgentBottomSheet'
import MobileStatusTab from './MobileStatusTab'
import MobileFeedTab from './MobileFeedTab'

interface MobileLayoutProps {
  agents: AgentView[]
  selectedAgentId: AgentId | null
  selectedAgent: AgentView | null
  onSelectAgent: (id: AgentId | null) => void
}

export default function MobileLayout({
  agents,
  selectedAgentId,
  selectedAgent,
  onSelectAgent,
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('hq')
  const [sheetAgent, setSheetAgent] = useState<AgentView | null>(null)

  const handleAgentTap = (agent: AgentView) => {
    setSheetAgent(agent)
    onSelectAgent(agent.id)
  }

  return (
    <>
      <Header agents={agents} isMobile={true} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* HQ Tab */}
        {activeTab === 'hq' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ThreeOffice
              agents={agents}
              selectedId={selectedAgentId}
              onSelect={onSelectAgent}
              isMobile={true}
            />
            {/* Floating agent pills */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {agents.map((a) => {
                const isActive = a.status === 'active' || a.status === 'processing'
                const briefTask = isActive && a.recentCrons[0]
                  ? a.recentCrons[0].job_name
                  : null
                return (
                  <div
                    key={a.id}
                    style={{
                      background: isActive
                        ? 'rgba(10,14,23,0.92)'
                        : 'rgba(10,14,23,0.85)',
                      border: `1px solid ${isActive ? a.color + '60' : a.color + '40'}`,
                      borderRadius: 16,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      pointerEvents: 'auto',
                      backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => handleAgentTap(a)}
                  >
                    <div
                      className={a.status === 'active' ? 'pulse-dot-active' : ''}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background:
                          a.status === 'active' ? '#10B981'
                          : a.status === 'error' ? '#EF4444'
                          : '#F59E0B',
                      }}
                    />
                    <span>{a.emoji}</span>
                    <span style={{ fontWeight: 600 }}>{a.name}</span>
                    {briefTask && (
                      <span style={{
                        color: a.color,
                        fontSize: 9,
                        fontWeight: 500,
                        maxWidth: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {briefTask}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Simplified bottom stats */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                background: 'rgba(10,14,23,0.85)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                zIndex: 10,
              }}
            >
              <span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>
                  {agents.filter((a) => a.status === 'active').length}
                </span>{' '}
                working
              </span>
              <span>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                  {agents.filter((a) => a.status === 'idle').length}
                </span>{' '}
                idle
              </span>
              <span>
                <span style={{ fontWeight: 700 }}>{agents.length}</span> agents
              </span>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedAgentId === agent.id}
                onClick={() => handleAgentTap(agent)}
              />
            ))}
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && <MobileStatusTab />}

        {/* Feed Tab */}
        {activeTab === 'feed' && <MobileFeedTab />}
      </div>

      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Agent bottom sheet */}
      <AgentBottomSheet
        agent={sheetAgent}
        onClose={() => {
          setSheetAgent(null)
          onSelectAgent(null)
        }}
      />
    </>
  )
}
