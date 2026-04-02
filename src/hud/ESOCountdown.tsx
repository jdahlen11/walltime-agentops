import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET = new Date('2026-04-16T09:00:00-07:00');

function getTimeLeft() {
  const now = Date.now();
  const diff = Math.max(0, TARGET.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const prevRef = useRef(value);
  const changed = prevRef.current !== value;
  if (changed) prevRef.current = value;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-md"
        style={{
          width: '52px',
          height: '64px',
          background: 'rgba(0, 30, 60, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformOrigin: 'center', backfaceVisibility: 'hidden' }}
          >
            <span
              className="text-3xl font-bold font-mono"
              style={{ color: '#00D4FF', textShadow: '0 0 12px #00D4FF' }}
            >
              {String(value).padStart(2, '0')}
            </span>
          </motion.div>
        </AnimatePresence>
        {/* Center divider */}
        <div
          className="absolute left-0 right-0"
          style={{ top: '50%', height: '1px', background: 'rgba(0,212,255,0.2)' }}
        />
      </div>
      <span className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function ESOCountdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 212, 255, 0.25)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">ESO Meeting</span>
        <span className="text-xs font-bold" style={{ color: '#00D4FF' }}>Apr 16, 2026</span>
      </div>
      <div className="flex gap-2 justify-center">
        <FlipUnit value={time.days} label="days" />
        <div className="flex items-center pb-5 text-xl font-bold" style={{ color: '#00D4FF' }}>:</div>
        <FlipUnit value={time.hours} label="hrs" />
        <div className="flex items-center pb-5 text-xl font-bold" style={{ color: '#00D4FF' }}>:</div>
        <FlipUnit value={time.minutes} label="min" />
        <div className="flex items-center pb-5 text-xl font-bold" style={{ color: '#00D4FF' }}>:</div>
        <FlipUnit value={time.seconds} label="sec" />
      </div>
    </div>
  );
}
