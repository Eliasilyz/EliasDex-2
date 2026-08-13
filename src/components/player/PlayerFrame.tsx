import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Maximize, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { usePlayerEvents } from './usePlayerEvents';

interface PlayerFrameProps {
  src: string;
  title?: string;
  onEnded?: () => void;
  onProgress?: (event: any) => void;
  className?: string;
}

export const PlayerFrame: React.FC<PlayerFrameProps> = ({
  src,
  title = 'Anime Player',
  onEnded,
  onProgress,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Re-trigger loading when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src, key]);

  usePlayerEvents({
    onEnded,
    onProgress,
    onError: (err) => {
      console.warn('Player event error:', err);
    },
  });

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.warn('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn('Error attempting to exit full-screen mode:', err);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group/player ${className}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm text-zinc-300 gap-3 pointer-events-none">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-medium text-zinc-400">Loading player stream...</p>
        </div>
      )}

      {/* Error Notice */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-300 gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h4 className="text-base font-bold text-white">Stream temporarily unavailable</h4>
          <p className="text-xs text-zinc-400 max-w-sm">
            The video source could not be loaded. Try switching to a backup server, reload, or open directly in a new tab.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReload}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Reload Player
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Embed Iframe - sandbox attribute removed to prevent player restriction */}
      <iframe
        key={key}
        ref={iframeRef}
        src={src}
        title={title}
        className="w-full h-full border-0 absolute inset-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Quick Player Action Overlay on Top Right (Hover) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-0 group-hover/player:opacity-100 transition-opacity bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-700/60 shadow-lg">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Open Stream in New Tab"
          aria-label="Open in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={handleReload}
          className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Reload Player Stream"
          aria-label="Reload Player"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
          aria-label="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
