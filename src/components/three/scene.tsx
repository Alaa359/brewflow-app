'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { hasCoarsePointer } from '@/lib/three/quality';
import { Burger, CoffeeBean, CoffeeCup } from './objects';

type FloatingObjectProps = {
  children: React.ReactNode;
  position: [number, number, number];
  scale?: number;
  spin?: number;
  bob?: number;
  amplitude?: number;
  phase?: number;
  parallax?: number;
};

function FloatingObject({
  children,
  position,
  scale = 1,
  spin = 0.12,
  bob = 0.5,
  amplitude = 0.12,
  phase = 0,
  parallax = 0,
}: FloatingObjectProps) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    const current = group.current;
    if (!current) return;

    const time = state.clock.elapsedTime;

    current.rotation.y = time * spin + phase;
    current.rotation.x = Math.sin(time * 0.3 + phase) * 0.14;
    current.position.x = position[0] + state.pointer.x * parallax;
    current.position.y =
      position[1] +
      Math.sin(time * bob + phase) * amplitude +
      state.pointer.y * parallax * 0.5;
    current.position.z = position[2];
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {children}
    </group>
  );
}

function Scene() {
  const [visible, setVisible] = useState(true);
  const [coarsePointer] = useState(() => hasCoarsePointer());

  useEffect(() => {
    const handleVisibility = () =>
      setVisible(document.visibilityState === 'visible');

    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const parallax = coarsePointer ? 0 : 0.18;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      frameloop={visible ? 'always' : 'never'}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={1.2} color="#E8F0EB" />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#34D399" />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#6EE7B7" />
      <FloatingObject
        position={[3, -0.9, -0.4]}
        scale={1.15}
        spin={0.16}
        phase={0.4}
        parallax={parallax}
      >
        <CoffeeCup />
      </FloatingObject>
      <FloatingObject
        position={[-3, 1, -0.9]}
        scale={1.05}
        spin={-0.12}
        phase={2.1}
        parallax={parallax}
      >
        <Burger />
      </FloatingObject>
      <FloatingObject
        position={[-2.6, -1.7, -1.6]}
        scale={0.8}
        spin={0.2}
        bob={0.42}
        phase={4.2}
        parallax={parallax}
      >
        <CoffeeBean />
      </FloatingObject>
    </Canvas>
  );
}

export default Scene;
