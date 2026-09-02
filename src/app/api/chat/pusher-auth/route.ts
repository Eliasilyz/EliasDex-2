import { NextResponse } from "next/server";
import { getPusherInstance } from "@/server/chat";
import { auth } from "@/lib/auth";

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

  // Ensure users can only authenticate their own socket on allowed channels
  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  const authResponse = pusher.authenticate(socket_id, channel_name);

  return NextResponse.json(authResponse);
}
