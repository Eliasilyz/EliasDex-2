import { NextRequest, NextResponse } from "next/server";
import weebcentral from "@/lib/external/weebcentral";

export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get("url") || "";

  if (!url) {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      url = id.startsWith("http") ? id : `/series/${id}`;
    }
  }

  if (!url) {
    return NextResponse.json(
      { error: "Missing manga URL or ID" },
      { status: 400 }
    );
  }

  try {
    const detail = await weebcentral.getManga(url);

    return NextResponse.json({ data: detail });
  } catch (error: any) {
    console.error("Failed to fetch manga detail from WeebCentral:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch manga detail" },
      { status: 500 }
    );
  }
}
