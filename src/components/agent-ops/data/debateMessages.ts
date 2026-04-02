export interface DebateMessage {
  agent: string
  text: string
  tag: 'PROPOSE' | 'BUILD' | 'AGREE' | 'COUNTER' | 'QUESTION'
  color: string
}

export const DEBATE_MESSAGES: DebateMessage[] = [
  { agent: 'Scout',    color: '#06b6d4', tag: 'PROPOSE',  text: 'ESO API supports bulk timestamp export — we should request historical data for Cedars validation' },
  { agent: 'Engineer', color: '#22c55e', tag: 'BUILD',    text: 'Bulk export needs pagination. I can handle that in the reconciliation engine if we get the endpoint spec' },
  { agent: 'Analyst',  color: '#8b5cf6', tag: 'AGREE',    text: 'Historical data gives us statistical power. 6 months of Cedars transports = ~15K records for P90 validation' },
  { agent: 'Capital',  color: '#eab308', tag: 'AGREE',    text: 'That validation dataset is exactly what Cedars Accelerator reviewers will want. Prioritize this.' },
  { agent: 'Command',  color: '#f97316', tag: 'PROPOSE',  text: 'Assigning Scout → Engineer API spec handoff as P0. Deadline: EOD today.' },
  { agent: 'Content',  color: '#ec4899', tag: 'BUILD',    text: 'I can draft the Cedars case study once the P90 data lands. Timing with AB-40 post is perfect.' },
  { agent: 'Analyst',  color: '#8b5cf6', tag: 'QUESTION', text: 'Are we targeting the ESO sandbox first or going straight to prod? Rate limits matter for batch validation.' },
  { agent: 'Engineer', color: '#22c55e', tag: 'COUNTER',  text: 'Sandbox first — OAuth2 setup alone is 2-3 hours. Prod keys may take a week from ESO support.' },
  { agent: 'Scout',    color: '#06b6d4', tag: 'BUILD',    text: 'I already have sandbox credentials from last week. Sending to Engineer now.' },
  { agent: 'Command',  color: '#f97316', tag: 'AGREE',    text: 'Excellent. ESO sandbox timeline collapses from 1 week to today. Updating task assignments.' },
  { agent: 'Capital',  color: '#eab308', tag: 'PROPOSE',  text: 'SAFE wire confirmed for Apr 5. We have runway. Recommend allocating $40K for ESO enterprise license.' },
  { agent: 'Analyst',  color: '#8b5cf6', tag: 'AGREE',    text: '54.2% CA non-compliance is the lead stat. Cedars reviewers will ask for the source — EMSA Q1 report is ready.' },
]
