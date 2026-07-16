import { useCallback, useRef } from 'react';

const SWIPE_MIN_PX = 40;

/** Swipe or drag left/right — calls onNext (swipe left) or onPrev (swipe right). */
export function useHorizontalSwipe(onNext, onPrev) {
  const startX = useRef(null);
  const startY = useRef(null);

  const reset = useCallback(() => {
    startX.current = null;
    startY.current = null;
  }, []);

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (startX.current == null || startY.current == null) return;

      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      reset();

      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      if (dx < 0) onNext?.();
      else onPrev?.();
    },
    [onNext, onPrev, reset]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel: reset,
    onPointerLeave: reset,
  };
}
