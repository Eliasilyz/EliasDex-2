import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { DB_ENABLED } from "@/lib/env";
import { ObjectId } from "mongodb";
import { z } from "zod";

const DisconnectSchema = z.object({
  platform: z.literal("mal"),
});

/**
 * POST /api/sync/disconnect — Disconnect MAL from user account.
 * Body: { platform: "mal" }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!DB_ENABLED) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = DisconnectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid platform" },
        { status: 400 }
      );
    }

    const { platform } = parsed.data;
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const field = "malAuth";
    const prefField = "autoSyncMal";

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $unset: { [field]: "" },
        $set: {
          [`syncPreferences.${prefField}`]: false,
        },
      }
    );

    return NextResponse.json({ success: true, platform });
  } catch (err: any) {
    console.error("Sync disconnect error:", err);
    return NextResponse.json(
      { error: err.message || "Disconnect failed" },
      { status: 500 }
    );
  }
}
