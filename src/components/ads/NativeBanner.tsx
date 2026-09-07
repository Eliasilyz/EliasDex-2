'use client';

import React, { useMemo } from 'react';
import { ADS_CONFIG } from '@/lib/ads/config';
import { AdSlot } from './AdSlot';

interface NativeBannerProps {
  className?: string;
}

export const NativeBanner: React.FC<NativeBannerProps> = ({ className = '' }) => {
  if (!ADS_CONFIG.enabled) return null;

  const { containerId, scriptSrc } = ADS_CONFIG.nativeBanner;

  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100px;
            }
          </style>
        </head>
        <body>
          <script async="async" data-cfasync="false" src="${scriptSrc}"></script>
          <div id="${containerId}"></div>
        </body>
      </html>
    `.trim();
  }, [containerId, scriptSrc]);

  return (
    <AdSlot minHeight={140} adLabel="ads" className={className}>
      <div className="w-full overflow-hidden flex justify-center">
        <iframe
          title="Native Advertisement"
          srcDoc={srcDoc}
          width="100%"
          height="140"
          scrolling="no"
          frameBorder="0"
          className="border-0 overflow-hidden block w-full"
          style={{ minHeight: '120px' }}
        />
      </div>
    </AdSlot>
  );
};
