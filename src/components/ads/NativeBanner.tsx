'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ADS_CONFIG } from '@/lib/ads/config';
import { AdSlot } from './AdSlot';

interface NativeBannerProps {
  className?: string;
}

export const NativeBanner: React.FC<NativeBannerProps> = ({ className = '' }) => {
  if (!ADS_CONFIG.enabled) return null;

  const { containerId, scriptSrc } = ADS_CONFIG.nativeBanner;
  const scriptInjectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInViewport || scriptInjectedRef.current) return;
    scriptInjectedRef.current = true;

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);

    return () => {
      scriptInjectedRef.current = false;
      const injectedScript = document.querySelector(`script[src="${scriptSrc}"]`);
      if (injectedScript) injectedScript.remove();
    };
  }, [isInViewport, scriptSrc]);

  useEffect(() => {
    return () => {
      if (scriptInjectedRef.current) {
        scriptInjectedRef.current = false;
        const injectedScript = document.querySelector(`script[src="${scriptSrc}"]`);
        if (injectedScript) injectedScript.remove();
      }
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [containerId, scriptSrc]);

  return (
    <AdSlot minHeight={120} adLabel="Iklan" className={className}>
      <div ref={containerRef}>
        <div id={containerId} />
      </div>
    </AdSlot>
  );
};

