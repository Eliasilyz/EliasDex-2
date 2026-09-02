import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Maximize, AlertTriangle, ExternalLink, Loader2, Play } from 'lucide-react';
import { usePlayerEvents } from './usePlayerEvents';

interface PlayerFrameProps {
  src: string;
  title?: string;
  onEnded?: () => void;
  onProgress?: (event: any) => void;
  className?: string;
}

/**
 * Returns sandbox attribute value for the iframe.
 * MegaPlay hosts reject sandboxed iframes ("Sandboxed our player is not allowed"),
 * so we return undefined (no sandbox) for those. Other sources get the restrictive sandbox.
 */
function getIframeSandbox(streamUrl: string): string | undefined {
  try {
    const hostname = new URL(streamUrl).hostname;
    if (hostname.includes('megaplay')) return undefined;
  } catch { /* invalid URL, fall through to default sandbox */ }
  return 'allow-scripts allow-same-origin allow-forms';
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
  const [unlocked, setUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const needsGuard = getIframeSandbox(src) === undefined;

  // Re-trigger loading when src changes; re-lock guard for unsandboxed sources
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    if (needsGuard) setUnlocked(false);
  }, [src, key, needsGuard]);

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
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-ink-700 shadow-2xl group/player ${className}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-canvas/90 backdrop-blur-sm text-ink-300 gap-3 pointer-events-none">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-medium text-ink-500">Loading player stream...</p>
        </div>
      )}

      {/* Error Notice */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-canvas p-6 text-center text-ink-300 gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h4 className="text-base font-bold text-surface-primary">Stream temporarily unavailable</h4>
          <p className="text-xs text-ink-500 max-w-sm">
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
              className="px-4 py-2 bg-ink-700 hover:bg-ink-500 text-surface-primary text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Embed Iframe
        sandbox: MegaPlay rejects sandboxed iframes, so getIframeSandbox returns undefined for megaplay hosts.
        For other sources: allow-scripts (player JS), allow-same-origin (player DOM/cookies), allow-forms (internal settings forms).
        Blocked: allow-popups (ads), allow-top-navigation (redirects), allow-modals.
        referrerPolicy: no-referrer — prevents player from leaking page URL upstream. */}
      <iframe
        key={key}
        ref={iframeRef}
        src={src}
        title={title}
        className="w-full h-full border-0 absolute inset-0"
        sandbox={getIframeSandbox(src)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Click-guard overlay for unsandboxed sources (MegaPlay).
          Since we can't sandbox these hosts, this transparent overlay intercepts
          the first click so the user explicitly opts in before the iframe receives input.
          This prevents accidental ad clicks / redirect triggers on load. */}
      {needsGuard && !unlocked && !isLoading && (
        <button
          type="button"
          onClick={() => setUnlocked(true)}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-white gap-3 cursor-pointer transition-opacity hover:bg-black/60"
          aria-label="Click to enable player"
        >
          <div className="w-16 h-16 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Play className="w-7 h-7 ml-1" fill="currentColor" />
          </div>
          <p className="text-sm font-semibold">Click to play</p>
          <p className="text-xs text-ink-400">This prevents unwanted popups</p>
        </button>
      )}

      {/* Quick Player Action Overlay on Top Right (Hover) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-0 group-hover/player:opacity-100 transition-opacity bg-surface-canvas/85 backdrop-blur-md p-1 rounded-xl border border-ink-500/60 shadow-lg">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 text-ink-300 hover:text-white rounded-lg hover:bg-ink-700 transition-colors cursor-pointer"
          title="Open Stream in New Tab"
          aria-label="Open in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={handleReload}
          className="p-1.5 text-ink-300 hover:text-white rounded-lg hover:bg-ink-700 transition-colors cursor-pointer"
          title="Reload Player Stream"
          aria-label="Reload Player"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="p-1.5 text-ink-300 hover:text-white rounded-lg hover:bg-ink-700 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
          aria-label="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
