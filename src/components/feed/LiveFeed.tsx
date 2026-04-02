import { motion, AnimatePresence } from 'framer-motion'
import type { FeedMessage, AgentId } from '../../lib/types'
import { useTelegramFeed } from '../../hooks/useTelegramFeed'
import { AGENTS } from '../../config/agents'

interface LiveFeedProps {
  onSelectMessage?: (msg: FeedMessage) => void
  filterAgentId?: AgentId | null
}

export default function LiveFeed({ onSelectMessage, filterAgentId }: LiveFeedProps) {
  const { messages, error, loading, configured } = useTelegramFeed(60)
  const filtered = filterAgentId
    ? messages.filter((m) => m.agentId === filterAgentId)
    : messages

  const display = filtered.slice(0, 15)

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexShrink: 0 }}>
        {!configured ? (
          <span style={{ fontSize: 11, color: '#F59E0B' }}>FEED · Configure bot token</span>
        ) : error ? (
          <span style={{ fontSize: 11, color: '#EF4444' }}>FEED · {error}</span>
        ) : loading ? (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>FEED · Connecting...</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
              LIVE ({display.length})
            </span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 2s infinite' }} />
          </div>
        )}
      </div>

      {/* Vertical scrollable list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {display.length === 0 ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            {!configured ? 'Feed offline' : 'Awaiting messages...'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {display.map((msg) => (
              <FeedEntry key={msg.id} msg={msg} onClick={() => onSelectMessage?.(msg)} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function FeedEntry({ msg, onClick }: { msg: FeedMessage; onClick: () => void }) {
  const agent = AGENTS.find((a) => a.id === msg.agentId)
  const color = agent?.color ?? 'rgba(255,255,255,0.4)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      style={{
        padding: '4px 0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          marginTop: 4,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {msg.text.slice(0, 80)}
        </span>
      </div>
      <span
        style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          whiteSpace: 'nowrap',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 3,
          padding: '0px 4px',
          flexShrink: 0,
        }}
      >
        #{msg.topicName}
      </span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {formatAge(msg.timestamp)}
      </span>
    </motion.div>
  )
}

function formatAge(ts: number) {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h`
}
