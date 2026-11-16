import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

interface RoomCameraProps {
  initialPosition?: [number, number, number];
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  isEntered?: boolean;
}

/**
 * RoomCamera - Inspection camera for Phase 1.
 * Provides a comfortable, elevated isometric-like perspective looking down into
 * the open-top room, with polar angle constraints preventing view occlusions
 * or dipping beneath the floor.
 * 
 * Separated into its own component so Phase 2 can replace it with
 * ThirdPersonFollowCamera without changing Room code.
 */
export const RoomCamera: React.FC<RoomCameraProps> = ({
  initialPosition = [9.0, 11.0, 9.0],
  target = [0, 0.8, 0],
  minDistance = 3.5,
  maxDistance = 18.0,
  isEntered = false,
}) => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={initialPosition}
        fov={45}
        near={0.1}
        far={100}
      />
      <OrbitControls
        makeDefault
        target={target}
        enableDamping={true}
        dampingFactor={0.06}
        minDistance={minDistance}
        maxDistance={maxDistance}
        // Prevents looking straight down from top (gimbal lock prevention)
        minPolarAngle={Math.PI / 8} // ~22.5 degrees
        // Prevents dipping below the wall edge where outer walls would block interior view
        maxPolarAngle={Math.PI / 3.0} // ~60 degrees
        maxAzimuthAngle={Infinity}
        minAzimuthAngle={-Infinity}
        enablePan={false} // Keeps focus locked onto the room center
        autoRotate={!isEntered} // Gentle ambient rotation before entering
        autoRotateSpeed={0.5}
        enabled={true}
      />
    </>
  );
};

export default RoomCamera;
