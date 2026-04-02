import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import type { AgentView, AgentId } from '../../lib/types'

// ── Types ──────────────────────────────────────────────────────

interface ThreeOfficeProps {
  agents: AgentView[]
  selectedId: AgentId | null
  onSelect: (id: AgentId | null) => void
}

type Activity = 'working' | 'meeting' | 'pingpong' | 'resting'

interface BehaviorState {
  activity: Activity
  targetPos: THREE.Vector3
  arrived: boolean
  nextChangeAt: number
}

// ── Constants ──────────────────────────────────────────────────

const DESK_POSITIONS: [number, number][] = [
  [-10, -6], [-4, -6], [2, -6], [8, -6], [-10, 4], [8, 4],
]

const ZONE_CENTERS: Record<Exclude<Activity, 'working'>, [number, number]> = {
  meeting: [0, -9],
  pingpong: [13, 9],
  resting: [-13, 9],
}

function statusColor(status: string): string {
  switch (status) {
    case 'active': return '#10b981'
    case 'processing': return '#f59e0b'
    case 'idle': return '#f59e0b'
    case 'error': return '#ef4444'
    default: return '#64748b'
  }
}

// ── Component ──────────────────────────────────────────────────

export default function ThreeOffice({ agents, selectedId, onSelect }: ThreeOfficeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const labelRendererRef = useRef<CSS2DRenderer | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const charactersRef = useRef<Map<string, THREE.Group>>(new Map())
  const labelsRef = useRef<Map<string, CSS2DObject>>(new Map())
  const monitorGlowsRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const agentBehaviorsRef = useRef<Map<string, BehaviorState>>(new Map())
  const deskPosMapRef = useRef<Map<string, [number, number]>>(new Map())
  const selectedRingRef = useRef<THREE.Mesh | null>(null)
  const pingPongBallRef = useRef<THREE.Mesh | null>(null)

  // Refs to keep closure-safe access to latest props
  const agentsRef = useRef<AgentView[]>(agents)
  const selectedIdRef = useRef<AgentId | null>(selectedId)
  const onSelectRef = useRef<(id: AgentId | null) => void>(onSelect)

  useEffect(() => { agentsRef.current = agents }, [agents])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  // ── Ring: add/remove when selectedId changes ─────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    if (selectedRingRef.current) {
      scene.remove(selectedRingRef.current)
      selectedRingRef.current = null
    }

    if (selectedId) {
      const charGroup = charactersRef.current.get(selectedId)
      const pos = charGroup ? charGroup.position : new THREE.Vector3(0, 0, 0)
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.2, 2.6, 64),
        new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(pos.x, 0.05, pos.z)
      scene.add(ring)
      selectedRingRef.current = ring
    }
  }, [selectedId])

  // ── Main scene init — runs once ──────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0e17, 35, 70)
    scene.background = new THREE.Color(0x0a0e17)
    sceneRef.current = scene

    // Camera
    const W = mount.clientWidth
    const H = mount.clientHeight
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    camera.position.set(28, 32, 32)
    camera.lookAt(0, 0, -2)
    cameraRef.current = camera

    // WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CSS2D renderer (labels)
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(W, H)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.left = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    mount.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    // OrbitControls on WebGL canvas
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.set(0, 0, -2)
    controls.minDistance = 10
    controls.maxDistance = 80
    controls.maxPolarAngle = Math.PI / 2.2
    controlsRef.current = controls

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.65))
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.3)
    dirLight.position.set(20, 30, 15)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(2048, 2048)
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 100
    dirLight.shadow.camera.left = -30
    dirLight.shadow.camera.right = 30
    dirLight.shadow.camera.top = 30
    dirLight.shadow.camera.bottom = -30
    scene.add(dirLight)

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 26),
      new THREE.MeshLambertMaterial({ color: 0xe8d9c2 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x64748b })
    const addWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat)
      m.position.set(x, y, z)
      scene.add(m)
    }
    addWall(36, 10, 0.3, 0, 5, -13)  // back
    addWall(0.3, 10, 26, -18, 5, 0)  // left
    addWall(0.3, 10, 26, 18, 5, 0)   // right

    // Meeting table (round)
    const meetingTable = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.3, 32),
      new THREE.MeshLambertMaterial({ color: 0x7c5a2e }),
    )
    meetingTable.position.set(0, 0.6, -9)
    meetingTable.castShadow = true
    meetingTable.receiveShadow = true
    scene.add(meetingTable)

    // Ping-pong table
    const ppTable = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.2, 2.6),
      new THREE.MeshLambertMaterial({ color: 0x10b981 }),
    )
    ppTable.position.set(13, 0.6, 9)
    ppTable.castShadow = true
    scene.add(ppTable)

    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.3),
      new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    )
    net.position.set(13, 0.85, 9)
    net.rotation.y = Math.PI / 2
    scene.add(net)

    // Couch
    const couch = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.1, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x2563eb }),
    )
    couch.position.set(-13, 0.7, 9)
    couch.castShadow = true
    couch.receiveShadow = true
    scene.add(couch)

    // Server rack
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 4, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x1e293b }),
    )
    rack.position.set(-15, 2, -10)
    rack.castShadow = true
    rack.receiveShadow = true
    scene.add(rack)

    // Potted plants along back wall
    const potMat = new THREE.MeshLambertMaterial({ color: 0x92400e })
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x166534 })
    const plantXZs: [number, number][] = [[-14, -11], [-8, -11], [8, -11], [14, -11]]
    plantXZs.forEach(([px, pz]) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 8), potMat)
      pot.position.set(px, 0.25, pz)
      scene.add(pot)
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 8), leavesMat)
      leaves.position.set(px, 1.1, pz)
      scene.add(leaves)
    })

    // Ping-pong ball (hidden until someone plays)
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xffffff }),
    )
    ball.position.set(13, 1.0, 9)
    ball.visible = false
    scene.add(ball)
    pingPongBallRef.current = ball

    // ── Desks, monitors, chairs, voxel characters ─────────────

    const initAgents = agentsRef.current
    initAgents.forEach((agent, i) => {
      const [dx, dz] = DESK_POSITIONS[i] ?? [0, 0]
      deskPosMapRef.current.set(agent.id, [dx, dz])

      // Desk
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.15, 1.1),
        new THREE.MeshLambertMaterial({ color: 0x92400e }),
      )
      desk.position.set(dx, 0.6, dz)
      desk.castShadow = true
      desk.receiveShadow = true
      scene.add(desk)

      // Monitor
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.7, 0.12),
        new THREE.MeshLambertMaterial({
          color: 0x1e293b,
          emissive: new THREE.Color(0x4488ff),
          emissiveIntensity: 0,
        }),
      )
      monitor.position.set(dx, 1.3, dz - 0.4)
      monitor.castShadow = true
      scene.add(monitor)
      monitorGlowsRef.current.set(agent.id, monitor)

      // Chair
      const chair = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x475569 }),
      )
      chair.position.set(dx, 0.5, dz + 0.9)
      chair.castShadow = true
      chair.receiveShadow = true
      scene.add(chair)

      // ── Voxel character ────────────────────────────────────

      const charGroup = new THREE.Group()
      charGroup.position.set(dx, 0, dz)
      charGroup.userData.agentId = agent.id

      const agentColor = parseInt(agent.color.replace('#', ''), 16)

      // Head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshLambertMaterial({ color: 0xf5d0b5 }),
      )
      head.position.set(0, 2.0, 0)
      head.castShadow = true
      charGroup.add(head)

      // Torso
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.2, 0.6),
        new THREE.MeshLambertMaterial({ color: agentColor }),
      )
      torso.position.set(0, 1.1, 0)
      torso.castShadow = true
      charGroup.add(torso)

      // Legs
      const legMat = new THREE.MeshLambertMaterial({ color: 0x1e2937 })
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), legMat)
      leftLeg.position.set(-0.3, 0.1, 0)
      leftLeg.castShadow = true
      charGroup.add(leftLeg)

      const rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1.0, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x1e2937 }),
      )
      rightLeg.position.set(0.3, 0.1, 0)
      rightLeg.castShadow = true
      charGroup.add(rightLeg)

      // Arms
      const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.9, 0.3),
        new THREE.MeshLambertMaterial({ color: agentColor }),
      )
      leftArm.position.set(-0.7, 1.4, 0)
      leftArm.castShadow = true
      charGroup.add(leftArm)

      const rightArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.9, 0.3),
        new THREE.MeshLambertMaterial({ color: agentColor }),
      )
      rightArm.position.set(0.7, 1.4, 0)
      rightArm.castShadow = true
      charGroup.add(rightArm)

      // Store limb refs for animation
      charGroup.userData.leftLeg = leftLeg
      charGroup.userData.rightLeg = rightLeg
      charGroup.userData.leftArm = leftArm
      charGroup.userData.rightArm = rightArm

      // CSS2D floating label
      const div = document.createElement('div')
      div.style.cssText =
        'background:#0A0E17;border:1px solid #1E2937;color:#fff;font-family:monospace;font-size:13px;' +
        'padding:4px 12px;border-radius:9999px;display:flex;align-items:center;gap:6px;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.4);white-space:nowrap;pointer-events:none;'
      const dot = document.createElement('span')
      dot.style.cssText = 'display:inline-block;width:10px;height:10px;border-radius:50%;'
      dot.style.backgroundColor = statusColor(agent.status)
      div.appendChild(dot)
      div.appendChild(document.createTextNode(agent.name))
      const label = new CSS2DObject(div)
      label.position.set(0, 3.2, 0)
      charGroup.add(label)
      labelsRef.current.set(agent.id, label)

      scene.add(charGroup)
      charactersRef.current.set(agent.id, charGroup)

      // Initial behavior: everyone working at own desk
      agentBehaviorsRef.current.set(agent.id, {
        activity: 'working',
        targetPos: new THREE.Vector3(dx, 0, dz),
        arrived: true,
        nextChangeAt: Date.now() + Math.random() * 12000 + 8000,
      })
    })

    // ── Behavior scheduler (2s tick) ──────────────────────────

    const scheduler = setInterval(() => {
      const now = Date.now()
      agentsRef.current.forEach((agent) => {
        const isActive = agent.status === 'active' || agent.status === 'processing'
        const behavior = agentBehaviorsRef.current.get(agent.id)
        if (!behavior) return

        // Active agents must stay at desk
        if (isActive) {
          if (behavior.activity !== 'working') {
            const dp = deskPosMapRef.current.get(agent.id) ?? [0, 0]
            agentBehaviorsRef.current.set(agent.id, {
              activity: 'working',
              targetPos: new THREE.Vector3(dp[0], 0, dp[1]),
              arrived: false,
              nextChangeAt: now + 99_999_999,
            })
          }
          return
        }

        if (behavior.nextChangeAt > now) return

        // Pick a random activity
        const activities: Activity[] = ['working', 'meeting', 'pingpong', 'resting']
        const next = activities[Math.floor(Math.random() * activities.length)]

        let tx: number, tz: number
        if (next === 'working') {
          const dp = deskPosMapRef.current.get(agent.id) ?? [0, 0]
          tx = dp[0]; tz = dp[1]
        } else {
          const [cx, cz] = ZONE_CENTERS[next]
          tx = cx + (Math.random() - 0.5) * 2
          tz = cz + (Math.random() - 0.5) * 2
        }

        agentBehaviorsRef.current.set(agent.id, {
          activity: next,
          targetPos: new THREE.Vector3(tx, 0, tz),
          arrived: false,
          nextChangeAt: now + Math.random() * 12000 + 8000,
        })
      })
    }, 2000)

    // ── Resize ────────────────────────────────────────────────

    const handleResize = () => {
      const w2 = mount.clientWidth
      const h2 = mount.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
      labelRenderer.setSize(w2, h2)
    }
    window.addEventListener('resize', handleResize)

    // ── Click (raycasting) ────────────────────────────────────

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleClick = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / mount.clientWidth) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / mount.clientHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const hits = raycaster.intersectObjects(scene.children, true)
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object
        let foundId: string | null = null
        while (obj) {
          if (typeof obj.userData.agentId === 'string') {
            foundId = obj.userData.agentId
            break
          }
          obj = obj.parent
        }
        if (foundId) {
          onSelectRef.current(foundId as AgentId)
          // Double-click: zoom to agent
          if (event.detail === 2) {
            const cg = charactersRef.current.get(foundId)
            if (cg && controlsRef.current) {
              const p = cg.position
              controlsRef.current.target.set(p.x, p.y, p.z)
              camera.position.set(p.x + 10, p.y + 12, p.z + 10)
              controlsRef.current.update()
            }
          }
        } else {
          onSelectRef.current(null)
        }
      } else {
        onSelectRef.current(null)
      }
    }
    renderer.domElement.addEventListener('click', handleClick)

    // ── Animation loop ────────────────────────────────────────

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      const now = Date.now()
      const t = now * 0.001

      controls.update()

      agentsRef.current.forEach((agent) => {
        const charGroup = charactersRef.current.get(agent.id)
        const behavior = agentBehaviorsRef.current.get(agent.id)
        if (!charGroup || !behavior) return

        const leftLeg = charGroup.userData.leftLeg as THREE.Mesh
        const rightLeg = charGroup.userData.rightLeg as THREE.Mesh
        const leftArm = charGroup.userData.leftArm as THREE.Mesh
        const rightArm = charGroup.userData.rightArm as THREE.Mesh

        const target = behavior.targetPos
        const flatDist = Math.sqrt(
          (charGroup.position.x - target.x) ** 2 +
          (charGroup.position.z - target.z) ** 2,
        )

        if (flatDist > 0.5) {
          // Moving toward target
          behavior.arrived = false
          charGroup.position.x = THREE.MathUtils.lerp(charGroup.position.x, target.x, 0.12)
          charGroup.position.z = THREE.MathUtils.lerp(charGroup.position.z, target.z, 0.12)
          charGroup.lookAt(new THREE.Vector3(target.x, charGroup.position.y, target.z))
          leftLeg.rotation.x = Math.sin(t * 8) * 0.5
          rightLeg.rotation.x = -Math.sin(t * 8) * 0.5
          leftArm.rotation.x = -Math.sin(t * 8) * 0.3
          rightArm.rotation.x = Math.sin(t * 8) * 0.3
        } else {
          // Arrived
          if (!behavior.arrived) {
            behavior.arrived = true
            leftLeg.rotation.x = 0
            rightLeg.rotation.x = 0
            leftArm.rotation.x = 0
            rightArm.rotation.x = 0
          }

          switch (behavior.activity) {
            case 'working':
              leftArm.rotation.z = Math.sin(t * 5) * 0.4
              rightArm.rotation.z = -Math.sin(t * 5 + 1) * 0.4
              break
            case 'meeting':
              leftArm.rotation.z = Math.sin(t * 1.5) * 1.2
              rightArm.rotation.z = -Math.sin(t * 1.5 + 0.5) * 1.2
              break
            case 'pingpong':
              rightArm.rotation.z = Math.sin(t * 8) * 1.5
              leftArm.rotation.z = 0
              break
            case 'resting':
              charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, 0.4, 0.05)
              leftArm.rotation.z = 0
              rightArm.rotation.z = 0
              break
          }
        }

        // Reset y when not resting
        if (behavior.activity !== 'resting') {
          charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, 0, 0.05)
        }

        // Monitor emissive glow
        const monitor = monitorGlowsRef.current.get(agent.id)
        if (monitor) {
          const mat = monitor.material as THREE.MeshLambertMaterial
          mat.emissiveIntensity =
            behavior.activity === 'working' && behavior.arrived
              ? 0.5 + Math.sin(t * 2) * 0.1
              : 0
        }

        // Label dot status color
        const label = labelsRef.current.get(agent.id)
        if (label) {
          const dot = label.element.querySelector('span') as HTMLSpanElement | null
          if (dot) dot.style.backgroundColor = statusColor(agent.status)
        }
      })

      // Ping-pong ball
      const ball = pingPongBallRef.current
      if (ball) {
        const anyPlaying = Array.from(agentBehaviorsRef.current.values()).some(
          (b) => b.activity === 'pingpong' && b.arrived,
        )
        ball.visible = anyPlaying
        if (anyPlaying) {
          ball.position.y = 1.0 + Math.abs(Math.sin(t * 6)) * 1.5
          ball.position.x = 13 + Math.sin(t * 3) * 2
        }
      }

      // Selection ring: pulse opacity + follow character
      const ring = selectedRingRef.current
      if (ring) {
        ;(ring.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(now / 300) * 0.3
        const selId = selectedIdRef.current
        if (selId) {
          const cg = charactersRef.current.get(selId)
          if (cg) ring.position.set(cg.position.x, 0.05, cg.position.z)
        }
      }

      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ───────────────────────────────────────────────

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleClick)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      clearInterval(scheduler)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      if (mount.contains(labelRenderer.domElement)) mount.removeChild(labelRenderer.domElement)
      renderer.dispose()
      rendererRef.current = null
      labelRendererRef.current = null
      charactersRef.current.clear()
      labelsRef.current.clear()
      monitorGlowsRef.current.clear()
      agentBehaviorsRef.current.clear()
      deskPosMapRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0e17',
      }}
    />
  )
}
