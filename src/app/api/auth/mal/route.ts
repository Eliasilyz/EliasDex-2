import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMalAuthUrl, generateCodeVerifier } from "@/lib/mal";

/**
 * GET /api/auth/mal — Redirect to MAL OAuth authorization page.
 * Stores code_verifier in an httpOnly cookie for PKCE.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const codeVerifier = generateCodeVerifier();

    // MAL only supports plain PKCE, so code_challenge = code_verifier
    const authUrl = getMalAuthUrl(codeVerifier);

    const response = NextResponse.redirect(authUrl);

    // Store code_verifier in httpOnly cookie (10 min expiry)
    response.cookies.set("mal_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Store user ID to link after callback
    response.cookies.set("mal_user_id", session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("MAL auth error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to start MAL auth" },
      { status: 500 }
    );
  }
}
