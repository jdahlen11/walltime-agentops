import { Agent } from '../types'

export const AGENTS: Agent[] = [
  { id: 'scout',    name: 'Scout',    role: 'Research',    emoji: '🔍', color: '#06b6d4', model: 'grok-4-1-fast', deskPos: [-5, 0, -3], chairPos: [-1, 0, 4]  },
  { id: 'engineer', name: 'Engineer', role: 'Engineering', emoji: '⚙️',  color: '#22c55e', model: 'grok-4-1-fast', deskPos: [0,  0, -3], chairPos: [1,  0, 4]  },
  { id: 'command',  name: 'Command',  role: 'Operations',  emoji: '🎯', color: '#f97316', model: 'grok-4-1-fast', deskPos: [5,  0, -3], chairPos: [-1, 0, 6]  },
  { id: 'capital',  name: 'Capital',  role: 'Finance',     emoji: '💰', color: '#eab308', model: 'grok-4-1-fast', deskPos: [-5, 0, 3],  chairPos: [1,  0, 6]  },
  { id: 'content',  name: 'Content',  role: 'Marketing',   emoji: '✍️',  color: '#ec4899', model: 'grok-4-1-fast', deskPos: [0,  0, 3],  chairPos: [-1, 0, 5]  },
  { id: 'analyst',  name: 'Analyst',  role: 'Analytics',   emoji: '📊', color: '#8b5cf6', model: 'grok-4-1-fast', deskPos: [5,  0, 3],  chairPos: [1,  0, 5]  },
]
