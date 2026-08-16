# GGlog Backend Implementation Plan

## 1. Product Philosophy

GGlog is a social gaming archive inspired by the core principles of Letterboxd: users discover games, log games they have played, rate and review them, maintain a backlog/watchlist, create lists, follow other players, and consume a personalized activity feed.

The core product loop is:

```text
DISCOVER GAME
      ↓
VIEW GAME
      ↓
LOG GAME
      ↓
RATE / REVIEW
      ↓
ACTIVITY CREATED
      ↓
FOLLOWERS SEE ACTIVITY
      ↓
OTHER USERS DISCOVER GAME
      ↓
REPEAT
```

GGlog is **not** primarily a conventional game tracker. The central object is the user's experience with a game.

---

## 2. Letterboxd → GGlog

| Letterboxd | GGlog |
|---|---|
| Film | Game |
| Watch | Play |
| Watched | Played |
| Diary | Game Log |
| Log film | Log game |
| Review | Review |
| Rating | Rating |
| Watchlist | Backlog / Watchlist |
| List | List |
| Activity | Activity |
| Following | Following |
| Followers | Followers |
| Likes | Likes |
| Comments | Comments |
| Film page | Game page |
| Profile | Player profile |

---

## 3. MVP Scope

### Authentication
- Sign up
- Sign in
- Sign out
- Session management
- Profile
- Username
- Avatar
- Bio
- Google authentication

### Games
- Search through IGDB
- Game details
- PostgreSQL caching
- Game pages
- Genres
- Platforms
- Cover/background
- Release date
- IGDB ratings

### Logging
- Log a game
- Rating
- Date played
- Replay flag
- Optional review
- Edit/delete logs
- Multiple logs for the same game

### Personal archive
- Game history
- Reviews
- Backlog/watchlist
- Lists

Do **not** initially build:
- Currently Playing
- XP
- Ownership
- Hours played
- Achievement tracking
- Completion states

A game is considered played when at least one `LogEntry` exists for the user.

### Social
- Follow/unfollow
- Followers/following
- Activity feed
- Review likes
- Comments
- Public profiles
- Other users' logs, reviews and lists

### Lists
- Create/edit/delete
- Add/remove games
- Reorder
- Visibility

---

# 4. High-Level Architecture

```text
                    ┌───────────────┐
                    │     USER      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   NEXT.JS     │
                    │   FRONTEND    │
                    └───────┬───────┘
                            │
                         HTTP/API
                            │
                            ▼
                    ┌───────────────┐
                    │ SERVER / API  │
                    │     LAYER     │
                    └───────┬───────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │    PRISMA    │    │     IGDB     │
          │     ORM      │    │     API      │
          └──────┬───────┘    └──────┬───────┘
                 │                   │
                 ▼                   │
          ┌──────────────┐           │
          │  POSTGRESQL  │◄──────────┘
          │ GGlog data   │
          └──────────────┘
```

**Important:** IGDB is an external metadata source, not GGlog's database. PostgreSQL is GGlog's canonical application database.

---

# 5. Backend Layering

Use:

```text
Route / Controller
        ↓
Validation
        ↓
Service
        ↓
Repository / Prisma
        ↓
PostgreSQL
```

External game data:

```text
Game Service
    ↓
IGDB Service
    ↓
IGDB API
```

Avoid putting business logic directly inside route handlers.

---

# 6. Core Entities

```text
User
Profile

Game
Genre
Platform
GameGenre
GamePlatform

LogEntry
Review

WatchlistItem

List
ListItem

Follow

ReviewLike
Comment

Activity

Account
Session
```

---

# 7. Relationship Diagram

