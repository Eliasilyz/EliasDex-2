import { buildStreamUrl, StreamSource } from "../stream";

export interface ZoroServer {
  serverId: string;
  serverName: string;
  embedUrl: string;
  quality?: string;
  isM3U8?: boolean;
}

export interface ZoroSourcesResult {
  servers: ZoroServer[];
  episodeNumber: number;
}

export type ResolveSourcesResult =
  | { success: true; data: ZoroSourcesResult }
  | { success: false; error: "NOT_FOUND" | "RATE_LIMITED" | "DOWN" | "UNKNOWN"; message: string };

export async function getZoroEpisodeSources(
  anilistId: number,
  episodeNumber: number
): Promise<ResolveSourcesResult> {
  try {
    const defaultServers: ZoroServer[] = [
      {
        serverId: "zoko",
        serverName: "Zoko (Fast)",
        embedUrl: buildStreamUrl("zoko", anilistId, episodeNumber),
      },
      {
        serverId: "megaplay-ani",
        serverName: "MegaPlay HD",
        embedUrl: buildStreamUrl("ani", anilistId, episodeNumber),
      },
      {
        serverId: "embed-fallback",
        serverName: "VidStream (Backup)",
        embedUrl: buildStreamUrl("fallback", anilistId, episodeNumber),
      },
    ];

    return {
      success: true,
      data: {
        servers: defaultServers,
        episodeNumber,
      },
    };
  } catch (err: any) {
    const status = err?.status;
    if (status === 429) {
      return { success: false, error: "RATE_LIMITED", message: "Streaming provider is currently rate-limited." };
    }
    if (status === 404) {
      return { success: false, error: "NOT_FOUND", message: "Episode sources could not be found." };
    }
    return { success: false, error: "UNKNOWN", message: err?.message || "Failed to resolve stream sources." };
  }
}
