import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { equipCollectible } from "@/lib/collectibles";
import { z } from "zod";

const EquipSchema = z.object({
  slot: z.enum(["border", "nameStyle", "rank"]),
  collectibleId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = EquipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { slot, collectibleId } = parsed.data;
    const ok = await equipCollectible(session.user.id, slot, collectibleId);

    if (!ok) {
      return NextResponse.json(
        { error: "You don't own this collectible or equip failed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
