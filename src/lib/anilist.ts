/**
 * AniList GraphQL API Client & Data Adapter
 * Provides high-speed, rich metadata queries using AniList GraphQL API v2
 * Reference: https://docs.anilist.co/guide/graphql/
 */

import {
  Anime,
  AnimeCharacterRole,
  AnimeStaffMember,
  AnimeRelation,
  AnimeExternalLink,
  AnimeEpisode,
  Genre,
  Pagination,
  SearchFilters,
} from '../types';
import { anilistRateLimiter } from './rateLimiter';
import { getCached, setCached } from './cache';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

/**
 * Execute AniList GraphQL Query via proxy (/api/anilist) in browser or upstream on server
 */
export async function fetchAniListGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  ttlSeconds: number = 3600
): Promise<T> {
  const isClient = typeof window !== 'undefined';
  const url = isClient ? '/api/anilist' : ANILIST_GRAPHQL_ENDPOINT;

  // Generate deterministic cache key
  const querySummary = query.replace(/\s+/g, ' ').slice(0, 80);
  const cacheKey = `anilist:${JSON.stringify(variables)}:${querySummary}`;

  if (ttlSeconds > 0) {
    const cached = getCached<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const executeFetch = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        let parsedError = errorText;
        try {
          const jsonErr = JSON.parse(errorText);
          parsedError = jsonErr.errors?.[0]?.message || jsonErr.error || errorText;
        } catch {
          // ignore
        }
        const error: any = new Error(`AniList GraphQL Error (${res.status}): ${parsedError}`);
        error.status = res.status;
        throw error;
      }

      const json = await res.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(`AniList Query Error: ${json.errors[0].message}`);
      }

      return json.data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    const data = isClient
      ? await executeFetch()
      : await anilistRateLimiter.schedule(executeFetch);

    if (data && ttlSeconds > 0) {
      setCached(cacheKey, data, ttlSeconds);
    }

    return data;
  } catch (err: any) {
    if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
      console.warn('[AniList GraphQL fetch error]', err.message || err);
    }
    throw err;
  }

}

/**
 * Normalizes AniList Media format to standard Status string
 */
function normalizeStatus(status?: string | null): string {
  switch (status) {
    case 'RELEASING':
      return 'Currently Airing';
    case 'FINISHED':
      return 'Finished Airing';
    case 'NOT_YET_RELEASED':
      return 'Not yet aired';
    case 'CANCELLED':
      return 'Cancelled';
    case 'HIATUS':
      return 'On Hiatus';
    default:
      return status || 'Finished Airing';
  }
}

/**
 * Normalizes AniList Season format
 */
function normalizeSeason(season?: string | null): string | null {
  if (!season) return null;
  return season.toLowerCase();
}

/**
 * Cleans HTML tags from AniList synopsis descriptions
 */
function cleanDescription(desc?: string | null): string {
  if (!desc) return 'No synopsis available.';
  return desc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<i>(.*?)<\/i>/gi, '$1')
    .replace(/<b>(.*?)<\/b>/gi, '$1')
    .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

/**
 * Standard Anime Normalizer: converts an AniList GraphQL Media node into the unified Anime interface
 */
