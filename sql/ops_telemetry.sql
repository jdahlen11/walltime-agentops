-- WallTime AgentOps — Supabase schema
-- Run this in Supabase SQL Editor: https://hwpddduxstbbuearifih.supabase.co

-- Hardware telemetry from RTX + Mac Mini
create table if not exists ops_hardware_telemetry (
  id bigserial primary key,
  recorded_at timestamptz default now(),
  source text not null, -- 'rtx' | 'macmini'
  gpu_utilization int,       -- 0-100
  gpu_temp_c int,
  vram_used_gb float,
  vram_total_gb float,
  tokens_per_sec float,
  cpu_utilization int,       -- 0-100
  memory_used_gb float,
  memory_total_gb float,
  gateway_online boolean,
  ollama_online boolean,
  tailscale_online boolean,
  active_model text,
  extra jsonb
);

alter table ops_hardware_telemetry enable row level security;
create policy "anon read" on ops_hardware_telemetry for select using (true);
create policy "anon insert" on ops_hardware_telemetry for insert with check (true);

-- Agent status — one row per agent, upserted on change
create table if not exists ops_agent_status (
  id text primary key, -- agent id: scout, engineer, command, capital, content, analyst
  updated_at timestamptz default now(),
  status text not null default 'idle', -- 'active' | 'processing' | 'idle' | 'error'
  current_task text,
  current_topic int,
  model text default 'grok-4-1-fast',
  tokens_used int default 0,
  last_action_at timestamptz
);

alter table ops_agent_status enable row level security;
create policy "anon read" on ops_agent_status for select using (true);
create policy "anon upsert" on ops_agent_status for all using (true);

-- Cron job execution log
create table if not exists ops_cron_log (
  id bigserial primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  agent_id text,
  job_name text not null,
  topic_id int,
  status text not null default 'running', -- 'running' | 'success' | 'error'
  duration_ms int,
  output_preview text,
  error_msg text
);

alter table ops_cron_log enable row level security;
create policy "anon read" on ops_cron_log for select using (true);
create policy "anon insert" on ops_cron_log for insert with check (true);
create policy "anon update" on ops_cron_log for update using (true);

-- Dispatch log — tasks sent to agents
create table if not exists ops_dispatch_log (
  id bigserial primary key,
  dispatched_at timestamptz default now(),
  resolved_at timestamptz,
  agent_id text not null,
  task_text text not null,
  telegram_message_id bigint,
  status text not null default 'dispatched', -- 'dispatched' | 'working' | 'done' | 'error'
  result_preview text
);

alter table ops_dispatch_log enable row level security;
create policy "anon read" on ops_dispatch_log for select using (true);
create policy "anon insert" on ops_dispatch_log for insert with check (true);
create policy "anon update" on ops_dispatch_log for update using (true);

-- Deploy log
create table if not exists ops_deploy_log (
  id bigserial primary key,
  deployed_at timestamptz default now(),
  repo text not null,
  branch text,
  commit_sha text,
  commit_msg text,
  status text not null default 'pending', -- 'pending' | 'building' | 'ready' | 'error'
  vercel_url text,
  deploy_duration_ms int
);

alter table ops_deploy_log enable row level security;
create policy "anon read" on ops_deploy_log for select using (true);
create policy "anon insert" on ops_deploy_log for insert with check (true);

-- Mission priorities
create table if not exists ops_mission_priorities (
  id text primary key,
  label text not null,
  pct int not null default 0 check (pct >= 0 and pct <= 100),
  color text not null default '#3B82F6',
  updated_at timestamptz default now()
);

alter table ops_mission_priorities enable row level security;
create policy "anon read" on ops_mission_priorities for select using (true);
create policy "anon upsert" on ops_mission_priorities for all using (true);

-- Seed mission priorities
insert into ops_mission_priorities (id, label, pct, color) values
  ('cedars', 'Cedars Accelerator', 72, '#3B82F6'),
  ('eso', 'ESO Integration', 45, '#10B981'),
  ('safe', '$500K SAFE', 30, '#F59E0B'),
  ('rls', 'RLS Compliance', 95, '#8B5CF6')
on conflict (id) do nothing;

-- Enable realtime for all ops tables
alter publication supabase_realtime add table ops_hardware_telemetry;
alter publication supabase_realtime add table ops_agent_status;
alter publication supabase_realtime add table ops_cron_log;
alter publication supabase_realtime add table ops_dispatch_log;
alter publication supabase_realtime add table ops_deploy_log;
alter publication supabase_realtime add table ops_mission_priorities;
