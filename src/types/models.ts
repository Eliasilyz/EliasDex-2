import { ObjectId } from "mongodb";

export type UserRole = "guest" | "member" | "premium" | "admin";

export type SocialPlatform = "instagram" | "tiktok" | "x" | "discord" | "anilist" | "myanimelist";

export interface UserSocials {
  instagram?: string;
  tiktok?: string;
  x?: string;
  discord?: string;
  anilist?: string;
  myanimelist?: string;
}

// ── Collectibles ──────────────────────────────────────────────────────

export type CollectibleType = "border" | "nameStyle" | "rank";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Collectible {
  _id?: ObjectId;
  type: CollectibleType;
  slug: string;           // unique
  name: string;
  description?: string;
  rarity: Rarity;
  assetUrl?: string;      // badge image / border image
  styleConfig?: {         // nameStyle only — whitelist-based, no raw CSS from user
    className?: string;
    gradient?: [string, string];
    animation?: string;
  };
  obtainMethod: "achievement" | "purchase" | "event" | "admin_grant";
  createdAt: Date;
}

export interface UserCollectible {
  _id?: ObjectId;
  userId: ObjectId;
  collectibleId: ObjectId;
  obtainedAt: Date;
  source?: string;        // achievement id / event id / admin userId
}

export interface UserCollectibleSlots {
  border?: ObjectId | null;
  nameStyle?: ObjectId | null;
  rank?: ObjectId | null;
}

export const DEFAULT_COLLECTIBLE_SLOTS: UserCollectibleSlots = {
  border: null,
  nameStyle: null,
  rank: null,
};

export interface ResolvedCollectibles {
  border: Collectible | null;
  nameStyle: Collectible | null;
  rank: Collectible | null;
}

// ── User ──────────────────────────────────────────────────────────────

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash?: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  level: number;
  xp: number;
  createdAt: Date;
  lastLoginAt: Date;
  isGuest: boolean;
  guestExpiresAt?: Date;
  bio?: string;
  profileBannerUrl?: string;
  isVerified: boolean;
  isPublicProfile: boolean;
  joinedAt: Date;
  socials?: UserSocials;
  equippedCollectibles?: UserCollectibleSlots;
  // ── MAL sync (all optional, backward-compatible) ──
  malAuth?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;       // unix ms
    malUserId: number;
    malUsername: string;
  };
  syncPreferences?: {
    autoSyncMal: boolean;
  };
  lastImportedAt?: {
    mal?: number;            // unix ms
  };
  totalEpisodesWatched?: number; // accurate count from last MAL import
  totalAnimeWatched?: number;   // accurate distinct-anime count from last MAL import
}

export interface WatchHistoryEntry {
  _id?: ObjectId;
  userId: string;
  animeId: number; // MAL ID
  animeTitle: string; // Denormalized for zero-API continue watching UI
  animeCoverImageUrl: string; // Denormalized
  episodeNumber: number;
  progressSeconds: number;
  completed: boolean;
  lastWatchedAt: Date;
}

export type WatchlistStatus = "watching" | "plan_to_watch" | "completed" | "on_hold" | "dropped";

export interface Favorite {
  _id?: ObjectId;
  userId: string;
  animeId: number; // MAL ID
  animeTitle: string; // Denormalized
  animeCoverImageUrl: string; // Denormalized
  status: WatchlistStatus;
  addedAt: Date;
}

export interface ChatReplyTo {
  id: string;
  username: string;
  message: string;
}

export interface ChatMessage {
  _id?: ObjectId;
  userId: string;
  username: string;
  avatarUrl?: string;
  level?: number; // Denormalized at write time for zero-join fast reads
  isVerified: boolean; // Denormalized snapshot saat kirim pesan
  message: string;
  roomId: string;
  createdAt: Date;
  isDeleted: boolean;
  replyTo?: ChatReplyTo | null; // Denormalized reply context
  isPinned?: boolean; // Admin-only pin
  equippedCollectibles?: ResolvedCollectibles | null; // Resolved at read time, not stored
}

export type CommentTargetType = "anime" | "episode";

export interface Comment {
  _id?: ObjectId;
  userId: string;
  username: string;
  avatarUrl?: string;
  targetType: CommentTargetType;
  targetId: number; // MAL ID
  episodeNumber?: number; // Present if targetType === 'episode'
  message: string;
  parentId?: ObjectId; // For threaded replies
  createdAt: Date;
  likeCount: number;
}

export interface Announcement {
  _id?: ObjectId;
  title: string;
  body: string; // markdown or plain text
  createdBy: ObjectId; // ref ke admin user
  isActive: boolean; // default: true, admin bisa toggle off tanpa delete
  createdAt: Date;
}