export function normalizeAniListMedia(media: any): Anime {
  if (!media) {
    throw new Error('Invalid AniList media object');
  }

  const malId = Number(media.idMal || media.id);
  const aniId = Number(media.id);

  const romaji = media.title?.romaji || media.title?.userPreferred || 'Unknown Title';
  const english = media.title?.english || romaji;
  const japanese = media.title?.native || null;

  const score = media.averageScore
    ? Number((media.averageScore / 10).toFixed(2))
    : media.meanScore
    ? Number((media.meanScore / 10).toFixed(2))
    : null;

  const coverLarge = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || '';
  const coverMedium = media.coverImage?.medium || coverLarge;
  const banner = media.bannerImage || coverLarge;

  const genres = Array.isArray(media.genres)
    ? media.genres.map((g: string, idx: number) => ({
        mal_id: idx + 100,
        name: g,
        type: 'anime',
      }))
    : [];

  const studios = media.studios?.nodes
    ? media.studios.nodes.map((s: any) => ({
        mal_id: s.id || 1,
        name: s.name,
        type: 'anime',
      }))
    : [];

  const trailer = media.trailer?.site === 'youtube' && media.trailer?.id
    ? {
        youtube_id: media.trailer.id,
        url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
        embed_url: `https://www.youtube-nocookie.com/embed/${media.trailer.id}`,
        images: {
          image_url: `https://i.ytimg.com/vi/${media.trailer.id}/hqdefault.jpg`,
          large_image_url: `https://i.ytimg.com/vi/${media.trailer.id}/maxresdefault.jpg`,
        },
      }
    : undefined;

  const durationStr = media.duration ? `${media.duration} min per ep` : undefined;

  const airedStr = media.startDate?.year
    ? `${media.startDate.year}${media.startDate.month ? `-${String(media.startDate.month).padStart(2, '0')}` : ''}`
    : undefined;

  return {
    mal_id: malId,
    url: `https://anilist.co/anime/${aniId}`,
    title: romaji,
    title_english: english,
    title_japanese: japanese,
    title_synonyms: media.synonyms || [],
    titles: [
      { type: 'Romaji', title: romaji },
      { type: 'English', title: english },
      ...(japanese ? [{ type: 'Japanese', title: japanese }] : []),
    ],
    images: {
      jpg: {
        image_url: coverLarge,
        small_image_url: coverMedium,
        large_image_url: coverLarge,
      },
      webp: {
        image_url: coverLarge,
        small_image_url: coverMedium,
        large_image_url: coverLarge,
      },
    },
    trailer,
    approved: true,
    type: media.format || 'TV',
    source: media.source || 'Original',
    episodes: media.episodes || null,
    status: normalizeStatus(media.status),
    airing: media.status === 'RELEASING',
    aired: {
      from: airedStr,
      to: media.endDate?.year ? `${media.endDate.year}` : undefined,
      string: airedStr,
    },
    duration: durationStr,
    rating: media.isAdult ? 'R - 17+ (violence & profanity)' : 'PG-13 - Teens 13 or older',
    score: score,
    scored_by: media.popularity || 0,
    rank: media.rankings?.[0]?.rank || null,
    popularity: media.popularity || 0,
    members: media.favourites || media.popularity || 0,
    favorites: media.favourites || 0,
    synopsis: cleanDescription(media.description),
    background: banner ? `Banner: ${banner}` : undefined,
    season: normalizeSeason(media.season),
    year: media.seasonYear || media.startDate?.year || null,
    broadcast: media.nextAiringEpisode
      ? {
          day: undefined,
          time: undefined,
          timezone: 'UTC',
          string: `Next Episode ${media.nextAiringEpisode.episode} airing in ${Math.round(media.nextAiringEpisode.timeUntilAiring / 3600)}h`,
        }
      : undefined,
    producers: studios,
    licensors: [],
    studios,
    genres,
    explicit_genres: [],
    themes: [],
    demographics: [],
    relations: media.relations?.edges?.map((edge: any) => ({
      relation: edge.relationType || 'Other',
      entry: [
        {
          mal_id: Number(edge.node.idMal || edge.node.id),
          type: edge.node.type || 'anime',
          name: edge.node.title?.romaji || edge.node.title?.english || 'Related Anime',
          url: `https://anilist.co/anime/${edge.node.id}`,
        },
      ],
    })),
    external: media.externalLinks?.map((link: any) => ({
      name: link.site || 'Link',
      url: link.url,
    })),
    streaming: media.externalLinks
      ?.filter((link: any) => link.type === 'STREAMING' || link.site === 'Crunchyroll' || link.site === 'Netflix')
      ?.map((link: any) => ({
        name: link.site,
        url: link.url,
      })),
  };
}

// ==========================================
// GRAPHQL QUERY DEFINITIONS
// ==========================================

const MEDIA_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
    userPreferred
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  format
  episodes
  duration
  status
  season
  seasonYear
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
  averageScore
  meanScore
  popularity
  favourites
  trending
  genres
  description(asHtml: false)
  trailer {
    id
    site
    thumbnail
  }
  studios {
    nodes {
      id
      name
      isAnimationStudio
    }
  }
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
  streamingEpisodes {
    title
    thumbnail
    url
    site
  }
