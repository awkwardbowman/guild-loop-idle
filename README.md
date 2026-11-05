# Guild Loops Idle

A local-first incremental guild game. Recruit distinctive adventurers, order their dungeon queues, and help them return stronger each day.

## Run locally

Requires Node.js 24 (the test suite uses native TypeScript stripping).

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

Production output is `dist/`. Deploy on Vercel using the Vite preset, build command `npm run build`, and output directory `dist`. No environment variables, database, or account system is required.

## Playable baseline

- Ordered daily member dispatch and simple dungeon queues with repeated entries.
- Three stat pools per member, individual affinities, persistent training on return.
- Three dungeons, task costs, timed recall, retreat, weighted loot, and gold.
- Shared gear capacity/regeneration and simultaneous expedition slots.
- Recruitment/infrastructure priorities, candidate recruitment, and guild upgrades.
- Local autosaves, recovery snapshot, versioned JSON export/import, and safe replacement confirmation.
- Pausing, 4× speed, optional automatic next day, and expedition reports.

The game pauses when hidden. No offline progress or cloud sync yet. Loot is collected in the storeroom; item spending/crafting is future work. Numeric balance and scheduling defaults are provisional; see the build plan.

## Source structure

| Path | Purpose |
|---|---|
| `src/content.ts` | Dungeon definitions and balance constants |
| `src/engine.ts` | Seeded simulation and state transitions |
| `src/persistence.ts` | Save validation, import/export, local backup |
| `src/main.tsx` | React interface and browser timing |
| `src/style.css` | Responsive guild dashboard |
| `tests/` | Engine, save, and full-game integration cases |
| `docs/` | Design, build plan, verification, next-phase backlog |

`npm test` uses no database or browser and is deterministic. Browser acceptance steps are recorded separately in `docs/08-test-report.md`. GitHub Actions validates tests and the production build on pushes and pull requests.

No license has been selected yet. Public repository visibility does not itself grant an open-source license.
