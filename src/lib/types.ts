// ─────────────────────────────────────────────────────────────
// WallTime AgentOps — TypeScript interfaces
// Column names match the REAL Supabase schema (introspected 2026-04-02)
// ─────────────────────────────────────────────────────────────

export type AgentId = 'scout' | 'engineer' | 'command' | 'capital' | 'content' | 'analyst'

export type AgentStatus = 'active' | 'processing' | 'idle' | 'error'
export type DispatchStatus = 'dispatched' | 'working' | 'done' | 'error'
export type DeployStatus = 'pending' | 'building' | 'ready' | 'error'
export type CronStatus = 'running' | 'success' | 'error'

// ── ops_agent_status ────────────────────────────────────────
// id: uuid PK, agent_id: 'scout' etc.

export interface AgentStatusRow {
  id: string                      // uuid
  agent_id: string                // 'scout' | 'engineer' | ...
  status: AgentStatus
  last_action: string | null      // timestamptz
  last_output_topic: string | null
  token_count_session: number
  last_cron_run: string | null
  last_cron_success: boolean | null
  error_message: string | null
  recorded_at: string
}

// ── ops_hardware_telemetry ──────────────────────────────────

export interface HardwareTelemetryRow {
  id: string                      // uuid
  node_id: string                 // 'rtx' | 'macmini'
  gpu_load_pct: number | null
  gpu_temp_c: number | null
  vram_used_gb: number | null
  vram_total_gb: number | null
  tok_per_sec: number | null
  active_model: string | null
  cpu_load_pct: number | null
  mem_used_gb: number | null
  mem_total_gb: number | null
  ollama_status: string | null    // 'online' | 'offline' | null
  litellm_status: string | null
  tailscale_connected: boolean | null
  gateway_status: string | null   // 'online' | 'offline' | null
  n8n_status: string | null
  cross_machine_ping_ms: number | null
  recorded_at: string
}

// ── ops_cron_log ────────────────────────────────────────────

export interface CronLogRow {
  id: string                      // uuid
  job_name: string
  agent_id: string | null
  telegram_topic_id: number | null
  status: CronStatus
  duration_ms: number | null
  tokens_used: number | null
  error_message: string | null
  output_preview: string | null
  executed_at: string
}

// ── ops_dispatch_log ────────────────────────────────────────

export interface DispatchLogRow {
  id: string                      // uuid
  from_source: string | null
  to_agent: string                // agent id
  task_description: string
  priority: string | null
  status: DispatchStatus
  telegram_topic_id: number | null
  result_preview: string | null
  dispatched_at: string
  completed_at: string | null
}

// ── ops_deploy_log ──────────────────────────────────────────

export interface DeployLogRow {
  id: string
  project: string
  git_sha: string | null
  git_branch: string | null
  commit_message: string | null
  vercel_deployment_id: string | null
  status: DeployStatus
  deploy_url: string | null
  triggered_by: string | null
  started_at: string
  completed_at: string | null
}

// ── ops_mission_priorities ──────────────────────────────────

export interface MissionPriorityRow {
  id: string                      // uuid
  label: string
  progress: number                // 0–100 (column is named 'progress' not 'pct')
  color: string
  tag: string | null              // 'P0' | 'P1' | null
  sort_order: number | null
  updated_at: string
}

// ── Telegram types ──────────────────────────────────────────

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

export interface TelegramChat {
  id: number
  type: string
  title?: string
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  message_thread_id?: number
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

export interface TelegramGetUpdatesResponse {
  ok: boolean
  result: TelegramUpdate[]
  description?: string
}

// ── Feed message (unified) ───────────────────────────────────

export interface FeedMessage {
  id: string
  agentId: AgentId | null
  agentName: string
  topicId: number | null
  topicName: string
  text: string
  timestamp: number               // unix ms
  source: 'telegram' | 'cron' | 'dispatch'
}

// ── GitHub types ────────────────────────────────────────────

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { name: string; date: string }
  }
  html_url: string
}

export interface GitHubPR {
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  user: { login: string }
}

export interface GitHubRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
}

export interface RepoStatus {
  repo: string
  lastCommit: GitHubCommit | null
  openPRs: GitHubPR[]
  lastRun: GitHubRun | null
  error: string | null
}

// ── Hardware snapshot ────────────────────────────────────────

export interface HardwareSnapshot {
  rtx: HardwareTelemetryRow | null
  macmini: HardwareTelemetryRow | null
  rtxStale: boolean
  macminiStale: boolean
  lastUpdated: string | null
}

// ── Agent config (static) ────────────────────────────────────

export interface AgentDefinition {
  id: AgentId
  name: string
  role: string
  emoji: string
  color: string
  telegramTopics: readonly number[]
  description: string
}

// ── Merged agent view ────────────────────────────────────────

export interface AgentView extends AgentDefinition {
  status: AgentStatus
  currentTask: string | null
  currentTopic: number | null
  model: string
  tokensUsed: number
  lastActionAt: string | null
  recentCrons: CronLogRow[]
  pendingDispatches: DispatchLogRow[]
}

// ── Dispatch input ────────────────────────────────────────────

export interface DispatchInput {
  agentId: AgentId
  taskText: string
}
