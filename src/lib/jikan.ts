import {
  JikanAnimeListResponseSchema,
  JikanAnimeDetailResponseSchema,
  JikanEpisodesResponseSchema,
  JikanGenresResponseSchema,
  JikanCharactersResponseSchema,
  JikanStaffResponseSchema,
  JikanThemesResponseSchema,
  JikanRelationsResponseSchema,
  JikanExternalLinksResponseSchema,
  Anime,
  AnimeEpisode,
  Genre,
  Pagination,
  SearchFilters,
  AnimeCharacterRole,
  AnimeStaffMember,
  AnimeThemeSongs,
  AnimeRelation,
  AnimeExternalLink,
} from '../types';
import { jikanRateLimiter } from './rateLimiter';
import { getCached, setCached } from './cache';
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

const JIKAN_BASE_URL = typeof window !== 'undefined'
  ? '' // In browser, use relative proxy URL: /api/jikan/...
  : (process.env.JIKAN_BASE_URL || 'https://api.jikan.moe/v4');

/**
 * Low-level Jikan fetch wrapper with cache, rate-limit, fallback resilience, and retries.
 */
export async function fetchJikan<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `${cleanPath}?${queryString}` : cleanPath;
  const cacheKey = `jikan:${endpoint}`;

  // Check cache first
  const cached = getCached<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Determine URL: in client browser call internal proxy /api/jikan/..., on server call upstream Jikan
  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/jikan/${endpoint}`
    : `${JIKAN_BASE_URL}/${endpoint}`;

  const executeFetch = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      // Guard against HTML / non-JSON responses
      if (!text || text.startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<!doctype') || !contentType.includes('json')) {
        throw new Error(`Invalid non-JSON response from ${endpoint}`);
      }

      const data = JSON.parse(text);

      if (!res.ok) {
        if (res.status === 429) {
          const error = new Error(`Jikan Rate Limited (429) on ${endpoint}`);
          (error as any).status = 429;
          throw error;
        }
        if (res.status === 404) {
          const error = new Error(`Anime resource not found: ${endpoint}`);
          (error as any).status = 404;
          throw error;
        }
        // If data contains fallback or error info
        if (data && data.data) {
          return data as T;
        }
        throw new Error(data?.error || `Jikan API error ${res.status}`);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let data: T;
    if (!isClient) {
      data = await jikanRateLimiter.schedule(executeFetch);
    } else {
      data = await executeFetch();
    }

    // Cache successful response
    if (data && ttlSeconds > 0) {
      setCached(cacheKey, data, ttlSeconds);
    }

    return data;
  } catch (err: any) {
    // Graceful fallback response
    if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
      console.log(`[Jikan Data] Using fallback for ${endpoint}`);
    }
    
    // Return structured fallback based on endpoint type
    if (cleanPath.startsWith('seasons/now')) {
      return { data: FALLBACK_ANIME_LIST.slice(0, 12), pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 } } as unknown as T;
    }
    if (cleanPath.startsWith('top/anime')) {
      return { data: FALLBACK_ANIME_LIST, pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 } } as unknown as T;
    }
    if (cleanPath.startsWith('schedules')) {
      const day = params?.filter as string | undefined;
      return { data: getFallbackSchedule(day), pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 } } as unknown as T;
    }
    if (cleanPath.startsWith('genres/anime')) {
      return { data: FALLBACK_GENRES } as unknown as T;
    }
    if (cleanPath.includes('/characters')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackCharacters(malId) } as unknown as T;
    }
    if (cleanPath.includes('/themes')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackThemes(malId) } as unknown as T;
    }
    if (cleanPath.includes('/staff')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackStaff(malId) } as unknown as T;
    }
    if (cleanPath.includes('/relations')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackRelations(malId) } as unknown as T;
    }
    if (cleanPath.includes('/external')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackExternalLinks(malId) } as unknown as T;
    }
    if (cleanPath.includes('/episodes')) {
      // Return empty — EpisodeList will use anime.episodes + anime.status to show correct count
      return { data: [], pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 } } as unknown as T;
    }
    if (cleanPath.startsWith('anime/')) {
      const malId = parseInt(cleanPath.split('/')[1], 10) || 1;
      return { data: getFallbackAnimeById(malId) } as unknown as T;
    }
    if (cleanPath === 'anime') {
      return { data: FALLBACK_ANIME_LIST, pagination: { last_visible_page: 1, has_next_page: false, current_page: 1 } } as unknown as T;
    }

    return { data: [] } as unknown as T;
  }
}

/**
 * Get anime by MAL ID (24h cache)
 */
export async function getAnimeById(malId: number): Promise<Anime> {
  try {
    const json = await fetchJikan<any>(`anime/${malId}/full`, undefined, 86400);
    const parsed = JikanAnimeDetailResponseSchema.safeParse(json);
    if (parsed.success && parsed.data?.data) {
      return parsed.data.data;
    }
    if (json?.data && json.data.title && !json.data.title.startsWith('Anime #')) {
      return json.data;
    }
    const fb = getFallbackAnimeById(malId);
    if (fb) return fb;
    throw new Error(`Anime with ID ${malId} not found in Jikan response`);
  } catch (err) {
    const fb = getFallbackAnimeById(malId);
    if (fb) return fb;
    throw err;
  }
}

/**
 * Get current season anime (6h cache)
 */
export async function getSeasonNow(params?: { limit?: number; page?: number }): Promise<{ data: Anime[]; pagination?: Pagination }> {
  try {
    const json = await fetchJikan<any>('seasons/now', {
      limit: params?.limit || 24,
      page: params?.page || 1,
    }, 21600);

    const parsed = JikanAnimeListResponseSchema.safeParse(json);
    if (!parsed.success) {
      return { data: json?.data || FALLBACK_ANIME_LIST.slice(0, 12), pagination: json?.pagination };
    }
    return parsed.data;
  } catch {
    return { data: FALLBACK_ANIME_LIST.slice(0, 12) };
  }
}

/**
 * Get top anime by popularity/airing/favorite (6h cache)
 */
export async function getTopAnime(params?: {
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite';
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{ data: Anime[]; pagination?: Pagination }> {
  try {
    const json = await fetchJikan<any>('top/anime', {
      filter: params?.filter || 'bypopularity',
      page: params?.page || 1,
      limit: params?.limit || 24,
      type: params?.type,
    }, 21600);

    const parsed = JikanAnimeListResponseSchema.safeParse(json);
    if (!parsed.success) {
      return { data: json?.data || FALLBACK_ANIME_LIST, pagination: json?.pagination };
    }
    return parsed.data;
  } catch {
    return { data: FALLBACK_ANIME_LIST };
  }
}

/**
 * Get anime weekly schedule (6h cache)
 */
export async function getSchedule(params?: {
  filter?: string; // 'monday', 'tuesday', 'wednesday', etc.
  page?: number;
  limit?: number;
}): Promise<{ data: Anime[]; pagination?: Pagination }> {
  try {
    const json = await fetchJikan<any>('schedules', {
      filter: params?.filter,
      page: params?.page || 1,
      limit: params?.limit || 25,
      sfw: true,
    }, 21600);

    const parsed = JikanAnimeListResponseSchema.safeParse(json);
    if (!parsed.success) {
      return { data: json?.data || getFallbackSchedule(params?.filter), pagination: json?.pagination };
    }
    return parsed.data;
  } catch {
    return { data: getFallbackSchedule(params?.filter) };
  }
}

/**
 * Search anime with multiple filters (5min cache)
 */
export async function searchAnime(
  query: string,
  params?: SearchFilters
): Promise<{ data: Anime[]; pagination?: Pagination }> {
  const cleanQuery = (query || '').trim();

  // If query is 1 or 2 characters, Jikan API returns 400 ValidationException.
  // Directly search fallback dataset to provide instantaneous, error-free results.
  if (cleanQuery && cleanQuery.length < 3 && !params?.genres && !params?.type && !params?.status) {
    const fallback = searchFallbackAnime(cleanQuery, params);
    return fallback;
  }

  // Construct valid Jikan search query parameters
  const requestParams: Record<string, any> = {
    page: params?.page || 1,
    limit: params?.limit || 24,
    sfw: true,
  };

  if (cleanQuery && cleanQuery.length >= 3) {
    requestParams.q = cleanQuery;
  }
  if (params?.genres) {
    requestParams.genres = params.genres;
  }
  if (params?.type) {
    requestParams.type = params.type;
  }
  if (params?.status) {
    requestParams.status = params.status;
  }
  if (params?.rating) {
    requestParams.rating = params.rating;
  }
  if (params?.min_score) {
    requestParams.min_score = params.min_score;
  }

  // If user searched for query and did not explicitly pick another sort, let Jikan use relevance
  if (params?.order_by && params.order_by !== 'popularity') {
    requestParams.order_by = params.order_by;
    requestParams.sort = params.sort || 'desc';
  } else if (!cleanQuery) {
    requestParams.order_by = params?.order_by || 'popularity';
    requestParams.sort = params?.sort || 'asc';
  }

  try {
    const json = await fetchJikan<any>('anime', requestParams, 300);

    if (json && Array.isArray(json.data) && json.data.length > 0) {
      const parsed = JikanAnimeListResponseSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      // Return raw array if Zod schema was overly strict
      return { data: json.data, pagination: json.pagination };
    }

    // If upstream returned empty array or degraded response, test fallback dataset
    if (cleanQuery) {
      const fallback = searchFallbackAnime(cleanQuery, params);
      if (fallback.data.length > 0) {
        return fallback;
      }
    }

    return { data: json?.data || [], pagination: json?.pagination };
  } catch (err) {
    console.warn('[searchAnime error, using fallback filter]', err);
    return searchFallbackAnime(cleanQuery, params);
  }
}

/**
 * Get anime episodes list (6h cache)
 */
export async function getAnimeEpisodes(
  malId: number,
  page: number = 1
): Promise<{ data: AnimeEpisode[]; pagination?: Pagination }> {
  try {
    const json = await fetchJikan<any>(`anime/${malId}/episodes`, { page }, 21600);
    const parsed = JikanEpisodesResponseSchema.safeParse(json);
    if (!parsed.success) {
      const data = json?.data && Array.isArray(json.data) && json.data.length > 0
        ? json.data
        : generateFallbackEpisodes(malId, 12);
      return { data, pagination: json?.pagination };
    }
    if (!parsed.data.data || parsed.data.data.length === 0) {
      return { data: generateFallbackEpisodes(malId, 12) };
    }
    return parsed.data;
  } catch {
    return { data: generateFallbackEpisodes(malId, 12) };
  }
}


/**
 * Get anime genres list (24h cache)
 */
export async function getAnimeGenres(): Promise<Genre[]> {
  try {
    const json = await fetchJikan<any>('genres/anime', undefined, 86400);
    const parsed = JikanGenresResponseSchema.safeParse(json);
    if (!parsed.success) {
      return (json?.data || FALLBACK_GENRES) as Genre[];
    }
    return parsed.data.data;
  } catch {
    return FALLBACK_GENRES;
  }
}

/**
 * Get anime recommendations (6h cache)
 */
export async function getAnimeRecommendations(malId: number): Promise<Anime[]> {
  try {
    const json = await fetchJikan<any>(`anime/${malId}/recommendations`, undefined, 21600);
    if (!json?.data || !Array.isArray(json.data)) {
      return FALLBACK_ANIME_LIST.filter(a => a.mal_id !== malId).slice(0, 8);
    }
    return json.data.slice(0, 12).map((item: any) => ({
      mal_id: item.entry?.mal_id,
      title: item.entry?.title,
      images: item.entry?.images,
      url: item.entry?.url,
      type: 'TV',
    })) as Anime[];
  } catch {
    return FALLBACK_ANIME_LIST.filter(a => a.mal_id !== malId).slice(0, 8);
  }
}

/**
 * Get anime characters & voice actors (24h cache)
 */
export async function getAnimeCharacters(malId: number): Promise<AnimeCharacterRole[]> {
  try {
    const json = await fetchJikan<any>(`anime/${malId}/characters`, undefined, 86400);
    const parsed = JikanCharactersResponseSchema.safeParse(json);
    if (parsed.success && parsed.data.data.length > 0) {
      return parsed.data.data;
    }
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return getFallbackCharacters(malId);
  } catch {
    return getFallbackCharacters(malId);
  }
}

/**
 * Get anime theme songs - Openings & Endings (24h cache)
 */
export async function getAnimeThemes(malId: number, animeObject?: Anime | null): Promise<AnimeThemeSongs> {
  if (animeObject?.theme && (animeObject.theme.openings?.length || animeObject.theme.endings?.length)) {
    return {
      openings: animeObject.theme.openings || [],
      endings: animeObject.theme.endings || [],
    };
  }

  try {
    const json = await fetchJikan<any>(`anime/${malId}/themes`, undefined, 86400);
    const parsed = JikanThemesResponseSchema.safeParse(json);
    if (parsed.success && parsed.data.data) {
      const { openings = [], endings = [] } = parsed.data.data;
      if (openings.length > 0 || endings.length > 0) {
        return { openings, endings };
      }
    }
    if (json?.data?.openings || json?.data?.endings) {
      return {
        openings: json.data.openings || [],
        endings: json.data.endings || [],
      };
    }
    return getFallbackThemes(malId);
  } catch {
    return getFallbackThemes(malId);
  }
}

/**
 * Get anime production staff (24h cache)
 */
export async function getAnimeStaff(malId: number): Promise<AnimeStaffMember[]> {
  try {
    const json = await fetchJikan<any>(`anime/${malId}/staff`, undefined, 86400);
    const parsed = JikanStaffResponseSchema.safeParse(json);
    if (parsed.success && parsed.data.data.length > 0) {
      return parsed.data.data;
    }
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return getFallbackStaff(malId);
  } catch {
    return getFallbackStaff(malId);
  }
}

/**
 * Get anime franchise relations (prequels, sequels, spin-offs) (24h cache)
 */
export async function getAnimeRelations(malId: number, animeObject?: Anime | null): Promise<AnimeRelation[]> {
  if (animeObject?.relations && animeObject.relations.length > 0) {
    return animeObject.relations;
  }

  try {
    const json = await fetchJikan<any>(`anime/${malId}/relations`, undefined, 86400);
    const parsed = JikanRelationsResponseSchema.safeParse(json);
    if (parsed.success && parsed.data.data.length > 0) {
      return parsed.data.data;
    }
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return getFallbackRelations(malId);
  } catch {
    return getFallbackRelations(malId);
  }
}

/**
 * Get anime external links (24h cache)
 */
export async function getAnimeExternalLinks(malId: number, animeObject?: Anime | null): Promise<AnimeExternalLink[]> {
  if (animeObject?.external && animeObject.external.length > 0) {
    return animeObject.external;
  }

  try {
    const json = await fetchJikan<any>(`anime/${malId}/external`, undefined, 86400);
    const parsed = JikanExternalLinksResponseSchema.safeParse(json);
    if (parsed.success && parsed.data.data.length > 0) {
      return parsed.data.data;
    }
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return getFallbackExternalLinks(malId);
  } catch {
    return getFallbackExternalLinks(malId);
  }
}
