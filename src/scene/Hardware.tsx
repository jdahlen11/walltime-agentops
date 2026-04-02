import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useHardwareStore } from '../store/hardwareStore';

function FanDisc({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.TorusGeometry(0.12, 0.025, 8, 32), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a2a1a', roughness: 0.3 }), []);
  const hubGeom = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), []);
  const hubMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0d1a0d' }), []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 3.5;
  });
  return (
    <group position={position}>
      <mesh ref={ref} geometry={geom} material={mat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={hubGeom} material={hubMat} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

export function RTX5090() {
  const rtx = useHardwareStore(s => s.rtx);
  const ledRef = useRef<THREE.Mesh>(null);

  const towerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e1218', roughness: 0.6, metalness: 0.4 }), []);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#10B981', emissiveIntensity: 1.5, toneMapped: false }), []);
  const vramBarMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#10B981', emissiveIntensity: 0.8, toneMapped: false }), []);
  const ledMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#10B981', emissiveIntensity: 2.0, toneMapped: false }), []);

  const towerGeom = useMemo(() => new THREE.BoxGeometry(0.8, 1.5, 0.6), []);
  const edgeGeom = useMemo(() => new THREE.BoxGeometry(0.04, 1.5, 0.04), []);

  useFrame(({ clock }) => {
    if (ledRef.current) {
      const m = ledRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 1.2) * 0.5;
    }
  });

  const vramWidth = rtx.vramUsage * 0.6;

  return (
    <group position={[12, 0, -6]}>
      {/* Tower */}
      <mesh geometry={towerGeom} material={towerMat} position={[0, 0.75, 0]} castShadow />

      {/* Edge lights */}
      <mesh geometry={edgeGeom} material={edgeMat} position={[-0.38, 0.75, -0.28]} />
      <mesh geometry={edgeGeom} material={edgeMat} position={[0.38, 0.75, -0.28]} />

      {/* Fans */}
      <FanDisc position={[0.08, 1.05, 0.32]} />
      <FanDisc position={[0.08, 0.5, 0.32]} />

      {/* LED status */}
      <mesh ref={ledRef} position={[0.1, 1.5, 0.31]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <primitive object={ledMat} />
      </mesh>

      {/* VRAM bar background */}
      <mesh position={[0, 1.62, 0.32]}>
        <boxGeometry args={[0.6, 0.04, 0.01]} />
        <meshStandardMaterial color="#0d1a0d" />
      </mesh>
      {/* VRAM fill */}
      <mesh position={[-0.3 + vramWidth / 2, 1.62, 0.33]}>
        <boxGeometry args={[vramWidth, 0.03, 0.01]} />
        <primitive object={vramBarMat} />
      </mesh>

      {/* Label */}
      <Text position={[0, 1.72, 0]} fontSize={0.09} color="#10B981" anchorX="center">
        RTX 5090
      </Text>
      <Text position={[0, 1.61, 0]} fontSize={0.07} color="#94a3b8" anchorX="center">
        {rtx.tokensPerSec.toFixed(1)} tok/s
      </Text>

      <pointLight position={[0, 1.0, 0.5]} color="#10B981" intensity={0.4} distance={3} decay={2} />
    </group>
  );
}

export function MacMiniM4() {
  const mac = useHardwareStore(s => s.mac);
  const statusRef = useRef<THREE.Mesh>(null);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b0b8c4', roughness: 0.2, metalness: 0.7 }), []);
  const statusMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#22c55e', emissive: '#22c55e', emissiveIntensity: 2.0, toneMapped: false }), []);

  useFrame(({ clock }) => {
    if (statusRef.current) {
      const m = statusRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.2 + Math.abs(Math.sin(clock.elapsedTime * 0.8)) * 0.8;
    }
  });

  return (
    <group position={[12, 0, -2]}>
      {/* Mac Mini body */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.0, 0.3, 1.0]} />
        <primitive object={bodyMat} />
      </mesh>

      {/* Ventilation strip */}
      <mesh position={[0, 0.22, 0.5]}>
        <boxGeometry args={[0.7, 0.04, 0.01]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Status LED */}
      <mesh ref={statusRef} position={[-0.42, 0.12, 0.5]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <primitive object={statusMat} />
      </mesh>

      {/* Labels */}
      <Text position={[0, 0.52, 0]} fontSize={0.09} color="#06B6D4" anchorX="center">
        Mac Mini M4
      </Text>
      <Text position={[0, 0.41, 0]} fontSize={0.07} color="#94a3b8" anchorX="center">
        {mac.cronJobs} Crons Active
      </Text>

      {/* Tailscale connection line to RTX */}
      <TailscaleLine />
    </group>
  );
}

