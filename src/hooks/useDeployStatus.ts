import { useState, useEffect } from 'react'
import type { RepoStatus } from '../lib/types'
import { fetchRepoStatus, GITHUB_CONFIGURED } from '../lib/github'

const REPOS = ['walltime', 'walltime-agentops']
const POLL_MS = 60_000

export function useDeployStatus() {
  const [statuses, setStatuses] = useState<RepoStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!GITHUB_CONFIGURED) {
      setLoading(false)
      setStatuses(REPOS.map((repo) => ({
        repo,
        lastCommit: null,
        openPRs: [],
        lastRun: null,
        error: 'Add VITE_GITHUB_TOKEN to .env.local',
      })))
      return
    }

    const load = async () => {
      const results = await Promise.all(REPOS.map(fetchRepoStatus))
      setStatuses(results)
      setLoading(false)
    }

    load()
    const interval = setInterval(load, POLL_MS)
    return () => clearInterval(interval)
  }, [])

  return { statuses, loading, configured: GITHUB_CONFIGURED }
}
