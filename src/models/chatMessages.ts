import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { ChatMessage } from "@/types/models";

export type { ChatMessage };

export async function getRecentMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
  if (!DB_ENABLED) return [];
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<ChatMessage>("chat_messages")
    .find({ roomId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function insertMessage(
  userId: string,
  username: string,
  message: string,
  roomId: string,
  avatarUrl?: string,
  level?: number
): Promise<ChatMessage | null> {
  if (!DB_ENABLED) return null;
  const db = await getDb();
  if (!db) return null;
  const doc: ChatMessage = {
    userId,
    username,
    avatarUrl,
    level,
    message,
    roomId,
    createdAt: new Date(),
    isDeleted: false,
  };
  const result = await db.collection<ChatMessage>("chat_messages").insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  const db = await getDb();
  if (!db) return false;
  if (!ObjectId.isValid(messageId)) return false;
  const result = await db.collection<ChatMessage>("chat_messages").updateOne(
    { _id: new ObjectId(messageId) },
    { $set: { isDeleted: true } }
  );
  return result.modifiedCount > 0;
}
