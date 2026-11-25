import React, { useEffect, useRef } from 'react';
import type { Memory } from '../../data/memories';
import type { InputMode } from '../../hooks/useDeviceMode';
import '../../styles/viewer.css';

interface MemoryViewerProps {
  memory: Memory | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  inputMode?: InputMode;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({
  memory,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
  inputMode = 'keyboard',
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!memory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [memory, onClose, onPrev, onNext]);

  if (!memory) return null;

  const isVideo = memory.type === 'video';
  const displayTitle =
    memory.title ||
    (currentIndex !== undefined ? `Kỷ niệm #${currentIndex + 1}` : 'Khoảnh khắc của tụi mình');

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Horizontal swipe threshold
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx > 0 && onPrev) onPrev();
      if (dx < 0 && onNext) onNext();
    }
  };

  return (
    <div
      className="memory-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Memory Viewer: ${displayTitle}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="memory-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close Button */}
        <button
          type="button"
          className="memory-close-btn"
          onClick={onClose}
          aria-label="Đóng trình xem kỷ niệm"
        >
          &times;
        </button>

        {/* Media Section */}
        <div className="memory-media-container">
          {onPrev && (
            <button
              type="button"
              className="memory-nav-btn prev"
              onClick={onPrev}
              aria-label="Kỷ niệm trước"
            >
              ‹
            </button>
          )}
          {onNext && (
            <button
              type="button"
              className="memory-nav-btn next"
              onClick={onNext}
              aria-label="Kỷ niệm tiếp theo"
            >
              ›
            </button>
          )}

          {memory.src ? (
            isVideo ? (
              <video
                key={memory.id}
                src={memory.src}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '440px', backgroundColor: '#000000' }}
              >
                Trình duyệt không hỗ trợ phát video.
              </video>
            ) : (
              <img
                src={memory.src}
                alt={displayTitle}
                className="memory-media-img"
              />
            )
          ) : (
            <div className="memory-placeholder-art">
              <span className="placeholder-icon" aria-hidden="true">
                {isVideo ? '🎬' : '📷'}
              </span>
              <span className="placeholder-badge">
                {isVideo ? 'Video Memory Clip' : 'Captured Moment'}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="memory-info-container">
          <div className="memory-meta-row">
            <span className="memory-date">{memory.date || 'Timeless'}</span>
            <span className="memory-tag">
              {isVideo ? '🎥 Video' : '📸 Ảnh'} &bull;{' '}
              {currentIndex !== undefined && totalCount ? `${currentIndex + 1}/${totalCount}` : memory.wall.toUpperCase()}
            </span>
          </div>

          <h2 className="memory-title">{displayTitle}</h2>

          {memory.description && (
            <p className="memory-desc">{memory.description}</p>
          )}

          <div className="memory-hint-row">
            {inputMode === 'touch' ? (
              <span>Vuốt trái/phải để chuyển &bull; Chạm ra ngoài để đóng</span>
            ) : (
              <span>
                Nhấn <kbd style={{ padding: '1px 5px', border: '1px solid #ccc', borderRadius: '4px' }}>←</kbd>{' '}
                <kbd style={{ padding: '1px 5px', border: '1px solid #ccc', borderRadius: '4px' }}>→</kbd> chuyển ảnh &bull;{' '}
                <kbd style={{ padding: '1px 5px', border: '1px solid #ccc', borderRadius: '4px' }}>Esc</kbd> để đóng
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;
