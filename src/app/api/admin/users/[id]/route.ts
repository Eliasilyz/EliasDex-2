import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserById, updateUser } from "@/models/user";
import { grantCollectible, revokeCollectible } from "@/lib/collectibles";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";
import { ObjectId } from "mongodb";

const AdminUpdateSchema = z.object({
  action: z.enum(["updateProfile", "setRole", "setXp", "setLevel", "toggleVerified", "grantCollectible", "revokeCollectible", "delete"]),
  // updateProfile
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  profileBannerUrl: z.string().max(500).optional().or(z.literal("")),
  isPublicProfile: z.boolean().optional(),
  // setRole
  role: z.enum(["guest", "member", "premium", "admin"]).optional(),
  // setXp / setLevel
  xp: z.number().int().min(0).optional(),
  level: z.number().int().min(0).optional(),
  // grant/revoke collectible
  collectibleId: z.string().optional(),
  source: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || "member";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const adminId = session!.user!.id;

    const body = await req.json();
    const parsed = AdminUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    switch (action) {
      case "updateProfile": {
        const updates: Record<string, unknown> = {};
        if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
        if (parsed.data.avatarUrl !== undefined)
          updates.avatarUrl = parsed.data.avatarUrl === "" ? undefined : parsed.data.avatarUrl;
        if (parsed.data.profileBannerUrl !== undefined)
          updates.profileBannerUrl = parsed.data.profileBannerUrl === "" ? undefined : parsed.data.profileBannerUrl;
        if (parsed.data.isPublicProfile !== undefined) updates.isPublicProfile = parsed.data.isPublicProfile;

        if (Object.keys(updates).length === 0) {
          return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }
        const updated = await updateUser(id, updates as any);
        if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ success: true, user: { id: updated._id?.toString(), ...updates } });
      }

      case "setRole": {
        if (!parsed.data.role) return NextResponse.json({ error: "Role required" }, { status: 400 });
        const updated = await updateUser(id, { role: parsed.data.role } as any);
        if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ success: true, role: updated.role });
      }

      case "setXp": {
        if (parsed.data.xp === undefined) return NextResponse.json({ error: "XP required" }, { status: 400 });
        const updated = await updateUser(id, { xp: parsed.data.xp } as any);
        if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ success: true, xp: updated.xp, level: updated.level });
      }

      case "setLevel": {
        if (parsed.data.level === undefined) return NextResponse.json({ error: "Level required" }, { status: 400 });
        const updated = await updateUser(id, { level: parsed.data.level } as any);
        if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json({ success: true, level: updated.level });
      }

      case "toggleVerified": {
        const user = await findUserById(id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const updated = await updateUser(id, { isVerified: !user.isVerified } as any);
        if (!updated) return NextResponse.json({ error: "Failed" }, { status: 500 });
        return NextResponse.json({ success: true, isVerified: updated.isVerified });
      }

      case "grantCollectible": {
        if (!parsed.data.collectibleId) return NextResponse.json({ error: "collectibleId required" }, { status: 400 });
        const ok = await grantCollectible(id, parsed.data.collectibleId, parsed.data.source ?? adminId);
        if (!ok) return NextResponse.json({ error: "Grant failed" }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "revokeCollectible": {
        if (!parsed.data.collectibleId) return NextResponse.json({ error: "collectibleId required" }, { status: 400 });
        const ok = await revokeCollectible(id, parsed.data.collectibleId);
        if (!ok) return NextResponse.json({ error: "Revoke failed" }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "delete": {
        const { getDb } = await import("@/lib/db");
        const db = await getDb();
        if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
        await db.collection("users").deleteOne({ _id: new ObjectId(id) });
        await db.collection("user_collectibles").deleteMany({ userId: new ObjectId(id) });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return handleApiError(err);
  }
}
