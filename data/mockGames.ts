// ============================================
// GGLOG — Mock Games & Logging Types
// ============================================
// These types and data power the frontend-only
// logging flow. Replace MOCK_GAMES with a real
// API call to GET /api/games/search later.
// ============================================

export interface Game {
  id: string
  name: string
  coverUrl: string // placeholder for now
  developer: string
  releaseYear: number
  genres: string[]
}

export type LogEntryStatus = "PLAYING" | "COMPLETED" | "DROPPED" | "REPLAYED"

export type LogEntryVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE"

export interface LogEntry {
  game: Game
  rating: number // 0–5, supports 0.5 increments
  playedAt: Date
  status: LogEntryStatus
  review: string
  visibility: LogEntryVisibility
  spoiler: boolean
  tags: string[]
}

// ============================================
// MOCK DATABASE
// ============================================

export const MOCK_GAMES: Game[] = [
  {
    id: "game-001",
    name: "ELDEN RING",
    coverUrl: "",
    developer: "FromSoftware",
    releaseYear: 2022,
    genres: ["RPG", "ACTION"],
  },
  {
    id: "game-002",
    name: "BALDUR'S GATE 3",
    coverUrl: "",
    developer: "Larian Studios",
    releaseYear: 2023,
    genres: ["RPG", "STRATEGY"],
  },
  {
    id: "game-003",
    name: "HOLLOW KNIGHT",
    coverUrl: "",
    developer: "Team Cherry",
    releaseYear: 2017,
    genres: ["METROIDVANIA", "ACTION"],
  },
  {
    id: "game-004",
    name: "HADES",
    coverUrl: "",
    developer: "Supergiant Games",
    releaseYear: 2020,
    genres: ["ROGUELIKE", "ACTION"],
  },
  {
    id: "game-005",
    name: "CELESTE",
    coverUrl: "",
    developer: "Maddy Makes Games",
    releaseYear: 2018,
    genres: ["PLATFORMER", "INDIE"],
  },
  {
    id: "game-006",
    name: "THE WITCHER 3: WILD HUNT",
    coverUrl: "",
    developer: "CD Projekt Red",
    releaseYear: 2015,
    genres: ["RPG", "OPEN WORLD"],
  },
  {
    id: "game-007",
    name: "DARK SOULS III",
    coverUrl: "",
    developer: "FromSoftware",
    releaseYear: 2016,
    genres: ["RPG", "ACTION"],
  },
  {
    id: "game-008",
    name: "SEKIRO: SHADOWS DIE TWICE",
    coverUrl: "",
    developer: "FromSoftware",
    releaseYear: 2019,
    genres: ["ACTION", "ADVENTURE"],
  },
  {
    id: "game-009",
    name: "DISCO ELYSIUM",
    coverUrl: "",
    developer: "ZA/UM",
    releaseYear: 2019,
    genres: ["RPG", "DETECTIVE"],
  },
  {
    id: "game-010",
    name: "PERSONA 5 ROYAL",
    coverUrl: "",
    developer: "Atlus",
    releaseYear: 2020,
    genres: ["JRPG", "SOCIAL SIM"],
  },
  {
    id: "game-011",
    name: "GOD OF WAR RAGNARÖK",
    coverUrl: "",
    developer: "Santa Monica Studio",
    releaseYear: 2022,
    genres: ["ACTION", "ADVENTURE"],
  },
  {
    id: "game-012",
    name: "STARDEW VALLEY",
    coverUrl: "",
    developer: "ConcernedApe",
    releaseYear: 2016,
    genres: ["SIMULATION", "INDIE"],
  },
]

/**
 * Simulates a search API call with a small delay.
 * Replace with: GET /api/games/search?q={query}
 */
export async function searchGames(query: string): Promise<Game[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (!query.trim()) return []

  const q = query.toLowerCase()
  return MOCK_GAMES.filter(
    (game) =>
      game.name.toLowerCase().includes(q) ||
      game.developer.toLowerCase().includes(q) ||
      game.genres.some((g) => g.toLowerCase().includes(q))
  )
}

/**
 * Simulates submitting a log entry.
 * Replace with: POST /api/logs
 */
export async function submitLog(
  _entry: LogEntry
): Promise<{ success: boolean; id: string }> {
  // Phase 1: Archiving
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // Phase 2: Syncing
  await new Promise((resolve) => setTimeout(resolve, 800))
  // Done
  return { success: true, id: `log-${Date.now()}` }
}

/**
 * Look up a single game by ID.
 * Replace with: GET /api/games/:id
 */
export function getGameById(id: string): Game | undefined {
  return MOCK_GAMES.find((g) => g.id === id)
}
