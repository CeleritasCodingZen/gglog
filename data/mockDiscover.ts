// ============================================
// GGLOG — Mock Discover Data
// ============================================
// Placeholder data for the Discover page.
// Will be replaced by API calls later.
// All interfaces are designed to mirror
// what a future API response would return.
// ============================================

export interface DiscoverUser {
  id: string
  username: string        // display name e.g. "ALEX.SYS"
  handle: string          // @handle e.g. "@alex_null"
  gamesLogged: number
  reviews: number
  followers: number
  genres: string[]        // 1-2 genre tags
  avatarInitial: string   // fallback letter for avatar
  profileUrl: string
}

export interface DiscoverReview {
  id: string
  author: DiscoverUser
  game: string
  rating: number          // e.g. 5 or 4.5
  ratingDisplay: string   // e.g. "5/5" or "4.5/5"
  excerpt: string
  likes: number
  comments: number
  timestamp: string       // relative timestamp e.g. "2 HOURS AGO"
  reviewUrl: string
}

export interface DiscoverGame {
  id: string
  title: string
  reviewCount: number
  gameUrl: string
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export const MOCK_DISCOVER_USERS: DiscoverUser[] = [
  {
    id: "u-001",
    username: "ALEX.SYS",
    handle: "@alex_null",
    gamesLogged: 412,
    reviews: 184,
    followers: 2400,
    genres: ["RPG", "STRATEGY"],
    avatarInitial: "A",
    profileUrl: "/profile/alex_null",
  },
  {
    id: "u-002",
    username: "HAYA.EXE",
    handle: "@haya_strike",
    gamesLogged: 89,
    reviews: 89,
    followers: 1100,
    genres: ["ACTION", "FIGHTING"],
    avatarInitial: "H",
    profileUrl: "/profile/haya_strike",
  },
  {
    id: "u-003",
    username: "RISHABH.LOG",
    handle: "@rishabh",
    gamesLogged: 233,
    reviews: 121,
    followers: 876,
    genres: ["INDIE", "PUZZLE"],
    avatarInitial: "R",
    profileUrl: "/profile/rishabh",
  },
  {
    id: "u-004",
    username: "NOVA",
    handle: "@nova_sys",
    gamesLogged: 578,
    reviews: 302,
    followers: 5200,
    genres: ["HORROR", "ADVENTURE"],
    avatarInitial: "N",
    profileUrl: "/profile/nova_sys",
  },
  {
    id: "u-005",
    username: "KAI",
    handle: "@kai_exe",
    gamesLogged: 144,
    reviews: 67,
    followers: 430,
    genres: ["SPORTS", "RACING"],
    avatarInitial: "K",
    profileUrl: "/profile/kai_exe",
  },
  {
    id: "u-006",
    username: "MIRA",
    handle: "@mira_log",
    gamesLogged: 319,
    reviews: 198,
    followers: 3100,
    genres: ["RPG", "SIM"],
    avatarInitial: "M",
    profileUrl: "/profile/mira_log",
  },
  {
    id: "u-007",
    username: "VOID.DAT",
    handle: "@void_dat",
    gamesLogged: 62,
    reviews: 28,
    followers: 210,
    genres: ["SOULSLIKE", "ACTION"],
    avatarInitial: "V",
    profileUrl: "/profile/void_dat",
  },
  {
    id: "u-008",
    username: "ECHO.RUN",
    handle: "@echo_run",
    gamesLogged: 491,
    reviews: 244,
    followers: 4700,
    genres: ["STRATEGY", "TACTICS"],
    avatarInitial: "E",
    profileUrl: "/profile/echo_run",
  },
]

// ─────────────────────────────────────────────
// GAMES (for Currently Discussed + search)
// ─────────────────────────────────────────────

export const MOCK_DISCUSSED_GAMES: DiscoverGame[] = [
  { id: "g-001", title: "ELDEN RING", reviewCount: 23, gameUrl: "/games/elden-ring" },
  { id: "g-002", title: "CYBERPUNK 2077", reviewCount: 18, gameUrl: "/games/cyberpunk-2077" },
  { id: "g-003", title: "BALDUR'S GATE 3", reviewCount: 15, gameUrl: "/games/baldurs-gate-3" },
  { id: "g-004", title: "SEKIRO", reviewCount: 14, gameUrl: "/games/sekiro" },
  { id: "g-005", title: "HOLLOW KNIGHT", reviewCount: 12, gameUrl: "/games/hollow-knight" },
]

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

const ALEX = MOCK_DISCOVER_USERS[0]!
const HAYA = MOCK_DISCOVER_USERS[1]!
const RISHABH = MOCK_DISCOVER_USERS[2]!
const NOVA = MOCK_DISCOVER_USERS[3]!
const MIRA = MOCK_DISCOVER_USERS[5]!

export const MOCK_DISCOVER_REVIEWS: DiscoverReview[] = [
  {
    id: "r-001",
    author: ALEX,
    game: "ELDEN RING",
    rating: 5,
    ratingDisplay: "5/5",
    excerpt:
      "Some games feel large because they contain a lot. This one feels large because every corner has something worth remembering. The world design is the thesis statement.",
    likes: 24,
    comments: 7,
    timestamp: "2 HOURS AGO",
    reviewUrl: "/reviews/r-001",
  },
  {
    id: "r-002",
    author: HAYA,
    game: "HOLLOW KNIGHT",
    rating: 4.5,
    ratingDisplay: "4.5/5",
    excerpt:
      "Every death feels instructive rather than punitive. The map design is deceptively cruel — it teaches patience before it teaches skill.",
    likes: 18,
    comments: 4,
    timestamp: "5 HOURS AGO",
    reviewUrl: "/reviews/r-002",
  },
  {
    id: "r-003",
    author: NOVA,
    game: "BALDUR'S GATE 3",
    rating: 5,
    ratingDisplay: "5/5",
    excerpt:
      "200 hours in and I still encounter dialogue I haven't seen. It functions less like a game and more like a world with entry points. My companions feel real in a way I didn't expect.",
    likes: 61,
    comments: 14,
    timestamp: "1 DAY AGO",
    reviewUrl: "/reviews/r-003",
  },
  {
    id: "r-004",
    author: RISHABH,
    game: "SEKIRO",
    rating: 4,
    ratingDisplay: "4/5",
    excerpt:
      "The rhythm-game masquerading as a sword fight. Once that clicked I couldn't put it down. Posture mechanics are an elegant solution to the stagger problem.",
    likes: 32,
    comments: 9,
    timestamp: "2 DAYS AGO",
    reviewUrl: "/reviews/r-004",
  },
  {
    id: "r-005",
    author: MIRA,
    game: "CYBERPUNK 2077",
    rating: 4,
    ratingDisplay: "4/5",
    excerpt:
      "Night City is worth the ticket price alone. The worldbuilding density per square metre is unmatched. The main story is a vehicle; the side content is the destination.",
    likes: 45,
    comments: 11,
    timestamp: "3 DAYS AGO",
    reviewUrl: "/reviews/r-005",
  },
]

// ─────────────────────────────────────────────
// SPOTLIGHT REVIEW (featured, larger format)
// ─────────────────────────────────────────────

export const MOCK_SPOTLIGHT_REVIEW: DiscoverReview = {
  ...MOCK_DISCOVER_REVIEWS[0]!,
  excerpt:
    "Some games feel large because they contain a lot. This one feels large because every corner has something worth remembering. FromSoftware has always understood that mystery is a form of respect — that the player deserves to discover rather than be told. Elden Ring is the culmination of that philosophy, translated into the largest canvas they have ever worked with. I have played 142 hours and I suspect there are zones I have never found.",
}

// ─────────────────────────────────────────────
// SYSTEM STATS (placeholder values)
// ─────────────────────────────────────────────

export const SYSTEM_STATS = {
  users: "12,842",
  reviews: "84,291",
  active: "3,721",
}
