# Baseline Test Report

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
