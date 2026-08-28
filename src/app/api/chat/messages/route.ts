import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendMessage, getMessages, deleteMessage } from "@/server/chat";
import { checkChatRateLimit, getChatRateLimitStatus } from "@/lib/chatRateLimiter";
import { z } from "zod";
import { handleApiError } from "@/lib/errors";

const GetMessagesQuerySchema = z.object({
  roomId: z.string().min(1).default("global"),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const SendMessageSchema = z.object({
  roomId: z.string().min(1).default("global"),
  message: z.string().min(1).max(500),
});

const DeleteMessageSchema = z.object({
  id: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = GetMessagesQuerySchema.parse({
      roomId: searchParams.get("roomId") || "global",
      limit: searchParams.get("limit") || "50",
    });

    const messages = await getMessages(parsed.roomId, parsed.limit);
    return NextResponse.json({ messages });
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

    if (!checkChatRateLimit(session.user.id, 5, 60000)) {
      const status = getChatRateLimitStatus(session.user.id);
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", resetAt: status.resetAt },
        { status: 429 }
      );
    }

    const result = await sendMessage(
      session.user.id,
      session.user.username,
      (session.user as any).avatarUrl,
      userLevel,
      parsed.data.roomId,
      parsed.data.message
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 201 });
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
