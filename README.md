# ffxiv-todo-app

A Final Fantasy XIV character tracker — tracks jobs, achievements, and progression snapshots per character, with plans for a web UI and recommendation/todo features.

## Current Status

**Dormant — parked at data layer. Revival blocked by FF14 API degradation.**

| Component | Status |
|---|---|
| TypeScript backend (Prisma + SQLite) | ✅ Scaffolded |
| FF14 API client (rate-limited, retry logic) | ✅ Built |
| Database service + game data repository | ✅ Built |
| Test suite (API client, HTTP client, DB service) | ✅ Built |
| HTTP server / REST routes | ✗ Not built (`routes/character.js` is empty) |
| Frontend (`ffxiv-frontend/`) | ✗ Not built (empty) |
| Tests | ✅ Partial (data layer covered) |

**Known gaps:**
- No API available to reliably retrieve FF14 character data as of ~late 2025 (Lodestone scraping options have degraded; no official API)
- Schema has `maxLevel` defaulting to `90` — Dawntrail raised the cap to `100`
- Routes and controllers are empty stubs
- Frontend is entirely unbuilt

**Revival decision:** Park until a reliable FF14 character data API becomes available. The data layer (TypeScript, Prisma, tests) is solid and worth preserving.

## What It Does (planned)

- Ingest character data from the FF14 API (jobs, achievements, stats)
- Track progression snapshots over time per character
- Surface a "todo" list of content the character hasn't completed
- Web UI for browsing character state and progression history

## Tech Stack

- **Node.js + TypeScript**
- **Prisma ORM** — schema management, migrations
- **SQLite** — local database
- **Jest** — test runner
- **ts-node** — TypeScript execution

## Setup

```bash
npm install
npx prisma migrate dev
npm test
```

> Note: The application has no runnable HTTP server yet. `npm test` exercises the data layer.

## Schema Overview

Core models: `Character`, `Job`, `CharacterJob`, `Achievement`, `CharacterAchievement`, `CharacterSnapshot`, `GameDataVersion`, `UserPreference`

## Roadmap / Revival Checklist

For revival when a usable FF14 API becomes available:

1. Update `maxLevel` in schema from `90` → `100` (Dawntrail)
2. Audit API client against whichever API is now viable (XIVAPI, community tools, etc.)
3. Implement `routes/character.js` and the corresponding controller
4. Stand up Express (or similar) HTTP server
5. Build frontend (likely Vite + vanilla JS or React depending on scope)
6. Add `.env.example` with API base URL and credentials

## File Structure

```
ffxiv-backend/
  src/
    api/        # FF14 API client (rate limiting, retry logic)
    db/         # Prisma database service + game data repository
    routes/     # Express routes (character.js is an empty stub)
  prisma/       # Schema + migrations
  tests/        # Jest test suite (API client, HTTP client, DB)
ffxiv-frontend/ # Placeholder — not yet started
```
