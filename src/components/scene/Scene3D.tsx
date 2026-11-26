import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Room from '../room/Room';
import RoomCamera from '../camera/RoomCamera';
import FollowCamera from '../camera/FollowCamera';
import type { CameraControlHandle } from '../camera/FollowCamera';
import CharacterManager from '../character/CharacterManager';
import MemoryGallery from '../gallery/MemoryGallery';
import MemoryInteraction from '../gallery/MemoryInteraction';
import type { CharacterType } from '../character/types';
import type { KeyboardState } from '../../hooks/useKeyboardControls';
import type { CharacterSyncState, EmoteType } from '../../hooks/useMultiplayer';
import type { Memory } from '../../data/memories';

interface Scene3DProps {
  isEntered?: boolean;
  activeCharacter: CharacterType;
  onActiveCharacterChange: (type: CharacterType) => void;
  keysRef: React.MutableRefObject<KeyboardState>;
  activeMemory: Memory | null;
  onActiveMemoryChange: (memory: Memory | null) => void;
  onOpenMemory: (memory: Memory) => void;
  isViewerOpen?: boolean;
  cameraControlRef?: React.MutableRefObject<CameraControlHandle | null>;
  isPartnerOnline?: boolean;
  remoteStateRef?: React.MutableRefObject<CharacterSyncState | null>;
  onSendLocalState?: (state: CharacterSyncState) => void;
  boyEmote?: EmoteType | null;
  girlEmote?: EmoteType | null;
  boyChatBubble?: string | null;
  girlChatBubble?: string | null;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  isEntered = false,
  activeCharacter,
  onActiveCharacterChange,
  keysRef,
  activeMemory,
  onActiveMemoryChange,
  onOpenMemory,
  isViewerOpen = false,
  cameraControlRef,
  isPartnerOnline = false,
  remoteStateRef,
  onSendLocalState,
  boyEmote = null,
  girlEmote = null,
  boyChatBubble = null,
  girlChatBubble = null,
}) => {
  // Shared ref for the active character's current position to drive FollowCamera & Interaction
  const targetPosRef = useRef(new THREE.Vector3(-1.2, 0, 0));

  const handleTargetPositionChange = (pos: THREE.Vector3) => {
    targetPosRef.current.copy(pos);
  };

  return (
    <div className="canvas-container" role="region" aria-label="3D Cozy Room View">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]} // Crisp rendering on high-DPI screens
      >
        {/* Warm subtle background color */}
        <color attach="background" args={['#f7f3ed']} />

        {/* Soft fog to blend room edges smoothly into the warm background */}
        <fog attach="fog" args={['#f7f3ed', 20, 42]} />

        {/* Camera System:
            Phase 1 Overview Camera before enter;
            Phase 2 & 3 Third-Person Follow Camera after entering. */}
        {!isEntered ? (
          <RoomCamera
            initialPosition={[9.0, 11.0, 9.0]}
            target={[0, 0.8, 0]}
            minDistance={3.5}
            maxDistance={18.0}
            isEntered={false}
          />
        ) : (
          <FollowCamera
            targetPosition={targetPosRef}
            enabled={!isViewerOpen}
            controlRef={cameraControlRef}
          />
        )}

        {/* Main 3D Room Environment */}
        <Suspense fallback={null}>
          <Room size={10} wallHeight={3.5} wallThickness={0.2} />
        </Suspense>

        {/* 15 Memory Photo & Video Frames mounted on 4 walls */}
        <MemoryGallery
          activeMemoryId={activeMemory ? activeMemory.id : null}
          onSelectMemory={onOpenMemory}
        />

        {/* Proximity Distance Detection & Key 'E' Trigger */}
        <MemoryInteraction
          targetPosition={targetPosRef}
          onActiveMemoryChange={onActiveMemoryChange}
          onOpenMemory={onOpenMemory}
          isViewerOpen={isViewerOpen}
          enabled={isEntered}
        />

        {/* Couple 3D Characters (Boy & Girl) */}
        <CharacterManager
          activeCharacter={activeCharacter}
          onActiveCharacterChange={onActiveCharacterChange}
          onTargetPositionChange={handleTargetPositionChange}
          keysRef={keysRef}
          enabled={isEntered && !isViewerOpen}
          isPartnerOnline={isPartnerOnline}
          remoteStateRef={remoteStateRef}
          onSendLocalState={onSendLocalState}
          boyEmote={boyEmote}
          girlEmote={girlEmote}
          boyChatBubble={boyChatBubble}
          girlChatBubble={girlChatBubble}
        />

        {/* Soft ground shadow receiver below the room */}
        <mesh position={[0, -0.31, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <shadowMaterial opacity={0.12} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Scene3D;
