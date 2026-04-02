import { AgentWorkState } from '../types'

export const WORK_STATES: AgentWorkState[] = [
  {
    agentId: 'scout',
    currentTask: {
      title: 'ESO Partnership Research',
      status: 'drafting',
      progress: 62,
    },
    liveDraft: {
      title: 'ESO API Integration Analysis',
      fullContent: `ESO Integration Analysis — April 2, 2026

Key findings from ESO API documentation review:

1. ePCR Timestamp Endpoints
   - GET /v1/incidents/{id}/timestamps returns full chain
   - Dispatch, response, scene arrival, hospital arrival
   - Historical data available up to 24 months
   - Rate limit: 1,000 req/hr per OAuth2 client

2. Authentication Requirements
   - OAuth2 client credentials flow
   - Scope: read:incidents read:timestamps
   - Token expiry: 3600s, refresh available
   - Sandbox environment available at sandbox.esosuite.net

3. Data Quality Notes
   - 94.2% timestamp completeness in Q4 2025
   - Null values on scene_depart when multi-patient
   - Recommend using dispatch_time as anchor

4. Integration Path
   Scout → Engineering handoff after endpoint spec
   Engineer implements pagination + reconciliation
   Analyst validates P90 against Cedars baseline

5. Cedars Validation Dataset
   ~15,000 transports Q1-Q2 2025 available
   Statistical power sufficient for P90 at 95% CI
   Request bulk export via SFTP or streaming endpoint`,
    },
    workflow: {
      steps: [
        { agent: 'Scout', action: 'researches', status: 'active' },
        { agent: 'Command', action: 'reviews', status: 'pending' },
        { agent: 'Engineer', action: 'implements', status: 'pending' },
      ],
      destination: { platform: 'Telegram', channel: 'Research (#5)' },
    },
    recentOutput: [
      { title: 'ESO API endpoint analysis', timestamp: '1:15 PM', destination: 'Research (#5)' },
      { title: 'Competitor scan: Pulsara Q1', timestamp: '11:02 AM', destination: 'Competitors (#8)' },
      { title: 'AB-40 enforcement update', timestamp: '8:15 AM', destination: 'Research (#5)' },
    ],
    queue: [
      { title: 'Weekly deep research', schedule: 'Mon 8:00 AM' },
      { title: 'Competitor deep dive', schedule: 'Wed 9:00 AM' },
    ],
  },
  {
    agentId: 'engineer',
    currentTask: {
      title: 'RLS Fix — active_walls Table',
      status: 'drafting',
      progress: 78,
    },
    liveDraft: {
      title: 'Supabase RLS Migration v2',
      fullContent: `-- Migration: fix_rls_active_walls
-- Date: 2026-04-02
-- Author: Engineer Agent

-- Drop old permissive policy
DROP POLICY IF EXISTS "allow_all_active_walls" ON active_walls;

-- New row-level security policies
-- 1. Users can only read their own org's walls
CREATE POLICY "read_own_org_walls"
  ON active_walls
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members
      WHERE org_id = active_walls.org_id
    )
  );

-- 2. Only org admins can insert/update
CREATE POLICY "write_admin_only"
  ON active_walls
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members
      WHERE org_id = active_walls.org_id
        AND role = 'admin'
    )
  );

-- 3. Service role bypass for cron jobs
-- (handled by SUPABASE_SERVICE_ROLE_KEY)

-- Test query (should return 0 rows for non-admin)
-- SELECT * FROM active_walls WHERE org_id = 'test-org';`,
    },
    workflow: {
      steps: [
        { agent: 'Engineer', action: 'drafts', status: 'active' },
        { agent: 'Engineer', action: 'opens PR', status: 'pending' },
        { agent: 'Command', action: 'reviews', status: 'pending' },
      ],
      destination: { platform: 'GitHub', channel: 'Engineering (#12)' },
    },
    recentOutput: [
      { title: 'Reconciliation proof row deployed', timestamp: '2:30 PM', destination: 'Engineering (#12)' },
      { title: 'WebSocket latency reduced to 12ms', timestamp: '11:45 AM', destination: 'Engineering (#12)' },
      { title: 'Auth middleware session token encryption', timestamp: '9:20 AM', destination: 'Engineering (#12)' },
    ],
    queue: [
      { title: 'Wall schema migration to staging', schedule: 'Today 5:00 PM' },
      { title: 'CI/CD pipeline audit', schedule: 'Fri 9:00 AM' },
    ],
  },
  {
    agentId: 'command',
    currentTask: {
      title: 'Morning Brief — All Agents',
      status: 'delivering',
      progress: 95,
    },
    liveDraft: {
      title: 'Morning Brief — April 2, 2026',
      fullContent: `WALLTIME MORNING BRIEF
April 2, 2026 | 06:00 PST
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SYSTEM STATUS
All 6 agents operational
18 cron jobs running — 0 failures
RTX 5090: 59.89 tok/s | 68% VRAM
Mac Mini M4: Online | 34% CPU

⚡ OVERNIGHT ACTIVITY
• Scout: ESO API docs reviewed, endpoint map complete
• Engineer: RLS migration drafted, awaiting review
• Analyst: EMSA Q1 non-compliance at 54.2% — above threshold
• Capital: SAFE paperwork signed, wire ETA 72hrs
• Content: LinkedIn post drafted for AB-40 compliance
• Command: 18 crons executed, all green

🎯 TODAY'S PRIORITIES
1. [P0] ESO: Scout → Engineer handoff on API spec
2. [P0] Cedars Accelerator app — 14 days remaining
3. [P1] $500K SAFE wire confirmation expected
4. [P1] RLS fix review + merge to staging
5. [P2] LinkedIn AB-40 post — schedule for 10 AM

📅 UPCOMING
• ESO integration kickoff: Apr 16 09:00 PST
• Cedars deadline: Apr 16 (same day — expedite)
• Investor call: TBD this week

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dispatched to: all agents via Telegram`,
    },
    workflow: {
      steps: [
        { agent: 'Command', action: 'aggregates', status: 'complete' },
        { agent: 'Command', action: 'formats', status: 'complete' },
        { agent: 'Command', action: 'dispatches', status: 'active' },
      ],
      destination: { platform: 'Telegram', channel: 'Morning Brief (#4)' },
    },
    recentOutput: [
      { title: 'Morning Brief dispatched', timestamp: '6:02 AM', destination: 'Morning Brief (#4)' },
      { title: 'Ops healthcheck — all green', timestamp: '5:01 AM', destination: 'Ops (#16)' },
      { title: 'Task dispatch to all agents', timestamp: '6:05 AM', destination: 'Tasks (#46)' },
    ],
    queue: [
      { title: 'Task dispatch batch 2', schedule: 'Today 12:00 PM' },
      { title: 'Ops healthcheck', schedule: 'Tomorrow 5:00 AM' },
    ],
  },
  {
    agentId: 'capital',
    currentTask: {
      title: '$500K SAFE Term Sheet Update',
      status: 'reviewing',
      progress: 88,
    },
    liveDraft: {
      title: 'SAFE Investment Summary — Cedars Round',
      fullContent: `WALLTIME — SAFE INVESTMENT SUMMARY
Round: Pre-Seed Bridge
Target: $500,000 USD
Instrument: Simple Agreement for Future Equity (SAFE)
Valuation Cap: $8,000,000
Discount Rate: 20%
MFN Clause: Yes

CURRENT STATUS
• Lead investor: Signed ✅
• Wire ETA: 72 hours (Apr 5)
• Secondary: In diligence
• Total committed: $500K of $500K target

USE OF FUNDS
• Engineering (3 months runway): $180K
• Hardware (RTX 6090 upgrade): $40K
• Go-to-market (Cedars pilot): $80K
• Legal & compliance: $30K
• Reserve: $170K

CEDARS ACCELERATOR
Application deadline: April 16, 2026
Program value: $50K + 3-month residency
Key differentiator: EMSA non-compliance data
Required: validation dataset from ESO integration

CAP TABLE (POST-SAFE)
Jason Dahlen: 85% (pre-dilution)
SAFE holders: 15% (at cap conversion)
Options pool: 10% (reserved)

INVESTOR UPDATES SENT
• Apr 1: Q1 metrics + ESO partnership update
• Mar 15: Product demo recording
• Mar 1: Monthly brief`,
    },
    workflow: {
      steps: [
        { agent: 'Capital', action: 'drafts', status: 'complete' },
        { agent: 'Command', action: 'reviews', status: 'active' },
        { agent: 'Capital', action: 'delivers', status: 'pending' },
      ],
      destination: { platform: 'Google Drive', channel: 'Capital (#9)' },
    },
    recentOutput: [
      { title: 'SAFE paperwork confirmed signed', timestamp: '3:15 PM', destination: 'Capital (#9)' },
      { title: 'Investor deck Q1 metrics update', timestamp: '10:30 AM', destination: 'Capital (#9)' },
      { title: 'VC tracking — 3 new prospects', timestamp: '10:05 AM', destination: 'Capital (#9)' },
    ],
    queue: [
      { title: 'Fundraise pipeline review', schedule: 'Tue 10:00 AM' },
      { title: 'VC tracking scan', schedule: 'Tomorrow 10:00 AM' },
    ],
  },
  {
    agentId: 'content',
    currentTask: {
      title: 'LinkedIn: AB-40 Non-Compliance',
      status: 'drafting',
      progress: 55,
    },
    liveDraft: {
      title: 'LinkedIn Post — AB-40 Compliance',
      fullContent: `54% of California hospitals are out of compliance with AB-40.

That's not a small number. It's a majority.

AB-40 requires hospitals to display real-time patient status on visible digital displays in care areas. The goal: reduce alarm fatigue, improve nurse response times, reduce adverse events.

The data is in. The enforcement is here. But more than half aren't ready.

Here's what I'm seeing at WallTime:

1/ The technology gap is real but solvable.
Most hospitals have the infrastructure. What they lack is the software layer that translates HL7/FHIR patient data into readable, actionable wall displays. That's exactly what we built.

2/ The clock is ticking.
CDPH enforcement began Q1 2026. We're already getting inbound from compliance officers who saw the EMSA quarterly report. Non-compliance fines start at $25K/incident.

3/ Integration is the bottleneck.
Facilities that tried to build in-house spent 6-18 months on EHR integration alone. APOT connects in days, not months.

If you're in hospital operations, compliance, or clinical informatics — I'd love to talk.

We're in pilot at [partner] and the results are compelling.

DM me or comment below 👇

#HealthTech #HospitalCompliance #AB40 #PatientSafety #APOT`,
    },
    workflow: {
      steps: [
        { agent: 'Content', action: 'drafts', status: 'active' },
        { agent: 'Command', action: 'reviews', status: 'pending' },
        { agent: 'Content', action: 'publishes', status: 'pending' },
      ],
      destination: { platform: 'LinkedIn', channel: 'Content (#10)' },
    },
    recentOutput: [
      { title: 'AB-40 trends post — 2.4K impressions', timestamp: '9:00 AM', destination: 'Content (#10)' },
      { title: 'Outreach warmup sequence batch 3', timestamp: '12:05 PM', destination: 'Outreach (#11)' },
      { title: 'Case study: Cedars pilot results draft', timestamp: 'Yesterday', destination: 'Content (#10)' },
    ],
    queue: [
      { title: 'Content post scheduler', schedule: 'Today 11:00 AM' },
      { title: 'Outreach warmup batch 4', schedule: 'Today 12:00 PM' },
    ],
  },
  {
    agentId: 'analyst',
    currentTask: {
      title: 'EMSA Q1 Non-Compliance Analysis',
      status: 'researching',
      progress: 82,
    },
    liveDraft: {
      title: 'EMSA Q1 2026 — Compliance Report',
      fullContent: `EMSA Q1 2026 — HOSPITAL NON-COMPLIANCE ANALYSIS
Generated: April 2, 2026 | Analyst Agent

EXECUTIVE SUMMARY
Non-compliance rate: 54.2% (847 of 1,562 facilities)
Prior quarter: 48.1% — trend is worsening
Enforcement threshold crossed: Q1 2026

KEY FINDINGS

By County (Top Non-Compliant):
• Los Angeles:   312 facilities, 61% non-compliant
• San Diego:     98 facilities, 52% non-compliant
• Sacramento:    87 facilities, 49% non-compliant
• Alameda:       74 facilities, 47% non-compliant
• Orange:        68 facilities, 44% non-compliant

By Hospital Size:
• Large (300+ beds): 38% non-compliant
• Medium (100-299):  56% non-compliant
• Small (<100 beds): 71% non-compliant
  → Small hospitals are the highest-risk segment

Compliance Blockers (self-reported):
1. EHR integration complexity: 67%
2. Budget constraints: 45%
3. IT staffing shortage: 38%
4. Vendor uncertainty: 29%

APOT MARKET OPPORTUNITY
Target segment: Medium + Small hospitals
TAM (CA only): 847 non-compliant facilities
Average contract value: ~$24K/yr
CA TAM: ~$20.3M ARR
National extrapolation: ~$280M ARR

P90 RESPONSE TIME VALIDATION
Cedars pilot baseline: 8.2 minutes (pre-APOT)
Industry benchmark P90: 12.4 minutes
APOT target: <6 minutes
Data needed: ESO integration (Scout in progress)`,
    },
    workflow: {
      steps: [
        { agent: 'Analyst', action: 'analyzes', status: 'active' },
        { agent: 'Scout', action: 'validates', status: 'pending' },
        { agent: 'Analyst', action: 'publishes', status: 'pending' },
      ],
      destination: { platform: 'Telegram', channel: 'EMSA (#6)' },
    },
    recentOutput: [
      { title: 'EMSA Q4 2025 baseline report', timestamp: 'Yesterday', destination: 'EMSA (#6)' },
      { title: 'AI tools radar — 5 new entrants', timestamp: '2:05 PM', destination: 'AI Radar (#13)' },
      { title: 'Dashboard p95 optimization complete', timestamp: '11:30 AM', destination: 'Engineering (#12)' },
    ],
    queue: [
      { title: 'EMSA compliance scan', schedule: 'Tomorrow 7:00 AM' },
      { title: 'AI tools radar', schedule: 'Today 2:00 PM' },
      { title: 'Product expansion research', schedule: 'Today 3:00 PM' },
    ],
  },
]
