// ============================================
// GGLOG — Watchlist Service
// ============================================
// Games a user wants to play but hasn't logged yet.
//
// Uses the existing WatchlistItem model with
// composite PK [userId, gameId] — no duplicates.
//
// No pagination yet — watchlists are typically
// small enough to return in full. Can be added later.
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { getOrCreateGame } from '@/lib/services/gameService'

const watchlistItemSelect = {
  createdAt: true,
  game: {
    select: {
      id: true,
      igdbId: true,
      name: true,
      slug: true,
      coverUrl: true,
      releaseDate: true,
      igdbRating: true,
    },
  },
} as const

/**
 * Get all watchlist items for a user.
 * Ordered by date added (newest first).
 */
export async function getWatchlist(userId: string) {
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: watchlistItemSelect,
  })

  return items.map((item) => ({
    createdAt: item.createdAt.toISOString(),
    game: {
      id: item.game.id,
      igdbId: item.game.igdbId,
      name: item.game.name,
      slug: item.game.slug,
      coverUrl: item.game.coverUrl,
      releaseDate: item.game.releaseDate?.toISOString() ?? null,
      igdbRating: item.game.igdbRating,
    },
  }))
}

/**
 * Add a game to the watchlist by IGDB ID.
 * Idempotent — if already watchlisted, does nothing.
 */
export async function addToWatchlist(userId: string, igdbId: number): Promise<void> {
  const game = await getOrCreateGame(igdbId)

  // upsert is idempotent for composite PK
  await prisma.watchlistItem.upsert({
    where: { userId_gameId: { userId, gameId: game.id } },
    update: {}, // no fields to update — just ensure it exists
    create: { userId, gameId: game.id },
  })
}

/**
 * Remove a game from the watchlist.
 * Idempotent — safe if not watchlisted.
 *
 * @param gameId - the local DB game ID (not IGDB ID)
 */
export async function removeFromWatchlist(userId: string, gameId: string): Promise<void> {
  await prisma.watchlistItem.deleteMany({
    where: { userId, gameId },
  })
}

/**
 * Check if a game is in the user's watchlist.
 *
 * @param gameId - the local DB game ID
 */
export async function isWatchlisted(userId: string, gameId: string): Promise<boolean> {
  const row = await prisma.watchlistItem.findUnique({
    where: { userId_gameId: { userId, gameId } },
    select: { userId: true },
  })
  return row !== null
}
