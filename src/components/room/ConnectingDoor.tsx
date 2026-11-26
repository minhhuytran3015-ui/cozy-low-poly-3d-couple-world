import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DOOR_HEIGHT, DOOR_WIDTH, DOOR_X_END, DOOR_X_START, DOOR_Z } from '../../data/roomConfig';

interface ConnectingDoorProps {
  isOpen: boolean;
  isHighlighted?: boolean;
}

export const ConnectingDoor: React.FC<ConnectingDoorProps> = ({
  isOpen,
  isHighlighted = false,
}) => {
  const hingeRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);

  const midX = (DOOR_X_START + DOOR_X_END) / 2;
  const depth = DOOR_X_END - DOOR_X_START + 0.06;
  const leafWidth = DOOR_WIDTH - 0.14;
  const leafHeight = DOOR_HEIGHT - 0.08;

  useFrame((_, delta) => {
    const targetAngle = isOpen ? -Math.PI * 0.56 : 0;
    currentAngle.current = THREE.MathUtils.lerp(
      currentAngle.current,
      targetAngle,
      1 - Math.exp(-6.5 * delta)
    );
    if (hingeRef.current) {
      hingeRef.current.rotation.y = currentAngle.current;
    }
  });

  return (
    <group name="connecting-door" position={[midX, 0, DOOR_Z]}>
      {/* Threshold Floor Bridge */}
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <boxGeometry args={[depth + 0.16, 0.02, DOOR_WIDTH]} />
        <meshStandardMaterial color="#c9b194" roughness={0.75} />
      </mesh>

      {/* Left Door Jamb */}
      <mesh position={[0, DOOR_HEIGHT / 2, -DOOR_WIDTH / 2 + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[depth, DOOR_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#8d6748" roughness={0.65} />
      </mesh>

      {/* Right Door Jamb */}
      <mesh position={[0, DOOR_HEIGHT / 2, DOOR_WIDTH / 2 - 0.04]} castShadow receiveShadow>
        <boxGeometry args={[depth, DOOR_HEIGHT, 0.08]} />
        <meshStandardMaterial color="#8d6748" roughness={0.65} />
      </mesh>

      {/* Top Lintel */}
      <mesh position={[0, DOOR_HEIGHT - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[depth + 0.04, 0.1, DOOR_WIDTH + 0.06]} />
        <meshStandardMaterial color="#7a563b" roughness={0.6} />
      </mesh>

      {/* Subtle warm museum sign plate above door */}
      <mesh position={[-depth / 2 - 0.015, DOOR_HEIGHT + 0.22, 0]}>
        <boxGeometry args={[0.02, 0.22, 1.0]} />
        <meshStandardMaterial
          color={isHighlighted ? '#f6bd60' : '#df9e82'}
          emissive={isHighlighted ? '#f6bd60' : '#000000'}
          emissiveIntensity={isHighlighted ? 0.35 : 0}
          roughness={0.45}
        />
      </mesh>

      {/* Hinged Door Leaf (pivots around Z = -leafWidth/2) */}
      <group ref={hingeRef} position={[0, 0, -leafWidth / 2]}>
        <group position={[0, leafHeight / 2 + 0.02, leafWidth / 2]}>
          {/* Main Wooden Door */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.075, leafHeight, leafWidth]} />
            <meshStandardMaterial color="#a67c52" roughness={0.62} />
          </mesh>

          {/* Glass Window Inset */}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.085, 0.88, leafWidth * 0.56]} />
            <meshStandardMaterial
              color="#d8efe8"
              transparent
              opacity={0.58}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>

          {/* Door Handles (both sides) */}
          <mesh position={[-0.06, -0.05, leafWidth * 0.36]} castShadow>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial
              color={isHighlighted ? '#ffd166' : '#e0b86c'}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0.06, -0.05, leafWidth * 0.36]} castShadow>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial
              color={isHighlighted ? '#ffd166' : '#e0b86c'}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default ConnectingDoor;
