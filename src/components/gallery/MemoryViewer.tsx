import React, { useEffect } from 'react';
import type { Memory } from '../../data/memories';
import '../../styles/viewer.css';

interface MemoryViewerProps {
  memory: Memory | null;
  onClose: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ memory, onClose }) => {
  useEffect(() => {
    if (!memory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [memory, onClose]);

  if (!memory) return null;

  const isVideo = memory.type === 'video';

  return (
    <div
      className="memory-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Memory Viewer: ${memory.title}`}
      onClick={(e) => {
        // Close if clicking outside the card
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="memory-card">
        {/* Close Button */}
        <button
          type="button"
          className="memory-close-btn"
          onClick={onClose}
          aria-label="Close memory viewer"
        >
          &times;
        </button>

        {/* Media Section */}
        <div className="memory-media-container">
          {memory.src ? (
            isVideo ? (
              <video
                src={memory.src}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '440px', backgroundColor: '#000000' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={memory.src}
                alt={memory.title}
                className="memory-media-img"
              />
            )
          ) : (
            // Cozy Procedural Art Placeholder when no external file is linked yet
            <div className="memory-placeholder-art">
              <span className="placeholder-icon" aria-hidden="true">
                {isVideo ? '🎬' : '📷'}
              </span>
              <span className="placeholder-badge">
                {isVideo ? 'Video Memory Clip' : 'Captured Moment'}
              </span>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#8f7e72',
                  textAlign: 'center',
                  maxWidth: '380px',
                }}
              >
                A cherished memory in our little haven. Replace <code>src</code> in{' '}
                <code>memories.ts</code> with your personal photo or video.
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="memory-info-container">
          <div className="memory-meta-row">
            <span className="memory-date">{memory.date || 'Timeless'}</span>
            <span className="memory-tag">
              {isVideo ? '🎥 Video Story' : '📸 Photo Memory'} &bull; {memory.wall.toUpperCase()} WALL
            </span>
          </div>

          <h2 className="memory-title">{memory.title}</h2>

          {memory.description && (
            <p className="memory-desc">{memory.description}</p>
          )}

          <div className="memory-hint-row">
            <span>Press <kbd style={{ padding: '1px 5px', border: '1px solid #ccc', borderRadius: '4px' }}>Esc</kbd> or click outside to return to the room</span>
            <span>Room Gallery &bull; 15 Memories</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;
