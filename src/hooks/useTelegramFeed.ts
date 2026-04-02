import { useState, useEffect, useRef, useCallback } from 'react'
import type { FeedMessage, TelegramMessage } from '../lib/types'
import { fetchTelegramUpdates, TELEGRAM_CONFIGURED } from '../lib/telegram'
import { TOPIC_NAMES, TOPIC_AGENT, AGENTS } from '../config/agents'
import type { AgentId } from '../lib/types'

const POLL_MS = 15_000

function telegramToFeed(msg: TelegramMessage): FeedMessage | null {
  const text = msg.text
  if (!text) return null
  const topicId = msg.message_thread_id ?? null
  const topicName = topicId ? (TOPIC_NAMES[topicId] ?? `Topic ${topicId}`) : 'General'
  const rawAgentId = topicId ? TOPIC_AGENT[topicId] : null
  const agentDef = rawAgentId ? AGENTS.find((a) => a.id === rawAgentId) : null
  const agentId = (agentDef?.id ?? null) as AgentId | null
  return {
    id: `tg-${msg.message_id}`,
    agentId,
    agentName: msg.from?.first_name ?? agentDef?.name ?? 'WallTime',
    topicId,
    topicName,
    text,
    timestamp: msg.date * 1000,
    source: 'telegram',
  }
}

export function useTelegramFeed(maxMessages = 50) {
  const [messages, setMessages] = useState<FeedMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const poll = useCallback(async () => {
    if (!TELEGRAM_CONFIGURED) {
      setError('Add VITE_TELEGRAM_BOT_TOKEN to .env.local')
      setLoading(false)
      return
    }
    try {
      const updates = await fetchTelegramUpdates()
      const feeds = updates.map(telegramToFeed).filter((m): m is FeedMessage => m !== null)
      if (feeds.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const newOnes = feeds.filter((f) => !ids.has(f.id))
          return [...newOnes, ...prev].slice(0, maxMessages)
        })
      }
      setError(null)
    } catch (err) {
      setError('Feed offline — check bot token')
      console.error('[telegram] poll', err)
    }
    setLoading(false)
  }, [maxMessages])

  useEffect(() => {
    poll()
    const schedule = () => {
      timerRef.current = setTimeout(() => { poll().then(schedule) }, POLL_MS)
    }
    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [poll])

  return { messages, error, loading, configured: TELEGRAM_CONFIGURED }
}
