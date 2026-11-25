import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CharacterNameTag from './CharacterNameTag';
import type { EmoteType } from '../../hooks/useMultiplayer';

export interface CharacterTransformData {
  position: THREE.Vector3;
  rotation: number;
  isMoving: boolean;
  isSprinting: boolean;
}

interface BoyCharacterProps {
  transformRef: React.MutableRefObject<CharacterTransformData>;
  isActive: boolean;
  emote?: EmoteType | null;
}

export const BoyCharacter: React.FC<BoyCharacterProps> = ({
  transformRef,
  isActive,
  emote = null,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const indicatorRef = useRef<THREE.Group>(null);

  const animState = useRef({
    walkCycle: 0,
    idleCycle: 0,
    currentRotation: 0,
  });

  useFrame((_, delta) => {
    if (!rootGroupRef.current) return;
    const t = transformRef.current;

    // Directly update root position from mutable transform ref
    rootGroupRef.current.position.set(t.position.x, t.position.y, t.position.z);

    // Smooth rotation damping towards movement direction (shortest angle path)
    let diff = t.rotation - animState.current.currentRotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    animState.current.currentRotation += diff * Math.min(1, delta * 12);
    rootGroupRef.current.rotation.y = animState.current.currentRotation;

    // Procedural Animation
    if (t.isMoving) {
      const walkSpeed = t.isSprinting ? 14 : 9.5;
      animState.current.walkCycle += delta * walkSpeed;
      const cycle = animState.current.walkCycle;

      // Leg swing (alternating)
      const legAmplitude = t.isSprinting ? 0.75 : 0.55;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * legAmplitude;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * legAmplitude;

      // Arm swing (opposite to leg)
      const armAmplitude = t.isSprinting ? 0.65 : 0.45;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(cycle) * armAmplitude;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(cycle) * armAmplitude;

      // Subtle vertical bobbing
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.44 + Math.abs(Math.sin(cycle)) * 0.04;
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(cycle) * 0.04;
      }
    } else {
      // Idle Animation: gentle breathing and relaxing limbs back to rest
      animState.current.idleCycle += delta * 2.2;
      const idle = animState.current.idleCycle;

      const dampFactor = Math.min(1, delta * 8);
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, dampFactor);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, dampFactor);
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, dampFactor);
        leftArmRef.current.rotation.z = 0.12 + Math.sin(idle) * 0.02;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, dampFactor);
        rightArmRef.current.rotation.z = -0.12 - Math.sin(idle) * 0.02;
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.44 + Math.sin(idle) * 0.015;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(idle) * 0.025;
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, dampFactor);
      }
    }

    // Active floating marker animation
    if (indicatorRef.current && isActive) {
      indicatorRef.current.position.y = 1.62 + Math.sin(animState.current.idleCycle * 3) * 0.04;
      indicatorRef.current.rotation.y += delta * 1.5;
    }
  });

  // Color palette for Boy (Sage / Teal cozy sweater, dark slate pants, warm skin, dark hair)
  const skin = '#ffe9d9';
  const hair = '#2c2523';
  const sweater = '#5c8075';
  const pants = '#2e3843';
  const shoes = '#faf7f2';

  return (
    <group ref={rootGroupRef} name="boy-character">
      {/* Floating 3D Name Tag */}
      <CharacterNameTag type="boy" isActive={isActive} offsetY={1.95} emote={emote} />

      {/* Active Indicator Pin (Shows who is controlled) */}
      {isActive && (
        <group ref={indicatorRef} position={[0, 1.62, 0]}>
          <mesh>
            <octahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial
              color="#5c8075"
              emissive="#6e9c8e"
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Shadow receiver/soft base shadow */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>

      {/* =========================================
          LEGS (Pivot at hips y = 0.44)
          ========================================= */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.11, 0.44, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.28, 6, 8]} />
          <meshStandardMaterial color={pants} roughness={0.7} />
        </mesh>
        {/* Left Shoe */}
        <mesh position={[0, -0.38, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.17]} />
          <meshStandardMaterial color={shoes} roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.11, 0.44, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.065, 0.28, 6, 8]} />
          <meshStandardMaterial color={pants} roughness={0.7} />
        </mesh>
        {/* Right Shoe */}
        <mesh position={[0, -0.38, 0.03]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.17]} />
          <meshStandardMaterial color={shoes} roughness={0.5} />
        </mesh>
      </group>

      {/* =========================================
          TORSO / BODY (y = 0.44 to 0.82)
          ========================================= */}
      <group ref={bodyRef} position={[0, 0.44, 0]}>
        {/* Knit Sweater Torso */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.18, 8, 12]} />
          <meshStandardMaterial color={sweater} roughness={0.75} />
        </mesh>

        {/* Inner white collar accent */}
        <mesh position={[0, 0.32, 0.06]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.14, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>

        {/* Left Arm (Pivot at shoulder) */}
        <group ref={leftArmRef} position={[-0.23, 0.3, 0]}>
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, 0.1]} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 6, 8]} />
            <meshStandardMaterial color={sweater} roughness={0.75} />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.01, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        </group>

        {/* Right Arm (Pivot at shoulder) */}
        <group ref={rightArmRef} position={[0.23, 0.3, 0]}>
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, -0.1]} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 6, 8]} />
            <meshStandardMaterial color={sweater} roughness={0.75} />
          </mesh>
          {/* Hand */}
          <mesh position={[0.01, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        </group>

        {/* =========================================
            HEAD (Pivot at neck y = 0.38)
            ========================================= */}
        <group ref={headRef} position={[0, 0.38, 0]}>
          {/* Head Base */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <boxGeometry args={[0.48, 0.44, 0.42]} />
            <meshStandardMaterial color={skin} roughness={0.55} />
          </mesh>

          {/* Hair Top/Back Volume */}
          <mesh position={[0, 0.34, -0.03]} castShadow>
            <boxGeometry args={[0.52, 0.32, 0.44]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
          {/* Side-swept Front Bangs */}
          <mesh position={[0.02, 0.43, 0.19]} rotation={[0.1, 0, -0.05]} castShadow>
            <boxGeometry args={[0.48, 0.14, 0.1]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
          {/* Hair Cowlick detail on top */}
          <mesh position={[-0.06, 0.54, 0.05]} rotation={[0.3, 0.2, 0.3]}>
            <coneGeometry args={[0.06, 0.12, 5]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>

          {/* Left Eye */}
          <mesh position={[-0.12, 0.25, 0.215]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#1a120b" />
          </mesh>
          {/* Left Eye Highlight */}
          <mesh position={[-0.105, 0.265, 0.245]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.12, 0.25, 0.215]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#1a120b" />
          </mesh>
          {/* Right Eye Highlight */}
          <mesh position={[0.135, 0.265, 0.245]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Left Blush */}
          <mesh position={[-0.16, 0.18, 0.212]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#ff9999" transparent opacity={0.55} />
          </mesh>

          {/* Right Blush */}
          <mesh position={[0.16, 0.18, 0.212]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#ff9999" transparent opacity={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default BoyCharacter;
