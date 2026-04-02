import type { AgentDefinition } from '../lib/types'

export const AGENTS: AgentDefinition[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Intelligence Gathering',
    emoji: '🔍',
    color: '#3B82F6',
    telegramTopics: [5, 8], // Research, Competitors
    description: 'External monitoring, news scanning, competitive intelligence',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    role: 'Technical Analysis',
    emoji: '⚙️',
    color: '#10B981',
    telegramTopics: [12], // Engineering
    description: 'Architecture review, code tasks, infrastructure',
  },
  {
    id: 'command',
    name: 'Command',
    role: 'Primary Dispatch',
    emoji: '🎯',
    color: '#8B5CF6',
    telegramTopics: [3, 46], // Command, Tasks
    description: 'Task coordination, agent routing, morning briefs',
  },
  {
    id: 'capital',
    name: 'Capital',
    role: 'Fundraise & Strategy',
    emoji: '💰',
    color: '#F59E0B',
    telegramTopics: [9], // Capital
    description: 'Investor comms, SAFE modeling, accelerator prep',
  },
  {
    id: 'content',
    name: 'Content',
    role: 'Comms & Marketing',
    emoji: '✍️',
    color: '#EC4899',
    telegramTopics: [10, 11], // Content, Outreach
    description: 'LinkedIn posts, emails, investor decks, outreach',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    role: 'Data & Research',
    emoji: '📊',
    color: '#06B6D4',
    telegramTopics: [5, 6], // Research, EMSA
    description: 'Market data, P90 analysis, compliance modeling',
  },
]

export const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<
  (typeof AGENTS)[number]['id'],
  AgentDefinition
>

export const TOPIC_NAMES: Record<number, string> = {
  3: 'Command',
  4: 'Morning Brief',
  5: 'Research',
  6: 'EMSA',
  8: 'Competitors',
  9: 'Capital',
  10: 'Content',
  11: 'Outreach',
  12: 'Engineering',
  13: 'AI Radar',
  14: 'Product',
  15: 'R&D Council',
  16: 'Ops',
  46: 'Tasks',
}

export const TOPIC_AGENT: Record<number, string> = {
  3: 'command',
  4: 'command',
  5: 'scout',
  6: 'analyst',
  8: 'scout',
  9: 'capital',
  10: 'content',
  11: 'content',
  12: 'engineer',
  13: 'scout',
  14: 'command',
  15: 'analyst',
  16: 'command',
  46: 'command',
}
