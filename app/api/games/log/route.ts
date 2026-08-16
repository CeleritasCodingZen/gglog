// ============================================
// GGLOG — Log Game API
// ============================================
// POST /api/games/log
//
// Authenticated route. Receives an IGDB game ID
// + log data, caches the game, creates LogEntry,
// optionally creates Review, and records Activity.
// ============================================

import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { apiSuccess, apiError, Errors } from "@/lib/errors"
import { logEntrySchema } from "@/lib/validations/schemas"
import { getOrCreateGame, serializeGame } from "@/lib/services/gameService"

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await requireAuth()

    // 2. Parse + validate body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw Errors.badRequest("Invalid JSON body.")
    }

    const parsed = logEntrySchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      throw Errors.badRequest(
        firstError?.message ?? "Invalid input.",
        "VALIDATION_ERROR"
      )
    }

    const input = parsed.data

    // 3. Cache game from IGDB
    let game
    try {
      game = await getOrCreateGame(input.igdbId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resolve game."
      throw Errors.badRequest(message, "GAME_RESOLVE_ERROR")
    }

    // 4. Create LogEntry + optional Review in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create LogEntry
      const logEntry = await tx.logEntry.create({
        data: {
          userId: user.id,
          gameId: game.id,
          playedAt: input.playedAt ? new Date(input.playedAt) : new Date(),
          rating: input.rating ?? null,
          liked: input.liked,
          replay: input.replay,
          status: input.status,
          tags: input.tags,
        },
        include: {
          game: { include: { genres: true, platforms: true } },
        },
      })

      // Create Review if body is provided
      let review = null
      if (input.review) {
        review = await tx.review.create({
          data: {
            userId: user.id,
            gameId: game.id,
            logEntryId: logEntry.id,
            body: input.review,
            spoiler: input.spoiler,
            visibility: input.visibility,
          },
        })
      }

      // Create Activity record
      await tx.activity.create({
        data: {
          actorId: user.id,
          type: input.review ? "REVIEWED_GAME" : "LOGGED_GAME",
          gameId: game.id,
          logEntryId: logEntry.id,
          reviewId: review?.id ?? null,
        },
      })

      return { logEntry, review }
    })

    // 5. Format response
    return apiSuccess(
      {
        id: result.logEntry.id,
        playedAt: result.logEntry.playedAt?.toISOString() ?? null,
        rating: result.logEntry.rating,
        status: result.logEntry.status,
        liked: result.logEntry.liked,
        replay: result.logEntry.replay,
        tags: result.logEntry.tags,
        createdAt: result.logEntry.createdAt.toISOString(),
        game: serializeGame(result.logEntry.game),
        review: result.review
          ? {
              id: result.review.id,
              body: result.review.body,
              spoiler: result.review.spoiler,
              visibility: result.review.visibility,
            }
          : null,
      },
      201
    )
  } catch (error) {
    return apiError(error)
  }
}
