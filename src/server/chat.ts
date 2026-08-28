import { DB_ENABLED, ENV } from "@/lib/env";
import { insertMessage, getRecentMessages, deleteMessage as modelDeleteMessage } from "@/models/chatMessages";
import type { ChatMessage } from "@/types/models";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: ENV.PUSHER_APP_ID,
  key: ENV.NEXT_PUBLIC_PUSHER_KEY,
  secret: ENV.PUSHER_SECRET,
  cluster: ENV.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export interface SendMessageResult {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export async function sendMessage(
  userId: string,
  username: string,
  avatarUrl: string | undefined,
  userLevel: number,
  roomId: string,
  content: string
): Promise<SendMessageResult> {
  if (!DB_ENABLED) {
    return { success: false, error: "Chat requires database connection" };
  }

  if (!content.trim() || content.length > 500) {
    return { success: false, error: "Message must be 1-500 characters" };
  }

  try {
    const msg = await insertMessage(userId, username, content, roomId, avatarUrl, userLevel);
    if (!msg) {
      return { success: false, error: "Failed to save message" };
    }

    await pusher.trigger(roomId, "message", {
      id: msg._id?.toString(),
      userId: msg.userId,
      username: msg.username,
      avatarUrl: msg.avatarUrl,
      level: msg.level,
      message: msg.message,
      createdAt: msg.createdAt,
      isDeleted: msg.isDeleted,
    });

    return { success: true, message: msg };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send message" };
  }
}

export async function getMessages(
  roomId: string,
  limit = 50
): Promise<ChatMessage[]> {
  if (!DB_ENABLED) return [];

  try {
    return await getRecentMessages(roomId, limit);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    return [];
  }
}

export async function deleteMessage(
  messageId: string,
  userRole: string
): Promise<{ success: boolean; error?: string }> {
  if (!DB_ENABLED) {
    return { success: false, error: "Chat requires database connection" };
  }

  if (userRole !== "admin") {
    return { success: false, error: "Only admins can delete messages" };
  }

  try {
    const result = await modelDeleteMessage(messageId);
    if (!result) {
      return { success: false, error: "Message not found" };
    }

    await pusher.trigger("admin-events", "message-deleted", { messageId });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete message" };
  }
}

export function getPusherInstance() {
  return pusher;
}
