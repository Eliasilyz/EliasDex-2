import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unequipCollectible } from "@/lib/collectibles";
import { z } from "zod";

const UnequipSchema = z.object({
  slot: z.enum(["border", "nameStyle", "rank"]),
  collectibleId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UnequipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { slot, collectibleId } = parsed.data;
    const ok = await unequipCollectible(session.user.id, slot, collectibleId);

    if (!ok) {
      return NextResponse.json(
        { error: "Failed to unequip" },
        { status: 500 }
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
