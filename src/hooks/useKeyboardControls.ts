import { useEffect, useRef } from 'react';

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

interface UseKeyboardControlsOptions {
  onTabPress?: () => void;
  enabled?: boolean;
}

export const useKeyboardControls = ({
  onTabPress,
  enabled = true,
}: UseKeyboardControlsOptions = {}) => {
  const keysRef = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  // Keep a stable ref to onTabPress so event listener does not recreate
  const onTabPressRef = useRef(onTabPress);
  useEffect(() => {
    onTabPressRef.current = onTabPress;
  }, [onTabPress]);

  useEffect(() => {
    if (!enabled) {
      // Reset keys if disabled
      keysRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      };
      return;
    }

    const isInputActive = () => {
      const activeEl = document.activeElement;
      return (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl && activeEl.getAttribute('contenteditable') === 'true')
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputActive()) return;

      // Handle Tab for switching characters
      if (e.code === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (onTabPressRef.current) {
          onTabPressRef.current();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.sprint = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.sprint = false;
          break;
      }
    };

    const handleWindowBlur = () => {
      // Reset all keys on blur to avoid stuck movement keys
      keysRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled]);

  return keysRef;
};

export default useKeyboardControls;
