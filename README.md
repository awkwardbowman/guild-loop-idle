# Guild Loops Idle

Game-focused guild management incremental built in React, TypeScript and Vite. Continuous fictional time; distinctive members; bottomless dungeon outings with inherited shared dungeon limits; individual recovery; guild upgrades and player-owned saves.

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

Local autosave plus versioned JSON export/import and backup recovery. Save schema v9 migrates v0–v8, preserving existing access, rosters and active task outings. Existing guilds can enable skill-based future archive expeditions from Story → Guild → Train for trap rooms. Browser play is paused on reload and hidden/closed tabs do not accrue progress. No database/account required; optional sync is future work.

## Design and validation

See [docs/README.md](docs/README.md), the phased [build plan](docs/07-build-plan.md), [test report](docs/08-test-report.md), [interface requirements](docs/10-game-interface.md) and [next phase](docs/09-next-phase.md). Current balance values are provisional. Traits, penalized failures, returned supplies and the skill tree are documented future mechanics.

Vercel target: Vite build command `npm run build`, output `dist`. Hosting is not configured in this repo.

Location-based expeditions use separate outbound travel, exploration, return travel and recovery. Local routes take 15 seconds each way. Resources includes delayed sales: stock is committed immediately and gold arrives after a 15-second trade. All timers use the game clock and survive save/import.

The accepted nine main stats and 27 attributes are centrally defined in `src/attributes.ts`, balanced across nine activity groupings. Luck is non-consumable. The guildmaster has a separate high-Soul stat profile and sole innate-magic eligibility; actual spell actions are future work. See docs/02-adventurers-and-stat-growth.md.

The current opening introduces Arya and Clyde with fixed tier-1 profiles under a 10-point total. New adventures use weighted room categories/rooms, exponential difficulty and linear sized loot budgets. Chips replace Gold. First Leather Scraps introduce Gavin, Tanner and Barkeep; five held herbs unlock the Stillmere referral. Shared gear unlocks, individual loadouts, carrying limits and per-resource storage caps are playable. Overflow is discarded and logged. Guild now has Guild Master, Guild Hall and Storage subtabs.

PR #7's provisional formulas and migration rules are documented in [the v9 contract](docs/11-progression-and-check-foundations.md). Guild → Settings controls shared Dungeon Defaults; expanded dungeon settings can override or inherit both Depth Limit and Insufficient Skill Threshold. Personal assignment caps are retired. Ten successfully cleared rooms in one canonical floor award Constitution XP; partial floors do not. Attributes never drain in new room outings. Leather Crafting recipe execution remains deferred.
