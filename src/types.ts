import { z } from 'zod';

// ==========================================
// ZOD SCHEMAS FOR JIKAN API VALIDATION
// ==========================================

export const JikanImageSchema = z.object({
  image_url: z.string().nullable().optional(),
  small_image_url: z.string().nullable().optional(),
  large_image_url: z.string().nullable().optional(),
}).optional();

export const JikanImagesSchema = z.object({
  jpg: JikanImageSchema,
  webp: JikanImageSchema,
}).optional();

export const JikanTrailerSchema = z.object({
  youtube_id: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  embed_url: z.string().nullable().optional(),
  images: z.object({
    image_url: z.string().nullable().optional(),
    small_image_url: z.string().nullable().optional(),
    medium_image_url: z.string().nullable().optional(),
    large_image_url: z.string().nullable().optional(),
    maximum_image_url: z.string().nullable().optional(),
  }).optional(),
}).optional();

export const JikanTitleSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
});

export const JikanGenericItemSchema = z.object({
  mal_id: z.number(),
  type: z.string().optional(),
  name: z.string(),
  url: z.string().optional(),
});

export const JikanRelationEntrySchema = z.object({
  mal_id: z.number(),
  type: z.string(),
  name: z.string(),
  url: z.string().optional(),
});

export const JikanRelationSchema = z.object({
  relation: z.string(),
  entry: z.array(JikanRelationEntrySchema),
});

export const JikanExternalLinkSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const JikanAnimeSchema = z.object({
  mal_id: z.number(),
  url: z.string().optional(),
  images: JikanImagesSchema,
  trailer: JikanTrailerSchema,
  approved: z.boolean().optional(),
  titles: z.array(JikanTitleSchema).optional(),
  title: z.string(),
  title_english: z.string().nullable().optional(),
  title_japanese: z.string().nullable().optional(),
  title_synonyms: z.array(z.string()).optional(),
  type: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  episodes: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  airing: z.boolean().optional(),
  aired: z.object({
    from: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
    string: z.string().nullable().optional(),
  }).optional(),
  duration: z.string().nullable().optional(),
  rating: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  scored_by: z.number().nullable().optional(),
  rank: z.number().nullable().optional(),
  popularity: z.number().nullable().optional(),
  members: z.number().nullable().optional(),
  favorites: z.number().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  season: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  broadcast: z.object({
    day: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    string: z.string().nullable().optional(),
  }).optional(),
  producers: z.array(JikanGenericItemSchema).optional(),
  licensors: z.array(JikanGenericItemSchema).optional(),
  studios: z.array(JikanGenericItemSchema).optional(),
  genres: z.array(JikanGenericItemSchema).optional(),
  explicit_genres: z.array(JikanGenericItemSchema).optional(),
  themes: z.array(JikanGenericItemSchema).optional(),
  demographics: z.array(JikanGenericItemSchema).optional(),
  // Full detail embedded items from /anime/{id}/full
  relations: z.array(JikanRelationSchema).optional(),
  theme: z.object({
    openings: z.array(z.string()).optional(),
    endings: z.array(z.string()).optional(),
  }).optional(),
  external: z.array(JikanExternalLinkSchema).optional(),
  streaming: z.array(JikanExternalLinkSchema).optional(),
});

export const JikanEpisodeSchema = z.object({
  mal_id: z.number(),
  url: z.string().optional(),
  title: z.string(),
  title_japanese: z.string().nullable().optional(),
  title_romanji: z.string().nullable().optional(),
  aired: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  filler: z.boolean().optional(),
  recap: z.boolean().optional(),
  forum_url: z.string().nullable().optional(),
});

export const JikanPaginationSchema = z.object({
  last_visible_page: z.number().optional(),
  has_next_page: z.boolean().optional(),
  current_page: z.number().optional(),
  items: z.object({
    count: z.number().optional(),
    total: z.number().optional(),
    per_page: z.number().optional(),
  }).optional(),
}).optional();

export const JikanAnimeListResponseSchema = z.object({
  pagination: JikanPaginationSchema,
  data: z.array(JikanAnimeSchema),
});

export const JikanAnimeDetailResponseSchema = z.object({
  data: JikanAnimeSchema,
});

export const JikanEpisodesResponseSchema = z.object({
  pagination: JikanPaginationSchema,
  data: z.array(JikanEpisodeSchema),
});

export const JikanGenresResponseSchema = z.object({
  data: z.array(z.object({
    mal_id: z.number(),
    name: z.string(),
    url: z.string().optional(),
    count: z.number().optional(),
  })),
});

