/**
 * 简化的移动端 Hook
 * 只保留必要的设备检测
 */

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  shouldReduceMotion: boolean;
}

/**
 * 简单的设备检测
 */
export function useMobileOptimization(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    shouldReduceMotion: false,
  });

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setDeviceInfo({ isMobile, shouldReduceMotion });
  }, []);

  return deviceInfo;
}
