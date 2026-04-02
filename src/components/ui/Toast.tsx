import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentView } from '../../lib/types'
import { AGENTS } from '../../config/agents'

interface ToastItem {
  id: string
  message: string
  color: string
  emoji: string
  createdAt: number
}

interface ToastProviderProps {
  agents: AgentView[]
  isMobile: boolean
}

export default function ToastProvider({ agents, isMobile }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const prevStatuses = useRef<Map<string, string>>(new Map())

  const addToast = useCallback((message: string, color: string, emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev.slice(-2), { id, message, color, emoji, createdAt: Date.now() }])
  }, [])

  // Watch for status changes
  useEffect(() => {
    agents.forEach((agent) => {
      const prev = prevStatuses.current.get(agent.id)
      if (prev && prev !== 'active' && agent.status === 'active') {
        const latestCron = agent.recentCrons[0]
        const taskName = latestCron?.job_name ?? 'a task'
        addToast(`${agent.name} is now working on: ${taskName}`, agent.color, agent.emoji)
      }
      prevStatuses.current.set(agent.id, agent.status)
    })
  }, [agents, addToast])

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => Date.now() - t.createdAt < 4000))
    }, 1000)
    return () => clearTimeout(timer)
  }, [toasts])

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? 8 : 60,
        right: isMobile ? 8 : 16,
        left: isMobile ? 8 : 'auto',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: isMobile ? 0 : 40 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              background: '#111827',
              borderLeft: `3px solid ${toast.color}`,
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              minWidth: isMobile ? undefined : 280,
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: 16 }}>{toast.emoji}</span>
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
