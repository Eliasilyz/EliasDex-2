import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserById, updateUser } from "@/models/user";
import { z } from "zod";

const UpdatePrefsSchema = z.object({
  autoSyncMal: z.boolean().optional(),
});

/**
 * GET /api/sync/status — Get current sync connection status.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      mal: {
        connected: !!user.malAuth,
        username: user.malAuth?.malUsername || null,
        autoSync: user.syncPreferences?.autoSyncMal ?? false,
        lastImportedAt: user.lastImportedAt?.mal || null,
      },
    });
  } catch (err: any) {
    console.error("Sync status error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get sync status" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sync/status — Update sync preferences (auto-sync toggles).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdatePrefsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const user = await findUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const update: Record<string, any> = {};
    if (parsed.data.autoSyncMal !== undefined) {
      // Only allow if MAL is connected
      if (parsed.data.autoSyncMal && !user.malAuth) {
        return NextResponse.json(
          { error: "MAL not connected" },
          { status: 400 }
        );
      }
      update["syncPreferences.autoSyncMal"] = parsed.data.autoSyncMal;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await updateUser(session.user.id, {
      syncPreferences: {
        autoSyncMal: update["syncPreferences.autoSyncMal"] ?? user.syncPreferences?.autoSyncMal ?? false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sync prefs error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update sync preferences" },
      { status: 500 }
    );
  }
}
