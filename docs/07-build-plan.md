# Build Plan and Validation Gates

November 5, 2026. Execution plan authorized by Maya: plan → implement functional group → write test cases → validate → fix → repeat → main-game playtest → next-phase review.

## Stack and ownership

React, TypeScript, and Vite. Entire simulation and saves run in the player's browser. Versioned JSON export/import and automatic local saving are baseline requirements. No account, database, analytics, or backend is needed. Optional cloud sync is future work. Source repository: awkwardbowman/guild-loop-idle (currently public). Vercel is the intended hosting target; deployment depends on access to that service. Do not substitute another permanent hosting service silently.

## Phases

| Phase | Build steps / goal | Tests written after functional group | Exit gate |
|---|---|---|---|
| 0 — Foundation | Scaffold app; separate deterministic simulation, content, persistence, and UI; capture prototype defaults | Type check, production build, initial-state invariants | App builds; defaults are documented |
| 1 — Individual loop | Stat pools, dungeon tasks, time limits, return reasons, training toward affinity, dungeon loot | Success, depletion, timed warp, boundary precedence, affinity bounds, loot pool validity, growth applied only on return | No negative pools or duplicate rewards; exact expected outcomes pass |
| 2 — Guild planning | Ordered member dispatch, per-member dungeon queues, gear costs/cap/regen, simultaneous expedition limit | Roster priority, gear shortage skips, capacity enforcement, ordered route, duplicate entries, empty routes, return and next-day restart | Assignment is deterministic and follows configured order |
| 3 — Progression | Recruitment/infrastructure priorities, distinctive candidates, accept/dismiss, guild upgrades | Reproducible generation, tier averages, costs, roster limits, work progress, upgrade effects | Recruitment → expedition → loot → guild upgrade cycle works |
| 4 — Player-owned saves | Versioned export/import, autosave, backup recovery, validation and safe import replacement | Exact mid-run round trip, deterministic continuation, malformed/unsupported saves, invalid references, migration, storage failure, corrupt primary recovery | Invalid import cannot replace a good save; mid-run state resumes without duplicate loot |
| 5 — Playable interface | Responsive guild dashboard, queue editors, adventurer stat views, dungeon reference, run reports, save controls, pause/speed | UI interactions and browser smoke at desktop and mobile widths; keyboard/control labels; no console exceptions | Main flows operate in browser; production build succeeds |
| 6 — Main game test | Run multiple complete days, recruit, edit routes, upgrade, save/load, continue | Scripted integration playthrough plus real browser playtest; record observed failures and fixes | Test report records actual outcomes, limitations, and repeatable commands |
| 7 — Next-phase review | Review pacing and planning decisions; propose next work from observed play | Compare against original requirements and playtest findings | Prioritized backlog with no invented feature approvals |

## Working defaults for this prototype

These resolve open questions for a testable baseline. They are implementation choices, not permanent design decisions.

- Three stats: Might, Agility, Focus. Each has current, max, and affinity.
- Start with three distinctive members, room for five recruits, and two simultaneous expeditions.
- A day lasts 60 simulated seconds. Manual Start day; optional automatic next day. Pause and 1×/4× speeds. No offline catch-up in baseline; closed/hidden play pauses.
- At day start, refill member pools and snapshot each route. Scan members in player order. Skip those without a route, enough gear, or a deployment slot. No dispatch retries during that day.
- Gear is consumable on dispatch and on entry to each later dungeon. It regenerates during the day up to its cap, including while members are active. No gear refund on return.
- Each member follows their dungeon queue in order within one expedition, carrying depleted pools forward. Successful dungeons grant one weighted random loot item and gold. Route completion, a depleted stat, unavailable gear for the next dungeon, or a 35-second expedition timer returns that member. Each new day restarts the route at entry one.
- Dungeon tasks have fixed durations, stat costs, and training rewards. Costs resolve on completion. A task that depletes a stat triggers retreat before rewards/training for that task. A fully resolved task at the warp boundary may complete before the timer returns the member.
- Training from completed surviving tasks persists even after later retreat/warp. Sum training per stat and apply growth at return using the run's starting maximum: training × max(0, 1 − max / affinity), capped at affinity. Growth never refills an active run.
- Three dungeons emphasize different stats; one is initially difficult. All numeric content is temporary balance data.
- Guild priority selects recruitment or infrastructure. Both accumulate work only during active days; recruitment generates one pending candidate, infrastructure produces upgrade materials. Upgrades spend gold/materials to improve expedition slots, roster capacity, gear capacity, or gear regeneration. Affinity upgrades remain future scope.
- Queue edits, recruiting, dismissals, and upgrades are planning-phase actions, so in-progress routes cannot change underneath the simulation.
- Save format v1 stores deterministic random state, active runs, task progress, inventory, recruitment, upgrades, and reports. Explicit import requires a review/replace step. Unsupported future versions fail clearly. A minimal legacy v0 migration is exercised by fixtures; no historical player saves exist yet.

## Completion discipline

Do not mark tests passed until run. Keep regression cases for discovered failures. Record commands and results in 08-test-report.md. Save working design additions in the existing Drive folder and include a source copy under docs/. Keep the code and test suite in GitHub. If hosting or browser verification is unavailable, report the specific limitation rather than claiming completion.
