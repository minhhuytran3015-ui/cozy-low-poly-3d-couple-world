import * as THREE from 'three';
import type { Memory } from '../../data/memories';

// Cache generated canvas textures so they are created once and reused
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedurally generates a warm, cozy pastel illustration texture on a 512x512 Canvas
 * for each memory placeholder.
 */
export function getMemoryPlaceholderTexture(memory: Memory): THREE.CanvasTexture {
  if (textureCache.has(memory.id)) {
    return textureCache.get(memory.id)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Color schemes based on memory themes
  const colorThemes: Record<string, { bg1: string; bg2: string; accent: string; icon: string }> = {
    'memory-01': { bg1: '#faede8', bg2: '#f6d5cb', accent: '#d97d64', icon: '☀️' }, // First met
    'memory-02': { bg1: '#fdeed9', bg2: '#f5c6a5', accent: '#cf7548', icon: '🌅' }, // Sunset harbor
    'memory-03': { bg1: '#e8edf5', bg2: '#d0dbee', accent: '#6384b8', icon: '☕' }, // Cafe story
    'memory-04': { bg1: '#2d334a', bg2: '#1e2233', accent: '#f7d794', icon: '✨' }, // Stargazing
    'memory-05': { bg1: '#fcebf0', bg2: '#f8d0dc', accent: '#d66d8f', icon: '🌸' }, // Blossom picnic
    'memory-06': { bg1: '#fff3e6', bg2: '#feddc0', accent: '#e28743', icon: '🍰' }, // Baking
    'memory-07': { bg1: '#e6f4f1', bg2: '#cceae3', accent: '#489f87', icon: '🚗' }, // Road trip
    'memory-08': { bg1: '#e4f1f9', bg2: '#c2e2f4', accent: '#3b8fc2', icon: '🌊' }, // Seaside
    'memory-09': { bg1: '#f9f1ea', bg2: '#eedcd0', accent: '#b07d62', icon: '💌' }, // Sincere gift
    'memory-10': { bg1: '#fdf3e7', bg2: '#f7d7b5', accent: '#c46823', icon: '🍂' }, // Autumn walk
    'memory-11': { bg1: '#faebe6', bg2: '#f4cebe', accent: '#c85a32', icon: '🍲' }, // Winter hotpot
    'memory-12': { bg1: '#36304a', bg2: '#231e33', accent: '#ffda79', icon: '🕯️' }, // Candlelit wishes
    'memory-13': { bg1: '#fdf0f0', bg2: '#fad0d0', accent: '#d15353', icon: '🎂' }, // Birthday cake
    'memory-14': { bg1: '#f7efe9', bg2: '#edd5c5', accent: '#a26b4d', icon: '🎶' }, // Home dance
    'memory-15': { bg1: '#fdf6ed', bg2: '#fae3c6', accent: '#d88d3c', icon: '💖' }, // To forever
  };

  const theme = colorThemes[memory.id] || {
    bg1: '#f7f2eb',
    bg2: '#eadaa',
    accent: '#8c7662',
    icon: '📷',
  };

  // 1. Warm pastel gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, theme.bg1);
  grad.addColorStop(1, theme.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Decorative delicate circle / badge
  ctx.beginPath();
  ctx.arc(256, 210, 105, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fill();

  // 3. Cute emoji / icon in center
  ctx.font = '84px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.icon, 256, 215);

  // 4. Memory Title
  ctx.font = 'bold 28px "Outfit", "Quicksand", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText(memory.title, 256, 360, 440);

  // 5. Date badge at bottom
  if (memory.date) {
    ctx.font = '500 20px "Quicksand", sans-serif';
    ctx.fillStyle = 'rgba(60, 50, 40, 0.55)';
    ctx.fillText(memory.date, 256, 405);
  }

  // 6. Cute Polaroid-like inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 496, 496);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(memory.id, texture);

  return texture;
}
