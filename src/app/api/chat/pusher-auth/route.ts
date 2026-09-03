import { NextResponse } from "next/server";
import { getPusherInstance } from "@/server/chat";
import { auth } from "@/lib/auth";

const CHANNEL_PATTERN = /^(private|presence)-(.+)$/;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pusher = getPusherInstance();

  if (!pusher) {
    return NextResponse.json(
      { error: "Pusher is not configured" },
      { status: 503 }
    );
  }

  const { socket_id, channel_name } = await req.json();

  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  // --- Validasi kepemilikan channel ---
  // Pusher private/presence channels: "private-{userId}" atau "presence-{userId}"
  // Pastikan userId di channel_name cocok dengan user yang login.
  // Channel publik (misal "global", nama kamar acak) dilewati agar otentikasi bisa proceed.
  const patternMatch = channel_name.match(CHANNEL_PATTERN);
  if (patternMatch) {
    const channelUserId = patternMatch[2];
    if (channelUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: This channel belongs to another user" },
        { status: 403 }
      );
    }
  }
  // Jika channel_name tidak sesuai pola private/presence, anggap sebagai channel publik
  // dan izinkan otentikasi tanpa cek pemilik (sesuai kebutuhan chat umum).

  const authResponse = pusher.authenticate(socket_id, channel_name);

  return NextResponse.json(authResponse);
}
