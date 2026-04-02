import { useState, useCallback } from 'react'
import type { AgentId } from '../lib/types'
import { dispatchToAgent, TELEGRAM_CONFIGURED } from '../lib/telegram'
import { insertDispatch } from '../lib/supabase'

interface DispatchState {
  sending: boolean
  lastError: string | null
  lastMessageId: number | null
}

export function useDispatch() {
  const [state, setState] = useState<DispatchState>({
    sending: false,
    lastError: null,
    lastMessageId: null,
  })

  const dispatch = useCallback(async (agentId: AgentId, taskText: string): Promise<boolean> => {
    if (!TELEGRAM_CONFIGURED) {
      setState((s) => ({ ...s, lastError: 'Telegram not configured — add VITE_TELEGRAM_BOT_TOKEN' }))
      return false
    }
    setState({ sending: true, lastError: null, lastMessageId: null })
    try {
      const msgId = await dispatchToAgent(agentId, taskText)
      await insertDispatch(agentId, taskText)
      setState({ sending: false, lastError: null, lastMessageId: msgId })
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Dispatch failed'
      setState({ sending: false, lastError: msg, lastMessageId: null })
      return false
    }
  }, [])

  return { ...state, dispatch, configured: TELEGRAM_CONFIGURED }
}
