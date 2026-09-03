import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import { findUserById, updateUser } from "@/models/user";
import {
  updateMalListStatus,
  refreshMalToken,
  fetchMalUserList,
  type MalStatus,
} from "@/lib/mal";
import { XP_PER_EPISODE, levelFromXp } from "@/lib/xp";
import type { WatchHistoryEntry, WatchlistStatus } from "@/types/models";
import type { AnyBulkWriteOperation } from "mongodb";

// ── Status mapping helpers ─────────────────────────────────────────────

function watchStatusToMalStatus(completed: boolean): MalStatus {
  return completed ? "completed" : "watching";
}

// ── Token refresh helper ───────────────────────────────────────────────

async function ensureMalToken(user: any): Promise<string | null> {
  if (!user.malAuth) return null;

  const { accessToken, refreshToken, expiresAt } = user.malAuth;

  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return accessToken;
  }

  try {
    const tokenRes = await refreshMalToken(refreshToken);
    const newExpiresAt = Date.now() + tokenRes.expires_in * 1000;

    await updateUser(user._id!.toString(), {
      malAuth: {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresAt: newExpiresAt,
        malUserId: user.malAuth.malUserId,
        malUsername: user.malAuth.malUsername,
      },
    });

    return tokenRes.access_token;
  } catch (err) {
    console.error("[Sync] MAL token refresh failed:", err);
    return null;
  }
}

// ── XP award helper ────────────────────────────────────────────────────

/**
 * Set user XP directly from total episode count (source of truth).
 * Used during import to override any partial XP from manual watching.
 */
async function setXpFromEpisodeCount(
  userId: string,
  episodeCount: number
): Promise<{ totalXp: number; level: number }> {
  const db = await getDb();
  if (!db) return { totalXp: 0, level: 0 };

  const targetXp = episodeCount * XP_PER_EPISODE;
  const targetLevel = levelFromXp(targetXp);

  const result = await db.collection("users").findOneAndUpdate(
    { _id: new (await import("mongodb")).ObjectId(userId) },
    { $set: { xp: targetXp, level: targetLevel } },
    { returnDocument: "after" }
  );

  return {
    totalXp: result?.xp || targetXp,
    level: result?.level || targetLevel,
  };
}

// ── Public: push single episode to MAL ─────────────────────────────────

export async function syncEpisodeProgress(
  userId: string,
  malId: number,
  episodeNumber: number,
  completed: boolean
): Promise<{ mal: boolean }> {
  const result = { mal: false };

  try {
    const user = await findUserById(userId);
    if (!user) return result;

    const prefs = user.syncPreferences;

    // ── Push to MAL ──
    if (prefs?.autoSyncMal && user.malAuth) {
      try {
        const token = await ensureMalToken(user);
        if (token) {
          await updateMalListStatus(
            token,
            malId,
            watchStatusToMalStatus(completed),
            episodeNumber
          );
          result.mal = true;
        }
      } catch (err) {
        console.error("[Sync] MAL push failed:", err);
      }
    }
  } catch (err) {
    console.error("[Sync] syncEpisodeProgress error:", err);
  }

  return result;
}

// ── Public: import MAL list → local watch_history + XP ─────────────────

export async function importMalListToLocal(
  userId: string
): Promise<{
  imported: number;
  matched: number;
  unmatched: number;
  unmatchedTitles: string[];
  xpAwarded: number;
  newLevel: number;
}> {
  const user = await findUserById(userId);
  if (!user?.malAuth) throw new Error("MAL not connected");

  const token = await ensureMalToken(user);
  if (!token) throw new Error("MAL token expired and refresh failed");

  const malList = await fetchMalUserList(token);
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const historyCol = db.collection<WatchHistoryEntry>("watch_history");
  const favCol = db.collection("favorites");

  // Clear old entries to avoid duplicates from previous imports
  await historyCol.deleteMany({ userId });

  let imported = 0;
  let matched = 0;
  let unmatched = 0;
  let totalEpisodesFromMal = 0;
  let totalAnimeFromMal = 0;
  const unmatchedTitles: string[] = [];
  const historyOps: AnyBulkWriteOperation<WatchHistoryEntry>[] = [];

  for (let i = 0; i < malList.length; i++) {
    const entry = malList[i];
    const malId = entry.node.id;
    const status = entry.list_status.status;
    const episodesWatched = entry.list_status.num_episodes_watched;

    // Only import watching/completed
    if (status !== "watching" && status !== "completed") continue;

    matched++;
    totalEpisodesFromMal += episodesWatched;
    if (episodesWatched > 0) totalAnimeFromMal++;

    if (episodesWatched > 0) {
      historyOps.push({
        updateOne: {
          filter: { userId, animeId: malId, episodeNumber: episodesWatched },
          update: {
            $set: {
              animeTitle: entry.node.title,
              animeCoverImageUrl:
                entry.node.main_picture?.large ||
                entry.node.main_picture?.medium ||
                "",
              completed: status === "completed",
              progressSeconds: 0,
              lastWatchedAt: new Date(entry.list_status.updated_at),
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (historyOps.length > 0) {
    const res = await historyCol.bulkWrite(historyOps, { ordered: false });
    if (res.hasWriteErrors?.()) {
      res.getWriteErrors().forEach(e =>
        console.error("[Sync] bulkWrite item failed:", { index: e.index, err: e.err })
      );
    }
    imported = res.upsertedCount;
  }

  // Sync the local Watchlist (favorites) from MAL so the profile/watchlist
  // reflects the user's full anime list (watching, plan_to_watch, completed,
  // on_hold, dropped). Batch upsert keeps status in step with MAL.
  const favOps: AnyBulkWriteOperation<any>[] = [];
  for (let i = 0; i < malList.length; i++) {
    const entry = malList[i];
    const malId = entry.node.id;
    const status = entry.list_status.status as WatchlistStatus;
    favOps.push({
      updateOne: {
        filter: { userId, animeId: malId },
        update: {
          $set: { status },
          $setOnInsert: {
            animeTitle: entry.node.title,
            animeCoverImageUrl:
              entry.node.main_picture?.large ||
              entry.node.main_picture?.medium ||
              "",
            addedAt: new Date(entry.list_status.updated_at),
          },
        },
        upsert: true,
      },
    });
  }
  if (favOps.length > 0) {
    const res = await favCol.bulkWrite(favOps, { ordered: false });
    if (res.hasWriteErrors?.()) {
      res.getWriteErrors().forEach(e =>
        console.error("[Sync] bulkWrite item failed:", { index: e.index, err: e.err })
      );
    }
  }

  // Set XP based on TOTAL episodes from MAL (source of truth), not just new entries
  const { totalXp, level } = await setXpFromEpisodeCount(userId, totalEpisodesFromMal);

  // Update lastImportedAt + store accurate episode count
  await updateUser(userId, {
    lastImportedAt: {
      ...user.lastImportedAt,
      mal: Date.now(),
    },
    totalEpisodesWatched: totalEpisodesFromMal,
    totalAnimeWatched: totalAnimeFromMal,
  });

  console.log(
    `[MAL Import] User ${userId}: ${imported} new entries, ${matched} matched, ${unmatched} unmatched, total ${totalEpisodesFromMal} episodes → ${totalXp} XP, level ${level}`
  );

  return {
    imported,
    matched,
    unmatched,
    unmatchedTitles,
    xpAwarded: totalEpisodesFromMal * XP_PER_EPISODE,
    newLevel: level,
  };
}
