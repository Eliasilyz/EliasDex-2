import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUsers } from "@/models/user";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || "member";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const users = await listUsers(search, 100);

    const safeUsers = users.map((u) => ({
      _id: u._id?.toString(),
      username: u.username,
      email: u.email,
      role: u.role,
      level: u.level,
      xp: u.xp,
      bio: u.bio || "",
      isVerified: u.isVerified,
      isGuest: u.isGuest,
      isPublicProfile: u.isPublicProfile,
      joinedAt: u.joinedAt,
      createdAt: u.createdAt,
      socials: u.socials || {},
      equippedCollectibles: u.equippedCollectibles || { border: null, nameStyle: null, rank: null },
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (err) {
    return handleApiError(err);
  }
}