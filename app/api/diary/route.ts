// ============================================
// GGLOG — Diary API
// ============================================
// GET /api/diary?page=1&limit=20
//
// Returns the authenticated user's log entries
// sorted by playedAt DESC, with game info and
// optional review. Supports pagination.
// ============================================

import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20))
    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      prisma.logEntry.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        skip,
        take: limit,
        include: {
          game: {
            include: {
              genres: true,
              platforms: true,
            },
          },
          review: true,
        },
      }),
      prisma.logEntry.count({ where: { userId: user.id } }),
    ])

    const serialized = entries.map((entry) => ({
      id: entry.id,
      playedAt: entry.playedAt?.toISOString() ?? null,
      rating: entry.rating,
      status: entry.status,
      liked: entry.liked,
      replay: entry.replay,
      tags: entry.tags,
      createdAt: entry.createdAt.toISOString(),
      game: {
        id: entry.game.id,
        igdbId: entry.game.igdbId,
        name: entry.game.name,
        coverUrl: entry.game.coverUrl,
        summary: entry.game.summary,
        releaseDate: entry.game.releaseDate?.toISOString() ?? null,
        genres: entry.game.genres.map((g) => ({ id: g.igdbId, name: g.name })),
        platforms: entry.game.platforms.map((p) => ({ id: p.igdbId, name: p.name })),
      },
      review: entry.review
        ? {
            id: entry.review.id,
            body: entry.review.body,
            spoiler: entry.review.spoiler,
            visibility: entry.review.visibility,
          }
        : null,
    }))

    return apiSuccess({
      entries: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return apiError(error)
  }
}
