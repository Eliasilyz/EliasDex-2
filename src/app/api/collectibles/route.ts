import { NextRequest, NextResponse } from "next/server";
import { listAvailableCollectibles } from "@/lib/collectibles";
import type { CollectibleType } from "@/types/models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as CollectibleType | null;
    const rarity = searchParams.get("rarity");

    const collectibles = await listAvailableCollectibles({
      type: type ?? undefined,
      rarity: rarity ?? undefined,
    });

    return NextResponse.json({ collectibles });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
