import React from 'react';
import '../../styles/hud.css';
import type { CharacterType } from '../character/types';
import { characterConfig } from '../../data/characterConfig';

interface ControlHUDProps {
  activeCharacter: CharacterType;
  onSwitchCharacter: (type: CharacterType) => void;
  visible?: boolean;
}

export const ControlHUD: React.FC<ControlHUDProps> = ({
  activeCharacter,
  onSwitchCharacter,
  visible = true,
}) => {
  if (!visible) return null;

  return (
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
            <span className="hud-avatar-icon" aria-hidden="true">{characterConfig.boy.avatarIcon}</span>
            <span>{characterConfig.boy.displayName}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCharacter === 'girl'}
            className={`hud-avatar-btn ${activeCharacter === 'girl' ? 'active girl' : ''}`}
            onClick={() => onSwitchCharacter('girl')}
          >
            <span className="hud-avatar-icon" aria-hidden="true">{characterConfig.girl.avatarIcon}</span>
            <span>{characterConfig.girl.displayName}</span>
          </button>
        </div>

        <div className="hud-tab-hint">
          <kbd className="kbd-badge">Tab</kbd>
          <span>to switch</span>
        </div>
      </div>

      {/* Movement & Camera Control Hints */}
      <div className="hud-controls-card">
        <div className="hud-control-row">
          <div className="hud-keys-group">
            <kbd className="kbd-badge">W</kbd>
            <kbd className="kbd-badge">A</kbd>
            <kbd className="kbd-badge">S</kbd>
            <kbd className="kbd-badge">D</kbd>
          </div>
          <span>Move character</span>
        </div>

        <div className="hud-control-row">
          <kbd className="kbd-badge">Shift</kbd>
          <span>Sprint</span>
        </div>

        <div className="hud-control-row">
          <kbd className="kbd-badge">Mouse Drag</kbd>
          <span>Rotate camera</span>
        </div>
      </div>
    </aside>
  );
};

export default ControlHUD;
