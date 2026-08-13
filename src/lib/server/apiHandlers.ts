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
} from '@/lib/fallbackData';

export function getJikanFallbackResponse(
  rawPath: string,
  queryParams: Record<string, string | string[] | undefined>,
): unknown {
  if (rawPath.startsWith('seasons/now')) {
    return {
      data: FALLBACK_ANIME_LIST.slice(0, 12),
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: 12, total: 12, per_page: 12 },
      },
    };
  }

  if (rawPath.startsWith('top/anime')) {
    const filter = queryParams.filter;
    let list = [...FALLBACK_ANIME_LIST];
    if (filter === 'airing') {
      list = list.filter((a) => a.status === 'Currently Airing');
    }
    return {
      data: list,
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: list.length, total: list.length, per_page: 24 },
      },
    };
  }

  if (rawPath.startsWith('schedules')) {
    const filter = queryParams.filter;
    const items = getFallbackSchedule(typeof filter === 'string' ? filter : undefined);
    return {
      data: items,
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: items.length, total: items.length, per_page: 25 },
      },
    };
  }

  if (rawPath.startsWith('genres/anime')) {
    return { data: FALLBACK_GENRES };
  }

  const epMatch = rawPath.match(/^anime\/(\d+)\/episodes/);
  if (epMatch) {
    const malId = parseInt(epMatch[1], 10);
    const episodes = generateFallbackEpisodes(malId, 24);
    return {
      data: episodes,
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: episodes.length, total: episodes.length, per_page: 100 },
      },
    };
  }

  const charMatch = rawPath.match(/^anime\/(\d+)\/characters/);
  if (charMatch) {
    return { data: getFallbackCharacters(parseInt(charMatch[1], 10)) };
  }

  const themeMatch = rawPath.match(/^anime\/(\d+)\/themes/);
  if (themeMatch) {
    return { data: getFallbackThemes(parseInt(themeMatch[1], 10)) };
  }

  const staffMatch = rawPath.match(/^anime\/(\d+)\/staff/);
  if (staffMatch) {
    return { data: getFallbackStaff(parseInt(staffMatch[1], 10)) };
  }

  const relMatch = rawPath.match(/^anime\/(\d+)\/relations/);
  if (relMatch) {
    return { data: getFallbackRelations(parseInt(relMatch[1], 10)) };
  }

  const extMatch = rawPath.match(/^anime\/(\d+)\/external/);
  if (extMatch) {
    return { data: getFallbackExternalLinks(parseInt(extMatch[1], 10)) };
  }

  const recMatch = rawPath.match(/^anime\/(\d+)\/recommendations/);
  if (recMatch) {
    const malId = parseInt(recMatch[1], 10);
    const recs = FALLBACK_ANIME_LIST.filter((a) => a.mal_id !== malId)
      .slice(0, 8)
      .map((entry) => ({
        entry: {
          mal_id: entry.mal_id,
          url: `https://myanimelist.net/anime/${entry.mal_id}`,
          images: entry.images,
          title: entry.title,
        },
      }));
    return { data: recs };
  }

  const animeMatch = rawPath.match(/^anime\/(\d+)/);
  if (animeMatch) {
    const fb = getFallbackAnimeById(parseInt(animeMatch[1], 10));
    if (fb) return { data: fb };
    return null;
  }

  if (rawPath === 'anime' || rawPath.startsWith('anime?') || rawPath.startsWith('anime/')) {
    return searchFallbackAnime(
      typeof queryParams.q === 'string' ? queryParams.q : undefined,
      queryParams,
    );
  }

  return {
    data: FALLBACK_ANIME_LIST,
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: {
        count: FALLBACK_ANIME_LIST.length,
        total: FALLBACK_ANIME_LIST.length,
        per_page: 24,
      },
    },
  };
}

export const JIKAN_BASE_URL = process.env.JIKAN_BASE_URL || 'https://api.jikan.moe/v4';
export const ANIKOTO_BASE_URL = process.env.ANIKOTO_BASE_URL || 'https://anikotoapi.site';

