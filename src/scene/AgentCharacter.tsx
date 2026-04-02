import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { type AgentConfig, type AgentState, useAgentStore } from '../store/agentStore';

const COLLAB_MESSAGES = [
  'Syncing on ESO prep...',
  'Reviewing APOT data...',
  'Aligning on sprint priorities...',
  'Cross-referencing compliance...',
  'Handoff: investor deck assets',
  'Reviewing RLS migration...',
  'Coordinating Cedars pitch...',
  'Debating n8n vs custom flow...',
];

interface AgentCharacterProps {
  config: AgentConfig;
  agentState: AgentState;
}

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.min(255, r + amount).toString(16).padStart(2, '0')}${Math.min(255, g + amount).toString(16).padStart(2, '0')}${Math.min(255, b + amount).toString(16).padStart(2, '0')}`;
}

export function AgentCharacter({ config, agentState }: AgentCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const statusLightRef = useRef<THREE.Mesh>(null);
  const statusPointRef = useRef<THREE.PointLight>(null);
  const walkPhaseRef = useRef(Math.random() * Math.PI * 2);
  const speechMsg = useRef(COLLAB_MESSAGES[Math.floor(Math.random() * COLLAB_MESSAGES.length)]);

  const { setStatus, setTargetPosition, setCollaborating, resetTimer, tickTimer, addTokens } = useAgentStore.getState();
  // Reactive subscriptions for render
  const status = agentState.status;

  const headColor = useMemo(() => lightenColor(config.color, 40), [config.color]);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.4, metalness: 0.2 }), [config.color]);
  const headMat = useMemo(() => new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.3 }), [headColor]);
  const eyeWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff' }), []);
  const eyePupilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#050508' }), []);

  const bodyGeom = useMemo(() => new THREE.CapsuleGeometry(0.2, 0.6, 4, 12), []);
  const headGeom = useMemo(() => new THREE.SphereGeometry(0.25, 16, 16), []);
  const eyeWhiteGeom = useMemo(() => new THREE.SphereGeometry(0.055, 8, 8), []);
  const eyePupilGeom = useMemo(() => new THREE.SphereGeometry(0.03, 6, 6), []);
  const statusGeom = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);

  const statusColor = (() => {
    switch (status) {
      case 'working': return '#22c55e';
      case 'thinking': return '#8B5CF6';
      case 'collaborating': return '#3B82F6';
      case 'coffee': return '#F59E0B';
      case 'gym': return '#EC4899';
      default: return '#64748b';
    }
  })();

  const statusMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: statusColor,
    emissive: statusColor,
    emissiveIntensity: 1.5,
    toneMapped: false,
  }), [statusColor]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime;
    // Read current state directly (non-reactive, for perf)
    const currentState = useAgentStore.getState().agents.get(config.id);
    if (!currentState) return;

    const pos = currentState.position.clone();
    const target = currentState.targetPosition.clone();
    const distToTarget = pos.distanceTo(target);

    // Move toward target
    if (distToTarget > 0.15) {
      pos.lerp(target, delta * 2.2);
      useAgentStore.getState().setPosition(config.id, pos);
      walkPhaseRef.current += delta * 6;
      groupRef.current.position.set(pos.x, Math.abs(Math.sin(walkPhaseRef.current)) * 0.05, pos.z);
      const dir = target.clone().sub(pos);
      if (dir.length() > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
      if (bodyRef.current) bodyRef.current.rotation.x = 0.1;
    } else {
      groupRef.current.position.set(pos.x, 0, pos.z);
      if (bodyRef.current) bodyRef.current.rotation.x = 0;

      const s = currentState.status;
      if (s === 'working' || s === 'thinking') {
        if (bodyRef.current) bodyRef.current.position.y = 0.5 + Math.sin(t * 1.2) * 0.02;
        if (headRef.current) headRef.current.rotation.z = s === 'thinking' ? Math.sin(t * 0.8) * 0.12 : 0;
      } else if (s === 'gym') {
        if (bodyRef.current) {
          const gymOsc = Math.abs(Math.sin(t * 3));
          bodyRef.current.position.y = 0.1 + gymOsc * 0.25;
          bodyRef.current.rotation.x = gymOsc * 0.6;
        }
      } else {
        if (groupRef.current) groupRef.current.rotation.z = Math.sin(t * 0.5 + walkPhaseRef.current) * 0.015;
      }
    }

    // Token accumulation
    if (currentState.status === 'working' && Math.random() < delta * 3) {
      addTokens(config.id, Math.floor(Math.random() * 50) + 10);
    }

    // Status light pulse
    if (statusLightRef.current) {
      (statusLightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0 + Math.abs(Math.sin(t * 2.5));
    }
    if (statusPointRef.current) {
      statusPointRef.current.intensity = 0.2 + Math.abs(Math.sin(t * 2.5)) * 0.2;
    }

    // Timer tick
    const expired = tickTimer(config.id, delta);
    if (expired) {
      advanceState(currentState.status);
    }
  });

  function advanceState(currentStatus: typeof status) {
    const store = useAgentStore.getState();
    const agents = store.agents;
    const [dx, , dz] = config.deskPosition;
    const deskPos = new THREE.Vector3(dx, 0, dz);

    // If we just finished a non-desk activity, return to desk
    if (currentStatus === 'coffee' || currentStatus === 'gym' || currentStatus === 'collaborating') {
      if (currentStatus === 'collaborating') {
        setCollaborating(config.id, null);
      }
      setStatus(config.id, 'working');
      setTargetPosition(config.id, deskPos);
      resetTimer(config.id, 12 + Math.random() * 8);
      return;
    }

    // Pick next state
    const rand = Math.random();
    if (rand < 0.40) {
      setStatus(config.id, 'working');
      setTargetPosition(config.id, deskPos);
      resetTimer(config.id, 12 + Math.random() * 8);
    } else if (rand < 0.55) {
      setStatus(config.id, 'thinking');
      setTargetPosition(config.id, deskPos);
      resetTimer(config.id, 5 + Math.random() * 5);
    } else if (rand < 0.70) {
      setStatus(config.id, 'coffee');
      setTargetPosition(config.id, new THREE.Vector3(10 + (Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.8));
      speechMsg.current = COLLAB_MESSAGES[Math.floor(Math.random() * COLLAB_MESSAGES.length)];
      resetTimer(config.id, 8 + Math.random() * 5);
    } else if (rand < 0.80) {
      setStatus(config.id, 'gym');
      setTargetPosition(config.id, new THREE.Vector3(-10 + (Math.random() - 0.5) * 0.5, 0, 6 + (Math.random() - 0.5) * 0.8));
      resetTimer(config.id, 6 + Math.random() * 5);
    } else if (rand < 0.95) {
      const available = Array.from(agents.values()).find(a =>
        a.id !== config.id && a.status !== 'collaborating' && a.status !== 'coffee' && a.status !== 'gym'
      );
      if (available) {
        setCollaborating(config.id, available.id);
        setCollaborating(available.id, config.id);
        setStatus(available.id, 'collaborating');
        setTargetPosition(available.id, new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5));
        store.resetTimer(available.id, 8 + Math.random() * 5);
        setStatus(config.id, 'collaborating');
        setTargetPosition(config.id, new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2));
        speechMsg.current = COLLAB_MESSAGES[Math.floor(Math.random() * COLLAB_MESSAGES.length)];
        resetTimer(config.id, 8 + Math.random() * 5);
      } else {
        setStatus(config.id, 'working');
        setTargetPosition(config.id, deskPos);
        resetTimer(config.id, 10 + Math.random() * 8);
      }
    } else {
      setStatus(config.id, 'idle');
      setTargetPosition(config.id, deskPos);
      resetTimer(config.id, 3 + Math.random() * 3);
    }
  }

  const showSpeech = (status === 'coffee' || status === 'collaborating') &&
    agentState.position.distanceTo(agentState.targetPosition) < 0.8;

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} geometry={bodyGeom} material={bodyMat} position={[0, 0.5, 0]} castShadow />
      <mesh ref={headRef} geometry={headGeom} material={headMat} position={[0, 1.15, 0]} castShadow />
      {/* Eyes */}
      <mesh geometry={eyeWhiteGeom} material={eyeWhiteMat} position={[0.1, 1.18, 0.2]} />
      <mesh geometry={eyeWhiteGeom} material={eyeWhiteMat} position={[-0.1, 1.18, 0.2]} />
      <mesh geometry={eyePupilGeom} material={eyePupilMat} position={[0.1, 1.18, 0.235]} />
      <mesh geometry={eyePupilGeom} material={eyePupilMat} position={[-0.1, 1.18, 0.235]} />
      {/* Status */}
      <mesh ref={statusLightRef} geometry={statusGeom} material={statusMat} position={[0, 1.65, 0]} />
      <pointLight ref={statusPointRef} position={[0, 1.65, 0]} color={statusColor} intensity={0.3} distance={2} decay={2} />
      {/* Name tag */}
      <Billboard position={[0, 1.9, 0]}>
        <Text fontSize={0.1} color={config.color} anchorX="center" anchorY="middle">
          {config.displayName}
        </Text>
      </Billboard>
      {/* Speech bubble */}
      {showSpeech && (
        <Html position={[0, 2.2, 0]} center distanceFactor={8}>
          <div style={{
            background: 'rgba(10,14,23,0.92)',
            border: `1px solid ${config.color}`,
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '10px',
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {speechMsg.current}
          </div>
        </Html>
      )}
    </group>
  );
}
