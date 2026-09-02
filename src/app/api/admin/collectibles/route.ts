import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { DB_ENABLED } from "@/lib/env";
import { getDb } from "@/lib/db";
import { z } from "zod";

const CreateCollectibleSchema = z.object({
  type: z.enum(["border", "nameStyle", "rank"]),
  slug: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  assetUrl: z.string().max(500).optional().or(z.literal("")),
  styleConfig: z.object({
    className: z.string().max(100).optional(),
    gradient: z.tuple([z.string(), z.string()]).optional(),
    animation: z.string().max(100).optional(),
  }).optional(),
  obtainMethod: z.enum(["achievement", "purchase", "event", "admin_grant"]),
});

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (!DB_ENABLED) return NextResponse.json({ collectibles: [] });
    const db = await getDb();
    if (!db) return NextResponse.json({ collectibles: [] });

    const collectibles = await db.collection("collectibles").find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ collectibles });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    if (!DB_ENABLED) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const db = await getDb();
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const body = await req.json();
    const parsed = CreateCollectibleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.collection("collectibles").findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const doc = {
      ...parsed.data,
      assetUrl: parsed.data.assetUrl === "" ? undefined : parsed.data.assetUrl,
      createdAt: new Date(),
    };

    const result = await db.collection("collectibles").insertOne(doc);
    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
