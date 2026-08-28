import { NextResponse } from "next/server";
import { getPusherInstance } from "@/server/chat";

export async function POST(req: Request) {
  const { socket_id, channel_name } = await req.json();

  const pusher = getPusherInstance();
  const auth = pusher.authenticate(socket_id, channel_name);

  return NextResponse.json(auth);
}
