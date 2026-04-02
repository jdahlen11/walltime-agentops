import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AGENT_CONFIGS } from '../store/agentStore';

const MAX_PARTICLES = 100;
const RTX_POS = new THREE.Vector3(12, 0.5, -6);

interface Particle {
  active: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  sourceAgent: number;
}

export function DataParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorTemp = useMemo(() => new THREE.Color(), []);

  const particles = useMemo<Particle[]>(() => Array.from({ length: MAX_PARTICLES }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    maxLife: 1,
    sourceAgent: 0,
  })), []);

  const spawnTimers = useRef<number[]>(AGENT_CONFIGS.map(() => Math.random() * 2));
  const spawnRates = useMemo(() => AGENT_CONFIGS.map(() => 0.5 + Math.random() * 0.8), []);

  const geom = useMemo(() => new THREE.SphereGeometry(1, 4, 4), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    toneMapped: false,
    emissiveIntensity: 1.5,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    AGENT_CONFIGS.forEach((cfg, i) => {
      spawnTimers.current[i] -= delta;
      if (spawnTimers.current[i] <= 0) {
        spawnTimers.current[i] = spawnRates[i];
        const [dx, , dz] = cfg.deskPosition;
        const free = particles.find(p => !p.active);
        if (free) {
          free.active = true;
          free.position.set(dx + (Math.random() - 0.5) * 0.3, 0.8 + Math.random() * 0.3, dz + (Math.random() - 0.5) * 0.3);
          const dir = RTX_POS.clone().sub(free.position).normalize();
          free.velocity.set(
            dir.x * 2 + (Math.random() - 0.5) * 0.3,
            dir.y * 2 + Math.random() * 0.5,
            dir.z * 2 + (Math.random() - 0.5) * 0.3
          );
          free.life = 0;
          free.maxLife = 1.5 + Math.random() * 1.0;
          free.sourceAgent = i;
        }
      }
    });

    particles.forEach((p, idx) => {
      if (!p.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
        return;
      }

      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
        return;
      }

      p.position.addScaledVector(p.velocity, delta);
      const t = p.life / p.maxLife;
      const scale = (1 - t) * 0.035;

      dummy.position.copy(p.position);
      dummy.scale.setScalar(Math.max(0.001, scale));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);

      colorTemp.set(AGENT_CONFIGS[p.sourceAgent].color);
      colorTemp.multiplyScalar(1 - t * 0.5);
      meshRef.current!.setColorAt(idx, colorTemp);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geom, mat, MAX_PARTICLES]} />
  );
}