```
                              ┌─────────────┐
                              │    USER     │
                              └──────┬──────┘
                                     │
          ┌──────────────┬───────────┼──────────────┬─────────────┐
          │              │           │              │             │
          ▼              ▼           ▼              ▼             ▼
      PROFILE        LOG ENTRY    REVIEW        WATCHLIST       LIST
                         │           │              │             │
                         │           │              │             ▼
                         │           │              │          LIST ITEM
                         │           │              │             │
                         ▼           ▼              ▼             │
                      ┌───────────────────────────────────────────┘
                      │
                      ▼
                   ┌──────┐
                   │ GAME │
                   └──┬───┘
                      │
               ┌──────┴──────┐
               ▼             ▼
             GENRE        PLATFORM


USER ─────────────── FOLLOW ─────────────── USER

USER ───────────── REVIEW LIKE ─────────── REVIEW

USER ───────────── COMMENT ──────────────── REVIEW

USER ───────────── ACTIVITY ─────────────── GAME
```

---

# 8. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ReviewVisibility {
  PUBLIC
  FOLLOWERS
  PRIVATE
}

enum ListVisibility {
  PUBLIC
  FOLLOWERS
  PRIVATE
}

enum ActivityType {
  LOGGED_GAME
  REVIEWED_GAME
  LIKED_REVIEW
  CREATED_LIST
  FOLLOWED_USER
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile?
  logs         LogEntry[]
  reviews      Review[]
  lists        List[]
  watchlist    WatchlistItem[]

  followers    Follow[] @relation("followers")
  following    Follow[] @relation("following")

  reviewLikes  ReviewLike[]
  comments     Comment[]
  activities   Activity[]

  accounts     Account[]
  sessions     Session[]

  @@index([username])
}

model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique

  displayName String?
  bio         String?
  avatarUrl   String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Game {
  id               String   @id @default(cuid())
  igdbId           Int      @unique
  name             String
  slug             String?
  summary         String?
  coverUrl        String?
  backgroundUrl   String?
  releaseDate     DateTime?
  igdbRating      Float?
  igdbRatingCount Int?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  logs             LogEntry[]
  reviews          Review[]
  watchlistItems   WatchlistItem[]
  genres            GameGenre[]
  platforms         GamePlatform[]
  listItems         ListItem[]
  activities        Activity[]

  @@index([name])
  @@index([releaseDate])
}

model Genre {
  id     String      @id @default(cuid())
  igdbId Int         @unique
  name   String
  games  GameGenre[]
}

model GameGenre {
  gameId  String
  genreId String

  game  Game  @relation(fields: [gameId], references: [id], onDelete: Cascade)
  genre Genre @relation(fields: [genreId], references: [id], onDelete: Cascade)

  @@id([gameId, genreId])
}

model Platform {
  id     String         @id @default(cuid())
  igdbId Int            @unique
  name   String
  games  GamePlatform[]
}

model GamePlatform {
  gameId     String
  platformId String

  game     Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  platform Platform @relation(fields: [platformId], references: [id], onDelete: Cascade)

  @@id([gameId, platformId])
}

model LogEntry {
  id        String   @id @default(cuid())
  userId    String
  gameId    String

  playedAt  DateTime
  rating    Float?
  liked     Boolean  @default(false)
  replay    Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  game       Game       @relation(fields: [gameId], references: [id], onDelete: Cascade)
  review     Review?
  activities Activity[]

  @@index([userId, playedAt])
  @@index([gameId, playedAt])
}

model Review {
  id         String           @id @default(cuid())
  userId     String
  gameId     String
  logEntryId String           @unique

  body       String
  visibility ReviewVisibility @default(PUBLIC)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  game       Game       @relation(fields: [gameId], references: [id], onDelete: Cascade)
  logEntry   LogEntry   @relation(fields: [logEntryId], references: [id], onDelete: Cascade)

  likes      ReviewLike[]
  comments   Comment[]
  activities Activity[]

  @@index([gameId, createdAt])
  @@index([userId, createdAt])
}