function TailscaleLine() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#06B6D4',
    emissive: '#06B6D4',
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.6,
    toneMapped: false,
  }), []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.3 + Math.abs(Math.sin(clock.elapsedTime * 2)) * 0.4;
    }
  });

  // Line from Mac (0,0.3,0) in local space to RTX at (-0, 0.75, -4) relative
  return (
    <mesh ref={ref} position={[0, 0.6, -2]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.01, 0.01, 4, 4]} />
      <primitive object={mat} />
    </mesh>
  );
}

export function GymArea() {
  const matMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a0a1a', roughness: 0.9 }), []);
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2a3a', roughness: 0.4, metalness: 0.8 }), []);
  const neonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8B5CF6', emissive: '#8B5CF6', emissiveIntensity: 1.5, toneMapped: false }), []);

  return (
    <group position={[-10, 0, 6]}>
      {/* Floor mat */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[3, 0.04, 2]} />
        <primitive object={matMat} />
      </mesh>

      {/* Pull-up bar supports */}
      <mesh position={[-0.9, 0.9, -0.7]}>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <primitive object={metalMat} />
      </mesh>
      <mesh position={[0.9, 0.9, -0.7]}>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <primitive object={metalMat} />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 1.8, -0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 6]} />
        <primitive object={metalMat} />
      </mesh>

      {/* Dumbbell rack */}
      <mesh position={[1.2, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <primitive object={metalMat} />
      </mesh>
      {[0.1, 0, -0.1].map((z, i) => (
        <group key={i} position={[1.2, 0.2 + i * 0.15, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
            <primitive object={metalMat} />
          </mesh>
          <mesh position={[-0.12, 0, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <primitive object={metalMat} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <primitive object={metalMat} />
          </mesh>
        </group>
      ))}

      {/* Sign */}
      <Text position={[0, 2.2, -0.7]} fontSize={0.18} color="#8B5CF6" anchorX="center">
        AGENT GYM
      </Text>
      <mesh position={[0, 2.2, -0.72]}>
        <boxGeometry args={[1.4, 0.3, 0.02]} />
        <primitive object={neonMat} />
      </mesh>
    </group>
  );
}

export function CoffeeStation() {
  const counterMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.7 }), []);
  const machineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0d1117', roughness: 0.5, metalness: 0.3 }), []);
  const redLedMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 2.0, toneMapped: false }), []);
  const mugMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.6 }), []);
  const neonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#00D4FF', emissive: '#00D4FF', emissiveIntensity: 1.5, toneMapped: false }), []);

  return (
    <group position={[10, 0, 0]}>
      {/* Counter */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 0.8]} />
        <primitive object={counterMat} />
      </mesh>

      {/* Coffee machine */}
      <mesh position={[-0.5, 1.15, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <primitive object={machineMat} />
      </mesh>
      <mesh position={[-0.5, 1.2, 0.18]}>
        <boxGeometry args={[0.2, 0.15, 0.02]} />
        <primitive object={machineMat} />
      </mesh>
      {/* Red LED */}
      <mesh position={[-0.35, 1.25, 0.19]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <primitive object={redLedMat} />
      </mesh>

      {/* Mugs */}
      {[-0.1, 0.2, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.07, 0.1]}>
          <cylinderGeometry args={[0.055, 0.045, 0.1, 10]} />
          <primitive object={mugMat} />
        </mesh>
      ))}

      {/* Sign */}
      <Text position={[0, 1.55, 0]} fontSize={0.16} color="#00D4FF" anchorX="center">
        FUEL
      </Text>
      <mesh position={[0, 1.55, -0.01]}>
        <boxGeometry args={[0.9, 0.28, 0.01]} />
        <primitive object={neonMat} />
      </mesh>

      <pointLight position={[0, 1.5, 0.5]} color="#00D4FF" intensity={0.3} distance={3} decay={2} />
    </group>
  );
}
