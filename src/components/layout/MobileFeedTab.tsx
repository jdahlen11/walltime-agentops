import { motion, AnimatePresence } from 'framer-motion'
import { useTelegramFeed } from '../../hooks/useTelegramFeed'
import { AGENTS } from '../../config/agents'
import type { FeedMessage } from '../../lib/types'

export default function MobileFeedTab() {
  const { messages, error, loading, configured } = useTelegramFeed(60)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Live Feed</span>
          {configured && !error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#10B981' }}>Live ({messages.length})</span>
            </div>
          )}
          {error && <span style={{ fontSize: 11, color: '#EF4444' }}>{error}</span>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Connecting to feed...
          </div>
        )}
        {!configured && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Configure VITE_TELEGRAM_BOT_TOKEN in .env.local
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MobileFeedEntry key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        {configured && !loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Awaiting messages...
          </div>
        )}
      </div>
    </div>
  )
}

function MobileFeedEntry({ msg }: { msg: FeedMessage }) {
  const agent = AGENTS.find((a) => a.id === msg.agentId)
  const color = agent?.color ?? 'rgba(255,255,255,0.4)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          marginTop: 5,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color }}>
            {agent?.emoji ?? '💬'} {msg.agentName}
          </span>
          <span
            style={{
              fontSize: 10,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 3,
              padding: '1px 5px',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            #{msg.topicName}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
            {formatAge(msg.timestamp)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {msg.text}
        </div>
      </div>
    </motion.div>
  )
}

function formatAge(ts: number) {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}
