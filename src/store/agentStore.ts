import { create } from 'zustand'

export type AgentState = 'working' | 'thinking' | 'coffee' | 'walking'

export interface Agent {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  model: string
  basePosition: [number, number, number]
  position: [number, number, number]
  targetPosition: [number, number, number]
  state: AgentState
  prevState: AgentState
  stateTimer: number
  stateDuration: number
  tokens: number
  lastAction: string
}

export const AGENTS: Agent[] = [
  {
    id: 'scout', name: 'Scout', role: 'Research', emoji: '🔍',
    color: '#3B82F6', model: 'llama4-scout',
    basePosition: [-5, 0, -3], position: [-5, 0, -3], targetPosition: [-5, 0, -3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 20,
    tokens: 142000, lastAction: 'Crawling ESO partnership docs'
  },
  {
    id: 'engineer', name: 'Engineer', role: 'Engineering', emoji: '⚙️',
    color: '#10B981', model: 'grok-4-1-fast',
    basePosition: [0, 0, -3], position: [0, 0, -3], targetPosition: [0, 0, -3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 18,
    tokens: 89000, lastAction: 'Pushed RLS fix for active_walls'
  },
  {
    id: 'command', name: 'Command', role: 'Operations', emoji: '🎯',
    color: '#8B5CF6', model: 'grok-4-1-fast',
    basePosition: [5, 0, -3], position: [5, 0, -3], targetPosition: [5, 0, -3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 22,
    tokens: 203000, lastAction: 'Dispatched morning brief'
  },
  {
    id: 'capital', name: 'Capital', role: 'Finance', emoji: '💰',
    color: '#F59E0B', model: 'qwen3:32b',
    basePosition: [-5, 0, 3], position: [-5, 0, 3], targetPosition: [-5, 0, 3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 16,
    tokens: 178000, lastAction: 'Updated $500K SAFE term sheet'
  },
  {
    id: 'content', name: 'Content', role: 'Marketing', emoji: '✍️',
    color: '#EC4899', model: 'qwen3:32b',
    basePosition: [0, 0, 3], position: [0, 0, 3], targetPosition: [0, 0, 3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 19,
    tokens: 95000, lastAction: 'Published LinkedIn post on AB-40'
  },
  {
    id: 'analyst', name: 'Analyst', role: 'Analytics', emoji: '📊',
    color: '#06B6D4', model: 'deepseek-r1:32b',
    basePosition: [5, 0, 3], position: [5, 0, 3], targetPosition: [5, 0, 3],
    state: 'working', prevState: 'working', stateTimer: 0, stateDuration: 24,
    tokens: 312000, lastAction: 'EMSA Q1 shows 54% non-compliance'
  },
]

interface AgentStore {
  agents: Agent[]
  updateAgent: (id: string, updates: Partial<Agent>) => void
  tickAgents: (delta: number) => void
}

const COFFEE_POS: [number, number, number] = [8, 0, 0]
const MEET_POS: [number, number, number] = [0, 0, 0]

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function pickNextState(): AgentState {
  const r = Math.random()
  if (r < 0.45) return 'working'
  if (r < 0.60) return 'thinking'
  if (r < 0.80) return 'coffee'
  return 'walking'
}

function stateDuration(state: AgentState): number {
  switch (state) {
    case 'working': return randomBetween(15, 25)
    case 'thinking': return randomBetween(5, 10)
    case 'coffee': return randomBetween(10, 15)
    case 'walking': return randomBetween(8, 12)
    default: return 15
  }
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: AGENTS.map(a => ({
    ...a,
    stateTimer: -Math.random() * 10, // random stagger
    stateDuration: stateDuration(a.state),
  })),

  updateAgent: (id, updates) =>
    set(s => ({ agents: s.agents.map(a => a.id === id ? { ...a, ...updates } : a) })),

  tickAgents: (delta) =>
    set(s => ({
      agents: s.agents.map(a => {
        let { stateTimer, stateDuration: dur, state, tokens } = a
        stateTimer += delta
        tokens += Math.floor(Math.random() * 3)

        if (stateTimer >= dur) {
          const next = pickNextState()
          const nextDur = stateDuration(next)
          let target = [...a.basePosition] as [number, number, number]
          if (next === 'coffee') target = COFFEE_POS
          else if (next === 'walking') {
            target = [...MEET_POS]
            target[0] += randomBetween(-1, 1)
            target[2] += randomBetween(-1, 1)
          }
          return { ...a, state: next, prevState: state, stateTimer: 0, stateDuration: nextDur, targetPosition: target, tokens }
        }
        return { ...a, stateTimer, tokens }
      })
    })),
}))
