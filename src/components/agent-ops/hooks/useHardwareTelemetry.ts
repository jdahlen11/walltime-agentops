import { create } from 'zustand'

interface HW {
  rtx: { vram: number; tokPerSec: number; gpuUtil: number; tempC: number }
  mac: { cpu: number; mem: number; crons: number; online: boolean }
  jitter: () => void
}

function j(v: number, r = 3) { return Math.max(0, Math.min(100, v + (Math.random() - 0.5) * r * 2)) }

export const useHardwareTelemetry = create<HW>(set => ({
  rtx: { vram: 68, tokPerSec: 59.89, gpuUtil: 42, tempC: 62 },
  mac: { cpu: 34, mem: 52, crons: 18, online: true },
  jitter: () => set(s => ({
    rtx: { vram: j(s.rtx.vram, 2), tokPerSec: Math.max(50, s.rtx.tokPerSec + (Math.random() - 0.5) * 2), gpuUtil: j(s.rtx.gpuUtil, 3), tempC: j(s.rtx.tempC, 1) },
    mac: { ...s.mac, cpu: j(s.mac.cpu, 3), mem: j(s.mac.mem, 2) },
  }))
}))
