'use client';

import { BACKGROUND_COLOR, DEFAULT_OPACITY } from './palette';

function GhostMaterial({ opacity = DEFAULT_OPACITY }: { opacity?: number }) {
  return (
    <meshStandardMaterial
      color={BACKGROUND_COLOR}
      roughness={0.55}
      metalness={0.15}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  );
}

export function CoffeeCup() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.38, 0.92, 40]} />
        <GhostMaterial />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.05, 40]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 0.8} />
      </mesh>
      <mesh position={[0.5, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.2, 0.045, 14, 32]} />
        <GhostMaterial />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 0.05, 40]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 0.7} />
      </mesh>
    </group>
  );
}

export function Burger() {
  return (
    <group>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.6, 0.55, 0.22, 40]} />
        <GhostMaterial />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.16, 40]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 1.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.06, 40]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 0.8} />
      </mesh>
      <mesh position={[0, 0.34, 0]} scale={[1, 0.68, 1]}>
        <sphereGeometry args={[0.62, 40, 20]} />
        <GhostMaterial />
      </mesh>
      <mesh position={[-0.18, 0.62, 0.12]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 1.4} />
      </mesh>
      <mesh position={[0.05, 0.68, -0.04]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 1.4} />
      </mesh>
      <mesh position={[0.24, 0.6, 0.1]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 1.4} />
      </mesh>
    </group>
  );
}

export function CoffeeBean() {
  return (
    <group>
      <mesh scale={[1, 0.82, 0.7]}>
        <sphereGeometry args={[0.5, 32, 24]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 1.3} />
      </mesh>
      <mesh position={[0, 0, 0.3]} scale={[0.7, 1.05, 0.25]}>
        <torusGeometry args={[0.28, 0.07, 12, 32]} />
        <GhostMaterial opacity={DEFAULT_OPACITY * 0.9} />
      </mesh>
    </group>
  );
}
