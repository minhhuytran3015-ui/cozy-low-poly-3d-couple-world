import React, { useState, useEffect } from 'react';
import type { CharacterType } from '../character/types';
import type { MultiplayerStatus, TransportKind } from '../../hooks/useMultiplayer';
import { characterConfig } from '../../data/characterConfig';
import '../../styles/viewer.css';

interface MultiplayerModalProps {
  open: boolean;
  onClose: () => void;
  transport: TransportKind;
  roomCode: string | null;
  inviteUrl: string | null;
  status: MultiplayerStatus;
  errorMsg: string | null;
  activeCharacter: CharacterType;
  onCreateRoom: (customCode?: string) => string;
  onRetry: () => void;
  onLeaveRoom: () => void;
  onSwapRoles: () => void;
}

const ROOM_INPUT_REGEX = /^[a-zA-Z0-9_-]{4,24}$/;

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  open,
  onClose,
  transport,
  roomCode,
  inviteUrl,
  status,
  errorMsg,
  activeCharacter,
  onCreateRoom,
  onRetry,
  onLeaveRoom,
  onSwapRoles,
}) => {
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputErr, setInputErr] = useState<string | null>(null);

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

  const myInfo = characterConfig[activeCharacter];
  const partnerInfo = characterConfig[activeCharacter === 'boy' ? 'girl' : 'boy'];

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleShareLink = async () => {
    if (!inviteUrl || typeof navigator.share !== 'function') {
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: 'Hai Đứa Tụi Mình - Vào phòng chơi chung nè!',
        text: 'Bấm vào link này để cùng dạo quanh phòng kỷ niệm với mình nhé!',
        url: inviteUrl,
      });
    } catch {
      // User dismissed native share sheet
    }
  };

  const handleJoinCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinInput.trim();
    if (!ROOM_INPUT_REGEX.test(trimmed)) {
      setInputErr('Mã phòng gồm 4–24 ký tự chữ, số, "-" hoặc "_".');
      return;
    }
    setInputErr(null);
    onCreateRoom(trimmed);
    setJoinInput('');
  };

  const statusMeta = (() => {
    switch (status) {
      case 'connected':
        return { dot: '#2ecc71', bg: '#eafaf1', text: 'Đã kết nối! Cả 2 đang ở cùng nhau' };
      case 'waiting':
        return { dot: '#f39c12', bg: '#fef7e6', text: 'Đang chờ người ấy mở link mời...' };
      case 'connecting':
        return { dot: '#f39c12', bg: '#fef7e6', text: 'Đang kết nối vào phòng...' };
      case 'error':
        return { dot: '#e74c3c', bg: '#fdecea', text: errorMsg || 'Lỗi kết nối phòng' };
      default:
        return { dot: '#9b8e84', bg: '#f5efe9', text: 'Chưa kết nối phòng' };
    }
  })();

  return (
    <div
      className="memory-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Chơi chung thời gian thực"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="memory-card" style={{ maxWidth: '470px', padding: '24px' }}>
        <button
          type="button"
          className="memory-close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          &times;
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="memory-tag">💞 Real-time Couple Mode</span>
              <span
                className="memory-tag"
                style={{
                  background: transport === 'supabase' ? '#eafaf1' : '#f4ece4',
                  color: transport === 'supabase' ? '#2c7a4b' : '#7d6b5e',
                }}
              >
                {transport === 'supabase' ? '☁️ Relay xuyên 4G/Wi-Fi' : '📡 P2P (Cùng mạng / STUN)'}
              </span>
            </div>
            <h2 className="memory-title" style={{ fontSize: '1.38rem' }}>
              Chơi Chung Thời Gian Thực
            </h2>
            <p className="memory-desc" style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              Gửi link phòng cho người ấy — khi bên kia di chuyển, bạn sẽ thấy nhân vật di chuyển ngay trên màn hình!
            </p>
          </div>

          {!roomCode ? (
            <>
              <button
                type="button"
                onClick={() => onCreateRoom()}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #d89b82 0%, #c87b5e 100%)',
                  color: '#ffffff',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(200, 123, 94, 0.28)',
                }}
              >
                ✨ Tạo link phòng chơi chung ngay
              </button>

              <form
                onSubmit={handleJoinCustom}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(210, 195, 180, 0.4)',
                }}
              >
                <label
                  htmlFor="custom-room-input"
                  style={{ fontSize: '0.8rem', fontWeight: 700, color: '#786a60' }}
                >
                  Hoặc nhập mã phòng có sẵn:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="custom-room-input"
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    placeholder="Ví dụ: haidua"
                    maxLength={24}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1.5px solid #e3d5c8',
                      background: '#ffffff',
                      fontSize: '0.9rem',
                      color: '#38302b',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: '#f3e8de',
                      color: '#5c4c42',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                    }}
                  >
                    Vào
                  </button>
                </div>
                {inputErr && (
                  <span style={{ fontSize: '0.78rem', color: '#c0392b', fontWeight: 600 }}>
                    {inputErr}
                  </span>
                )}
              </form>
            </>
          ) : (
            <>
              {/* Live Connection Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '14px',
                  backgroundColor: statusMeta.bg,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#3e342e',
                  lineHeight: 1.45,
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    marginTop: '5px',
                    borderRadius: '50%',
                    backgroundColor: statusMeta.dot,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div>{statusMeta.text}</div>
                  {status === 'error' && (
                    <button
                      type="button"
                      onClick={onRetry}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #e2b4b0',
                        color: '#a93226',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      🔄 Thử kết nối lại
                    </button>
                  )}
                </div>
              </div>

              {/* Character Assignment */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #eadfd5',
                }}
              >
                <div style={{ fontSize: '0.84rem', color: '#5b4f47' }}>
                  <div>
                    Bạn điều khiển:{' '}
                    <strong style={{ color: myInfo.themeColor }}>
                      {myInfo.avatarIcon} {myInfo.displayName}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#8e8076', marginTop: '2px' }}>
                    Người kia: {partnerInfo.avatarIcon} {partnerInfo.displayName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwapRoles}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: '#f6eee6',
                    color: '#5a4a40',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  🔄 Đổi vai
                </button>
              </div>

              {/* Invite Link Box */}
              {inviteUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7a6c62' }}>
                    Mã phòng: <strong>{roomCode}</strong>
                  </span>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: '#f7f1eb',
                      border: '1px solid #e6d8cc',
                      fontSize: '0.78rem',
                      color: '#584c44',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                    }}
                  >
                    {inviteUrl}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{
                        flex: 1,
                        padding: '11px 14px',
                        borderRadius: '14px',
                        background: copied
                          ? '#43695f'
                          : 'linear-gradient(135deg, #d89b82 0%, #c87b5e 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                      }}
                    >
                      {copied ? '✓ Đã sao chép link!' : '📋 Sao chép link mời'}
                    </button>
                    {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                      <button
                        type="button"
                        onClick={handleShareLink}
                        style={{
                          padding: '11px 16px',
                          borderRadius: '14px',
                          background: '#f3e8de',
                          color: '#5c4c42',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                        }}
                      >
                        📤 Gửi
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onLeaveRoom();
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid #e5d5c8',
                  color: '#8a7a70',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                Rời phòng (Chơi 1 mình)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerModal;
