import React from 'react';
import * as THREE from 'three';

export const Furniture: React.FC = () => {
  return (
    <group name="room-furniture">
      {/* =========================================
          1. COZY MINIMALIST RUG
          Placed slightly off-center
          ========================================= */}
      <group position={[-1.4, 0.015, -1.2]}>
        {/* Main soft rug */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 2.0]} />
          <meshStandardMaterial
            color="#eee4d5"
            roughness={0.9}
            metalness={0.0}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Subtle decorative inner border */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.002]}>
          <planeGeometry args={[2.5, 1.7]} />
          <meshStandardMaterial
            color="#f7f2e8"
            roughness={0.95}
            metalness={0.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* =========================================
          2. LOW-POLY COFFEE TABLE
          Resting on the rug
          ========================================= */}
      <group position={[-1.4, 0, -1.2]}>
        {/* Table top */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
          <meshStandardMaterial
            color="#cfa87f"
            roughness={0.7}
            metalness={0.03}
          />
        </mesh>

        {/* 4 Angled wooden table legs */}
        {[
          { x: 0.3, z: 0.3, rotZ: -0.1, rotX: 0.1 },
          { x: -0.3, z: 0.3, rotZ: 0.1, rotX: 0.1 },
          { x: 0.3, z: -0.3, rotZ: -0.1, rotX: -0.1 },
          { x: -0.3, z: -0.3, rotZ: 0.1, rotX: -0.1 },
        ].map((leg, index) => (
          <mesh
            key={index}
            position={[leg.x, 0.22, leg.z]}
            rotation={[leg.rotX, 0, leg.rotZ]}
            castShadow
          >
            <cylinderGeometry args={[0.025, 0.02, 0.44, 8]} />
            <meshStandardMaterial color="#ba936a" roughness={0.75} />
          </mesh>
        ))}

        {/* Cute teacup on table */}
        <group position={[0.1, 0.465, 0.05]}>
          <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.06, 0.045, 0.08, 12]} />
            <meshStandardMaterial color="#fefefe" roughness={0.4} />
          </mesh>
          {/* Tea liquid */}
          <mesh position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.005, 12]} />
            <meshStandardMaterial color="#8b573c" roughness={0.3} />
          </mesh>
          {/* Saucer */}
          <mesh receiveShadow position={[0, 0.005, 0]}>
            <cylinderGeometry args={[0.09, 0.07, 0.01, 12]} />
            <meshStandardMaterial color="#f5f0eb" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* =========================================
          3. POTTED PLANT
          Corner position (-3.8, 0, -3.8)
          ========================================= */}
      <group position={[-3.8, 0, -3.8]}>
        {/* Ceramic pot */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.24, 0.64, 16]} />
          <meshStandardMaterial
            color="#ebd8c8"
            roughness={0.75}
            metalness={0.02}
          />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
          <meshStandardMaterial color="#4d3b2e" roughness={0.9} />
        </mesh>

        {/* Plant leaves in low-poly style */}
        {[
          { rotY: 0, rotX: 0.35, rotZ: 0.2, scale: 1.0, color: '#74986e' },
          { rotY: Math.PI * 0.4, rotX: 0.4, rotZ: -0.15, scale: 0.85, color: '#85a87f' },
          { rotY: Math.PI * 0.8, rotX: 0.3, rotZ: 0.3, scale: 0.95, color: '#688c62' },
          { rotY: Math.PI * 1.3, rotX: 0.42, rotZ: -0.25, scale: 1.05, color: '#7c9f76' },
          { rotY: Math.PI * 1.7, rotX: 0.25, rotZ: 0.1, scale: 0.9, color: '#8eb388' },
        ].map((leaf, index) => (
          <group
            key={index}
            position={[0, 0.63, 0]}
            rotation={[leaf.rotX, leaf.rotY, leaf.rotZ]}
          >
            {/* Stem */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#557550" roughness={0.8} />
            </mesh>
            {/* Leaf blade */}
            <mesh
              position={[0, 0.45, 0.05]}
              rotation={[0.2, 0, 0]}
              scale={[leaf.scale, leaf.scale, leaf.scale]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.38, 0.015]} />
              <meshStandardMaterial
                color={leaf.color}
                roughness={0.65}
                metalness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================
          4. FLOOR LAMP
          Corner position (3.8, 0, -3.8)
          ========================================= */}
      <group position={[3.8, 0, -3.8]}>
        {/* Lamp base */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.04, 16]} />
          <meshStandardMaterial color="#c5aa8c" roughness={0.6} />
        </mesh>
        {/* Slender pole */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 2.16, 8]} />
          <meshStandardMaterial color="#8c7866" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Lampshade */}
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.38, 0.45, 16, 1, true]} />
          <meshStandardMaterial
            color="#fff8ec"
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Warm cozy point light emitted by lamp */}
        <pointLight
          position={[0, 2.1, 0]}
          color="#ffe2b3"
          intensity={1.8}
          distance={6.0}
          decay={2}
          castShadow
          shadow-bias={-0.001}
        />
      </group>
    </group>
  );
};

export default Furniture;
