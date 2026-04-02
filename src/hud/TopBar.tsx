import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAgentStore } from '../store/agentStore';
import { useHardwareStore } from '../store/hardwareStore';

const GRADIENT_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

export function TopBar({ onMeetingOpen }: { onMeetingOpen: () => void }) {
  const [time, setTime] = useState(new Date());
  const [colorIdx, setColorIdx] = useState(0);
  const mac = useHardwareStore(s => s.mac);
  const agents = useAgentStore(s => s.agents);
  const activeAgents = Array.from(agents.values()).filter(a => a.status !== 'idle').length;

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    const colorCycle = setInterval(() => setColorIdx(i => (i + 1) % GRADIENT_COLORS.length), 2000);
    return () => { clearInterval(tick); clearInterval(colorCycle); };
  }, []);

  const c1 = GRADIENT_COLORS[colorIdx];
  const c2 = GRADIENT_COLORS[(colorIdx + 2) % GRADIENT_COLORS.length];

  return (
    <div
      className="flex items-center justify-between px-4 py-2 rounded-xl"
      style={{
        background: 'rgba(10, 14, 23, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <span
          className="text-lg font-bold"
          style={{
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transition: 'all 1s ease',
            textShadow: 'none',
          }}
        >
          WallTime AgentOps
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-mono"
          style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          v2.1
        </span>
      </div>

      {/* Center: Clock */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-mono text-slate-300">
          {format(time, "EEEE, MMMM d, yyyy")}
        </span>
        <span
          className="text-xl font-mono font-bold"
          style={{ color: '#00D4FF', textShadow: '0 0 8px #00D4FF50' }}
        >
          {format(time, "HH:mm:ss")} PST
        </span>
      </div>

      {/* Right: Status + Meeting Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #22c55e' }} />
            {activeAgents} active
          </span>
          <span className="text-slate-600">•</span>
          <span>{mac.cronJobs} crons</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #22c55e' }} />
            2 nodes
          </span>
        </div>

        <button
          onClick={onMeetingOpen}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(0,212,255,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#e2e8f0',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          Agent Meeting
        </button>
      </div>
    </div>
  );
}