const inFlightJikan = new Map<string, Promise<unknown>>();

function getJikanCacheTtl(rawPath: string, hasSearchQuery: boolean): number {
  if (rawPath.startsWith('seasons/') || rawPath.startsWith('top/') || rawPath.startsWith('schedules')) {
    return 21600;
  }
  if (rawPath.startsWith('anime/') && rawPath.includes('/episodes')) {
    return 21600;
  }
  if (rawPath.startsWith('anime/')) {
    return 86400;
  }
  if (rawPath.startsWith('genres/')) {
    return 86400;
  }
  if (rawPath.startsWith('anime') && hasSearchQuery) {
    return 300;
  }
  return 3600;
}

export async function handleJikanProxy(
  rawPath: string,
  queryParams: Record<string, string | string[] | undefined>,
  search: string,
) {
  const { getCached, setCached } = await import('@/lib/cache');
  const { jikanRateLimiter } = await import('@/lib/rateLimiter');

  const fullEndpoint = `${rawPath}${search}`;
  const cacheKey = `jikan:${fullEndpoint}`;
  const hasSearchQuery = typeof queryParams.q === 'string' && queryParams.q.length > 0;
  const ttlSeconds = getJikanCacheTtl(rawPath, hasSearchQuery);

  const cached = getCached(cacheKey);
  if (cached) {
    return { body: cached, headers: { 'X-Cache': 'HIT' } };
  }

  if (inFlightJikan.has(cacheKey)) {
    try {
      const result = await inFlightJikan.get(cacheKey)!;
      return { body: result, headers: { 'X-Cache': 'COALESCED' } };
    } catch {
      // fall through
    }
  }

  const targetUrl = `${JIKAN_BASE_URL.replace(/\/+$/, '')}/${fullEndpoint.replace(/^\/+/, '')}`;

  const executeFetch = async () => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeoutMs = attempt === 0 ? 8000 : 12000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const upstreamRes = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AnimeStreamApp/2.0 (web; compatible)',
          },
        });

        clearTimeout(timeoutId);

        if (
          (upstreamRes.status === 429 || upstreamRes.status === 504 || upstreamRes.status === 503) &&
          attempt < 2
        ) {
          const backoff = (attempt + 1) * 900 + Math.floor(Math.random() * 400);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        if (!upstreamRes.ok) {
          const error = new Error(`Jikan upstream status: ${upstreamRes.status}`) as Error & {
            status?: number;
          };
          error.status = upstreamRes.status;
          throw error;
        }

        const text = await upstreamRes.text();
        if (text.startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<!doctype')) {
          throw new Error('Jikan returned HTML instead of JSON');
        }

        return JSON.parse(text);
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        if (attempt < 2) {
          const backoff = (attempt + 1) * 600 + Math.floor(Math.random() * 300);
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }
    throw lastError || new Error(`Failed to fetch ${fullEndpoint}`);
  };

  const fetchPromise = (async () => {
    try {
      const data = await jikanRateLimiter.schedule(executeFetch);

      if (data && !data.error && (Array.isArray(data.data) ? true : data.data !== null)) {
        setCached(cacheKey, data, ttlSeconds);
        return { data, isFallback: false };
      }

      const fallback = getJikanFallbackResponse(rawPath, queryParams);
      return { data: fallback, isFallback: true };
    } catch {
      const fallback = getJikanFallbackResponse(rawPath, queryParams);
      if (!rawPath.startsWith('anime') || !hasSearchQuery) {
        setCached(cacheKey, fallback, 60);
      }
      return { data: fallback, isFallback: true };
    }
  })();

  inFlightJikan.set(cacheKey, fetchPromise.then((r) => r.data));

  try {
    const result = await fetchPromise;
    const headers: Record<string, string> = {
      'X-Cache': result.isFallback ? 'FALLBACK' : 'MISS',
    };
    if (result.isFallback) {
      headers['X-Fallback'] = 'true';
    }
    return { body: result.data, headers, isFallback: result.isFallback };
  } finally {
    inFlightJikan.delete(cacheKey);
  }
}

