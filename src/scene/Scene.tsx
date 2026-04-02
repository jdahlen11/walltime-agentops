import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { type OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Office } from './Office';
import { AgentDesk } from './AgentDesk';
import { AgentCharacter } from './AgentCharacter';
import { RTX5090, MacMiniM4, GymArea, CoffeeStation } from './Hardware';
import { DataParticles } from './Particles';
import { AGENT_CONFIGS, useAgentStore } from '../store/agentStore';
import { useHardwareStore } from '../store/hardwareStore';
import { useFeedStore } from '../store/feedStore';

const CAMERA_FOCUS = {
  default: { position: new THREE.Vector3(0, 18, 20), target: new THREE.Vector3(0, 0, 0) },
};

export function Scene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const focusedAgent = useAgentStore(s => s.focusedAgent);
  const agents = useAgentStore(s => s.agents);
  const initAgents = useAgentStore(s => s.initAgents);
  const hwTick = useHardwareStore(s => s.tick);
  const feedAddRandom = useFeedStore(s => s.addRandomMessage);

  useEffect(() => {
    initAgents();
    camera.position.set(0, 18, 20);

    const hwInterval = setInterval(hwTick, 2500);
    const feedInterval = setInterval(feedAddRandom, 5000 + Math.random() * 3000);

    return () => {
      clearInterval(hwInterval);
      clearInterval(feedInterval);
    };
  }, []);

  // Camera fly-to focused agent
  const camTargetPos = useRef(new THREE.Vector3(0, 18, 20));
  const camTargetLook = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (focusedAgent) {
      const cfg = AGENT_CONFIGS.find(c => c.id === focusedAgent);
      if (cfg) {
        const [dx, , dz] = cfg.deskPosition;
        camTargetPos.current.set(dx + 3, 6, dz + 6);
        camTargetLook.current.set(dx, 0.5, dz);
      }
    } else {
      camTargetPos.current.set(0, 18, 20);
      camTargetLook.current.set(0, 0, 0);
    }

    camera.position.lerp(camTargetPos.current, delta * 1.5);
    controlsRef.current.target.lerp(camTargetLook.current, delta * 1.5);
    controlsRef.current.update();
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[8, 15, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#ffffff" />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />

      <Office />

      {/* Desks */}
      {AGENT_CONFIGS.map(cfg => {
        const agentState = agents.get(cfg.id);
        const status = agentState?.status ?? 'idle';
        return <AgentDesk key={cfg.id} config={cfg} status={status} />;
      })}

      {/* Agent characters */}
      {AGENT_CONFIGS.map(cfg => {
        const agentState = agents.get(cfg.id);
        if (!agentState) return null;
        return <AgentCharacter key={cfg.id} config={cfg} agentState={agentState} />;
      })}

      {/* Hardware */}
      <RTX5090 />
      <MacMiniM4 />
      <GymArea />
      <CoffeeStation />

      {/* Particles */}
      <DataParticles />
    </>
  );
}
