import { useMemo } from 'react';
import * as THREE from 'three';
import { ContactShadows, Text } from '@react-three/drei';

function GridFloor() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(40, 30), []);
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('#0F1620') },
        color2: { value: new THREE.Color('#1a2035') },
        gridSize: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float gridSize;
        varying vec2 vUv;
        void main() {
          vec2 grid = fract(vUv * vec2(40.0, 30.0));
          float lineX = step(0.97, grid.x) + step(0.97, 1.0 - grid.x);
          float lineY = step(0.97, grid.y) + step(0.97, 1.0 - grid.y);
          float line = clamp(lineX + lineY, 0.0, 1.0) * 0.18;
          gl_FragColor = vec4(mix(color1, color2, line), 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
    return mat;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} material={material} receiveShadow />
  );
}

function WallSegment({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d1221',
    roughness: 0.8,
    metalness: 0.1,
  }), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  return <mesh position={position} geometry={geometry} material={material} castShadow />;
}

function GlassPanel({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#00D4FF',
    transmission: 0.92,
    opacity: 0.15,
    transparent: true,
    roughness: 0.05,
    metalness: 0.1,
    ior: 1.5,
    thickness: 0.05,
  }), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  return <mesh position={position} geometry={geometry} material={material} />;
}

function NeonStrip({ start, end, color = '#00D4FF' }: { start: [number, number, number]; end: [number, number, number]; color?: string }) {
  const geometry = useMemo(() => {
    const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
    const length = dir.length();
    return new THREE.BoxGeometry(Math.abs(dir.x) || 0.04, Math.abs(dir.y) || 0.04, Math.abs(dir.z) || 0.04);
  }, [start, end]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.0,
    toneMapped: false,
  }), [color]);
  const midPos: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];
  return <mesh position={midPos} geometry={geometry} material={material} />;
}

export function Office() {
  return (
    <group>
      <GridFloor />

      {/* Walls */}
      <WallSegment position={[-15, 0.25, 0]} size={[0.3, 0.5, 30]} />
      <WallSegment position={[15, 0.25, 0]} size={[0.3, 0.5, 30]} />
      <WallSegment position={[0, 0.25, -15]} size={[30, 0.5, 0.3]} />
      <WallSegment position={[0, 0.25, 15]} size={[30, 0.5, 0.3]} />

      {/* Glass panels on two sides */}
      <GlassPanel position={[15, 1.5, 0]} size={[0.08, 3, 28]} />
      <GlassPanel position={[0, 1.5, 15]} size={[28, 3, 0.08]} />

      {/* Neon accent strips along base */}
      <NeonStrip start={[-15, 0.01, -15]} end={[15, 0.01, -15]} />
      <NeonStrip start={[-15, 0.01, 15]} end={[15, 0.01, 15]} />
      <NeonStrip start={[-15, 0.01, -15]} end={[-15, 0.01, 15]} />
      <NeonStrip start={[15, 0.01, -15]} end={[15, 0.01, 15]} />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        width={40}
        height={30}
        far={3}
        blur={2}
        opacity={0.6}
        color="#000010"
      />

      {/* Sync Chamber */}
      <SyncChamber />
    </group>
  );
}

function SyncChamber() {
  const ringGeom = useMemo(() => new THREE.TorusGeometry(2, 0.04, 8, 64), []);
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B5CF6',
    emissive: '#8B5CF6',
    emissiveIntensity: 1.2,
    toneMapped: false,
  }), []);
  const platformGeom = useMemo(() => new THREE.CylinderGeometry(2, 2, 0.05, 48), []);
  const platformMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a0f2e',
    emissive: '#8B5CF6',
    emissiveIntensity: 0.15,
  }), []);

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={platformGeom} material={platformMat} position={[0, 0.025, 0]} />
      <mesh geometry={ringGeom} material={ringMat} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}
