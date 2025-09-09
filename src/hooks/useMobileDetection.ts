import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      // 检测移动设备
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // 基于屏幕尺寸和设备特征判断
      const isMobileSize = width <= 768;
      const isTabletSize = width > 768 && width <= 1024;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isMobileSize));
      setIsTablet(isTabletSize && (isMobileDevice || isTouchDevice));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    isSmallScreen: screenSize.width <= 480,
    isMediumScreen: screenSize.width > 480 && screenSize.width <= 768,
    isLargeScreen: screenSize.width > 768
  };
}
