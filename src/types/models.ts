import { ObjectId } from "mongodb";

export type UserRole = "guest" | "member" | "premium" | "admin";

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
}

export interface WatchHistoryEntry {
  _id?: ObjectId;
  userId: string;
  animeId: number; // AniList ID
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
  animeId: number; // AniList ID
  animeTitle: string; // Denormalized
  animeCoverImageUrl: string; // Denormalized
  status: WatchlistStatus;
  addedAt: Date;
}

export interface ChatMessage {
  _id?: ObjectId;
  userId: string;
  username: string;
  avatarUrl?: string;
  level?: number; // Denormalized at write time for zero-join fast reads
  message: string;
  roomId: string;
  createdAt: Date;
  isDeleted: boolean;
}

export type CommentTargetType = "anime" | "episode";

export interface Comment {
  _id?: ObjectId;
  userId: string;
  username: string;
  avatarUrl?: string;
  targetType: CommentTargetType;
  targetId: number; // AniList ID
  episodeNumber?: number; // Present if targetType === 'episode'
  message: string;
  parentId?: ObjectId; // For threaded replies
  createdAt: Date;
  likeCount: number;
}
