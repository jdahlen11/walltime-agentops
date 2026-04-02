import { useState, useEffect } from 'react'
import { differenceInSeconds } from 'date-fns'

const TARGET = new Date('2026-04-16T17:00:00Z') // 09:00 PST

export function useESOCountdown() {
  const [secs, setSecs] = useState(() => Math.max(0, differenceInSeconds(TARGET, new Date())))
  useEffect(() => {
    const id = setInterval(() => setSecs(Math.max(0, differenceInSeconds(TARGET, new Date()))), 1000)
    return () => clearInterval(id)
  }, [])
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
  }
}
