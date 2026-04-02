import { create } from 'zustand'

interface HardwareState {
  rtx: {
    vram: number
    tokPerSec: number
    gpuUtil: number
    tempC: number
  }
  mac: {
    cpu: number
    mem: number
    crons: number
    online: boolean
  }
  jitter: () => void
}

function jit(v: number, range = 3): number {
  return Math.max(0, Math.min(100, v + (Math.random() - 0.5) * range * 2))
}

export const useHardwareStore = create<HardwareState>((set) => ({
  rtx: { vram: 68, tokPerSec: 59.89, gpuUtil: 42, tempC: 62 },
  mac: { cpu: 34, mem: 52, crons: 18, online: true },
  jitter: () => set(s => ({
    rtx: {
      vram: jit(s.rtx.vram, 2),
      tokPerSec: Math.max(50, s.rtx.tokPerSec + (Math.random() - 0.5) * 2),
      gpuUtil: jit(s.rtx.gpuUtil, 3),
      tempC: jit(s.rtx.tempC, 1),
    },
    mac: {
      ...s.mac,
      cpu: jit(s.mac.cpu, 3),
      mem: jit(s.mac.mem, 2),
    }
  }))
}))
