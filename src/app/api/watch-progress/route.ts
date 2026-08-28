import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateWatchProgress, getWatchHistory } from "@/models/watchHistory";
import { addXp, findUserById } from "@/models/user";
import { XP_PER_EPISODE, levelFromXp } from "@/lib/xp";
import { z } from "zod";

const WatchProgressSchema = z.object({
  malId: z.coerce.number().int().positive(),
  episodeNumber: z.coerce.number().int().positive(),
  animeTitle: z.string().min(1),
  animeCoverImageUrl: z.string().optional(),
  completed: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = WatchProgressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { malId, episodeNumber, animeTitle, animeCoverImageUrl, completed } = parsed.data;

    const userId = session.user.id;
    const existingHistory = await getWatchHistory(userId);

    const wasCompleted = existingHistory.some(
      (h) => h.animeId === malId && h.episodeNumber === episodeNumber && h.completed
    );

    const entry = await updateWatchProgress(
      userId,
      malId,
      episodeNumber,
      0,
      animeTitle,
      animeCoverImageUrl || "",
      completed ?? false
    );

    if (!entry) {
      return NextResponse.json({ error: "Failed to update watch progress" }, { status: 500 });
    }

    let xpAwarded = false;
    let xpMessage = "Progress updated";
    let newXp = 0;

    if (completed && !wasCompleted) {
      const xp = await addXp(userId, XP_PER_EPISODE);
      if (xp !== null) {
        xpAwarded = true;
        newXp = xp;
        xpMessage = `Completed episode! +${XP_PER_EPISODE} XP`;
      }
    }

    const updatedUser = await findUserById(userId);
    const finalLevel = levelFromXp(updatedUser?.xp || 0);
    const totalXp = updatedUser?.xp || newXp;

    return NextResponse.json({
      watchHistory: entry,
      xpAwarded,
      xpMessage,
      userXp: totalXp,
      userLevel: finalLevel,
    });
  } catch (err: any) {
    console.error("Watch progress error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
