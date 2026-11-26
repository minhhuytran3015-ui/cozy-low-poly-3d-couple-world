import React, { useState, useCallback, useRef, useMemo } from 'react';
import './styles/global.css';
import IntroScreen from './components/intro/IntroScreen';
import Scene3D from './components/scene/Scene3D';
import ControlHUD from './components/ui/ControlHUD';
import InteractionPrompt from './components/ui/InteractionPrompt';
import TouchControls from './components/ui/TouchControls';
import GalleryDrawer from './components/ui/GalleryDrawer';
import MultiplayerModal from './components/ui/MultiplayerModal';
import ChatBox from './components/ui/ChatBox';
import MemoryViewer from './components/gallery/MemoryViewer';
import type { CharacterType } from './components/character/types';
import type { CameraControlHandle } from './components/camera/FollowCamera';
import { memories } from './data/memories';
import type { Memory } from './data/memories';
import useKeyboardControls from './hooks/useKeyboardControls';
import useDeviceMode from './hooks/useDeviceMode';
import useMultiplayer from './hooks/useMultiplayer';

export const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [activeCharacter, setActiveCharacter] = useState<CharacterType>('boy');
  const [nearbyMemory, setNearbyMemory] = useState<Memory | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState<boolean>(false);
  const [isChatFocused, setIsChatFocused] = useState<boolean>(false);

  const cameraControlRef = useRef<CameraControlHandle | null>(null);
  const { inputMode, toggleInputMode } = useDeviceMode();

  const multiplayer = useMultiplayer({
    activeCharacter,
    onAssignCharacter: setActiveCharacter,
  });

  const isOverlayOpen = !!selectedMemory || isGalleryOpen || isMultiplayerOpen;

  const handleSwitchCharacter = useCallback(
    (newType?: CharacterType) => {
      // When playing together in real time, switching to partner's tab swaps roles cleanly
      if (multiplayer.isPartnerOnline) {
        if (!newType || newType !== activeCharacter) {
          multiplayer.swapRoles();
        }
        return;
      }

      setActiveCharacter((prev) => {
        if (newType) return newType;
        return prev === 'boy' ? 'girl' : 'boy';
      });
    },
    [multiplayer, activeCharacter]
  );

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
      if (!isOverlayOpen && !isChatFocused && !multiplayer.isPartnerOnline) {
        handleSwitchCharacter();
      }
    },
    enabled: hasEntered && !isOverlayOpen && !isChatFocused,
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
        isPartnerOnline={multiplayer.isPartnerOnline}
        remoteStateRef={multiplayer.remoteStateRef}
        onSendLocalState={multiplayer.sendLocalState}
        boyEmote={multiplayer.emotes.boy}
        girlEmote={multiplayer.emotes.girl}
        boyChatBubble={multiplayer.chatBubbles.boy}
        girlChatBubble={multiplayer.chatBubbles.girl}
      />

      {/* Responsive HUD (Phone / iPad / Desktop) */}
      <ControlHUD
        activeCharacter={activeCharacter}
        onSwitchCharacter={handleSwitchCharacter}
        inputMode={inputMode}
        onToggleInputMode={toggleInputMode}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
        onSendEmote={multiplayer.sendEmote}
        multiplayerStatus={multiplayer.status}
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

      {/* Real-time Couple Chat, History & Keyword Search */}
      <ChatBox
        messages={multiplayer.chatMessages}
        activeCharacter={activeCharacter}
        isPartnerOnline={multiplayer.isPartnerOnline}
        onSendMessage={multiplayer.sendChatMessage}
        onClearHistory={multiplayer.clearChatHistory}
        onInputFocusChange={setIsChatFocused}
        visible={hasEntered && !isOverlayOpen}
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

      {/* Real-time Multiplayer Invite & Room Modal */}
      <MultiplayerModal
        open={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        transport={multiplayer.transport}
        roomCode={multiplayer.roomCode}
        inviteUrl={multiplayer.inviteUrl}
        status={multiplayer.status}
        errorMsg={multiplayer.errorMsg}
        activeCharacter={activeCharacter}
        onCreateRoom={multiplayer.createRoom}
        onRetry={multiplayer.retryConnection}
        onLeaveRoom={multiplayer.leaveRoom}
        onSwapRoles={multiplayer.swapRoles}
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
