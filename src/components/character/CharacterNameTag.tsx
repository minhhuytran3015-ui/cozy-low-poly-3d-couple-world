import React, { useRef } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { characterConfig } from '../../data/characterConfig';
import type { CharacterType } from './types';
import type { EmoteType } from '../../hooks/useMultiplayer';

interface CharacterNameTagProps {
  type: CharacterType;
  isActive: boolean;
  offsetY?: number;
  emote?: EmoteType | null;
}

export const CharacterNameTag: React.FC<CharacterNameTagProps> = ({
  type,
  isActive,
  offsetY = 1.95,
  emote = null,
}) => {
  const config = characterConfig[type];
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const emoteGroupRef = useRef<THREE.Group>(null);

  // Floating animation + pulse
  useFrame(() => {
    const time = performance.now() * 0.001;

    if (groupRef.current) {
      groupRef.current.position.y = offsetY + Math.sin(time * 2.2) * 0.03;
    }

    if (pulseRef.current && isActive) {
      const pulse = (Math.sin(time * 3.5) + 1) * 0.5;
      pulseRef.current.scale.setScalar(1 + pulse * 1.25);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - pulse);
    }

    if (emoteGroupRef.current && emote) {
      const bounce = Math.abs(Math.sin(time * 5.0)) * 0.045;
      emoteGroupRef.current.position.y = 0.21 + bounce;
    }
  });

  const bgColor = isActive ? '#ffffff' : '#faf8f6';
  const borderColor = config.themeColor;

  const pillWidth = isActive ? 0.66 : 0.58;
  const pillHeight = isActive ? 0.16 : 0.145;

  return (
    <group ref={groupRef} position={[0, offsetY, 0]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Floating Emote Bubble when active */}
        {emote && (
          <group ref={emoteGroupRef} position={[0, 0.21, 0.005]}>
            <mesh renderOrder={14}>
              <circleGeometry args={[0.085, 24]} />
              <meshBasicMaterial
                color={emote === 'heart' ? '#ff6b81' : '#f4a261'}
                depthTest={false}
              />
            </mesh>
            <mesh position={[0, 0, -0.001]} renderOrder={13}>
              <circleGeometry args={[0.1, 24]} />
              <meshBasicMaterial color="#ffffff" depthTest={false} />
            </mesh>
            <Text
              position={[0, 0, 0.002]}
              fontSize={emote === 'heart' ? 0.09 : 0.055}
              anchorX="center"
              anchorY="middle"
              color="#ffffff"
              fontWeight={700}
              renderOrder={15}
              material-depthTest={false}
            >
              {emote === 'heart' ? '♥' : 'HI!'}
            </Text>
          </group>
        )}

        {/* Background pill shape */}
        <mesh position={[0, 0, -0.001]} renderOrder={10}>
          <planeGeometry args={[pillWidth, pillHeight]} />
          <meshBasicMaterial
            color={bgColor}
            transparent
            opacity={isActive ? 0.96 : 0.88}
            depthTest={false}
          />
        </mesh>

        {/* Border outline */}
        <mesh position={[0, 0, -0.002]} renderOrder={9}>
          <planeGeometry args={[pillWidth + 0.02, pillHeight + 0.02]} />
          <meshBasicMaterial
            color={borderColor}
            transparent
            opacity={isActive ? 0.92 : 0.45}
            depthTest={false}
          />
        </mesh>

        {/* Crisp 3D avatar circle badge */}
        <group position={[-(pillWidth / 2) + 0.075, 0, 0.002]}>
          <mesh renderOrder={11}>
            <circleGeometry args={[0.045, 20]} />
            <meshBasicMaterial color={config.accentBg} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, 0.001]} renderOrder={12}>
            <circleGeometry args={[0.028, 16]} />
            <meshBasicMaterial color={borderColor} depthTest={false} />
          </mesh>
        </group>

        {/* Display name */}
        <Text
          position={[0.02, 0, 0.002]}
          fontSize={isActive ? 0.062 : 0.056}
          anchorX="center"
          anchorY="middle"
          color={config.themeColor}
          fontWeight={700}
          depthOffset={-2}
          renderOrder={12}
          material-depthTest={false}
        >
          {config.displayName}
        </Text>

        {/* Active indicator dot */}
        {isActive && (
          <group position={[(pillWidth / 2) - 0.055, 0, 0.001]}>
            <mesh ref={pulseRef} renderOrder={11}>
              <circleGeometry args={[0.019, 16]} />
              <meshBasicMaterial
                color={borderColor}
                transparent
                opacity={0.55}
                depthTest={false}
              />
            </mesh>
            <mesh position={[0, 0, 0.001]} renderOrder={12}>
              <circleGeometry args={[0.014, 16]} />
              <meshBasicMaterial color={borderColor} depthTest={false} />
            </mesh>
          </group>
        )}

        {/* Downward pointer triangle */}
        <mesh
          position={[0, -(pillHeight / 2) - 0.018, -0.001]}
          rotation={[0, 0, Math.PI]}
          renderOrder={10}
        >
          <coneGeometry args={[0.022, 0.03, 3]} />
          <meshBasicMaterial
            color={borderColor}
            transparent
            opacity={isActive ? 0.92 : 0.45}
            depthTest={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

export default CharacterNameTag;
