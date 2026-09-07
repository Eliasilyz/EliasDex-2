'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdSlotProps {
  adLabel?: string;
  className?: string;
  minHeight?: number;
  children: React.ReactNode;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  adLabel = 'Iklan',
  className = '',
  minHeight = 120,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (containerRef.current && containerRef.current.children.length === 0) {
        setIsAdBlocked(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleContentReady = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-ink-700/60 bg-surface-raised/50 ${className}`}
      style={{ minHeight: isAdBlocked ? 0 : minHeight }}
    >
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-[0.08em] text-ink-500 font-mono font-medium">
          {adLabel}
        </span>
      </div>

      <div className="px-4 pb-4">
        {!isLoaded && !isAdBlocked && (
          <Skeleton className="w-full" />
        )}
        {isAdBlocked && (
          <div className="flex items-center justify-center py-4 text-ink-500 text-xs font-mono opacity-50">
            Ad blocked
          </div>
        )}
        {isVisible && !isAdBlocked && children}
      </div>
    </div>
  );
};
