'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useMemo } from 'react';
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

  const lenisOptions = useMemo(
    () => ({
      lerp: 0.15, // Snappy & lightweight damping (eliminates sluggish drag/heavy inertia)
      smoothWheel: true,
      syncTouch: false, // 100% native responsive 120fps touch scroll on mobile/trackpads
      wheelMultiplier: 1.15, // Responsive distance per scroll tick
      touchMultiplier: 1,
      autoResize: true,
      allowNestedScroll: true,
    }),
    []
  );


  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={lenisOptions}
    >
      {children}
    </ReactLenis>
  );
}

export { useLenis };

