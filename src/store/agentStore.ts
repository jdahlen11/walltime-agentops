import { create } from 'zustand';
import * as THREE from 'three';

export type AgentStatus = 'idle' | 'working' | 'thinking' | 'collaborating' | 'coffee' | 'gym';

export interface AgentConfig {
  id: string;
  displayName: string;
  openclawName: string;
  role: string;
  emoji: string;
  color: string;
  model: string;
  deskPosition: [number, number, number];
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  tokens: number;
  lastAction: string;
  collaboratingWith: string | null;
  stateTimer: number;
  stateDuration: number;
}

export const AGENT_CONFIGS: AgentConfig[] = [
  { id: 'scout', displayName: 'Scout', openclawName: 'The Scout', role: 'Intelligence & Monitoring', emoji: '🔍', color: '#3B82F6', model: 'llama4-scout', deskPosition: [-6, 0, -4] },
  { id: 'engineer', displayName: 'Engineer', openclawName: 'The Engineer', role: 'Technical & Code', emoji: '⚙️', color: '#10B981', model: 'grok-4-1-fast', deskPosition: [0, 0, -4] },
  { id: 'command', displayName: 'Command', openclawName: 'Main Agent', role: 'Dispatch & Coordination', emoji: '🎯', color: '#8B5CF6', model: 'grok-4-1-fast', deskPosition: [6, 0, -4] },
  { id: 'capital', displayName: 'Capital', openclawName: 'The Strategist', role: 'Strategy & Fundraising', emoji: '💰', color: '#F59E0B', model: 'qwen3:32b', deskPosition: [-6, 0, 4] },
  { id: 'content', displayName: 'Content', openclawName: 'Content Agent', role: 'Creative & Comms', emoji: '✍️', color: '#EC4899', model: 'qwen3:32b', deskPosition: [0, 0, 4] },
  { id: 'analyst', displayName: 'Analyst', openclawName: 'The Analyst', role: 'Data & Research', emoji: '📊', color: '#06B6D4', model: 'deepseek-r1:32b', deskPosition: [6, 0, 4] },
];

const LAST_ACTIONS: Record<string, string[]> = {
  scout: ['Crawling ESO docs', 'Monitoring competitors', 'Scraping partner data', 'Indexing intel feeds', 'Scanning EMSA updates'],
  engineer: ['Pushing RLS fix', 'Refactoring auth layer', 'Debugging cron pipeline', 'Writing schema migration', 'Optimizing query planner'],
  command: ['Dispatching morning brief', 'Routing task to Analyst', 'Coordinating sprint', 'Sending Telegram digest', 'Orchestrating workflow'],
  capital: ['Updating SAFE term sheet', 'Modeling cap table', 'Drafting pitch narrative', 'Researching Cedars contacts', 'Reviewing investor CRM'],
  content: ['Publishing LinkedIn post', 'Drafting AB-40 summary', 'Writing product copy', 'Formatting newsletter', 'Editing landing page'],
  analyst: ['Generating compliance heatmap', 'Running APOT regression', 'Aggregating SPA data', 'Building Q1 report', 'Analyzing EMSA dataset'],
};

interface AgentStore {
  agents: Map<string, AgentState>;
  focusedAgent: string | null;
  meetingOpen: boolean;
  setStatus: (id: string, status: AgentStatus) => void;
  setPosition: (id: string, pos: THREE.Vector3) => void;
  setTargetPosition: (id: string, pos: THREE.Vector3) => void;
  addTokens: (id: string, amount: number) => void;
  setLastAction: (id: string, action: string) => void;
  setCollaborating: (id: string, partnerId: string | null) => void;
  tickTimer: (id: string, delta: number) => boolean;
  resetTimer: (id: string, duration: number) => void;
  setFocusedAgent: (id: string | null) => void;
  setMeetingOpen: (open: boolean) => void;
  initAgents: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: new Map(),
  focusedAgent: null,
  meetingOpen: false,

  initAgents: () => {
    const agents = new Map<string, AgentState>();
    AGENT_CONFIGS.forEach((cfg, i) => {
      const [dx, , dz] = cfg.deskPosition;
      agents.set(cfg.id, {
        id: cfg.id,
        status: 'idle',
        position: new THREE.Vector3(dx, 0, dz),
        targetPosition: new THREE.Vector3(dx, 0, dz),
        tokens: Math.floor(Math.random() * 50000) + 10000,
        lastAction: LAST_ACTIONS[cfg.id][0],
        collaboratingWith: null,
        stateTimer: i * 1.5,
        stateDuration: 3 + Math.random() * 3,
      });
    });
    set({ agents });
  },

  setStatus: (id, status) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) {
      const actions = LAST_ACTIONS[id];
      agents.set(id, {
        ...agent,
        status,
        lastAction: actions[Math.floor(Math.random() * actions.length)],
      });
    }
    return { agents };
  }),

  setPosition: (id, pos) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, position: pos.clone() });
    return { agents };
  }),

  setTargetPosition: (id, pos) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, targetPosition: pos.clone() });
    return { agents };
  }),

  addTokens: (id, amount) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, tokens: agent.tokens + amount });
    return { agents };
  }),

  setLastAction: (id, action) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, lastAction: action });
    return { agents };
  }),

  setCollaborating: (id, partnerId) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, collaboratingWith: partnerId });
    return { agents };
  }),

  resetTimer: (id, duration) => set(state => {
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (agent) agents.set(id, { ...agent, stateTimer: 0, stateDuration: duration });
    return { agents };
  }),

  tickTimer: (id, delta) => {
    const state = get();
    const agents = new Map(state.agents);
    const agent = agents.get(id);
    if (!agent) return false;
    if (agent.stateDuration <= 0) return false;
    const newTimer = agent.stateTimer + delta;
    if (newTimer >= agent.stateDuration) {
      agents.set(id, { ...agent, stateTimer: agent.stateDuration, stateDuration: -1 });
      set({ agents });
      return true;
    }
    agents.set(id, { ...agent, stateTimer: newTimer });
    set({ agents });
    return false;
  },

  setFocusedAgent: (id) => set({ focusedAgent: id }),
  setMeetingOpen: (open) => set({ meetingOpen: open }),
}));
