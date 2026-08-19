/**
 * Unified Anime API Service
 * Orchestrates multi-source queries across Jikan (MyAnimeList), AniList (GraphQL),
 * and Offline Fallback Cache with automatic fallback resilience.
 */

import {
  Anime,
  AnimeEpisode,
  AnimeCharacterRole,
  AnimeStaffMember,
  AnimeRelation,
  AnimeExternalLink,
  AnimeThemeSongs,
  Genre,
  Pagination,
  SearchFilters,
} from '../types';
import * as jikanApi from './jikan';
import * as anilistApi from './anilist';
import {
  FALLBACK_ANIME_LIST,
  FALLBACK_GENRES,
  getFallbackSchedule,
  getFallbackAnimeById,
  generateFallbackEpisodes,
  getFallbackCharacters,
  getFallbackThemes,
  getFallbackStaff,
  getFallbackRelations,
  getFallbackExternalLinks,
  searchFallbackAnime,
} from './fallbackData';

export type DataSource = 'auto' | 'jikan' | 'anilist';

export interface UnifiedQueryOptions {
  source?: DataSource;
}

/**
 * Fetch Current Season Anime
 */
export async function getUnifiedSeasonNow(
  options?: UnifiedQueryOptions & { limit?: number; page?: number }
): Promise<{ data: Anime[]; pagination?: Pagination; source: 'jikan' | 'anilist' | 'fallback' }> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const res = await anilistApi.getAniListSeasonNow({ limit: options?.limit, page: options?.page });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'anilist' };
      }
    } catch (err) {
      console.warn('[AniList Season Error, falling back]', err);
    }
  }

  if (source === 'jikan') {
    try {
      const res = await jikanApi.getSeasonNow({ limit: options?.limit, page: options?.page });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'jikan' };
      }
    } catch (err) {
      console.warn('[Jikan Season Error, falling back]', err);
    }
  }

  // 'auto' mode: try AniList first (fast GraphQL & high res images), fallback to Jikan
  try {
    const res = await anilistApi.getAniListSeasonNow({ limit: options?.limit, page: options?.page });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'anilist' };
    }
  } catch {
    // Fallback to Jikan
  }

  try {
    const res = await jikanApi.getSeasonNow({ limit: options?.limit, page: options?.page });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'jikan' };
    }
  } catch {
    // Fallback to offline static data
  }

  return {
    data: FALLBACK_ANIME_LIST.slice(0, options?.limit || 12),
    pagination: { current_page: 1, has_next_page: false, last_visible_page: 1 },
    source: 'fallback',
  };
}

/**
 * Fetch Top / Trending Anime
 */
export async function getUnifiedTopAnime(
  options?: UnifiedQueryOptions & {
    filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'top_rated';
    page?: number;
    limit?: number;
    type?: string;
  }
): Promise<{ data: Anime[]; pagination?: Pagination; source: 'jikan' | 'anilist' | 'fallback' }> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const res = await anilistApi.getAniListTopAnime({
        filter: options?.filter,
        page: options?.page,
        limit: options?.limit,
        type: options?.type,
      });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'anilist' };
      }
    } catch (err) {
      console.warn('[AniList Top Anime Error, falling back]', err);
    }
  }

  if (source === 'jikan') {
    try {
      const jikanFilter = options?.filter === 'top_rated' ? undefined : options?.filter;
      const res = await jikanApi.getTopAnime({
        filter: jikanFilter,
        page: options?.page,
        limit: options?.limit,
        type: options?.type,
      });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'jikan' };
      }
    } catch (err) {
      console.warn('[Jikan Top Anime Error, falling back]', err);
    }
  }

  // 'auto' mode: try AniList first then Jikan
  try {
    const res = await anilistApi.getAniListTopAnime({
      filter: options?.filter,
      page: options?.page,
      limit: options?.limit,
      type: options?.type,
    });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'anilist' };
    }
  } catch {
    // Try Jikan
  }

  try {
    const jikanFilter = options?.filter === 'top_rated' ? undefined : options?.filter;
    const res = await jikanApi.getTopAnime({
      filter: jikanFilter,
      page: options?.page,
      limit: options?.limit,
      type: options?.type,
    });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'jikan' };
    }
  } catch {
    // Fallback
  }

  let list = [...FALLBACK_ANIME_LIST];
  if (options?.filter === 'airing') {
    list = list.filter(a => a.status === 'Currently Airing');
  }
  return {
    data: list.slice(0, options?.limit || 24),
    pagination: { current_page: 1, has_next_page: false, last_visible_page: 1 },
    source: 'fallback',
  };
}

/**
 * Fetch Anime Weekly Schedule
 */
