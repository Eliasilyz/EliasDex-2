import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendMessage, getMessages, deleteMessage, togglePin } from "@/server/chat";
import { checkChatRateLimit, getChatRateLimitStatus } from "@/lib/chatRateLimiter";
import { resolveEquippedCollectibles } from "@/lib/collectibles";
import { z } from "zod";
import { handleApiError } from "@/lib/errors";

const GetMessagesQuerySchema = z.object({
  roomId: z.string().min(1).default("global"),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const ReplyToSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1).max(30),
  message: z.string().min(1).max(500),
});

const SendMessageSchema = z.object({
  roomId: z.string().min(1).default("global"),
  message: z.string().min(1).max(500),
  replyTo: ReplyToSchema.nullable().optional(),
});

const DeleteMessageSchema = z.object({
  id: z.string().min(1),
});

const PinMessageSchema = z.object({
  id: z.string().min(1),
  isPinned: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = GetMessagesQuerySchema.parse({
      roomId: searchParams.get("roomId") || "global",
      limit: searchParams.get("limit") || "50",
    });

    const messages = await getMessages(parsed.roomId, parsed.limit);

    // Batch-resolve collectibles for unique user IDs
    const uniqueUserIds = [...new Set(messages.map((m) => m.userId))];
    const collectiblesMap = new Map();
    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        collectiblesMap.set(uid, await resolveEquippedCollectibles(uid));
      })
    );

    const messagesWithCollectibles = messages.map((m) => ({
      ...m,
      equippedCollectibles: collectiblesMap.get(m.userId) ?? null,
    }));

    return NextResponse.json({ messages: messagesWithCollectibles });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";
    const isGuest = (session.user as any).isGuest;
    const userLevel = (session.user as any).level || 0;

    if (isGuest) {
      return NextResponse.json({ error: "Guests cannot send messages" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    if (!checkChatRateLimit(session.user.id, 1, 2000)) {
      const status = getChatRateLimitStatus(session.user.id);
      return NextResponse.json(
        { error: "Too many messages. Slow down (1 message / 2s).", resetAt: status.resetAt },
        { status: 429 }
      );
    }

    const result = await sendMessage(
      session.user.id,
      session.user.username,
      (session.user as any).avatarUrl,
      userLevel,
      parsed.data.roomId,
      parsed.data.message,
      (session.user as any).isVerified === true,
      parsed.data.replyTo ?? null
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Resolve collectibles for the response so optimistic UI gets them
    const collectibles = await resolveEquippedCollectibles(session.user.id);
    const messageWithCollectibles = result.message
      ? { ...result.message, equippedCollectibles: collectibles }
      : result.message;

    return NextResponse.json({ message: messageWithCollectibles }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Only admins can delete messages" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = DeleteMessageSchema.safeParse({ id: searchParams.get("id") });

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid message ID is required" }, { status: 400 });
    }

    const result = await deleteMessage(parsed.data.id, userRole);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Only admins can pin messages" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PinMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid id and isPinned are required" }, { status: 400 });
    }

    const ok = parsed.data.isPinned;

    const result = await togglePin(parsed.data.id, userRole, ok);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      isPinned: ok,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
