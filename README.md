# Guild Loops Idle

Game-focused guild management incremental built in React, TypeScript and Vite. Continuous fictional time; distinctive members; bottomless dungeon outings with global/personal depth caps; individual recovery; guild upgrades and player-owned saves.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
```

The desktop interface uses 2:8:2 columns: collapsible live status, central functional tabs, and an event log. Guild, Members, Activities, Resources and Info contain the game controls. The in-game Help explains current working rules.

## Saves

Local autosave plus versioned JSON export/import and backup recovery. Save schema v2 migrates v0/v1 without replaying already banked loot. Browser play is paused on reload and hidden/closed tabs do not accrue progress. No database/account required; optional sync is future work.

## Design and validation

See [docs/README.md](docs/README.md), the phased [build plan](docs/07-build-plan.md), [test report](docs/08-test-report.md), [interface requirements](docs/10-game-interface.md) and [next phase](docs/09-next-phase.md). Current balance values are provisional. Traits, penalized failures, returned supplies and the skill tree are documented future mechanics.

Vercel target: Vite build command `npm run build`, output `dist`. Hosting is not configured in this repo.