export async function getUnifiedSchedule(
  options?: UnifiedQueryOptions & {
    filter?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ data: Anime[]; pagination?: Pagination; source: 'jikan' | 'anilist' | 'fallback' }> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const res = await anilistApi.getAniListSchedule({
        filter: options?.filter,
        page: options?.page,
        limit: options?.limit,
      });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'anilist' };
      }
    } catch (err) {
      console.warn('[AniList Schedule Error, falling back]', err);
    }
  }

  if (source === 'jikan') {
    try {
      const res = await jikanApi.getSchedule({
        filter: options?.filter,
        page: options?.page,
        limit: options?.limit,
      });
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'jikan' };
      }
    } catch (err) {
      console.warn('[Jikan Schedule Error, falling back]', err);
    }
  }

  // Auto mode: try AniList, fallback to Jikan
  try {
    const res = await anilistApi.getAniListSchedule({
      filter: options?.filter,
      page: options?.page,
      limit: options?.limit,
    });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'anilist' };
    }
  } catch {
    // try Jikan
  }

  try {
    const res = await jikanApi.getSchedule({
      filter: options?.filter,
      page: options?.page,
      limit: options?.limit,
    });
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'jikan' };
    }
  } catch {
    // fallback
  }

  return {
    data: getFallbackSchedule(options?.filter),
    pagination: { current_page: 1, has_next_page: false, last_visible_page: 1 },
    source: 'fallback',
  };
}

/**
 * Search Anime with multi-criteria filters
 */
export async function getUnifiedSearchAnime(
  query: string,
  params?: SearchFilters,
  options?: UnifiedQueryOptions
): Promise<{ data: Anime[]; pagination?: Pagination; source: 'jikan' | 'anilist' | 'fallback' }> {
  const source = options?.source || 'auto';
  const cleanQuery = (query || '').trim();

  if (source === 'anilist') {
    try {
      const res = await anilistApi.searchAniListAnime(cleanQuery, params);
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'anilist' };
      }
    } catch (err) {
      console.warn('[AniList Search Error, falling back]', err);
    }
  }

  if (source === 'jikan') {
    try {
      const res = await jikanApi.searchAnime(cleanQuery, params);
      if (res.data && res.data.length > 0) {
        return { ...res, source: 'jikan' };
      }
    } catch (err) {
      console.warn('[Jikan Search Error, falling back]', err);
    }
  }

  // In auto mode: try AniList first for searches as GraphQL handles instant keyword substring matching without Jikan's strict 3-char minimum
  try {
    const res = await anilistApi.searchAniListAnime(cleanQuery, params);
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'anilist' };
    }
  } catch {
    // Try Jikan
  }

  try {
    const res = await jikanApi.searchAnime(cleanQuery, params);
    if (res.data && res.data.length > 0) {
      return { ...res, source: 'jikan' };
    }
  } catch {
    // Fallback
  }

  const fallback = searchFallbackAnime(cleanQuery, params);
  return {
    data: fallback.data,
    pagination: fallback.pagination,
    source: 'fallback',
  };
}

/**
 * Fetch Detailed Anime Metadata
 */
export async function getUnifiedAnimeById(
  id: number,
  options?: UnifiedQueryOptions & { isMalId?: boolean }
): Promise<{ data: Anime; source: 'jikan' | 'anilist' | 'fallback' }> {
  const source = options?.source || 'auto';
  const isMal = options?.isMalId !== false;

  const isValidAnime = (a?: Anime | null): boolean => {
    return !!(a && a.title && !a.title.startsWith('Anime #') && a.title !== 'Anime');
  };

  if (source === 'anilist') {
    try {
      const anime = await anilistApi.getAniListAnimeById(id, isMal);
      if (isValidAnime(anime)) return { data: anime, source: 'anilist' };
    } catch (err) {
      console.warn('[AniList Detail Error, falling back to Jikan]', err);
    }
  }

  if (source === 'jikan') {
    try {
      const anime = await jikanApi.getAnimeById(id);
      if (isValidAnime(anime)) return { data: anime, source: 'jikan' };
    } catch (err) {
      console.warn('[Jikan Detail Error, falling back to AniList]', err);
    }
  }

  // Auto mode: try Jikan first, then AniList, then static fallback
  try {
    const anime = await jikanApi.getAnimeById(id);
    if (isValidAnime(anime)) return { data: anime, source: 'jikan' };
  } catch {
    // Try AniList
  }

  try {
    const anime = await anilistApi.getAniListAnimeById(id, isMal);
    if (isValidAnime(anime)) return { data: anime, source: 'anilist' };
  } catch {
    // Try hardcoded fallback dataset
  }

  const staticFallback = getFallbackAnimeById(id);
  if (staticFallback) {
    return { data: staticFallback, source: 'fallback' };
  }

  // Last resort placeholder if all APIs fail
  return {
    data: {
      mal_id: Number(id),
      title: `Anime #${id}`,
      title_english: `Anime #${id}`,
      synopsis: 'Detailed information for this anime is currently loading or unavailable. Select your preferred stream server above to start watching.',
      type: 'TV',
      episodes: 24,
      status: 'Finished Airing',
      score: 8.0,
      images: {
        jpg: {
          image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          large_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        },
        webp: {
          image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          large_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        },
      },
      genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 10, name: 'Fantasy' }],
      studios: [{ mal_id: 1, name: 'Animation Studio' }],
    },
    source: 'fallback',
  };
}

