'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { Lock } from '@/lib/entities/Lock';
import { feedback } from '@/lib/utils/interactions';
import { modalBackdropVariants, modalVariants, buttonVariants } from '@/lib/animations/variants';

interface ShareLockDialogProps {
  lock: Lock;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareLockDialog({ lock, isOpen, onClose }: ShareLockDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && lock) {
      generateQRCode();
    }
  }, [isOpen, lock]);

  const generateQRCode = async () => {
    try {
      // 生成包含门锁信息的 Base64 字符串
      const lockData = lock.toString(true); // headless = true
      const canvas = canvasRef.current;
      
      if (canvas) {
        await QRCode.toCanvas(canvas, lockData, {
          width: 280,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        // 同时生成 data URL 用于下载
        const dataUrl = await QRCode.toDataURL(lockData, {
          width: 512,
          margin: 2,
        });
        setQrCodeUrl(dataUrl);
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = lock.toString(false);
      await navigator.clipboard.writeText(shareUrl);
      feedback.success();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      feedback.error();
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      feedback.buttonClick();
      const link = document.createElement('a');
      link.download = `${lock.label}-二维码.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* 关闭按钮 */}
            <motion.button
              onClick={() => {
                feedback.buttonClick();
                onClose();
              }}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* 标题 */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">分享门锁</h3>
              <p className="text-neutral-500 text-sm">{lock.label}</p>
            </div>

            {/* 二维码 */}
            <div className="bg-neutral-50 rounded-2xl p-6 mb-6 flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <canvas ref={canvasRef} className="block" />
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    让好友扫描此二维码或使用链接即可添加门锁到他们的设备
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleCopyLink}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-success-500">已复制</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>复制链接</span>
                    </>
                  )}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownload}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="flex-1 btn-primary"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载二维码</span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

