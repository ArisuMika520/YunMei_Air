'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Lock } from '@/lib/entities/Lock';
import { feedback } from '@/lib/utils/interactions';
import { modalBackdropVariants, modalVariants, buttonVariants } from '@/lib/animations/variants';

interface ScanLockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lock: Lock) => void;
}

export function ScanLockDialog({ isOpen, onClose, onSuccess }: ScanLockDialogProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCameraScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, scanMode]);

  const startCameraScanner = async () => {
    try {
      setError('');
      setIsScanning(true);

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanError
      );
    } catch (err) {
      console.error('启动扫描失败:', err);
      setError('无法访问摄像头，请检查权限设置');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('停止扫描失败:', err);
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    feedback.success();
    stopScanner();
    parseLockData(decodedText);
  };

  const handleScanError = (errorMessage: string) => {
    console.debug('扫描中...', errorMessage);
  };

  const parseLockData = (data: string) => {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parts = decoded.split('|');

      if (parts.length !== 8) {
        throw new Error('二维码格式错误');
      }

      const lock = new Lock(
        parts[0], // label
        parts[1], // mac
        parts[2], // characteristicUuid
        parts[3], // serviceUuid
        parts[4], // secret
        parts[5], // username
        parts[6], // schoolNo
        parts[7], // lockNo
        false
      );

      onSuccess(lock);
      onClose();
    } catch (err) {
      console.error('解析门锁数据失败:', err);
      setError('二维码格式不正确，请扫描有效的门锁分享码');
      feedback.error();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      feedback.error();
      return;
    }

    try {
      setError('');
      feedback.buttonClick();

      const scanner = new Html5Qrcode('qr-reader-file');
      const result = await scanner.scanFile(file, true);
      
      parseLockData(result);
    } catch (err) {
      console.error('扫描图片失败:', err);
      setError('未能识别图片中的二维码');
      feedback.error();
    }
  };

  const handleClose = () => {
    feedback.buttonClick();
    stopScanner();
    onClose();
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
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <motion.button
              onClick={handleClose}
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

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">扫码添加门锁</h3>
              <p className="text-neutral-500 text-sm">扫描好友分享的二维码</p>
            </div>

            <div className="flex gap-2 mb-6 bg-neutral-100 p-1 rounded-xl">
              <motion.button
                onClick={() => {
                  feedback.buttonClick();
                  stopScanner();
                  setScanMode('camera');
                }}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                  scanMode === 'camera'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>相机扫描</span>
                </span>
              </motion.button>

              <motion.button
                onClick={() => {
                  feedback.buttonClick();
                  stopScanner();
                  setScanMode('upload');
                }}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                  scanMode === 'upload'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>上传图片</span>
                </span>
              </motion.button>
            </div>

            <div className="mb-6">
              {scanMode === 'camera' ? (
                <div className="bg-neutral-900 rounded-2xl overflow-hidden aspect-square relative">
                  <div id="qr-reader" className="w-full h-full" />
                  {!isScanning && !error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div id="qr-reader-file" className="hidden" />
                  <motion.button
                    onClick={() => {
                      feedback.buttonClick();
                      fileInputRef.current?.click();
                    }}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-4"
                  >
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-neutral-900 mb-1">点击上传图片</p>
                      <p className="text-sm text-neutral-500">支持 JPG、PNG 等格式</p>
                    </div>
                  </motion.button>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error-50 border-2 border-error-200 text-error-700 px-4 py-3 rounded-2xl text-sm mb-6"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </motion.div>
            )}

            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    {scanMode === 'camera' 
                      ? '将二维码对准扫描框，系统会自动识别'
                      : '上传包含二维码的图片，系统会自动识别并添加门锁'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

