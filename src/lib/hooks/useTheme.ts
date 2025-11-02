'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';


export function hueToHSL(hue: number, saturation: number = 65, lightness: number = 60): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


function hueToHSLValues(hue: number, saturation: number = 65, lightness: number = 60): string {
  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * 自动渐变算法：根据主题色自动计算和谐的渐变色
 */
function calculateGradientColors(hue: number): { from: string; to: string } {
  const saturation = 75;
  const lightness = 70;
  
  const fromHue = hue;
  let toHue = hue - 60;
  
  if (toHue < 0) toHue += 360;
  
  return {
    from: hueToHSLValues(fromHue, saturation, lightness),
    to: hueToHSLValues(toHue, saturation, lightness),
  };
}

/**
 * 应用主题配置的 Hook
 */
export function useTheme() {
  const { themeConfig } = useUserStore();

  useEffect(() => {
    const root = document.documentElement;
    const hue = themeConfig.primaryHue;

    // 应用主题颜色 - 完整色阶
    root.style.setProperty('--primary', hueToHSLValues(hue, 65, 60));
    root.style.setProperty('--primary-light', hueToHSLValues(hue, 70, 75));
    root.style.setProperty('--primary-dark', hueToHSLValues(hue, 60, 50));
    
    root.style.setProperty('--primary-50', hueToHSLValues(hue, 65, 97));
    root.style.setProperty('--primary-100', hueToHSLValues(hue, 65, 93));
    root.style.setProperty('--primary-200', hueToHSLValues(hue, 65, 85));
    root.style.setProperty('--primary-300', hueToHSLValues(hue, 65, 75));
    root.style.setProperty('--primary-400', hueToHSLValues(hue, 65, 65));
    root.style.setProperty('--primary-500', hueToHSLValues(hue, 65, 55));
    root.style.setProperty('--primary-600', hueToHSLValues(hue, 65, 45));
    root.style.setProperty('--primary-700', hueToHSLValues(hue, 65, 35));
    root.style.setProperty('--primary-800', hueToHSLValues(hue, 65, 25));
    root.style.setProperty('--primary-900', hueToHSLValues(hue, 65, 15));

    const gradientColors = calculateGradientColors(hue);
    root.style.setProperty('--gradient-from', gradientColors.from);
    root.style.setProperty('--gradient-to', gradientColors.to);

    if (themeConfig.backgroundImage) {
      root.style.setProperty('--bg-image', `url(${themeConfig.backgroundImage})`);
      root.style.setProperty('--bg-opacity', String(themeConfig.backgroundOpacity));
      root.style.setProperty('--overlay-opacity', String(themeConfig.overlayOpacity));
    } else {
      root.style.removeProperty('--bg-image');
      root.style.removeProperty('--bg-opacity');
      root.style.removeProperty('--overlay-opacity');
    }

    root.style.setProperty('--component-opacity', String(themeConfig.componentOpacity));
  }, [themeConfig]);

  return themeConfig;
}

