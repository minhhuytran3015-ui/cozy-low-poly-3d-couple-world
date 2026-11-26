import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import BoyCharacter from './BoyCharacter';
import type { CharacterTransformData } from './BoyCharacter';
import GirlCharacter from './GirlCharacter';
import type { CharacterType } from './types';
import type { KeyboardState } from '../../hooks/useKeyboardControls';
import type { CharacterSyncState, EmoteType } from '../../hooks/useMultiplayer';
import { giftCases } from '../../data/giftCases';
import {
  CHAR_MARGIN,
  DOOR_PASS_HALF_Z,
  DOOR_X_END,
  DOOR_X_START,
  MUSEUM_MAX_X,
  MUSEUM_MAX_Z,
  MUSEUM_MIN_X,
  MUSEUM_MIN_Z,
  ROOM1_HALF,
} from '../../data/roomConfig';

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
  boyChatBubble?: string | null;
  girlChatBubble?: string | null;
  isDoorOpen?: boolean;
  cinematicDirection?: 'to-museum' | 'to-room1' | null;
  onNearDoorChange?: (near: boolean, direction: 'to-museum' | 'to-room1') => void;
  onDoorTransitionComplete?: () => void;
}

// Obstacle definitions for cozy room furniture + 5 museum glass display cases
const OBSTACLES = [
  { x: -1.4, z: -1.2, radius: 0.85, name: 'coffee-table' },
  { x: -3.8, z: -3.8, radius: 0.65, name: 'potted-plant' },
  { x: 3.8, z: -3.8, radius: 0.60, name: 'floor-lamp' },
  ...giftCases.map((g) => ({
    x: g.position[0],
    z: g.position[2],
    radius: 0.72,
    name: g.id,
  })),
];

const ROOM1_BOUND = ROOM1_HALF - CHAR_MARGIN; // 4.55
const MUSEUM_BOUND_MIN_X = MUSEUM_MIN_X + CHAR_MARGIN; // 5.85
const MUSEUM_BOUND_MAX_X = MUSEUM_MAX_X - CHAR_MARGIN; // 20.95
const MUSEUM_BOUND_MIN_Z = MUSEUM_MIN_Z + CHAR_MARGIN; // -7.55
const MUSEUM_BOUND_MAX_Z = MUSEUM_MAX_Z - CHAR_MARGIN; // 7.55
const CHARACTER_RADIUS = 0.32;

function clampToWorldBounds(
  x: number,
  z: number,
  canPassDoor: boolean
): [number, number] {
  const inDoorGapZ = Math.abs(z) <= DOOR_PASS_HALF_Z;

  // Room 1 side
  if (x <= ROOM1_BOUND) {
    return [
      Math.max(-ROOM1_BOUND, x),
      Math.max(-ROOM1_BOUND, Math.min(ROOM1_BOUND, z)),
    ];
  }

  // Museum side
  if (x >= MUSEUM_BOUND_MIN_X) {
    return [
      Math.min(MUSEUM_BOUND_MAX_X, x),
      Math.max(MUSEUM_BOUND_MIN_Z, Math.min(MUSEUM_BOUND_MAX_Z, z)),
    ];
  }

  // Doorway threshold corridor (4.55 < x < 5.85)
  if (canPassDoor && inDoorGapZ) {
    return [x, Math.max(-DOOR_PASS_HALF_Z, Math.min(DOOR_PASS_HALF_Z, z))];
  }

  // Door closed or outside door Z gap: push back to whichever room side is closer
  const midDoorX = (DOOR_X_START + DOOR_X_END) / 2;
  if (x < midDoorX) {
    return [ROOM1_BOUND, Math.max(-ROOM1_BOUND, Math.min(ROOM1_BOUND, z))];
  }
  return [
    MUSEUM_BOUND_MIN_X,
    Math.max(MUSEUM_BOUND_MIN_Z, Math.min(MUSEUM_BOUND_MAX_Z, z)),
  ];
}

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
  boyChatBubble = null,
  girlChatBubble = null,
  isDoorOpen = false,
  cinematicDirection = null,
  onNearDoorChange,
  onDoorTransitionComplete,
}) => {
  const { camera } = useThree();
  const nearDoorRef = useRef<{ near: boolean; dir: 'to-museum' | 'to-room1' }>({
    near: false,
    dir: 'to-museum',
  });
  const cinematicStartRef = useRef<number | null>(null);

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

    // Detect proximity to the connecting door
    if (onNearDoorChange && !cinematicDirection) {
      const doorMidX = (DOOR_X_START + DOOR_X_END) / 2;
      const distToDoor = Math.hypot(active.position.x - doorMidX, active.position.z);
      const isNear = distToDoor < 2.05;
      const dir: 'to-museum' | 'to-room1' =
        active.position.x < doorMidX ? 'to-museum' : 'to-room1';
      if (isNear !== nearDoorRef.current.near || dir !== nearDoorRef.current.dir) {
        nearDoorRef.current = { near: isNear, dir };
        onNearDoorChange(isNear, dir);
      }
    }

    // Cinematic Door Walk-Through Animation
    if (cinematicDirection) {
      if (cinematicStartRef.current === null) {
        cinematicStartRef.current = performance.now();
      }
      const elapsed = (performance.now() - cinematicStartRef.current) / 1000;
      const targetX = cinematicDirection === 'to-museum' ? 7.1 : 3.5;
      const targetZ = 0;

      const dx = targetX - active.position.x;
      const dz = targetZ - active.position.z;
      const dist = Math.hypot(dx, dz);

      if (elapsed > 0.35 && dist > 0.08) {
        const walkSpeed = 2.05;
        const step = Math.min(dist, walkSpeed * delta);
        active.position.x += (dx / dist) * step;
        active.position.z += (dz / dist) * step;
        active.rotation = Math.atan2(dx, dz);
        active.isMoving = true;
        active.isSprinting = false;
      } else {
        active.rotation = cinematicDirection === 'to-museum' ? Math.PI / 2 : -Math.PI / 2;
        active.isMoving = false;
        active.isSprinting = false;
      }

      if (elapsed >= 2.75) {
        cinematicStartRef.current = null;
        onDoorTransitionComplete?.();
      }

      if (onSendLocalState) {
        onSendLocalState({
          character: activeCharacter,
          x: active.position.x,
          z: active.position.z,
          rotation: active.rotation,
          isMoving: active.isMoving,
          isSprinting: false,
        });
      }
      activePos.current.copy(active.position);
      if (onTargetPositionChange) {
        onTargetPositionChange(activePos.current);
      }
      return;
    }

    cinematicStartRef.current = null;

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

      // 3. Collision with Room 1, Doorway, and Museum Room boundaries
      [nextX, nextZ] = clampToWorldBounds(nextX, nextZ, isDoorOpen);

      // 4. Collision with Furniture & Display Case obstacles (circle push-out)
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

      [nextX, nextZ] = clampToWorldBounds(nextX, nextZ, isDoorOpen);

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
        chatBubble={boyChatBubble}
      />

      {/* Girl Character */}
      <GirlCharacter
        transformRef={girlTransform}
        isActive={activeCharacter === 'girl'}
        emote={girlEmote}
        chatBubble={girlChatBubble}
      />
    </group>
  );
};

export default CharacterManager;
