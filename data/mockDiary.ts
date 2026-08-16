// ============================================
// GGLOG — Mock Diary Entries
// ============================================

export type GameStatus = "COMPLETED" | "PLAYING" | "DROPPED" | "ON_HOLD" | "BACKLOG"

export interface DiaryEntry {
  id: string
  game: {
    title: string
    coverPlaceholder: boolean // true = no real image, show placeholder
    coverUrl?: string
  }
  status: GameStatus
  rating: number // 0–5 (0 = unrated)
  platform: string
  playtime: string
  playedAt: string // ISO date
  sysTime: string
  description: string
  tags: string[]
}

export const MOCK_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "diary-001",
    game: {
      title: "ELDEN RING",
      coverPlaceholder: true,
    },
    status: "COMPLETED",
    rating: 5,
    platform: "PC_MAIN",
    playtime: "142H",
    playedAt: "2026-04-12",
    sysTime: "14:22:00",
    description:
      'Total sensory overload. The final boss glitched through the arena floor, but I consider that an emergent narrative feature. Combat mechanics feel incredibly tight on this run. Archiving this one under "Masterpieces."',
    tags: ["#SOULSLIKE", "#MASTERRUN"],
  },
  {
    id: "diary-002",
    game: {
      title: "VOID_WALKER_V2",
      coverPlaceholder: true,
    },
    status: "PLAYING",
    rating: 4,
    platform: "DECK",
    playtime: "12H",
    playedAt: "2026-04-08",
    sysTime: "09:15:22",
    description:
      "A meditative experience masked as a punishing platformer. The stark black and white visuals are straining on the eyes after 4 hours, but the physics engine is flawless. Still progressing through Sector 4.",
    tags: ["#ECHOES"],
  },
  {
    id: "diary-003",
    game: {
      title: "NEON_ABYSS_PROTOCOL",
      coverPlaceholder: true,
    },
    status: "COMPLETED",
    rating: 4,
    platform: "PC_MAIN",
    playtime: "28H",
    playedAt: "2026-03-22",
    sysTime: "22:41:08",
    description:
      "Cyberpunk roguelite done right. The procedural weapon system creates genuinely surprising combinations. Final boss was anticlimactic but the journey was worth every cycle.",
    tags: ["#ROGUELITE", "#CYBERPUNK"],
  },
  {
    id: "diary-004",
    game: {
      title: "HOLLOW_SIGNAL",
      coverPlaceholder: true,
    },
    status: "ON_HOLD",
    rating: 3,
    platform: "STEAM",
    playtime: "6H",
    playedAt: "2026-03-15",
    sysTime: "17:30:44",
    description:
      "Interesting premise but the pacing falls apart in Act 2. Shelving for now until the promised content patch drops. The sound design is exceptional though.",
    tags: ["#HORROR", "#ATMOSPHERIC"],
  },
]
