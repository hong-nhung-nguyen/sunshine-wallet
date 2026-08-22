# Contributing

## Local setup

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` if local settings are required.
4. Run `npm run dev` and open `http://localhost:3000`.

## Quality checks

- `npm run lint` checks source conventions.
- `npm run typecheck` checks strict TypeScript contracts.
- `npm test` runs deterministic unit tests once.
- `npm run check` runs the complete local quality gate.
- `npm run format` formats supported files.
- `npm run clean` removes generated build and test output only.

## Repository boundaries

- `app/` owns routes, layouts, server actions, and route handlers.
- `components/` owns reusable presentation components.
- `lib/engine/` owns deterministic business rules.
- `lib/types/` is the canonical domain contract shared by UI and server code.
- `lib/data/` owns seed data and fixtures.
- `services/` owns mock external adapters.

Keep calculations out of React components. Preserve the distinctions between kW and kWh, planned and actual response, baseline and observed demand, and contributor rewards and equity credits.
