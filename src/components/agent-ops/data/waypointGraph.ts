import { Waypoint } from '../types'

// Desk waypoints are at the chair position (where characters actually sit)
// Left row (Y=0): chair is at deskPos + [0, 0, +0.55]
// Right row (Y=π): chair is at deskPos + [0, 0, -0.55]
export const WAYPOINTS: Waypoint[] = [
  // Left column desk chairs
  { id: 'desk-scout',    position: [-3.5, 0, -1.95], connections: ['aisle-left-north'] },
  { id: 'desk-engineer', position: [-3.5, 0,  0.55], connections: ['aisle-left-center'] },
  { id: 'desk-command',  position: [-3.5, 0,  3.05], connections: ['aisle-left-south'] },
  // Right column desk chairs
  { id: 'desk-capital',  position: [ 3.5, 0, -3.05], connections: ['aisle-right-north'] },
  { id: 'desk-content',  position: [ 3.5, 0, -0.55], connections: ['aisle-right-center'] },
  { id: 'desk-analyst',  position: [ 3.5, 0,  1.95], connections: ['aisle-right-south'] },

  // Aisle waypoints — funnel desk chairs into the center walkway
  { id: 'aisle-left-north',   position: [-1.5, 0, -2.0], connections: ['desk-scout',   'center', 'meeting-approach'] },
  { id: 'aisle-left-center',  position: [-1.5, 0,  0.5], connections: ['desk-engineer', 'center'] },
  { id: 'aisle-left-south',   position: [-1.5, 0,  3.0], connections: ['desk-command',  'center'] },
  { id: 'aisle-right-north',  position: [ 1.5, 0, -3.0], connections: ['desk-capital',  'center', 'meeting-approach'] },
  { id: 'aisle-right-center', position: [ 1.5, 0, -0.5], connections: ['desk-content',  'center'] },
  { id: 'aisle-right-south',  position: [ 1.5, 0,  2.0], connections: ['desk-analyst',  'center'] },

  // Center walkway hub
  { id: 'center', position: [0, 0, 0.5], connections: [
    'aisle-left-north', 'aisle-left-center', 'aisle-left-south',
    'aisle-right-north', 'aisle-right-center', 'aisle-right-south',
    'coffee-approach', 'meeting-approach',
  ]},

  // Coffee station (against left wall)
  { id: 'coffee-approach', position: [-4.0, 0, 1.0], connections: ['center', 'coffee'] },
  { id: 'coffee',          position: [-5.5, 0, 1.0], connections: ['coffee-approach'] },

  // Meeting table (center-back)
  { id: 'meeting-approach', position: [0, 0, -2.0], connections: [
    'center', 'aisle-left-north', 'aisle-right-north',
    'meeting-1', 'meeting-2', 'meeting-3', 'meeting-4',
  ]},
  { id: 'meeting-1', position: [ 0.0, 0, -3.4], connections: ['meeting-approach'] },
  { id: 'meeting-2', position: [ 0.0, 0, -0.6], connections: ['meeting-approach'] },
  { id: 'meeting-3', position: [-1.4, 0, -2.0], connections: ['meeting-approach'] },
  { id: 'meeting-4', position: [ 1.4, 0, -2.0], connections: ['meeting-approach'] },
]

export function bfsPath(fromId: string, toId: string): string[] {
  if (fromId === toId) return [fromId]
  const visited = new Set<string>()
  const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }]
  const wpMap = new Map(WAYPOINTS.map(w => [w.id, w]))
  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.id)) continue
    visited.add(current.id)
    const wp = wpMap.get(current.id)
    if (!wp) continue
    for (const neighbor of wp.connections) {
      const newPath = [...current.path, neighbor]
      if (neighbor === toId) return newPath
      if (!visited.has(neighbor)) queue.push({ id: neighbor, path: newPath })
    }
  }
  return [fromId]
}

export function getWaypointPos(id: string): [number, number, number] {
  const wp = WAYPOINTS.find(w => w.id === id)
  return wp ? wp.position : [0, 0, 0]
}
