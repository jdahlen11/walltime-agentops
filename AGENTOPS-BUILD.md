# WallTime AgentOps — Final Production Build (Mobile + Desktop)

## STEP 0: Read the ENTIRE codebase

Read every file in src/ before writing a single line. Understand:
- src/lib/types.ts — all interfaces
- src/config/agents.ts — agent definitions, colors, AGENTS export name
- src/App.tsx — layout structure, state management, how panels connect
- src/components/office/ThreeOffice.tsx — current 3D scene
- src/components/agents/ — AgentCard, AgentDetail, AgentOutput
- src/components/hardware/ — HardwareBar, MissionPriorities
- src/hooks/ — every hook, what they fetch, what they return
- src/lib/supabase.ts — table queries
- src/lib/telegram.ts — Telegram polling
- src/lib/github.ts — GitHub API
- package.json — current dependencies
- index.css — current styles and theme vars

Understand the data flow: Daemon on Mac Mini writes to Supabase tables every 30s. Hooks subscribe via Supabase Realtime. React state updates. Components re-render with fresh props.

---

## STEP 1: Install dependencies

```bash
npm install @headlessui/react
```

(three, @types/three, and framer-motion should already be installed)

---

## STEP 2: Create responsive layout system

The app needs TWO layouts sharing the same state:

**Desktop (>= 1024px):** Current 3-column layout (left agents, center 3D office, right detail + bottom bar)

**Mobile (< 1024px):** Bottom tab navigation with 4 views:
- **HQ** tab: 3D office fullscreen with floating agent pills at top + simplified bottom stats
- **Agents** tab: Full-height scrollable agent card list. Tap card opens slide-up detail sheet
- **Status** tab: Hardware telemetry + service health dashboard
- **Feed** tab: Full Telegram message feed + dispatch input

Create src/components/layout/MobileLayout.tsx and src/components/layout/DesktopLayout.tsx.
Create src/components/layout/BottomTabs.tsx for the mobile tab bar.

In App.tsx, detect viewport:
```tsx
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
useEffect(() => {
  const handler = () => setIsMobile(window.innerWidth < 1024);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```
Render DesktopLayout or MobileLayout accordingly. BOTH receive the same props (agents, hardware, feed, etc).

---

## STEP 3: Mobile bottom sheet for agent detail

Create src/components/mobile/AgentBottomSheet.tsx using framer-motion:
- Slides up from bottom when an agent is tapped
- Drag handle at top to dismiss (drag down gesture)
- 60vh height, rounded top corners (border-radius: 20px 20px 0 0)
- Background: #0F1419 with backdrop-blur
- Contains: agent header, status, current task, recent output, dispatch input
- Smooth spring animation (framer-motion AnimatePresence + motion.div with drag="y" dragConstraints)

---

## STEP 4: ThreeOffice.tsx — Character + scene overhaul

### Characters — give them personality

- Face: two black BoxGeometry eyes (0.12 x 0.12 x 0.06) on front of head at y=2.1, spaced ±0.18 apart. Tiny dark mouth line (0.2 x 0.04 x 0.06) at y=1.85
- Hair: BoxGeometry(0.85, 0.25, 0.85) on top of head at y=2.5, color varies per agent:
  - Scout: dark brown #3E2723
  - Engineer: black #1a1a1a
  - Command: dark grey #374151
  - Capital: brown #5D4037
  - Content: dark auburn #4A2C2A
  - Analyst: black #1a1a1a
- Better idle pose: arms slightly out (rotation.z = plus/minus 0.12), legs straight
- Character shadow: a transparent dark circle (CircleGeometry, opacity 0.15) directly under each character at y=0.02

### Behavior — slow, natural, weighted

- Activity change interval: 45000 + Math.random() * 75000 (45-120 seconds between changes)
- Weights: 72% working, 12% meeting, 3% pingpong, 13% resting
- Walk speed: 0.045 (slow stroll)
- CRITICAL: If agent.status === 'active' from Supabase, FORCE to desk, override scheduler completely. They must NOT wander when producing output.
- When working: face monitor direction (negative Z from desk), SUBTLE typing (arm rotation amplitude 0.12, period 200ms)
- When at meeting: spread agents evenly around table circumference, face center
- When resting: sink Y to 0.35, reset to 0 when leaving
- Hide ping-pong ball unless exactly 2 agents are in pingpong state
- Dim all monitor emissive to 0 by default. Only glow cyan (emissiveIntensity 0.8) when agent is working at that desk. Glow RED if agent.status === 'error'.

### Camera

