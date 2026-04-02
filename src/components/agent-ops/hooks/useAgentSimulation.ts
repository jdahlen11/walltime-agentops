import { create } from 'zustand'
import { AgentSimState, AgentState } from '../types'
import { AGENTS } from '../data/agentProfiles'
import { bfsPath, getWaypointPos } from '../data/waypointGraph'

// Map agent id to desk waypoint id
const DESK_WAYPOINT: Record<string, string> = {
  scout: 'desk-scout', engineer: 'desk-engineer', command: 'desk-command',
  capital: 'desk-capital', content: 'desk-content', analyst: 'desk-analyst',
}

const MEETING_WAYPOINTS = ['meeting-1', 'meeting-2', 'meeting-3', 'meeting-4']

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

const ACTION_MAP: Record<AgentState, Record<string, string>> = {
  working: {
    scout: 'Crawling ESO partnership docs',
    engineer: 'Pushing RLS fix for active_walls',
    command: 'Dispatching morning brief',
    capital: 'Updating $500K SAFE term sheet',
    content: 'Drafting LinkedIn AB-40 post',
    analyst: 'Analyzing EMSA Q1 non-compliance',
  },
  thinking: {
    scout: 'Evaluating ESO API rate limits',
    engineer: 'Reviewing RLS policy logic',
    command: 'Planning agent task dispatch',
    capital: 'Assessing SAFE term structure',
    content: 'Brainstorming AB-40 angles',
    analyst: 'Modeling P90 validation approach',
  },
  coffee: {
    scout: 'Coffee break',
    engineer: 'Coffee break',
    command: 'Coffee break',
    capital: 'Coffee break',
    content: 'Coffee break',
    analyst: 'Coffee break',
  },
  walking: {
    scout: 'Walking...',
    engineer: 'Walking...',
    command: 'Walking...',
    capital: 'Walking...',
    content: 'Walking...',
    analyst: 'Walking...',
  },
  meeting: {
    scout: 'In team meeting',
    engineer: 'In team meeting',
    command: 'Running team meeting',
    capital: 'In team meeting',
    content: 'In team meeting',
    analyst: 'In team meeting',
  },
  idle: {
    scout: 'Idle — awaiting task',
    engineer: 'Idle — awaiting task',
    command: 'Idle — awaiting task',
    capital: 'Idle — awaiting task',
    content: 'Idle — awaiting task',
    analyst: 'Idle — awaiting task',
  },
}

function getLastAction(state: AgentState, agentId: string): string {
  return ACTION_MAP[state]?.[agentId] ?? 'Processing...'
}

function pickNextState(currentState: AgentState): AgentState {
  const r = Math.random()
  if (currentState === 'coffee') return 'working'
  if (currentState === 'thinking') return Math.random() < 0.7 ? 'working' : 'thinking'
  if (r < 0.5) return 'working'
  if (r < 0.65) return 'thinking'
  if (r < 0.82) return 'coffee'
  return 'idle'
}

function stateDurationFor(state: AgentState): number {
  switch (state) {
    case 'working':  return rand(25, 60)
    case 'thinking': return rand(8, 18)
    case 'coffee':   return rand(12, 18)
    case 'idle':     return rand(5, 10)
    case 'meeting':  return rand(20, 40)
    case 'walking':  return rand(3, 8)
    default: return 15
  }
}

interface SimStore {
  agentStates: Record<string, AgentSimState>
  selectedAgent: string | null
  hoveredAgent: string | null
  isMeeting: boolean
  meetingParticipants: string[]
  setSelected: (id: string | null) => void
  setHovered: (id: string | null) => void
  startMeeting: () => void
  endMeeting: () => void
  tickAll: (delta: number) => void
  updatePosition: (id: string, pos: [number, number, number], angle: number) => void
  advanceWaypoint: (id: string) => void
}

const initialStates: Record<string, AgentSimState> = {}
AGENTS.forEach((a, i) => {
  const deskWP = DESK_WAYPOINT[a.id]!
  const pos = getWaypointPos(deskWP)
  initialStates[a.id] = {
    agentId: a.id,
    state: 'working',
    position: pos,
    targetPosition: pos,
    facingAngle: Math.PI,
    waypointPath: [],
    stateTimer: -i * 4,
    stateDuration: stateDurationFor('working'),
    tokens: 80000 + Math.floor(Math.random() * 200000),
    lastAction: getLastAction('working', a.id),
    currentTaskProgress: Math.floor(Math.random() * 80),
  }
})

