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

## Current redesign phases — November 5, 2026

| Phase | Build | Validation gate |
|---|---|---|
| R1 | Continuous calendar, bottomless floors, global/personal caps, carried loot, individual reset, cycling queues | Timer/rollover, scaling/cap precedence, depletion/boundary ordering, cooldown/retry and ETA tests |
| R2 | Save schema v2 with deterministic carried state and migration of v0/v1 | Mid-floor roundtrip, corrupt fields, recovery, safe old-run conversion without duplicate loot |
| R3 | Game-first 2:8:2 shell, collapsible status, required tabs/subtabs, pins, right event log | Desktop browser flow: tabs, caps, queues, live sorted status, banked loot, cooldown, pin persistence |
| R4 | Main-game session and final review | Whole-game simulation, browser console check, production build, recorded actual outcomes |

R1–R4 replace the 0.1 fixed-day dashboard behavior. Earlier phase entries describe the historical build workflow, not current mechanics.

## Current working defaults

Three stats: Might, Agility, Focus. Three starting members, five roster places, two concurrent expeditions. Epoch 01/01/0001 with 30-day months, 12-month years and 24-hour days; 1× realtime, 5×/20× test speeds. Hidden/closed game pauses; no offline catch-up.

Per-member outing: one dungeon queue entry, personal cap snapshotted, global cap live at floor boundaries, 300-second recall ward, 12-second reset, continuous dispatch retries in roster order. Stats refill on departure. Gear charged once per outing, regenerates continuously, no refunds yet. Queue cycles on return; active assignments survive future queue edits.

Floor scaling, carried loot, growth timing and result precedence are documented in 04-dungeons-and-expeditions.md; scheduling in 06; interface in 10. Recruitment, infrastructure and upgrades work while time runs. Save v2 includes personal cooldowns, carried rewards, global depth caps and pinned resources. Migrating old runs applies earned training and returns the member without regranting old banked rewards.

Traits, skill tree, failure loot penalties, stat-driven reset and returned supplies are future scope, not current implementation. All numerical balance values remain provisional.

## Completion discipline

Do not mark tests passed until run. Keep regression cases for discovered failures. Record commands and results in 08-test-report.md. Save working design additions in the existing Drive folder and include a source copy under docs/. Keep the code and test suite in GitHub. If hosting or browser verification is unavailable, report the specific limitation rather than claiming completion.

## Phase F — Progression and check-system preparation

| Group | Build | Gate |
|---|---|---|
| F1 | Durable event registry and derived visibility; opening Story threads and guarded unlock actions | Fresh save starts without a roster; hidden recruitment/dungeons do not execute; prerequisites and repeat clicks are safe |
| F2 | Member skill profiles, extensible attribute ancestry and root resource mapping | Deep fallback and no double-counting; no child resource bars; level 99 clamp |
| F3 | Independent speed/success/efficiency, work accumulation and configurable failure tables | Charge every required pool, return on insufficient cost, no free progress/RNG/reward; retry/cooldown/alternate/injury/loss outcomes |
| F4 | Archive sample room integration and save v3 | All three checks required for floor loot; pending specialization training applies on return; seed/cooldown restores exactly; old outings retain rules |
| F5 | Whole-game and desktop browser validation; record open design decisions | Automated opening-to-later-content scenario and browser playtest; no claim of final plot/balance or mobile coverage |

Temporary values and authoring contracts are in 11-progression-and-check-foundations.md. Prepare as a draft review branch before updating the live game.
