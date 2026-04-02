import { create } from 'zustand'

export interface FeedMessage {
  id: number
  text: string
  agentId: string
  color: string
  timestamp: Date
}

const MESSAGES = [
  { text: 'Scout: Crawling ESO partnership docs #Research', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: Pushed RLS fix for active_walls #Engineering', agentId: 'engineer', color: '#10B981' },
  { text: 'Command: Dispatched morning brief to all agents #Command', agentId: 'command', color: '#8B5CF6' },
  { text: 'Capital: Updated $500K SAFE term sheet #Capital', agentId: 'capital', color: '#F59E0B' },
  { text: 'Content: Published LinkedIn post on AB-40 trends #Content', agentId: 'content', color: '#EC4899' },
  { text: 'Analyst: EMSA Q1 shows 54% non-compliance rate #EMSA', agentId: 'analyst', color: '#06B6D4' },
  { text: 'Scout: Pulsara added APOT feature — competitor alert #Competitors', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: Reconciliation proof point row deployed #Engineering', agentId: 'engineer', color: '#10B981' },
  { text: 'Command: 18 cron jobs healthy, next: morning-brief at 06:00 #Ops', agentId: 'command', color: '#8B5CF6' },
  { text: 'Capital: Cedars Accelerator app deadline in 14 days #Capital', agentId: 'capital', color: '#F59E0B' },
  { text: 'Content: AB-40 compliance post hits 2.4k impressions #Marketing', agentId: 'content', color: '#EC4899' },
  { text: 'Analyst: Pulled EMSA Q1 dataset — 847 facilities flagged #Analytics', agentId: 'analyst', color: '#06B6D4' },
  { text: 'Scout: Found 3 new pilot candidates in SF Bay Area #Research', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: Wall schema migration ready for staging #Engineering', agentId: 'engineer', color: '#10B981' },
  { text: 'Command: ESO integration kickoff call scheduled Apr 16 #ESO', agentId: 'command', color: '#8B5CF6' },
  { text: 'Capital: Investor deck updated with Q1 metrics #Finance', agentId: 'capital', color: '#F59E0B' },
  { text: 'Content: Drafted case study: Cedars pilot results #Marketing', agentId: 'content', color: '#EC4899' },
  { text: 'Analyst: RLS compliance gap analysis complete #Compliance', agentId: 'analyst', color: '#06B6D4' },
  { text: 'Scout: APOT mentioned in 3 nursing forums this week #Research', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: WebSocket latency reduced to 12ms avg #Engineering', agentId: 'engineer', color: '#10B981' },
  { text: 'Command: Tailscale VPN nodes all green, 99.9% uptime #Ops', agentId: 'command', color: '#8B5CF6' },
  { text: 'Capital: Term sheet redlines received from lead investor #Finance', agentId: 'capital', color: '#F59E0B' },
  { text: 'Content: Twitter/X thread on wall tech outperforms avg 3x #Marketing', agentId: 'content', color: '#EC4899' },
  { text: 'Analyst: Projected TAM $2.1B in acute care sector #Analytics', agentId: 'analyst', color: '#06B6D4' },
  { text: 'Scout: CommonSpirit Health exploring digital display RFP #Research', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: Auth middleware refactored — session tokens encrypted #Security', agentId: 'engineer', color: '#10B981' },
  { text: 'Command: Scheduled demo with Scripps Health next Tuesday #Sales', agentId: 'command', color: '#8B5CF6' },
  { text: 'Capital: SAFE paperwork signed — wiring ETA 72hrs #Finance', agentId: 'capital', color: '#F59E0B' },
  { text: 'Content: Blog: How APOT reduces nurse alarm fatigue #Content', agentId: 'content', color: '#EC4899' },
  { text: 'Analyst: Dashboard load time p95 now 1.2s down from 3.8s #Performance', agentId: 'analyst', color: '#06B6D4' },
  { text: 'Scout: CMS final rule supports remote patient monitoring #Regulatory', agentId: 'scout', color: '#3B82F6' },
  { text: 'Engineer: CI/CD pipeline green — 0 failing tests #Engineering', agentId: 'engineer', color: '#10B981' },
]

let msgId = 0

interface FeedStore {
  messages: FeedMessage[]
  addMessage: () => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  messages: MESSAGES.slice(0, 5).map(m => ({ ...m, id: msgId++, timestamp: new Date() })),
  addMessage: () => set(s => {
    const template = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
    const msg: FeedMessage = { ...template, id: msgId++, timestamp: new Date() }
    const msgs = [msg, ...s.messages].slice(0, 8)
    return { messages: msgs }
  }),
}))
