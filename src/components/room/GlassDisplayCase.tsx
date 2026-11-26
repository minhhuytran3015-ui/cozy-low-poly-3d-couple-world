import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GiftCaseItem, GiftShapeType } from '../../data/giftCases';

interface GlassDisplayCaseProps {
  item: GiftCaseItem;
  isActive?: boolean;
  onSelect?: (item: GiftCaseItem) => void;
}

const GiftObjectMesh: React.FC<{ shape: GiftShapeType; color: string }> = ({ shape, color }) => {
  switch (shape) {
    case 'ring':
      return (
        <group>
          <mesh rotation={[Math.PI * 0.25, 0, 0]} castShadow>
            <torusGeometry args={[0.12, 0.028, 12, 24]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.11, 0.04]} castShadow>
            <octahedronGeometry args={[0.048, 0]} />
            <meshStandardMaterial
              color="#e0f7fa"
              emissive="#80deea"
              emissiveIntensity={0.45}
              roughness={0.1}
            />
          </mesh>
        </group>
      );
    case 'bouquet':
      return (
        <group>
          <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.1, 0.18, 8]} />
            <meshStandardMaterial color="#f4d8cd" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.06, 0]} castShadow>
            <dodecahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[-0.06, 0.04, 0.04]} castShadow>
            <dodecahedronGeometry args={[0.055, 0]} />
            <meshStandardMaterial color="#ff9ebb" roughness={0.5} />
          </mesh>
          <mesh position={[0.06, 0.04, -0.03]} castShadow>
            <dodecahedronGeometry args={[0.055, 0]} />
            <meshStandardMaterial color="#ffcad4" roughness={0.5} />
          </mesh>
        </group>
      );
    case 'bear':
      return (
        <group>
          {/* Body */}
          <mesh position={[0, -0.04, 0]} castShadow>
            <sphereGeometry args={[0.095, 10, 10]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.055, 0.14, 0]} castShadow>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0.055, 0.14, 0]} castShadow>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Ribbon */}
          <mesh position={[0, 0.02, 0.075]} castShadow>
            <boxGeometry args={[0.07, 0.035, 0.02]} />
            <meshStandardMaterial color="#e05d6f" roughness={0.5} />
          </mesh>
        </group>
      );
    case 'wallet':
      return (
        <group rotation={[0.25, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.14, 0.055]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          <mesh position={[0.06, 0, 0.03]}>
            <boxGeometry args={[0.04, 0.04, 0.015]} />
            <meshStandardMaterial color="#e9c46a" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      );
    case 'musicbox':
    default:
      return (
        <group>
          <mesh position={[0, -0.03, 0]} castShadow>
            <boxGeometry args={[0.19, 0.12, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.05, -0.05]} rotation={[-0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.19, 0.02, 0.14]} />
            <meshStandardMaterial color="#e9c46a" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.06, 0.02]}>
            <octahedronGeometry args={[0.035, 0]} />
            <meshStandardMaterial color="#ffd166" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      );
  }
};

export const GlassDisplayCase: React.FC<GlassDisplayCaseProps> = ({
  item,
  isActive = false,
  onSelect,
}) => {
  const giftRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (giftRef.current) {
      giftRef.current.rotation.y += delta * 0.7;
      giftRef.current.position.y = 0.8 + Math.sin(performance.now() * 0.002) * 0.02;
    }
  });

  return (
    <group
      name={`display-case-${item.id}`}
      position={item.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(item);
      }}
    >
      {/* Stone Base Plinth */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.56, 0.68]} />
        <meshStandardMaterial color="#ece4d8" roughness={0.78} />
      </mesh>

      {/* Warm Wood Top Trim */}
      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.74, 0.06, 0.74]} />
        <meshStandardMaterial color="#9c7350" roughness={0.6} />
      </mesh>

      {/* Velvet Cushion */}
      <mesh position={[0, 0.625, 0]} receiveShadow>
        <boxGeometry args={[0.46, 0.03, 0.46]} />
        <meshStandardMaterial color="#f6e7e4" roughness={0.9} />
      </mesh>

      {/* Rotating 3D Gift Inside */}
      <group ref={giftRef} position={[0, 0.8, 0]}>
        <GiftObjectMesh shape={item.shape} color={item.accentColor} />
      </group>

      {/* Transparent Glass Cube */}
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[0.58, 0.54, 0.58]} />
        <meshPhysicalMaterial
          color="#eef9f9"
          transparent
          opacity={0.26}
          roughness={0.08}
          metalness={0.05}
          reflectivity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Brass Corner Frame Top & Bottom */}
      <mesh position={[0, 1.155, 0]}>
        <boxGeometry args={[0.6, 0.025, 0.6]} />
        <meshStandardMaterial
          color={isActive ? '#ffd166' : '#c9a66b'}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* Active Ground Ring when player is nearby */}
      {isActive && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.6, 28]} />
          <meshBasicMaterial color="#f6bd60" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

export default GlassDisplayCase;
