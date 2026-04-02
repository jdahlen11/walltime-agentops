import { createClient } from '@supabase/supabase-js'
import type {
  AgentStatusRow,
  HardwareTelemetryRow,
  CronLogRow,
  DispatchLogRow,
  MissionPriorityRow,
} from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const SUPABASE_CONFIGURED = Boolean(url && key)

export const supabase = SUPABASE_CONFIGURED
  ? createClient(url!, key!)
  : null

// ── Fetch helpers (column names match real schema) ──────────

export async function fetchAgentStatuses(): Promise<AgentStatusRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ops_agent_status')
    .select('*')
    .order('recorded_at', { ascending: false })
  if (error) { console.error('[supabase] fetchAgentStatuses', error); return [] }
  return (data ?? []) as AgentStatusRow[]
}

export async function fetchLatestTelemetry(): Promise<HardwareTelemetryRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ops_hardware_telemetry')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(10)
  if (error) { console.error('[supabase] fetchLatestTelemetry', error); return [] }
  return (data ?? []) as HardwareTelemetryRow[]
}

export async function fetchRecentCronLogs(limit = 20): Promise<CronLogRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ops_cron_log')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('[supabase] fetchRecentCronLogs', error); return [] }
  return (data ?? []) as CronLogRow[]
}

export async function fetchDispatchLog(agentId?: string, limit = 20): Promise<DispatchLogRow[]> {
  if (!supabase) return []
  let q = supabase
    .from('ops_dispatch_log')
    .select('*')
    .order('dispatched_at', { ascending: false })
    .limit(limit)
  if (agentId) q = q.eq('to_agent', agentId)
  const { data, error } = await q
  if (error) { console.error('[supabase] fetchDispatchLog', error); return [] }
  return (data ?? []) as DispatchLogRow[]
}

export async function fetchMissionPriorities(): Promise<MissionPriorityRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ops_mission_priorities')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[supabase] fetchMissionPriorities', error); return [] }
  return (data ?? []) as MissionPriorityRow[]
}

export async function insertDispatch(
  agentId: string,
  taskText: string,
): Promise<DispatchLogRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('ops_dispatch_log')
    .insert({
      to_agent: agentId,
      task_description: taskText,
      from_source: 'dashboard',
      status: 'dispatched',
    })
    .select()
    .single()
  if (error) { console.error('[supabase] insertDispatch', error); return null }
  return data as DispatchLogRow
}

export async function updateMissionPriority(id: string, progress: number): Promise<void> {
  if (!supabase) return
  await supabase
    .from('ops_mission_priorities')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', id)
}
