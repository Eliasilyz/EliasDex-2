import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getFavorites,
  addFavorite,
  updateFavoriteStatus,
  removeFavorite,
  isFavorite,
} from "@/models/favorites";
import { z } from "zod";
import { handleApiError } from "@/lib/errors";

const FavoriteSchema = z.object({
  animeId: z.coerce.number().int().positive(),
  animeTitle: z.string().min(1),
  animeCoverImageUrl: z.string().optional().default(""),
  status: z
    .enum(["watching", "plan_to_watch", "completed", "on_hold", "dropped"])
    .default("watching"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await getFavorites(session.user.id);
    return NextResponse.json({ favorites });
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

    const body = await req.json();
    const parsed = FavoriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { animeId, animeTitle, animeCoverImageUrl, status } = parsed.data;

    const exists = await isFavorite(session.user.id, animeId);
    const result = exists
      ? await updateFavoriteStatus(session.user.id, animeId, status)
      : await addFavorite(session.user.id, animeId, animeTitle, animeCoverImageUrl, status);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorite: result });
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

    const body = await req.json().catch(() => ({}));
    const animeId = Number(body.animeId);
    if (!animeId || !Number.isInteger(animeId)) {
      return NextResponse.json({ error: "animeId is required" }, { status: 400 });
    }

    const ok = await removeFavorite(session.user.id, animeId);
    return NextResponse.json({ success: ok });
  } catch (err) {
    return handleApiError(err);
  }
}
