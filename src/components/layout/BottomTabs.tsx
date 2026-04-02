import { motion } from 'framer-motion'

type TabId = 'hq' | 'agents' | 'status' | 'feed'

interface BottomTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'hq', label: 'HQ', icon: '🏢' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'status', label: 'Status', icon: '📊' },
  { id: 'feed', label: 'Feed', icon: '💬' },
]

export default function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  return (
    <nav
      className="safe-bottom"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 56,
        background: 'rgba(10,14,23,0.98)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </span>
            {active && (
              <motion.div
                layoutId="tab-indicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  borderRadius: 1,
                  background: '#3B82F6',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export type { TabId }
