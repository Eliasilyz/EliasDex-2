import { NextResponse } from "next/server";
import { createGuestSession } from "@/server/guest";

export async function POST() {
  const result = await createGuestSession();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: result.userId,
      username: result.username,
      role: "guest",
      isGuest: true,
    },
  });
}
