import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleAnnouncementStatus, deleteAnnouncement } from "@/models/announcements";
import { handleApiError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({ error: "isActive field is required" }, { status: 400 });
    }

    const success = await toggleAnnouncementStatus(id, isActive);

    if (!success) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Broadcast status change to all connected clients
    try {
      const io = (globalThis as any).io;
      if (io) {
        io.emit("announcement:status", {
          id,
          isActive,
        });
      }
    } catch (err) {
      console.error("Failed to broadcast announcement status:", err);
    }

    return NextResponse.json({ success });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;

    const success = await deleteAnnouncement(id);

    if (!success) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Broadcast deletion to all connected clients
    try {
      const io = (globalThis as any).io;
      if (io) {
        io.emit("announcement:deleted", { id });
      }
    } catch (err) {
      console.error("Failed to broadcast announcement deletion:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}