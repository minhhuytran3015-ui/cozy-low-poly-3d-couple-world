import React, { useState, useCallback } from 'react';
import './styles/global.css';
import IntroScreen from './components/intro/IntroScreen';
import Scene3D from './components/scene/Scene3D';
import ControlHUD from './components/ui/ControlHUD';
import InteractionPrompt from './components/ui/InteractionPrompt';
import MemoryViewer from './components/gallery/MemoryViewer';
import type { CharacterType } from './components/character/types';
import type { Memory } from './data/memories';
import useKeyboardControls from './hooks/useKeyboardControls';

export const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [activeCharacter, setActiveCharacter] = useState<CharacterType>('boy');

  // Currently approached memory (shows "E - Xem kỷ niệm" prompt)
  const [nearbyMemory, setNearbyMemory] = useState<Memory | null>(null);

  // Currently opened memory in modal viewer (null when closed)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const handleSwitchCharacter = useCallback((newType?: CharacterType) => {
    setActiveCharacter((prev) => {
      if (newType) return newType;
      return prev === 'boy' ? 'girl' : 'boy';
    });
  }, []);

  const handleOpenMemory = useCallback((memory: Memory) => {
    setSelectedMemory(memory);
  }, []);

  const handleCloseMemory = useCallback(() => {
    setSelectedMemory(null);
  }, []);

  // Central keyboard listener for WASD movement and Tab switching
  // Disabled when MemoryViewer is open to prevent moving while viewing memories
  const keysRef = useKeyboardControls({
    onTabPress: () => {
      if (!selectedMemory) {
        handleSwitchCharacter();
      }
    },
    enabled: hasEntered && !selectedMemory,
  });

  const handleEnterWorld = () => {
    setHasEntered(true);
  };

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 
        3D Scene with Room, 15 Photo Frames, Couple Characters, and FollowCamera.
        Mounted beneath the Intro Screen.
      */}
      <Scene3D
        isEntered={hasEntered}
        activeCharacter={activeCharacter}
        onActiveCharacterChange={setActiveCharacter}
        keysRef={keysRef}
        activeMemory={nearbyMemory}
        onActiveMemoryChange={setNearbyMemory}
        onOpenMemory={handleOpenMemory}
        isViewerOpen={!!selectedMemory}
      />

      {/* Control HUD: Active Character Badge & Controls Guide */}
      <ControlHUD
        activeCharacter={activeCharacter}
        onSwitchCharacter={handleSwitchCharacter}
        visible={hasEntered && !selectedMemory}
      />

      {/* Distance Proximity Interaction Prompt: "E - Xem kỷ niệm" */}
      <InteractionPrompt
        memory={nearbyMemory}
        onOpen={handleOpenMemory}
        visible={hasEntered && !selectedMemory}
      />

      {/* Memory Viewer Modal (Image / Video player overlay) */}
      <MemoryViewer
        memory={selectedMemory}
        onClose={handleCloseMemory}
      />

      {/* Intro Screen Overlay (fades out smoothly on enter) */}
      <IntroScreen onEnter={handleEnterWorld} />
    </main>
  );
};

export default App;
