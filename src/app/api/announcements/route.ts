import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveAnnouncements, createAnnouncement } from "@/models/announcements";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { handleApiError } from "@/lib/errors";

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export async function GET() {
  try {
    const announcements = await getActiveAnnouncements(10);
    return NextResponse.json({ announcements });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "member";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid announcement data" },
        { status: 400 }
      );
    }

    const createdBy = (session.user as any).id
      ? new ObjectId((session.user as any).id)
      : new ObjectId();

    const announcement = await createAnnouncement(
      parsed.data.title,
      parsed.data.body,
      createdBy
    );

    if (!announcement) {
      return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }

    // Broadcast to all connected clients via Socket.io
    try {
      const io = (globalThis as any).io;
      if (io) {
        io.emit("announcement:new", {
          id: announcement._id?.toString(),
          title: announcement.title,
          body: announcement.body,
          isActive: announcement.isActive,
        });
      }
    } catch (err) {
      console.error("Failed to broadcast announcement:", err);
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}