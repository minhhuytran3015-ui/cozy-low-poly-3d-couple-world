import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import BoyCharacter from './BoyCharacter';
import type { CharacterTransformData } from './BoyCharacter';
import GirlCharacter from './GirlCharacter';
import type { CharacterType } from './types';
import type { KeyboardState } from '../../hooks/useKeyboardControls';
import type { CharacterSyncState, EmoteType } from '../../hooks/useMultiplayer';

interface CharacterManagerProps {
  activeCharacter: CharacterType;
  onActiveCharacterChange: (type: CharacterType) => void;
  onTargetPositionChange?: (pos: THREE.Vector3) => void;
  keysRef: React.MutableRefObject<KeyboardState>;
  enabled?: boolean;
  isPartnerOnline?: boolean;
  remoteStateRef?: React.MutableRefObject<CharacterSyncState | null>;
  onSendLocalState?: (state: CharacterSyncState) => void;
  boyEmote?: EmoteType | null;
  girlEmote?: EmoteType | null;
}

// Obstacle definitions for cozy room furniture
const OBSTACLES = [
  { x: -1.4, z: -1.2, radius: 0.85, name: 'coffee-table' },
  { x: -3.8, z: -3.8, radius: 0.65, name: 'potted-plant' },
  { x: 3.8, z: -3.8, radius: 0.60, name: 'floor-lamp' },
];

