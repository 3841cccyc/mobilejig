import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useMobileGestures } from '../hooks/useMobileGestures';

interface MobileViewportProps {
  children: React.ReactNode;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export function MobileViewport({
  children,
  className = '',
  enableZoom = true,
  enablePan = true,
  minZoom = 0.5,
  maxZoom = 2.0,
  initialZoom = 1.0
}: MobileViewportProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useMobileDetection();

  // 手势处理
  const gestureCallbacks = {
    onDragStart: useCallback((position: { x: number; y: number }) => {
      if (!enablePan) return;
      setIsDragging(true);
      setLastPan(pan);
    }, [enablePan, pan]),

    onDragMove: useCallback((position: { x: number; y: number }, delta: { x: number; y: number }) => {
      if (!enablePan || !isDragging) return;
      
      setPan(prev => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y
      }));
    }, [enablePan, isDragging]),

    onDragEnd: useCallback(() => {
      setIsDragging(false);
    }, []),

    onPinchStart: useCallback((distance: number, center: { x: number; y: number }) => {
      if (!enableZoom) return;
      // 记录开始时的缩放级别
    }, [enableZoom]),

    onPinchMove: useCallback((distance: number, center: { x: number; y: number }, scale: number) => {
      if (!enableZoom) return;
      
      setZoom(prev => {
        const newZoom = prev * scale;
        return Math.max(minZoom, Math.min(maxZoom, newZoom));
      });
    }, [enableZoom, minZoom, maxZoom]),

    onPinchEnd: useCallback(() => {
      // 缩放手势结束
    }, [])
  };

  const { gestureHandlers, isGestureActive } = useMobileGestures(gestureCallbacks);

  // 重置视图
  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  // 缩放到适合
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const content = container.firstElementChild as HTMLElement;
    
    if (!content) return;
    
    const contentRect = content.getBoundingClientRect();
    const scaleX = containerRect.width / contentRect.width;
    const scaleY = containerRect.height / contentRect.height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setZoom(scale);
    setPan({ x: 0, y: 0 });
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMobile && !isTablet) return;
      
      switch (e.key) {
        case '0':
          resetView();
          break;
        case '1':
          fitToView();
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(maxZoom, prev * 1.1));
          break;
        case '-':
          setZoom(prev => Math.max(minZoom, prev / 1.1));
          break;
        case 'ArrowUp':
          setPan(prev => ({ ...prev, y: prev.y + 20 }));
          break;
        case 'ArrowDown':
          setPan(prev => ({ ...prev, y: prev.y - 20 }));
          break;
        case 'ArrowLeft':
          setPan(prev => ({ ...prev, x: prev.x + 20 }));
          break;
        case 'ArrowRight':
          setPan(prev => ({ ...prev, x: prev.x - 20 }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isTablet, minZoom, maxZoom, resetView, fitToView]);

  // 防止页面滚动
  useEffect(() => {
    if (isGestureActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isGestureActive]);

  // 只在移动设备上启用手势
  const shouldEnableGestures = isMobile || isTablet;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        touchAction: shouldEnableGestures ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      {...(shouldEnableGestures ? gestureHandlers : {})}
    >
      <div
        className="origin-center transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: isGestureActive ? 'transform' : 'auto'
        }}
      >
        {children}
      </div>
      
      {/* 移动端控制按钮 */}
      {shouldEnableGestures && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom(prev => Math.min(maxZoom, prev * 1.2))}
            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm font-bold"
            disabled={zoom >= maxZoom}
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(minZoom, prev / 1.2))}
            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm font-bold"
            disabled={zoom <= minZoom}
          >
            −
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
            title="重置视图"
          >
            ⌂
          </button>
          <button
            onClick={fitToView}
            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
            title="适合视图"
          >
            ⊞
          </button>
        </div>
      )}
      
      {/* 缩放指示器 */}
      {shouldEnableGestures && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
