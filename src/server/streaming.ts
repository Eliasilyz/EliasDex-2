import { getZoroEpisodeSources, ResolveSourcesResult } from "@/lib/external/zoro";

export type { ResolveSourcesResult };

export async function resolveEpisodeSources(
  anilistId: number,
  episodeNumber: number
): Promise<ResolveSourcesResult> {
  if (!Number.isInteger(anilistId) || anilistId <= 0) {
    return {
      success: false,
      error: "NOT_FOUND",
      message: "Invalid anime ID.",
    };
  }
  if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
    return {
      success: false,
      error: "NOT_FOUND",
      message: "Invalid episode number.",
    };
  }

  return getZoroEpisodeSources(anilistId, episodeNumber);
}
