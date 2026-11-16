import React, { useMemo } from 'react';
import * as THREE from 'three';

interface FloorProps {
  size?: number; // 10 units
  wallThickness?: number; // 0.2 units
}

export const Floor: React.FC<FloorProps> = ({ size = 10, wallThickness = 0.2 }) => {
  // Generate subtle low-poly wooden planks for a warm natural look
  const plankCount = 20;
  const plankWidth = size / plankCount;
  const plankLength = size;

  const planks = useMemo(() => {
    // Soft, light warm wood palette
    const woodTones = [
      '#e5cca9',
      '#dfc39f',
      '#dab993',
      '#e2c6a4',
      '#dfc19c',
      '#dec4a2',
    ];

    return Array.from({ length: plankCount }).map((_, i) => {
      const x = -size / 2 + plankWidth / 2 + i * plankWidth;
      const color = woodTones[i % woodTones.length];
      return { id: i, x, color };
    });
  }, [size, plankCount, plankWidth]);

  const foundationSize = size + wallThickness * 2;

  return (
    <group name="room-floor">
      {/* Solid foundation slab beneath the room & walls to seal any base gaps */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[foundationSize, 0.3, foundationSize]} />
        <meshStandardMaterial
          color="#cfb08b"
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>

      {/* Individual wooden floor planks */}
      {planks.map((plank) => (
        <mesh
          key={plank.id}
          position={[plank.x, 0.005, 0]}
          receiveShadow
        >
          <boxGeometry args={[plankWidth - 0.015, 0.01, plankLength]} />
          <meshStandardMaterial
            color={plank.color}
            roughness={0.68}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Floor;
