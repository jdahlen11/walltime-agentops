import { create } from 'zustand';

export interface RTX5090State {
  vramUsage: number;   // 0-1
  tokensPerSec: number;
  gpuLoad: number;     // 0-1
  temp: number;        // celsius
  pingMs: number;
  activeModel: string;
}

export interface MacMiniState {
  cpuUsage: number;    // 0-1
  memUsage: number;    // 0-1
  cronJobs: number;
  gatewayOnline: boolean;
  tailscaleConnected: boolean;
}

interface HardwareStore {
  rtx: RTX5090State;
  mac: MacMiniState;
  tick: () => void;
}

function jitter(val: number, maxDelta: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * maxDelta;
  return Math.max(min, Math.min(max, val + delta));
}

export const useHardwareStore = create<HardwareStore>((set, get) => ({
  rtx: {
    vramUsage: 0.68,
    tokensPerSec: 59.89,
    gpuLoad: 0.42,
    temp: 62,
    pingMs: 4,
    activeModel: 'qwen3:32b',
  },
  mac: {
    cpuUsage: 0.34,
    memUsage: 0.52,
    cronJobs: 18,
    gatewayOnline: true,
    tailscaleConnected: true,
  },
  tick: () => {
    const { rtx, mac } = get();
    set({
      rtx: {
        ...rtx,
        vramUsage: jitter(rtx.vramUsage, 0.03, 0.55, 0.85),
        tokensPerSec: jitter(rtx.tokensPerSec, 2.5, 45, 72),
        gpuLoad: jitter(rtx.gpuLoad, 0.04, 0.28, 0.65),
        temp: jitter(rtx.temp, 1.5, 55, 75),
        pingMs: jitter(rtx.pingMs, 1, 2, 12),
      },
      mac: {
        ...mac,
        cpuUsage: jitter(mac.cpuUsage, 0.04, 0.18, 0.58),
        memUsage: jitter(mac.memUsage, 0.02, 0.42, 0.68),
      },
    });
  },
}));
