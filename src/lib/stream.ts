/**
 * Stream URL builder and resolver for MegaPlay embeds.
 */
import { StreamSource } from '../types';
export type { StreamSource };

export const MEGAPLAY_BASE_URL =
  process.env.NEXT_PUBLIC_MEGAPLAY_BASE_URL ||
  process.env.MEGAPLAY_BASE_URL ||
  'https://megaplay.buzz';

export interface StreamServerOption {
  id: string;
  name: string;
  source: StreamSource;
  description: string;
}

export const STREAM_SERVERS: StreamServerOption[] = [
  {
    id: 'zoko',
    name: 'Zoko',
    source: 'zoko',
    description: 'Fast anime streaming server powered by Zoko Video (MAL ID)',
  },
  {
    id: 'megaplay-mal',
    name: 'MegaPlay (MAL)',
    source: 'mal',
    description: 'Primary high-speed HD stream resolved via MyAnimeList ID',
  },
  {
    id: 'megaplay-ani',
    name: 'MegaPlay (AniList)',
    source: 'ani',
    description: 'Secondary high-speed stream resolved via AniList ID',
  },
  {
    id: 'megaplay-s2',
    name: 'MegaPlay (Catalog)',
    source: 's-2',
    description: 'Catalog episode source via Anikoto mapping',
  },
];

/**
 * Builds the embed URL for iframe rendering
 */
export function buildStreamUrl(
  source: StreamSource,
  id: string | number,
  epNum: number,
  lang: 'sub' | 'dub' = 'sub',
  autoplay = false
): string {
  const cleanEp = Math.max(1, Math.floor(epNum));
  const rawBase = (MEGAPLAY_BASE_URL || 'https://megaplay.buzz').trim();
  const origin = rawBase.replace(/\/stream(\/.*)?$/i, '').replace(/\/+$/, '') || 'https://megaplay.buzz';
  const cleanId = String(id).replace(/^(stream\/(mal|ani|s-2|zoko)\/)+/i, '').replace(/^\/+/, '');
  const ap = autoplay ? '&autoplay=1' : '';

  switch (source) {
    case 'zoko':
      return `https://zokoanime.video/stream/mal/${cleanId}/${cleanEp}/${lang}?color=fb7185${ap}`;
    case 'mal':
      return `${origin}/stream/mal/${cleanId}/${cleanEp}/${lang}${ap ? '?' + ap.slice(1) : ''}`;
    case 'ani':
      return `${origin}/stream/ani/${cleanId}/${cleanEp}/${lang}${ap ? '?' + ap.slice(1) : ''}`;
    case 's-2':
      return `${origin}/stream/s-2/${cleanId}/${lang}${ap ? '?' + ap.slice(1) : ''}`;
    default:
      return `https://zokoanime.video/stream/mal/${cleanId}/${cleanEp}/${lang}?color=fb7185${ap}`;
  }
}

/**
 * Resolves embed ID for an anime title and episode.
 * Primary path: MAL id.
 */
export async function resolveEmbedId(
  malId: number,
  epNum: number,
  preferredSource: StreamSource = 'zoko'
): Promise<{ source: StreamSource; id: string | number }> {
  // Primary path: Direct MAL id
  if (preferredSource === 'zoko' || preferredSource === 'mal' || !preferredSource) {
    return { source: preferredSource || 'zoko', id: malId };
  }

  return { source: preferredSource, id: malId };
}