`;

const ANILIST_PAGE_QUERY = `
query (
  $page: Int = 1,
  $perPage: Int = 24,
  $search: String,
  $sort: [MediaSort] = [POPULARITY_DESC],
  $genre: String,
  $genre_in: [String],
  $type: MediaType = ANIME,
  $status: MediaStatus,
  $format: MediaFormat,
  $season: MediaSeason,
  $seasonYear: Int,
  $isAdult: Boolean = false,
  $idMal: Int,
  $id: Int
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(
      search: $search,
      sort: $sort,
      genre: $genre,
      genre_in: $genre_in,
      type: $type,
      status: $status,
      format: $format,
      season: $season,
      seasonYear: $seasonYear,
      isAdult: $isAdult,
      idMal: $idMal,
      id: $id
    ) {
      ${MEDIA_FIELDS}
    }
  }
}
`;

const ANILIST_DETAIL_QUERY = `
query ($id: Int, $idMal: Int) {
  Media(id: $id, idMal: $idMal, type: ANIME) {
    ${MEDIA_FIELDS}
    synonyms
    source
    hashtag
    characters(page: 1, perPage: 24, sort: [ROLE, RELEVANCE]) {
      edges {
        role
        node {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
        }
        voiceActors(language: JAPANESE) {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
          languageV2
        }
      }
    }
    staff(page: 1, perPage: 16) {
      edges {
        role
        node {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
          primaryOccupations
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          idMal
          title {
            romaji
            english
            native
          }
          format
          type
          status
          coverImage {
            large
            medium
          }
        }
      }
    }
    recommendations(page: 1, perPage: 12, sort: [RATING_DESC]) {
      nodes {
        mediaRecommendation {
          id
          idMal
          title {
            romaji
            english
            native
          }
          format
          type
          coverImage {
            large
            medium
          }
          averageScore
          bannerImage
        }
      }
    }
    externalLinks {
      id
      url
      site
      type
      icon
      color
    }
  }
}
`;

const ANILIST_SCHEDULE_QUERY = `
query ($airingAt_greater: Int, $airingAt_lesser: Int, $page: Int = 1, $perPage: Int = 50) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    airingSchedules(
      airingAt_greater: $airingAt_greater,
      airingAt_lesser: $airingAt_lesser,
      sort: [TIME]
    ) {
      id
      airingAt
      episode
      timeUntilAiring
      media {
        ${MEDIA_FIELDS}
      }
    }
  }
}
`;

// ==========================================
// HIGH-LEVEL SERVICE FUNCTIONS
// ==========================================

/**
 * Get current season anime from AniList GraphQL (6h cache)
 */
export async function getAniListSeasonNow(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Anime[]; pagination?: Pagination }> {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  let currentSeason = 'WINTER';
  if (month >= 3 && month <= 5) currentSeason = 'SPRING';
  else if (month >= 6 && month <= 8) currentSeason = 'SUMMER';
  else if (month >= 9 && month <= 11) currentSeason = 'FALL';

  const variables = {
    page: params?.page || 1,
    perPage: params?.limit || 24,
    season: currentSeason,
    seasonYear: currentYear,
    sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  };

  const json = await fetchAniListGraphQL<any>(ANILIST_PAGE_QUERY, variables, 21600);
  const mediaList = json?.Page?.media || [];
  const pageInfo = json?.Page?.pageInfo;

  const data: Anime[] = mediaList.map(normalizeAniListMedia);

  return {
    data,
    pagination: {
      current_page: pageInfo?.currentPage || 1,
      has_next_page: pageInfo?.hasNextPage || false,
      last_visible_page: pageInfo?.lastPage || 1,
      items: {
        count: data.length,
        total: pageInfo?.total || data.length,
        per_page: pageInfo?.perPage || 24,
      },
    },
  };
}

/**
 * Get top / trending anime from AniList GraphQL (6h cache)
 */
export async function getAniListTopAnime(params?: {
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'top_rated';
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{ data: Anime[]; pagination?: Pagination }> {
  let sort = ['POPULARITY_DESC'];
  let status: string | undefined = undefined;

  if (params?.filter === 'airing') {
    status = 'RELEASING';
    sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  } else if (params?.filter === 'upcoming') {
    status = 'NOT_YET_RELEASED';
    sort = ['POPULARITY_DESC'];
  } else if (params?.filter === 'favorite') {
    sort = ['FAVOURITES_DESC'];
  } else if (params?.filter === 'top_rated') {
    sort = ['SCORE_DESC'];
  }

  let format: string | undefined = undefined;
  if (params?.type) {
    const upper = params.type.toUpperCase();
    if (['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(upper)) {
      format = upper;
    }
  }

  const variables = {
    page: params?.page || 1,
    perPage: params?.limit || 24,
    sort,
    status,
    format,
  };

  const json = await fetchAniListGraphQL<any>(ANILIST_PAGE_QUERY, variables, 21600);
  const mediaList = json?.Page?.media || [];
  const pageInfo = json?.Page?.pageInfo;

  const data: Anime[] = mediaList.map(normalizeAniListMedia);

  return {
    data,
    pagination: {
      current_page: pageInfo?.currentPage || 1,
      has_next_page: pageInfo?.hasNextPage || false,
      last_visible_page: pageInfo?.lastPage || 1,
      items: {
        count: data.length,
        total: pageInfo?.total || data.length,
        per_page: pageInfo?.perPage || 24,
      },
    },
  };
}

/**
 * Search anime with multi-field filters via AniList GraphQL (5min cache)
 */
export async function searchAniListAnime(
  query: string,
  params?: SearchFilters
): Promise<{ data: Anime[]; pagination?: Pagination }> {
  const cleanQuery = (query || '').trim();

  let sort = ['POPULARITY_DESC'];
  if (params?.order_by === 'score') sort = ['SCORE_DESC'];
  else if (params?.order_by === 'favorites') sort = ['FAVOURITES_DESC'];
  else if (params?.order_by === 'title') sort = ['TITLE_ROMAJI'];
  else if (params?.order_by === 'start_date') sort = ['START_DATE_DESC'];
  else if (cleanQuery) sort = ['SEARCH_MATCH', 'POPULARITY_DESC'];

  let status: string | undefined = undefined;
  if (params?.status === 'airing') status = 'RELEASING';
  else if (params?.status === 'complete') status = 'FINISHED';
  else if (params?.status === 'upcoming') status = 'NOT_YET_RELEASED';

  let format: string | undefined = undefined;
  if (params?.type) {
    const upper = params.type.toUpperCase();
    if (['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(upper)) {
      format = upper;
    }
  }

  const variables: Record<string, any> = {
    page: params?.page || 1,
    perPage: params?.limit || 24,
    search: cleanQuery || undefined,
    sort,
    status,
    format,
  };

  if (params?.genres) {
    const genreNames = params.genres.split(',').map(g => g.trim()).filter(Boolean);
    if (genreNames.length === 1) {
      variables.genre = genreNames[0];
    } else if (genreNames.length > 1) {
      variables.genre_in = genreNames;
    }
  }

  const json = await fetchAniListGraphQL<any>(ANILIST_PAGE_QUERY, variables, 300);
  const mediaList = json?.Page?.media || [];
  const pageInfo = json?.Page?.pageInfo;

  const data: Anime[] = mediaList.map(normalizeAniListMedia);

  return {
    data,
    pagination: {
      current_page: pageInfo?.currentPage || 1,
      has_next_page: pageInfo?.hasNextPage || false,
      last_visible_page: pageInfo?.lastPage || 1,
      items: {
        count: data.length,
        total: pageInfo?.total || data.length,
        per_page: pageInfo?.perPage || 24,
      },
    },
  };
}

/**
 * Get anime weekly schedule via AniList GraphQL AiringSchedule (6h cache)
 */
export async function getAniListSchedule(params?: {
  filter?: string; // 'monday', 'tuesday', etc.
  page?: number;
  limit?: number;
}): Promise<{ data: Anime[]; pagination?: Pagination }> {
  // Calculate timestamp range for the selected day or today
  const now = new Date();
  let targetDayOffset = 0;

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const currentDayOfWeek = now.getDay();

  if (params?.filter && dayMap[params.filter.toLowerCase()] !== undefined) {
    const targetDay = dayMap[params.filter.toLowerCase()];
    targetDayOffset = targetDay - currentDayOfWeek;
  }

  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + targetDayOffset);
  targetDate.setHours(0, 0, 0, 0);

  const startUnix = Math.floor(targetDate.getTime() / 1000);
  const endUnix = startUnix + 86400; // 24 hours

  const variables = {
    airingAt_greater: startUnix,
    airingAt_lesser: endUnix,
    page: params?.page || 1,
    perPage: params?.limit || 50,
  };

  const json = await fetchAniListGraphQL<any>(ANILIST_SCHEDULE_QUERY, variables, 21600);
  const schedules = json?.Page?.airingSchedules || [];
  const pageInfo = json?.Page?.pageInfo;

  const uniqueAnimeMap = new Map<number, Anime>();
  for (const item of schedules) {
    if (item.media) {
      const anime = normalizeAniListMedia(item.media);
      if (!uniqueAnimeMap.has(anime.mal_id)) {
        uniqueAnimeMap.set(anime.mal_id, anime);
      }
    }
  }

  const data = Array.from(uniqueAnimeMap.values());

  return {
    data,
    pagination: {
      current_page: pageInfo?.currentPage || 1,
      has_next_page: pageInfo?.hasNextPage || false,
      last_visible_page: pageInfo?.lastPage || 1,
      items: {
        count: data.length,
        total: pageInfo?.total || data.length,
        per_page: pageInfo?.perPage || 50,
      },
    },
  };
}

/**
 * Get anime by MAL ID or AniList ID from AniList GraphQL (24h cache)
 */
export async function getAniListAnimeById(
  id: number,
  isMalId: boolean = true
): Promise<Anime> {
  const primaryVars = isMalId ? { idMal: id } : { id };
  const fallbackVars = isMalId ? { id: id } : { idMal: id };

  try {
    const json = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, primaryVars, 86400);
    if (json?.Media) {
      return normalizeAniListMedia(json.Media);
    }
  } catch (err) {
    // Try fallback lookup
  }

  try {
    const jsonFallback = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, fallbackVars, 86400);
    if (jsonFallback?.Media) {
      return normalizeAniListMedia(jsonFallback.Media);
    }
  } catch (err) {
    // Both attempts failed
  }

  throw new Error(`AniList anime with ID ${id} not found`);
}

/**
 * Get characters and voice actors for an anime from AniList (24h cache)
 */
export async function getAniListCharacters(
  id: number,
  isMalId: boolean = true
): Promise<AnimeCharacterRole[]> {
  const variables = isMalId ? { idMal: id } : { id };
  const json = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, variables, 86400);
  const charEdges = json?.Media?.characters?.edges || [];

  return charEdges.map((edge: any) => {
    const va = edge.voiceActors?.[0];
    return {
      role: edge.role === 'MAIN' ? 'Main' : 'Supporting',
      character: {
        mal_id: edge.node.id,
        name: edge.node.name?.full || edge.node.name?.native || 'Unknown Character',
        url: `https://anilist.co/character/${edge.node.id}`,
        images: {
          jpg: {
            image_url: edge.node.image?.large || edge.node.image?.medium,
          },
        },
      },
      voice_actors: va
        ? [
            {
              language: va.languageV2 || 'Japanese',
              person: {
                mal_id: va.id,
                name: va.name?.full || va.name?.native || 'Unknown VA',
                url: `https://anilist.co/staff/${va.id}`,
                images: {
                  jpg: {
                    image_url: va.image?.large || va.image?.medium,
                  },
                },
              },
            },
          ]
        : [],
    };
  });
}

