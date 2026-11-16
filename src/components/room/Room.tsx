import React from 'react';
import Floor from './Floor';
import Walls from './Walls';
import Furniture from './Furniture';
import Lighting from './Lighting';

interface RoomProps {
  size?: number;
  wallHeight?: number;
  wallThickness?: number;
  showCeiling?: boolean;
}

export const Room: React.FC<RoomProps> = ({
  size = 10,
  wallHeight = 3.5,
  wallThickness = 0.2,
  showCeiling = false,
}) => {
  return (
    <group name="cozy-3d-room">
      {/* 1. Lighting System */}
      <Lighting />

      {/* 2. Light Wood Floor */}
      <Floor size={size} />

      {/* 3. Four Cream White Enclosing Walls */}
      <Walls
        roomSize={size}
        wallHeight={wallHeight}
        wallThickness={wallThickness}
      />

      {/* 4. Minimalist Low-poly Furniture */}
      <Furniture />

      {/* 5. Ceiling placeholder for future phases */}
      {showCeiling && (
        <mesh position={[0, wallHeight + 0.1, 0]}>
          <boxGeometry args={[size + wallThickness * 2, 0.2, size + wallThickness * 2]} />
          <meshStandardMaterial color="#faf6f0" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

export default Room;
