import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getWallFrameTransform, memories } from '../../data/memories';
import type { Memory } from '../../data/memories';

interface MemoryInteractionProps {
  targetPosition: THREE.Vector3 | React.MutableRefObject<THREE.Vector3>;
  onActiveMemoryChange: (memory: Memory | null) => void;
  onOpenMemory: (memory: Memory) => void;
  isViewerOpen?: boolean;
  enabled?: boolean;
}

const INTERACTION_DISTANCE_XZ = 1.9; // Horizontal trigger threshold (units)

export const MemoryInteraction: React.FC<MemoryInteractionProps> = ({
  targetPosition,
  onActiveMemoryChange,
  onOpenMemory,
  isViewerOpen = false,
  enabled = true,
}) => {
  // Pre-calculate world positions for each memory on the walls
  const memoryPositions = useMemo(() => {
    return memories.map((m) => {
      const { framePos } = getWallFrameTransform(m.wall, m.position);
      return { memory: m, pos: new THREE.Vector3(framePos[0], framePos[1], framePos[2]) };
    });
  }, []);

  const lastActiveId = useRef<string | null>(null);
  const currentClosest = useRef<Memory | null>(null);

  // Keyboard listener for 'E' key
  useEffect(() => {
    if (!enabled || isViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        if (currentClosest.current && !isViewerOpen) {
          e.preventDefault();
          onOpenMemory(currentClosest.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, isViewerOpen, onOpenMemory]);

  useFrame(() => {
    if (!enabled || isViewerOpen) {
      if (lastActiveId.current !== null) {
        lastActiveId.current = null;
        currentClosest.current = null;
        onActiveMemoryChange(null);
      }
      return;
    }

    const target = 'current' in targetPosition ? targetPosition.current : targetPosition;
    const charX = target.x;
    const charZ = target.z;

    let closest: Memory | null = null;
    let minDistanceSq = INTERACTION_DISTANCE_XZ * INTERACTION_DISTANCE_XZ;

    for (const item of memoryPositions) {
      const dx = charX - item.pos.x;
      const dz = charZ - item.pos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closest = item.memory;
      }
    }

    // Only invoke React state callback when the closest memory actually changes
    const newId = closest ? closest.id : null;
    if (newId !== lastActiveId.current) {
      lastActiveId.current = newId;
      currentClosest.current = closest;
      onActiveMemoryChange(closest);
    }
  });

  return null;
};

export default MemoryInteraction;
