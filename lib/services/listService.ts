// ============================================
// GGLOG — List Service
// ============================================
// User-curated game lists with visibility control.
//
// Ownership rules enforced on all writes:
//   session user → find list → verify userId → proceed
//
// List items use a `position` field for ordering.
// On add: appended at the end (max position + 1).
// On reorder: positions reassigned to 0-indexed order.
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { canViewList } from '@/lib/permissions/visibility'
import { isFollowing } from '@/lib/services/followService'
import { getOrCreateGame } from '@/lib/services/gameService'
import { createActivity } from '@/lib/services/activityService'
import type { CreateListInput, UpdateListInput } from '@/lib/validations/lists'
import type { Visibility } from '@/src/generated/prisma'

const listSelect = {
  id: true,
  title: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  user: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  _count: { select: { items: true } },
} as const

const listWithItemsSelect = {
  ...listSelect,
  items: {
    orderBy: { position: 'asc' as const },
    select: {
      position: true,
      createdAt: true,
      game: {
        select: { id: true, igdbId: true, name: true, coverUrl: true, slug: true },
      },
    },
  },
} as const

// ---- Visibility helper ----

async function assertCanViewList(
  list: { userId: string; visibility: Visibility },
  viewerId: string | null
): Promise<void> {
  let follower = false
  if (viewerId && viewerId !== list.userId) {
    follower = await isFollowing(viewerId, list.userId)
  }

  const allowed = canViewList({
    viewerId,
    ownerId: list.userId,
    visibility: list.visibility,
    isFollower: follower,
  })

  if (!allowed) throw Errors.notFound('List')
}

// ---- Read ----

/**
 * Get a single list by ID.
 * Enforces visibility.
 */
export async function getList(listId: string, viewerId: string | null) {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: listWithItemsSelect,
  })

  if (!list) throw Errors.notFound('List')
  await assertCanViewList(list, viewerId)

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    visibility: list.visibility,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    itemCount: list._count.items,
    user: {
      id: list.user.id,
      username: list.user.username,
      displayName: list.user.profile?.displayName ?? null,
      avatarUrl: list.user.profile?.avatarUrl ?? null,
    },
    items: list.items.map((item) => ({
      position: item.position,
      createdAt: item.createdAt.toISOString(),
      game: {
        id: item.game.id,
        igdbId: item.game.igdbId,
        name: item.game.name,
        coverUrl: item.game.coverUrl,
        slug: item.game.slug,
      },
    })),
  }
}

/**
 * Get all lists for a user.
 * Filters by visibility for non-owners.
 */
export async function getUserLists(userId: string, viewerId: string | null) {
  let visibilityFilter: Visibility[] = ['PUBLIC']

  if (viewerId === userId) {
    visibilityFilter = ['PUBLIC', 'FOLLOWERS', 'PRIVATE']
  } else if (viewerId) {
    const follower = await isFollowing(viewerId, userId)
    if (follower) visibilityFilter = ['PUBLIC', 'FOLLOWERS']
  }

  const lists = await prisma.list.findMany({
    where: { userId, visibility: { in: visibilityFilter } },
    orderBy: { updatedAt: 'desc' },
    select: listSelect,
  })

  return lists.map((list) => ({
    id: list.id,
    title: list.title,
    description: list.description,
    visibility: list.visibility,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    itemCount: list._count.items,
    user: {
      id: list.user.id,
      username: list.user.username,
      displayName: list.user.profile?.displayName ?? null,
      avatarUrl: list.user.profile?.avatarUrl ?? null,
    },
  }))
}

// ---- Write ----

/**
 * Create a new list.
 * Creates an Activity record.
 */
export async function createList(userId: string, input: CreateListInput) {
  const list = await prisma.$transaction(async (tx) => {
    const created = await tx.list.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        visibility: input.visibility,
      },
      select: listSelect,
    })

    await tx.activity.create({
      data: {
        actorId: userId,
        type: 'CREATED_LIST',
        listId: created.id,
      },
    })

    return created
  })

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    visibility: list.visibility,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    itemCount: 0,
    user: {
      id: list.user.id,
      username: list.user.username,
      displayName: list.user.profile?.displayName ?? null,
      avatarUrl: list.user.profile?.avatarUrl ?? null,
    },
  }
}

/**
 * Update list metadata.
 * Only the list owner may update.
 */
export async function updateList(listId: string, userId: string, input: UpdateListInput) {
  const existing = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('List')
  if (existing.userId !== userId) throw Errors.forbidden()

  return prisma.list.update({
    where: { id: listId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
    },
    select: listSelect,
  })
}

/**
 * Delete a list.
 * Only the list owner may delete.
 */
export async function deleteList(listId: string, userId: string): Promise<void> {
  const existing = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('List')
  if (existing.userId !== userId) throw Errors.forbidden()

  await prisma.list.delete({ where: { id: listId } })
}

/**
 * Add a game to a list by IGDB ID.
 * Appends at the end (max position + 1).
 * Prevents duplicate games in the same list.
 */
export async function addGameToList(
  listId: string,
  userId: string,
  igdbId: number
): Promise<void> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true },
  })

  if (!list) throw Errors.notFound('List')
  if (list.userId !== userId) throw Errors.forbidden()

  // Resolve game (cache if needed)
  const game = await getOrCreateGame(igdbId)

  // Check for duplicate
  const existing = await prisma.listItem.findUnique({
    where: { listId_gameId: { listId, gameId: game.id } },
    select: { listId: true },
  })
  if (existing) throw Errors.conflict('This game is already in the list.')

  // Get next position
  const maxItem = await prisma.listItem.findFirst({
    where: { listId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const nextPosition = (maxItem?.position ?? -1) + 1

  await prisma.listItem.create({
    data: { listId, gameId: game.id, position: nextPosition },
  })
}

/**
 * Remove a game from a list.
 */
export async function removeGameFromList(
  listId: string,
  userId: string,
  gameId: string
): Promise<void> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true },
  })

  if (!list) throw Errors.notFound('List')
  if (list.userId !== userId) throw Errors.forbidden()

  const deleted = await prisma.listItem.deleteMany({
    where: { listId, gameId },
  })

  if (deleted.count === 0) throw Errors.notFound('Game in list')
}

/**
 * Reorder list items.
 * Receives a full ordered array of gameIds.
 * Reassigns positions to match the provided order.
 */
export async function reorderList(
  listId: string,
  userId: string,
  gameIds: string[]
): Promise<void> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true },
  })

  if (!list) throw Errors.notFound('List')
  if (list.userId !== userId) throw Errors.forbidden()

  // Update positions in a transaction
  await prisma.$transaction(
    gameIds.map((gameId, index) =>
      prisma.listItem.update({
        where: { listId_gameId: { listId, gameId } },
        data: { position: index },
      })
    )
  )
}
