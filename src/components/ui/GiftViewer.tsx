import React from 'react';
import type { GiftCaseItem } from '../../data/giftCases';

interface GiftViewerProps {
  gift: GiftCaseItem | null;
  onClose: () => void;
}

export const GiftViewer: React.FC<GiftViewerProps> = ({ gift, onClose }) => {
  if (!gift) return null;

  return (
    <div
      className="mp-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Tủ kính: ${gift.title}`}
      onClick={onClose}
    >
      <div
        className="mp-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', textAlign: 'center' }}
      >
        <div className="mp-header">
          <h2 className="mp-title">🎁 Tủ kính kỷ vật</h2>
          <button
            type="button"
            className="mp-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: '8px',
            padding: '18px 16px',
            borderRadius: '16px',
            background: 'rgba(255, 248, 240, 0.85)',
            border: `1.5px solid ${gift.accentColor}44`,
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#3a2e28',
              marginBottom: '6px',
            }}
          >
            {gift.title}
          </div>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: gift.accentColor,
              marginBottom: '12px',
            }}
          >
            {gift.giver} &bull; {gift.date}
          </div>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.55,
              color: '#5a4a42',
              margin: 0,
            }}
          >
            {gift.description}
          </p>
        </div>

        <div style={{ marginTop: '14px', fontSize: '12px', color: '#8c7a70' }}>
          Bạn có thể chỉnh sửa tên và lời nhắn các món quà trong{' '}
          <code>src/data/giftCases.ts</code>.
        </div>
      </div>
    </div>
  );
};

export default GiftViewer;
