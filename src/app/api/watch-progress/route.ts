import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateWatchProgress, getWatchHistory, clearWatchHistory, deleteWatchHistoryEntry } from "@/models/watchHistory";
import { addXp, findUserById } from "@/models/user";
import { XP_PER_EPISODE, levelFromXp } from "@/lib/xp";
import { syncEpisodeProgress } from "@/lib/sync";
import { z } from "zod";
import { checkMutatingRateLimit } from "@/lib/apiRateLimiter";

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

    // 30 requests/minute — prevents import / sync storms
    const rl = checkMutatingRateLimit(`watch-progress:${session.user.id}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit reached. Try again shortly.", resetAt: rl.resetAt },
        { status: 429 }
      );
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

    // Fire-and-forget: push progress to MAL if connected
    syncEpisodeProgress(userId, malId, episodeNumber, completed ?? false)
      .then((syncResult) => {
        if (syncResult.mal) {
          console.log(
            `[Sync] Episode ${episodeNumber} pushed to: MAL=${syncResult.mal}`
          );
        }
      })
      .catch((err) => {
        console.error("[Sync] Background sync failed:", err);
      });

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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getWatchHistory(session.user.id, 200);
    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Watch history fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    if (body.clearAll) {
      const ok = await clearWatchHistory(session.user.id);
      return NextResponse.json({ success: ok });
    }

    const animeId = Number(body.animeId);
    if (!animeId || !Number.isInteger(animeId)) {
      return NextResponse.json({ error: "animeId is required" }, { status: 400 });
    }

    const ok = await deleteWatchHistoryEntry(session.user.id, animeId);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    console.error("Watch history delete error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