/**
 * Fetch Anime Episodes
 */
export async function getUnifiedEpisodes(
  malId: number,
  options?: UnifiedQueryOptions & { page?: number }
): Promise<{ data: AnimeEpisode[]; pagination?: Pagination }> {
  const source = options?.source || 'auto';
  const page = options?.page || 1;

  if (source === 'jikan') {
    try {
      const res = await jikanApi.getAnimeEpisodes(malId, page);
      if (res.data && res.data.length > 0) return res;
    } catch (err) {
      console.warn('[Jikan Episodes Error]', err);
    }
  }

  // Primary: Try AniList GraphQL API (Fast, high-rate-limit, accurate episode list)
  try {
    const list = await anilistApi.getAniListEpisodes(malId, true);
    if (list && list.length > 0) return { data: list };
  } catch (err) {
    console.warn('[AniList Episodes Error, trying Jikan]', err);
  }

  // Failover: Try Jikan API
  try {
    const res = await jikanApi.getAnimeEpisodes(malId, page);
    if (res.data && res.data.length > 0) return res;
  } catch (err) {
    console.warn('[Jikan Episodes Error, using Fallback]', err);
  }

  // Fallback Generator
  return { data: generateFallbackEpisodes(malId, 12) };
}

/**
 * Fetch Anime Genres
 */
export async function getUnifiedGenres(
  options?: UnifiedQueryOptions
): Promise<Genre[]> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    return await anilistApi.getAniListGenres();
  }

  try {
    return await jikanApi.getAnimeGenres();
  } catch {
    return await anilistApi.getAniListGenres();
  }
}

/**
 * Fetch Anime Characters & Cast
 */
export async function getUnifiedCharacters(
  malId: number,
  options?: UnifiedQueryOptions
): Promise<AnimeCharacterRole[]> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const list = await anilistApi.getAniListCharacters(malId, true);
      if (list && list.length > 0) return list;
    } catch (err) {
      console.warn('[AniList Characters Error]', err);
    }
  }

  try {
    const list = await jikanApi.getAnimeCharacters(malId);
    if (list && list.length > 0) return list;
  } catch {
    // fallback to AniList
  }

  try {
    const list = await anilistApi.getAniListCharacters(malId, true);
    if (list && list.length > 0) return list;
  } catch {
    // fallback
  }

  return getFallbackCharacters(malId);
}

/**
 * Fetch Anime Production Staff
 */
export async function getUnifiedStaff(
  malId: number,
  options?: UnifiedQueryOptions
): Promise<AnimeStaffMember[]> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const list = await anilistApi.getAniListStaff(malId, true);
      if (list && list.length > 0) return list;
    } catch (err) {
      console.warn('[AniList Staff Error]', err);
    }
  }

  try {
    const list = await jikanApi.getAnimeStaff(malId);
    if (list && list.length > 0) return list;
  } catch {
    // fallback to AniList
  }

  try {
    const list = await anilistApi.getAniListStaff(malId, true);
    if (list && list.length > 0) return list;
  } catch {
    // fallback
  }

  return getFallbackStaff(malId);
}

/**
 * Fetch Anime Recommendations
 */
export async function getUnifiedRecommendations(
  malId: number,
  options?: UnifiedQueryOptions
): Promise<Anime[]> {
  const source = options?.source || 'auto';

  if (source === 'anilist') {
    try {
      const list = await anilistApi.getAniListRecommendations(malId, true);
      if (list && list.length > 0) return list;
    } catch (err) {
      console.warn('[AniList Recommendations Error]', err);
    }
  }

  try {
    const list = await jikanApi.getAnimeRecommendations(malId);
    if (list && list.length > 0) return list;
  } catch {
    // try AniList
  }

  try {
    const list = await anilistApi.getAniListRecommendations(malId, true);
    if (list && list.length > 0) return list;
  } catch {
    // fallback
  }

  return FALLBACK_ANIME_LIST.filter(a => a.mal_id !== malId).slice(0, 8);
}

/**
 * Fetch Anime Franchise Relations
 */
export async function getUnifiedRelations(
  malId: number,
  animeObject?: Anime | null
): Promise<AnimeRelation[]> {
  return await jikanApi.getAnimeRelations(malId, animeObject);
}

/**
 * Fetch Anime External Links
 */
export async function getUnifiedExternalLinks(
  malId: number,
  animeObject?: Anime | null
): Promise<AnimeExternalLink[]> {
  return await jikanApi.getAnimeExternalLinks(malId, animeObject);
}

/**
 * Fetch Anime Theme Songs (OP & ED)
 */
export async function getUnifiedThemes(
  malId: number,
  animeObject?: Anime | null
): Promise<AnimeThemeSongs> {
  return await jikanApi.getAnimeThemes(malId, animeObject);
}