- Default position: (20, 18, 22) — closer, more intimate view
- lookAt target: (0, 1, -2)
- On mobile: position (16, 20, 18) — slightly more top-down for vertical screens
- Smooth camera transitions when double-clicking agent (lerp over 60 frames, not instant jump)

### Scene atmosphere

- 3 ceiling light strips: thin BoxGeometry(12, 0.1, 0.3) with MeshBasicMaterial emissive white, at y=9.5, spread across x=-8/0/8
- Warm point light (0xFFE4B5, intensity 0.4) at lounge area position
- Cool point light (0x3B82F6, intensity 0.3) at server rack position
- Server rack: add 6 tiny SphereGeometry(0.06) LEDs in a vertical line, alternating green/amber, toggle emissive in animation loop at different staggered rates
- Whiteboard on back wall: white PlaneGeometry(4, 2.5) at y=4, z=-12.9 with thin dark frame boxes
- Water cooler near lounge: cylinder body (blue top, white bottom)
- Floor: keep beige. Add a VERY subtle second plane at y=0.01 with a GridHelper(36, 36, 0x000000, 0x000000) at opacity 0.04

### Mobile touch

- OrbitControls: on mobile, limit to pan + zoom only (set controls.enableRotate = false for mobile). Rotation is disorienting on phones.
- On mobile, increase touch damping: dampingFactor = 0.2
- Pinch-to-zoom is already supported by OrbitControls
- Pass isMobile as a prop to ThreeOffice

---

## STEP 5: Agent cards (left panel and mobile agent list)

Create a refined AgentCard component. Each card shows:

- Agent emoji + name + status dot (colored, pulsing CSS animation if active)
- Role in secondary text color
- Status bar: thin 2px line in agent color, status label text
- Last activity: show the latest cron job name and relative time from agent.recentCrons. Example: "Last: competitors · 3h ago"
- If no recent crons, show next scheduled task based on this cron schedule:
  - scout: research 8AM, competitors 9AM, ai-tools-radar 2PM
  - engineer: product-expansion 3PM
  - command: ops-healthcheck 5AM, morning-brief 6AM, task-dispatch 8AM/12PM/4PM
  - capital: vc-tracking 10AM, fundraise-pipeline Tue/Thu 10AM
  - content: content 11AM, outreach-warmup 12PM
  - analyst: emsa-compliance 7AM
  Compute the NEXT upcoming task based on current time (use PST/America-Los_Angeles timezone). If all today's tasks passed, show tomorrow's first task.
- Model badge: "grok-4-1-fast" in monospace, 11px, muted color
- Token count if > 0

