import { ObjectId } from "mongodb";
import { DB_ENABLED } from "./env";
import { getDb } from "./db";
import type { User, UserRole, WatchHistoryEntry, UserSocials, ResolvedCollectibles } from "@/types/models";

import { resolveEquippedCollectibles } from "@/lib/collectibles";

export interface PublicUser {
  id: string;
  username: string;
  avatarUrl?: string;
  profileBannerUrl?: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
  level: number;
  xp: number;
  joinedAt: Date;
  isPublicProfile: boolean;
  socials?: UserSocials;
  collectibles?: ResolvedCollectibles;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;

  // Case-insensitive lookup using collation
  return db
    .collection<User>("users")
    .findOne(
      { username: { $regex: new RegExp(`^${username}$`, "i") } },
      { sort: { createdAt: -1 } }
    );
}

export async function getPublicUserByUsername(username: string): Promise<PublicUser | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;

  const user = await getUserByUsername(username);
  if (!user) return null;

  const collectibles = user._id
    ? await resolveEquippedCollectibles(user._id.toString())
    : undefined;

  return {
    id: user._id ? user._id.toString() : "",
    username: user.username,
    avatarUrl: user.avatarUrl,
    profileBannerUrl: user.profileBannerUrl,
    bio: user.bio,
    role: user.role,
    isVerified: user.isVerified,
    level: user.level,
    xp: user.xp,
    joinedAt: user.joinedAt,
    isPublicProfile: user.isPublicProfile,
    socials: user.socials,
    collectibles,
  };
}

export interface PublicUserStats {
  animeCount: number;
  episodeCount: number;
  secondsWatched: number;
}

// Aggregate watch stats for a public profile (distinct anime, total episodes,
// total seconds watched) from the user's watch history.
export async function getPublicUserStats(userId: string): Promise<PublicUserStats> {
  if (!DB_ENABLED) return { animeCount: 0, episodeCount: 0, secondsWatched: 0 };
  const db = await getDb();
  if (!db) return { animeCount: 0, episodeCount: 0, secondsWatched: 0 };

  const pipeline = [
    { $match: { userId } },
    {
      $group: {
        _id: null,
        episodeCount: { $sum: 1 },
        secondsWatched: { $sum: "$progressSeconds" },
        animeList: { $addToSet: "$animeId" },
      },
    },
    { $project: { _id: 0, episodeCount: 1, secondsWatched: 1, animeCount: { $size: "$animeList" } } },
  ] as any;

  const result = await db
    .collection<WatchHistoryEntry>("watch_history")
    .aggregate<PublicUserStats>(pipeline)
    .toArray();

  if (!result[0]) return { animeCount: 0, episodeCount: 0, secondsWatched: 0 };
  return result[0];
}

// Migration: backfill joinedAt from ObjectId timestamp for existing users
// who don't have it explicitly set (joinedAt defaults to createdAt)
export async function backfillJoinedAt(): Promise<{ modifiedCount: number }> {
  if (!DB_ENABLED) return { modifiedCount: 0 };
  const db = await getDb();
  if (!db) return { modifiedCount: 0 };

  const result = await db
    .collection<User>("users")
    .updateMany(
      { joinedAt: { $exists: false } },
      { $set: { joinedAt: new Date() } }
    );

  return { modifiedCount: result.modifiedCount };
}

export async function ensureUsernameIndex(): Promise<void> {
  if (!DB_ENABLED) return;
  const db = await getDb();
  if (!db) return;

  await db.collection("users").createIndex(
    { username: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
  );
}