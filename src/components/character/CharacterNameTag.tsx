import React from 'react';
import { Html } from '@react-three/drei';
import { characterConfig } from '../../data/characterConfig';
import type { CharacterType } from './types';

interface CharacterNameTagProps {
  type: CharacterType;
  isActive: boolean;
  offsetY?: number;
}

export const CharacterNameTag: React.FC<CharacterNameTagProps> = ({
  type,
  isActive,
  offsetY = 1.78,
}) => {
  const config = characterConfig[type];

  return (
    <Html
      position={[0, offsetY, 0]}
      center
      distanceFactor={7}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: isActive ? '3px 10px' : '2px 8px',
          borderRadius: '999px',
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: isActive
            ? `1.5px solid ${config.themeColor}`
            : '1px solid rgba(220, 210, 200, 0.6)',
          boxShadow: isActive
            ? '0 4px 14px rgba(180, 150, 130, 0.22)'
            : '0 2px 6px rgba(180, 150, 130, 0.08)',
          fontSize: isActive ? '12px' : '11px',
          fontWeight: 700,
          fontFamily: "'Quicksand', 'Outfit', sans-serif",
          color: isActive ? config.themeColor : '#7a6f66',
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <span style={{ fontSize: '12px' }}>{config.avatarIcon}</span>
        <span>{config.displayName}</span>
        {isActive && (
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: config.themeColor,
              display: 'inline-block',
            }}
          />
        )}
      </div>
    </Html>
  );
};

export default CharacterNameTag;
