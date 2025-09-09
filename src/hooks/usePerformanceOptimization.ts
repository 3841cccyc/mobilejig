import { useCallback, useRef, useEffect, useState } from 'react';
import { useMobileDetection } from './useMobileDetection';

interface PerformanceConfig {
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableReducedMotion?: boolean;
  maxConcurrentAnimations?: number;
  debounceDelay?: number;
}

export function usePerformanceOptimization(config: PerformanceConfig = {}) {
  const {
    enableVirtualization = true,
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableReducedMotion = true,
    maxConcurrentAnimations = 3,
    debounceDelay = 100
  } = config;

  const { isMobile, isTablet, screenSize } = useMobileDetection();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const animationCountRef = useRef(0);
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 检测低端设备
  useEffect(() => {
    const checkDevicePerformance = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      // 检测WebGL支持
      const hasWebGL = !!gl;
      
      // 检测内存（如果可用）
      const memory = (navigator as any).deviceMemory || 4;
      
      // 检测CPU核心数
      const cores = navigator.hardwareConcurrency || 4;
      
      // 检测屏幕分辨率
      const pixelRatio = window.devicePixelRatio || 1;
      const screenPixels = screenSize.width * screenSize.height * pixelRatio;
      
      // 综合判断是否为低端设备
      const isLowEnd = !hasWebGL || memory < 4 || cores < 4 || screenPixels < 1000000;
      
      setIsLowEndDevice(isLowEnd);
    };

    checkDevicePerformance();
  }, [screenSize]);

  // 检测用户是否偏好减少动画
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 防抖函数
  const debounce = useCallback((key: string, func: () => void, delay: number = debounceDelay) => {
    const existingTimer = debounceTimersRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      func();
      debounceTimersRef.current.delete(key);
    }, delay);

    debounceTimersRef.current.set(key, timer);
  }, [debounceDelay]);

  // 节流函数
  const throttle = useCallback((func: (...args: any[]) => void, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }, []);

  // 动画队列管理
  const requestAnimation = useCallback((animation: () => void) => {
    if (isReducedMotion || (isLowEndDevice && animationCountRef.current >= maxConcurrentAnimations)) {
      // 直接执行，不使用动画
      animation();
      return;
    }

    animationCountRef.current++;
    requestAnimationFrame(() => {
      animation();
      animationCountRef.current--;
    });
  }, [isReducedMotion, isLowEndDevice, maxConcurrentAnimations]);

  // 图片懒加载
  const createLazyImage = useCallback((src: string, placeholder?: string) => {
    if (!enableLazyLoading) {
      return src;
    }

    // 返回一个懒加载的图片URL
    return placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Yqg6L295LitLi4uPC90ZXh0Pjwvc3ZnPg==';
  }, [enableLazyLoading]);

  // 图片优化
  const optimizeImageUrl = useCallback((url: string, width?: number, height?: number, quality: number = 0.8) => {
    if (!enableImageOptimization) {
      return url;
    }

    // 如果是外部图片服务，可以添加优化参数
    if (url.includes('unsplash.com') || url.includes('picsum.photos')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality < 1) params.set('q', Math.round(quality * 100).toString());
      
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }

    return url;
  }, [enableImageOptimization]);

  // 虚拟化列表
  const createVirtualizedList = useCallback((
    items: any[],
    itemHeight: number,
    containerHeight: number,
    scrollTop: number
  ) => {
    if (!enableVirtualization || items.length < 50) {
      return { items, startIndex: 0, endIndex: items.length - 1 };
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 2, items.length - 1);

    return {
      items: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex
    };
  }, [enableVirtualization]);

  // 内存管理
  const cleanup = useCallback(() => {
    // 清理防抖定时器
    debounceTimersRef.current.forEach(timer => clearTimeout(timer));
    debounceTimersRef.current.clear();
    
    // 重置动画计数
    animationCountRef.current = 0;
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 性能监控
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    if (!isMobile && !isTablet) {
      fn();
      return;
    }

    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (end - start > 16) { // 超过一帧的时间
      console.warn(`Performance warning: ${name} took ${end - start}ms`);
    }
  }, [isMobile, isTablet]);

  return {
    // 设备信息
    isMobile,
    isTablet,
    isLowEndDevice,
    isReducedMotion,
    
    // 性能优化函数
    debounce,
    throttle,
    requestAnimation,
    createLazyImage,
    optimizeImageUrl,
    createVirtualizedList,
    measurePerformance,
    
    // 配置
    shouldUseVirtualization: enableVirtualization && (isMobile || isTablet),
    shouldUseLazyLoading: enableLazyLoading && (isMobile || isTablet),
    shouldOptimizeImages: enableImageOptimization && (isMobile || isTablet),
    shouldReduceAnimations: isReducedMotion || (isLowEndDevice && isMobile),
    
    // 清理函数
    cleanup
  };
}
