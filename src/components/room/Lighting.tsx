import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <group name="room-lighting">
      {/* Soft ambient light for natural fill */}
      <ambientLight color="#fff8f0" intensity={0.4} />

      {/* Hemisphere light for warm sky & soft ground bounce */}
      <hemisphereLight
        color="#fffbf5"
        groundColor="#e0d6cb"
        intensity={0.65}
      />

      {/* Main directional light simulating soft sun/window light */}
      <directionalLight
        position={[7.5, 11, 6]}
        color="#fff7ea"
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={32}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />

      {/* Gentle opposite fill light to soften dark wall corners */}
      <directionalLight
        position={[-6, 8, -5]}
        color="#f3ede2"
        intensity={0.35}
      />
    </group>
  );
};

export default Lighting;
