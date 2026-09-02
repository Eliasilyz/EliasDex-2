import { DB_ENABLED, ENV } from "@/lib/env";
import {
  insertMessage,
  getRecentMessages,
  deleteMessage as modelDeleteMessage,
  setMessagePinned,
} from "@/models/chatMessages";
import { resolveEquippedCollectibles } from "@/lib/collectibles";
import type { ChatMessage, ChatReplyTo, ResolvedCollectibles } from "@/types/models";
import Pusher from "pusher";

const PUSHER_ENABLED = !!(ENV.PUSHER_APP_ID && ENV.PUSHER_SECRET && ENV.NEXT_PUBLIC_PUSHER_KEY);

const pusher = PUSHER_ENABLED
  ? new Pusher({
      appId: ENV.PUSHER_APP_ID,
      key: ENV.NEXT_PUBLIC_PUSHER_KEY,
      secret: ENV.PUSHER_SECRET,
      cluster: ENV.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// Best-effort Pusher broadcast. Never throws — a missing/misconfigured
// Pusher account must not break message sending (global chat uses Socket.io).
async function broadcastViaPusher(channel: string, event: string, data: unknown): Promise<void> {
  if (!PUSHER_ENABLED || !pusher) return;
  try {
    await pusher.trigger(channel, event, data);
  } catch (err) {
    console.error("[Pusher] broadcast failed (ignored):", err);
  }
}

// Best-effort Socket.io broadcast. Uses the io instance exposed by server.ts.
// Never throws — chat must keep working even without an active socket server.
function emitToSocket(event: string, data: unknown): void {
  try {
    const io = (globalThis as any).io;
    if (io && typeof io.emit === "function") {
      io.emit(event, data);
    }
  } catch (err) {
    console.error("[Socket.io] emit failed (ignored):", err);
  }
}

function serializeMessage(msg: ChatMessage, collectibles?: ResolvedCollectibles) {
  return {
    _id: msg._id?.toString(),
    userId: msg.userId,
    username: msg.username,
    avatarUrl: msg.avatarUrl,
    level: msg.level,
    isVerified: msg.isVerified,
    message: msg.message,
    createdAt: msg.createdAt,
    isDeleted: msg.isDeleted,
    replyTo: msg.replyTo ?? null,
    isPinned: msg.isPinned ?? false,
    equippedCollectibles: collectibles ?? null,
  };
}

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
  content: string,
  isVerified: boolean = false,
  replyTo?: ChatReplyTo | null
): Promise<SendMessageResult> {
  if (!DB_ENABLED) {
    return { success: false, error: "Chat requires database connection" };
  }

  if (!content.trim() || content.length > 500) {
    return { success: false, error: "Message must be 1-500 characters" };
  }

  try {
    const msg = await insertMessage(userId, username, content, roomId, avatarUrl, userLevel, isVerified, replyTo);
    if (!msg) {
      return { success: false, error: "Failed to save message" };
    }

    const collectibles = await resolveEquippedCollectibles(userId);
    const serialized = serializeMessage(msg, collectibles);
    await broadcastViaPusher(roomId, "message", serialized);
    emitToSocket("chat:message", serialized);

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

    await broadcastViaPusher("admin-events", "message-deleted", { messageId });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete message" };
  }
}

export async function togglePin(
  messageId: string,
  userRole: string,
  isPinned: boolean
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  if (!DB_ENABLED) {
    return { success: false, error: "Chat requires database connection" };
  }

  if (userRole !== "admin") {
    return { success: false, error: "Only admins can pin messages" };
  }

  try {
    const updated = await setMessagePinned(messageId, isPinned);
    if (!updated) {
      return { success: false, error: "Message not found" };
    }

    const collectibles = await resolveEquippedCollectibles(updated.userId);
    const serialized = serializeMessage(updated, collectibles);
    emitToSocket("chat:pin", { message: serialized, isPinned });
    await broadcastViaPusher("admin-events", "message-pinned", serialized);

    return { success: true, message: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update pin" };
  }
}

export function getPusherInstance() {
  return pusher;
}
