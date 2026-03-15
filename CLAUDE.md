# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

ffxiv-todo-app is a Final Fantasy XIV character tracker. The goal: pull character data from the FF14 API, store it locally, surface a web UI showing jobs, achievements, and progression, and generate a "todo" list of content the character hasn't completed.

**Status: Parked.** The data layer is solid. The application is blocked at the API layer — see Critical Blocker below.

## ⚠️ Critical Blocker — Do Not Start HTTP/Frontend Work Without Reading This

**The FF14 character data API situation has degraded as of late 2025.**

The original API client was built against available community/unofficial APIs (XIVAPI and related tools). These options have become unreliable or have shut down. As of the last assessment (March 2026):

- No official Square Enix API exists for character data
- XIVAPI v2 has been in flux; check current status before relying on it
- Lodestone direct scraping is fragile and against ToS
- Community API wrappers that existed previously may no longer be maintained

**Before reviving this project:**
1. Research the current FF14 API landscape — is XIVAPI stable? Are there new community tools?
2. Confirm you can reliably retrieve: character name/server, job levels, achievement data, gear/stats
3. If no API is viable, the project stays parked
4. If a viable API is found, update the API client in `ffxiv-backend/src/api/` before doing anything else

## Architecture

```
ffxiv-backend/
  src/
    api/          # FF14 API client — rate limiting, retry logic, token helpers
    db/           # Prisma database service + game data repository
    routes/       # Express route stubs — character.js is EMPTY
  prisma/
    schema.prisma # Data model
    migrations/   # Applied migrations
  tests/          # Jest test suite covering API client, HTTP client, DB service
ffxiv-frontend/   # Entirely unbuilt — placeholder only
```

## Tech Stack

- **Node.js + TypeScript** — primary language
- **Prisma ORM** — schema and migrations
- **SQLite** — local database (`*.db` gitignored)
- **Jest** + `ts-node` — test runner
- **Express** — intended HTTP server (not yet started)

## Current State

**Built and working:**
- FF14 API client with rate limiting, retry logic, and token helpers
- HTTP client wrapper
- Prisma database service
- Game data repository
- Comprehensive test suite for the above

**Not built:**
- HTTP server (`routes/character.js` is an empty stub)
- Any controllers or middleware
- Frontend (entirely empty)

## Known Schema Issues

- `maxLevel` defaults to `90` — Dawntrail (patch 7.0) raised the level cap to `100`
- This will need updating before the app can correctly track high-level characters

## Known Gaps

- No `.env.example` — API base URL and any credentials should be documented
- Routes are empty stubs — no REST API exposed
- No frontend at all
- No CI/CD
- No coverage reporting (tests exist but no threshold enforcement)

## Next Actions (when reviving)

1. Research FF14 API landscape — confirm a viable character data source exists
2. Update schema: `maxLevel` 90 → 100
3. Audit existing API client against the chosen API
4. Implement `routes/character.js` + controllers
5. Stand up Express HTTP server
6. Build frontend (Vite + vanilla JS or React — decide based on scope at time of revival)
7. Add `.env.example`

## Out of Spec

- Frontend is entirely absent (standard: `src/` structure with tests colocated)
- No `.env.example` file
- `package.json` name field — verify it reflects "ffxiv-todo-app" not a scaffold default

## Development

```bash
cd ffxiv-backend
npm install
npx prisma migrate dev
npm test
```

The application has no runnable HTTP server. Tests exercise the data layer only.
