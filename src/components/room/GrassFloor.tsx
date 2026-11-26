import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  MUSEUM_CENTER_X,
  MUSEUM_CENTER_Z,
  MUSEUM_DEPTH,
  MUSEUM_MAX_X,
  MUSEUM_MAX_Z,
  MUSEUM_MIN_X,
  MUSEUM_MIN_Z,
  MUSEUM_WIDTH,
} from '../../data/roomConfig';
import { giftCases } from '../../data/giftCases';

/**
 * Deterministic PRNG so grass layout stays consistent across renders.
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STEPPING_STONES: Array<[number, number, number]> = [
  [6.1, 0.014, 0],
  [7.0, 0.014, 0],
  [7.9, 0.014, 0],
  [8.8, 0.014, -1.1],
  [9.2, 0.014, -2.2],
  [8.8, 0.014, 1.1],
  [9.2, 0.014, 2.2],
  [10.2, 0.014, 0],
  [11.3, 0.014, 0],
  [12.3, 0.014, 0],
  [14.5, 0.014, 0],
  [15.6, 0.014, 0],
  [16.6, 0.014, -1.2],
  [17.1, 0.014, -2.3],
  [16.6, 0.014, 1.2],
  [17.1, 0.014, 2.3],
];

/**
 * Earthy soil ground + lush low-poly grass kept strictly below character knee height
 * (max blade height ~0.22 units, well below knee height ~0.28).
 */
export const GrassFloor: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 4200;

  const { matrices, colors } = useMemo(() => {
    const rand = seededRandom(20261126);
    const matList: THREE.Matrix4[] = [];
    const colList: THREE.Color[] = [];
    const palette = [
      new THREE.Color('#5a8f49'),
      new THREE.Color('#6ba353'),
      new THREE.Color('#4f7e3f'),
      new THREE.Color('#7db55e'),
      new THREE.Color('#63984c'),
    ];

    const dummy = new THREE.Object3D();
    let placed = 0;
    let attempts = 0;

    while (placed < count && attempts < count * 3) {
      attempts++;
      const x = MUSEUM_MIN_X + 0.25 + rand() * (MUSEUM_WIDTH - 0.5);
      const z = MUSEUM_MIN_Z + 0.25 + rand() * (MUSEUM_DEPTH - 0.5);

      // Keep doorway threshold clear
      if (x < MUSEUM_MIN_X + 0.75 && Math.abs(z) < 1.0) continue;

      // Keep grass clear directly underneath the 5 glass display pedestals
      let nearPedestal = false;
      for (const g of giftCases) {
        if (Math.hypot(x - g.position[0], z - g.position[2]) < 0.62) {
          nearPedestal = true;
          break;
        }
      }
      if (nearPedestal) continue;

      // Keep stepping stones mostly clear (allow tiny tufts around edges)
      let onStone = false;
      for (const [sx, , sz] of STEPPING_STONES) {
        if (Math.hypot(x - sx, z - sz) < 0.34) {
          onStone = true;
          break;
        }
      }
      if (onStone) continue;

      // Height strictly below character knee (~0.13 to 0.22 units)
      const height = 0.13 + rand() * 0.09;
      const widthScale = 0.8 + rand() * 0.55;

      dummy.position.set(x, height / 2, z);
      dummy.rotation.set(
        (rand() - 0.5) * 0.28,
        rand() * Math.PI * 2,
        (rand() - 0.5) * 0.28
      );
      dummy.scale.set(widthScale, height, widthScale);
      dummy.updateMatrix();

      matList.push(dummy.matrix.clone());
      colList.push(palette[Math.floor(rand() * palette.length)]);
      placed++;
    }

    return { matrices: matList, colors: colList };
  }, []);

  useEffect(() => {
    const inst = meshRef.current;
    if (!inst) return;
    for (let i = 0; i < matrices.length; i++) {
      inst.setMatrixAt(i, matrices[i]);
      inst.setColorAt(i, colors[i]);
    }
    inst.count = matrices.length;
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  return (
    <group name="museum-grass-floor">
      {/* Rich Earthy Soil & Moss Base */}
      <mesh
        position={[MUSEUM_CENTER_X, -0.05, MUSEUM_CENTER_Z]}
        receiveShadow
      >
        <boxGeometry args={[MUSEUM_WIDTH + 0.2, 0.1, MUSEUM_DEPTH + 0.2]} />
        <meshStandardMaterial color="#584736" roughness={0.95} />
      </mesh>

      {/* Top Mossy Ground Layer */}
      <mesh
        position={[MUSEUM_CENTER_X, 0.002, MUSEUM_CENTER_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[MUSEUM_WIDTH, MUSEUM_DEPTH]} />
        <meshStandardMaterial color="#4b6f3d" roughness={0.92} />
      </mesh>

      {/* Decorative Garden Stepping Stones */}
      {STEPPING_STONES.map(([sx, sy, sz], idx) => (
        <mesh
          key={`stone-${idx}`}
          position={[sx, sy, sz]}
          rotation={[0, idx * 0.7, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[0.36, 0.4, 0.03, 7]} />
          <meshStandardMaterial color="#d8d0c5" roughness={0.85} />
        </mesh>
      ))}

      {/* Lush Low-Poly Grass Blades (below knee height) */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        receiveShadow
      >
        <coneGeometry args={[0.045, 1, 4]} />
        <meshStandardMaterial roughness={0.82} metalness={0.02} />
      </instancedMesh>

      {/* Subtle Soil Border Trim along Museum Edges */}
      <mesh position={[MUSEUM_CENTER_X, 0.02, MUSEUM_MIN_Z + 0.08]} receiveShadow>
        <boxGeometry args={[MUSEUM_WIDTH, 0.04, 0.16]} />
        <meshStandardMaterial color="#6a5642" roughness={0.9} />
      </mesh>
      <mesh position={[MUSEUM_CENTER_X, 0.02, MUSEUM_MAX_Z - 0.08]} receiveShadow>
        <boxGeometry args={[MUSEUM_WIDTH, 0.04, 0.16]} />
        <meshStandardMaterial color="#6a5642" roughness={0.9} />
      </mesh>
      <mesh position={[MUSEUM_MAX_X - 0.08, 0.02, MUSEUM_CENTER_Z]} receiveShadow>
        <boxGeometry args={[0.16, 0.04, MUSEUM_DEPTH]} />
        <meshStandardMaterial color="#6a5642" roughness={0.9} />
      </mesh>
    </group>
  );
};

export default GrassFloor;
