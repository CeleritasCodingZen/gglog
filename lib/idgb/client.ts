// lib/idgb/client.ts
// ============================================
// GGLOG — IGDB API Client
// ============================================
// Centralised function for all IGDB v4 requests.
// Uses the Twitch OAuth2 token from auth.ts and
// handles 401 recovery (one automatic retry).
// ============================================

import { getIGDBAccessToken, invalidateCachedToken } from "./auth";

const IGDB_BASE_URL = "https://api.igdb.com/v4";

export async function igdbRequest<T>(
  endpoint: string,
  query: string,
): Promise<T> {
  const clientId = process.env.TWITCH_CLIENT_ID?.trim();

  if (!clientId) {
    throw new Error(
      "IGDB authentication is not configured. Missing TWITCH_CLIENT_ID environment variable."
    );
  }

  const token = await getIGDBAccessToken();

  const response = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: query,
    // Important for server requests
    cache: "no-store",
  });

  // ---- 401 recovery: refresh token once and retry ----
  if (response.status === 401) {
    console.warn("[IGDB] Received 401; refreshing token and retrying");

    invalidateCachedToken();
    const freshToken = await getIGDBAccessToken();

    const retryResponse = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${freshToken}`,
        "Content-Type": "text/plain",
      },
      body: query,
      cache: "no-store",
    });

    if (!retryResponse.ok) {
      throw new Error(
        `IGDB request failed after token refresh: ${retryResponse.status} ${retryResponse.statusText}`
      );
    }

    return retryResponse.json();
  }

  // ---- Non-401 errors ----
  if (!response.ok) {
    throw new Error(`Failed to fetch IGDB data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
