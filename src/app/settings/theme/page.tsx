'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { feedback } from '@/lib/utils/interactions';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { buttonVariants } from '@/lib/animations/variants';
import { useState, useRef } from 'react';
import { hueToHSL } from '@/lib/hooks/useTheme';

export default function ThemePage() {
  const router = useRouter();
  const { themeConfig, setThemeConfig } = useUserStore();
  const { toasts, toast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hexInput, setHexInput] = useState('');

  const handleColorChange = (hue: number) => {
    setThemeConfig({ primaryHue: hue });
  };

  // 将十六进制颜色转换为 HSL 色相值
  const hexToHue = (hex: string): number | null => {
    // 移除 # 号
    hex = hex.replace('#', '');
    
    // 验证十六进制格式
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return null;
    }
    
    // 转换为 RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // 计算色相
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }
    
    return Math.round(h * 360);
  };

  // 将当前色相转换为十六进制颜色（用于显示）
  const hueToHex = (hue: number): string => {
    const h = hue / 360;
    const s = 0.65;
    const l = 0.55;
    
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = Math.round(hueToRgb(p, q, h + 1/3) * 255);
    const g = Math.round(hueToRgb(p, q, h) * 255);
    const b = Math.round(hueToRgb(p, q, h - 1/3) * 255);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // 处理十六进制输入
  const handleHexInput = (value: string) => {
    setHexInput(value);
    
    // 只处理完整的十六进制颜色
    const cleanHex = value.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      const hue = hexToHue(value);
      if (hue !== null) {
        handleColorChange(hue);
        toast.success('主题色已更新', `已应用颜色 ${value.toUpperCase()}`);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }

      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setThemeConfig({ backgroundImage: imageUrl });
        toast.success('背景图片已更新');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    feedback.buttonClick();
    setThemeConfig({ backgroundImage: null });
    toast.success('背景图片已移除');
  };

  const handleOpacityChange = (type: 'background' | 'overlay' | 'component', value: number) => {
    if (type === 'background') {
      setThemeConfig({ backgroundOpacity: value });
    } else if (type === 'overlay') {
      setThemeConfig({ overlayOpacity: value });
    } else {
      setThemeConfig({ componentOpacity: value });
    }
  };

  // 恢复所有主题设置为默认
  const handleResetAll = () => {
    feedback.buttonClick();
    setThemeConfig({
      primaryHue: 222, // 默认蓝色 #316aef
      backgroundImage: null,
      backgroundOpacity: 1,
      overlayOpacity: 0.3,
      componentOpacity: 0.95
    });
    toast.success('已恢复默认设置', '所有主题设置已重置');
  };

  // 恢复背景为默认
  const handleResetBackground = () => {
    feedback.buttonClick();
    setThemeConfig({
      backgroundImage: null,
      backgroundOpacity: 1,
      overlayOpacity: 0.3,
      componentOpacity: 0.95
    });
    toast.success('背景已重置', '已恢复默认背景设置');
  };

  // 预设颜色
  const presetColors = [
    { name: '蓝色', hue: 222, hex: '#316aef' },
    { name: '紫色', hue: 260, hex: '#6e29f6' },
    { name: '粉色', hue: 355, hex: '#df9298' },
    { name: '青色', hue: 180, hex: '#00BCD4' },
  ];

  return (
    <>
      <div className="min-h-screen safe-top safe-bottom">
        <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <motion.button
              onClick={() => {
                feedback.buttonClick();
                router.back();
              }}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <h1 className="text-2xl font-bold text-gradient">自定义主题</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <section className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">主题颜色</h3>
              <motion.button
                onClick={handleResetAll}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                恢复所有默认
              </motion.button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              {presetColors.map((color) => (
                <motion.button
                  key={color.hue}
                  onClick={() => {
                    feedback.buttonClick();
                    handleColorChange(color.hue);
                    toast.success('主题色已更新', `已切换为${color.name}`);
                  }}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    themeConfig.primaryHue === color.hue
                      ? 'border-neutral-900 shadow-lg'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  style={{ backgroundColor: hueToHSL(color.hue, 65, 95) }}
                >
                  <div 
                    className="w-full h-12 rounded-lg mb-2"
                    style={{ backgroundColor: hueToHSL(color.hue) }}
                  />
                  <p className="text-xs font-medium text-neutral-700">{color.name}</p>
                  {themeConfig.primaryHue === color.hue && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">十六进制颜色</label>
                <span className="text-xs text-neutral-400">如: #316aef</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={hexInput || hueToHex(themeConfig.primaryHue)}
                    onChange={(e) => handleHexInput(e.target.value)}
                    onFocus={() => setHexInput(hueToHex(themeConfig.primaryHue))}
                    onBlur={() => setHexInput('')}
                    placeholder="#316aef"
                    maxLength={7}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none transition-colors text-sm font-mono uppercase"
                  />
                  <div 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border-2 border-neutral-300 shadow-sm"
                    style={{ backgroundColor: hexInput || hueToHex(themeConfig.primaryHue) }}
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">输入6位十六进制颜色代码（可选带#号）</p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">自定义色相</label>
                <span className="text-sm text-neutral-500">{themeConfig.primaryHue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={themeConfig.primaryHue}
                onChange={(e) => handleColorChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 70%, 60%), 
                    hsl(60, 70%, 60%), 
                    hsl(120, 70%, 60%), 
                    hsl(180, 70%, 60%), 
                    hsl(240, 70%, 60%), 
                    hsl(300, 70%, 60%), 
                    hsl(360, 70%, 60%))`
                }}
              />
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-neutral-600">主题预览</p>
                <p className="text-xs text-neutral-400">实时效果</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
                <div className="text-center pb-2 border-b border-neutral-100">
                  <h3 className="text-xl font-bold text-gradient">我的门锁</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${themeConfig.primaryHue}, 70%, 95%)` }}
                    >
                      <svg className="w-5 h-5" style={{ color: `hsl(${themeConfig.primaryHue}, 70%, 50%)` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">前门</p>
                      <p className="text-xs text-neutral-400">已连接</p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${themeConfig.primaryHue}, 70%, 50%)` }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${themeConfig.primaryHue}, 70%, 95%)` }}
                    >
                      <svg className="w-5 h-5" style={{ color: `hsl(${themeConfig.primaryHue}, 70%, 50%)` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">后门</p>
                      <p className="text-xs text-neutral-400">已连接</p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${themeConfig.primaryHue}, 70%, 50%)` }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">背景图片</h3>
              <motion.button
                onClick={handleResetBackground}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                恢复背景默认
              </motion.button>
            </div>
            
            <div className="space-y-3">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.button
                  onClick={() => {
                    feedback.buttonClick();
                    fileInputRef.current?.click();
                  }}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700">
                      {themeConfig.backgroundImage ? '更换背景图片' : '上传背景图片'}
                    </span>
                  </div>
                </motion.button>
              </div>

              {themeConfig.backgroundImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="relative rounded-xl overflow-hidden border-2 border-neutral-200">
                    <img
                      src={themeConfig.backgroundImage}
                      alt="背景预览"
                      className="w-full h-48 object-cover"
                      style={{ opacity: themeConfig.backgroundOpacity }}
                    />
                    <div 
                      className="absolute inset-0 bg-black"
                      style={{ opacity: themeConfig.overlayOpacity }}
                    />
                    <motion.button
                      onClick={handleRemoveImage}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-700">背景透明度</label>
                      <span className="text-sm text-neutral-500">{Math.round(themeConfig.backgroundOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={themeConfig.backgroundOpacity}
                      onChange={(e) => handleOpacityChange('background', Number(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-700">蒙版透明度</label>
                      <span className="text-sm text-neutral-500">{Math.round(themeConfig.overlayOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={themeConfig.overlayOpacity}
                      onChange={(e) => handleOpacityChange('overlay', Number(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">组件透明度</h3>
                <p className="text-xs text-neutral-500 mt-0.5">调整卡片和界面元素的透明度</p>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">透明度</label>
                <span className="text-sm text-neutral-500">{Math.round(themeConfig.componentOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.01"
                value={themeConfig.componentOpacity}
                onChange={(e) => handleOpacityChange('component', Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-2">
                <span>半透明</span>
                <span>不透明</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-medium text-neutral-600 mb-2">效果预览</p>
              
              <div 
                className="rounded-xl p-4 border border-neutral-100 transition-all duration-200"
                style={{ 
                  background: `rgba(255, 255, 255, ${themeConfig.componentOpacity})`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `hsl(${themeConfig.primaryHue}, 70%, 95%)` }}
                  >
                    <svg 
                      className="w-5 h-5" 
                      style={{ color: `hsl(${themeConfig.primaryHue}, 70%, 50%)` }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">示例卡片</p>
                    <p className="text-xs text-neutral-500">透过组件可以看到背景</p>
                  </div>
                </div>
              </div>

              <div 
                className="rounded-xl p-3 border border-neutral-100 transition-all duration-200"
                style={{ 
                  background: `rgba(255, 255, 255, ${themeConfig.componentOpacity})`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <p className="text-xs text-neutral-700">透明度越低，背景图越明显</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>使用建议：</strong>设置背景图后，降低组件透明度可以让背景更突出。建议调整为 70-90% 之间以获得最佳视觉效果。
              </p>
            </div>
          </section>
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

