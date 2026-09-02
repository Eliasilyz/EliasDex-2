import { ObjectId } from "mongodb";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { ChatMessage } from "@/types/models";

export interface SaveChatMessageResult {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export async function saveChatMessage(
  userId: string,
  username: string,
  message: string,
  roomId: string,
  avatarUrl?: string,
  level?: number,
  isVerified: boolean = false
): Promise<SaveChatMessageResult> {
  if (!DB_ENABLED) {
    return { success: false, error: "Chat requires database connection" };
  }

  if (!message.trim() || message.length > 500) {
    return { success: false, error: "Message must be 1-500 characters" };
  }

  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    const now = new Date();
    const doc: ChatMessage = {
      userId,
      username,
      avatarUrl,
      level,
      isVerified,
      message,
      roomId,
      createdAt: now,
      isDeleted: false,
    };

    const result = await db
      .collection<ChatMessage>("chat_messages")
      .insertOne(doc);

    return {
      success: true,
      message: {
        _id: result.insertedId,
        ...doc,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save message" };
  }
}

export async function getRecentMessages(roomId: string = "global", limit = 50): Promise<ChatMessage[]> {
  if (!DB_ENABLED) return [];

  const db = await getDb();
  if (!db) return [];

  const arr = await db
    .collection<ChatMessage>("chat_messages")
    .find({ roomId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return arr.reverse();
}