export const JikanCharacterVoiceActorSchema = z.object({
  person: z.object({
    mal_id: z.number(),
    name: z.string(),
    url: z.string().optional(),
    images: z.object({
      jpg: z.object({
        image_url: z.string().nullable().optional(),
      }).optional(),
    }).optional(),
  }),
  language: z.string(),
});

export const JikanCharacterRoleSchema = z.object({
  character: z.object({
    mal_id: z.number(),
    name: z.string(),
    url: z.string().optional(),
    images: JikanImagesSchema,
  }),
  role: z.string(),
  favorites: z.number().optional(),
  voice_actors: z.array(JikanCharacterVoiceActorSchema).optional(),
});

export const JikanCharactersResponseSchema = z.object({
  data: z.array(JikanCharacterRoleSchema),
});

export const JikanStaffMemberSchema = z.object({
  person: z.object({
    mal_id: z.number(),
    name: z.string(),
    url: z.string().optional(),
    images: z.object({
      jpg: z.object({
        image_url: z.string().nullable().optional(),
      }).optional(),
    }).optional(),
  }),
  positions: z.array(z.string()),
});

export const JikanStaffResponseSchema = z.object({
  data: z.array(JikanStaffMemberSchema),
});

export const JikanThemesResponseSchema = z.object({
  data: z.object({
    openings: z.array(z.string()).optional(),
    endings: z.array(z.string()).optional(),
  }).optional(),
});

export const JikanRelationsResponseSchema = z.object({
  data: z.array(JikanRelationSchema),
});

export const JikanExternalLinksResponseSchema = z.object({
  data: z.array(JikanExternalLinkSchema),
});

// ==========================================
// INFERRED TYPES & APP INTERFACES
// ==========================================

export type Anime = z.infer<typeof JikanAnimeSchema>;
export type AnimeTrailer = z.infer<typeof JikanTrailerSchema>;
export type AnimeEpisode = z.infer<typeof JikanEpisodeSchema>;
export type Pagination = z.infer<typeof JikanPaginationSchema>;
export type AnimeCharacterRole = z.infer<typeof JikanCharacterRoleSchema>;
export type AnimeCharacterVoiceActor = z.infer<typeof JikanCharacterVoiceActorSchema>;
export type AnimeStaffMember = z.infer<typeof JikanStaffMemberSchema>;
export type AnimeRelation = z.infer<typeof JikanRelationSchema>;
export type AnimeRelationEntry = z.infer<typeof JikanRelationEntrySchema>;
export type AnimeExternalLink = z.infer<typeof JikanExternalLinkSchema>;

export interface AnimeThemeSongs {
  openings: string[];
  endings: string[];
}

export interface Genre {
  mal_id: number;
  name: string;
  count?: number;
}

export type StreamSource = 'zoko' | 'mal' | 'ani' | 's-2' | 'fallback';

export interface StreamConfig {
  source: StreamSource;
  id: string | number;
  epNum: number;
  lang: 'sub' | 'dub';
  serverName?: string;
}

export interface WatchProgress {
  malId: number;
  title: string;
  image: string;
  episodeNumber: number;
  totalEpisodes?: number | null;
  timestamp: number; // unix timestamp
  durationSeconds?: number;
  progressSeconds?: number;
  language: 'sub' | 'dub';
}

export type WatchlistStatus = 'watching' | 'plan_to_watch' | 'completed' | 'on_hold' | 'dropped';

export interface WatchlistItem {
  malId: number;
  title: string;
  image: string;
  score?: number | null;
  type?: string | null;
  status: WatchlistStatus;
  totalEpisodes?: number | null;
  lastWatchedEpisode?: number;
  updatedAt: number;
}

export interface SearchFilters {
  query?: string;
  genres?: string; // comma separated genre IDs
  type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music' | '';
  status?: 'airing' | 'complete' | 'upcoming' | '';
  rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx' | '';
  order_by?: 'mal_id' | 'title' | 'start_date' | 'end_date' | 'episodes' | 'score' | 'scored_by' | 'rank' | 'popularity' | 'members' | 'favorites';
  sort?: 'desc' | 'asc';
  min_score?: number;
  page?: number;
  limit?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface MusicTrack {
  id: string; // e.g. "op-1", "ed-1"
  title: string;
  artist: string;
  animeTitle: string;
  animePoster?: string;
  animeId: number;
  type: 'OP' | 'ED' | 'OST';
  number: string;
  episodes?: string;
  query: string;
  videoId?: string | null;
  embedUrl?: string | null;
  thumbnailUrl?: string | null;
}