Selected card: left border 3px solid in agent color, background slightly lighter (#141A22).

Status dot animations:
- active: green #10B981 with CSS scale pulse (1 to 1.4 to 1 every 2s)
- idle: amber #F59E0B, no pulse
- error: red #EF4444, fast pulse (0.8s)
- offline: grey #475569, no pulse

On mobile: cards are full-width in the Agents tab. Tap opens AgentBottomSheet.

---

## STEP 6: Agent detail panel (right panel desktop / bottom sheet mobile)

When agent selected, show:

**Header row:** Large emoji (40px), agent name (20px bold), role (14px secondary text), status pill (colored background, rounded-full, white text "ACTIVE" or "IDLE" or "ERROR")

**Currently Working On card (background #141A22, rounded-lg, padding 16px):**
- If active + has recent cron: "Running: [job_name]" with topic badge and started time
- If idle: "Standing by" + next scheduled task with computed countdown like "in 2h 14m"

**Actions row:** 5 buttons in flex-wrap:
- Dispatch Task — filled with agent color background, white text
- Draft LinkedIn Post — ghost outline style
- Draft Email — ghost outline style
- Create PR — ghost outline style
- Approve and Deploy — ghost outline style
- All buttons: 13px font, padding 8px 16px, rounded-lg, border in agent color at 30% opacity, hover fills with agent color at 20% opacity

**Recent Output section (scrollable, max-height 300px desktop / 200px mobile):**
- Each entry shows: status dot (green=success, red=error, yellow=running) + job name + topic name + relative timestamp
- Below that: monospace output preview box (background #0A0E17, border #1E293B, padding 8px, font-size 12px, max 200 chars of output_preview text, word-break)
- If no output: "No output yet — daemon polling Telegram every 30s. Agent cron jobs will appear here when they run."

**Dispatch input (fixed at bottom of panel):**
- Text input: placeholder "Send task to [agent name]..." 
- Send button with agent color background
- On submit: call the useDispatch hook. Show brief success or error feedback inline.

---

## STEP 7: Bottom bar overhaul (desktop) / Status tab (mobile)

### Hardware section — visual telemetry cards

**RTX 5090 card:**
- Title: "RTX 5090" 
- GPU row: thin progress bar (4px, rounded, fill gradient green to yellow to red based on load) + percentage + temperature in degrees
- VRAM row: progress bar + "2.5/31.8GB" text
- Active model name + tok/s if available
- Service dots: Ollama (green/red), LiteLLM (green/red)

**Mac Mini M4 card:**
- Title: "Mac Mini M4"
- CPU row: progress bar + percentage
- MEM row: progress bar + "6.4/16GB"
- Service dots with labels: GW, VPN, n8n, Ollama
- Cross-machine ping if available

Progress bar specs: height 4px, background #1E293B, fill color based on value (under 60% = #10B981 green, 60-85% = #F59E0B yellow, over 85% = #EF4444 red). Rounded corners.

Service dots: green (#10B981) with slow pulse for online/healthy, red (#EF4444) for offline, grey (#475569) for null/unknown. Each dot has a small label next to it.

Add header text "HARDWARE" with a tiny green activity dot if data was received in last 60 seconds.

### Live Feed section

- Vertical scrollable list, last 15 messages
- Each message: small colored dot matching the inferred agent color, message text truncated to 80 chars, topic name as a small pill badge, relative timestamp
- New messages animate in with framer-motion (opacity 0 to 1, translateY -10 to 0)
- "Live (N)" header with pulsing green dot when messages exist

On mobile (Feed tab): full-screen scrollable feed with larger text entries.

### Mission priorities

- Keep existing progress bars
- Add subtle hover brightness effect on each row
- Show P0/P1 tags more prominently with matching color coding

---

## STEP 8: Header bar

- Left: "APOT SOLUTIONS" + "WALLTIME HQ · OPERATIONS CENTER"
- Center: 6 small status dots (one per agent, colored by their current status). Tooltip on hover showing agent name.
- Text next to dots: "N working · M idle" computed from actual agent statuses
- Right: Connection status indicators:
  - "SUPABASE" + green/red dot based on whether hooks are receiving data
  - "TELEGRAM" + green/red dot based on whether feed messages are arriving
  - "GITHUB" + green/red dot based on whether GitHub data loaded
- On mobile: compress header. Show only the 6 dots + "N working · M idle" count. Move connection indicators into the Status tab.

---

## STEP 9: Notification toasts

Create src/components/ui/Toast.tsx:
- When agent status changes from idle to active: show a toast like "Scout is now working on: research" with agent color left border
- Toast slides in from top-right, auto-dismisses after 4 seconds
- framer-motion enter/exit animation
- Stack up to 3 toasts vertically
- On mobile: toasts at top of screen, full-width

---

## STEP 10: index.css — Global polish

Add these styles:

```css
/* Thin dark scrollbars */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }

/* Status dot pulse keyframes */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.7; }
}

/* Samsung S26 Ultra safe areas for bottom tabs */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
}
```

---

## STEP 11: Meta viewport for mobile

In index.html, ensure these meta tags exist:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#0A0E17">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

---

## STEP 12: Verify and ship

1. npm run build — ZERO TypeScript errors, no warnings that break the build
2. Desktop test (npm run dev):
   - 3D office renders with 6 detailed characters (faces, hair, shadows)
   - Characters mostly sit at desks, occasionally walk slowly to other zones
   - Click agent in office → left panel highlights, right panel shows detail with output
   - Hardware bar shows real RTX + MAC stats with colored progress bars
   - Live feed shows Telegram messages with animations
   - Connection indicators in header reflect actual status
3. Mobile test (Chrome DevTools device toolbar → pick any phone around 412x915 viewport):
   - Bottom tab bar with 4 tabs (HQ, Agents, Status, Feed)
   - HQ tab: 3D office fills screen, labels visible, touch pan/zoom works
   - Agents tab: scrollable card list, tap opens bottom sheet with full agent detail
   - Status tab: hardware telemetry cards with progress bars
   - Feed tab: full scrollable message list
   - Content does not go behind phone navigation bar
4. git add -A && git commit -m "feat: production UI overhaul with mobile layout" && git push

## Constraints

- TypeScript strict, zero any
- Vanilla Three.js for 3D (no react-three-fiber, no drei)
- framer-motion for all panel/sheet/toast animations
- No external 3D model files (.glb, .gltf, .obj)
- No Tailwind classes in dynamically created DOM elements (CSS2DObject labels must use inline styles only)
- Do NOT modify the daemon, Supabase schema, or telemetry pipeline
- Do NOT break existing hooks or data flow
- All new components must be fully typed with TypeScript interfaces