export const useSimStore = create<SimStore>((set, get) => ({
  agentStates: initialStates,
  selectedAgent: null,
  hoveredAgent: null,
  isMeeting: false,
  meetingParticipants: [],

  setSelected: (id) => set({ selectedAgent: id }),
  setHovered: (id) => set({ hoveredAgent: id }),

  startMeeting: () => {
    const participants = AGENTS.slice(0, 4).map(a => a.id)
    set({ isMeeting: true, meetingParticipants: participants })
    set(s => {
      const newStates = { ...s.agentStates }
      participants.forEach((id, i) => {
        const targetWP = MEETING_WAYPOINTS[i] ?? 'meeting-1'
        const deskWP = DESK_WAYPOINT[id] ?? 'center'
        const path = bfsPath(deskWP, targetWP)
        newStates[id] = {
          ...newStates[id]!,
          state: 'walking',
          waypointPath: path.slice(1),
          stateTimer: 0,
          stateDuration: 999,
          lastAction: getLastAction('walking', id),
        }
      })
      return { agentStates: newStates }
    })
  },

  endMeeting: () => {
    set(s => {
      const newStates = { ...s.agentStates }
      s.meetingParticipants.forEach(id => {
        const deskWP = DESK_WAYPOINT[id] ?? 'center'
        const targetWP = MEETING_WAYPOINTS[0] ?? 'meeting-1'
        const path = bfsPath(targetWP, deskWP)
        newStates[id] = {
          ...newStates[id]!,
          state: 'walking',
          waypointPath: path.slice(1),
          stateTimer: 0,
          stateDuration: 999,
          lastAction: getLastAction('walking', id),
        }
      })
      return { agentStates: newStates, isMeeting: false, meetingParticipants: [] }
    })
  },

  advanceWaypoint: (id) => {
    set(s => {
      const agent = s.agentStates[id]
      if (!agent) return s
      const [nextWP, ...remaining] = agent.waypointPath
      if (!nextWP) {
        let newState: AgentState = 'working'
        if (agent.state === 'walking') {
          if (s.meetingParticipants.includes(id)) newState = 'meeting'
          else newState = 'working'
        }
        return {
          agentStates: {
            ...s.agentStates,
            [id]: {
              ...agent,
              state: newState,
              waypointPath: [],
              stateTimer: 0,
              stateDuration: stateDurationFor(newState),
              lastAction: getLastAction(newState, id),
            }
          }
        }
      }
      const newPos = getWaypointPos(nextWP)
      return {
        agentStates: {
          ...s.agentStates,
          [id]: {
            ...agent,
            targetPosition: newPos,
            waypointPath: remaining,
          }
        }
      }
    })
  },

  updatePosition: (id, pos, angle) => {
    set(s => ({
      agentStates: {
        ...s.agentStates,
        [id]: { ...s.agentStates[id]!, position: pos, facingAngle: angle }
      }
    }))
  },

  tickAll: (delta) => {
    set(s => {
      const newStates = { ...s.agentStates }
      let changed = false
      for (const id in newStates) {
        const agent = newStates[id]!
        if (agent.state === 'walking' || agent.state === 'meeting') continue
        const newTimer = agent.stateTimer + delta
        const newTokens = agent.tokens + Math.floor(Math.random() * 2)
        if (newTimer >= agent.stateDuration) {
          const nextState = pickNextState(agent.state)
          const nextDur = stateDurationFor(nextState)
          const currentWP = DESK_WAYPOINT[id] ?? 'center'
          let path: string[] = []

          if (nextState === 'coffee') {
            path = bfsPath(currentWP, 'coffee')
          } else if (nextState === 'thinking' || nextState === 'working' || nextState === 'idle') {
            if (agent.state === 'coffee') {
              path = bfsPath('coffee', currentWP)
            }
          }

          newStates[id] = {
            ...agent,
            state: path.length > 1 ? 'walking' : nextState,
            waypointPath: path.slice(1),
            targetPosition: path.length > 1 ? getWaypointPos(path[1]!) : agent.targetPosition,
            stateTimer: 0,
            stateDuration: path.length > 1 ? 999 : nextDur,
            tokens: newTokens,
            lastAction: getLastAction(path.length > 1 ? 'walking' : nextState, id),
          }
          changed = true
        } else {
          newStates[id] = { ...agent, stateTimer: newTimer, tokens: newTokens }
          changed = true
        }
      }
      return changed ? { agentStates: newStates } : s
    })
  },
}))
