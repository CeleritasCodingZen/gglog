// ============================================
// GGLOG — Game Service (Cache Layer)
// ============================================
// Bridges IGDB and the local database. Games are
// fetched from IGDB on first access and cached
// in PostgreSQL. Subsequent lookups hit the DB.
// ============================================

import { prisma } from "@/lib/db"
import { getGameByIGDBId, type IGDBGame } from "@/lib/idgb/games"

/**
 * Normalize an IGDB image URL to HTTPS with a larger size.
 * IGDB returns `//images.igdb.com/...t_thumb/...` — we swap to cover_big.
 */
function normalizeImageUrl(url?: string): string | null {
  if (!url) return null
  let full = url.startsWith("//") ? `https:${url}` : url
  // Upgrade thumbnail to cover_big (264x374)
  full = full.replace("t_thumb", "t_cover_big")
  return full
}

/**
 * Get a game from the local DB, or fetch from IGDB and cache it.
 *
 * This is the single entry point for resolving an IGDB game ID
 * into a local Game record. It:
 *  1. Checks the DB for an existing record by igdbId
 *  2. If missing, fetches full game data from IGDB
 *  3. Creates the Game row + connectOrCreate Genre/Platform
 *  4. Returns the local Game with genres & platforms
 *
 * Replace the IGDB call with a different provider by swapping
 * the import — the DB cache layer stays the same.
 */
export async function getOrCreateGame(igdbId: number) {
  // 1. Check DB first
  const existing = await prisma.game.findUnique({
    where: { igdbId },
    include: { genres: true, platforms: true },
  })

  if (existing) return existing

  // 2. Fetch from IGDB
  const igdbGame = await getGameByIGDBId(igdbId)
  if (!igdbGame) {
    throw new Error(`Game not found on IGDB: ${igdbId}`)
  }

  // 3. Create in DB with genres + platforms
  const game = await prisma.game.create({
    data: {
      igdbId: igdbGame.id,
      name: igdbGame.name,
      slug: igdbGame.slug ?? null,
      summary: igdbGame.summary ?? null,
      coverUrl: normalizeImageUrl(igdbGame.cover?.url),
      releaseDate: igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000)
        : null,
      igdbRating: igdbGame.rating ?? null,
      igdbRatingCount: igdbGame.rating_count ?? null,
      genres: {
        connectOrCreate: (igdbGame.genres ?? []).map((g) => ({
          where: { igdbId: g.id },
          create: { igdbId: g.id, name: g.name },
        })),
      },
      platforms: {
        connectOrCreate: (igdbGame.platforms ?? []).map((p) => ({
          where: { igdbId: p.id },
          create: { igdbId: p.id, name: p.name },
        })),
      },
    },
    include: { genres: true, platforms: true },
  })

  return game
}

/**
 * Fetch a game by its local database ID (cuid).
 * Returns null if not found.
 */
export async function getGameById(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: { genres: true, platforms: true },
  })
}

/**
 * Serialize a Game + relations for API response.
 */
export function serializeGame(game: Awaited<ReturnType<typeof getOrCreateGame>>) {
  return {
    id: game.id,
    igdbId: game.igdbId,
    name: game.name,
    slug: game.slug,
    summary: game.summary,
    coverUrl: game.coverUrl,
    releaseDate: game.releaseDate?.toISOString() ?? null,
    igdbRating: game.igdbRating,
    genres: game.genres.map((g) => ({ id: g.igdbId, name: g.name })),
    platforms: game.platforms.map((p) => ({ id: p.igdbId, name: p.name })),
  }
}

/**
 * Fetch a game with its relations (genres, platforms) by its local database ID (cuid),
 * and return it in a serialized format.
 */
export async function getGameWithRelations(gameId: string) {
  const game = await getGameById(gameId)
  if (!game) return null
  return serializeGame(game)
}

