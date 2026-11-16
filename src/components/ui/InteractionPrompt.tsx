import React from 'react';
import type { Memory } from '../../data/memories';

interface InteractionPromptProps {
  memory: Memory | null;
  onOpen: (memory: Memory) => void;
  visible?: boolean;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({
  memory,
  onOpen,
  visible = true,
}) => {
  if (!visible || !memory) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(memory)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpen(memory);
        }
      }}
      aria-label={`Open memory: ${memory.title}`}
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 22px',
        borderRadius: '999px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid #df9e82',
        boxShadow: '0 8px 24px rgba(223, 158, 130, 0.32)',
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: "'Quicksand', 'Outfit', sans-serif",
        animation: 'promptPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <kbd
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          backgroundColor: '#df9e82',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 2px 4px rgba(223, 158, 130, 0.4)',
        }}
      >
        E
      </kbd>
      <span
        style={{
          fontSize: '0.92rem',
          fontWeight: 600,
          color: '#3e342e',
        }}
      >
        Xem kỷ niệm: <strong style={{ color: '#c4684d' }}>{memory.title}</strong>
      </span>
    </div>
  );
};

export default InteractionPrompt;