export async function handleAnikotoProxy(rawPath: string, search: string) {
  const { getCached, setCached } = await import('@/lib/cache');
  const { anikotoRateLimiter } = await import('@/lib/rateLimiter');

  const fullEndpoint = `${rawPath}${search}`;
  const cacheKey = `anikoto:${fullEndpoint}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return { body: cached, headers: { 'X-Cache': 'HIT' } };
  }

  const targetUrl = `${ANIKOTO_BASE_URL.replace(/\/+$/, '')}/${fullEndpoint.replace(/^\/+/, '')}`;

  const executeFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const upstreamRes = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!upstreamRes.ok) {
        const error = new Error(`Anikoto upstream error: ${upstreamRes.status}`) as Error & {
          status?: number;
        };
        error.status = upstreamRes.status;
        throw error;
      }

      const text = await upstreamRes.text();
      if (text.startsWith('<')) {
        throw new Error('Anikoto returned HTML');
      }
      return JSON.parse(text);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const data = await anikotoRateLimiter.schedule(executeFetch);
  if (data) {
    setCached(cacheKey, data, 86400);
  }

  return { body: data, headers: { 'X-Cache': 'MISS' } };
}

export async function handleAnilistProxy(query: string, variables: unknown) {
  const { getCached, setCached } = await import('@/lib/cache');
  const { anilistRateLimiter } = await import('@/lib/rateLimiter');

  const queryKey = query.replace(/\s+/g, ' ').slice(0, 100);
  const cacheKey = `anilist:${JSON.stringify(variables || {})}:${queryKey}`;

  let ttlSeconds = 3600;
  if (query.includes('airingSchedules') || query.includes('MediaSeason') || query.includes('TRENDING')) {
    ttlSeconds = 21600;
  } else if (query.includes('Media(id:') || query.includes('Media(idMal:')) {
    ttlSeconds = 86400;
  } else if ((variables as { search?: string })?.search) {
    ttlSeconds = 300;
  }

  const cached = getCached(cacheKey);
  if (cached) {
    return { body: cached, headers: { 'X-Cache': 'HIT' } };
  }

  const executeFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    try {
      const upstreamRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'AnimeStreamApp/2.0 (web; compatible)',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text().catch(() => '');
        const error = new Error(`AniList upstream status: ${upstreamRes.status} - ${errText}`) as Error & {
          status?: number;
        };
        error.status = upstreamRes.status;
        throw error;
      }

      return await upstreamRes.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const result = await anilistRateLimiter.schedule(executeFetch);

  if (result && !result.errors) {
    setCached(cacheKey, result, ttlSeconds);
  }

  return { body: result, headers: { 'X-Cache': 'MISS' } };
}

export async function handleMusicSearch(query: string) {
  const { getCached, setCached } = await import('@/lib/cache');

  const cacheKey = `music:yt:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { body: cached, headers: { 'X-Cache': 'HIT' } };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`YouTube search returned status ${response.status}`);
    }

    const html = await response.text();
    const videoIdMatches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    let videoId: string | null = null;

    if (videoIdMatches && videoIdMatches.length > 0) {
      for (const m of videoIdMatches) {
        const vid = m.replace(/"videoId":"|"/g, '');
        if (vid && vid.length === 11) {
          videoId = vid;
          break;
        }
      }
    }

    let videoTitle = query;
    const titleMatch = html.match(/"title":\{"runs":\[\{"text":"([^"]+)"/);
    if (titleMatch?.[1]) {
      videoTitle = titleMatch[1];
    }

    const result = {
      videoId,
      query,
      title: videoTitle,
      thumbnailUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
      embedUrl: videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`
        : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`,
    };

    if (videoId) {
      setCached(cacheKey, result, 86400 * 7);
    }

    return { body: result, headers: { 'X-Cache': 'MISS' } };
  } catch {
    const fallbackResult = {
      videoId: null,
      query,
      title: query,
      thumbnailUrl: null,
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`,
    };
    return { body: fallbackResult, headers: { 'X-Cache': 'FALLBACK' } };
  }
}
