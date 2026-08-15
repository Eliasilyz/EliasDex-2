'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { LenisRef } from 'lenis/react';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<LenisRef>(null);

  // Scroll to top on route change smoothly/instantly
  useEffect(() => {
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1, // Pure lerp damping (omits duration to prevent animation lock on rapid direction change)
        wheelMultiplier: 1,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
        prevent: (node: HTMLElement) => {
          return (
            node.hasAttribute('data-lenis-prevent') ||
            Boolean(node.closest?.('[data-lenis-prevent]'))
          );
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}

export { useLenis };
