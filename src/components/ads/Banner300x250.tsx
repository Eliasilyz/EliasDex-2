'use client';

import React, { useMemo } from 'react';
import { ADS_CONFIG } from '@/lib/ads/config';
import { AdSlot } from './AdSlot';

interface Banner300x250Props {
  className?: string;
}

export const Banner300x250: React.FC<Banner300x250Props> = ({ className = '' }) => {
  if (!ADS_CONFIG.enabled) return null;

  const { key, scriptSrc, width, height } = ADS_CONFIG.banner300x250;

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
              overflow: hidden;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${key}',
              'format' : 'iframe',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="${scriptSrc}"></script>
        </body>
      </html>
    `.trim();
  }, [key, scriptSrc, width, height]);

  return (
    <AdSlot minHeight={height + 40} adLabel="ads" className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex justify-center w-full overflow-hidden">
        <iframe
          title="Advertisement"
          srcDoc={srcDoc}
          width={width}
          height={height}
          scrolling="no"
          frameBorder="0"
          className="border-0 overflow-hidden block"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
    </AdSlot>
  );
};
