import { useEffect, useState, useCallback, useRef } from 'react';

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type InputMode = 'touch' | 'keyboard';

interface DeviceState {
  deviceCategory: DeviceCategory;
  isTouchCapable: boolean;
  isPortrait: boolean;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
}

const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      deviceCategory: 'desktop' as DeviceCategory,
      isTouchCapable: false,
      isPortrait: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const hasTouch = coarsePointer || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let deviceCategory: DeviceCategory = 'desktop';
  if (width <= 640) {
    deviceCategory = 'mobile';
  } else if (width <= 1180 && (hasTouch || width <= 1024)) {
    deviceCategory = 'tablet';
  }

  return {
    deviceCategory,
    isTouchCapable: hasTouch,
    isPortrait: height > width,
  };
};

export const useDeviceMode = (): DeviceState => {
  const [info, setInfo] = useState(getDeviceInfo);
  const [inputMode, setInputModeState] = useState<InputMode>(() => {
    const initial = getDeviceInfo();
    return initial.deviceCategory !== 'desktop' || initial.isTouchCapable ? 'touch' : 'keyboard';
  });
  const manualOverrideRef = useRef(false);

  const setInputMode = useCallback((mode: InputMode) => {
    manualOverrideRef.current = true;
    setInputModeState(mode);
  }, []);

  const toggleInputMode = useCallback(() => {
    manualOverrideRef.current = true;
    setInputModeState((prev) => (prev === 'touch' ? 'keyboard' : 'touch'));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const next = getDeviceInfo();
      setInfo(next);
      if (!manualOverrideRef.current) {
        setInputModeState(
          next.deviceCategory !== 'desktop' || next.isTouchCapable ? 'touch' : 'keyboard'
        );
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (manualOverrideRef.current) return;
      if (e.pointerType === 'touch') {
        setInputModeState('touch');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualOverrideRef.current) return;
      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        setInputModeState('keyboard');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    ...info,
    inputMode,
    setInputMode,
    toggleInputMode,
  };
};

export default useDeviceMode;
