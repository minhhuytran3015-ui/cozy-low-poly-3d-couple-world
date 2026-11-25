import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../../styles/touch.css';
import type { KeyboardState } from '../../hooks/useKeyboardControls';
import type { CameraControlHandle } from '../camera/FollowCamera';

interface TouchControlsProps {
  keysRef: React.MutableRefObject<KeyboardState>;
  cameraControlRef: React.MutableRefObject<CameraControlHandle | null>;
  onSwitchCharacter: () => void;
  visible?: boolean;
}

const TouchControlsInner: React.FC<Omit<TouchControlsProps, 'visible'>> = ({
  keysRef,
  cameraControlRef,
  onSwitchCharacter,
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const [isJoyActive, setIsJoyActive] = useState(false);
  const [sprintLocked, setSprintLocked] = useState(false);

  const resetJoystick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsJoyActive(false);
    keysRef.current.joyX = 0;
    keysRef.current.joyY = 0;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    }
  }, [keysRef]);

  useEffect(() => {
    const handleBlur = () => resetJoystick();
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      keysRef.current.joyX = 0;
      keysRef.current.joyY = 0;
      keysRef.current.touchSprint = false;
    };
  }, [resetJoystick, keysRef]);

  const updateStickFromClientPos = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;

    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.36;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius && dist > 0) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0px)`;
    }

    keysRef.current.joyX = dx / maxRadius;
    keysRef.current.joyY = -dy / maxRadius;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsJoyActive(true);
    updateStickFromClientPos(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateStickFromClientPos(e.clientX, e.clientY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetJoystick();
  };

  const toggleSprint = () => {
    setSprintLocked((prev) => {
      const next = !prev;
      keysRef.current.touchSprint = next;
      return next;
    });
  };

  return (
    <div className="touch-controls-layer" aria-label="Touch controls">
      {/* Bottom-left Analog Virtual Joystick */}
      <div
        ref={padRef}
        className={`joystick-zone ${isJoyActive ? 'active' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        role="application"
        aria-label="Virtual movement joystick"
      >
        <div className="joystick-ring" />
        <span className="joystick-dir-dot top" />
        <span className="joystick-dir-dot bottom" />
        <span className="joystick-dir-dot left" />
        <span className="joystick-dir-dot right" />
        <div ref={knobRef} className="joystick-knob">
          <span className="joystick-knob-dot" />
        </div>
      </div>

      {/* Bottom-center touch gesture hint (Tablet & large phones) */}
      <div className="touch-camera-hint" aria-hidden="true">
        Kéo 1 ngón xoay góc nhìn &bull; Chụm 2 ngón phóng to/nhỏ
      </div>

      {/* Bottom-right Zoom & Action Buttons */}
      <div className="touch-actions-cluster">
        <div className="touch-zoom-group" aria-label="Camera zoom controls">
          <button
            type="button"
            className="touch-mini-btn"
            onClick={() => cameraControlRef.current?.zoomIn()}
            aria-label="Phóng to camera"
            title="Phóng to"
          >
            +
          </button>
          <button
            type="button"
            className="touch-mini-btn"
            onClick={() => cameraControlRef.current?.zoomOut()}
            aria-label="Thu nhỏ camera"
            title="Thu nhỏ"
          >
            &minus;
          </button>
          <button
            type="button"
            className="touch-mini-btn"
            onClick={() => cameraControlRef.current?.resetView()}
            aria-label="Đặt lại góc nhìn"
            title="Đặt lại góc nhìn"
          >
            ↺
          </button>
        </div>

        <div className="touch-main-btns">
          <button
            type="button"
            className="touch-action-btn"
            onClick={onSwitchCharacter}
            aria-label="Đổi nhân vật"
          >
            <span className="touch-action-icon" aria-hidden="true">🔄</span>
            <span>Đổi người</span>
          </button>

          <button
            type="button"
            className={`touch-action-btn ${sprintLocked ? 'active' : ''}`}
            onClick={toggleSprint}
            aria-pressed={sprintLocked}
            aria-label="Bật tắt chạy nhanh"
          >
            <span className="touch-action-icon" aria-hidden="true">⚡</span>
            <span>{sprintLocked ? 'Đang chạy' : 'Chạy nhanh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const TouchControls: React.FC<TouchControlsProps> = ({ visible = true, ...props }) => {
  if (!visible) return null;
  return <TouchControlsInner {...props} />;
};

export default TouchControls;
