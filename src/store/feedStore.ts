import { create } from 'zustand';

export interface FeedMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  text: string;
  topic: string;
  topicId: number;
  timestamp: Date;
}

const MESSAGE_POOL: Omit<FeedMessage, 'id' | 'timestamp'>[] = [
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'Crawling ESO partnership docs — found 3 new contacts', topic: 'Research', topicId: 5 },
  { agentId: 'engineer', agentName: 'Engineer', agentColor: '#10B981', text: 'Pushed RLS fix for active_walls — verified on staging', topic: 'Engineering', topicId: 12 },
  { agentId: 'command', agentName: 'Command', agentColor: '#8B5CF6', text: 'Dispatched morning brief to all agents', topic: 'Command', topicId: 3 },
  { agentId: 'capital', agentName: 'Capital', agentColor: '#F59E0B', text: 'Updated $500K SAFE term sheet — v3 ready for review', topic: 'Capital', topicId: 9 },
  { agentId: 'content', agentName: 'Content', agentColor: '#EC4899', text: 'Published LinkedIn post on AB-40 enforcement trends', topic: 'Content', topicId: 10 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'Generating compliance heatmap for SPA 4 — 847 records processed', topic: 'Research', topicId: 5 },
  { agentId: 'engineer', agentName: 'Engineer', agentColor: '#10B981', text: 'Reconciliation Engine proof point row added to demo deck', topic: 'Engineering', topicId: 12 },
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'Competitor alert: Pulsara added APOT tracking feature', topic: 'Competitors', topicId: 8 },
  { agentId: 'command', agentName: 'Command', agentColor: '#8B5CF6', text: 'Task dispatched: landing page build for walltime.ai', topic: 'Tasks', topicId: 46 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'EMSA Q1 data: 54% of facilities show non-compliance', topic: 'EMSA', topicId: 6 },
  { agentId: 'capital', agentName: 'Capital', agentColor: '#F59E0B', text: 'Cedars Accelerator application: 3 slides updated', topic: 'Capital', topicId: 9 },
  { agentId: 'content', agentName: 'Content', agentColor: '#EC4899', text: 'Outreach sequence for 12 ED directors drafted', topic: 'Outreach', topicId: 11 },
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'ESO integration spec review complete — 4 blockers flagged', topic: 'Research', topicId: 5 },
  { agentId: 'engineer', agentName: 'Engineer', agentColor: '#10B981', text: 'Supabase migration v12 deployed — active_walls RLS active', topic: 'Engineering', topicId: 12 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'APOT P90 trending up — 27.4 min avg across 8 walls', topic: 'EMSA', topicId: 6 },
  { agentId: 'command', agentName: 'Command', agentColor: '#8B5CF6', text: 'Sprint sync complete — 14 tasks in flight', topic: 'Command', topicId: 3 },
  { agentId: 'capital', agentName: 'Capital', agentColor: '#F59E0B', text: 'Cap table model updated: post-money $2.1M', topic: 'Capital', topicId: 9 },
  { agentId: 'content', agentName: 'Content', agentColor: '#EC4899', text: 'Webinar script drafted: "APOT Compliance in 2026"', topic: 'Content', topicId: 10 },
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'AI Radar: GPT-5o released — evaluating for med-compliance use', topic: 'AI Radar', topicId: 13 },
  { agentId: 'engineer', agentName: 'Engineer', agentColor: '#10B981', text: 'n8n workflow for cron reconciliation passing all checks', topic: 'Ops', topicId: 15 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'Product feature gap analysis: 6 priority items identified', topic: 'Product', topicId: 14 },
  { agentId: 'command', agentName: 'Command', agentColor: '#8B5CF6', text: 'Morning brief generated: ESO prep is top priority', topic: 'Morning Brief', topicId: 4 },
  { agentId: 'capital', agentName: 'Capital', agentColor: '#F59E0B', text: 'Investor meeting scheduled: April 10, Cedars contact confirmed', topic: 'Capital', topicId: 9 },
  { agentId: 'content', agentName: 'Content', agentColor: '#EC4899', text: 'Email sequence A/B test results: 34% open rate on version B', topic: 'Outreach', topicId: 11 },
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'Pulsara APOT feature is basic — no reconciliation engine', topic: 'Competitors', topicId: 8 },
  { agentId: 'engineer', agentName: 'Engineer', agentColor: '#10B981', text: 'RTX node load spike — rebalancing inference queue', topic: 'Ops', topicId: 15 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'R&D: n8n vs custom orchestration — recommending hybrid', topic: 'R&D Council', topicId: 15 },
  { agentId: 'command', agentName: 'Command', agentColor: '#8B5CF6', text: 'Task #847 complete: RLS policy validated on prod', topic: 'Tasks', topicId: 46 },
  { agentId: 'capital', agentName: 'Capital', agentColor: '#F59E0B', text: 'SAFE paperwork reviewed — legal sign-off pending', topic: 'Capital', topicId: 9 },
  { agentId: 'content', agentName: 'Content', agentColor: '#EC4899', text: 'Landing page copy v2 submitted — awaiting engineer deploy', topic: 'Content', topicId: 10 },
  { agentId: 'scout', agentName: 'Scout', agentColor: '#3B82F6', text: 'ESO API docs updated — pagination endpoint changed', topic: 'Research', topicId: 5 },
  { agentId: 'analyst', agentName: 'Analyst', agentColor: '#06B6D4', text: 'Compliance dashboard: 23 hospitals in SPA 4 now tracked', topic: 'EMSA', topicId: 6 },
];

interface FeedStore {
  messages: FeedMessage[];
  addMessage: (msg: Omit<FeedMessage, 'id' | 'timestamp'>) => void;
  addRandomMessage: () => void;
  poolIndex: number;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  messages: MESSAGE_POOL.slice(0, 6).map((m, i) => ({
    ...m,
    id: `init-${i}`,
    timestamp: new Date(Date.now() - (6 - i) * 30000),
  })),
  poolIndex: 6,

  addMessage: (msg) => set(state => ({
    messages: [...state.messages.slice(-9), {
      ...msg,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }],
  })),

  addRandomMessage: () => {
    const state = get();
    const idx = state.poolIndex % MESSAGE_POOL.length;
    const msg = MESSAGE_POOL[idx];
    set(s => ({
      messages: [...s.messages.slice(-9), {
        ...msg,
        id: `msg-${Date.now()}-${idx}`,
        timestamp: new Date(),
      }],
      poolIndex: (s.poolIndex + 1) % MESSAGE_POOL.length,
    }));
  },
}));
