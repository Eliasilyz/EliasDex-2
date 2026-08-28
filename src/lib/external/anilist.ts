import {
  getAniListAnimeById,
  getAniListSeasonNow,
  getAniListTopAnime,
  getAniListSchedule,
  searchAniListAnime,
  getAniListEpisodes,
  getAniListCharacters,
  getAniListStaff,
  getAniListRecommendations,
  getAniListGenres,
  fetchAniListGraphQL,
  normalizeAniListMedia,
} from "../anilist";

export interface AniListAnimeResponse {
  anime: ReturnType<typeof normalizeAniListMedia>;
  idMal: number | null;
  id: number;
}

export async function getAnimeById(
  anilistId: number
): Promise<AniListAnimeResponse | null> {
  try {
    const raw = await fetchAniListGraphQL<{
      Media: { id: number; idMal: number | null };
    }>(
      `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
        }
      }`,
      { id: anilistId },
      86400
    );

    const fullAnime = await getAniListAnimeById(anilistId, false);
    return {
      anime: fullAnime,
      idMal: raw?.Media?.idMal ?? null,
      id: anilistId,
    };
  } catch (err) {
    console.error("[AniList Client] Error getting anime by ID:", err);
    return null;
  }
}

export {
  getAniListSeasonNow,
  getAniListTopAnime,
  getAniListSchedule,
  searchAniListAnime,
  getAniListEpisodes,
  getAniListCharacters,
  getAniListStaff,
  getAniListRecommendations,
  getAniListGenres,
};
