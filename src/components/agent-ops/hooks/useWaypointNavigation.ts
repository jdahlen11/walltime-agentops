import { useCallback } from 'react'
import * as THREE from 'three'

const _v3 = new THREE.Vector3()
const _target = new THREE.Vector3()

export function useWaypointNavigation() {
  const moveToward = useCallback((
    currentPos: [number, number, number],
    targetPos: [number, number, number],
    currentAngle: number,
    delta: number,
    speed: number = 2.5
  ): { newPos: [number, number, number]; newAngle: number; arrived: boolean } => {
    _v3.set(...currentPos)
    _target.set(...targetPos)
    const dist = _v3.distanceTo(_target)

    if (dist < 0.1) {
      return { newPos: targetPos, newAngle: currentAngle, arrived: true }
    }

    const dx = targetPos[0] - currentPos[0]
    const dz = targetPos[2] - currentPos[2]
    const targetAngle = Math.atan2(dx, dz)

    let angleDiff = targetAngle - currentAngle
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
    const newAngle = currentAngle + angleDiff * Math.min(1, delta * 8)

    const moveStep = Math.min(dist, speed * delta)
    const nx = currentPos[0] + (dx / dist) * moveStep
    const nz = currentPos[2] + (dz / dist) * moveStep

    return {
      newPos: [nx, 0, nz],
      newAngle,
      arrived: false,
    }
  }, [])

  return { moveToward }
}
