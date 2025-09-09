import { useCallback, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface TouchEventHandlers {
  onTouchStart?: (position: TouchPosition) => void;
  onTouchMove?: (position: TouchPosition, delta: TouchPosition) => void;
  onTouchEnd?: (position: TouchPosition) => void;
  onPinchStart?: (distance: number, center: TouchPosition) => void;
  onPinchMove?: (distance: number, center: TouchPosition, scale: number) => void;
  onPinchEnd?: () => void;
}

export function useTouchEvents(handlers: TouchEventHandlers) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const lastTouchRef = useRef<TouchPosition | null>(null);
  const lastPinchDistanceRef = useRef<number | null>(null);
  const lastPinchCenterRef = useRef<TouchPosition | null>(null);

  const getTouchPosition = useCallback((touch: Touch): TouchPosition => ({
    x: touch.clientX,
    y: touch.clientY
  }), []);

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((touch1: Touch, touch2: Touch): TouchPosition => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const position = getTouchPosition(touch);
      lastTouchRef.current = position;
      setIsDragging(true);
      handlers.onTouchStart?.(position);
    } else if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      lastPinchDistanceRef.current = distance;
      lastPinchCenterRef.current = center;
      setIsPinching(true);
      setIsDragging(false);
      handlers.onPinchStart?.(distance, center);
    }
  }, [handlers, getTouchPosition, getDistance, getCenter]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging && lastTouchRef.current) {
      const touch = e.touches[0];
      const position = getTouchPosition(touch);
      const delta = {
        x: position.x - lastTouchRef.current.x,
        y: position.y - lastTouchRef.current.y
      };
      lastTouchRef.current = position;
      handlers.onTouchMove?.(position, delta);
    } else if (e.touches.length === 2 && isPinching && lastPinchDistanceRef.current && lastPinchCenterRef.current) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      const scale = distance / lastPinchDistanceRef.current;
      lastPinchDistanceRef.current = distance;
      lastPinchCenterRef.current = center;
      handlers.onPinchMove?.(distance, center, scale);
    }
  }, [handlers, isDragging, isPinching, getTouchPosition, getDistance, getCenter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (isDragging && lastTouchRef.current) {
      handlers.onTouchEnd?.(lastTouchRef.current);
      setIsDragging(false);
      lastTouchRef.current = null;
    }
    
    if (isPinching) {
      handlers.onPinchEnd?.();
      setIsPinching(false);
      lastPinchDistanceRef.current = null;
      lastPinchCenterRef.current = null;
    }
  }, [handlers, isDragging, isPinching]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isDragging,
    isPinching
  };
}
