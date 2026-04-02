import { useRef, useState, useEffect, useCallback } from 'react'
import type { AgentView, AgentId } from '../../lib/types'

interface OfficeSceneProps {
  agents: AgentView[]
  selectedAgentId: AgentId | null
  onSelectAgent: (id: AgentId) => void
}

// Isometric transform: each tile is 64×32px at scale 1
const TILE_W = 64
const TILE_H = 32

// Convert grid (col, row) to screen (x, y)
function isoProject(col: number, row: number, z = 0) {
  return {
    x: (col - row) * (TILE_W / 2),
    y: (col + row) * (TILE_H / 2) - z * TILE_H,
  }
}

// Agent desk positions in grid coords
const DESK_POSITIONS: Record<AgentId, [number, number]> = {
  scout: [1, 1],
  engineer: [3, 1],
  command: [5, 1],
  capital: [1, 4],
  content: [3, 4],
  analyst: [5, 4],
}

// Floor tile grid bounds
const GRID_COLS = 8
const GRID_ROWS = 7

export default function OfficeScene({ agents, selectedAgentId, onSelectAgent }: OfficeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.1)
  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = false }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(2.5, Math.max(0.5, z - e.deltaY * 0.001)))
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    const el = containerRef.current
    if (el) el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (el) el.removeEventListener('wheel', handleWheel)
    }
  }, [handleMouseMove, handleMouseUp, handleWheel])

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]))

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 40%, #0d1420 0%, #070b12 100%)',
        cursor: dragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Office title */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          WALLTIME HEADQUARTERS
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: '0.1em' }}>
          {agents.filter(a => a.status === 'active' || a.status === 'processing').length} WORKING ·{' '}
          {agents.filter(a => a.status === 'idle').length} IDLE ·{' '}
          {agents.filter(a => a.status === 'error').length} ERROR
        </div>
      </div>

      {/* Isometric scene */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Floor tiles */}
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => {
            const pos = isoProject(col, row)
            const isEdge = col === 0 || col === GRID_COLS - 1 || row === 0 || row === GRID_ROWS - 1
            return (
              <FloorTile key={`${col}-${row}`} x={pos.x} y={pos.y} dark={isEdge} />
            )
          })
        )}

        {/* Wall (back) */}
        <WallSegment col={0} row={0} length={GRID_COLS} />

        {/* Furniture */}
        <ServerRack col={6} row={5} />
        <ServerRack col={7} row={4} />
        <CoffeeStation col={0} row={3} />
        <MeetingTable col={3} row={2} />
        <PlantDeco col={7} row={0} />
        <PlantDeco col={0} row={6} />

        {/* Agent desks + characters */}
        {agents.map((agent) => {
          const [col, row] = DESK_POSITIONS[agent.id] ?? [0, 0]
          const isSelected = selectedAgentId === agent.id
          return (
            <AgentDesk
              key={agent.id}
              agent={agent}
              col={col}
              row={row}
              selected={isSelected}
              onClick={() => onSelectAgent(agent.id)}
            />
          )
        })}
      </div>

      {/* Controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}
      >
        Drag to pan · Scroll to zoom
      </div>
    </div>
  )
}

// ── Iso tile ───────────────────────────────────────────────

function FloorTile({ x, y, dark }: { x: number; y: number; dark?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: TILE_W,
        height: TILE_H,
        transform: 'translate(-50%, -50%)',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        background: dark
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(255,255,255,0.04)',
        border: 'none',
      }}
    />
  )
}

// ── Wall segment ─────────────────────────────────────────────

function WallSegment({ col, row, length }: { col: number; row: number; length: number }) {
  return (
    <>
      {Array.from({ length }, (_, i) => {
        const pos = isoProject(col + i, row)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x - TILE_W / 2,
              top: pos.y - TILE_H * 2,
              width: TILE_W,
              height: TILE_H * 2,
              background: 'rgba(255,255,255,0.04)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        )
      })}
    </>
  )
}

// ── Server rack ──────────────────────────────────────────────

function ServerRack({ col, row }: { col: number; row: number }) {
  const pos = isoProject(col, row, 1.5)
  return (
    <IsoBox
      x={pos.x}
      y={pos.y}
      w={TILE_W * 0.7}
      h={TILE_H * 3}
      depth={TILE_H * 0.6}
      topColor="#1a2340"
      leftColor="#111a2e"
      rightColor="#0d1525"
      topContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 8px', width: '100%' }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} style={{ height: 4, background: i === 0 ? '#10B981' : 'rgba(255,255,255,0.08)', borderRadius: 2 }} />
          ))}
          <div style={{ fontSize: 8, color: '#3B82F6', textAlign: 'center', letterSpacing: '0.05em' }}>RTX 5090</div>
        </div>
      }
    />
  )
}

// ── Coffee station ────────────────────────────────────────────

function CoffeeStation({ col, row }: { col: number; row: number }) {
  const pos = isoProject(col, row, 0.8)
  return (
    <IsoBox
      x={pos.x}
      y={pos.y}
      w={TILE_W * 0.5}
      h={TILE_H * 1.5}
      depth={TILE_H * 0.5}
      topColor="#2a1a0a"
      leftColor="#1a0f05"
      rightColor="#120a03"
      topContent={<div style={{ fontSize: 14, textAlign: 'center', marginTop: 4 }}>☕</div>}
    />
  )
}

// ── Meeting table ─────────────────────────────────────────────

function MeetingTable({ col, row }: { col: number; row: number }) {
  const pos = isoProject(col, row, 0.5)
  return (
    <IsoBox
      x={pos.x}
      y={pos.y}
      w={TILE_W * 1.4}
      h={TILE_H * 0.8}
      depth={TILE_H * 0.4}
      topColor="#1a2a1a"
      leftColor="#111f11"
      rightColor="#0d1a0d"
      topContent={<div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textAlign: 'center', paddingTop: 4 }}>STANDUP</div>}
    />
  )
}

// ── Plant decoration ──────────────────────────────────────────

function PlantDeco({ col, row }: { col: number; row: number }) {
  const pos = isoProject(col, row, 0.5)
  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', fontSize: 20, zIndex: 5 }}>
      🌿
    </div>
  )
}

// ── Agent desk + character ─────────────────────────────────────

function AgentDesk({
  agent,
  col,
  row,
  selected,
  onClick,
}: {
  agent: AgentView
  col: number
  row: number
  selected: boolean
  onClick: () => void
}) {
  const deskPos = isoProject(col, row, 0.5)
  const charPos = isoProject(col, row, 1.2)

  const isWorking = agent.status === 'active' || agent.status === 'processing'

  return (
    <>
      {/* Selection ring */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            left: deskPos.x,
            top: deskPos.y,
            transform: 'translate(-50%, -50%)',
            width: TILE_W * 1.4,
            height: TILE_H * 1.4,
            borderRadius: '50%',
            border: `2px solid ${agent.color}`,
            boxShadow: `0 0 20px ${agent.color}60`,
            animation: 'spin 4s linear infinite',
            zIndex: 2,
            clipPath: 'none',
          }}
        />
      )}

      {/* Desk box */}
      <IsoBox
        x={deskPos.x}
        y={deskPos.y}
        w={TILE_W * 0.9}
        h={TILE_H * 0.8}
        depth={TILE_H * 0.4}
        topColor={selected ? agent.color + '20' : '#141e2e'}
        leftColor="#0d1525"
        rightColor="#0a1020"
        topContent={
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              color: isWorking ? agent.color : 'rgba(255,255,255,0.2)',
              background: isWorking ? agent.color + '20' : 'transparent',
              borderRadius: 3,
              padding: 2,
            }}
          >
            {isWorking ? '▮▮▮' : '───'}
          </div>
        }
        onClick={onClick}
        zIndex={3}
      />

      {/* Agent character */}
      <div
        onClick={onClick}
        style={{
          position: 'absolute',
          left: charPos.x,
          top: charPos.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Body */}
        <div
          style={{
            width: 26,
            height: 32,
            borderRadius: '50% 50% 30% 30%',
            background: `linear-gradient(180deg, ${agent.color}dd 0%, ${agent.color}99 100%)`,
            border: selected ? `2px solid ${agent.color}` : '2px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            boxShadow: isWorking ? `0 0 10px ${agent.color}80` : 'none',
            transition: 'all 0.3s',
            position: 'relative',
          }}
        >
          {agent.emoji}
          {/* Status dot */}
          <div
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: agent.status === 'active' ? '#10B981' : agent.status === 'processing' ? '#F59E0B' : agent.status === 'error' ? '#EF4444' : 'rgba(255,255,255,0.2)',
              border: '1.5px solid #0a0e17',
              boxShadow: agent.status === 'active' ? `0 0 4px ${agent.color}` : 'none',
            }}
          />
        </div>

        {/* Name label */}
        <div
          style={{
            background: 'rgba(0,0,0,0.75)',
            border: `1px solid ${selected ? agent.color + '60' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 10,
            fontWeight: 600,
            color: selected ? agent.color : 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
            backdropFilter: 'blur(4px)',
          }}
        >
          {agent.name}
        </div>
      </div>

      {/* Working particles */}
      {isWorking && (
        <WorkingParticles x={charPos.x} y={charPos.y} color={agent.color} />
      )}
    </>
  )
}

// ── Working particles ─────────────────────────────────────────

function WorkingParticles({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + (i - 1) * 8,
            top: y - 30,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: color,
            opacity: 0.6,
            transform: 'translate(-50%, -50%)',
            animation: `float ${1.2 + i * 0.4}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
            zIndex: 12,
          }}
        />
      ))}
    </>
  )
}

// ── Generic isometric box ─────────────────────────────────────

interface IsoBoxProps {
  x: number
  y: number
  w: number
  h: number
  depth: number
  topColor: string
  leftColor: string
  rightColor: string
  topContent?: React.ReactNode
  onClick?: () => void
  zIndex?: number
}

function IsoBox({ x, y, w, h, depth, topColor, leftColor, rightColor, topContent, onClick, zIndex = 1 }: IsoBoxProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Top face */}
      <div
        style={{
          width: w,
          height: h,
          background: topColor,
          transform: `rotateX(60deg) rotateZ(-45deg)`,
          transformOrigin: 'bottom center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {topContent}
      </div>
      {/* Left face */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: h * 0.5,
          width: w * 0.5,
          height: depth,
          background: leftColor,
          transform: 'skewY(26deg)',
          transformOrigin: 'top left',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      />
      {/* Right face */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: h * 0.5,
          width: w * 0.5,
          height: depth,
          background: rightColor,
          transform: 'skewY(-26deg)',
          transformOrigin: 'top right',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      />
    </div>
  )
}
