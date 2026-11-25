import React from 'react';
import '../../styles/hud.css';
import type { CharacterType } from '../character/types';
import { characterConfig } from '../../data/characterConfig';
import type { InputMode } from '../../hooks/useDeviceMode';
import type { CameraControlHandle } from '../camera/FollowCamera';

interface ControlHUDProps {
  activeCharacter: CharacterType;
  onSwitchCharacter: (type: CharacterType) => void;
  inputMode: InputMode;
  onToggleInputMode: () => void;
  onOpenGallery: () => void;
  memoryCount: number;
  cameraControlRef?: React.MutableRefObject<CameraControlHandle | null>;
  visible?: boolean;
}

export const ControlHUD: React.FC<ControlHUDProps> = ({
  activeCharacter,
  onSwitchCharacter,
  inputMode,
  onToggleInputMode,
  onOpenGallery,
  memoryCount,
  cameraControlRef,
  visible = true,
}) => {
  if (!visible) return null;

  const isTouchMode = inputMode === 'touch';

  return (
    <>
      <aside className="hud-container" aria-label="Game controls and character selection">
        {/* Top Character Switcher */}
        <div className="hud-card">
          <div className="hud-avatars" role="tablist" aria-label="Select Character">
            <button
              type="button"
              role="tab"
              aria-selected={activeCharacter === 'boy'}
              className={`hud-avatar-btn ${activeCharacter === 'boy' ? 'active boy' : ''}`}
              onClick={() => onSwitchCharacter('boy')}
            >
              <span className="hud-avatar-icon" aria-hidden="true">
                {characterConfig.boy.avatarIcon}
              </span>
              <span>{characterConfig.boy.displayName}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeCharacter === 'girl'}
              className={`hud-avatar-btn ${activeCharacter === 'girl' ? 'active girl' : ''}`}
              onClick={() => onSwitchCharacter('girl')}
            >
              <span className="hud-avatar-icon" aria-hidden="true">
                {characterConfig.girl.avatarIcon}
              </span>
              <span>{characterConfig.girl.displayName}</span>
            </button>
          </div>

          {!isTouchMode && (
            <div className="hud-tab-hint">
              <kbd className="kbd-badge">Tab</kbd>
              <span>đổi</span>
            </div>
          )}
        </div>

        {/* Desktop Movement & Camera Control Hints */}
        {!isTouchMode && (
          <div className="hud-controls-card">
            <div className="hud-control-row">
              <div className="hud-keys-group">
                <kbd className="kbd-badge">W</kbd>
                <kbd className="kbd-badge">A</kbd>
                <kbd className="kbd-badge">S</kbd>
                <kbd className="kbd-badge">D</kbd>
              </div>
              <span>Di chuyển</span>
            </div>

            <div className="hud-control-row">
              <kbd className="kbd-badge">Shift</kbd>
              <span>Chạy nhanh</span>
            </div>

            <div className="hud-control-row">
              <kbd className="kbd-badge">Kéo chuột</kbd>
              <span>Xoay &bull; Cuộn để Zoom</span>
            </div>

            <div className="hud-control-row">
              <kbd className="kbd-badge">E</kbd>
              <span>Xem kỷ niệm gần nhất</span>
            </div>
          </div>
        )}
      </aside>

      {/* Top-right Quick Toolbar (Album + Input Mode Toggle + Desktop Reset Camera) */}
      <div className="hud-top-right">
        <button
          type="button"
          className="hud-pill-btn"
          onClick={onOpenGallery}
          aria-label="Mở album kỷ niệm"
        >
          <span aria-hidden="true">🖼️</span>
          <span>
            <span className="hud-album-label">Album </span>({memoryCount})
          </span>
        </button>

        {!isTouchMode && cameraControlRef && (
          <button
            type="button"
            className="hud-pill-btn hud-icon-only-mobile"
            onClick={() => cameraControlRef.current?.resetView()}
            title="Đặt lại góc nhìn camera"
            aria-label="Đặt lại góc nhìn camera"
          >
            <span aria-hidden="true">↺</span>
          </button>
        )}

        <button
          type="button"
          className="hud-pill-btn"
          onClick={onToggleInputMode}
          title={isTouchMode ? 'Chuyển sang giao diện Bàn phím (PC)' : 'Bật phím điều khiển cảm ứng'}
          aria-label="Chuyển chế độ điều khiển"
        >
          <span aria-hidden="true">{isTouchMode ? '📱' : '⌨️'}</span>
          <span className="hud-mode-label">{isTouchMode ? 'Cảm ứng' : 'Phím PC'}</span>
        </button>
      </div>
    </>
  );
};

export default ControlHUD;
