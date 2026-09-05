import { NextRequest, NextResponse } from "next/server";
import weebcentral from "@/lib/external/weebcentral";

function cleanTitle(title: string): string {
  return title.replace(/\s+cover$/i, "").trim();
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const pageParam = request.nextUrl.searchParams.get("page");
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  if (!query.trim()) {
    return NextResponse.json({ data: [] });
  }

  try {
    const rawResults = await weebcentral.search(query.trim(), page);
    const results = rawResults.map((item) => ({
      ...item,
      title: cleanTitle(item.title),
    }));

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("Failed to search manga from WeebCentral:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to search manga" },
      { status: 500 }
    );
  }
}
