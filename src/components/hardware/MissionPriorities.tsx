import { useState } from 'react'
import type { MissionPriorityRow } from '../../lib/types'

interface MissionPrioritiesProps {
  priorities: MissionPriorityRow[]
  onUpdate: (id: string, progress: number) => void
}

export default function MissionPriorities({ priorities, onUpdate }: MissionPrioritiesProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const startEdit = (p: MissionPriorityRow) => {
    setEditing(p.id)
    setEditVal(String(p.progress))
  }

  const commitEdit = (id: string) => {
    const val = parseInt(editVal, 10)
    if (!isNaN(val) && val >= 0 && val <= 100) onUpdate(id, val)
    setEditing(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
        MISSION
      </div>
      {priorities.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'filter 0.15s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)' }}
        >
          {/* Tag badge */}
          {p.tag && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: p.color,
                background: p.color + '25',
                border: `1px solid ${p.color}40`,
                borderRadius: 3,
                padding: '1px 5px',
                flexShrink: 0,
              }}
            >
              {p.tag}
            </div>
          )}
          {/* Label */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', minWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.label}
          </div>
          {/* Progress bar */}
          <div style={{ flex: 1, height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden', minWidth: 30 }}>
            <div style={{ height: '100%', width: `${p.progress}%`, background: p.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          {/* Percentage — click to edit */}
          {editing === p.id ? (
            <input
              type="number" value={editVal} min={0} max={100}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={() => commitEdit(p.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(p.id) }}
              autoFocus
              style={{ width: 42, background: 'rgba(255,255,255,0.08)', border: `1px solid ${p.color}`, borderRadius: 4, padding: '1px 4px', fontSize: 11, color: 'rgba(255,255,255,0.85)', outline: 'none', textAlign: 'right' }}
            />
          ) : (
            <div
              onClick={() => startEdit(p)}
              title="Click to edit"
              style={{ fontSize: 12, fontWeight: 600, color: p.color, cursor: 'pointer', minWidth: 32, textAlign: 'right', padding: '1px 4px', borderRadius: 3 }}
            >
              {p.progress}%
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
