import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
  MUSEUM_MAX_X,
  MUSEUM_MAX_Z,
  MUSEUM_MIN_Z,
  ROOM1_HALF,
} from '../../data/roomConfig';

export interface CameraControlHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

interface FollowCameraProps {
  targetPosition: THREE.Vector3 | React.MutableRefObject<THREE.Vector3>;
  enabled?: boolean;
  controlRef?: React.MutableRefObject<CameraControlHandle | null>;
  cinematicDirection?: 'to-museum' | 'to-room1' | null;
}

const DEFAULT_YAW = Math.PI * 0.25;
const DEFAULT_PITCH = 0.75;

/**
 * FollowCamera - Third-person camera following the active character.
 * Supports:
 * - Single-pointer drag rotation (mouse & touch, isolated by pointerId so multi-touch joystick works simultaneously)
 * - Mouse wheel zoom (Desktop) & two-finger pinch-to-zoom (Phone / iPad)
 * - Programmatic zoom/reset via controlRef
 * - Portrait/narrow screen FOV & distance adaptation
 * - Room wall collision clamping
 */
export const FollowCamera: React.FC<FollowCameraProps> = ({
  targetPosition,
  enabled = true,
  controlRef,
  cinematicDirection = null,
}) => {
  const { camera, gl, size } = useThree();

  const isPortrait = size.height > size.width;
  const minDist = isPortrait ? 3.5 : 3.0;
  const maxDist = isPortrait ? 8.2 : 6.8;
  const defaultDist = isPortrait ? 5.8 : 4.6;

  // Helper to extract target vector
  const getTarget = (): THREE.Vector3 => {
    return 'current' in targetPosition ? targetPosition.current : targetPosition;
  };

  // Spherical coordinate parameters for camera orbit
  const orbitState = useRef({
    distance: defaultDist,
    targetDistance: defaultDist,
    yaw: DEFAULT_YAW,
    targetYaw: DEFAULT_YAW,
    pitch: DEFAULT_PITCH,
    targetPitch: DEFAULT_PITCH,
    lastPinchDist: null as number | null,
  });

  // Track active pointers that originated on the canvas (multi-touch safe)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Clamp targetDistance when viewport changes
  useEffect(() => {
    orbitState.current.targetDistance = Math.max(
      minDist,
      Math.min(maxDist, orbitState.current.targetDistance)
    );
  }, [minDist, maxDist]);

  // Cinematic orbit behind character when opening the connecting door
  useEffect(() => {
    if (!cinematicDirection) return;
    const desiredYaw = cinematicDirection === 'to-museum' ? -Math.PI / 2 : Math.PI / 2;
    const current = orbitState.current.yaw;
    let diff = desiredYaw - current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    orbitState.current.targetYaw = current + diff;
    orbitState.current.targetPitch = 1.08;
    orbitState.current.targetDistance = isPortrait ? 4.8 : 3.9;
  }, [cinematicDirection, isPortrait]);

  // Expose zoom / reset methods for HUD / Touch buttons
  useEffect(() => {
    if (!controlRef) return;
    controlRef.current = {
      zoomIn: () => {
        orbitState.current.targetDistance = Math.max(
          minDist,
          orbitState.current.targetDistance - 0.7
        );
      },
      zoomOut: () => {
        orbitState.current.targetDistance = Math.min(
          maxDist,
          orbitState.current.targetDistance + 0.7
        );
      },
      resetView: () => {
        orbitState.current.targetYaw = DEFAULT_YAW;
        orbitState.current.targetPitch = DEFAULT_PITCH;
        orbitState.current.targetDistance = defaultDist;
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, minDist, maxDist, defaultDist]);

  // Interpolated focus target
  const initialTarget = getTarget();
  const currentLookAt = useRef(
    new THREE.Vector3(initialTarget.x, initialTarget.y + 0.85, initialTarget.z)
  );
  const desiredLookAt = useRef(new THREE.Vector3());

  // Pointer & wheel listeners on canvas for rotation + pinch zoom + mouse wheel
  useEffect(() => {
    if (!enabled) {
      activePointersRef.current.clear();
      orbitState.current.lastPinchDist = null;
      return;
    }

    const canvas = gl.domElement;
    const pointers = activePointersRef.current;

    const getPinchDistance = () => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return null;
      return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        orbitState.current.lastPinchDist = getPinchDistance();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;

      const deltaX = e.clientX - prev.x;
      const deltaY = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        // Single-finger or mouse drag -> orbit camera
        const sensitivity = e.pointerType === 'touch' ? 0.0065 : 0.0055;
        orbitState.current.targetYaw -= deltaX * sensitivity;
        orbitState.current.targetPitch += deltaY * sensitivity;

        const minPitch = 0.25;
        const maxPitch = 1.25;
        orbitState.current.targetPitch = Math.max(
          minPitch,
          Math.min(maxPitch, orbitState.current.targetPitch)
        );
      } else if (pointers.size === 2) {
        // Two-finger pinch -> zoom camera
        const currentPinch = getPinchDistance();
        if (currentPinch !== null && orbitState.current.lastPinchDist !== null) {
          const pinchDelta = currentPinch - orbitState.current.lastPinchDist;
          orbitState.current.targetDistance = Math.max(
            minDist,
            Math.min(maxDist, orbitState.current.targetDistance - pinchDelta * 0.015)
          );
        }
        orbitState.current.lastPinchDist = currentPinch;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) {
        orbitState.current.lastPinchDist = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.0025;
      orbitState.current.targetDistance = Math.max(
        minDist,
        Math.min(maxDist, orbitState.current.targetDistance + e.deltaY * zoomSensitivity)
      );
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      pointers.clear();
    };
  }, [enabled, gl, minDist, maxDist]);

  // Reusable vectors to avoid GC allocation in useFrame
  const tempPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled) return;

    // Adapt FOV smoothly for portrait phones/tablets
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / Math.max(1, size.height);
      const nextFov = aspect < 0.65 ? 58 : aspect < 1.0 ? 52 : 45;
      if (Math.abs(camera.fov - nextFov) > 0.5) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }

    const target = getTarget();

    // Smoothly damp yaw, pitch, and distance
    const dampSpeed = Math.min(1, delta * 14);
    orbitState.current.yaw += (orbitState.current.targetYaw - orbitState.current.yaw) * dampSpeed;
    orbitState.current.pitch += (orbitState.current.targetPitch - orbitState.current.pitch) * dampSpeed;
    orbitState.current.distance +=
      (orbitState.current.targetDistance - orbitState.current.distance) * dampSpeed;

    // Smoothly interpolate look-at target (glides between characters on Tab switch)
    desiredLookAt.current.set(target.x, target.y + 0.85, target.z);
    currentLookAt.current.lerp(desiredLookAt.current, Math.min(1, delta * 7));

    // Calculate ideal camera position using spherical coordinates relative to look-at
    const dist = orbitState.current.distance;
    const sinPitch = Math.sin(orbitState.current.pitch);
    const cosPitch = Math.cos(orbitState.current.pitch);
    const sinYaw = Math.sin(orbitState.current.yaw);
    const cosYaw = Math.cos(orbitState.current.yaw);

    let camX = currentLookAt.current.x + dist * sinPitch * sinYaw;
    let camY = currentLookAt.current.y + dist * cosPitch;
    let camZ = currentLookAt.current.z + dist * sinPitch * cosYaw;

    // Clamp camera within the active room's boundary (Room 1 or Museum Room 2)
    const inMuseum = target.x > ROOM1_HALF || !!cinematicDirection;
    const minCamX = -(ROOM1_HALF - 0.35);
    const maxCamX = MUSEUM_MAX_X - 0.35;
    const minCamZ = inMuseum ? MUSEUM_MIN_Z + 0.35 : -(ROOM1_HALF - 0.35);
    const maxCamZ = inMuseum ? MUSEUM_MAX_Z - 0.35 : ROOM1_HALF - 0.35;

    camX = Math.max(minCamX, Math.min(maxCamX, camX));
    camZ = Math.max(minCamZ, Math.min(maxCamZ, camZ));
    camY = Math.max(0.65, camY);

    tempPos.current.set(camX, camY, camZ);
    camera.position.lerp(tempPos.current, Math.min(1, delta * 10));
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

export default FollowCamera;
