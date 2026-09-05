import { NextRequest, NextResponse } from "next/server";
import weebcentral from "@/lib/external/weebcentral";

export async function GET(request: NextRequest) {
  let chapterUrl = request.nextUrl.searchParams.get("url") || "";

  if (!chapterUrl) {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      chapterUrl = id.startsWith("http")
        ? id
        : `https://weebcentral.com/chapters/${id}`;
    }
  }

  if (!chapterUrl) {
    return NextResponse.json(
      { error: "Missing chapter URL or ID" },
      { status: 400 }
    );
  }

  try {
    const pages = await weebcentral.getPages(chapterUrl);

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Failed to fetch chapter pages from WeebCentral:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch chapter pages" },
      { status: 500 }
    );
  }
}
