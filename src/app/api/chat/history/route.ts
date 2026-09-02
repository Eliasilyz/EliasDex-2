import { NextRequest, NextResponse } from "next/server";
import { getRecentMessages } from "@/lib/chat";
import { resolveEquippedCollectibles } from "@/lib/collectibles";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId") || "global";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

    const messages = await getRecentMessages(roomId, limit);

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
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
