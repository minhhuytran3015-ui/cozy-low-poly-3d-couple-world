import React, { useState, useCallback, useRef, useMemo } from 'react';
import './styles/global.css';
import IntroScreen from './components/intro/IntroScreen';
import Scene3D from './components/scene/Scene3D';
import ControlHUD from './components/ui/ControlHUD';
import InteractionPrompt from './components/ui/InteractionPrompt';
import TouchControls from './components/ui/TouchControls';
import GalleryDrawer from './components/ui/GalleryDrawer';
import MemoryViewer from './components/gallery/MemoryViewer';
import type { CharacterType } from './components/character/types';
import type { CameraControlHandle } from './components/camera/FollowCamera';
import { memories } from './data/memories';
import type { Memory } from './data/memories';
import useKeyboardControls from './hooks/useKeyboardControls';
import useDeviceMode from './hooks/useDeviceMode';

export const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [activeCharacter, setActiveCharacter] = useState<CharacterType>('boy');
  const [nearbyMemory, setNearbyMemory] = useState<Memory | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  const cameraControlRef = useRef<CameraControlHandle | null>(null);
  const { inputMode, toggleInputMode } = useDeviceMode();

  const isOverlayOpen = !!selectedMemory || isGalleryOpen;

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

  const selectedIndex = useMemo(() => {
    if (!selectedMemory) return -1;
    return memories.findIndex((m) => m.id === selectedMemory.id);
  }, [selectedMemory]);

  const handlePrevMemory = useCallback(() => {
    if (selectedIndex < 0) return;
    const prevIdx = (selectedIndex - 1 + memories.length) % memories.length;
    setSelectedMemory(memories[prevIdx]);
  }, [selectedIndex]);

  const handleNextMemory = useCallback(() => {
    if (selectedIndex < 0) return;
    const nextIdx = (selectedIndex + 1) % memories.length;
    setSelectedMemory(memories[nextIdx]);
  }, [selectedIndex]);

  const keysRef = useKeyboardControls({
    onTabPress: () => {
      if (!isOverlayOpen) {
        handleSwitchCharacter();
      }
    },
    enabled: hasEntered && !isOverlayOpen,
  });

  const handleEnterWorld = () => {
    setHasEntered(true);
  };

  return (
    <main className="app-shell">
      {/* 3D Scene */}
      <Scene3D
        isEntered={hasEntered}
        activeCharacter={activeCharacter}
        onActiveCharacterChange={setActiveCharacter}
        keysRef={keysRef}
        activeMemory={nearbyMemory}
        onActiveMemoryChange={setNearbyMemory}
        onOpenMemory={handleOpenMemory}
        isViewerOpen={isOverlayOpen}
        cameraControlRef={cameraControlRef}
      />

      {/* Responsive HUD (Phone / iPad / Desktop) */}
      <ControlHUD
        activeCharacter={activeCharacter}
        onSwitchCharacter={handleSwitchCharacter}
        inputMode={inputMode}
        onToggleInputMode={toggleInputMode}
        onOpenGallery={() => setIsGalleryOpen(true)}
        memoryCount={memories.length}
        cameraControlRef={cameraControlRef}
        visible={hasEntered && !isOverlayOpen}
      />

      {/* Touch Controls (Analog Joystick, Sprint, Switch, Zoom) */}
      <TouchControls
        keysRef={keysRef}
        cameraControlRef={cameraControlRef}
        onSwitchCharacter={() => handleSwitchCharacter()}
        visible={hasEntered && !isOverlayOpen && inputMode === 'touch'}
      />

      {/* Proximity Interaction Prompt */}
      <InteractionPrompt
        memory={nearbyMemory}
        onOpen={handleOpenMemory}
        inputMode={inputMode}
        visible={hasEntered && !isOverlayOpen}
      />

      {/* Quick Gallery Album Drawer */}
      <GalleryDrawer
        open={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectMemory={handleOpenMemory}
      />

      {/* Memory Viewer Modal (Swipe / Arrow / Esc) */}
      <MemoryViewer
        memory={selectedMemory}
        onClose={handleCloseMemory}
        onPrev={handlePrevMemory}
        onNext={handleNextMemory}
        currentIndex={selectedIndex >= 0 ? selectedIndex : undefined}
        totalCount={memories.length}
        inputMode={inputMode}
      />

      {/* Intro Screen Overlay */}
      <IntroScreen onEnter={handleEnterWorld} />
    </main>
  );
};

export default App;
