// ============================================
// GGLOG — Mock Collections Data
// ============================================

export interface Collection {
  id: string
  title: string
  gamesCount: number
  updatedAgo: string
}

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-001",
    title: "SYSTEM_MASTERPIECES",
    gamesCount: 45,
    updatedAgo: "2D AGO",
  },
  {
    id: "col-002",
    title: "RPG_JOURNEYS",
    gamesCount: 12,
    updatedAgo: "1W AGO",
  },
]
