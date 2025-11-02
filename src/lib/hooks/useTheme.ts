'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

/**
 * 将色相值转换为 HSL 颜色字符串（用于直接 CSS）
 */
export function hueToHSL(hue: number, saturation: number = 65, lightness: number = 60): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 将色相值转换为空格分隔的 HSL 值（用于 Tailwind CSS 变量）
 * 格式: "hue saturation% lightness%" (不含 hsl() 包装)
 */
function hueToHSLValues(hue: number, saturation: number = 65, lightness: number = 60): string {
  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * 智能渐变算法：根据主题色自动计算和谐的渐变色
 * 规则：
 * 1. 渐变起始色：主题色本身，饱和度提升至 75%，亮度 70%（更鲜艳）
 * 2. 渐变结束色：色相偏移 -60 度（色环上的邻近色），保持同样的饱和度和亮度
 * 3. 色相偏移方向：向冷色调方向（逆时针），更有科技感
 * 
 * 色环对照：
 * - 红色 (0°) → 紫色 (-60° = 300°)
 * - 橙色 (30°) → 粉紫 (-60° = 330°)
 * - 黄色 (60°) → 紫色 (-60° = 0° = 360°)
 * - 绿色 (120°) → 蓝色 (-60° = 60°)
 * - 青色 (180°) → 蓝绿 (-60° = 120°)
 * - 蓝色 (240°) → 青色 (-60° = 180°)
 * - 紫色 (270°) → 蓝色 (-60° = 210°)
 * - 粉色 (330°) → 蓝紫 (-60° = 270°)
 */
function calculateGradientColors(hue: number): { from: string; to: string } {
  const saturation = 75; // 更高的饱和度，使渐变更鲜艳
  const lightness = 70;  // 适中的亮度，既鲜艳又不刺眼
  
  // 起始色：主题色本身
  const fromHue = hue;
  
  // 结束色：向冷色调方向偏移 60 度
  let toHue = hue - 60;
  
  // 确保色相值在 0-360 范围内
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
    // 使用空格分隔的值格式，支持 Tailwind 的透明度修饰符
    root.style.setProperty('--primary', hueToHSLValues(hue, 65, 60));
    root.style.setProperty('--primary-light', hueToHSLValues(hue, 70, 75));
    root.style.setProperty('--primary-dark', hueToHSLValues(hue, 60, 50));
    
    // 为 Tailwind 设置完整色阶
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

    // 应用智能渐变色（用于标题等渐变文字）
    const gradientColors = calculateGradientColors(hue);
    root.style.setProperty('--gradient-from', gradientColors.from);
    root.style.setProperty('--gradient-to', gradientColors.to);

    // 应用背景图片
    if (themeConfig.backgroundImage) {
      root.style.setProperty('--bg-image', `url(${themeConfig.backgroundImage})`);
      root.style.setProperty('--bg-opacity', String(themeConfig.backgroundOpacity));
      root.style.setProperty('--overlay-opacity', String(themeConfig.overlayOpacity));
    } else {
      root.style.removeProperty('--bg-image');
      root.style.removeProperty('--bg-opacity');
      root.style.removeProperty('--overlay-opacity');
    }

    // 应用组件透明度
    root.style.setProperty('--component-opacity', String(themeConfig.componentOpacity));
  }, [themeConfig]);

  return themeConfig;
}

