import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserById, updateUser } from "@/models/user";
import { getWatchHistory } from "@/models/watchHistory";
import { getFavorites } from "@/models/favorites";
import { z } from "zod";
import { handleApiError } from "@/lib/errors";

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(20),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, history, favorites] = await Promise.all([
      findUserById(userId),
      getWatchHistory(userId, 100),
      getFavorites(userId),
    ]);

    return NextResponse.json({
      user: {
        id: user?._id?.toString() || session.user.id,
        email: user?.email || session.user.email,
        username: user?.username || session.user.username,
        role: user?.role || (session.user as any).role,
        level: user?.level || session.user.level || 0,
        xp: user?.xp || 0,
        avatarUrl: user?.avatarUrl || (session.user as any).avatarUrl,
        createdAt: user?.createdAt,
      },
      watchHistory: history,
      favorites,
    });
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

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updated = await updateUser(session.user.id, {
      username: parsed.data.username,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: updated._id?.toString(),
        username: updated.username,
        email: updated.email,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
