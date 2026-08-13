import { useEffect } from 'react';

export interface PlayerProgressEvent {
  currentTime?: number;
  duration?: number;
  progressPercent?: number;
}

export function usePlayerEvents(callbacks?: {
  onProgress?: (event: PlayerProgressEvent) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if desired or parse payload
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        if (data.event === 'progress' || data.type === 'progress') {
          callbacks?.onProgress?.({
            currentTime: data.currentTime || data.time,
            duration: data.duration,
            progressPercent: data.percentage || (data.currentTime && data.duration ? (data.currentTime / data.duration) * 100 : 0),
          });
        }

        if (data.event === 'ended' || data.type === 'ended' || data.event === 'complete') {
          callbacks?.onEnded?.();
        }

        if (data.event === 'error' || data.type === 'error') {
          callbacks?.onError?.(data);
        }
      } catch {
        // Non-JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [callbacks]);
}
