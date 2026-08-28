
// Cursor-based pagination for social feeds,
// comments, reviews, followers, activity, etc.
// Cursors are opaque base64-encoded strings
// wrapping a stable sort key (createdAt ISO + id).


export interface CursorPayload {
  id: string
  createdAt: string // ISO 8601
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}


export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

/**
 * Decode a cursor string back to its payload.
 * Returns null if the cursor is invalid or malformed.
 */
export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'createdAt' in parsed &&
      typeof (parsed as Record<string, unknown>).id === 'string' &&
      typeof (parsed as Record<string, unknown>).createdAt === 'string'
    ) {
      return parsed as CursorPayload
    }
    return null
  } catch {
    return null
  }
}

/**
 * Build a paginated result from a raw items array.
 *
 * Fetch `limit + 1` items, pass them here with `limit`.
 * If the array has more than `limit` items, the extra one
 * signals there is a next page — we slice it off and encode
 * the last real item as the next cursor.
 *
 * @example
 *   const rows = await prisma.comment.findMany({ take: limit + 1, ... })
 *   return buildPaginatedResult(rows, limit, (row) => ({ id: row.id, createdAt: row.createdAt.toISOString() }))
 */
export function buildPaginatedResult<T extends { id: string; createdAt: Date }>(
  rows: T[],
  limit: number
): PaginatedResult<T> {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows

  const lastItem = items[items.length - 1]
  const nextCursor =
    hasMore && lastItem
      ? encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt.toISOString() })
      : null

  return { items, nextCursor, hasMore }
}

/**
 * Parse the `cursor` and `limit` from URL search params.
 * Returns safe defaults if values are missing or invalid.
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  cursor: CursorPayload | null
  limit: number
} {
  const rawCursor = searchParams.get('cursor')
  const cursor = rawCursor ? decodeCursor(rawCursor) : null

  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10)
  const limit = isNaN(rawLimit) ? 20 : Math.min(50, Math.max(1, rawLimit))

  return { cursor, limit }
}
