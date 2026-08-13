/**
 * Anikoto API helper for catalog series lookups.
 */
import { anikotoRateLimiter } from './rateLimiter';
import { getCached, setCached } from './cache';

const ANIKOTO_BASE_URL = typeof window !== 'undefined'
  ? '' // In browser, call /api/anikoto/...
  : (process.env.ANIKOTO_BASE_URL || 'https://anikotoapi.site');

export interface AnikotoSeries {
  id: string;
  name: string;
  poster: string;
  episodes: Array<{
    episode_no: number;
    episode_embed_id: string;
    title?: string;
  }>;
}

export async function getAnikotoSeries(seriesId: string): Promise<AnikotoSeries | null> {
  const cacheKey = `anikoto:series:${seriesId}`;
  const cached = getCached<AnikotoSeries>(cacheKey);
  if (cached) return cached;

  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/anikoto/series/${seriesId}`
    : `${ANIKOTO_BASE_URL}/series/${seriesId}`;

  try {
    const fetcher = async () => {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    };

    const data = isClient
      ? await fetcher()
      : await anikotoRateLimiter.schedule(fetcher);

    if (data) {
      setCached(cacheKey, data, 86400); // 24h cache
    }
    return data;
  } catch (err) {
    console.error('Anikoto series fetch error:', err);
    return null;
  }
}
