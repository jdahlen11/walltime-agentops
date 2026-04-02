import { Agent } from '../types'

export const AGENTS: Agent[] = [
  // Left column (x=-3.5) — monitor faces -Z, char sits at z+0.55
  { id: 'scout',    name: 'Scout',    role: 'Research',    emoji: '🔍', color: '#06b6d4', model: 'grok-4-1-fast', deskPos: [-3.5, 0, -2.5], chairPos: [ 0.0, 0, -3.4] },
  { id: 'engineer', name: 'Engineer', role: 'Engineering', emoji: '⚙️',  color: '#22c55e', model: 'grok-4-1-fast', deskPos: [-3.5, 0,  0.0], chairPos: [-1.4, 0, -2.0] },
  { id: 'command',  name: 'Command',  role: 'Operations',  emoji: '🎯', color: '#f97316', model: 'grok-4-1-fast', deskPos: [-3.5, 0,  2.5], chairPos: [ 0.0, 0, -0.6] },
  // Right column (x=+3.5) — monitor faces +Z, char sits at z-0.55
  { id: 'capital',  name: 'Capital',  role: 'Finance',     emoji: '💰', color: '#eab308', model: 'grok-4-1-fast', deskPos: [ 3.5, 0, -2.5], chairPos: [ 1.4, 0, -2.0] },
  { id: 'content',  name: 'Content',  role: 'Marketing',   emoji: '✍️',  color: '#ec4899', model: 'grok-4-1-fast', deskPos: [ 3.5, 0,  0.0], chairPos: [ 1.4, 0, -2.0] },
  { id: 'analyst',  name: 'Analyst',  role: 'Analytics',   emoji: '📊', color: '#8b5cf6', model: 'grok-4-1-fast', deskPos: [ 3.5, 0,  2.5], chairPos: [ 0.0, 0, -3.4] },
]
