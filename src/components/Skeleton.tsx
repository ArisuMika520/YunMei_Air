/**
 * 骨架屏组件
 * 用于优化加载体验
 */

'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };

  return (
    <div
      className={`bg-gray-200/60 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

export function LockListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 p-6">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton width="40%" height="1.5rem" variant="rounded" />
            <Skeleton width="2rem" height="2rem" variant="circular" />
          </div>

          <div className="space-y-2 mb-4">
            <Skeleton width="60%" height="1rem" variant="rounded" />
            <Skeleton width="50%" height="1rem" variant="rounded" />
          </div>

          <div className="flex gap-3">
            <Skeleton width="100%" height="3rem" variant="rounded" />
            <Skeleton width="3rem" height="3rem" variant="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LockDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Skeleton width="2rem" height="2rem" variant="circular" />
          <Skeleton width="8rem" height="1.5rem" variant="rounded" />
          <Skeleton width="2rem" height="2rem" variant="circular" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <Skeleton width="6rem" height="6rem" variant="circular" />
          </div>

          <div className="flex justify-center mb-4">
            <Skeleton width="50%" height="2rem" variant="rounded" />
          </div>

          <div className="space-y-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <Skeleton width="30%" height="1rem" variant="rounded" />
                <Skeleton width="40%" height="1rem" variant="rounded" />
              </div>
            ))}
          </div>

          <Skeleton width="100%" height="4rem" variant="rounded" />
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton width="2.5rem" height="2.5rem" variant="circular" />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height="1rem" variant="rounded" />
                    <Skeleton width="80%" height="0.75rem" variant="rounded" />
                  </div>
                </div>
                <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScanDialogSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <Skeleton width="8rem" height="8rem" variant="circular" className="mx-auto" />
        <Skeleton width="60%" height="1.5rem" variant="rounded" className="mx-auto" />
        <Skeleton width="40%" height="1rem" variant="rounded" className="mx-auto" />
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between py-2">
            <Skeleton width="35%" height="1rem" variant="rounded" />
            <Skeleton width="45%" height="1rem" variant="rounded" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Skeleton width="100%" height="3rem" variant="rounded" />
        <Skeleton width="100%" height="3rem" variant="rounded" />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/95 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton width="3rem" height="3rem" variant="circular" />
              <div className="flex-1 space-y-2">
                <Skeleton width="40%" height="1rem" variant="rounded" />
                <Skeleton width="60%" height="0.75rem" variant="rounded" />
              </div>
            </div>
            <Skeleton width="1.5rem" height="1.5rem" variant="circular" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/95 rounded-2xl p-6 shadow-lg">
      <Skeleton width="60%" height="1.5rem" variant="rounded" className="mb-4" />
      <Skeleton width="100%" height="1rem" variant="rounded" className="mb-2" />
      <Skeleton width="80%" height="1rem" variant="rounded" className="mb-4" />
      <Skeleton width="100%" height="3rem" variant="rounded" />
    </div>
  );
}

