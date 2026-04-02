import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentView } from '../../lib/types'
import AgentDetail from '../agents/AgentDetail'
import { useDeployStatus } from '../../hooks/useDeployStatus'
import { ExternalLink, GitBranch, Activity, AlertTriangle } from 'lucide-react'

interface RightPanelProps {
  selectedAgent: AgentView | null
  onDeselect: () => void
}

export default function RightPanel({ selectedAgent, onDeselect }: RightPanelProps) {
  const { statuses } = useDeployStatus()

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        background: 'rgba(8,12,20,0.8)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <motion.div
            key={selectedAgent.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Error boundary prevents a render crash from blanking the whole panel */}
            <AgentDetailBoundary agentName={selectedAgent.name} onClose={onDeselect}>
              <AgentDetail agent={selectedAgent} onClose={onDeselect} />
            </AgentDetailBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                DEPLOYMENT
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {statuses.map((s) => (
                <div
                  key={s.repo}
                  style={{ marginBottom: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <GitBranch size={14} color="rgba(255,255,255,0.4)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{s.repo}</span>
                  </div>
                  {s.error ? (
                    <div style={{ fontSize: 12, color: '#F59E0B' }}>{s.error}</div>
                  ) : (
                    <>
                      {s.lastCommit && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Last commit</div>
                          <a href={s.lastCommit.html_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {s.lastCommit.commit.message.slice(0, 60)}
                            <ExternalLink size={10} />
                          </a>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            {s.lastCommit.commit.author.name} · {formatDate(s.lastCommit.commit.author.date)}
                          </div>
                        </div>
                      )}
                      {s.lastRun && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Activity size={12} color={runColor(s.lastRun.conclusion)} />
                          <span style={{ fontSize: 12, color: runColor(s.lastRun.conclusion) }}>
                            {s.lastRun.name}: {s.lastRun.conclusion ?? s.lastRun.status}
                          </span>
                        </div>
                      )}
                      {s.openPRs.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                            {s.openPRs.length} open PR{s.openPRs.length > 1 ? 's' : ''}
                          </div>
                          {s.openPRs.slice(0, 2).map((pr) => (
                            <a key={pr.number} href={pr.html_url} target="_blank" rel="noopener" style={{ display: 'block', fontSize: 12, color: '#10B981', textDecoration: 'none', marginBottom: 2 }}>
                              #{pr.number} {pr.title.slice(0, 45)}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
                Click an agent to inspect
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Error boundary — surfaces crashes instead of blanking the panel ──

interface BoundaryProps {
  agentName: string
  onClose: () => void
  children: ReactNode
}

interface BoundaryState {
  error: Error | null
}

class AgentDetailBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AgentDetail crash]', error, info.componentStack)
  }

  componentDidUpdate(prev: BoundaryProps) {
    // Reset when a different agent is selected
    if (prev.agentName !== this.props.agentName && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
          <AlertTriangle size={28} color="#EF4444" />
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            Panel crashed for {this.props.agentName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', maxWidth: 260, textAlign: 'center', wordBreak: 'break-word' }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => { this.setState({ error: null }); this.props.onClose() }}
            style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, color: '#EF4444', cursor: 'pointer', fontSize: 12 }}
          >
            Dismiss
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function runColor(conclusion: string | null) {
  switch (conclusion) {
    case 'success': return '#10B981'
    case 'failure': return '#EF4444'
    case null: return '#F59E0B'
    default: return 'rgba(255,255,255,0.4)'
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch { return iso }
}
