export type AgentState = 'working' | 'thinking' | 'walking' | 'coffee' | 'meeting' | 'idle'

export interface Agent {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  model: string
  deskPos: [number, number, number]
  chairPos: [number, number, number]
}

export interface AgentSimState {
  agentId: string
  state: AgentState
  position: [number, number, number]
  targetPosition: [number, number, number]
  facingAngle: number
  waypointPath: string[]
  stateTimer: number
  stateDuration: number
  tokens: number
  lastAction: string
  currentTaskProgress: number
}

export interface Waypoint {
  id: string
  position: [number, number, number]
  connections: string[]
}

export interface AgentWorkState {
  agentId: string
  currentTask: {
    title: string
    status: 'researching' | 'drafting' | 'reviewing' | 'delivering'
    progress: number
  }
  liveDraft: {
    title: string
    fullContent: string
  }
  workflow: {
    steps: Array<{ agent: string; action: string; status: 'complete' | 'active' | 'pending' }>
    destination: { platform: string; channel: string }
  }
  recentOutput: Array<{ title: string; timestamp: string; destination: string }>
  queue: Array<{ title: string; schedule: string }>
}
