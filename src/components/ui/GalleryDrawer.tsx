import React, { useEffect } from 'react';
import { memories } from '../../data/memories';
import type { Memory } from '../../data/memories';
import '../../styles/touch.css';

interface GalleryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectMemory: (memory: Memory) => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  open,
  onClose,
  onSelectMemory,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="gallery-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Album kỷ niệm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gallery-panel">
        <div className="gallery-header">
          <div>
            <h2 className="gallery-title">Album Kỷ Niệm ({memories.length})</h2>
            <p style={{ fontSize: '0.78rem', color: '#8b7b70', marginTop: '2px' }}>
              Chạm để xem ảnh hoặc video ngay
            </p>
          </div>
          <button
            type="button"
            className="memory-close-btn"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Đóng album"
          >
            &times;
          </button>
        </div>

        <div className="gallery-grid">
          {memories.map((mem, idx) => {
            const thumb = mem.thumbnail || (mem.type === 'image' ? mem.src : null);
            return (
              <button
                key={mem.id}
                type="button"
                className="gallery-item"
                onClick={() => {
                  onClose();
                  onSelectMemory(mem);
                }}
              >
                <div className="gallery-thumb">
                  {thumb ? (
                    <img src={thumb} alt={mem.description || `Kỷ niệm ${idx + 1}`} loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                      }}
                    >
                      {mem.type === 'video' ? '🎬' : '📷'}
                    </div>
                  )}
                  {mem.type === 'video' && <span className="gallery-video-badge">▶ Video</span>}
                </div>
                <div className="gallery-item-meta">
                  <span className="gallery-item-date">{mem.date || `#${idx + 1}`}</span>
                  <span className="gallery-item-desc">
                    {mem.title || mem.description || `Kỷ niệm #${idx + 1}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GalleryDrawer;
