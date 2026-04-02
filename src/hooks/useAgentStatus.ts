import { useState, useEffect, useRef } from 'react'
import type { AgentStatusRow } from '../lib/types'
import { supabase, SUPABASE_CONFIGURED, fetchAgentStatuses } from '../lib/supabase'

export function useAgentStatus() {
  const [rows, setRows] = useState<AgentStatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setLoading(false)
      return
    }

    fetchAgentStatuses().then((data) => {
      setRows(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('ops_agent_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ops_agent_status' },
        (payload) => {
          const newRow = payload.new as AgentStatusRow
          if (payload.eventType === 'DELETE') {
            setRows((prev) => prev.filter((r) => r.id !== (payload.old as AgentStatusRow).id))
          } else {
            setRows((prev) => {
              // Keyed by agent_id (not id), so we upsert by agent_id
              const idx = prev.findIndex((r) => r.agent_id === newRow.agent_id)
              if (idx >= 0) {
                const next = [...prev]
                next[idx] = newRow
                return next
              }
              return [...prev, newRow]
            })
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) supabase?.removeChannel(channelRef.current)
    }
  }, [])

  return { rows, loading, configured: SUPABASE_CONFIGURED }
}
