import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { z } from "zod";

const UpdateCollectibleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  rarity: z.enum(["common", "rare", "epic", "legendary"]).optional(),
  assetUrl: z.string().max(500).optional().or(z.literal("")),
  styleConfig: z.object({
    className: z.string().max(100).optional(),
    gradient: z.tuple([z.string(), z.string()]).optional(),
    animation: z.string().max(100).optional(),
  }).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (!DB_ENABLED) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const parsed = UpdateCollectibleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.rarity !== undefined) updates.rarity = parsed.data.rarity;
    if (parsed.data.assetUrl !== undefined) updates.assetUrl = parsed.data.assetUrl === "" ? undefined : parsed.data.assetUrl;
    if (parsed.data.styleConfig !== undefined) updates.styleConfig = parsed.data.styleConfig;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const result = await db.collection("collectibles").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (!DB_ENABLED) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await db.collection("collectibles").deleteOne({ _id: new ObjectId(id) });
    // Also clean up any user_equipped references
    await db.collection("user_collectibles").deleteMany({ collectibleId: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