/**
 * Get staff members for an anime from AniList (24h cache)
 */
export async function getAniListStaff(
  id: number,
  isMalId: boolean = true
): Promise<AnimeStaffMember[]> {
  const variables = isMalId ? { idMal: id } : { id };
  const json = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, variables, 86400);
  const staffEdges = json?.Media?.staff?.edges || [];

  return staffEdges.map((edge: any) => ({
    positions: [edge.role || 'Staff'],
    person: {
      mal_id: edge.node.id,
      name: edge.node.name?.full || edge.node.name?.native || 'Staff Member',
      url: `https://anilist.co/staff/${edge.node.id}`,
      images: {
        jpg: {
          image_url: edge.node.image?.large || edge.node.image?.medium,
        },
      },
    },
  }));
}

/**
 * Get anime recommendations from AniList (24h cache)
 */
export async function getAniListRecommendations(
  id: number,
  isMalId: boolean = true
): Promise<Anime[]> {
  const variables = isMalId ? { idMal: id } : { id };
  const json = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, variables, 86400);
  const recNodes = json?.Media?.recommendations?.nodes || [];

  const recs: Anime[] = [];
  for (const node of recNodes) {
    if (node.mediaRecommendation) {
      recs.push(normalizeAniListMedia(node.mediaRecommendation));
    }
  }

  return recs;
}

