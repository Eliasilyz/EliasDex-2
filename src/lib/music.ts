import { MusicTrack } from '../types';

export interface MusicSearchResult {
  videoId: string | null;
  query: string;
  title: string;
  thumbnailUrl: string | null;
  embedUrl: string;
}

/**
 * Search for an anime theme song video/audio stream via server proxy or client fallback
 */
export async function searchThemeSong(query: string): Promise<MusicSearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      videoId: null,
      query: '',
      title: '',
      thumbnailUrl: null,
      embedUrl: '',
    };
  }

  try {
    const response = await fetch(`/api/music/search?q=${encodeURIComponent(cleanQuery)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.embedUrl) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Music API Error]', err);
  }

  // Resilient fallback to YouTube search query embed
  return {
    videoId: null,
    query: cleanQuery,
    title: cleanQuery,
    thumbnailUrl: null,
    embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(cleanQuery)}&autoplay=1`,
  };
}
