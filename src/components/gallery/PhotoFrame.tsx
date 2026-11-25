import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { Memory } from '../../data/memories';
import { getMemoryPlaceholderTexture } from './placeholderThumbnails';

interface PhotoFrameProps {
  memory: Memory;
  isHighlighted?: boolean;
  onSelect?: (memory: Memory) => void;
}

export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  memory,
  isHighlighted = false,
  onSelect,
}) => {
  const { width, height, wall, position, type } = memory;
  const borderWidth = 0.08;
  const frameThickness = 0.04;
  const totalWidth = width + borderWidth * 2;
  const totalHeight = height + borderWidth * 2;

  // Real texture state when an external image path is provided
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const imageSrc = memory.thumbnail || (memory.type === 'image' ? memory.src : null);
    if (!imageSrc) {
      setLoadedTexture(null);
      return;
    }

    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      imageSrc,
      (tex) => {
        if (isMounted) {
          tex.colorSpace = THREE.SRGBColorSpace;
          setLoadedTexture(tex);
        }
      },
      undefined,
      () => {
        if (isMounted) setLoadedTexture(null);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [memory.src, memory.thumbnail, memory.type]);

  // Calculate 3D position and rotation against wall surface
  const { framePos, frameRot } = useMemo(() => {
    const wallOffset = 4.96; // slightly in front of 5.0 wall face to avoid z-fighting
    switch (wall) {
      case 'north':
        return {
          framePos: [position[0], position[1], -wallOffset] as [number, number, number],
          frameRot: [0, 0, 0] as [number, number, number],
        };
      case 'south':
        return {
          framePos: [position[0], position[1], wallOffset] as [number, number, number],
          frameRot: [0, Math.PI, 0] as [number, number, number],
        };
      case 'east':
        return {
          framePos: [wallOffset, position[1], position[0]] as [number, number, number],
          frameRot: [0, -Math.PI / 2, 0] as [number, number, number],
        };
      case 'west':
        return {
          framePos: [-wallOffset, position[1], position[0]] as [number, number, number],
          frameRot: [0, Math.PI / 2, 0] as [number, number, number],
        };
    }
  }, [wall, position]);

  // Fallback to warm procedural canvas texture if no external file or while loading
  const placeholderTexture = useMemo(() => {
    return getMemoryPlaceholderTexture(memory);
  }, [memory]);

  const activeTexture = loadedTexture || placeholderTexture;

  return (
    <group
      position={framePos}
      rotation={frameRot}
      onClick={(e) => {
        e.stopPropagation();
        // Ignore accidental tap/click if user was dragging camera
        if (e.delta > 6) return;
        if (onSelect) onSelect(memory);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. Outer Frame Box (Border) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[totalWidth, totalHeight, frameThickness]} />
        <meshStandardMaterial
          color={isHighlighted ? '#f8e4d2' : '#dec4a2'}
          emissive={isHighlighted ? '#df9e82' : '#000000'}
          emissiveIntensity={isHighlighted ? 0.35 : 0}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* 2. White Mat / Inset Bevel */}
      <mesh position={[0, 0, frameThickness * 0.45]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshStandardMaterial color="#fffcf7" roughness={0.9} />
      </mesh>

      {/* 3. Picture / Artwork Surface */}
      <mesh position={[0, 0, frameThickness * 0.52]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={activeTexture}
          roughness={0.45}
          metalness={0.0}
        />
      </mesh>

      {/* 4. Subtle Glass Reflective Gloss */}
      <mesh position={[0, 0, frameThickness * 0.54]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* 5. Video Play Badge (If content type is video) */}
      {type === 'video' && (
        <group position={[width * 0.38, -height * 0.36, frameThickness * 0.58]}>
          <mesh>
            <circleGeometry args={[0.09, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0.01, 0, 0.002]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.065, 3]} />
            <meshBasicMaterial color="#df7d62" />
          </mesh>
        </group>
      )}

      {/* 6. Highlight Glow Aura when approached by active character */}
      {isHighlighted && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[totalWidth + 0.12, totalHeight + 0.12]} />
          <meshBasicMaterial
            color="#df9e82"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default PhotoFrame;
