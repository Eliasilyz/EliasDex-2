'use client';

import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderSrc?: string;
}

// Low-resolution 1x1 transparent SVG placeholder data URI
const TRANSPARENT_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 1 1%22%2F%3E';

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  placeholderSrc = TRANSPARENT_PLACEHOLDER,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 ${containerClassName}`}>
        <Film className="w-8 h-8 mb-1" />
        <span className="text-[10px]">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={placeholderSrc}
      data-src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`lazyload ${className}`}
      {...props}
    />
  );
};
