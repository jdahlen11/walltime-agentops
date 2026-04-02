import type { TelegramGetUpdatesResponse, TelegramMessage } from './types'

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined

export const TELEGRAM_CONFIGURED = Boolean(BOT_TOKEN && BOT_TOKEN.length > 10)

const BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null

// ── Fetch updates ───────────────────────────────────────────

let lastUpdateId = 0

export async function fetchTelegramUpdates(): Promise<TelegramMessage[]> {
  if (!BASE) return []
  try {
    const params = new URLSearchParams({
      timeout: '0',
      allowed_updates: JSON.stringify(['message']),
      ...(lastUpdateId > 0 ? { offset: String(lastUpdateId + 1) } : {}),
    })
    const res = await fetch(`${BASE}/getUpdates?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: TelegramGetUpdatesResponse = await res.json()
    if (!json.ok) throw new Error(json.description ?? 'Telegram error')
    const messages: TelegramMessage[] = []
    for (const update of json.result) {
      if (update.update_id > lastUpdateId) lastUpdateId = update.update_id
      if (update.message) messages.push(update.message)
    }
    return messages
  } catch (err) {
    console.error('[telegram] fetchUpdates', err)
    return []
  }
}

// ── Fetch recent messages via getChatHistory trick ──────────
// Telegram Bot API doesn't support chat history, so we use updates.
// For initial load we return empty — real messages arrive via polling.

export async function sendMessage(
  text: string,
  threadId?: number,
): Promise<number | null> {
  if (!BASE || !CHAT_ID) return null
  try {
    const body: Record<string, string | number> = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    }
    if (threadId !== undefined) body.message_thread_id = threadId
    const res = await fetch(`${BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { ok: boolean; result?: { message_id: number } }
    if (!json.ok) throw new Error('sendMessage failed')
    return json.result?.message_id ?? null
  } catch (err) {
    console.error('[telegram] sendMessage', err)
    return null
  }
}

// ── Dispatch command ─────────────────────────────────────────

export async function dispatchToAgent(
  agentId: string,
  taskText: string,
): Promise<number | null> {
  const text = `/dispatch ${agentId} ${taskText}`
  // Post to the Tasks topic (46)
  return sendMessage(text, 46)
}
