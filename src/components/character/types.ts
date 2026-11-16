import * as THREE from 'three';

export type CharacterType = 'boy' | 'girl';

export interface CharacterTransform {
  position: THREE.Vector3;
  rotation: number; // yaw in radians
  isMoving: boolean;
  isSprinting: boolean;
  speed: number;
}

export interface CharacterAppearance {
  skinColor: string;
  hairColor: string;
  topColor: string;
  bottomColor: string;
  shoeColor: string;
  accessoryColor?: string;
  eyeColor?: string;
  blushColor?: string;
}
