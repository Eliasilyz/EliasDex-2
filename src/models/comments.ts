import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { Comment, CommentTargetType } from "@/types/models";

export type { Comment, CommentTargetType };

export async function getComments(targetId: number, limit = 100): Promise<Comment[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<Comment>("comments")
    .find({ targetId, parentId: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getEpisodeComments(
  targetId: number,
  episodeNumber: number,
  limit = 100
): Promise<Comment[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<Comment>("comments")
    .find({ targetId, episodeNumber, parentId: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getReplies(parentId: string, limit = 50): Promise<Comment[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  if (!ObjectId.isValid(parentId)) return [];
  return db
    .collection<Comment>("comments")
    .find({ parentId: new ObjectId(parentId) })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();
}

export async function addComment(
  userId: string,
  username: string,
  targetType: CommentTargetType,
  targetId: number,
  message: string,
  avatarUrl?: string,
  episodeNumber?: number,
  parentId?: string
): Promise<Comment | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  const doc: Comment = {
    userId,
    username,
    avatarUrl,
    targetType,
    targetId,
    episodeNumber,
    message,
    parentId: parentId && ObjectId.isValid(parentId) ? new ObjectId(parentId) : undefined,
    createdAt: new Date(),
    likeCount: 0,
  };
  const result = await db.collection<Comment>("comments").insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function likeComment(commentId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(commentId)) return false;
  const result = await db.collection<Comment>("comments").updateOne(
    { _id: new ObjectId(commentId) },
    { $inc: { likeCount: 1 } }
  );
  return result.modifiedCount > 0;
}

export async function unlikeComment(commentId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(commentId)) return false;
  const result = await db.collection<Comment>("comments").updateOne(
    { _id: new ObjectId(commentId) },
    { $inc: { likeCount: -1 } }
  );
  return result.modifiedCount > 0;
}
