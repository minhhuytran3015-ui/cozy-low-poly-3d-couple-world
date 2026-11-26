import React from 'react';
import GrassFloor from './GrassFloor';
import GlassDisplayCase from './GlassDisplayCase';
import { giftCases } from '../../data/giftCases';
import type { GiftCaseItem } from '../../data/giftCases';
import {
  DOOR_HEIGHT,
  MUSEUM_CENTER_X,
  MUSEUM_CENTER_Z,
  MUSEUM_DEPTH,
  MUSEUM_MAX_X,
  MUSEUM_MAX_Z,
  MUSEUM_MIN_X,
  MUSEUM_MIN_Z,
  MUSEUM_WALL_HEIGHT,
  MUSEUM_WIDTH,
  WALL_THICKNESS,
} from '../../data/roomConfig';

interface MuseumRoomProps {
  activeGiftId?: string | null;
  onSelectGift?: (item: GiftCaseItem) => void;
}

export const MuseumRoom: React.FC<MuseumRoomProps> = ({
  activeGiftId = null,
  onSelectGift,
}) => {
  const halfH = MUSEUM_WALL_HEIGHT / 2;
  const halfThick = WALL_THICKNESS / 2;
  const wallColor = '#f4efe6';
  const trimColor = '#e6ddd0';

  // West wall (X = MUSEUM_MIN_X = 5.4) has doorway at Z in [-0.85, +0.85], Y < 2.45
  // Left segment Z: [-8.0, -0.85] -> length 7.15, center -4.425
  // Right segment Z: [+0.85, +8.0] -> length 7.15, center +4.425

  return (
    <group name="museum-gallery-room">
      {/* Lush Below-Knee Grass Floor & Stepping Stones */}
      <GrassFloor />

      {/* Warm Museum Lighting */}
      <pointLight
        position={[MUSEUM_CENTER_X, 3.6, 0]}
        intensity={1.15}
        distance={22}
        decay={1.4}
        color="#fff6e8"
      />
      <pointLight
        position={[9.5, 3.4, -4.5]}
        intensity={0.55}
        distance={14}
        decay={1.5}
        color="#fff0d8"
      />
      <pointLight
        position={[17.5, 3.4, 4.5]}
        intensity={0.55}
        distance={14}
        decay={1.5}
        color="#fff0d8"
      />

      {/* North Museum Wall (Z = -8.0) */}
      <mesh
        position={[MUSEUM_CENTER_X, halfH, MUSEUM_MIN_Z - halfThick]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[MUSEUM_WIDTH + WALL_THICKNESS * 2, MUSEUM_WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>
      <mesh position={[MUSEUM_CENTER_X, 0.09, MUSEUM_MIN_Z + 0.015]} receiveShadow>
        <boxGeometry args={[MUSEUM_WIDTH, 0.18, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.8} />
      </mesh>

      {/* South Museum Wall (Z = +8.0) */}
      <mesh
        position={[MUSEUM_CENTER_X, halfH, MUSEUM_MAX_Z + halfThick]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[MUSEUM_WIDTH + WALL_THICKNESS * 2, MUSEUM_WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>
      <mesh position={[MUSEUM_CENTER_X, 0.09, MUSEUM_MAX_Z - 0.015]} receiveShadow>
        <boxGeometry args={[MUSEUM_WIDTH, 0.18, 0.03]} />
        <meshStandardMaterial color={trimColor} roughness={0.8} />
      </mesh>

      {/* East Museum Wall (X = +21.4) */}
      <mesh
        position={[MUSEUM_MAX_X + halfThick, halfH, MUSEUM_CENTER_Z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS, MUSEUM_WALL_HEIGHT, MUSEUM_DEPTH]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>
      <mesh position={[MUSEUM_MAX_X - 0.015, 0.09, MUSEUM_CENTER_Z]} receiveShadow>
        <boxGeometry args={[0.03, 0.18, MUSEUM_DEPTH]} />
        <meshStandardMaterial color={trimColor} roughness={0.8} />
      </mesh>

      {/* West Museum Wall (X = +5.4) with Doorway Opening */}
      <mesh position={[MUSEUM_MIN_X - halfThick, halfH, -4.425]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, MUSEUM_WALL_HEIGHT, 7.15]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>
      <mesh position={[MUSEUM_MIN_X - halfThick, halfH, 4.425]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, MUSEUM_WALL_HEIGHT, 7.15]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>
      <mesh
        position={[MUSEUM_MIN_X - halfThick, DOOR_HEIGHT + (MUSEUM_WALL_HEIGHT - DOOR_HEIGHT) / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS, MUSEUM_WALL_HEIGHT - DOOR_HEIGHT, 1.7]} />
        <meshStandardMaterial color={wallColor} roughness={0.86} />
      </mesh>

      {/* 4 Subtle Corner Pilasters for Museum Architecture */}
      {[
        [MUSEUM_MIN_X + 0.12, MUSEUM_MIN_Z + 0.12],
        [MUSEUM_MAX_X - 0.12, MUSEUM_MIN_Z + 0.12],
        [MUSEUM_MIN_X + 0.12, MUSEUM_MAX_Z - 0.12],
        [MUSEUM_MAX_X - 0.12, MUSEUM_MAX_Z - 0.12],
      ].map(([px, pz], idx) => (
        <mesh key={`pilaster-${idx}`} position={[px, halfH, pz]} castShadow receiveShadow>
          <boxGeometry args={[0.26, MUSEUM_WALL_HEIGHT, 0.26]} />
          <meshStandardMaterial color="#ebe2d4" roughness={0.8} />
        </mesh>
      ))}

      {/* 5 Glass Display Cases for Couple Gifts */}
      {giftCases.map((item) => (
        <GlassDisplayCase
          key={item.id}
          item={item}
          isActive={activeGiftId === item.id}
          onSelect={onSelectGift}
        />
      ))}
    </group>
  );
};

export default MuseumRoom;