const ROOM_HALF_SIZE = 4.55; // 10 units room minus 0.45 safe character margin
const CHARACTER_RADIUS = 0.32;

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  activeCharacter,
  onTargetPositionChange,
  keysRef,
  enabled = true,
  isPartnerOnline = false,
  remoteStateRef,
  onSendLocalState,
  boyEmote = null,
  girlEmote = null,
}) => {
  const { camera } = useThree();

  // Boy state in refs for 60fps performance without re-render thrashing
  const boyTransform = useRef<CharacterTransformData>({
    position: new THREE.Vector3(-1.2, 0, 0),
    rotation: 0,
    isMoving: false,
    isSprinting: false,
  });

  // Girl state in refs
  const girlTransform = useRef<CharacterTransformData>({
    position: new THREE.Vector3(1.2, 0, 0),
    rotation: 0,
    isMoving: false,
    isSprinting: false,
  });

  // Reusable vectors in refs to avoid GC in useFrame
  const moveDir = useRef(new THREE.Vector3());
  const camForward = useRef(new THREE.Vector3());
  const camRight = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));
  const activePos = useRef(new THREE.Vector3());

  // Notify initial target position
  useEffect(() => {
    const initialPos = activeCharacter === 'boy'
      ? boyTransform.current.position
      : girlTransform.current.position;
    if (onTargetPositionChange) {
      onTargetPositionChange(initialPos);
    }
  }, [activeCharacter, onTargetPositionChange]);

  useFrame((_, delta) => {
    const isBoy = activeCharacter === 'boy';
    const active = isBoy ? boyTransform.current : girlTransform.current;
    const other = isBoy ? girlTransform.current : boyTransform.current;

    // Update remote character even when local overlay/viewer is open!
    const remote = remoteStateRef?.current;
    if (isPartnerOnline && remote && remote.character !== activeCharacter) {
      const alpha = 1 - Math.exp(-15 * delta);
      other.position.x = THREE.MathUtils.lerp(other.position.x, remote.x, alpha);
      other.position.z = THREE.MathUtils.lerp(other.position.z, remote.z, alpha);

      let rotDiff = remote.rotation - other.rotation;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      other.rotation += rotDiff * alpha;

      const distToTarget = Math.hypot(remote.x - other.position.x, remote.z - other.position.z);
      const isStale = remote.updatedAt ? performance.now() - remote.updatedAt > 500 : false;
      other.isMoving = remote.isMoving || (!isStale && distToTarget > 0.03);
      other.isSprinting = remote.isSprinting;
    } else {
      other.isMoving = false;
      other.isSprinting = false;
    }

    if (!enabled) {
      active.isMoving = false;
      active.isSprinting = false;
      if (onSendLocalState) {
        onSendLocalState({
          character: activeCharacter,
          x: active.position.x,
          z: active.position.z,
          rotation: active.rotation,
          isMoving: false,
          isSprinting: false,
        });
      }
      return;
    }

    const keys = keysRef.current;

    // 1. Calculate camera-relative forward and right vectors projected onto horizontal plane (Y=0)
    camera.getWorldDirection(camForward.current);
    camForward.current.y = 0;
    camForward.current.normalize();

    camRight.current.crossVectors(camForward.current, upVec.current).normalize();

    // 2. Accumulate digital (keyboard) + analog (touch joystick) movement input
    const digitalRight = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const digitalForward = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
    const rawRight = digitalRight + keys.joyX;
    const rawForward = digitalForward + keys.joyY;
    const rawMag = Math.hypot(rawRight, rawForward);

    if (rawMag > 0.08) {
      const clampedMag = Math.min(1, rawMag);
      const normRight = rawRight / rawMag;
      const normForward = rawForward / rawMag;

      moveDir.current
        .set(0, 0, 0)
        .addScaledVector(camForward.current, normForward)
        .addScaledVector(camRight.current, normRight)
        .normalize();

      const joyMag = Math.hypot(keys.joyX, keys.joyY);
      const isSprinting = keys.sprint || keys.touchSprint || joyMag > 0.9;
      const speed = (isSprinting ? 3.8 : 2.3) * clampedMag;
      active.isMoving = true;
      active.isSprinting = isSprinting;

      // Rotate character face towards move direction
      active.rotation = Math.atan2(moveDir.current.x, moveDir.current.z);

      // Tentative next position
      let nextX = active.position.x + moveDir.current.x * speed * delta;
      let nextZ = active.position.z + moveDir.current.z * speed * delta;

      // 3. Collision with Room boundary walls
      nextX = Math.max(-ROOM_HALF_SIZE, Math.min(ROOM_HALF_SIZE, nextX));
      nextZ = Math.max(-ROOM_HALF_SIZE, Math.min(ROOM_HALF_SIZE, nextZ));

      // 4. Collision with Furniture obstacles (circle push-out)
      for (const obs of OBSTACLES) {
        const dx = nextX - obs.x;
        const dz = nextZ - obs.z;
        const distSq = dx * dx + dz * dz;
        const minDist = obs.radius;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            nextX = obs.x + (dx / dist) * minDist;
            nextZ = obs.z + (dz / dist) * minDist;
          }
        }
      }

      // 5. Collision with the other character
      const cdx = nextX - other.position.x;
      const cdz = nextZ - other.position.z;
      const cdistSq = cdx * cdx + cdz * cdz;
      const minCharDist = CHARACTER_RADIUS * 2;
      if (cdistSq < minCharDist * minCharDist) {
        const cdist = Math.sqrt(cdistSq);
        if (cdist > 0.001) {
          nextX = other.position.x + (cdx / cdist) * minCharDist;
          nextZ = other.position.z + (cdz / cdist) * minCharDist;
        }
      }

      nextX = Math.max(-ROOM_HALF_SIZE, Math.min(ROOM_HALF_SIZE, nextX));
      nextZ = Math.max(-ROOM_HALF_SIZE, Math.min(ROOM_HALF_SIZE, nextZ));

      active.position.x = nextX;
      active.position.z = nextZ;
    } else {
      active.isMoving = false;
      active.isSprinting = false;
    }

    // Broadcast local character state to connected partner
    if (onSendLocalState) {
      onSendLocalState({
        character: activeCharacter,
        x: active.position.x,
        z: active.position.z,
        rotation: active.rotation,
        isMoving: active.isMoving,
        isSprinting: active.isSprinting,
      });
    }

    // Update active position reference for FollowCamera
    activePos.current.copy(active.position);
    if (onTargetPositionChange) {
      onTargetPositionChange(activePos.current);
    }
  });

  return (
    <group name="couple-characters">
      {/* Boy Character */}
      <BoyCharacter
        transformRef={boyTransform}
        isActive={activeCharacter === 'boy'}
        emote={boyEmote}
      />

      {/* Girl Character */}
      <GirlCharacter
        transformRef={girlTransform}
        isActive={activeCharacter === 'girl'}
        emote={girlEmote}
      />
    </group>
  );
};

export default CharacterManager;
