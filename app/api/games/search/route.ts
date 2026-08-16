// ============================================
// GGLOG — Game Search API
// ============================================
// GET /api/games/search?q=elden
//
// Searches IGDB and returns normalized results.
// Does NOT create any database records — that
// happens only when a user logs a game.
// ============================================

import { NextRequest } from "next/server"
import { searchGames, getGameByIGDBId, normalizeImage } from "@/lib/idgb/games"
import { apiSuccess, apiError, Errors } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get("q")?.trim()

    if (!query || query.length < 2) {
      throw Errors.badRequest(
        "Search query must be at least 2 characters.",
        "INVALID_QUERY"
      )
    }

    // Check if query is numeric (IGDB ID lookup)
    if (/^\d+$/.test(query)) {
      const gameId = parseInt(query, 10)
      const rawGame = await getGameByIGDBId(gameId)
      
      if (!rawGame) {
        return apiSuccess([])
      }

      const normalizedGame = {
        igdbId: rawGame.id,
        name: rawGame.name,
        slug: rawGame.slug ?? null,
        summary: rawGame.summary ?? null,
        coverUrl: normalizeImage(rawGame.cover?.url),
        releaseDate: rawGame.first_release_date
          ? new Date(rawGame.first_release_date * 1000)
          : null,
        rating: rawGame.rating ?? null,
        ratingCount: rawGame.rating_count ?? null,
        genres: rawGame.genres ?? [],
        platforms: rawGame.platforms ?? [],
      }

      return apiSuccess([normalizedGame])
    }

    const results = await searchGames(query)

    return apiSuccess(results)
  } catch (error) {
    return apiError(error)
  }
}
