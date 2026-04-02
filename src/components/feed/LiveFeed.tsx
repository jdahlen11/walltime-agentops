import { useRef, useEffect, useState } from 'react'
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

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          LIVE FEED
        </div>
        {!configured ? (
          <span style={{ fontSize: 11, color: '#F59E0B' }}>• Configure VITE_TELEGRAM_BOT_TOKEN</span>
        ) : error ? (
          <span style={{ fontSize: 11, color: '#EF4444' }}>• {error}</span>
        ) : loading ? (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>• Connecting...</span>
        ) : (
          <span style={{ fontSize: 11, color: '#10B981' }}>• Live ({filtered.length})</span>
        )}
      </div>

      {/* Ticker */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 2,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
            {!configured ? 'Feed offline — check bot token' : 'Awaiting messages...'}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.slice(0, 20).map((msg) => (
              <FeedPill key={msg.id} msg={msg} onClick={() => onSelectMessage?.(msg)} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function FeedPill({ msg, onClick }: { msg: FeedMessage; onClick: () => void }) {
  const agent = AGENTS.find((a) => a.id === msg.agentId)
  const color = agent?.color ?? 'rgba(255,255,255,0.4)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderLeft: `2px solid ${color}`,
        borderRadius: 6,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: 280,
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
        {agent?.emoji ?? '💬'} {msg.agentName}
      </span>
      <span
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {msg.text.slice(0, 60)}
      </span>
      <span
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          whiteSpace: 'nowrap',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 3,
          padding: '1px 5px',
        }}
      >
        #{msg.topicName}
      </span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
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
