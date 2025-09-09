import { useCallback, useRef, useState } from 'react';

interface GestureState {
  isDragging: boolean;
  isPinching: boolean;
  isRotating: boolean;
  startDistance: number;
  startAngle: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  currentDistance: number;
  currentAngle: number;
}

interface GestureCallbacks {
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragMove?: (position: { x: number; y: number }, delta: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onPinchStart?: (distance: number, center: { x: number; y: number }) => void;
  onPinchMove?: (distance: number, center: { x: number; y: number }, scale: number) => void;
  onPinchEnd?: () => void;
  onRotateStart?: (angle: number, center: { x: number; y: number }) => void;
  onRotateMove?: (angle: number, center: { x: number; y: number }, rotation: number) => void;
  onRotateEnd?: () => void;
}

export function useMobileGestures(callbacks: GestureCallbacks) {
  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    isPinching: false,
    isRotating: false,
    startDistance: 0,
    startAngle: 0,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    currentDistance: 0,
    currentAngle: 0
  });

  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getAngle = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  const getCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    touchStartTimeRef.current = now;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };
      
      lastTouchRef.current = position;
      
      setGestureState(prev => ({
        ...prev,
        isDragging: true,
        startPosition: position,
        currentPosition: position
      }));

      callbacks.onDragStart?.(position);

      // 长按检测
      longPressTimerRef.current = setTimeout(() => {
        // 长按逻辑可以在这里实现
        console.log('Long press detected');
      }, 500);

    } else if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const angle = getAngle(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      
      setGestureState(prev => ({
        ...prev,
        isDragging: false,
        isPinching: true,
        isRotating: true,
        startDistance: distance,
        startAngle: angle,
        currentDistance: distance,
        currentAngle: angle,
        startPosition: center,
        currentPosition: center
      }));

      callbacks.onPinchStart?.(distance, center);
      callbacks.onRotateStart?.(angle, center);
    }
  }, [callbacks, getDistance, getAngle, getCenter]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && gestureState.isDragging && lastTouchRef.current) {
      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };
      const delta = {
        x: position.x - lastTouchRef.current.x,
        y: position.y - lastTouchRef.current.y
      };
      
      lastTouchRef.current = position;
      
      setGestureState(prev => ({
        ...prev,
        currentPosition: position
      }));

      callbacks.onDragMove?.(position, delta);

    } else if (e.touches.length === 2 && (gestureState.isPinching || gestureState.isRotating)) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const angle = getAngle(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      
      const scale = distance / gestureState.startDistance;
      const rotation = angle - gestureState.startAngle;
      
      setGestureState(prev => ({
        ...prev,
        currentDistance: distance,
        currentAngle: angle,
        currentPosition: center
      }));

      if (gestureState.isPinching) {
        callbacks.onPinchMove?.(distance, center, scale);
      }
      
      if (gestureState.isRotating) {
        callbacks.onRotateMove?.(angle, center, rotation);
      }
    }
  }, [gestureState, callbacks, getDistance, getAngle, getCenter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (gestureState.isDragging && lastTouchRef.current) {
      callbacks.onDragEnd?.(lastTouchRef.current);
      
      setGestureState(prev => ({
        ...prev,
        isDragging: false
      }));
      
      lastTouchRef.current = null;
    }
    
    if (gestureState.isPinching) {
      callbacks.onPinchEnd?.();
      
      setGestureState(prev => ({
        ...prev,
        isPinching: false
      }));
    }
    
    if (gestureState.isRotating) {
      callbacks.onRotateEnd?.();
      
      setGestureState(prev => ({
        ...prev,
        isRotating: false
      }));
    }
  }, [gestureState, callbacks]);

  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 重置所有手势状态
    setGestureState({
      isDragging: false,
      isPinching: false,
      isRotating: false,
      startDistance: 0,
      startAngle: 0,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      currentDistance: 0,
      currentAngle: 0
    });

    lastTouchRef.current = null;
  }, []);

  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    },
    gestureState,
    isGestureActive: gestureState.isDragging || gestureState.isPinching || gestureState.isRotating
  };
}
