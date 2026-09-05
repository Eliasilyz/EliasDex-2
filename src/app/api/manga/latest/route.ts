import { NextRequest, NextResponse } from "next/server";
import weebcentral from "@/lib/external/weebcentral";

function cleanTitle(title: string): string {
  return title.replace(/\s+cover$/i, "").trim();
}

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page");
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  try {
    const rawResults = await weebcentral.latest(page);
    const results = rawResults.map((item) => ({
      ...item,
      title: cleanTitle(item.title),
    }));

    return NextResponse.json({
      data: results,
      page,
      hasMore: results.length > 0,
    });
  } catch (error: any) {
    console.error("Failed to fetch latest manga from WeebCentral:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch latest manga" },
      { status: 500 }
    );
  }
}
