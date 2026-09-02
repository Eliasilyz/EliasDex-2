import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserCollectibles,
  getEquippedCollectibles,
  resolveEquippedCollectibles,
} from "@/lib/collectibles";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [inventory, equipped, resolved] = await Promise.all([
      getUserCollectibles(session.user.id),
      getEquippedCollectibles(session.user.id),
      resolveEquippedCollectibles(session.user.id),
    ]);

    return NextResponse.json({ inventory, equipped, resolved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
