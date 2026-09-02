import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getUserByUsername } from "@/lib/users";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username: targetUsername } = await params;
    const user = await getUserByUsername(targetUsername);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isPublicProfile) {
      return NextResponse.json({ error: "Private profile" }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      level: user.level,
      xp: user.xp,
      joinedAt: user.joinedAt,
    });
  } catch (err) {
    return handleApiError(err);
  }
}