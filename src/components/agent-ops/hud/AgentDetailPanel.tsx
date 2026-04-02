import { motion } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSimStore } from '../hooks/useAgentSimulation'
import { useTypingEffect } from '../hooks/useTypingEffect'
import { AGENTS } from '../data/agentProfiles'
import { WORK_STATES } from '../data/workSimulation'

function rgb(hex: string) { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }

export default function AgentDetailPanel({ agentId }: { agentId: string }) {
  const setSelected = useSimStore(s => s.setSelected)
  const simState = useSimStore(s => s.agentStates[agentId])
  const agent = AGENTS.find(a => a.id === agentId)
  const work = WORK_STATES.find(w => w.agentId === agentId)
  const { displayed, isTyping } = useTypingEffect(work?.liveDraft.fullContent ?? '', 18)

  if (!agent || !work || !simState) return null

  const STATUS_COLOR: Record<string, string> = {
    researching: '#06b6d4', drafting: '#22c55e', reviewing: '#f97316', delivering: '#8b5cf6',
  }

  const statusColor = STATUS_COLOR[work.currentTask.status] ?? '#22c55e'

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
        background: 'rgba(8,10,18,0.96)', borderLeft: `1px solid rgba(${rgb(agent.color)},0.3)`,
        overflowY: 'auto', pointerEvents: 'auto', zIndex: 30,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid rgba(${rgb(agent.color)},0.2)`,
        position: 'sticky', top: 0, background: 'rgba(8,10,18,0.98)', zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{agent.emoji}</span>
            <div>
              <div style={{ color: agent.color, fontFamily: 'monospace', fontSize: 15, fontWeight: 700 }}>{agent.name}</div>
              <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 10 }}>{agent.role} Agent</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: `rgba(${rgb(statusColor)},0.15)`,
              color: statusColor,
              borderRadius: 12, padding: '2px 8px', fontSize: 9, fontFamily: 'monospace',
              border: `1px solid rgba(${rgb(statusColor)},0.4)`,
            }}>
              ● {work.currentTask.status.toUpperCase()}
            </span>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
              color: '#475569', cursor: 'pointer', padding: '4px 6px', pointerEvents: 'auto',
            }}>
              <X size={13} />
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <StatChip label="Model" value={agent.model} />
          <StatChip label="Tokens" value={`${((simState.tokens) / 1000).toFixed(0)}K`} />
          <StatChip label="State" value={simState.state} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Current task */}
        <Section title="CURRENTLY WORKING ON" color={agent.color}>
          <div style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            {work.currentTask.title}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${work.currentTask.progress}%`, height: '100%', background: agent.color, boxShadow: `0 0 4px ${agent.color}`, transition: 'width 0.8s', borderRadius: 2 }} />
          </div>
          <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 9 }}>
            {work.currentTask.progress}% complete
          </div>
        </Section>

        {/* Live draft */}
        <Section title="LIVE DRAFT" color={agent.color}>
          <div style={{ fontFamily: 'monospace', color: agent.color, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
            {work.liveDraft.title}
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '8px 10px', fontFamily: 'monospace', fontSize: 9.5,
            color: '#94a3b8', lineHeight: 1.55, maxHeight: 160, overflowY: 'auto',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {displayed}
            {isTyping && <span style={{ animation: 'blink 1s infinite', borderRight: `2px solid ${agent.color}`, marginLeft: 1 }}>&nbsp;</span>}
          </div>
        </Section>

        {/* Workflow */}
        <Section title="WORKFLOW" color={agent.color}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {work.workflow.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: 9,
                  color: step.status === 'active' ? agent.color : step.status === 'complete' ? '#22c55e' : '#334155',
                }}>
                  {step.agent} <span style={{ color: '#475569' }}>{step.action}</span>
                </span>
                {i < work.workflow.steps.length - 1 && <ArrowRight size={10} color="#334155" />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <StatChip label="Platform" value={work.workflow.destination.platform} />
            <StatChip label="Channel" value={work.workflow.destination.channel} />
          </div>
        </Section>

        {/* Recent output */}
        <Section title="RECENT OUTPUT" color={agent.color}>
          {work.recentOutput.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'flex-start' }}>
              <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10, flex: 1 }}>
                ▸ {item.title}
                <div style={{ color: '#334155', fontSize: 8, marginTop: 1 }}>{item.destination}</div>
              </div>
              <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 9, whiteSpace: 'nowrap', marginLeft: 8 }}>{item.timestamp}</div>
            </div>
          ))}
        </Section>

        {/* Queue */}
        <Section title="QUEUE" color={agent.color}>
          {work.queue.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 10 }}>◦ {item.title}</span>
              <span style={{ color: '#334155', fontFamily: 'monospace', fontSize: 9 }}>{item.schedule}</span>
            </div>
          ))}
        </Section>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </motion.div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, marginBottom: 8, borderBottom: `1px solid rgba(${rgb(color)},0.15)`, paddingBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '3px 7px', fontFamily: 'monospace' }}>
      <div style={{ color: '#334155', fontSize: 7 }}>{label}</div>
      <div style={{ color: '#94a3b8', fontSize: 9 }}>{value}</div>
    </div>
  )
}
