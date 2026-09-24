# GGLOG — Beta Production Readiness Audit

**Audit Date:** September 24, 2026  
**Repository Branch:** `main`  
**Commit Examined:** `1e93d26` (with working tree verification)  
**Audit Type:** Full Beta Production Readiness Audit  
**Scope:** Application, API, database, authentication, realtime infrastructure, deployment, security, performance, frontend integration, and production configuration.  
**Verification Environment:** Node.js v20.x, TypeScript 5.x, Next.js 16.3.0 (Turbopack), Prisma 7.9.1, PostgreSQL (Neon Serverless)  
**Overall Status:** 🟡 **NEARLY READY — 3 BLOCKERS REMAIN**  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
   - [2.1 Frontend / API Layer](#21-frontend--api-layer)
   - [2.2 Database Layer](#22-database-layer)
   - [2.3 WebSocket Layer](#23-websocket-layer)
   - [2.4 External IGDB Integration](#24-external-igdb-integration)
   - [2.5 Authentication Architecture](#25-authentication-architecture)
   - [2.6 Cross-Origin & Deployment Architecture](#26-cross-origin--deployment-architecture)
   - [2.7 System Topology Diagram](#27-system-topology-diagram)
3. [Deployment Topology](#3-deployment-topology)
4. [Previously Identified Security Fixes](#4-previously-identified-security-fixes)
5. [Authentication & Session Security](#5-authentication--session-security)
6. [IGDB Integration Audit](#6-igdb-integration-audit)
7. [API Route Inventory](#7-api-route-inventory)
8. [Database & Prisma Audit](#8-database--prisma-audit)
9. [Render WebSocket Server Audit](#9-render-websocket-server-audit)
10. [Realtime Notification Architecture](#10-realtime-notification-architecture)
11. [WebSocket Ticket Handshake](#11-websocket-ticket-handshake)
12. [Environment Variables Audit](#12-environment-variables-audit)
13. [Vercel Production Readiness](#13-vercel-production-readiness)
14. [Render Production Readiness](#14-render-production-readiness)
15. [Frontend Functional Audit](#15-frontend-functional-audit)
16. [Mock Data & Incomplete UI Audit](#16-mock-data--incomplete-ui-audit)
17. [Security Audit](#17-security-audit)
18. [Performance & Scalability Audit](#18-performance--scalability-audit)
19. [Error Handling & Reliability](#19-error-handling--reliability)
20. [Testing & Verification](#20-testing--verification)
21. [Current Implementation Matrix](#21-current-implementation-matrix)
22. [Remaining Work](#22-remaining-work)
    - [P0 — Must Fix Before Beta](#p0--must-fix-before-beta)
    - [P1 — Should Fix During Beta Preparation](#p1--should-fix-during-beta-preparation)
    - [P2 — Post-Beta / Scale Improvements](#p2--post-beta--scale-improvements)
23. [Beta Launch Checklist](#23-beta-launch-checklist)
24. [Recommended Beta Testing Protocol](#24-recommended-beta-testing-protocol)
25. [Known Non-Blockers](#25-known-non-blockers)
26. [Post-Beta Roadmap](#26-post-beta-roadmap)
27. [Final Beta Readiness Assessment](#27-final-beta-readiness-assessment)
28. [Appendix — Important Files](#28-appendix--important-files)

---

## 1. Executive Summary

### 1.1 Project Overview
GGLOG is a retro-futuristic social gaming diary and community platform inspired by Letterboxd. It enables players to catalog gaming experiences, assign star ratings, compose detailed reviews, curate personal game histories, follow other gamers, engage via likes and comments, and receive instant realtime notifications.

### 1.2 Current Architecture & Topology
The application relies on a dual-host production deployment:
- **Web & API Host (Vercel):** Runs Next.js 16 (App Router) with React 19 and TypeScript. Hosts the frontend user interface and 26 serverless API endpoints.
- **Database (Neon PostgreSQL):** Pooled serverless PostgreSQL accessed via Prisma ORM 7.9.1 using `@prisma/adapter-neon`.
- **Realtime Service (Render):** A dedicated Node.js WebSocket server (`server/ws.ts`) that manages active browser sockets and connects to the same Neon database to poll for and broadcast notifications.
- **Game Metadata (Twitch OAuth2 + IGDB v4):** Server-side integration authenticating via Twitch Client Credentials to query IGDB metadata and cache global game entities into Neon.

### 1.3 Overall Beta Readiness
GGLOG is **Nearly Ready** for a controlled 3–5 user beta launch. The core database schema, data relationships, transactional logging pipeline, Twitch OAuth integration, password hashing, and cross-origin WebSocket ticket handshakes are fully built and verified in the current code.

### 1.4 Production-Grade Systems (Verified)
- **User Authentication:** Bcrypt password hashing (12 salt rounds), HttpOnly/SameSite session cookies, and session invalidation upon logout.
- **Twitch/IGDB OAuth2 Pipeline:** Automatic token acquisition, 5-minute safety buffers, in-flight stampede protection, and automatic 401 retry recovery. Static bearer tokens have been completely eliminated.
- **Core Game Logging:** Transactional creation of `LogEntry`, `Review`, and `Activity` records linked to globally deduplicated `Game` records.
- **Social Graph & Engagements:** Directed follow/unfollow graph, review likes with composite primary key idempotency, threaded comments, and user search.
- **Realtime Infrastructure:** Cross-origin WebSocket authentication via single-use 60-second tickets (`WsTicket`), sequential database polling, batching, and keepalive pings.
- **Compilation & Bundling:** `npx tsc --noEmit` exits with 0 errors; `next build` compiles successfully with Turbopack in 24.4s.

### 1.5 Genuine Blockers Remaining for 3–5 User Beta
Only **three blockers** must be addressed before beta deployment:
1. **ESLint Build Risk:** `npm run lint` fails with exit code 1 because `eslint.config.mjs` does not ignore `src/generated/**` (the Prisma Client generated files), combined with 39 JSX comment syntax errors in application components. If Vercel enforces linting during the build, deployment will be rejected.
2. **Missing Build Automation:** `package.json` lacks `"postinstall": "prisma generate"`, creating a critical deployment risk where the Prisma Client is not automatically generated in fresh cloud container environments.
3. **Frontend Dead Links & Mock Data:**
   - In `components/discover/ReviewCard.tsx`, clicking `[ READ ]` routes to `/dashboard/diary`, which does not exist in the routing tree (triggers a 404).
   - In `app/dashboard/page.tsx`, the profile header and side statistics panel render hardcoded mock constants (`MOCK_PROFILE_STATS`, `MOCK_PLAYER_STATS`) rather than the authenticated user's actual database record.

### 1.6 Deferred Post-Beta Scope
- Distributed Redis rate limiting (in-memory rate limiting is completely sufficient for 3–5 beta users).
- Watchlist and Curated Lists subsystems (backend services exist, but API/UI can wait for a later release).
- Social feed query optimizations and materialized database feeds.
- Automated end-to-end testing suites (Playwright/Cypress).

---

## 2. System Architecture

### 2.1 Frontend / API Layer
- **Framework:** Next.js 16.3.0 with React 19.2.8 and TypeScript 5.
- **Routing:** App Router located in `app/`. Client components use `"use client"` and React hooks for local state and optimistic UI updates.
- **API Runtime:** Next.js Serverless Route Handlers (`app/api/**/route.ts`). Responses are strictly normalized via `lib/errors.ts` returning standard envelopes: `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`.
- **Validation:** Zod schemas in `lib/validations/` enforce payload structure, data types, and character limits across all mutations.

### 2.2 Database Layer
- **Engine:** Neon Serverless PostgreSQL.
- **ORM:** Prisma Client 7.9.1 configured with `@prisma/adapter-neon` in `lib/db.ts` to allow connection pooling over HTTP/WebSockets.
- **Connection Model:**
  - `DATABASE_URL`: Pooled connection string used by Next.js serverless functions and the Render WebSocket server.
  - `DIRECT_URL`: Direct unpooled connection string used exclusively by Prisma CLI (`prisma.config.ts`) for running migrations.

### 2.3 WebSocket Layer
- **File:** `server/ws.ts`.
- **Process Model:** Standalone, persistent Node.js HTTP + WebSocket server (`ws` library).
- **Authentication:** Ticket-based handshake for cross-origin deployment; fallback to cookie parsing for local development.
- **Database Bridge:** Because Vercel serverless functions cannot communicate via in-memory events with Render, `server/ws.ts` executes a sequential polling loop querying Neon for new `Notification` rows directed at connected users.

### 2.4 External IGDB Integration
- **Directory:** `lib/idgb/`.
- **Authentication:** `lib/idgb/auth.ts` communicates directly with Twitch OAuth2 (`https://id.twitch.tv/oauth2/token`) using the `client_credentials` grant.
- **Caching:** Obtained access tokens are stored in server memory alongside an expiration timestamp calculated as `Date.now() + (expires_in * 1000) - 300000` (5-minute safety buffer).
- **Client:** `lib/idgb/client.ts` centralizes Apicalypse POST requests to `https://api.igdb.com/v4`.

### 2.5 Authentication Architecture
- **Mechanism:** Native custom session authentication (zero third-party auth vendors).
- **Password Security:** Salted and hashed using `bcryptjs` with 12 rounds in `app/api/auth/signup/route.ts`.
- **Session Model:** Upon login, a cryptographically random UUID token (`crypto.randomUUID()`) is generated, stored in the `Session` table with a 30-day expiry, and issued to the client via an `HttpOnly`, `SameSite=Lax` cookie named `gglog_session`.
- **Protection Guard:** Server-side `requireAuth()` helper verifies the cookie against Neon. Client-side `ProtectedRoute.tsx` prevents rendering and redirects unauthenticated users to `/auth`.

### 2.6 Cross-Origin & Deployment Architecture
- **Client Domain:** Hosted on Vercel (`https://<project>.vercel.app`).
- **Realtime Domain:** Hosted on Render (`https://<service>.onrender.com` / `wss://...`).
- **CORS & Origin Filtering:** `server/ws.ts` inspects the HTTP `Origin` header during the WebSocket upgrade request. It permits connection only if the origin is explicitly listed in `WS_ALLOWED_ORIGINS`.

### 2.7 System Topology Diagram

```
+-------------------------------------------------------------------------------+
|                                    BROWSER                                    |
|                                                                               |
|  - React 19 Frontend Components (/dashboard, /auth, /discover)                |
|  - AuthContext (Session state via HttpOnly 'gglog_session' cookie)            |
|  - notificationSocket.ts (WebSocket Client with exponential reconnect)        |
+-------------------+---------------------------------------+-------------------+
                    |                                       |
     HTTPS Requests |                       WSS Connections |
     + Cookie Auth  |                       + ?ticket=TOKEN |
                    v                                       v
+---------------------------------------+   +-----------------------------------+
|            VERCEL RUNTIME             |   |           RENDER HOST             |
|          (Next.js App Router)         |   |      (Standalone Node Process)    |
|                                       |   |                                   |
|  - Serverless API Routes (26 routes)  |   |  - server/ws.ts                   |
|  - Process-local Rate Limiter (Map)   |   |  - Health Endpoint (/health)      |
|  - POST /api/auth/ws-ticket           |   |  - Connection Manager             |
|  - Twitch Token Cache (In-Memory)     |   |  - Sequential DB Polling Loop     |
+---------+--------------------+--------+   +-----------------+-----------------+
          |                    |                              |
          | HTTP POST          | SQL Queries                  | SQL Poll Queries
          | (client_creds)     | (Pooled Connection)          | (Pooled Connection)
          v                    v                              v
+-------------------+   +-------------------------------------------------------+
|  TWITCH / IGDB    |   |                    NEON POSTGRESQL                    |
|                   |   |                                                       |
| - Twitch OAuth2   |   |  - User, Profile, Session                             |
|   (Token Service) |   |  - Game, Genre, Platform                              |
| - IGDB v4 API     |   |  - LogEntry, Review, ReviewLike, Comment              |
|   (Apicalypse)    |   |  - Follow (Social Graph)                              |
|                   |   |  - WsTicket (Short-lived, single-use auth tokens)     |
|                   |   |  - Notification (Indexed by userId & createdAt)       |
+-------------------+   +-------------------------------------------------------+
```

---

## 3. Deployment Topology

### 3.1 Vercel
- **Responsibilities:** Next.js static asset delivery, App Router SSR/client rendering, serverless API execution, user registration, user authentication, ticket generation, game search proxying, game logging transactions, and social graph endpoints.
- **Scaling Characteristics:** Ephemeral, stateless serverless lambda instances. Memory is not shared across parallel lambda invocations.

### 3.2 Render
- **Responsibilities:** Dedicated, long-running Node.js process hosting `server/ws.ts`. Manages active client WebSockets, executes the keepalive ping loop, validates incoming tickets, executes the sequential database notification poll loop, and fans out realtime notifications.
- **Scaling Characteristics:** Single persistent instance. Keeps active socket descriptors open in memory.

### 3.3 Neon PostgreSQL
- **Responsibilities:** Central persistent relational datastore for all application data, user accounts, sessions, social relations, cached IGDB entities, notification events, and ephemeral WebSocket tickets.
- **Scaling Characteristics:** Serverless PostgreSQL with autoscaling storage and compute. PgBouncer pooling endpoint handles connection spikes from serverless functions.

### 3.4 Twitch Developer Portal & IGDB
- **Responsibilities:** Authoritative external game metadata source.
- **Scaling Characteristics:** Governed by Twitch OAuth token rate limits and IGDB Apicalypse request quotas (standard tier: 4 requests per second).

---

## 4. Previously Identified Security Fixes

| # | Finding | Previous Risk | Current Implementation | Status | Repository Evidence |
|---|---|---|---|:---:|---|
| 1 | Static IGDB Bearer Token | Static token expired after ~60 days, breaking game search and logging globally. | Replaced with dynamic Twitch OAuth2 Client Credentials flow. | 🟢 Verified / Fixed | `lib/idgb/auth.ts:69-102` |
| 2 | IGDB Token Expiration | Expired tokens caused 401 request failures in production. | Tokens cached in-memory with a 5-minute pre-expiration buffer. | 🟢 Verified / Fixed | `lib/idgb/auth.ts:15,94` |
| 3 | IGDB Token Stampede | Concurrent queries during expiration triggered parallel Twitch token requests. | Implemented `inflightRequest` promise sharing across simultaneous callers. | 🟢 Verified / Fixed | `lib/idgb/auth.ts:43,121-136` |
| 4 | IGDB 401 Self-Recovery | Premature token invalidation left the application unable to recover automatically. | Central client intercepts 401s, invalidates cache, refreshes token, and retries once. | 🟢 Verified / Fixed | `lib/idgb/client.ts:41-65` |
| 5 | Authentication Rate Limiting | Vulnerable to automated credential stuffing and signup spam. | Process-local fixed-window rate limiting on `/signin` (10/15m) and `/signup` (5/1h). | 🟢 Verified / Fixed | `app/api/auth/signin/route.ts:13-15`, `app/api/auth/signup/route.ts:16-18` |
| 6 | Game Search Rate Limiting | Repeated debounced search typing threatened to exhaust IGDB API quotas. | Process-local rate limiting on `/api/games/search` (30/1m) with fail-open behavior. | 🟢 Verified / Fixed | `app/api/games/search/route.ts:19-26` |
| 7 | Render WebSocket Polling Load | WS server polled database every 2s unconditionally, generating millions of empty queries. | Poll loop skips execution when 0 users are connected (`connectedUserCount === 0`). | 🟢 Verified / Fixed | `server/ws.ts:534-539` |
| 8 | Notification Indexing | Polling query performed unindexed table scans on `Notification.createdAt`. | Compound index `[userId, createdAt]` and single index `[createdAt]` created. | 🟢 Verified / Fixed | `prisma/schema.prisma:365-367`, migration `20260904160000` |
| 9 | Overlapping Poll Queries | `setInterval` spawned concurrent database queries during network/Neon latency. | Replaced with sequential `async while` loop with strict `await` before sleeping. | 🟢 Verified / Fixed | `server/ws.ts:533-540` |
| 10 | Bounded Polling | High-volume notification spikes could exhaust Node process memory. | Added hard limit `take: 100` and ID watermark advancement to latest timestamp. | 🟢 Verified / Fixed | `server/ws.ts:487,516` |
| 11 | Cross-Origin WS Authentication | Cookie authentication failed across different Vercel and Render domains. | Short-lived single-use ticket handshake (`WsTicket`) implemented. | 🟢 Verified / Fixed | `app/api/auth/ws-ticket/route.ts:29-48`, `server/ws.ts:189-211` |

---

## 5. Authentication & Session Security

### 5.1 Verification Status

#### Verified Secure
- **Password Storage:** Verified in `app/api/auth/signup/route.ts:55`. Passwords are encrypted using `bcrypt.hash(password, 12)`.
- **Session Transport:** Verified in `lib/auth.ts:17-26`. The session cookie enforces `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production environments.
- **Session Invalidation:** Verified in `app/api/auth/logout/route.ts:10` and `lib/auth.ts:159-173`. Logout deletes the database session record and resets the browser cookie with `maxAge: 0`.
- **Input Validation:** Verified in `lib/validations/schemas.ts:16-48`. Usernames restricted to alphanumeric/underscore (3–30 chars), emails validated and converted to lowercase, passwords bounded (8–128 chars).
- **IDOR Prevention:** Verified across all mutation routes. The user ID is strictly derived from `requireAuth()` session context. Client requests cannot specify arbitrary user IDs.

#### Partial Implementations
- **Session Token Hashing:** In `lib/auth.ts:70-79`, session tokens are generated via `crypto.randomUUID()` and stored as **plain text** in `prisma.session.create({ data: { sessionToken } })`. Previous documentation claimed SHA-256 token hashing was implemented. The current code stores unhashed tokens. While random UUIDs provide 128-bit entropy (making guessing impossible), hashing tokens before database persistence is standard defense-in-depth practice.
- **Rate Limiting Scope:** Implemented via in-memory Maps in `lib/rate-limit.ts`. On Vercel, rate limit counters are local to each serverless container. While adequate for a 3–5 user beta, this does not provide globally distributed protection.

#### Remaining Concerns
- **Missing Password Reset Route:** In `app/auth/page.tsx:208-217`, the "Forgot Password" form executes an artificial delay (`setTimeout(1500)`) and renders a fake success message (`RECOVERY LINK TRANSMITTED_`). No backend endpoint, email provider, or token reset mechanism exists.
- **Unthrottled Ticket Issuance:** `POST /api/auth/ws-ticket` requires authentication but has no rate limiting. An authenticated user could spam this endpoint to bloat the `WsTicket` table.

---

## 6. IGDB Integration Audit

### 6.1 Implementation Details
- **OAuth Token Management (`lib/idgb/auth.ts`):** Client ID and Client Secret are retrieved from `process.env.TWITCH_CLIENT_ID` and `process.env.TWITCH_CLIENT_SECRET`. Tokens are requested via HTTPS POST to Twitch OAuth.
- **Safety Buffer:** The token expiration is set to 5 minutes (300,000 ms) prior to the official Twitch TTL to avoid edge-case mid-request expiration.
- **Concurrency Stampede Lock:** `inflightRequest: Promise<string> | null` ensures that simultaneous callers wait on a single network request.
- **401 Recovery (`lib/idgb/client.ts`):** If IGDB responds with HTTP 401, the client calls `invalidateCachedToken()`, acquires a fresh token from Twitch, and retries the request exactly once.
- **Data Caching (`lib/services/gameService.ts`):** `getOrCreateGame(igdbId)` queries Neon first. If missing, it fetches metadata from IGDB, persists the game record, and returns the cached entity.

### 6.2 Vulnerabilities & Defects Established
1. **Apicalypse Query Injection / Syntax Breakdown:**
   In `lib/idgb/games.ts:87`:
   ```ts
   search "${search}";
   ```
   The `search` string is interpolated directly into the query string without escaping double quotes. If a user inputs quotes (e.g., `Call of Duty: Modern "Warfare"`), IGDB responds with HTTP 400 Bad Request, causing an internal server error on the frontend.
2. **Exposed Test Endpoint:**
   `app/api/test-igdb/route.ts` is an unauthenticated test route that directly queries IGDB for `"elden ring"`. It was not removed after initial development and exposes external API quota to public invocation.

---

## 7. API Route Inventory

The repository contains **26 route files** defining **29 HTTP operations**:

| Route | Method | Purpose | Auth Required | Rate Limited | Database Ops | External Calls | Status |
|---|:---:|---|:---:|:---:|---|---|:---:|
| `/api/auth/signup` | POST | User registration & session creation | No | Yes (5/hr) | `User.findUnique`, `User.create`, `Session.create` | None | 🟢 Complete |
| `/api/auth/signin` | POST | User login & session creation | No | Yes (10/15m) | `User.findFirst`, `Session.create` | None | 🟢 Complete |
| `/api/auth/logout` | POST | Clear user session & cookie | No | No | `Session.deleteMany` | None | 🟢 Complete |
| `/api/auth/me` | GET | Current session user check | Yes | No | `Session.findUnique` | None | 🟢 Complete |
| `/api/auth/ws-ticket` | POST | Issue 60s single-use WS ticket | Yes | No | `WsTicket.create` | None | 🟠 Needs Rate Limit |
| `/api/games/search` | GET | Search IGDB for games | No | Yes (30/1m) | None | IGDB v4 | 🟠 Needs Query Escape |
| `/api/games/log` | POST | Log game play, rating, review | Yes | No | `Game.create`, `$transaction(LogEntry, Review, Activity)` | IGDB v4 (if uncached) | 🟠 Concurrency Risk |
| `/api/diary` | GET | Paginated diary log entries | Yes | No | `LogEntry.findMany`, `count` | None | 🟢 Complete |
| `/api/feed` | GET | Followed users activity feed | Yes | No | `Follow.findMany`, `Activity.findMany` | None | 🟠 Duplicate Route |
| `/api/activity/feed` | GET | Followed users activity feed | Yes | No | `Follow.findMany`, `Activity.findMany` | None | 🟠 Duplicate Route |
| `/api/reviews/discover` | GET | Public community review feed | Yes | No | `Review.findMany`, `ReviewLike.findMany` | None | 🟢 Complete |
| `/api/reviews/[reviewId]` | GET | Single review details & visibility | Optional | No | `Review.findUnique`, `ReviewLike.findUnique` | None | 🟢 Complete |
| `/api/reviews/[reviewId]/like` | POST | Like a review | Yes | No | `Review.findUnique`, `ReviewLike.create`, `Notification.create` | None | 🟢 Complete |
| `/api/reviews/[reviewId]/like` | DELETE | Unlike a review | Yes | No | `ReviewLike.deleteMany` | None | 🟢 Complete |
| `/api/reviews/[reviewId]/comments` | GET | Chronological review comments | Optional | No | `Review.findUnique`, `Comment.findMany` | None | 🟢 Complete |
| `/api/reviews/[reviewId]/comments` | POST | Create comment on review | Yes | No | `Review.findUnique`, `Comment.create`, `Notification.create` | None | 🟢 Complete |
| `/api/comments/[commentId]` | DELETE | Delete own comment | Yes | No | `Comment.findUnique`, `Comment.delete` | None | 🟢 Complete |
| `/api/users/[username]` | GET | Public profile & aggregate stats | Optional | No | `User.findUnique`, `Follow.findUnique` | None | 🟢 Complete |
| `/api/users/[username]/follow` | POST | Follow user (no self-follow) | Yes | No | `User.findUnique`, `$transaction(Follow, Activity)`, `Notification.create` | None | 🟢 Complete |
| `/api/users/[username]/follow` | DELETE | Unfollow user | Yes | No | `Follow.deleteMany` | None | 🟢 Complete |
| `/api/users/[username]/followers` | GET | Paginated followers list | Optional | No | `User.findUnique`, `Follow.findMany` | None | 🟢 Complete |
| `/api/users/[username]/following` | GET | Paginated following list | Optional | No | `User.findUnique`, `Follow.findMany` | None | 🟢 Complete |
| `/api/users/search` | GET | Search users by username/name | Yes | No | `User.findMany`, `Follow.findMany` | None | 🟢 Complete |
| `/api/notifications` | GET | Paginated notifications | Yes | No | `Notification.findMany` | None | 🟢 Complete |
| `/api/notifications/unread-count` | GET | Lightweight unread count | Yes | No | `Notification.count` | None | 🟢 Complete |
| `/api/notifications/read-all` | PATCH | Mark all notifications read | Yes | No | `Notification.updateMany` | None | 🟢 Complete |
| `/api/notifications/[id]/read` | PATCH | Mark single notification read | Yes | No | `Notification.updateMany` | None | 🟢 Complete |
| `/api/notifications/[id]` | DELETE | Dismiss notification | Yes | No | `Notification.deleteMany` | None | 🟢 Complete |
| `/api/test-igdb` | GET | Hardcoded debug query | No | No | None | IGDB v4 | 🔴 Remove (Debug) |

---

## 8. Database & Prisma Audit

### 8.1 Configuration & Client Architecture
- **Prisma Version:** `7.9.1` with engine type client library.
- **Neon Adapter:** Instantiated in `lib/db.ts:11-16` using `@prisma/adapter-neon` with `process.env.DATABASE_URL`.
- **Global Singleton:** Managed via `globalThis` in `lib/db.ts:18-22` to prevent connection leaks during Next.js hot module reloads in development.
- **Client Output:** Generated into `src/generated/prisma`.

### 8.2 Migration History Verification
The `prisma/migrations` directory contains four ordered migrations verified by `migration_lock.toml`:
1. `20260821190000_baseline`: Full schema initialization for Users, Profiles, Games, Genres, Platforms, LogEntries, Reviews, Lists, Watchlists, Follows, ReviewLikes, Comments, Activities, Accounts, and Sessions.
2. `20260821200056_add_notification_model`: Creation of the `Notification` table and foreign key relations.
3. `20260822000000_add_ws_ticket`: Creation of the `WsTicket` table for single-use token exchange.
4. `20260904160000_add_notification_created_at_index`: Creation of index `Notification_createdAt_idx` on `Notification(createdAt)`.

### 8.3 High-Traffic Index Analysis
- **`Notification` Model:**
  - `@@index([userId, createdAt])`: Optimizes user notification list queries.
  - `@@index([userId, read])`: Optimizes unread count badge queries.
  - `@@index([createdAt])`: **Critical for Render polling.** Enables index range scans for `createdAt > lastPollTime`.
- **`WsTicket` Model:**
  - `@@unique([token])`: Fast single-row lookups during handshake.
  - `@@index([expiresAt])`: Efficient batch deletion for the 5-minute cleanup job.
- **`Follow` Model:**
  - `@@id([followerId, followingId])`: Prevents duplicate follow relations at the database level.
  - `@@index([followerId])` and `@@index([followingId])`: Accelerates bidirectional social graph lookups.
- **`LogEntry` Model:**
  - `@@index([userId, playedAt])`: Fast user diary chronology.
  - `@@index([gameId, playedAt])`: Fast game-specific play logs.

### 8.4 Identified Concurrency Defect
In `lib/services/gameService.ts:37-82`:
`getOrCreateGame` executes `prisma.game.findUnique({ where: { igdbId } })`. If `null`, it fetches IGDB and runs `prisma.game.create(...)`. Because `igdbId` is marked `@unique`, two concurrent users logging an un-cached game simultaneously will trigger a Prisma `P2002` Unique Constraint Violation for the second user, failing their request with HTTP 400.

---

## 9. Render WebSocket Server Audit

### 9.1 Server Lifecycle & Configuration (`server/ws.ts`)
- **Port Resolution:** Lines 57–60 dynamically read `process.env.PORT ?? process.env.WS_PORT ?? '3001'`. Correctly handles Render's dynamic port assignment.
- **Network Binding:** Binds strictly to `0.0.0.0` (required for Render container routing).
- **Health Check Endpoint:** Lines 266–275 implement HTTP `GET /health` responding with HTTP 200 `{ status: 'ok', connectedUsers: N }`.
- **Allowed Origins:** Lines 83–97 parse `WS_ALLOWED_ORIGINS` (comma-delimited).
  - *Risk:* If `WS_ALLOWED_ORIGINS` is not defined in the Render dashboard, it defaults to `localhost:3000`, which immediately rejects all production connections from Vercel.

### 9.2 Handshake & Authentication
1. **Ticket Lookup:** Checks `?ticket=<token>` query parameter.
2. **Validation:** Executes `prisma.wsTicket.findUnique({ where: { token } })`. Checks `used === false` and `expiresAt > new Date()`.
3. **Single-Use Consumption:** Sets `used: true` immediately upon authentication.
4. **Fallback:** If ticket is omitted, attempts cookie-based authentication for local development.

### 9.3 Polling Loop & Neon Resource Protection
- **Sequential Execution:** Lines 533–540 implement an asynchronous sequential `while (!isShuttingDown)` loop with `await sleep(WS_POLL_INTERVAL_MS)`. Overlapping queries are impossible.
- **Connected-User Optimization:** Polling executes **only** when `connectionManager.connectedUserCount > 0`. When zero users are connected, the database is queried zero times.
- **Batching & Watermarks:** Limits queries to `take: 100` and advances `lastPollTime` to the timestamp of the newest retrieved record.
- **In-Memory Deduplication:** Tracks delivered notification IDs in a Set capped at 10,000 entries.

### 9.4 Graceful Shutdown & Cleanup
- Handles `SIGTERM` and `SIGINT` cleanly.
- Closes the HTTP server, clears keepalive intervals, closes all client sockets with code 1001 ("Server shutting down"), disconnects the Prisma Client, and exits with code 0.
- A background timer runs every 5 minutes deleting expired and used tickets from `WsTicket`.

---

## 10. Realtime Notification Architecture

```
User A (Actor)                 Vercel API                  Neon DB               Render WS               User B (Recipient)
      |                             |                         |                      |                        |
      | 1. Follow / Like / Comment  |                         |                      |                        |
      +---------------------------->|                         |                      |                        |
      |                             | 2. Persist Social Event |                      |                        |
      |                             |    + Notification       |                      |                        |
      |                             +------------------------>|                      |                        |
      |                             |                         |                      |                        |
      | 3. HTTP 200 OK              |                         |                      |                        |
      |<----------------------------+                         |                      |                        |
      |                                                       |                      |                        |
      |                                                       | 4. Sequential Poll   |                        |
      |                                                       |    (createdAt > mark)|                        |
      |                                                       |<---------------------+                        |
      |                                                       |                      |                        |
      |                                                       | 5. Return new rows   |                        |
      |                                                       +--------------------->|                        |
      |                                                       |                      |                        |
      |                                                       |                      | 6. Match recipient     |
      |                                                       |                      |    connected sockets   |
      |                                                       |                      |                        |
      |                                                       |                      | 7. WS JSON Frame       |
      |                                                       |                      +----------------------->|
      |                                                       |                      |                        |
      |                                                       |                      |                        | 8. Bell Badge++
      |                                                       |                      |                        |    Toast Display
```

### End-to-End Resilience
- **Multi-Tab Support:** `NotificationConnectionManager` stores sockets as `Map<string, Set<WebSocket>>()`. If a user opens 3 tabs, all 3 receive notifications simultaneously.
- **Reconnection Logic:** `lib/notifications/notificationSocket.ts:208-222` implements exponential backoff from 1s to 30s. Reconnections automatically request a fresh ticket before attempting a new handshake.
- **Database Source of Truth:** If a WebSocket message fails to send, the notification remains in the Neon database. When the user reloads or navigates, the state hydrates via `GET /api/notifications`.

---

## 11. WebSocket Ticket Handshake

```
Browser (Vercel Origin)                   Next.js API (Vercel)                    Neon DB                     WebSocket Server (Render)
         |                                         |                                 |                                    |
         | 1. POST /api/auth/ws-ticket             |                                 |                                    |
         |    (Cookie: gglog_session)              |                                 |                                    |
         +---------------------------------------->|                                 |                                    |
         |                                         | 2. Verify session cookie        |                                    |
         |                                         |    Generate random UUID token   |                                    |
         |                                         |                                 |                                    |
         |                                         | 3. INSERT INTO WsTicket         |                                    |
         |                                         |    (token, userId, 60s TTL)     |                                    |
         |                                         +-------------------------------->|                                    |
         |                                         |                                 |                                    |
         | 4. HTTP 200 { ticket: "uuid-token" }    |                                 |                                    |
         |<----------------------------------------+                                 |                                    |
         |                                                                           |                                    |
         | 5. wss://render-ws.onrender.com?ticket=uuid-token                         |                                    |
         |    (Origin: https://gglog.vercel.app)                                     |                                    |
         +--------------------------------------------------------------------------------------------------------------->|
         |                                                                           |                                    |
         |                                                                           |                                    | 6. Check Origin in
         |                                                                           |                                    |    WS_ALLOWED_ORIGINS
         |                                                                           |                                    |
         |                                                                           | 7. SELECT * FROM WsTicket          |
         |                                                                           |    WHERE token = ticket            |
         |                                                                           |<-----------------------------------+
         |                                                                           |                                    |
         |                                                                           | 8. Return record                   |
         |                                                                           +----------------------------------->|
         |                                                                           |                                    |
         |                                                                           |                                    | 9. Assert !used &&
         |                                                                           |                                    |    expiresAt > now
         |                                                                           |                                    |
         |                                                                           | 10. UPDATE WsTicket                |
         |                                                                           |     SET used = true                |
         |                                                                           |<-----------------------------------+
         |                                                                           |                                    |
         | 11. WS Upgrade 101 Switching Protocols                                   |                                    |
         |     { type: "connected", payload: { userId } }                            |                                    |
         |<---------------------------------------------------------------------------------------------------------------+
```

---

## 12. Environment Variables Audit

| Variable | Target Host | Required? | Exposed to Browser? | Purpose | Expected Production Value | Risk if Missing / Misconfigured |
|---|---|:---:|:---:|---|---|---|
| `DATABASE_URL` | Vercel & Render | **Yes** | No | Pooled connection string to Neon PostgreSQL | `postgresql://...@...-pooler.postgres.neon.tech/neondb?sslmode=require` | 🔴 **Critical:** Total backend & WS crash. Database operations fail. |
| `DIRECT_URL` | Vercel / CLI | **Yes** | No | Direct unpooled connection string for Prisma CLI migrations | `postgresql://...@...postgres.neon.tech/neondb?sslmode=require` | 🔴 **Critical:** Prisma CLI migrations cannot run. |
| `TWITCH_CLIENT_ID` | Vercel | **Yes** | No | Client ID registered in Twitch Developer Console | Alphanumeric Twitch Client ID string | 🔴 **Critical:** IGDB game search and logging fail completely. |
| `TWITCH_CLIENT_SECRET` | Vercel | **Yes** | No | Client Secret registered in Twitch Developer Console | Alphanumeric Twitch Secret string | 🔴 **Critical:** Twitch OAuth2 token exchange fails. |
| `NEXT_PUBLIC_WS_URL` | Vercel (Client) | **Yes** | **Yes** | Public WebSocket URL for browser client connections | `wss://<your-render-service>.onrender.com` | 🔴 **Critical:** Browser defaults to `ws://localhost:3001`; realtime notifications fail silently. |
| `WS_ALLOWED_ORIGINS` | Render | **Yes** | No | Comma-separated list of allowed browser origins | `https://<your-vercel-domain>.vercel.app` | 🔴 **Critical:** Render rejects all browser WebSocket connections with 403 Forbidden. |
| `PORT` | Render | Auto | No | Operating system port injected by Render container | Automatically supplied by Render | 🟡 Port binding failure if server tries to hardcode port. (Code correctly falls back to `PORT`). |
| `WS_PORT` | Render (Local) | No | No | Fallback local development port | `3001` | 🟢 None (defaults to 3001). |
| `WS_POLL_INTERVAL_MS`| Render | No | No | Interval between database notification poll cycles | `3000` | 🟢 None (defaults to 3000ms). |
| `NODE_ENV` | Vercel & Render | Auto | Both | Environment mode indicator | `production` | 🟠 If not `production`, session cookies omit the `Secure` flag. |

---

## 13. Vercel Production Readiness

### 13.1 Build Verification
- **TypeScript Static Analysis:** Executed `npx tsc --noEmit`. Exited with **Code 0** (zero compilation errors).
- **Next.js Production Build:** Executed `npm run build`. Next.js 16.3.0 compiled successfully with Turbopack in **24.4s**. All 25 routes generated cleanly.

### 13.2 Deployment Blockers (Identified)
1. **ESLint Failure:** Executed `npm run lint`. Exited with **Code 1** (769 errors, 4,871 warnings).
   - *Cause 1:* `eslint.config.mjs` does not exclude `src/generated/**`. ESLint attempts to lint the auto-generated Prisma Client files.
   - *Cause 2:* 39 JSX syntax errors exist in application components (unescaped `//` comments inside JSX text nodes in `components/sections/` and temporal dead-zone hook access in `components/ui/CountUpNumber.tsx`).
   - *Impact:* If Vercel has ESLint verification enabled during deployment (default behavior), the build will fail immediately.
2. **Missing `postinstall` Script:** `package.json` contains no `"postinstall": "prisma generate"`. While Prisma Client code is currently committed to Git, any deployment environment that deletes untracked generated files during install will fail to compile.

---

## 14. Render Production Readiness

### 14.1 Configuration Verification
- **Start Command:** `npm run ws` executes `tsx server/ws.ts`.
- **Runtime Dependency:** `tsx` is correctly listed under `"dependencies"` in `package.json:24`, ensuring it is installed in Render production environments.
- **Port Binding:** Dynamically resolves `process.env.PORT` before fallback.
- **Health Check:** `GET /health` responds with HTTP 200 and JSON status.

### 14.2 Free-Tier Sleep Consideration
Render free instances spin down after 15 minutes of inactivity. When a client reconnects, the HTTP/WS wake-up can take 30–50 seconds.
- *Mitigation in Code:* `lib/notifications/notificationSocket.ts` implements exponential backoff reconnection. If Render is waking up, the browser retries at 1s, 2s, 4s, 8s, 16s, and 30s until connection succeeds.

---

## 15. Frontend Functional Audit

| Domain | Backend Service | API Route | Frontend UI | Neon DB | Realtime | Production Status | Assessment |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Landing Page** | N/A | N/A | ✅ Complete | N/A | N/A | 🟢 Ready | Hero, CRT effects, features, animations function properly. |
| **Authentication** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | N/A | 🟢 Ready | Signup, signin, session persistence, and logout function properly. |
| **Password Reset** | ❌ Missing | ❌ Missing | 🔴 Fake | ❌ Missing | N/A | 🔴 Broken | Fake simulation only. Must be disabled or hidden for beta. |
| **Game Search** | ✅ Complete | ✅ Complete | ✅ Complete | N/A | N/A | 🟠 Warning | Works, but vulnerable to Apicalypse double-quote syntax error. |
| **Game Logging** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | N/A | 🟢 Ready | Star ratings, tags, status, replay toggle, and review creation work. |
| **Reviews Feed** | ✅ Complete | ✅ Complete | 🟡 Partial | ✅ Complete | N/A | 🟡 Partial | Feed displays reviews, but star ratings are omitted from the cards. |
| **Review Likes** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | 🟢 Ready | Optimistic like toggling, composite primary key, instant updates. |
| **Review Comments** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | 🟢 Ready | Threaded comments with instant submission and author deletion. |
| **Follow System** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | 🟢 Ready | Follow/unfollow, optimistic counts, follower list modals. |
| **User Search** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | N/A | 🟢 Ready | Case-insensitive search on username and display name. |
| **Discover Feed** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | N/A | 🟢 Ready | Switches between People, Community Reviews, and Following feed. |
| **User Profile** | ✅ Complete | ✅ Complete | 🟡 Partial | ✅ Complete | N/A | 🟡 Partial | Profile stats and follow work; archive section displays placeholder. |
| **User Dashboard** | 🟡 Partial | 🟡 Partial | 🔴 Mocked | ✅ Complete | N/A | 🔴 Not Ready | Displays fake statistics (`MOCK_PROFILE_STATS`) and placeholder tabs. |
| **Realtime Alerts** | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete | 🟢 Ready | Realtime toast and bell badge counter via Render WebSocket. |
| **Watchlist** | 🟡 Service | ❌ Missing | ❌ Missing | ✅ Complete | N/A | ⚫ Orphaned | Backend service exists; no API route or UI components exist. |
| **Curated Lists** | 🟡 Service | ❌ Missing | ❌ Missing | ✅ Complete | N/A | ⚫ Orphaned | Backend service exists; no API route or UI components exist. |

---

## 16. Mock Data & Incomplete UI Audit

| # | Issue | File Location | Impact | Severity | Beta Blocker? | Required Action |
|---|---|---|---|:---:|:---:|---|
| 1 | Hardcoded Profile Stats on Dashboard | `app/dashboard/page.tsx:26,69` | Dashboard header displays hardcoded fake statistics (`MOCK_PROFILE_STATS`) instead of real DB counts. | **P1** | **YES** | Replace with live fetch from `/api/users/:username`. |
| 2 | Hardcoded Side Panel on Dashboard | `app/dashboard/page.tsx:133-134` | Renders fake player stats (`MOCK_PLAYER_STATS`) and fake collections. | **P1** | **YES** | Connect to live user data or hide collections panel. |
| 3 | Placeholder Tabs on Dashboard | `app/dashboard/page.tsx:114-128` | Reviews, Lists, Watchlist, and Activity tabs show `"// MODULE PENDING DEPLOYMENT"`. | **P1** | **NO** | Keep Diary as default active tab; hide unfinished tabs for beta. |
| 4 | Dead Link on Review Cards | `components/discover/ReviewCard.tsx:177` | Clicking `[ READ ]` navigates to `/dashboard/diary` which produces an HTTP 404 error. | **P0** | **YES** | Update `href` to `/dashboard` or create diary page. |
| 5 | Missing Star Display on Review Cards | `components/discover/ReviewCard.tsx:28` | `StarDisplay` function is defined but never rendered in the JSX. | **P1** | **YES** | Add `<StarDisplay rating={...} />` into the review card header. |
| 6 | Placeholder Archive on User Profiles | `app/dashboard/profile/[username]/page.tsx:321-335` | Viewing another user's profile displays `"// MODULE PENDING DEPLOYMENT"` in the main body. | **P1** | **NO** | Render public diary entries or leave note for beta. |
| 7 | Dead Navbar Anchor Links | `components/profile/ProfileNavbar.tsx:18-19` | Links `GAMES -> #games` and `COMMUNITY -> #community` do not exist on dashboard pages. | **P1** | **NO** | Route to `/dashboard/discover` or remove dead anchors. |
| 8 | Simulated Password Reset | `app/auth/page.tsx:208-217` | Claims to send password reset links with a fake 1.5s delay. | **P1** | **YES** | Hide the "Forgot Password" link on the auth screen. |

---

## 17. Security Audit

### 17.1 Structured Findings Classification

#### 🔴 Critical Vulnerabilities
*None identified.* No remote code execution, SQL injection, open database instances, or exposed private credentials were found.

#### 🟠 High Severity Issues
1. **Unescaped IGDB Apicalypse Query Injection:**
   - *Location:* `lib/idgb/games.ts:87`.
   - *Description:* Directly interpolating user input into `search "${search}";` allows double-quote characters to corrupt the query string, causing IGDB to return 400 Bad Request and crashing the search route.
2. **Missing Build Gate on Vercel:**
   - *Location:* `package.json:5-13`.
   - *Description:* Lack of `"postinstall": "prisma generate"` leaves production deployments reliant on manually committed generated artifacts.

#### 🟡 Medium Severity Issues
1. **Plain-Text Session Tokens in Database:**
   - *Location:* `lib/auth.ts:70-79`.
   - *Description:* Session tokens are stored unhashed in Neon. If the database is compromised, active session tokens could be extracted.
2. **Unauthenticated Test Route:**
   - *Location:* `app/api/test-igdb/route.ts`.
   - *Description:* Allows anyone to trigger live IGDB API queries, draining external rate quotas.
3. **Unthrottled Ticket Creation:**
   - *Location:* `app/api/auth/ws-ticket/route.ts`.
   - *Description:* Authenticated users can request unlimited WebSocket tickets in an automated loop.
4. **Timing Enumeration on Signin:**
   - *Location:* `app/api/auth/signin/route.ts:46`.
   - *Description:* Non-existent users return immediately (1ms) while existing users undergo bcrypt comparison (250ms), allowing username enumeration.

#### 🔵 Low Severity Issues
1. **Process-Local Rate Limiting on Vercel:**
   - *Location:* `lib/rate-limit.ts`.
   - *Description:* Rate limit counters are in-memory Maps and do not synchronize across serverless instances. Acceptable for a 3–5 user beta.
2. **Untracked Scratch Scripts in Git:**
   - *Location:* `scratch_delete.ts` and `scratch/`.
   - *Description:* Maintenance scripts with raw database mutations are checked into the repository.

#### 🟢 Informational Findings
1. **Zero Raw SQL in Production:** All application queries use Prisma's parameterized engine.
2. **Zero `dangerouslySetInnerHTML`:** React child string escaping prevents client-side XSS.
3. **HttpOnly & SameSite Cookies:** Mitigates client script credential theft and cross-site request forgery.

---

## 18. Performance & Scalability Audit

### 18.1 Beta-Safe Architecture (3–5 Users)
- **Database Connection Pool:** Prisma utilizes `@prisma/adapter-neon` over pooled connections, preventing connection exhaustion.
- **WebSocket Polling:** The sequential polling loop halts execution when zero users are connected and batches queries to 100 records. With 3–5 users, total database poll operations will remain well within Neon free-tier CPU limits.
- **Batching ID Lookups:** Review like statuses and follow statuses are batched using `where: { id: { in: ids } }`, avoiding N+1 database queries.

### 18.2 Scalability Bottlenecks (Post-Beta)
- **In-Memory Feed Slicing Defect:**
  In `lib/services/feedService.ts:64-111`:
  The feed service fetches all followed user IDs into memory (`followedIds`), queries activities using `actorId: { in: followedIds }`, slices `limit + 1`, and **then** filters out private reviews in memory. If an active followed user creates multiple private reviews, the query can return empty result pages while claiming `hasMore: true`.
- **Process-Local Memory:** In-memory token caches and rate limit counters reset whenever serverless instances recycle.

---

## 19. Error Handling & Reliability

### 19.1 API Error Normalization
- All errors pass through `apiError()` in `lib/errors.ts`.
- Status codes conform to HTTP standards:
  - `400`: Zod validation failures, malformed JSON.
  - `401`: Missing or expired session tokens.
  - `403`: Insufficient ownership permissions.
  - `404`: Entity not found (or private visibility masking).
  - `409`: Unique constraints (username taken, self-follow).
  - `429`: Rate limit exceeded with `Retry-After` header.
  - `500`: Unhandled server/database exceptions.

### 19.2 WebSocket Error Resilience
- Database query failures in `server/ws.ts:520-524` are caught and logged; the polling loop continues rather than crashing the Node process.
- Broken client sockets are closed cleanly and removed from the active connection set.
- Browser clients catch socket closure and execute exponential backoff reconnection.

---

## 20. Testing & Verification

### 20.1 Verification Executed During Audit
- **TypeScript Static Verification:** `npx tsc --noEmit` executed: **Passed (0 errors)**.
- **Next.js Production Build:** `npm run build` executed: **Passed (0 errors)**.
- **Rate Limiter Unit Tests:** `npx tsx lib/__tests__/rate-limit.test.ts` executed: **Passed (32/32 tests passed)**.
- **Prisma Schema & Migrations:** Verified schema syntax and checked migration SQL files.
- **ESLint Analysis:** `npm run lint` executed: **Failed (Exit Code 1, 769 errors due to `src/generated` inclusion)**.

### 20.2 Test Framework Status
- **Automated Test Runners:** Neither Jest, Vitest, nor Playwright are installed in `package.json`.
- **Existing Test Files:** Only `lib/__tests__/rate-limit.test.ts` exists as a standalone runner script.
- **Automated Coverage:** 0% automated coverage across API routes, UI components, and WebSocket server. Verification currently relies on static analysis, type checking, and manual execution.

---

## 21. Current Implementation Matrix

| Feature | Backend | API | UI | Database | WebSocket | Production Status | Assessment |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **User Registration** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Bcrypt 12 rounds, Zod validation, rate limited. |
| **User Signin** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | HttpOnly session cookie, rate limited. |
| **User Signout** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Database session deletion and cookie expiration. |
| **Password Reset** | 🔴 | 🔴 | 🔴 | 🔴 | — | 🔴 Not Ready | Simulated delay with fake message. Needs removal. |
| **Game Search (IGDB)** | ✅ | ✅ | ✅ | N/A | — | 🟡 Warning | Functional; double quotes cause syntax error. |
| **Game Logging** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Transactional logging with rating, status, tags. |
| **Star Rating Selector** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Interactive 0.5-star precision up to 5.0 stars. |
| **Ratings on Review Cards**| ✅ | ✅ | 🔴 | ✅ | — | 🔴 Not Ready | `StarDisplay` omitted from JSX; reviews show no stars. |
| **Review Creation** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Created atomically during game logging. |
| **Review Updates & Deletes**| 🟡 | 🔴 | 🔴 | ✅ | — | 🔴 Not Ready | Backend functions exist; API routes and UI missing. |
| **Review Likes / Unlikes** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Ready | Idempotent composite PK with optimistic UI. |
| **Review Comments** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Ready | Threaded comments with author-only deletion. |
| **Follow / Unfollow** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Ready | Directed graph with self-follow prevention. |
| **Followers / Following** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Paginated modal lists with bidirectional status. |
| **User Search** | ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Case-insensitive search on username and display name. |
| **Community Discover Feed**| ✅ | ✅ | ✅ | ✅ | — | 🟢 Ready | Displays latest public reviews across all users. |
| **Social Activity Feed** | 🟡 | ✅ | ✅ | 🟡 | — | 🟡 Warning | Post-slice in-memory filtering flaw. |
| **User Profile Screen** | ✅ | ✅ | 🟡 | ✅ | — | 🟡 Partial | Header and stats live; archive displays placeholder. |
| **Profile Editing** | 🔴 | 🔴 | 🔴 | ✅ | — | 🔴 Not Ready | Schema exists; API endpoint and UI missing. |
| **User Dashboard** | 🟡 | 🟡 | 🧪 | ✅ | — | 🔴 Not Ready | Heavy mock statistics and placeholder tabs. |
| **Watchlist Subsystem** | 🟡 | 🔴 | 🔴 | ✅ | — | ⚫ Orphaned | Backend service unreferenced by routes or UI. |
| **Curated Lists Subsystem** | 🟡 | 🔴 | 🔴 | ✅ | — | ⚫ Orphaned | Backend service unreferenced by routes or UI. |
| **WS Ticket Handshake** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Ready | 60s single-use token authentication. |
| **Realtime Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 Ready | Sequential DB poll loop delivers to active sockets. |

---

## 22. Remaining Work

### P0 — Must Fix Before Beta (Blockers)

| Priority | Problem | Location | Why It Matters | Required Change | Verification |
|---|---|---|---|---|---|
| **P0** | ESLint failure breaks cloud build | `eslint.config.mjs` | Vercel deployments fail if linting produces errors. | Add `"src/generated/**"` to `globalIgnores`; fix JSX comment syntax in sections. | Run `npm run lint` and verify exit code 0. |
| **P0** | Missing Prisma client generation hook | `package.json` | Cloud deployment builds cannot resolve Prisma Client on clean install. | Add `"postinstall": "prisma generate"` to scripts in `package.json`. | Run `npm run build` in clean environment. |
| **P0** | 404 Navigation on Review Cards | `components/discover/ReviewCard.tsx:177` | Clicking `[ READ ]` routes to `/dashboard/diary` which does not exist. | Change link target to `/dashboard`. | Click `[ READ ]` in browser and confirm valid navigation. |
| **P0** | Missing Render Allowed Origin | Render Dashboard | Render rejects all Vercel WebSocket connections with 403 Forbidden. | Configure `WS_ALLOWED_ORIGINS=https://<vercel-domain>` in Render. | Connect to WS from browser and verify HTTP 101. |
| **P0** | Missing Vercel WebSocket URL | Vercel Dashboard | Browser tries to connect to `ws://localhost:3001` in production. | Configure `NEXT_PUBLIC_WS_URL=wss://<render-service>` in Vercel. | Inspect browser network tab and confirm connection. |

### P1 — Should Fix During Beta Preparation

| Priority | Problem | Location | Why It Matters | Required Change | Verification |
|---|---|---|---|---|---|
| **P1** | Hardcoded mock stats on Dashboard | `app/dashboard/page.tsx:26,69` | Users see fake stats rather than their actual games logged. | Hook `ProfileHeader` to live data from `/api/users/:username`. | Log a game and confirm count increments on dashboard. |
| **P1** | Star ratings missing on review feed | `components/discover/ReviewCard.tsx:28` | Reviews show text only; rating stars are invisible. | Render `<StarDisplay rating={review.rating} />` in JSX. | Confirm stars appear on Discover review feed. |
| **P1** | IGDB query syntax error on quotes | `lib/idgb/games.ts:87` | Searching games with double quotes causes a 500 error. | Strip or escape `"` characters in the search string. | Search for `Call of Duty "Modern"` and confirm results. |
| **P1** | Fake password reset simulation | `app/auth/page.tsx:208-217` | Misleads users into expecting an email that will never arrive. | Remove or disable the "Forgot Password" link for beta. | Confirm link is hidden on `/auth`. |
| **P1** | Public test endpoint exposed | `app/api/test-igdb/route.ts` | Allows unauthorized users to consume IGDB API quota. | Delete the file `app/api/test-igdb/route.ts`. | Request `/api/test-igdb` and verify 404. |
| **P1** | Dead navbar anchor links | `components/profile/ProfileNavbar.tsx:18` | Clicking `#games` or `#community` does nothing. | Route to `/dashboard/discover` or remove anchors. | Click navbar links and verify valid navigation. |
| **P1** | Untracked scratch files in Git | `scratch_delete.ts`, `scratch/` | Unsafe maintenance scripts committed to production repo. | Remove from Git tracking and add to `.gitignore`. | Run `git status` and verify repository is clean. |

### P2 — Post-Beta / Scale Improvements

| Priority | Problem | Location | Why It Matters | Required Change | Verification |
|---|---|---|---|---|---|
| **P2** | In-memory post-slice feed filtering | `lib/services/feedService.ts:104` | Can produce empty feed pages with `hasMore: true`. | Filter visibility directly in the SQL query. | Paginate feed with mixed visibility items. |
| **P2** | Unhashed session tokens in database | `lib/auth.ts:70-79` | Database leak exposes valid session tokens. | Hash tokens with SHA-256 before database insertion. | Verify tokens in DB are 64-char hex strings. |
| **P2** | Concurrency race on game creation | `lib/services/gameService.ts:54` | Parallel logging of new games can throw `P2002`. | Use `upsert` or catch `P2002` and retry `findUnique`. | Simulate parallel game logging calls. |
| **P2** | Orphaned Watchlist and Lists | `lib/services/` | Features exist in code but cannot be used by players. | Implement API routes and UI pages post-beta. | Complete functional verification. |
| **P2** | Process-local rate limiting | `lib/rate-limit.ts` | Serverless scaling bypasses local memory limits. | Migrate to `@upstash/ratelimit` with Redis. | Benchmark rate limits across multiple instances. |

---

## 23. Beta Launch Checklist

### Code
- [ ] TypeScript compilation verified (`npx tsc --noEmit` passes).
- [ ] Production build verified (`npm run build` passes).
- [ ] ESLint passes without errors (`npm run lint` passes).
- [ ] `postinstall: prisma generate` added to `package.json`.
- [ ] `app/api/test-igdb/route.ts` deleted.
- [ ] Dead link `/dashboard/diary` in `ReviewCard.tsx` updated.
- [ ] `MOCK_PROFILE_STATS` replaced with live API data on `/dashboard`.
- [ ] Scratch scripts removed from Git tracking.

### Vercel Deployment
- [ ] `DATABASE_URL` configured with Neon pooled connection string.
- [ ] `DIRECT_URL` configured with Neon unpooled connection string.
- [ ] `TWITCH_CLIENT_ID` configured.
- [ ] `TWITCH_CLIENT_SECRET` configured.
- [ ] `NEXT_PUBLIC_WS_URL` configured (`wss://<render-service>.onrender.com`).
- [ ] Production deployment build succeeds on Vercel dashboard.

### Render Deployment
- [ ] Standalone service created pointing to `server/ws.ts`.
- [ ] Build command configured: `npm install`.
- [ ] Start command configured: `npm run ws`.
- [ ] `DATABASE_URL` configured with Neon pooled connection string.
- [ ] `WS_ALLOWED_ORIGINS` configured (`https://<vercel-project>.vercel.app`).
- [ ] Service health check verifies HTTP 200 on `/health`.

### Neon Database
- [ ] Database reachable over TLS.
- [ ] All 4 migrations deployed (`prisma migrate deploy`).
- [ ] Notification indexes confirmed (`createdAt` and `[userId, createdAt]`).

### Realtime Verification
- [ ] Browser acquires ticket via `POST /api/auth/ws-ticket`.
- [ ] WebSocket handshake establishes with code 101.
- [ ] Notification delivered to recipient within 3 seconds of social action.
- [ ] Reconnection with exponential backoff verified when network drops.

---

## 24. Recommended Beta Testing Protocol

A structured test protocol for **3 to 5 users**:

### Phase 1 — Single User Smoke Test
1. Register User A (`testuser_a`). Confirm session cookie set and redirection to `/dashboard`.
2. Open search modal (`Ctrl+K`), search `"Elden Ring"`, and log play with 5 stars and review text.
3. Confirm game appears in user's Diary feed with correct date and status badge.
4. Log out. Confirm redirection to `/auth` and inability to access `/dashboard`.

### Phase 2 — Two Concurrent Users
1. User A logs in on Browser 1. User B logs in on Browser 2.
2. User B searches for User A in `/dashboard/discover` (People Tab).
3. User B clicks `+ FOLLOW`. Confirm optimistic UI changes to `✓ FOLLOWING`.
4. User A's browser must display a realtime notification toast within 3 seconds: *"testuser_b followed you"*. Notification bell badge increments to `1`.
5. User B navigates to Reviews tab, finds User A's review, clicks `♥` (Like), and posts a comment.
6. User A's browser must receive realtime like and comment notifications.

### Phase 3 — Edge Cases & Failure Recovery
1. **Network Disruption:** Disconnect network on User A's machine for 10 seconds, then reconnect. Confirm WebSocket automatically reconnects and fetches a new ticket.
2. **Multi-Tab Presence:** Open 2 tabs for User A. Trigger an action from User B. Confirm both of User A's tabs receive the notification badge.
3. **Session Expiration:** Manually delete session row in Neon. Confirm subsequent API calls return 401 and redirect cleanly to `/auth`.

---

## 25. Known Non-Blockers

The following items are explicitly **non-blocking** for the 3–5 user beta:
1. **In-Memory Rate Limiting:** Sufficient for a trusted closed beta group; distributed Redis is not needed.
2. **Social Feed Materialization:** In-memory query joins over followed users are completely safe at low volume (<1,000 total rows).
3. **Watchlist & Curated Lists Subsystems:** Orphaned services can remain inactive without impacting core diary, review, follow, or notification flows.
4. **Automated E2E Testing Suite:** Manual testing with 3–5 users is sufficient for beta verification.
5. **Session Token Hashing:** Plain-text UUID tokens in the database are acceptable for an initial closed test.

---

## 26. Post-Beta Roadmap

### Phase 1 — Stabilization & Hardening (Immediate Post-Beta)
- Migrate process-local rate limiting to `@upstash/ratelimit` with Redis.
- Implement SHA-256 hashing for stored session tokens.
- Add database `upsert` handling in `getOrCreateGame` to prevent unique constraint race conditions.
- Implement review editing (`PATCH`) and review deletion (`DELETE`).

### Phase 2 — Feature Parity & Orphan Activation
- Implement API routes and UI tabs for the Watchlist subsystem.
- Implement API routes and UI tabs for Curated Game Lists.
- Build profile customization UI (avatar upload, bio editing, display name).

### Phase 3 — Scale & Observability
- Move social activity feed filtering entirely into database queries.
- Add structured logging and APM monitoring (e.g., Sentry, OpenTelemetry).
- Introduce Vitest and Playwright test automation into the CI/CD pipeline.

---

## 27. Final Beta Readiness Assessment

## Current Status

**🟡 NEARLY READY — 3 BLOCKERS REMAIN**

### What is working
- Core game logging and diary persistence.
- IGDB v4 search with automatic Twitch OAuth2 caching and 401 recovery.
- Social interactions (directed follows, review likes, threaded comments).
- Realtime notification delivery via cross-origin WebSocket ticket handshakes.
- TypeScript compilation and Next.js Turbopack production build.

### What is fixed
- Static IGDB token vulnerability completely eliminated.
- Render sequential notification polling loop with zero-user idle bypass.
- `Notification(createdAt)` database indexing confirmed in schema and migrations.
- Bcrypt 12-round password hashing and secure HttpOnly cookie transport.

### What remains
- Fixing ESLint configuration to ignore `src/generated/**` and repairing JSX comment syntax.
- Adding `"postinstall": "prisma generate"` to `package.json`.
- Fixing dead link `/dashboard/diary` in `ReviewCard.tsx` and replacing dashboard mock statistics with live data.
- Aligning `NEXT_PUBLIC_WS_URL` on Vercel and `WS_ALLOWED_ORIGINS` on Render.

### What blocks beta
The 3 critical items in Section 22 (P0) must be resolved to ensure deployment builds succeed on Vercel and users do not encounter dead links.

### What can wait
Distributed Redis, feed SQL optimizations, password reset emails, watchlist/lists activation, and session token hashing can safely be deferred to post-beta phases.

---

## 28. Appendix — Important Files

### Authentication & Security
- `lib/auth.ts`: Core session creation, validation, cookie management, and user sanitization.
- `lib/auth-constants.ts`: Shared session cookie names and TTL constants.
- `lib/rate-limit.ts`: In-memory fixed-window rate limiter with IP extraction.
- `app/api/auth/signup/route.ts`: Registration endpoint with bcrypt hashing.
- `app/api/auth/signin/route.ts`: Login endpoint with credential verification.
- `app/api/auth/logout/route.ts`: Session cleanup endpoint.
- `app/api/auth/me/route.ts`: Session verification endpoint.
- `app/api/auth/ws-ticket/route.ts`: Short-lived single-use WebSocket ticket issuer.

### External IGDB & Twitch Integration
- `lib/idgb/auth.ts`: Twitch OAuth2 client credentials flow, token caching, and stampede lock.
- `lib/idgb/client.ts`: Central IGDB v4 Apicalypse client with 401 automatic retry.
- `lib/idgb/games.ts`: IGDB game search query builder and detail lookup.
- `lib/services/gameService.ts`: Local database game caching and relation persistence.

### Realtime & WebSocket Server
- `server/ws.ts`: Standalone Render WebSocket server, ticket verification, and sequential DB polling loop.
- `lib/wsEmitter.ts`: In-memory event emitter for local development.
- `lib/notifications/notificationSocket.ts`: Browser WebSocket client with exponential backoff.
- `components/providers/NotificationProvider.tsx`: React state context managing realtime notifications.
- `components/notifications/NotificationBell.tsx`: Interactive bell badge and notification tray.

### Database & Schema
- `prisma/schema.prisma`: Authoritative database datamodel and index definitions.
- `prisma.config.ts`: Prisma CLI configuration binding direct connection strings.
- `prisma/migrations/`: Ordered migration history tracking baseline, notifications, tickets, and indexes.

### Core API Handlers
- `app/api/games/search/route.ts`: IGDB search proxy with rate limiting.
- `app/api/games/log/route.ts`: Transactional game play logging and review creation.
- `app/api/diary/route.ts`: Authenticated user diary retrieval with offset pagination.
- `app/api/reviews/discover/route.ts`: Public community review feed.
- `app/api/reviews/[reviewId]/like/route.ts`: Review like/unlike endpoint.
- `app/api/reviews/[reviewId]/comments/route.ts`: Review comment listing and creation.
- `app/api/users/[username]/follow/route.ts`: Social follow/unfollow endpoint.
- `app/api/users/search/route.ts`: User directory search.
- `app/api/notifications/route.ts`: Paginated user notifications retrieval.

### Frontend Pages & Critical Components
- `app/page.tsx`: Retro-futuristic landing page.
- `app/auth/page.tsx`: Tabbed signup and login interface.
- `app/dashboard/page.tsx`: Authenticated player diary and dashboard.
- `app/dashboard/discover/page.tsx`: Community discovery hub (People, Reviews, Following).
- `app/dashboard/log/page.tsx`: Full game logging composer with 5-star rating selector.
- `app/dashboard/profile/[username]/page.tsx`: Public player profile screen.
- `components/discover/ReviewCard.tsx`: Community review presentation card.

---

**Audit Status:** COMPLETE  
**Document Type:** Beta Production Readiness Report  
**Scope:** GGLOG Application  
**Prepared From:** Verified repository inspection and implementation audit
