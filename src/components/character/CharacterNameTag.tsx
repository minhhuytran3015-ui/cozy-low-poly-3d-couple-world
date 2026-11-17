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
  offsetY = 1.95,
}) => {
  const config = characterConfig[type];

  return (
    <Html
      position={[0, offsetY, 0]}
      center
      distanceFactor={7.5}
      occlude={false}
      sprite
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'tagFloat 2.8s ease-in-out infinite',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: isActive ? '4px 12px 4px 6px' : '3px 10px 3px 5px',
            borderRadius: '999px',
            backgroundColor: isActive
              ? 'rgba(255, 255, 255, 0.98)'
              : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isActive
              ? `2px solid ${config.themeColor}`
              : `1.5px solid ${config.themeColor}66`,
            boxShadow: isActive
              ? `0 6px 18px rgba(0, 0, 0, 0.12), 0 0 14px ${config.themeColor}35`
              : `0 3px 10px rgba(0, 0, 0, 0.08), 0 0 8px ${config.themeColor}20`,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isActive ? 'scale(1.06)' : 'scale(0.95)',
          }}
        >
          {/* Circular avatar badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isActive ? '24px' : '22px',
              height: isActive ? '24px' : '22px',
              borderRadius: '50%',
              backgroundColor: config.accentBg,
              fontSize: isActive ? '13px' : '12px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
              transition: 'all 0.25s ease',
            }}
          >
            {config.avatarIcon}
          </span>

          {/* Name Text */}
          <span
            style={{
              fontSize: isActive ? '13px' : '12px',
              fontWeight: 700,
              fontFamily: "'Quicksand', 'Outfit', sans-serif",
              color: isActive ? config.themeColor : config.themeColor,
              letterSpacing: '0.2px',
              opacity: isActive ? 1 : 0.85,
            }}
          >
            {config.displayName}
          </span>

          {/* Active status pulse indicator */}
          {isActive && (
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '8px',
                height: '8px',
                marginLeft: '2px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: config.themeColor,
                  opacity: 0.75,
                  animation: 'tagPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: config.themeColor,
                }}
              />
            </span>
          )}

          {/* Little downward speech pointer */}
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${isActive ? config.themeColor : config.themeColor + '66'}`,
              transition: 'border-color 0.3s ease',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes tagFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes tagPing {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </Html>
  );
};

export default CharacterNameTag;
