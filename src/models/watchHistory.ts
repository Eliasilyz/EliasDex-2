import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { WatchHistoryEntry } from "@/types/models";

export type { WatchHistoryEntry };

export async function getWatchHistory(userId: string, limit = 50): Promise<WatchHistoryEntry[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<WatchHistoryEntry>("watch_history")
    .find({ userId })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getContinueWatching(userId: string, limit = 10): Promise<WatchHistoryEntry[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<WatchHistoryEntry>("watch_history")
    .find({ userId, completed: false })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .toArray();
}

export async function updateWatchProgress(
  userId: string,
  animeId: number,
  episodeNumber: number,
  progressSeconds: number,
  animeTitle: string,
  animeCoverImageUrl: string,
  completed: boolean = false
): Promise<WatchHistoryEntry | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  const result = await db.collection<WatchHistoryEntry>("watch_history").findOneAndUpdate(
    { userId, animeId, episodeNumber },
    {
      $set: {
        progressSeconds,
        animeTitle,
        animeCoverImageUrl,
        completed,
        lastWatchedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return result ?? null;
}

export async function clearWatchHistory(userId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .collection<WatchHistoryEntry>("watch_history")
    .deleteMany({ userId });
  return result.deletedCount > 0;
}

export async function deleteWatchHistoryEntry(userId: string, animeId: number): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .collection<WatchHistoryEntry>("watch_history")
    .deleteMany({ userId, animeId });
  return result.deletedCount > 0;
}
