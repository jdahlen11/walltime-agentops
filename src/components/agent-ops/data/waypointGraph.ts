import { Waypoint } from '../types'

export const WAYPOINTS: Waypoint[] = [
  { id: 'desk-scout',    position: [-5, 0, -2.5], connections: ['aisle-left-front'] },
  { id: 'desk-engineer', position: [0,  0, -2.5], connections: ['aisle-center-front'] },
  { id: 'desk-command',  position: [5,  0, -2.5], connections: ['aisle-right-front'] },
  { id: 'desk-capital',  position: [-5, 0, 2.5],  connections: ['aisle-left-back'] },
  { id: 'desk-content',  position: [0,  0, 2.5],  connections: ['aisle-center-back'] },
  { id: 'desk-analyst',  position: [5,  0, 2.5],  connections: ['aisle-right-back'] },

  { id: 'aisle-left-front',   position: [-5, 0, 0],   connections: ['desk-scout', 'center', 'aisle-left-back'] },
  { id: 'aisle-center-front', position: [0,  0, -1.5], connections: ['desk-engineer', 'center'] },
  { id: 'aisle-right-front',  position: [5,  0, 0],   connections: ['desk-command', 'center', 'aisle-right-back'] },
  { id: 'aisle-left-back',    position: [-5, 0, 1],   connections: ['desk-capital', 'center', 'aisle-left-front'] },
  { id: 'aisle-center-back',  position: [0,  0, 1.5], connections: ['desk-content', 'center'] },
  { id: 'aisle-right-back',   position: [5,  0, 1],   connections: ['desk-analyst', 'center', 'aisle-right-front'] },

  { id: 'center',        position: [0, 0, 0],    connections: ['aisle-left-front', 'aisle-center-front', 'aisle-right-front', 'aisle-left-back', 'aisle-center-back', 'aisle-right-back', 'coffee', 'meeting-approach'] },
  { id: 'coffee',        position: [8, 0, 0],    connections: ['center'] },
  { id: 'meeting-approach', position: [0, 0, 3], connections: ['center', 'meeting-1', 'meeting-2', 'meeting-3', 'meeting-4'] },
  { id: 'meeting-1',    position: [-1.5, 0, 4.5], connections: ['meeting-approach'] },
  { id: 'meeting-2',    position: [1.5,  0, 4.5], connections: ['meeting-approach'] },
  { id: 'meeting-3',    position: [-1.5, 0, 6.5], connections: ['meeting-approach'] },
  { id: 'meeting-4',    position: [1.5,  0, 6.5], connections: ['meeting-approach'] },
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