model ReviewLike {
  userId    String
  reviewId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@id([userId, reviewId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  reviewId  String
  body      String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@index([reviewId, createdAt])
}

model WatchlistItem {
  userId    String
  gameId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@id([userId, gameId])
  @@index([userId, createdAt])
}

model List {
  id          String         @id @default(cuid())
  userId      String
  title       String
  description String?
  visibility  ListVisibility @default(PUBLIC)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items      ListItem[]
  activities Activity[]

  @@index([userId, createdAt])
}

model ListItem {
  listId    String
  gameId    String
  position  Int
  createdAt DateTime @default(now())

  list List @relation(fields: [listId], references: [id], onDelete: Cascade)
  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@id([listId, gameId])
  @@index([listId, position])
}

model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("following", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@index([followingId])
}

model Activity {
  id         String       @id @default(cuid())
  actorId    String
  type       ActivityType

  gameId     String?
  logEntryId String?
  reviewId   String?
  listId     String?

  createdAt  DateTime @default(now())

  actor    User       @relation(fields: [actorId], references: [id], onDelete: Cascade)
  game     Game?      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  logEntry LogEntry?  @relation(fields: [logEntryId], references: [id], onDelete: Cascade)
  review   Review?    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  list     List?      @relation(fields: [listId], references: [id], onDelete: Cascade)

  @@index([actorId, createdAt])
  @@index([createdAt])
}

model Account {
  id                String @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String

  accessToken  String?
  refreshToken String?
  expiresAt    Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expiresAt    DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

# 9. Core Database Rules

### Game is global

One IGDB game becomes one GGlog `Game`.

```text
IGDB Elden Ring
      ↓
GGlog Game #123
```

Every user references that same Game.

### LogEntry is personal

```text
User A → LogEntry → Elden Ring
User B → LogEntry → Elden Ring
```

### Multiple logs are allowed

This supports replay history.

### Review is attached to a log

```text
LogEntry
   │
   └── optional Review
```

### Watchlist is separate

```text
User → WatchlistItem → Game
```

### Logging removes backlog

When a game is successfully logged, remove the corresponding watchlist item in the same transaction.

---

# 10. Authentication Workflows

## Signup

```text
USER
 ↓
POST /api/auth/signup
 ↓
VALIDATE INPUT
 ├─ username
 ├─ email
 └─ password
 ↓
CHECK DATABASE
 ├─ username exists → ERROR
 └─ email exists → ERROR
 ↓
HASH PASSWORD
 ↓
TRANSACTION
 ├─ Create User
 └─ Create Profile
 ↓
CREATE SESSION
 ↓
HTTP-ONLY COOKIE
 ↓
RETURN USER
```

## Login

```text
USER
 ↓
POST /api/auth/login
 ↓
FIND USER
 ↓
VERIFY PASSWORD
 ├─ FAIL → AUTH ERROR
 └─ SUCCESS
       ↓
   CREATE SESSION
       ↓
   HTTP-ONLY COOKIE
       ↓
      HOME
```

Use secure HTTP-only cookies for sessions. Do not put long-lived authentication credentials in `localStorage`.

---

# 11. IGDB Game Search Workflow

Frontend never calls IGDB directly.

```text
USER SEARCHES "ELDEN RING"
          ↓
GET /api/games/search?q=elden
          ↓
GAME SERVICE
          ↓
POSTGRESQL
          ↓
Already cached?
   ┌──────┴──────┐
  YES            NO
   │              │
   ▼              ▼
RETURN         IGDB SERVICE
LOCAL             ↓
RESULT          IGDB API
                  ↓
             NORMALIZE
                  ↓
             PRISMA/DB
                  ↓
              RETURN
```

Use on-demand ingestion rather than importing the entire IGDB catalog.

---

# 12. Logging Workflow

User clicks:

```text
+ LOG GAME
```

Form:

```text
Rating
Date Played
Replay?
Review
```

Request:

```http
POST /api/logs
```

Flow:

```text
USER
 ↓
POST /api/logs
 ↓
AUTHENTICATE
 ↓
VALIDATE
 ↓
CHECK GAME
 ↓
DATABASE TRANSACTION
 ├─ Create LogEntry
 ├─ Create Review if supplied
 ├─ Remove WatchlistItem
 └─ Create Activity
 ↓
RETURN LOG
```

A user can log without reviewing.

---

# 13. Review Workflow

```text
USER
 ↓
POST /api/reviews
 ↓
AUTHENTICATE
 ↓
FIND LOG ENTRY
 ↓
VERIFY LOG BELONGS TO USER
 ↓
CREATE REVIEW
 ↓
CREATE/UPDATE ACTIVITY
 ↓
RETURN REVIEW
```

Editing/deleting a review requires:

```text
currentUser.id === review.userId
```

---

# 14. Watchlist Workflow

Add:

```http
POST /api/watchlist/:gameId
```

Remove:

```http
DELETE /api/watchlist/:gameId
```

When a game is logged:

```text
WatchlistItem
      ↓
DELETE
      ↓
LogEntry created
```

---

# 15. Social Graph

Following is directed.

```text
A follows B
```

does not mean:

```text
B follows A
```

Follow workflow:

```text
USER A
 ↓
POST /api/users/:username/follow
 ↓
AUTHENTICATE
 ↓
FIND USER B
 ↓
A != B
 ↓
CHECK EXISTING FOLLOW
 ↓
CREATE Follow
 ↓
CREATE Activity
```

Unfollow:

```http
DELETE /api/users/:username/follow
```

The composite primary key prevents duplicate follows.

---

# 16. Activity System

Activities represent meaningful social actions.

```text
LOGGED_GAME
REVIEWED_GAME
LIKED_REVIEW
CREATED_LIST
FOLLOWED_USER
```

Example:

```text
POST /api/logs
      ↓
LogEntry
      +
Activity(LOGGED_GAME)
```

Review:

```text
Review
  +
Activity(REVIEWED_GAME)
```

Like:

```text
ReviewLike
  +
Activity(LIKED_REVIEW)
```

---

# 17. Social Feed Workflow

Suppose the user follows:

```text
Alex
Maya
Rishabh
```

Alex logs Elden Ring, Maya reviews Hollow Knight, and Rishabh likes a Sekiro review.

The feed becomes:

```text
ALEX
logged ELDEN RING
★★★★★

MAYA
reviewed HOLLOW KNIGHT
★★★★½

RISHABH
liked a review of SEKIRO
```

Flow:

```text
CURRENT USER
      ↓
GET FOLLOWING IDS
      ↓
GET THEIR ACTIVITIES
      ↓
SORT BY createdAt DESC
      ↓
APPLY VISIBILITY
      ↓
CURSOR PAGINATION
      ↓
HYDRATE ACTOR/GAME/REVIEW
      ↓
RETURN FEED
```

Endpoint:

```http
GET /api/feed?limit=20
GET /api/feed?limit=20&cursor=abc123
```

Use cursor pagination rather than large offset pages.

---

# 18. Activity Hydration

Keep Activity records small.

Example API response:

```json
{
  "id": "activity_123",
  "type": "REVIEWED_GAME",
  "createdAt": "2026-08-10T12:00:00Z",
  "actor": {
    "username": "alex",
    "avatarUrl": "..."
  },
  "game": {
    "id": "...",
    "name": "Elden Ring",
    "coverUrl": "..."
  },
  "review": {
    "id": "...",
    "rating": 5,
    "body": "Absolutely incredible."
  }
}
```

Do not return entire Prisma objects to the frontend.

---

# 19. Review Likes

```http
POST /api/reviews/:id/like
DELETE /api/reviews/:id/like
```

Flow:

```text
USER
 ↓
AUTHENTICATE
 ↓
FIND REVIEW
 ↓
CHECK EXISTING LIKE
 ├─ EXISTS → return already liked
 └─ MISSING
      ↓
Create ReviewLike
      ↓
Create Activity
```

Composite primary key:

```text
(userId, reviewId)
```

prevents duplicate likes.

---

# 20. Comments

```http
POST /api/reviews/:id/comments
GET /api/reviews/:id/comments
```

Flow:

```text
USER
 ↓
AUTHENTICATE
 ↓
FIND REVIEW
 ↓
VALIDATE
 ↓
CREATE COMMENT
 ↓
RETURN COMMENT
```

Comments should be paginated.

---

# 21. Profiles

Public profile:

```text
GGLOG

@SOUNAVA

Avatar
Bio

47 GAMES LOGGED
31 REVIEWS
128 FOLLOWING
94 FOLLOWERS

[ FOLLOW ]

FAVORITES

[GAME] [GAME] [GAME] [GAME]

ACTIVITY | LOG | REVIEWS | LISTS | WATCHLIST
```

Routes:

```http
GET /api/users/:username
GET /api/users/:username/log
GET /api/users/:username/reviews
GET /api/users/:username/lists
GET /api/users/:username/followers
GET /api/users/:username/following
```

---

# 22. Game Page

A game page is both a metadata page and a social hub.

```text
ELDEN RING

Cover
Title
Release date
Genres
Platforms
IGDB rating

[ LOG GAME ]
[ + BACKLOG ]

GGLOG RATING
★★★★★ 4.6
23,482 ratings

RECENT REVIEWS

@alex
★★★★★
...

@maya
★★★★½
...

@rishabh
★★★★★
...
```

The game page should answer:

1. What is this game?
2. What does the GGlog community think about it?

---

# 23. Lists

Create:

```http
POST /api/lists
```

Example:

```json
{
  "title": "Best RPGs",
  "description": "My favorite RPGs",
  "visibility": "PUBLIC"
}
```

Add game:

```http
POST /api/lists/:id/games/:gameId
```

Remove:

```http
DELETE /api/lists/:id/games/:gameId
```

Reorder:

```http
PATCH /api/lists/:id/games
```

Use explicit `position` values.

---

# 24. Visibility

Reviews:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

Lists:

```text
PUBLIC
FOLLOWERS
PRIVATE
```

Visibility must be enforced server-side. The frontend must never be trusted to hide private content.

---

# 25. Authorization

Every protected mutation follows:

```text
AUTHENTICATE
      ↓
IDENTIFY USER
      ↓
AUTHORIZE RESOURCE
      ↓
PERFORM ACTION
```

Examples:

```text
Edit review → currentUser.id === review.userId
Delete list → currentUser.id === list.userId
Delete log → currentUser.id === log.userId
Edit profile → currentUser.id === profile.userId
```

---

# 26. API Structure

```text
/api

/auth
    POST /signup
    POST /login
    POST /logout
    GET  /me

/games
    GET /search?q=
    GET /:id
    GET /:id/reviews

/logs
    POST /
    GET /me
    GET /:id
    PATCH /:id
    DELETE /:id

/reviews
    POST /
    GET /:id
    PATCH /:id
    DELETE /:id
    POST /:id/like
    DELETE /:id/like
    POST /:id/comments
    GET /:id/comments

/watchlist
    GET /
    POST /:gameId
    DELETE /:gameId

/lists
    POST /
    GET /me
    GET /:id
    PATCH /:id
    DELETE /:id
    POST /:id/games/:gameId
    DELETE /:id/games/:gameId
    PATCH /:id/games

/users
    GET /:username
    GET /:username/log
    GET /:username/reviews
    GET /:username/lists
    GET /:username/followers
    GET /:username/following
    POST /:username/follow
    DELETE /:username/follow

/feed
    GET /
```

---

# 27. API Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Review not found."
  }
}
```

Never expose raw Prisma/database errors.

---

# 28. Home Page

The authenticated home page should be **feed-first**, not dashboard-first.

```text
HOME

Following Feed

Recent Activity
Reviews
Logged Games
Lists

Secondary area:
- Recent personal logs
- Backlog
- Suggested users
- Popular games
```

Do not make the primary home page about:

```text
XP
Hours
Completion %
Currently Playing
```

---

# 29. Personal Log

The log should feel like a diary.

```text
MY LOG

AUGUST 2026

10 AUG
ELDEN RING
★★★★★
REVIEWED

07 AUG
HOLLOW KNIGHT
★★★★½

JULY 2026

29 JUL
SEKIRO
★★★★★
REPLAY
```

Route:

```http
GET /api/logs/me
```

or:

```http
GET /api/users/:username/log
```

Sort by `playedAt DESC`.

---

# 30. Database Transactions

Use Prisma transactions whenever one user action changes multiple records.

For logging:

```text
BEGIN TRANSACTION

Create LogEntry
Create Review if supplied
Delete WatchlistItem
Create Activity

COMMIT
```

If anything fails:

```text
ROLLBACK
```

This prevents inconsistent states such as a game being logged while the backlog item remains and the activity is missing.

---

# 31. Search Strategy

Initial search:

```http
GET /api/games/search?q=elden
```

Flow:

```text
Local PostgreSQL
      ↓
Enough results?
  ┌───┴───┐
 YES      NO
  │        │
  ▼        ▼
RETURN    IGDB
           ↓
        NORMALIZE
           ↓
        UPSERT
           ↓
         RETURN
```

Do not import the entire IGDB catalog into GGlog initially.

---

# 32. IGDB Service

Keep IGDB isolated:

```text
services/
    igdb/
        client.ts
        token.ts
        queries.ts
        mapper.ts
```

### token.ts
- Obtain Twitch app access token
- Cache it
- Refresh when expired

### client.ts
- Authenticated IGDB requests
- Error handling

### queries.ts
- Game search
- Game details
- Related metadata

### mapper.ts
Convert IGDB responses into GGlog database objects.

---

# 33. Recommended Folder Structure

```text
src/
│
├── app/
│   └── api/
│
├── modules/
│   ├── auth/
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── validation.ts
│   │   └── types.ts
│   │
│   ├── games/
│   ├── logs/
│   ├── reviews/
│   ├── users/
│   ├── follows/
│   ├── feed/
│   ├── lists/
│   └── watchlist/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── errors.ts
│
└── services/
    └── igdb/
        ├── client.ts
        ├── token.ts
        ├── queries.ts
        └── mapper.ts

prisma/
└── schema.prisma
```

---

# 34. Implementation Order

## Phase 0 — Architecture

Before coding:

- Finalize schema
- Finalize API routes
- ER diagram
- Authentication flow
- IGDB ingestion flow
- Logging flow
- Follow flow
- Activity/feed flow

## Phase 1 — PostgreSQL + Prisma

```bash
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

Do not manually modify the production database outside the migration workflow.

## Phase 2 — Authentication

Implement:

```text
Signup
Login
Logout
Session
Profile
```

Test with Thunder Client before frontend integration.

## Phase 3 — IGDB

Implement:

```text
Token service
IGDB client
Game search
Game ingestion
Game details
```

## Phase 4 — Games

Implement:

```text
Game page
Search
Log Game
Add to Backlog
```

## Phase 5 — Logging

Implement:

```text
Create log
List personal logs
View log
Edit log
Delete log
Replay
```

## Phase 6 — Reviews

Implement:

```text
Create
Edit
Delete
Like
Unlike
Comments
```

## Phase 7 — Profiles

Implement:

```text
Public profile
Log
Reviews
Lists
Followers
Following
```

## Phase 8 — Follow System

Implement:

```text
Follow
Unfollow
Followers
Following
```

## Phase 9 — Activity

Implement:

```text
LOGGED_GAME
REVIEWED_GAME
LIKED_REVIEW
CREATED_LIST
FOLLOWED_USER
```

## Phase 10 — Feed

Implement:

```text
GET /api/feed
```

with visibility and cursor pagination.

## Phase 11 — Lists

Implement:

```text
Create
Edit
Delete
Add games
Remove games
Reorder
Visibility
```

---

# 35. Testing Plan

## Authentication

```text
Signup
Duplicate username
Duplicate email
Wrong password
Correct password
Logout
Expired session
```

## Games

```text
Search known game
Search unknown game
Cached game
IGDB failure
Game ingestion
```

## Logs

```text
Create log
Edit log
Delete log
Replay
Multiple logs for same game
```

## Reviews

```text
Create
Edit own
Cannot edit another user's
Delete own
Like
Unlike
Comment
```

## Social

```text
Follow
Unfollow
Duplicate follow
Self-follow
Followers
Following
```

## Feed

```text
No follows → empty feed
One follow → their activity
Multiple follows → chronological feed
Private content hidden
Pagination
```

---

# 36. Security

Required:

- Password hashing
- HTTP-only cookies
- Secure cookies in production
- Server-side validation
- Authorization checks
- Rate limiting on auth
- Rate limiting on social mutations
- Never expose password hashes
- Never expose Twitch Client Secret
- Never call IGDB directly from browser
- Validate user-generated content
- Paginate feeds/reviews/comments/lists
- Enforce visibility server-side

---

# 37. Performance

PostgreSQL + Prisma is sufficient for the MVP.

Do not introduce Redis, Kafka, Elasticsearch, or microservices until actual scale requires them.

Important indexes:

```text
User.username
Game.igdbId
Game.name
LogEntry(userId, playedAt)
LogEntry(gameId, playedAt)
Review(gameId, createdAt)
Review(userId, createdAt)
WatchlistItem(userId, createdAt)
List(userId, createdAt)
ListItem(listId, position)
Follow(followingId)
Activity(actorId, createdAt)
Activity(createdAt)
Comment(reviewId, createdAt)
```

At larger scale, the activity feed can be moved toward a fan-out/precomputed-feed model using workers/Redis.

---

# 38. Future Features

Only after MVP:

```text
Steam integration
PlayStation integration
Xbox integration
Automatic game logging
Achievements
Playtime
Gaming Wrapped
Advanced statistics
Recommendations
Similar players
Taste profiles
Trending games
Trending reviews
Notifications
Comment replies
Search users
Search reviews
Search lists
Tags
Spoiler controls
```

These should not complicate the initial architecture.

---

# 39. Final Product Loop

```text
                    DISCOVER
                       │
                       ▼
                     GAME
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           BACKLOG             LOG
                                │
                         ┌──────┴──────┐
                         │             │
                         ▼             ▼
                       RATING        REVIEW
                         │             │
                         └──────┬──────┘
                                │
                                ▼
                            ACTIVITY
                                │
                                ▼
                           FOLLOWERS
                                │
                                ▼
                              FEED
                                │
                                ▼
                         DISCOVER GAME
                                │
                                └──────► ...
```

That loop is the heart of GGlog.

---

# 40. MVP Definition of Done

A user must be able to:

1. Create an account
2. Log in
3. Search for a game
4. Open its game page
5. Add it to their backlog
6. Log the game
7. Rate it
8. Write a review
9. See the log on their profile
10. See the review on their profile
11. Follow another user
12. View that user's profile
13. See that user's activity
14. See their activity in the home feed
15. Like their review
16. Comment on their review
17. Create a list
18. Add games to the list
19. View public lists
20. Manage their profile

When these work reliably, GGlog is a real MVP rather than simply a game database.

---

# 41. Immediate Next Steps

```text
FINALIZE ARCHITECTURE
        ↓
CREATE POSTGRESQL DATABASE
        ↓
INITIALIZE PRISMA
        ↓
ADD schema.prisma
        ↓
RUN FIRST MIGRATION
        ↓
CREATE PRISMA CLIENT
        ↓
BUILD AUTH
        ↓
BUILD IGDB SERVICE
        ↓
BUILD GAMES
        ↓
BUILD LOGS
        ↓
BUILD REVIEWS
        ↓
BUILD PROFILES
        ↓
BUILD FOLLOW GRAPH
        ↓
BUILD ACTIVITY
        ↓
BUILD FEED
        ↓
BUILD LISTS
        ↓
CONNECT FRONTEND
```

**Do not start with the feed.**

The dependency chain is:

```text
User
 ↓
Game
 ↓
Log
 ↓
Review
 ↓
Follow
 ↓
Activity
 ↓
Feed
```

Build that chain in order.




