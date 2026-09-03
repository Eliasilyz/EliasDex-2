import { NextRequest, NextResponse } from "next/server";
import { exchangeMalCode, getMalUserInfo } from "@/lib/mal";
import { updateUser } from "@/models/user";

/**
 * GET /api/auth-mal/callback — Handle MAL OAuth callback.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const codeVerifier = req.cookies.get("mal_code_verifier")?.value;
  const userId = req.cookies.get("mal_user_id")?.value;

  const redirectBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const errorRedirect = `${redirectBase}/profile?sync_error=mal`;
  const successRedirect = `${redirectBase}/profile?sync_success=mal&importing=true`;

  if (error || !code || !codeVerifier || !userId) {
    return new NextResponse(`<!DOCTYPE html><html><body style="background:#111;color:#fff;padding:40px;font-family:monospace">
      <h2>Missing params</h2><pre>${JSON.stringify({ error, hasCode: !!code, hasVerifier: !!codeVerifier, hasUserId: !!userId }, null, 2)}</pre>
      <script>setTimeout(()=>location.href=${JSON.stringify(errorRedirect)},4000)</script></body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  try {
    const tokenRes = await exchangeMalCode(code, codeVerifier);
    const malUser = await getMalUserInfo(tokenRes.access_token);

    const expiresAt = Date.now() + tokenRes.expires_in * 1000;
    await updateUser(userId, {
      malAuth: {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresAt,
        malUserId: malUser.id,
        malUsername: malUser.name,
      },
      syncPreferences: {
        autoSyncMal: true,
      },
    });

    importMalListInBackground(userId);

    const response = NextResponse.redirect(successRedirect);
    response.cookies.delete("mal_code_verifier");
    response.cookies.delete("mal_user_id");
    return response;
  } catch (err: any) {
    return new NextResponse(`<!DOCTYPE html><html><body style="background:#111;color:#fff;padding:40px;font-family:monospace">
      <h2>Exchange Error</h2><pre>${JSON.stringify({ error: err.message?.substring(0, 500) }, null, 2)}</pre>
      <script>setTimeout(()=>location.href=${JSON.stringify(errorRedirect)},4000)</script></body></html>`, { headers: { "Content-Type": "text/html" } });
  }
}

async function importMalListInBackground(userId: string) {
  try {
    const { importMalListToLocal } = await import("@/lib/sync");
    const result = await importMalListToLocal(userId);
    console.log(`[MAL Import] User ${userId}: ${result.imported} imported, ${result.matched} matched, ${result.unmatched} unmatched`);
  } catch (err) {
    console.error("[MAL Import] Background import failed:", err);
  }
}
