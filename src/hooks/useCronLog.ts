import { useState, useEffect, useRef } from 'react'
import type { CronLogRow } from '../lib/types'
import { supabase, SUPABASE_CONFIGURED, fetchRecentCronLogs } from '../lib/supabase'

export function useCronLog(agentId?: string, limit = 20) {
  const [rows, setRows] = useState<CronLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setLoading(false)
      return
    }

    fetchRecentCronLogs(limit).then((data) => {
      setRows(agentId ? data.filter((r) => r.agent_id === agentId) : data)
      setLoading(false)
    })

    const channel = supabase
      .channel('ops_cron_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ops_cron_log' },
        (payload) => {
          const row = payload.new as CronLogRow
          if (agentId && row.agent_id !== agentId) return
          setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === row.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = row
              return next
            }
            return [row, ...prev].slice(0, limit)
          })
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      if (channelRef.current) supabase?.removeChannel(channelRef.current)
    }
  }, [agentId, limit])

  return { rows, loading, configured: SUPABASE_CONFIGURED }
}
