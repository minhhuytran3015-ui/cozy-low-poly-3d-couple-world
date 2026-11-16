import React from 'react';
import { memories } from '../../data/memories';
import type { Memory } from '../../data/memories';
import PhotoFrame from './PhotoFrame';

interface MemoryGalleryProps {
  activeMemoryId: string | null;
  onSelectMemory?: (memory: Memory) => void;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  activeMemoryId,
  onSelectMemory,
}) => {
  return (
    <group name="memory-gallery">
      {memories.map((memory) => (
        <PhotoFrame
          key={memory.id}
          memory={memory}
          isHighlighted={activeMemoryId === memory.id}
          onSelect={onSelectMemory}
        />
      ))}
    </group>
  );
};

export default MemoryGallery;
