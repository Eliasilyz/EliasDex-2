import { useEffect, useRef } from 'react';

export interface PlayerProgressEvent {
  currentTime: number;
  duration: number;
  progressPercent: number;
}

const ALLOWED_ORIGINS = [
  'https://zokoanime.video',
  'https://megaplay.buzz',
  'https://megaplay.shop',
];

export function usePlayerEvents(callbacks?: {
  onProgress?: (event: PlayerProgressEvent) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!ALLOWED_ORIGINS.includes(event.origin)) return;

      let data: any;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data || typeof data !== 'object') return;

      // ── Zoko events ────────────────────────────────────────────────
      // { type: "progress", payload: { currentTime, duration } }
      if (data.type === 'progress' && data.payload) {
        const { currentTime, duration } = data.payload;
        if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
          callbacksRef.current?.onProgress?.({
            currentTime,
            duration,
            progressPercent: (currentTime / duration) * 100,
          });
        }
      }

      // { type: "complete" }
      if (data.type === 'complete') {
        callbacksRef.current?.onEnded?.();
      }

      // { type: "error", payload: ... }
      if (data.type === 'error') {
        callbacksRef.current?.onError?.(data.payload ?? data);
      }

      // ── MegaPlay events ────────────────────────────────────────────
      // { event: "time", time, duration, percent }
      if (data.event === 'time' && typeof data.time === 'number') {
        callbacksRef.current?.onProgress?.({
          currentTime: data.time,
          duration: data.duration ?? 0,
          progressPercent: data.percent ?? (data.duration ? (data.time / data.duration) * 100 : 0),
        });
      }

      // { event: "complete" }
      if (data.event === 'complete') {
        callbacksRef.current?.onEnded?.();
      }

      // { event: "error" }
      if (data.event === 'error') {
        callbacksRef.current?.onError?.(data);
      }

      // { type: "watching-log", currentTime, duration }
      // MegaPlay's periodic progress ping — treat as progress
      if (data.type === 'watching-log' && typeof data.currentTime === 'number') {
        callbacksRef.current?.onProgress?.({
          currentTime: data.currentTime,
          duration: data.duration ?? 0,
          progressPercent: data.duration ? (data.currentTime / data.duration) * 100 : 0,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}