/**
 * Get anime episodes list from AniList (24h cache)
 */
export async function getAniListEpisodes(
  id: number,
  isMalId: boolean = true
): Promise<AnimeEpisode[]> {
  try {
    const variables = isMalId ? { idMal: id } : { id };
    const json = await fetchAniListGraphQL<any>(ANILIST_DETAIL_QUERY, variables, 86400);
    const media = json?.Media;
    if (!media) return [];

    const streamEps = media.streamingEpisodes || [];

    if (Array.isArray(streamEps) && streamEps.length > 0) {
      return streamEps.map((ep: any, idx: number) => {
        const rawTitle = ep.title || '';
        const match = rawTitle.match(/Episode\s+(\d+)\s*-\s*(.+)/i) || rawTitle.match(/E(\d+)\s*-\s*(.+)/i);
        const epNum = match ? parseInt(match[1], 10) : idx + 1;
        const title = match ? match[2].trim() : rawTitle || `Episode ${epNum}`;

        return {
          mal_id: epNum,
          title: title,
          episode: `Episode ${epNum}`,
          aired: undefined,
          score: null,
          filler: false,
          recap: false,
        };
      });
    }

    // Fallback: If AniList streamingEpisodes is empty, build episode list from AniList
    // episode metadata. For airing titles use the FULL scheduled count when known so
    // the episode list doesn't jump from "aired so far" (e.g. 4) to the total (e.g. 12)
    // after a later refetch. Aired count is used only when the total is unknown.
    const airedCount = media.nextAiringEpisode?.episode
      ? media.nextAiringEpisode.episode - 1
      : 0;

    let total = media.episodes || Math.max(airedCount, 12);
    if (!media.episodes && media.nextAiringEpisode?.episode) {
      total = Math.max(media.nextAiringEpisode.episode - 1, 12);
    }
    const count = Math.max(total, airedCount, 1);
    return Array.from({ length: count }, (_, i) => ({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      episode: `Episode ${i + 1}`,
      aired: undefined,
      score: null,
      filler: false,
      recap: false,
    }));
  } catch (err) {
    console.warn('[AniList getAniListEpisodes Error]', err);
    return [];
  }
}


/**
 * Static & dynamic list of AniList Genres
 */
export const ANILIST_GENRES: Genre[] = [
  { mal_id: 1, name: 'Action' },
  { mal_id: 2, name: 'Adventure' },
  { mal_id: 4, name: 'Comedy' },
  { mal_id: 8, name: 'Drama' },
  { mal_id: 9, name: 'Ecchi' },
  { mal_id: 10, name: 'Fantasy' },
  { mal_id: 14, name: 'Horror' },
  { mal_id: 66, name: 'Mahou Shoujo' },
  { mal_id: 18, name: 'Mecha' },
  { mal_id: 19, name: 'Music' },
  { mal_id: 7, name: 'Mystery' },
  { mal_id: 40, name: 'Psychological' },
  { mal_id: 22, name: 'Romance' },
  { mal_id: 24, name: 'Sci-Fi' },
  { mal_id: 36, name: 'Slice of Life' },
  { mal_id: 30, name: 'Sports' },
  { mal_id: 37, name: 'Supernatural' },
  { mal_id: 41, name: 'Thriller' },
];

export async function getAniListGenres(): Promise<Genre[]> {
  return ANILIST_GENRES;
}
