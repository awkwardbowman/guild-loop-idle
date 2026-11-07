# Reusable challenge/class-ceiling verification — November 7, 2026

The deterministic challenge calculator now accepts named stat channels, fixed profile traits, explicit gear modifiers, weighted encounter categories, ordered checks and capacity/deadline rules. A bounded class search returns a strict below-target certificate, a legal counterexample, or an inconclusive probability interval. The current-member adapter compares every supplied legal loadout (maximum 256), and rejects binding cargo rather than ignoring it.

Executed: `node --test tests/challenge-probability.test.ts tests/member-probability.test.ts` passed **5/5**; `npm run test:full` passed **184/184**, zero failed or unselected; `npm run build` passed TypeScript/Vite; `git diff --check` passed. The example `node scripts/check-challenge.ts docs/examples/challenge-ceiling.json` returned `proven-below`, upper probability 0, in two profile evaluations. This budget-14 Diplomacy example is a test fixture, not a recruitment or live dungeon rule.

CP01–CP04 cover certificates, attainable witnesses, bounded inconclusive results, allocation tradeoff branching checked against exhaustive legal allocations, weighted failures, optional skips, gear, ordered checks and deadlines. MP01 reproduces existing floor-10 Arya odds and checks every supplied current gear combination, immutability and invalid-loadout/cargo guards. Browser UI and engine training behavior were not changed; the previously executed browser results below remain historical evidence for those flows. Common T1’s total affinity ceiling of 10 is confirmed; live training/cap allocation changes await clarification, so this does not yet certify a final affinity-capped Arya balance.

---

# Probability-based first-ten balance check — November 6, 2026

