import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserById, updateUser } from "@/models/user";
import { getWatchHistory } from "@/models/watchHistory";
import { getFavorites } from "@/models/favorites";
import { resolveEquippedCollectibles } from "@/lib/collectibles";
import { z } from "zod";
import { handleApiError } from "@/lib/errors";

const SocialsSchema = z.object({
  instagram: z.string().max(100).optional().or(z.literal("")),
  tiktok: z.string().max(100).optional().or(z.literal("")),
  x: z.string().max(100).optional().or(z.literal("")),
  discord: z.string().max(100).optional().or(z.literal("")),
  anilist: z.string().max(100).optional().or(z.literal("")),
  myanimelist: z.string().max(100).optional().or(z.literal("")),
}).optional();

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
  profileBannerUrl: z.string().url().max(500).optional().or(z.literal("")),
  isPublicProfile: z.boolean().optional(),
  socials: SocialsSchema,
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, history, favorites, collectibles] = await Promise.all([
      findUserById(userId),
      getWatchHistory(userId, 1000),
      getFavorites(userId),
      resolveEquippedCollectibles(userId),
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
        profileBannerUrl: user?.profileBannerUrl,
        bio: user?.bio || "",
        isPublicProfile: user?.isPublicProfile ?? true,
        isVerified: user?.isVerified ?? false,
        joinedAt: user?.joinedAt,
        createdAt: user?.createdAt,
        socials: user?.socials || {},
        collectibles,
        totalEpisodesWatched: user?.totalEpisodesWatched || 0,
        totalAnimeWatched: user?.totalAnimeWatched || 0,
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

    const update: Record<string, unknown> = {};
    if (parsed.data.username !== undefined) update.username = parsed.data.username;
    if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;
    if (parsed.data.avatarUrl !== undefined)
      update.avatarUrl = parsed.data.avatarUrl === "" ? undefined : parsed.data.avatarUrl;
    if (parsed.data.profileBannerUrl !== undefined)
      update.profileBannerUrl =
        parsed.data.profileBannerUrl === "" ? undefined : parsed.data.profileBannerUrl;
    if (parsed.data.isPublicProfile !== undefined) update.isPublicProfile = parsed.data.isPublicProfile;
    if (parsed.data.socials !== undefined) {
      // Strip empty strings, store only non-empty values
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.data.socials)) {
        if (v && v.trim()) clean[k] = v.trim();
      }
      update.socials = clean;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await updateUser(session.user.id, update as any);

    if (!updated) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: updated._id?.toString(),
        username: updated.username,
        email: updated.email,
        bio: updated.bio || "",
        avatarUrl: updated.avatarUrl,
        profileBannerUrl: updated.profileBannerUrl,
        isPublicProfile: updated.isPublicProfile,
        socials: updated.socials || {},
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
