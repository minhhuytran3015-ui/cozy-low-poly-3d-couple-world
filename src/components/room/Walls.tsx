import React from 'react';

interface WallsProps {
  roomSize?: number; // 10 units
  wallHeight?: number; // 3.5 units
  wallThickness?: number; // 0.2 units
  color?: string;
}

export const Walls: React.FC<WallsProps> = ({
  roomSize = 10,
  wallHeight = 3.5,
  wallThickness = 0.2,
  color = '#f8f5ee', // Warm cream white
}) => {
  const halfSize = roomSize / 2;
  const halfHeight = wallHeight / 2;
  const halfThick = wallThickness / 2;
  const outerLength = roomSize + wallThickness * 2;

  // Baseboard (skirting board) dimensions
  const baseboardHeight = 0.14;
  const baseboardThick = 0.03;
  const baseboardY = baseboardHeight / 2;
  const baseboardColor = '#eee7dc';

  return (
    <group name="room-walls">
      {/* 1. North / Back Wall (Z = -5) */}
      <mesh
        position={[0, halfHeight, -halfSize - halfThick]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[outerLength, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      {/* North Baseboard */}
      <mesh position={[0, baseboardY, -halfSize + baseboardThick / 2]} receiveShadow>
        <boxGeometry args={[roomSize, baseboardHeight, baseboardThick]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} />
      </mesh>

      {/* 2. South / Front Wall (Z = +5) */}
      <mesh
        position={[0, halfHeight, halfSize + halfThick]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[outerLength, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      {/* South Baseboard */}
      <mesh position={[0, baseboardY, halfSize - baseboardThick / 2]} receiveShadow>
        <boxGeometry args={[roomSize, baseboardHeight, baseboardThick]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} />
      </mesh>

      {/* 3. West / Left Wall (X = -5) */}
      <mesh
        position={[-halfSize - halfThick, halfHeight, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      {/* West Baseboard */}
      <mesh position={[-halfSize + baseboardThick / 2, baseboardY, 0]} receiveShadow>
        <boxGeometry args={[baseboardThick, baseboardHeight, roomSize]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} />
      </mesh>

      {/* 4. East / Right Wall (X = +5) with doorway opening at Z in [-0.85, +0.85], Y < 2.45 */}
      {/* East Wall Left Segment (Z: -5.0 to -0.85, length 4.15) */}
      <mesh
        position={[halfSize + halfThick, halfHeight, -2.925]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, 4.15]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[halfSize - baseboardThick / 2, baseboardY, -2.925]} receiveShadow>
        <boxGeometry args={[baseboardThick, baseboardHeight, 4.15]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} />
      </mesh>

      {/* East Wall Right Segment (Z: +0.85 to +5.0, length 4.15) */}
      <mesh
        position={[halfSize + halfThick, halfHeight, 2.925]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight, 4.15]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[halfSize - baseboardThick / 2, baseboardY, 2.925]} receiveShadow>
        <boxGeometry args={[baseboardThick, baseboardHeight, 4.15]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} />
      </mesh>

      {/* East Wall Top Header above Door (Y: 2.45 to 3.5, Z: -0.85 to +0.85) */}
      <mesh
        position={[halfSize + halfThick, 2.45 + (wallHeight - 2.45) / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, wallHeight - 2.45, 1.7]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
      </mesh>
    </group>
  );
};

export default Walls;
