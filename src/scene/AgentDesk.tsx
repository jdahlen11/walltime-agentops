import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { type AgentConfig, type AgentStatus } from '../store/agentStore';

interface AgentDeskProps {
  config: AgentConfig;
  status: AgentStatus;
}

export function AgentDesk({ config, status }: AgentDeskProps) {
  const screenRef = useRef<THREE.Mesh>(null);
  const lampLightRef = useRef<THREE.PointLight>(null);
  const isWorking = status === 'working';

  // Desk surface
  const deskMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.6 }), []);
  const legMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141428', roughness: 0.8 }), []);
  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.color,
    emissiveIntensity: 0.2,
    toneMapped: false,
  }), [config.color]);
  const chairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0d0d1a', roughness: 0.9 }), []);
  const kbMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111122', roughness: 0.7 }), []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.5 }), []);
  const lampHeadMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.color,
    emissiveIntensity: 0.8,
    toneMapped: false,
  }), [config.color]);

  // Geometries
  const deskGeom = useMemo(() => new THREE.BoxGeometry(1.2, 0.05, 0.8), []);
  const legGeom = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), []);
  const screenGeom = useMemo(() => new THREE.BoxGeometry(0.6, 0.4, 0.02), []);
  const screenStandGeom = useMemo(() => new THREE.BoxGeometry(0.04, 0.15, 0.04), []);
  const kbGeom = useMemo(() => new THREE.BoxGeometry(0.35, 0.01, 0.12), []);
  const chairSeatGeom = useMemo(() => new THREE.BoxGeometry(0.4, 0.06, 0.4), []);
  const chairBackGeom = useMemo(() => new THREE.BoxGeometry(0.4, 0.35, 0.04), []);
  const lampBaseGeom = useMemo(() => new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8), []);
  const lampHeadGeom = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), []);

  useFrame(({ clock }) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      if (isWorking) {
        mat.emissiveIntensity = 0.2 + Math.abs(Math.sin(clock.elapsedTime * 1.5)) * 0.3;
      } else {
        mat.emissiveIntensity = 0.08;
      }
    }
    if (lampLightRef.current) {
      lampLightRef.current.intensity = isWorking ? 0.5 : 0.2;
    }
  });

  const [dx, , dz] = config.deskPosition;

  return (
    <group position={[dx, 0, dz]}>
      {/* Desk surface */}
      <mesh geometry={deskGeom} material={deskMat} position={[0, 0.725, 0]} castShadow />

      {/* Legs */}
      {([-0.55, 0.55] as number[]).map(x => ([-0.35, 0.35] as number[]).map(z => (
        <mesh key={`${x}-${z}`} geometry={legGeom} material={legMat} position={[x, 0.375, z]} />
      )))}

      {/* Monitor */}
      <mesh ref={screenRef} geometry={screenGeom} material={screenMat} position={[0, 1.1, -0.2]} />
      <mesh geometry={screenStandGeom} material={legMat} position={[0, 0.825, -0.2]} />

      {/* Keyboard */}
      <mesh geometry={kbGeom} material={kbMat} position={[0, 0.755, 0.1]} />

      {/* Chair */}
      <mesh geometry={chairSeatGeom} material={chairMat} position={[0, 0.55, 0.55]} />
      <mesh geometry={chairBackGeom} material={chairMat} position={[0, 0.73, 0.75]} />

      {/* Lamp */}
      <mesh geometry={lampBaseGeom} material={lampMat} position={[0.45, 0.875, -0.25]} />
      <mesh geometry={lampHeadGeom} material={lampHeadMat} position={[0.45, 1.03, -0.25]} />
      <pointLight
        ref={lampLightRef}
        position={[0.45, 1.1, -0.25]}
        color={config.color}
        intensity={0.4}
        distance={3}
        decay={2}
      />

      {/* Name plate */}
      <Text
        position={[0, 1.45, -0.2]}
        fontSize={0.12}
        color={config.color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.emoji} {config.displayName.toUpperCase()}
      </Text>
    </group>
  );
}
