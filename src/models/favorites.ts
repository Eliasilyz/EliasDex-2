import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { Favorite, WatchlistStatus } from "@/types/models";

export type { Favorite, WatchlistStatus };

export async function getFavorites(userId: string): Promise<Favorite[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<Favorite>("favorites")
    .find({ userId })
    .sort({ addedAt: -1 })
    .toArray();
}

export async function getFavoritesByStatus(
  userId: string,
  status: WatchlistStatus
): Promise<Favorite[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<Favorite>("favorites")
    .find({ userId, status })
    .sort({ addedAt: -1 })
    .toArray();
}

export async function addFavorite(
  userId: string,
  animeId: number,
  animeTitle: string,
  animeCoverImageUrl: string,
  status: WatchlistStatus = "watching"
): Promise<Favorite | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  try {
    const doc: Favorite = {
      userId,
      animeId,
      animeTitle,
      animeCoverImageUrl,
      status,
      addedAt: new Date(),
    };
    const result = await db.collection<Favorite>("favorites").insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (err: any) {
    if (err?.code === 11000) return null;
    throw err;
  }
}

export async function updateFavoriteStatus(
  userId: string,
  animeId: number,
  status: WatchlistStatus
): Promise<Favorite | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  const result = await db.collection<Favorite>("favorites").findOneAndUpdate(
    { userId, animeId },
    { $set: { status } },
    { returnDocument: "after" }
  );
  return result ?? null;
}

export async function removeFavorite(userId: string, animeId: number): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  const result = await db.collection<Favorite>("favorites").deleteOne({ userId, animeId });
  return result.deletedCount > 0;
}

export async function isFavorite(userId: string, animeId: number): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  const fav = await db.collection<Favorite>("favorites").findOne({ userId, animeId });
  return !!fav;
}
