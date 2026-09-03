import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importMalListToLocal } from "@/lib/sync";
import { z } from "zod";

const ImportSchema = z.object({
  platform: z.literal("mal"),
});

/**
 * POST /api/sync/import — Manually trigger import from MAL.
 * Awards XP for each newly imported episode and updates user level.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid platform" },
        { status: 400 }
      );
    }

    const { platform } = parsed.data;
    const userId = session.user.id;

    const result = await importMalListToLocal(userId);

    return NextResponse.json({
      platform,
      imported: result.imported,
      matched: result.matched,
      unmatched: result.unmatched,
      unmatchedTitles: result.unmatchedTitles.slice(0, 20),
      xpAwarded: result.xpAwarded,
      newLevel: result.newLevel,
    });
  } catch (err: any) {
    console.error("Sync import error:", err);
    return NextResponse.json(
      { error: err.message || "Import failed" },
      { status: 500 }
    );
  }
}
