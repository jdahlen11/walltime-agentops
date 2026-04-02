import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Mission {
  label: string;
  progress: number;
  color: string;
  targetDate?: string;
}

const MISSIONS: Mission[] = [
  { label: 'Cedars Accelerator', progress: 72, color: '#8B5CF6', targetDate: 'Apr 16' },
  { label: 'ESO Integration', progress: 45, color: '#3B82F6', targetDate: 'Apr 16' },
  { label: '$500K SAFE', progress: 30, color: '#F59E0B' },
  { label: 'RLS Compliance', progress: 95, color: '#22c55e' },
];

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx="26"
        cy="26"
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="3"
      />
      <motion.circle
        cx="26"
        cy="26"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

export function MissionPriorities() {
  return (
    <div className="flex items-center gap-4">
      {MISSIONS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="relative flex items-center justify-center">
            <ProgressRing progress={m.progress} color={m.color} />
            <span
              className="absolute text-xs font-bold font-mono"
              style={{ color: m.color }}
            >
              {m.progress}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white font-medium leading-tight">{m.label}</span>
            {m.targetDate && (
              <span className="text-xs text-slate-500">{m.targetDate}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
