import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface APOTData {
  activeWalls: number;
  avgApot: number;
  p90: number;
  exceedances: number;
}

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateData(): APOTData {
  return {
    activeWalls: Math.floor(randomInRange(5, 14)),
    avgApot: randomInRange(16, 26),
    p90: randomInRange(24, 32),
    exceedances: Math.floor(randomInRange(2, 9)),
  };
}

export function APOTMonitor() {
  const [data, setData] = useState<APOTData>(generateData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const apotColor = data.avgApot < 20 ? '#22c55e' : data.avgApot < 30 ? '#F59E0B' : '#ef4444';
  const p90Status = data.p90 < 30 ? 'COMPLIANT' : 'EXCEEDED';
  const p90Color = data.p90 < 30 ? '#22c55e' : '#ef4444';

  return (
    <div className="grid grid-cols-2 gap-2">
      <APOTCard title="Active Walls" accent="#00D4FF">
        <motion.span
          key={data.activeWalls}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-white"
        >
          {data.activeWalls}
        </motion.span>
        <span className="text-xs text-slate-400">hospitals monitored</span>
      </APOTCard>

      <APOTCard title="Avg APOT" accent={apotColor}>
        <motion.span
          key={data.avgApot.toFixed(1)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold"
          style={{ color: apotColor }}
        >
          {data.avgApot.toFixed(1)}
          <span className="text-sm font-normal text-slate-400"> min</span>
        </motion.span>
        <span className="text-xs" style={{ color: apotColor }}>
          {data.avgApot < 20 ? '✓ TARGET MET' : data.avgApot < 30 ? '⚠ NEAR LIMIT' : '✗ OVER TARGET'}
        </span>
      </APOTCard>

      <APOTCard title="P90" accent={p90Color}>
        <motion.span
          key={data.p90.toFixed(1)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold"
          style={{ color: p90Color }}
        >
          {data.p90.toFixed(1)}
          <span className="text-sm font-normal text-slate-400"> min</span>
        </motion.span>
        <span className="text-xs font-bold" style={{ color: p90Color }}>
          {p90Status}
        </span>
      </APOTCard>

      <APOTCard title="Exceedances" accent={data.exceedances > 5 ? '#ef4444' : '#F59E0B'}>
        <motion.span
          key={data.exceedances}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold"
          style={{ color: data.exceedances > 5 ? '#ef4444' : '#F59E0B' }}
        >
          {data.exceedances}
        </motion.span>
        <span className="text-xs text-slate-400">this period</span>
      </APOTCard>
    </div>
  );
}

function APOTCard({ title, accent, children }: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-0.5"
      style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accent}30`,
      }}
    >
      <span className="text-xs text-slate-500 uppercase tracking-wider">{title}</span>
      {children}
    </div>
  );
}
