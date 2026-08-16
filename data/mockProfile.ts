// ============================================
// GGLOG — Mock Profile Data
// ============================================
//
// Placeholder data for the profile page.
// Will be replaced by Prisma API calls later.
// ============================================

export interface ProfileStats {
  gamesLogged: number
  reviews: number
  lists: number
  followers: number
  following: number
}

export interface GenreDistribution {
  name: string
  percentage: number
  color: string // tailwind color class
}

export interface PlayerStats {
  gamesLoggedYTD: number
  hoursConnected: number
  genres: GenreDistribution[]
}

export const MOCK_PROFILE_STATS: ProfileStats = {
  gamesLogged: 124,
  reviews: 38,
  lists: 12,
  followers: 86,
  following: 142,
}

export const MOCK_BIO_QUOTE = '"Tracking every world I\'ve explored."'

export const MOCK_PLAYER_STATS: PlayerStats = {
  gamesLoggedYTD: 42,
  hoursConnected: 846,
  genres: [
    { name: "RPG", percentage: 45, color: "bg-lime" },
    { name: "ACTION", percentage: 30, color: "bg-warning" },
    { name: "INDIE", percentage: 15, color: "bg-text-muted" },
    { name: "STRATEGY", percentage: 10, color: "bg-text-muted/60" },
  ],
}
