// lib/idgb/auth.ts
// ============================================
// GGLOG — Twitch OAuth2 Client Credentials
// ============================================
// Obtains and caches an IGDB-compatible bearer
// token via the Twitch OAuth2 client_credentials
// flow. Tokens are held in server memory only.
//
// Safety buffer: tokens are considered expired
// 5 minutes before their actual expiry to avoid
// edge-case clock drift and mid-request expiry.
// ============================================

/** How many milliseconds before actual expiry we treat a token as stale. */
const TOKEN_SAFETY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

// --------------- Types ---------------

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  accessToken: string;
  /** Timestamp (ms since epoch) at which this token should no longer be used. */
  expiresAt: number;
}

// --------------- Module-level state ---------------

/** The currently cached token (null = nothing cached). */
let cachedToken: CachedToken | null = null;

/**
 * An in-flight token request promise shared across concurrent callers.
 * This prevents a "stampede" where N simultaneous requests each trigger
 * their own Twitch OAuth call when the token is expired/missing.
 */
let inflightRequest: Promise<string> | null = null;

// --------------- Helpers ---------------

function getTwitchCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.TWITCH_CLIENT_ID?.trim();
  const clientSecret = process.env.TWITCH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "IGDB authentication is not configured. " +
        "Missing TWITCH_CLIENT_ID and/or TWITCH_CLIENT_SECRET environment variables."
    );
  }

  return { clientId, clientSecret };
}

function isTokenValid(token: CachedToken): boolean {
  return Date.now() < token.expiresAt;
}

/**
 * Perform the actual Twitch OAuth2 Client Credentials request.
 * This should only be called from within `refreshToken()`.
 */
async function requestTwitchToken(): Promise<CachedToken> {
  const { clientId, clientSecret } = getTwitchCredentials();

  console.info("[IGDB] Requesting Twitch access token");

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    // Do NOT log the response body — it may echo credentials.
    throw new Error(
      `[IGDB] Twitch OAuth2 token request failed: ${response.status} ${response.statusText}`
    );
  }

  const data: TwitchTokenResponse = await response.json();

  const expiresAt = Date.now() + data.expires_in * 1000 - TOKEN_SAFETY_BUFFER_MS;

  console.info("[IGDB] Twitch access token acquired");

  return {
    accessToken: data.access_token,
    expiresAt,
  };
}

// --------------- Public API ---------------

/**
 * Return a valid IGDB bearer token.
 *
 * - If a cached token exists and is still valid, it is returned immediately.
 * - If no valid token is available, a new one is obtained from Twitch.
 * - Concurrent callers share a single in-flight Twitch request to avoid
 *   redundant OAuth calls (token stampede protection).
 */
export async function getIGDBAccessToken(): Promise<string> {
  // 1. Fast path — valid cached token
  if (cachedToken && isTokenValid(cachedToken)) {
    return cachedToken.accessToken;
  }

  // 2. If another caller is already refreshing, wait for that result.
  if (inflightRequest) {
    return inflightRequest;
  }

  // 3. No valid token and no in-flight request — start a new one.
  inflightRequest = (async () => {
    try {
      const token = await requestTwitchToken();
      cachedToken = token;
      return token.accessToken;
    } finally {
      // Always clear the in-flight promise so future callers can retry
      // if this request failed, rather than being permanently stuck.
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

/**
 * Invalidate the currently cached token.
 *
 * Called by the IGDB client when it receives a 401 Unauthorized,
 * so the next `getIGDBAccessToken()` call will obtain a fresh token.
 */
export function invalidateCachedToken(): void {
  cachedToken = null;
}