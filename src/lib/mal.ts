import crypto from "crypto";

// ── MAL OAuth2 PKCE + API helpers ──────────────────────────────────────

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID || "";
const MAL_CLIENT_SECRET = process.env.MAL_CLIENT_SECRET || "";
const MAL_AUTH_URL = "https://myanimelist.net/v1/oauth2/authorize";
const MAL_TOKEN_URL = "https://myanimelist.net/v1/oauth2/token";
const MAL_API_BASE = "https://api.myanimelist.net/v2";

export type MalStatus =
  | "watching"
  | "completed"
  | "on_hold"
  | "dropped"
  | "plan_to_watch";

export interface MalTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface MalListEntry {
  node: {
    id: number;
    title: string;
    main_picture?: { medium: string; large: string };
  };
  list_status: {
    status: MalStatus;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    start_date?: string;
    finish_date?: string;
    updated_at: string;
  };
}

// ── PKCE helpers ───────────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ── OAuth URLs ─────────────────────────────────────────────────────────

export function getMalAuthUrl(state: string): string {
  // Request the scopes needed to read & write the user's anime list.
  // Without these, list fetch/update return 403 Forbidden.
  const scopes = "write:users:animelist read:users:animelist";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: MAL_CLIENT_ID,
    redirect_uri: `${getBaseUrl()}/api/auth-mal/callback`,
    state,
    code_challenge: state, // The state IS the code_challenge
    code_challenge_method: "plain", // MAL only supports plain, not S256
    scope: scopes,
  });

  return `${MAL_AUTH_URL}?${params.toString()}`;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// ── Token exchange ─────────────────────────────────────────────────────

export async function exchangeMalCode(
  code: string,
  codeVerifier: string
): Promise<MalTokenResponse> {
  const body = new URLSearchParams({
    client_id: MAL_CLIENT_ID,
    client_secret: MAL_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: `${getBaseUrl()}/api/auth-mal/callback`,
    code_verifier: codeVerifier,
  });

  const res = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MAL token exchange failed: ${res.status} ${err}`);
  }

  return res.json();
}

export async function refreshMalToken(
  refreshToken: string
): Promise<MalTokenResponse> {
  const body = new URLSearchParams({
    client_id: MAL_CLIENT_ID,
    client_secret: MAL_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MAL token refresh failed: ${res.status} ${err}`);
  }

  return res.json();
}

// ── MAL API helpers ────────────────────────────────────────────────────

async function malApiFetch<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${MAL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MAL API error ${res.status}: ${err}`);
  }

  return res.json();
}

// Simple retry with exponential backoff for MAL rate limits
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === maxRetries) throw err;
      // MAL returns 429 for rate limit
      const isRateLimit = err.message?.includes("429");
      const delay = isRateLimit
        ? baseDelayMs * Math.pow(2, attempt) + Math.random() * 500
        : baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

/**
 * Update anime status on MAL user's list.
 * PUT /v2/anime/{anime_id}/my_list_status
 * Handles both add and update (creates the entry if it doesn't exist yet).
 *
 * The correct MAL API v2 field name for the episode count is
 * `num_watched_episodes` (NOT `num_episodes_watched`). Sending it lets the
 * user's MAL list show accurate progress, not just a status.
 */
export async function updateMalListStatus(
  accessToken: string,
  malAnimeId: number,
  status: MalStatus,
  numWatchedEpisodes?: number
): Promise<void> {
  await withRetry(async () => {
    const body = new URLSearchParams({ status });
    if (numWatchedEpisodes !== undefined && numWatchedEpisodes > 0) {
      body.set("num_watched_episodes", String(numWatchedEpisodes));
    }

    const res = await fetch(
      `${MAL_API_BASE}/anime/${malAnimeId}/my_list_status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    // 404 means the ID is not a real MAL anime (streaming sources often use
    // synthetic IDs that don't exist on MAL). Nothing to sync — skip quietly
    // instead of throwing. onRetry: withRetry never retries when we return.
    if (res.status === 404) {
      return;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`MAL list update failed: ${res.status} ${err}`);
    }
  });
}

/**
 * Fetch the authenticated user's entire anime list from MAL.
 * Handles pagination via paging.next.
 * GET /v2/users/@me/animelist?fields=list_status
 */
export async function fetchMalUserList(
  accessToken: string
): Promise<MalListEntry[]> {
  const entries: MalListEntry[] = [];
  let url: string | null =
    `${MAL_API_BASE}/users/@me/animelist?fields=list_status&limit=1000`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`MAL list fetch failed: ${res.status} ${err}`);
    }

    const data: { data?: MalListEntry[]; paging?: { next?: string } } = await res.json();
    if (data.data) entries.push(...data.data);
    url = data.paging?.next || null;
  }

  return entries;
}

/**
 * Get MAL user info (id, username) from access token.
 */
export async function getMalUserInfo(
  accessToken: string
): Promise<{ id: number; name: string }> {
  return malApiFetch<{ id: number; name: string }>(
    accessToken,
    "/users/@me?fields=id,name"
  );
}
