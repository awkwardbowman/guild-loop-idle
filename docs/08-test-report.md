# Story-only Opening Validation

November 5, 2026. Current suite: **70 tests passed, 0 failed**. Production build passed.

Verified one-time founding and guaranteed first-friend recruitment, Story-only visibility and persistence, blocked clock/work before founding, no premature normal recruiting, and no queued dungeon before discovery. Existing guild and legacy save regressions pass.

Desktop browser: reset the disposable preview guild; reload showed Story as the only main tab, disabled time controls, an opening narrative and Load a save. Open the guild revealed Guild/Info and the welcome-friend goal; welcoming the friend revealed Members with a single member named Your friend. This is a temporary display name. Final opening copy, friend identity/stats and first job remain open.

## Earlier Story-tab validation

# Story Subtabs Validation

November 5, 2026. Current change: Story now separates Current Goals from Plot.

- Automated suite: **67 passed, 0 failed**, including six semantic story cases: fresh goals versus completed history, ongoing recruitment guidance, dungeon goal progression, chronological save-restored history, archive destinations without duplicate unlock entries, and migrated guilds.
- Production build passed.
- Desktop browser verified both subtabs, the available Survey the ridge goal, saved milestone times, chronological plot entries, unlock locations, and Go to Activities opening the dungeon catalog.
- Plot uses saved progression facts rather than the live log. No gameplay balance, save schema or migration changed. Main-game regression scenarios continue to pass.
- Mobile/touch remains unverified. This change is prepared on a review branch, not merged into production.

## Earlier foundation validation

# Foundation Test Report — 0.3

November 5, 2026. Current preparation results; earlier 0.2 results follow as historical evidence.

- `npm test`: **61 passed, 0 failed**.
- `npm run build`: TypeScript and Vite production build passed.
- New-player integration: opening unlock chain → first recruitment → trail → archive → three-check floors → later dungeon unlock; skill and specialization progression; saved retry cooldown resumes deterministically.
- Regression scenario: developed guild still completes 245 floor clears and 206 returns over 3,747 game seconds, with recruitment/upgrades and valid saves.

| Group | Verified behavior |
|---|---|
| Progression | Fresh save has Story/Guild/Info only, no starting members; hidden work does not execute; prerequisite and repeat-action guards; unlock facts saved with stable timestamps |
| Attributes | Direct/partial/no-specialty examples; fallback through multiple ancestors; no double-counting; root pool aggregation; cycles and invalid parents rejected |
| Skills | Distinct speed/success/efficiency; level 99 clamp; practice and last-use fields; decay disabled; specialization growth queued until return |
| Checks | Attempt and per-second charging; insufficient/zero/exact depletion returns; no unpaid work, free RNG, duplicate rewards or negative balances; weighted retry, cooldown, alternative, injury, gear-loss and return outcomes |
| Live route | All three archive checks needed before floor loot; check state integrated into active runs, training and return; unaffordable live check returns safely |
| Saves | v0/v1/v2 migration; retained old roster/seed/current run/loot; v3 state validation; exact cooldown and stochastic continuation; existing guild can enable future check outings without rewriting an active task run |
| Desktop browser | Fresh opening has only Story/Guild/Info; recruitment unlock, first member, Expeditions thread, trail discovery, Resources/Infrastructure unlock, archive discovery, queue assignment and skill rooms |
| Browser outcomes | At 00:36:44, 60 member returns; Observation 2, Investigation 3, Lock Picking 2; Finger Dexterity 18.5/77; visible retries and reassessment cooldowns followed by floor loot |
| Browser reload | Clock, roster/queue, 8-second remaining reset, skills and specialty values retained; no observed game-source console errors |

Actual mobile/touch and exhaustive keyboard acceptance are still open. Full plot, final attribute list, tuning, decay and resource conversion are not complete. Return ETA for stochastic checks is approximate and marked ~. Preparation is for review; no production rollout is claimed.

## Historical 0.2 report

# Redesign Test Report — 0.2

November 5, 2026. Current results supersede the historical fixed-day baseline below.

## Current checks

- `npm test`: **37 passed, 0 failed**.
- `npm run build`: TypeScript and Vite production build succeeded.
- Continuous main-game scenario: 3,747 game seconds, 245 floor clears, 206 member returns, four recruited members, guild upgrades and 2,280 gold. This is deterministic test evidence, not a balance recommendation.

| Functional group | Cases and observations | Result |
|---|---|---|
| Calendar | 24-hour day; month/year rollover; midnight preserves active outing; immutable deterministic stepping | Passed |
| Bottomless dungeons | Increasing floor costs/time/rewards; personal/global cap precedence; unlimited cap; cap edits at boundaries | Passed |
| Resolution | Carried loot banks once on return; exact-zero retreat; no incomplete-floor reward; training retained from earlier tasks; timer/success/lethal precedence | Passed |
| Scheduling | Roster order, gear skips/retries, independent resets, mid-day capacity reuse, queue cycling and active snapshot | Passed |
| Growth/progression | Affinity clamp and tier averages; recruitment, capacity, priorities and all infrastructure effects | Passed |
| Save v2 | Mid-outing deterministic roundtrip; carried loot, caps/cooldowns/pins validated; corrupt data rejected; backup recovery; v0/v1 conversion without duplicate rewards | Passed |
| Desktop browser | Game-first 2:8:2 layout visually inspected; Guild/Members/Activities/Resources/Info; internal duty placeholder; global cap 2 versus personal cap 3 returns at floor 2 | Passed |
| Status/pins/queues | Dungeon list sorted by return ETA; member selection; queue reorder/personal depth; collapse/re-expand active list; pin Heartwood and persist after reload | Passed |
| Main-game browser | Existing prototype save migrated; live play produced multiple returns, floor 2 completion, stat growth, individual resets and next-queue departures | Passed |
| Browser save files | Exported v2 active save, imported it, confirmed replacement, reloaded; same clock 00:02:06, active task, queue/caps and pins restored | Passed |
| Console | No observed game-source exceptions. Browser extension emitted unrelated metadata errors | Passed with external noise |

