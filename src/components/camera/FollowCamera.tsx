import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FollowCameraProps {
  targetPosition: THREE.Vector3 | React.MutableRefObject<THREE.Vector3>;
  enabled?: boolean;
}

/**
 * FollowCamera - Third-person camera following the active character.
 * Supports smooth mouse rotation (yaw & pitch), zoom, collision clamping within room,
 * and graceful interpolation when switching targets via Tab.
 */
export const FollowCamera: React.FC<FollowCameraProps> = ({
  targetPosition,
  enabled = true,
}) => {
  const { camera, gl } = useThree();

  // Helper to extract target vector
  const getTarget = (): THREE.Vector3 => {
    return 'current' in targetPosition ? targetPosition.current : targetPosition;
  };

  // Spherical coordinate parameters for camera orbit
  const orbitState = useRef({
    distance: 4.6,
    targetDistance: 4.6,
    yaw: Math.PI * 0.25, // horizontal angle
    targetYaw: Math.PI * 0.25,
    pitch: 0.75, // vertical angle (~43 degrees)
    targetPitch: 0.75,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Interpolated focus target
  const initialTarget = getTarget();
  const currentLookAt = useRef(
    new THREE.Vector3(initialTarget.x, initialTarget.y + 0.85, initialTarget.z)
  );
  const desiredLookAt = useRef(new THREE.Vector3());

  // Mouse event listeners on canvas for camera rotation & zoom
  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      // Rotate with left mouse button (button === 0) or touch
      if (e.button === 0) {
        orbitState.current.isDragging = true;
        orbitState.current.lastMouseX = e.clientX;
        orbitState.current.lastMouseY = e.clientY;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!orbitState.current.isDragging) return;

      const deltaX = e.clientX - orbitState.current.lastMouseX;
      const deltaY = e.clientY - orbitState.current.lastMouseY;
      orbitState.current.lastMouseX = e.clientX;
      orbitState.current.lastMouseY = e.clientY;

      const sensitivity = 0.0055;
      orbitState.current.targetYaw -= deltaX * sensitivity;
      orbitState.current.targetPitch += deltaY * sensitivity;

      // Limit pitch to prevent upside down or looking up from floor
      const minPitch = 0.25; // ~14 deg from zenith
      const maxPitch = 1.25; // ~71 deg from zenith (stays above ground)
      orbitState.current.targetPitch = Math.max(minPitch, Math.min(maxPitch, orbitState.current.targetPitch));
    };

    const handlePointerUp = () => {
      orbitState.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.0025;
      orbitState.current.targetDistance += e.deltaY * zoomSensitivity;
      orbitState.current.targetDistance = Math.max(3.0, Math.min(6.8, orbitState.current.targetDistance));
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, gl]);

  // Reusable vectors to avoid GC allocation in useFrame
  const tempPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled) return;

    const target = getTarget();

    // Smoothly damp yaw, pitch, and distance
    const dampSpeed = Math.min(1, delta * 14);
    orbitState.current.yaw += (orbitState.current.targetYaw - orbitState.current.yaw) * dampSpeed;
    orbitState.current.pitch += (orbitState.current.targetPitch - orbitState.current.pitch) * dampSpeed;
    orbitState.current.distance += (orbitState.current.targetDistance - orbitState.current.distance) * dampSpeed;

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

    // Clamp camera within room boundary (room is 10x10, walls at +/- 5.0)
    // Keep camera at least 0.35 inside walls to prevent wall clipping
    const roomMargin = 4.65;
    camX = Math.max(-roomMargin, Math.min(roomMargin, camX));
    camZ = Math.max(-roomMargin, Math.min(roomMargin, camZ));
    camY = Math.max(0.65, camY); // Never dip below floor

    tempPos.current.set(camX, camY, camZ);
    camera.position.lerp(tempPos.current, Math.min(1, delta * 10));
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

export default FollowCamera;
