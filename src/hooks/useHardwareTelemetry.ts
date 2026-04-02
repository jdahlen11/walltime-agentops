import { useState, useEffect, useRef } from 'react'
import type { HardwareTelemetryRow, HardwareSnapshot } from '../lib/types'
import { supabase, SUPABASE_CONFIGURED, fetchLatestTelemetry } from '../lib/supabase'

const STALE_MS = 2 * 60 * 1000

function buildSnapshot(rows: HardwareTelemetryRow[]): HardwareSnapshot {
  // node_id is the real column name (was 'source' in our original schema)
  const rtxRows = rows.filter((r) => r.node_id === 'rtx').sort((a, b) =>
    b.recorded_at.localeCompare(a.recorded_at),
  )
  const macRows = rows.filter((r) => r.node_id === 'macmini' || r.node_id === 'mac_mini').sort((a, b) =>
    b.recorded_at.localeCompare(a.recorded_at),
  )
  const rtx = rtxRows[0] ?? null
  const macmini = macRows[0] ?? null
  const now = Date.now()
  const rtxStale = rtx ? now - new Date(rtx.recorded_at).getTime() > STALE_MS : false
  const macminiStale = macmini ? now - new Date(macmini.recorded_at).getTime() > STALE_MS : false
  const lastUpdated = rtx?.recorded_at ?? macmini?.recorded_at ?? null
  return { rtx, macmini, rtxStale, macminiStale, lastUpdated }
}

export function useHardwareTelemetry() {
  const [rows, setRows] = useState<HardwareTelemetryRow[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) {
      setLoading(false)
      return
    }

    fetchLatestTelemetry().then((data) => {
      setRows(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('ops_hardware_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ops_hardware_telemetry' },
        (payload) => {
          setRows((prev) => [payload.new as HardwareTelemetryRow, ...prev.slice(0, 9)])
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      if (channelRef.current) supabase?.removeChannel(channelRef.current)
    }
  }, [])

  const snapshot = buildSnapshot(rows)
  return { snapshot, loading, configured: SUPABASE_CONFIGURED }
}
