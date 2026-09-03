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

  // Case-insensitive lookup matching the users.username collation index so the
  // query uses the index instead of a collection scan.
  return db
    .collection<User>("users")
    .findOne(
      { username },
      { collation: { locale: "en", strength: 2 } }
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

const SECONDS_PER_EPISODE = 24 * 60; // 24 minutes/episode, matches own-profile stat

// Public profile watch stats, kept consistent with the own-profile (/profile)
// calculation:
//   - Episodes use the user's accurate `totalEpisodesWatched` when set, else the
//     watch_history row count.
//   - Anime is the number of distinct anime in watch_history.
//   - "Watched" time is derived from episode count (24 min/episode).
export async function getPublicUserStats(userId: string): Promise<PublicUserStats> {
  if (!DB_ENABLED) return { animeCount: 0, episodeCount: 0, secondsWatched: 0 };
  const db = await getDb();
  if (!db) return { animeCount: 0, episodeCount: 0, secondsWatched: 0 };

  const user = await db
    .collection<User>("users")
    .findOne({ _id: new ObjectId(userId) });

  const historyCount = await db
    .collection<WatchHistoryEntry>("watch_history")
    .countDocuments({ userId });

  const distinctAnime = await db
    .collection<WatchHistoryEntry>("watch_history")
    .distinct("animeId", { userId });

  const episodeCount = (user?.totalEpisodesWatched && user.totalEpisodesWatched > 0)
    ? user.totalEpisodesWatched
    : historyCount;

  // Anime count uses the same MAL-anchored source as episodes (accurate
  // distinct-anime count from the last import) when available, falling back
  // to distinct anime in watch_history — so "episodes" and "anime" can never
  // disagree about which set they're counting.
  const animeCount =
    user?.totalAnimeWatched && user.totalAnimeWatched > 0
      ? user.totalAnimeWatched
      : distinctAnime.length;

  return {
    animeCount,
    episodeCount,
    secondsWatched: episodeCount * SECONDS_PER_EPISODE,
  };
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