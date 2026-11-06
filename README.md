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

## Progression and checks

New guilds open with Story only, then unlock features through saved events. Members have capped learned skills and attribute specializations; the archive demonstrates notice → locate trigger → disarm with separate speed, success and resource-efficiency channels. Failed costs cause return. Temporary formulas and extension points are documented in [the foundation contract](docs/11-progression-and-check-foundations.md).

## Saves

Local autosave plus versioned JSON export/import and backup recovery. Save schema v5 migrates v0/v1/v2/v3/v4, preserving existing access, rosters and active task outings. Existing guilds can enable skill-based future archive expeditions from Story → Guild → Train for trap rooms. Browser play is paused on reload and hidden/closed tabs do not accrue progress. No database/account required; optional sync is future work.

## Design and validation

See [docs/README.md](docs/README.md), the phased [build plan](docs/07-build-plan.md), [test report](docs/08-test-report.md), [interface requirements](docs/10-game-interface.md) and [next phase](docs/09-next-phase.md). Current balance values are provisional. Traits, penalized failures, returned supplies and the skill tree are documented future mechanics.

Vercel target: Vite build command `npm run build`, output `dist`. Hosting is not configured in this repo.

Location-based expeditions use separate outbound travel, exploration, return travel and recovery. Local routes take 15 seconds each way. Resources includes delayed sales: stock is committed immediately and gold arrives after a 15-second trade. All timers use the game clock and survive save/import.

The accepted nine main stats and 27 attributes are centrally defined in `src/attributes.ts`, balanced across nine activity groupings. Luck is non-consumable. The guildmaster has a separate high-Soul stat profile and sole innate-magic eligibility; actual spell actions are future work. See docs/02-adventurers-and-stat-growth.md.
