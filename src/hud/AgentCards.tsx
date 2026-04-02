import { motion } from 'framer-motion';
import { AGENT_CONFIGS, useAgentStore } from '../store/agentStore';

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  working: 'Working',
  thinking: 'Thinking...',
  collaborating: 'Collaborating',
  coffee: 'Coffee Break',
  gym: 'At Gym',
};

const STATUS_COLORS: Record<string, string> = {
  idle: '#64748b',
  working: '#22c55e',
  thinking: '#8B5CF6',
  collaborating: '#3B82F6',
  coffee: '#F59E0B',
  gym: '#EC4899',
};

export function AgentCards() {
  const agents = useAgentStore(s => s.agents);
  const focusedAgent = useAgentStore(s => s.focusedAgent);
  const setFocusedAgent = useAgentStore(s => s.setFocusedAgent);

  return (
    <div className="flex flex-col gap-2">
      {AGENT_CONFIGS.map((cfg, i) => {
        const state = agents.get(cfg.id);
        const status = state?.status ?? 'idle';
        const tokens = state?.tokens ?? 0;
        const isFocused = focusedAgent === cfg.id;

        return (
          <motion.div
            key={cfg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setFocusedAgent(isFocused ? null : cfg.id)}
            className="cursor-pointer rounded-lg p-2.5 transition-all duration-200"
            style={{
              background: isFocused
                ? `rgba(${hexToRgb(cfg.color)}, 0.15)`
                : 'rgba(10, 14, 23, 0.75)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isFocused ? cfg.color : 'rgba(255,255,255,0.08)'}`,
              borderLeft: `3px solid ${cfg.color}`,
              boxShadow: isFocused ? `0 0 12px ${cfg.color}40` : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{cfg.emoji}</span>
                <span className="text-xs font-bold text-white">{cfg.displayName}</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: STATUS_COLORS[status],
                    boxShadow: `0 0 6px ${STATUS_COLORS[status]}`,
                    animation: status === 'working' ? 'pulse-soft 1.5s infinite' : 'none',
                  }}
                />
                <span className="text-xs" style={{ color: STATUS_COLORS[status] }}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 truncate mb-1" style={{ maxWidth: '100%' }}>
              {state?.lastAction ?? 'Initializing...'}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: cfg.color }}>
                {tokens.toLocaleString()} tok
              </span>
              <span className="text-xs text-slate-500 font-mono">{cfg.model}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
