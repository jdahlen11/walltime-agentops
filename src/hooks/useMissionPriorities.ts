import { useState, useEffect, useRef } from 'react'
import type { MissionPriorityRow } from '../lib/types'
import { supabase, SUPABASE_CONFIGURED, fetchMissionPriorities, updateMissionPriority } from '../lib/supabase'

// Fallback uses real UUIDs won't match, but progress values match what's in the DB
const FALLBACK: MissionPriorityRow[] = [
  { id: 'fallback-cedars', label: 'Cedars Accelerator', progress: 72, color: '#3B82F6', tag: 'P0', sort_order: 1, updated_at: '' },
  { id: 'fallback-eso',    label: 'ESO Integration',    progress: 45, color: '#10B981', tag: 'P0', sort_order: 2, updated_at: '' },
  { id: 'fallback-safe',   label: '$500K SAFE',          progress: 30, color: '#F59E0B', tag: 'P1', sort_order: 3, updated_at: '' },
  { id: 'fallback-rls',    label: 'RLS Compliance',      progress: 95, color: '#8B5CF6', tag: 'P1', sort_order: 4, updated_at: '' },
]

export function useMissionPriorities() {
  const [priorities, setPriorities] = useState<MissionPriorityRow[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setLoading(false)
      return
    }

    fetchMissionPriorities().then((data) => {
      if (data.length > 0) setPriorities(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('ops_mission_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ops_mission_priorities' },
        (payload) => {
          const row = payload.new as MissionPriorityRow
          setPriorities((prev) => {
            const idx = prev.findIndex((r) => r.id === row.id)
            if (idx >= 0) { const next = [...prev]; next[idx] = row; return next }
            return [...prev, row]
          })
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      if (channelRef.current) supabase?.removeChannel(channelRef.current)
    }
  }, [])

  const update = async (id: string, progress: number) => {
    // Optimistic update
    setPriorities((prev) => prev.map((p) => p.id === id ? { ...p, progress } : p))
    await updateMissionPriority(id, progress)
  }

  return { priorities, loading, update, configured: SUPABASE_CONFIGURED }
}
