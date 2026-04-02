import { useState, useEffect, useRef } from 'react'
import type { AgentStatusRow } from '../lib/types'
import { supabase, SUPABASE_CONFIGURED, fetchAgentStatuses } from '../lib/supabase'

/** Keep only the latest row per agent_id (rows arrive newest-first from the fetch). */
function deduplicateByAgentId(rows: AgentStatusRow[]): AgentStatusRow[] {
  const seen = new Set<string>()
  return rows.filter((r) => {
    if (seen.has(r.agent_id)) return false
    seen.add(r.agent_id)
    return true
  })
}

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
      // Deduplicate so we hold one row per agent_id (newest wins — fetch is DESC)
      setRows(deduplicateByAgentId(data))
      setLoading(false)
    })

    const channel = supabase
      .channel('ops_agent_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ops_agent_status' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as AgentStatusRow
            setRows((prev) => prev.filter((r) => r.id !== oldRow.id))
            return
          }
          // INSERT or UPDATE — upsert by agent_id so the dot refreshes immediately
          const newRow = payload.new as AgentStatusRow
          setRows((prev) => {
            const idx = prev.findIndex((r) => r.agent_id === newRow.agent_id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = newRow
              return next
            }
            return [...prev, newRow]
          })
        },
      )
      .subscribe((status, err) => {
        if (err) console.error('[useAgentStatus] subscription error', status, err)
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) supabase?.removeChannel(channelRef.current)
    }
  }, [])

  return { rows, loading, configured: SUPABASE_CONFIGURED }
}
