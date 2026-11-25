import React from 'react';
import type { Memory } from '../../data/memories';
import type { InputMode } from '../../hooks/useDeviceMode';

interface InteractionPromptProps {
  memory: Memory | null;
  onOpen: (memory: Memory) => void;
  inputMode?: InputMode;
  visible?: boolean;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({
  memory,
  onOpen,
  inputMode = 'keyboard',
  visible = true,
}) => {
  if (!visible || !memory) return null;

  const isTouch = inputMode === 'touch';
  const labelText = memory.title
    ? memory.title
    : memory.date
      ? `Kỷ niệm ${memory.date}`
      : 'Khoảnh khắc đẹp';

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
      aria-label={`Xem kỷ niệm: ${labelText}`}
      style={{
        position: 'absolute',
        bottom: isTouch ? 'max(146px, calc(126px + env(safe-area-inset-bottom, 20px)))' : '44px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: isTouch ? '11px 20px' : '10px 22px',
        borderRadius: '999px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid #df9e82',
        boxShadow: '0 8px 24px rgba(223, 158, 130, 0.34)',
        cursor: 'pointer',
        userSelect: 'none',
        maxWidth: 'calc(100vw - 32px)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: "'Quicksand', 'Outfit', sans-serif",
        touchAction: 'manipulation',
      }}
    >
      <kbd
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '26px',
          height: '26px',
          padding: isTouch ? '0 6px' : '0',
          borderRadius: '7px',
          backgroundColor: '#df9e82',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 2px 4px rgba(223, 158, 130, 0.4)',
          flexShrink: 0,
        }}
      >
        {isTouch ? '👆' : 'E'}
      </kbd>
      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#3e342e',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {isTouch ? 'Chạm xem: ' : 'Xem kỷ niệm: '}
        <strong style={{ color: '#c4684d' }}>{labelText}</strong>
      </span>
    </div>
  );
};

export default InteractionPrompt;
