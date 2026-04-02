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
  isMobile: boolean
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

const HAIR_COLORS: Record<string, number> = {
  scout: 0x3E2723,
  engineer: 0x1a1a1a,
  command: 0x374151,
  capital: 0x5D4037,
  content: 0x4A2C2A,
  analyst: 0x1a1a1a,
}

const WALK_SPEED = 0.045

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

export default function ThreeOffice({ agents, selectedId, onSelect, isMobile }: ThreeOfficeProps) {
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
  const serverLEDsRef = useRef<THREE.Mesh[]>([])

  // Camera lerp target
  const cameraLerpTargetRef = useRef<THREE.Vector3 | null>(null)
  const cameraLerpPosRef = useRef<THREE.Vector3 | null>(null)
  const cameraLerpFrameRef = useRef(0)

  const agentsRef = useRef<AgentView[]>(agents)
  const selectedIdRef = useRef<AgentId | null>(selectedId)
  const onSelectRef = useRef<(id: AgentId | null) => void>(onSelect)
  const isMobileRef = useRef(isMobile)

  useEffect(() => { agentsRef.current = agents }, [agents])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

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

    const mobile = isMobileRef.current

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0e17, 35, 70)
    scene.background = new THREE.Color(0x0a0e17)
    sceneRef.current = scene

    // Camera
    const W = mount.clientWidth
    const H = mount.clientHeight
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    if (mobile) {
      camera.position.set(16, 20, 18)
    } else {
      camera.position.set(20, 18, 22)
    }
    camera.lookAt(0, 1, -2)
    cameraRef.current = camera

    // WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = mobile ? 0.2 : 0.08
    controls.target.set(0, 1, -2)
    controls.minDistance = 10
    controls.maxDistance = 80
    controls.maxPolarAngle = Math.PI / 2.2
    if (mobile) {
      controls.enableRotate = false
    }
    controlsRef.current = controls

    // ── Lights ──────────────────────────────────────────────────

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

    // Ceiling light strips
    const ceilingMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    ;[-8, 0, 8].forEach((x) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 0.3), ceilingMat)
      strip.position.set(x, 9.5, 0)
      scene.add(strip)
    })

    // Warm point light at lounge
    const warmLight = new THREE.PointLight(0xFFE4B5, 0.4, 20)
    warmLight.position.set(-13, 4, 9)
    scene.add(warmLight)

    // Cool point light at server rack
    const coolLight = new THREE.PointLight(0x3B82F6, 0.3, 15)
    coolLight.position.set(-15, 4, -10)
    scene.add(coolLight)

    // ── Floor ───────────────────────────────────────────────────

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 26),
      new THREE.MeshLambertMaterial({ color: 0xe8d9c2 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Subtle grid overlay
    const gridHelper = new THREE.GridHelper(36, 36, 0x000000, 0x000000)
    gridHelper.position.y = 0.01
    const gridMat = gridHelper.material
    if (Array.isArray(gridMat)) {
      gridMat.forEach((m) => { m.transparent = true; m.opacity = 0.04 })
    } else {
      gridMat.transparent = true
      gridMat.opacity = 0.04
    }
    scene.add(gridHelper)

    // ── Walls ───────────────────────────────────────────────────

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x64748b })
    const addWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat)
      m.position.set(x, y, z)
      scene.add(m)
    }
    addWall(36, 10, 0.3, 0, 5, -13)  // back
    addWall(0.3, 10, 26, -18, 5, 0)  // left
    addWall(0.3, 10, 26, 18, 5, 0)   // right

    // ── Whiteboard ──────────────────────────────────────────────

    const wbBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2.5),
      new THREE.MeshLambertMaterial({ color: 0xf8f8f8 }),
    )
    wbBoard.position.set(0, 4, -12.85)
    scene.add(wbBoard)

    // Whiteboard frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1e293b })
    const frameParts: [number, number, number, number, number, number][] = [
      [4.2, 0.1, 0.05, 0, 5.3, -12.83],
      [4.2, 0.1, 0.05, 0, 2.7, -12.83],
      [0.1, 2.7, 0.05, -2.1, 4, -12.83],
      [0.1, 2.7, 0.05, 2.1, 4, -12.83],
    ]
    frameParts.forEach(([w, h, d, x, y, z]) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat)
      f.position.set(x, y, z)
      scene.add(f)
    })

    // ── Meeting table ───────────────────────────────────────────

    const meetingTable = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.3, 32),
      new THREE.MeshLambertMaterial({ color: 0x7c5a2e }),
    )
    meetingTable.position.set(0, 0.6, -9)
    meetingTable.castShadow = true
    meetingTable.receiveShadow = true
    scene.add(meetingTable)

    // ── Ping-pong table ─────────────────────────────────────────

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

    // ── Couch ───────────────────────────────────────────────────

    const couch = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.1, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x2563eb }),
    )
    couch.position.set(-13, 0.7, 9)
    couch.castShadow = true
    couch.receiveShadow = true
    scene.add(couch)

    // ── Server rack + LEDs ──────────────────────────────────────

    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 4, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x1e293b }),
    )
    rack.position.set(-15, 2, -10)
    rack.castShadow = true
    rack.receiveShadow = true
    scene.add(rack)

    // Server rack LEDs
    const ledColors = [0x10b981, 0xf59e0b, 0x10b981, 0xf59e0b, 0x10b981, 0xf59e0b]
    const leds: THREE.Mesh[] = []
    ledColors.forEach((color, i) => {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color }),
      )
      led.position.set(-14.35, 0.8 + i * 0.5, -10)
      scene.add(led)
      leds.push(led)
    })
    serverLEDsRef.current = leds

    // ── Water cooler ────────────────────────────────────────────

    const coolerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12),
      new THREE.MeshLambertMaterial({ color: 0xffffff }),
    )
    coolerBody.position.set(-11, 0.6, 8)
    scene.add(coolerBody)

    const coolerTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.3, 0.4, 12),
      new THREE.MeshLambertMaterial({ color: 0x3B82F6 }),
    )
    coolerTop.position.set(-11, 1.4, 8)
    scene.add(coolerTop)

    // ── Potted plants ───────────────────────────────────────────

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

    // ── Ping-pong ball ──────────────────────────────────────────

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xffffff }),
    )
    ball.position.set(13, 1.0, 9)
    ball.visible = false
    scene.add(ball)
    pingPongBallRef.current = ball

    // ── Desks, monitors, chairs, voxel characters ───────────────

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

      // Monitor — default emissive off
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.7, 0.12),
        new THREE.MeshLambertMaterial({
          color: 0x1e293b,
          emissive: new THREE.Color(0x06b6d4),
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

      // ── Voxel character ──────────────────────────────────────

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

      // Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), eyeMat)
      leftEye.position.set(-0.18, 2.1, 0.38)
      charGroup.add(leftEye)

      const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), eyeMat)
      rightEye.position.set(0.18, 2.1, 0.38)
      charGroup.add(rightEye)

      // Mouth
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.04, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1a }),
      )
      mouth.position.set(0, 1.85, 0.38)
      charGroup.add(mouth)

      // Hair
      const hairColor = HAIR_COLORS[agent.id] ?? 0x1a1a1a
      const hair = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.25, 0.85),
        new THREE.MeshLambertMaterial({ color: hairColor }),
      )
      hair.position.set(0, 2.5, 0)
      hair.castShadow = true
      charGroup.add(hair)

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

      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), legMat)
      rightLeg.position.set(0.3, 0.1, 0)
      rightLeg.castShadow = true
      charGroup.add(rightLeg)

      // Arms — slightly out
      const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.9, 0.3),
        new THREE.MeshLambertMaterial({ color: agentColor }),
      )
      leftArm.position.set(-0.7, 1.4, 0)
      leftArm.rotation.z = 0.12
      leftArm.castShadow = true
      charGroup.add(leftArm)

      const rightArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.9, 0.3),
        new THREE.MeshLambertMaterial({ color: agentColor }),
      )
      rightArm.position.set(0.7, 1.4, 0)
      rightArm.rotation.z = -0.12
      rightArm.castShadow = true
      charGroup.add(rightArm)

      // Character shadow
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.8, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 }),
      )
      shadow.rotation.x = -Math.PI / 2
      shadow.position.set(0, 0.02, 0)
      charGroup.add(shadow)

      // Store limb refs
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

      // Initial behavior: working at own desk
      agentBehaviorsRef.current.set(agent.id, {
        activity: 'working',
        targetPos: new THREE.Vector3(dx, 0, dz),
        arrived: true,
        nextChangeAt: Date.now() + 45000 + Math.random() * 75000,
      })
    })

    // ── Behavior scheduler (2s tick) ──────────────────────────

    const scheduler = setInterval(() => {
      const now = Date.now()
      agentsRef.current.forEach((agent) => {
        const isActive = agent.status === 'active' || agent.status === 'processing'
        const behavior = agentBehaviorsRef.current.get(agent.id)
        if (!behavior) return

        // CRITICAL: active agents MUST stay at desk
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

        // Weighted random activity: 72% working, 12% meeting, 3% pingpong, 13% resting
        const roll = Math.random()
        let next: Activity
        if (roll < 0.72) next = 'working'
        else if (roll < 0.84) next = 'meeting'
        else if (roll < 0.87) next = 'pingpong'
        else next = 'resting'

        let tx: number, tz: number
        if (next === 'working') {
          const dp = deskPosMapRef.current.get(agent.id) ?? [0, 0]
          tx = dp[0]; tz = dp[1]
        } else if (next === 'meeting') {
          // Spread around table
          const angleIndex = Array.from(agentBehaviorsRef.current.keys()).indexOf(agent.id)
          const angle = (angleIndex / 6) * Math.PI * 2
          tx = ZONE_CENTERS.meeting[0] + Math.cos(angle) * 5
          tz = ZONE_CENTERS.meeting[1] + Math.sin(angle) * 5
        } else {
          const [cx, cz] = ZONE_CENTERS[next]
          tx = cx + (Math.random() - 0.5) * 2
          tz = cz + (Math.random() - 0.5) * 2
        }

        agentBehaviorsRef.current.set(agent.id, {
          activity: next,
          targetPos: new THREE.Vector3(tx, 0, tz),
          arrived: false,
          nextChangeAt: now + 45000 + Math.random() * 75000,
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
          // Double-click: smooth zoom to agent
          if (event.detail === 2) {
            const cg = charactersRef.current.get(foundId)
            if (cg && controlsRef.current) {
              const p = cg.position
              cameraLerpTargetRef.current = new THREE.Vector3(p.x, p.y, p.z)
              cameraLerpPosRef.current = new THREE.Vector3(p.x + 10, p.y + 12, p.z + 10)
              cameraLerpFrameRef.current = 0
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

      // Smooth camera lerp
      if (cameraLerpTargetRef.current && cameraLerpPosRef.current && controlsRef.current) {
        cameraLerpFrameRef.current++
        const progress = Math.min(cameraLerpFrameRef.current / 60, 1)
        const ease = 1 - Math.pow(1 - progress, 3) // ease out cubic
        camera.position.lerp(cameraLerpPosRef.current, ease * 0.1)
        controlsRef.current.target.lerp(cameraLerpTargetRef.current, ease * 0.1)
        if (progress >= 1) {
          cameraLerpTargetRef.current = null
          cameraLerpPosRef.current = null
        }
      }

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
        const dx = target.x - charGroup.position.x
        const dz = target.z - charGroup.position.z
        const flatDist = Math.sqrt(dx * dx + dz * dz)

        if (flatDist > 0.5) {
          // Moving toward target — slow walk
          behavior.arrived = false
          const step = Math.min(WALK_SPEED, flatDist)
          const nx = dx / flatDist
          const nz = dz / flatDist
          charGroup.position.x += nx * step
          charGroup.position.z += nz * step
          charGroup.lookAt(new THREE.Vector3(target.x, charGroup.position.y, target.z))

          // Walk animation
          leftLeg.rotation.x = Math.sin(t * 8) * 0.5
          rightLeg.rotation.x = -Math.sin(t * 8) * 0.5
          leftArm.rotation.x = -Math.sin(t * 8) * 0.3
          rightArm.rotation.x = Math.sin(t * 8) * 0.3
          leftArm.rotation.z = 0.12
          rightArm.rotation.z = -0.12
        } else {
          // Arrived
          if (!behavior.arrived) {
            behavior.arrived = true
            leftLeg.rotation.x = 0
            rightLeg.rotation.x = 0
            leftArm.rotation.x = 0
            rightArm.rotation.x = 0
            leftArm.rotation.z = 0.12
            rightArm.rotation.z = -0.12
          }

          switch (behavior.activity) {
            case 'working': {
              // Face monitor (negative Z from desk)
              const dp = deskPosMapRef.current.get(agent.id)
              if (dp) {
                charGroup.lookAt(new THREE.Vector3(dp[0], charGroup.position.y, dp[1] - 2))
              }
              // Subtle typing animation
              leftArm.rotation.z = 0.12 + Math.sin(t * (Math.PI * 10)) * 0.12
              rightArm.rotation.z = -0.12 - Math.sin(t * (Math.PI * 10) + 1) * 0.12
              break
            }
            case 'meeting': {
              // Face center of meeting table
              charGroup.lookAt(new THREE.Vector3(0, charGroup.position.y, -9))
              leftArm.rotation.z = Math.sin(t * 1.5) * 0.4
              rightArm.rotation.z = -Math.sin(t * 1.5 + 0.5) * 0.4
              break
            }
            case 'pingpong':
              rightArm.rotation.z = Math.sin(t * 8) * 1.5
              leftArm.rotation.z = 0.12
              break
            case 'resting':
              charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, 0.35, 0.05)
              leftArm.rotation.z = 0.12
              rightArm.rotation.z = -0.12
              break
          }
        }

        // Reset y when not resting
        if (behavior.activity !== 'resting') {
          charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, 0, 0.05)
        }

        // Monitor emissive glow
        const monitorMesh = monitorGlowsRef.current.get(agent.id)
        if (monitorMesh) {
          const mat = monitorMesh.material as THREE.MeshLambertMaterial
          if (agent.status === 'error') {
            mat.emissive.setHex(0xef4444)
            mat.emissiveIntensity = 0.8
          } else if (behavior.activity === 'working' && behavior.arrived) {
            mat.emissive.setHex(0x06b6d4)
            mat.emissiveIntensity = 0.8
          } else {
            mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05)
          }
        }

        // Label dot status color
        const label = labelsRef.current.get(agent.id)
        if (label) {
          const dotEl = label.element.querySelector('span') as HTMLSpanElement | null
          if (dotEl) dotEl.style.backgroundColor = statusColor(agent.status)
        }
      })

      // Ping-pong ball — only visible when exactly 2 agents are playing
      const ball2 = pingPongBallRef.current
      if (ball2) {
        const playingCount = Array.from(agentBehaviorsRef.current.values()).filter(
          (b) => b.activity === 'pingpong' && b.arrived,
        ).length
        ball2.visible = playingCount === 2
        if (ball2.visible) {
          ball2.position.y = 1.0 + Math.abs(Math.sin(t * 6)) * 1.5
          ball2.position.x = 13 + Math.sin(t * 3) * 2
        }
      }

      // Server LEDs — staggered toggle
      serverLEDsRef.current.forEach((led, i) => {
        const rate = 1.5 + i * 0.7
        const on = Math.sin(t * rate + i) > 0
        ;(led.material as THREE.MeshBasicMaterial).opacity = on ? 1 : 0.15
        ;(led.material as THREE.MeshBasicMaterial).transparent = true
      })

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
      serverLEDsRef.current = []
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
