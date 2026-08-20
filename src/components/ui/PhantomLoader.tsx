'use client';

import React from 'react';

interface PhantomLoaderProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  shimmerDirection?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  shimmerColor?: string;
  backgroundColor?: string;
  duration?: number;
  fallbackRadius?: number;
  animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid';
  mode?: 'skeleton' | 'overlay';
  stagger?: number;
  reveal?: number;
  count?: number;
  countGap?: number;
  loadingLabel?: string;
}

export const PhantomLoader: React.FC<PhantomLoaderProps> = ({
  loading = true,
  children,
  className = '',
  loadingLabel = 'Loading...',
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div
      className={`phantom-shimmer ${className}`}
      aria-busy="true"
      aria-label={loadingLabel}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
};
