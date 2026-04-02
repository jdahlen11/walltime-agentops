import type { GitHubCommit, GitHubPR, GitHubRun, RepoStatus } from './types'

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined
const OWNER = (import.meta.env.VITE_GITHUB_OWNER as string | undefined) ?? 'jdahlen11'

export const GITHUB_CONFIGURED = Boolean(TOKEN && TOKEN.length > 10)

function headers() {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

async function ghFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers: headers() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    console.error('[github] fetch', path, err)
    return null
  }
}

export async function fetchRepoStatus(repo: string): Promise<RepoStatus> {
  const [commits, prs, runs] = await Promise.all([
    ghFetch<GitHubCommit[]>(`/repos/${OWNER}/${repo}/commits?per_page=1`),
    ghFetch<GitHubPR[]>(`/repos/${OWNER}/${repo}/pulls?state=open&per_page=5`),
    ghFetch<{ workflow_runs: GitHubRun[] }>(`/repos/${OWNER}/${repo}/actions/runs?per_page=1`),
  ])

  return {
    repo,
    lastCommit: commits?.[0] ?? null,
    openPRs: prs ?? [],
    lastRun: runs?.workflow_runs?.[0] ?? null,
    error: !GITHUB_CONFIGURED ? 'Add VITE_GITHUB_TOKEN to .env.local' : null,
  }
}