Maya requested a simpler, defined probability procedure instead of large simulations. The procedure is now the leading section of [04](04-dungeons-and-expeditions.md#floor-clear-probability-procedure), implemented in `src/floor-probability.ts` and reproduced by `node scripts/balance-floors.ts`. The large multi-seed balance matrix has been removed from the script.

The calculation uses actual room/category weights, tick-rounded weighted check times, ten independent counted slots with optional non-consecutive treasure, a separate mandatory boss, and the inclusive endurance budget. It sums successful probability mass rather than comparing average duration with capacity. The declared beginner profile has earned prior-floor Constitution bonuses but no ordinary practice. Cargo, ward and low-skill limits are checked for non-binding behavior; unsupported mechanics require extending the model.

Result: no-equipment odds remain near 100% early, then 95.59% / 87.60% / 71.67% on floors 8 / 9 / 10. Rough Leather Armor raises those to 99.69% / 98.71% / 95.59%. The first-ten curve is retained: no potion or Stillmere upgrade is required for this calculation. Stillmere is explicitly deferred.

FP01 independently validates a hand-counted example: six of sixteen paths fit the budget, even though average time alone would reject the floor. FP02 covers exact final-tick funding, invalid distributions and probability conservation. FD18 now protects the analytic first-ten balance gate instead of running seed-based campaign simulations. Existing short engine tests continue to cover real boss/recall/reward/save behavior.

Earlier simulation results below are retained as historical checks, not routine balance requirements. Executed verification for this probability change: `npm run test:full` passed **179 tests, 0 failed, 0 not selected**; `npm run build` passed TypeScript and Vite; `git diff --check` passed. The mathematical worksheet reproduced the percentages above without any simulation run. Browser behavior is unchanged by this calculation-only addition; the existing browser suite remains a separate CI gate.

---

# Combined floor/UI branch verification — November 6, 2026 · save v10

**Review implementation, not merged/deployed production.** Latest executed local gates:

| Command / scope | Passed | Failed | Not selected |
| --- | ---: | ---: | ---: |
| `npm run test:full` | 177 | 0 | 0 |
| `npm run build` | TypeScript + Vite passed | 0 | — |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser` | 13 | 0 | 0 |
| `node scripts/balance-floors.ts` | 30/30 starter-Arya seeds clear floor 10; 0/30 current-best-kit probes clear floor 11 | No acceptance failures | Later chapter/economy balance |

An earlier targeted dungeon/save iteration passed 118 selected tests with 58 not selected; the later full run above covers all 177 current registered engine tests. No skipped tests are reported as passed. FD01–FD23 cover floor catalogs, random repeats, mandatory boss placement, independent treasure, successful-only discovery, category isolation, individual/boss Skill reveals, recall/limits/XP, final checkpoint, save roundtrips/corruption/migration, inert Soul, first-ten balance, repeat farming and the obsolete Quarry route.

Browser acceptance exercises fresh founding, real timed engine progress into persistent discovery, exact outing/RNG state after reload, keyboard tab navigation, numeric drafts/no invalid writes, modal focus loop/Escape/cancel/reset, city reset-to-Shop behavior, teaching eligibility, actual purchase/capacity feedback and timed sale payout. Five width cases run at 320/375/768/1024/1440px, with screenshots and axe WCAG A/AA checks across Story/Guild/Members/Activities/Shops/Info/Settings, including the Skill matrix and expanded dungeon/category controls. A separate 200% CSS zoom reflow case passed. No JavaScript page errors were captured in the successful browser suite. Axe reported no selected-rule violations in those tested page states; this is not a universal WCAG certification.

Browser testing found and fixed a modal keyboard loop, tablet character tabs positioned outside their pane, invalid unlabeled-group ARIA and insufficient contrast on several text/glyph labels. Functional regressions also caught early-material farming becoming inaccessible when only the latest checkpoint was allowed; the shared Starting floor override and farming playthrough now cover that path. Historical v9 room-counter test fixtures explicitly retain historical outing rules; they are not used as evidence for new boss/floor behavior. Final review also corrected friendly discovered-find labels and stopped completed/limit-blocked assignments from appearing in the ready queue. The old Quarry-unlock assertion was replaced with the deliberate future-Soul-site boundary, while historical save/read coverage remains.

Only floors **1–10** are currently balanced. The 30-seed starter probe uses normal earned practice without equipment or potions, reaching ten boss checkpoints in 460–600 simulated seconds (mean 496). The floor-11 probe uses fully capped Arya roots/Skills, ten floor XP and reinforced armor, and clears zero bosses. The large floor-11 work step is temporary pending Stillmere consumable/support design. These numbers do not establish human pacing, indefinite-grind balance, potion effects or floor-11–100 economic balance.

Artifacts: `test-results/` contains the generated page/width screenshots, JSON report and failure-only traces. Browser CI uploads this directory as `browser-evidence`; local files are not user saves. The reproducible balance script never reads or edits a player's data. GitHub validation/build and browser CI passed on the published review branch, and Vercel automatically created its protected preview. Production was not promoted. Preview metadata/access checks and independent screen-reader/hardware testing are separate from the local/CI browser suite.

---

# PR #7 / save v9 validation — November 6, 2026

Executed in the managed workspace against the complete review tree:

- `npm ci --cache /workspace/work/npm-cache`: installed the locked dependencies successfully. The first default-cache attempt could not create the environment’s home cache; using a writable workspace cache resolved it without changing the lockfile.
- `npm test`: **147 tests passed**, zero failures. Eighteen new specialization/endurance cases cover role picks, all 25 grid positions/totals, exact 75%/90% bands, 0.01 fallback without renormalization, gear order/stacking and eligibility, root-stat non-consumption, per-floor endurance rates, authored failure and healing, ten-success floor XP, no partial/skipped-floor XP, queued recall, exact/adjacent grace deadlines, live inherited settings, explicit Unlimited/Off, room-boundary caps, v8 migration, malformed imports, ETA immutability, faster work paying fewer endurance seconds, and exact final-tick funding.
- Existing regression fixtures now use dungeon-wide caps for bounded trips, reconstruct retired fields when testing historical migrations, and assert queued recall/separate endurance rather than superseded instantaneous recall/weighted pool costs. Old task/check routes, opening through the craft lesson and Stillmere referral, resources, shops, trades, capacity, history and persistence still pass.
- `npm run build`: TypeScript and Vite production build passed (62 modules).
- `git diff --check`: passed.

## Browser → simulation → autosave → reload

Ran Playwright with the installed headless Chromium against local Vite at 1440×1000 and 390×844. Verified the real three-step fresh opening; Guild Settings changing global room limit to 20 and threshold to 3%; dungeon inherited summary; explicit Unlimited and 0% Off; both overrides surviving reload; five grid rows, 25 Skill positions, five row totals, five column totals and grand total; keyboard focus and click/tap descriptions with hidden Potential; removal of personal cap controls; separate endurance, low-skill grace and queued recall displays; disabled repeated Recall; and both saved timer origins surviving reload. Mobile document width was 390px at a 390px viewport, with the grid scrolling inside its own container. No JavaScript page errors occurred.

The existing external Google Fonts request reported `ERR_CERT_AUTHORITY_INVALID` in headless Chromium and the existing missing favicon reported 404. These were resource diagnostics, not simulation/rendering errors; browser assertions used the working fallback font. No TLS validation was bypassed. No API/database layer exists: gameplay and saves remain browser-local.

## Limits

The mechanics and chosen numeric defaults remain provisional; this is deterministic regression and browser acceptance, not final balance approval. Recipe execution, death/revival, Potential reveal, actual Speed tick intervals, offline progress and sync remain future work. Legacy task/check outings intentionally keep historical work/pool rules. This pass does not deploy or merge the game.

---

## Earlier validation reports

# Backlog validation — November 6, 2026

134 automated tests pass; TypeScript and Vite production build pass; git diff --check passes. New cases cover one-destination replacement/rejection, actual roster waiting order, queued counts, independent member/dungeon history and return reason, save v7→v8 route migration with preserved active state/stats/RNG, malformed rarity/history/route rejection, tiers above the former ceiling, Common T1 equipment access, material metadata and newest-first deterministic Plot ordering. Superseded multi-queue/old Plot assertions were replaced with current behavior checks.

Browser verification of this pass is blocked: the cloud browser cannot connect to the local preview (ERR_CONNECTION_REFUSED), and the local Playwright browser executable is unavailable. Visual/mobile acceptance is not claimed. Prior pass visual results below are historical evidence only. No production deployment is claimed by these checks.

# Weighted engine, requests, shops and storage validation

November 5, 2026. **128 tests pass, 0 fail**; TypeScript/Vite production build and diff checks pass. New numeric cases reproduce the agreed 300-work examples at 100/200 Power; verify weighted parent aggregation, deterministic work/no success RNG, atomic shortages, exact final-tick funding, no generic Constitution drain, injury vs safe return, walk-before-heal timing, reduced loot, guaranteed boss scrap, skill-only herb eligibility, fixed consumed requests/selected learner, tier-based equipment, bulk/Max storage pricing, uncapped Chips, v6 save migration and bounded ETA forecasting without mutating live state. Old pacing/retry/shop-slot assumptions were replaced rather than retained as current assertions; unrelated legacy route regressions remain.

Seeded new opening (73129) reached the leather lesson at approximately 25 game minutes and Elder Ash referral at approximately 47 game minutes. These are provisional seeded observations, not final balance targets.

Desktop browser verified removed Resources main tab, fixed attention positions, no navigation indicators, Emberveil/Gavin Shop/Requests tabs, fixed-width tier tags, owned/required cost text and teaching gate. Selecting Clyde consumed 12 scraps, marked the shared request Completed and logged the guild gear unlock. Guild Storage shows owned/max, infinite Chips, red full old Hides/Ore stock, bulk quantity dropdown including Max, pinned Scraps with max in the sidebar, and timed Trade controls. Current dungeon estimate reflects the weighted short outing. Automated playthrough validates consumed 5-Herb referral and equipment purchase. Mobile viewport acceptance and actual crafting recipe are not claimed.

# Discovered-skills browser validation

November 5, 2026. **118 tests passed, 0 failed** and TypeScript/Vite production build passes. New coverage verifies empty starting skill lists (including seeded friends), failed checks staying undiscovered, successful-use discovery and save roundtrip, malformed flag rejection, participating-attribute matching, combined text/checklist filtering, name/level sorting, mastered discovery and old-profile fallback. Existing gameplay/drop/save regressions pass.

Desktop browser verified Guild Master’s empty Skills list beside the 27-entry checklist; member rows show only name, combination symbols and level, with no Practice column. Selecting Power leaves Combat; combining that filter with lock search gives the no-match state. Clearing filters and choosing Level descending orders Combat, Athletics, Lock Picking and Scavenging by actual level in the existing test save. Mobile viewport acceptance remains unverified.

# Calendar, attribute matrix, rarity and dungeon-event validation

November 5, 2026. **115 tests pass, 0 fail**; TypeScript/Vite build passes. Added checks for queue delta events without reorder/cap-edit spam, allowed-only Dungeon logs, boss/treasure actual drops, one failure per exhausted outing, no manual-recall failure, old verbose-history hiding, saved structured drops/room state, malformed drop/rarity rejection, complete activity/stat visual mappings and the exact nine-color rarity palette. Existing deterministic production/drop simulations pass with resource depth bias separated from display rarity. The legacy archive test now asserts absence of Skill check chatter.

Desktop browser verified: compact location/guild/day/date/timer; positive recruit and idle attention indicators in the sidebar and Members navigation; failed log uses the same healing symbol; Guild Master has no Story tab; all 27 attributes appear in one table and sorting switches between attribute and skill; potential is ???; unrecruited candidate has ??? across all nine root values; Common loot displays in light gray; boss/treasure logs include drops; old verbose dungeon logs stay hidden. Mobile viewport acceptance is unverified.

# Dungeon capacity and automatic-time validation

November 5, 2026. **111 tests passed, 0 failed**; TypeScript/Vite production build passes. New regressions verify outbound reservations, no over-cap exploration across 800 simulated seconds, both friends receiving turns, slot release at homeward departure, authored capacity >1 alongside guild limits, automatic startup of planning saves, deterministic save reload and accurate activity partitions. Story/event tests now use single-occupant timing and updated character-tab destinations.

Desktop browser verified: one Ritual Catacombs sidebar card with three symbols and 1/1 slot · ~4m; live expedition/idle counts and zero trading/crafting member counts; clock advances with no Pause/Resume/speed controls; Plot rows show compact top-right destination buttons without location boilerplate; Current Goals has a top-right shortcut. Mobile viewport acceptance and closed-page offline simulation are not claimed.

# Character header/tab refinement

November 5, 2026. Production build and **106 tests pass**. Desktop browser verified Guild Master header shows nine maximum values and no innate-magic badge; Story, Attributes, Skills and Lore are separate tabs. Attributes/Skills tab selection works; Members shows nine maximums, visible Tier tag, and Story/Attributes/Skills/Assignments/Equipment/Lore with Assignments selected initially. Lore remains last. Same save and gameplay rules. Mobile viewport acceptance remains unverified.

# Compact interface validation

November 5, 2026. **106 tests passed, 0 failed**; production TypeScript/Vite build passes. Manual calculation checks confirm that each live dungeon emphasis sums to 100% and all nine symbols/colors are unique. Ritual Catacombs’ leading roots are Dexterity, Perception and Speed.

Desktop browser verified: Story actions remain usable while lore is collapsed; founding opens the correct tabs; the dungeon starts collapsed with only title, three symbols, possible finds, room limit and queue button; queueing works while closed and open; expanded cards show lore, Travel Time: 15s, full root emphasis and collapsed skill opportunities with level eligibility. Members show collapsed icon/value stat summaries, loadouts, learned skills and specialized attributes; Info has the nine-symbol legend and mechanics sections. No group/room weights, floor equivalence or outbound/home countdown is presented on routine activity pages. Actual mobile viewport acceptance remains unverified. Simulation/save schema unchanged.

# Emberveil opening validation — v6

November 5, 2026. **106 tests passed, 0 failed**. Production TypeScript/Vite build and diff checks pass. Older counts below are historical.

Verified: fixed <=10-point starting profiles and 10^tier potential budgets; story-first introduction and two recruits; zero-gear dispatch/no starting regen; separate group/room weights and trap multipliers; size-budget loot with dynamic eligibility and Chips fallback; rarity scaling; Harvesting exclusion for Arya and success-only XP for Clyde; optional skips/mandatory retries; cargo limits, per-resource caps and discarded overflow; Gavin/Stillmere gates; non-consuming five-herb referral; guild-wide unlocks/individual loadouts/absolute shop slot ceilings; storage purchases; mid-room deterministic saves; malformed state rejection; and migration from a real released v5 fixture retaining Gold-as-Chips, active trips and sale quotes.

100 seeded max-affinity trials: Arya reached room 20, Clyde room 10, and Clyde with Reinforced Leather Armor room 12. No character-specific hard depth limit is used. Starting maxima are 90% of affinity.

The seeded full opening reached Stillmere after 3,370 game seconds with five herbs held, Gavin unlocked, and Clyde equipped with Rough Leather Armor. Arya remained unable to harvest herbs. Old-route engine/save regressions pass.

Browser visual acceptance is pending the review preview. Actual death/revival, compression, worker assignments/auto-selling, advanced crafting and higher currency denominations are not claimed as implemented.

# Dungeon attribute-profile validation

November 5, 2026. **94 tests passed, 0 failed**; TypeScript/Vite production build passed. Every dungeon has a distinct planning-check sequence, normalized attribute/importance weights, and a member-comparison score. New cases verify exact profile coverage, archive dependencies, weighted fit without mutation, and invalid-profile rejection. Planning profiles are advisory; bespoke live check content for the starter/delve remains future work.

# Nine-stat / 27-attribute validation

November 5, 2026. **90 tests passed, 0 failed**; TypeScript/Vite production build passed. Current results supersede historical counts below.

New regression cases assert the exact approved 27 matches, three per root/activity, correct underlying pools, independent member/guildmaster profiles, exclusive innate-magic eligibility, high guildmaster Soul, modifier-only Luck, no zero-Luck retreat, contributing-attribute training only on success, exact schema-v5 save roundtrip, real v4 Might/Agility/Focus and Finger Dexterity migration, pending trip/trade preservation, exhausted returning members, and malformed-profile rejection. Existing checks, progression, travel/trade and continuous-play regressions also pass.

Visual acceptance remains outstanding because the remote browser could not reach the workspace preview. Spell actions, imbuement production and death/revival behavior are not covered as implemented features.

# Location, travel and trade validation

November 5, 2026. **82 tests passed, 0 failed**; TypeScript/Vite production build passed. This supersedes the current counts below, which are retained as historical evidence.

Added coverage for exact 15-second outbound and return boundaries; no dungeon work during travel; delayed loot/growth/recovery; recall during outbound/exploration; repeated-return guards; exhausted members saved in return transit; route snapshots; save continuation across midnight; exact delayed payouts; inventory commitment and overselling guards; concurrent trades; invalid route/timer/trade rejection; and v3 in-flight migration without outbound replay. Updated earlier fixed-time dungeon tests to account for actual travel rather than bypassing it. Existing attribute/check/economy regression tests pass.

Visual browser verification remains unavailable: the remote browser could not reach this workspace's local preview in the preceding interface pass. This change is prepared for review; no production deployment is claimed.

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
