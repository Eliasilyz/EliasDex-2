import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCatbox } from "@/lib/catbox";
import { checkUploadRateLimit } from "@/lib/uploadRateLimiter";
import { handleApiError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 uploads per hour
    const rateLimit = checkUploadRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Upload limit reached. Try again later.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[upload] Received:", file.name, file.type, `${(file.size / 1024).toFixed(0)}KB`);

    const result = await uploadToCatbox(file);
    if ("error" in result) {
      console.error("[upload] Failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      url: result.url,
      remaining: rateLimit.remaining,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