## Source delivery status

Implementation is tested in the workspace. Maya explicitly approved pushing the redesign to the public GitHub main branch on November 5, 2026. This report accompanies the redesign source commit. No production deployment has been completed.

## Limits and next checks

Actual mobile/touch-device and full keyboard-only acceptance remain open. Responsive CSS is implemented, not evidence of device validation. No Vercel deployment or production URL has been verified. The calendar epoch, floor scaling, 300s warp, 12s reset and economy remain provisional. Skill tree, traits, failure penalties and Gear/Supplies refunds are documented future scope.

## Historical 0.1 report

The following describes the previous implementation only. Its 60-second day, 35-second warp, daily routes and visual dashboard have been replaced.

### Baseline Test Report

November 5, 2026. First playable baseline, version 0.1.0.

## Validation method

Implemented simulation/progression, then wrote and ran their cases. Implemented persistence, then wrote and ran save cases. Built the interface, then exercised actual controls in the browser. Added boundary cases and a multi-day integration playthrough, fixed test setup problems, and reran the suite. Commands: `npm test`, `npm run build`.

## Automated cases

| IDs | Coverage | Result |
|---|---|---|
| F01 | Initial members and stat bounds | Pass |
| L01–L08 | Successful dungeon, one loot roll, no mid-run growth, zero-stat retreat, earlier training retained, timed warp, affinity limits, loot pool isolation, exact-time precedence | Pass |
| Q01–Q07 | Member order, slot and gear limits, affordable-member skipping, duplicate route entries, empty queue, planning lock, gear regeneration, daily refill/restart, route supply failure, invalid queue rejection | Pass |
| P01–P05 | Seeded recruitment, tier affinity averages over 2,000 recruits, candidate capacity, infrastructure work, upgrade spending/effects, immutable transitions | Pass |
| S01–S08 | Mid-run round trip, deterministic continuation, malformed/oversized/future-version rejection, invalid state rejection, backup recovery, blocked storage, legacy fixture migration, every-tick validation over ten days, corrupt-primary backup preservation | Pass |
| E01–E02 | Full 20-day progression and equivalence of bulk versus individual simulation steps | Pass |

31 automated tests pass. The production TypeScript check and Vite build pass. Node.js 24 is the supported test runtime. GitHub Actions is configured to run the same tests and build; remote CI status must be checked separately after source publication.

## Main-game integration result

A deterministic 20-day run completed with:

- Day 21 reached, 65 dungeons cleared, and one retreat.
- Four recruited guild members and an upgraded expedition desk.
- 526 gold retained after upgrade spending.
- Persistent stat growth and dungeon loot recorded.
- Mid-run export/import followed by exactly matching continuation.
- No negative pools, affinity overflow, gear underflow, or active runs left after the final day.

This checks functional progression, not long-term balance or enjoyment.

## Browser acceptance cases

Tested in the live local preview using Chrome at the available desktop viewport.

| ID | Steps and expected result | Observed |
|---|---|---|
| UI01 | Load fresh guild; inspect calendar, resources, roster, and stat layers | Three members and correct starting resources displayed |
| UI02 | Add a second dungeon, move entries, remove an entry, select a different dungeon, add it, reorder | Queue contents/count updated and differing dungeon entries changed order |
| UI03 | Select infrastructure, switch to 4×, begin day | Two members dispatched; planning controls disabled during run |
| UI04 | Let first day finish | Day 2 planning; 42 gold, three materials, stat growth, and repeat-route rewards visible |
| UI05 | Upgrade expedition desk and move Bram ahead of Mira; select recruitment; run day 2 | Three available expedition slots; gear shortage kept Mira home; Bram retreated with earlier training retained |
| UI06 | Accept new applicant and inspect ledger | Roster increased to four; five clears and one retreat; dungeon loot and growth reports displayed |
| UI07 | Export save, import that same file, review replacement, confirm | Imported day 3, four members, 34 gold; confirmation protected replacement |
| UI08 | Reload after import | Day 3, four members, upgraded desk, route contents, and grown stats retained |

Console inspection showed browser-extension metadata errors from a `chrome-extension://` source; no game-source exception was observed in the inspected logs.

## Fixes and verification limits

- Preview initially rejected its internal hostname. Added the exact preview hostname to Vite's development allowed-host list and restarted preview; the app then loaded successfully.
- Early isolated dungeon tests unintentionally dispatched an extra fixture member. Corrected those fixtures; pool/reward assertions then passed.
- The integration test initially expected a retreat without scheduling the difficult recruit before gear was consumed. Adjusted the scenario to exercise that behavior deliberately.
- Mobile CSS is implemented but an actual narrow-viewport/device browser run has not yet been performed. This is an outstanding release check, not a passed case.
- Production Vercel deployment has not been performed. Preview is not a production hosting URL.
- Cloud sync, offline catch-up, and advanced affinity assignment filters are intentionally outside this baseline.
- Save v0 migration is fixture-tested only; no historical released v0 save format exists.
