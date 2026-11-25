import React, { useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { characterConfig } from '../../data/characterConfig';
import type { CharacterType } from './types';

interface CharacterNameTagProps {
  type: CharacterType;
  isActive: boolean;
  offsetY?: number;
}

export const CharacterNameTag: React.FC<CharacterNameTagProps> = ({
  type,
  isActive,
  offsetY = 1.95,
}) => {
  const config = characterConfig[type];
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pointerRef = useRef<THREE.Mesh>(null);

  // Floating animation + pulse
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Gentle floating bob
    const time = performance.now() * 0.001;
    groupRef.current.position.y = offsetY + Math.sin(time * 2.2) * 0.03;

    // Pulse animation for active indicator dot
    if (pulseRef.current && isActive) {
      const pulse = (Math.sin(time * 3.5) + 1) * 0.5; // 0 to 1
      pulseRef.current.scale.setScalar(1 + pulse * 1.2);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - pulse);
    }
  });

  const themeColor = new THREE.Color(config.themeColor);
  const bgColor = isActive ? '#ffffff' : '#faf8f6';
  const borderColor = config.themeColor;

  // Measurements for the pill background
  const pillWidth = isActive ? 0.52 : 0.46;
  const pillHeight = 0.12;

  return (
    <group ref={groupRef} position={[0, offsetY, 0]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Background pill shape */}
        <mesh ref={bgRef} position={[0, 0, -0.001]} renderOrder={1}>
          <planeGeometry args={[pillWidth, pillHeight]} />
          <meshBasicMaterial
            color={bgColor}
            transparent
            opacity={isActive ? 0.95 : 0.85}
            depthTest={false}
          />
        </mesh>

        {/* Border outline (slightly larger plane behind) */}
        <mesh position={[0, 0, -0.002]} renderOrder={0}>
          <planeGeometry args={[pillWidth + 0.016, pillHeight + 0.016]} />
          <meshBasicMaterial
            color={borderColor}
            transparent
            opacity={isActive ? 0.9 : 0.4}
            depthTest={false}
          />
        </mesh>

        {/* Avatar emoji as text */}
        <Text
          position={[-(pillWidth / 2) + 0.07, 0, 0]}
          fontSize={0.055}
          anchorX="center"
          anchorY="middle"
          depthOffset={-2}
          renderOrder={2}
        >
          {config.avatarIcon}
        </Text>

        {/* Display name */}
        <Text
          position={[0.01, 0, 0]}
          fontSize={isActive ? 0.048 : 0.044}
          anchorX="center"
          anchorY="middle"
          color={config.themeColor}
          font="https://fonts.gstatic.com/s/quicksand/v30/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-xDwxUD2GFw.woff"
          fontWeight={700}
          depthOffset={-2}
          renderOrder={2}
          material-depthTest={false}
        >
          {config.displayName}
        </Text>

        {/* Active indicator dot */}
        {isActive && (
          <group position={[(pillWidth / 2) - 0.04, 0, 0]}>
            {/* Pulse ring */}
            <mesh ref={pulseRef} renderOrder={2}>
              <circleGeometry args={[0.016, 16]} />
              <meshBasicMaterial
                color={borderColor}
                transparent
                opacity={0.5}
                depthTest={false}
              />
            </mesh>
            {/* Solid dot */}
            <mesh ref={dotRef} position={[0, 0, 0.001]} renderOrder={3}>
              <circleGeometry args={[0.012, 16]} />
              <meshBasicMaterial
                color={borderColor}
                depthTest={false}
              />
            </mesh>
          </group>
        )}

        {/* Downward pointer triangle */}
        <mesh
          ref={pointerRef}
          position={[0, -(pillHeight / 2) - 0.015, -0.001]}
          rotation={[0, 0, Math.PI]}
          renderOrder={1}
        >
          <coneGeometry args={[0.018, 0.025, 3]} />
          <meshBasicMaterial
            color={borderColor}
            transparent
            opacity={isActive ? 0.9 : 0.4}
            depthTest={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

export default CharacterNameTag;
