# Current review delivery — PR #7 / save v9

November 6, 2026. Five/five character selections, sparse 5×5 Skills grid/totals and separate Composite Skills are implemented, together with run-specific Endurance Capacity, successful ten-room Constitution XP, queued recall, 30-game-second room-grace failures and inherited dungeon defaults. Individual depth caps are retired. Maya authorized provisional defaults; details and migration are in [11](11-progression-and-check-foundations.md), UI in 10, and executed validation in 08. The older “planned/not implemented” sections below are history superseded by the current v9 sections. Recipe execution and final balance remain future work.

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Current delivery — November 6, 2026

Save v8 adds single assignments, queue visibility, per-dungeon member history, newest-first Plot and separate rarity/tier classification. See 06 for assignments, 10 for UI, 02/03 for classification, 08 for verification and 09 for remaining work. Weighted engine/shop and discovered-skill changes are included in this delivery.

# Guild Loops Idle — Design Index

Updated: November 5, 2026

Working title taken from the project folder. These files capture the design and the first implementation. Prototype defaults and validation results are recorded separately from agreed long-term mechanics.

## Files

| File | Contents |
|---|---|
| [01-concept-and-core-loop.md](01-concept-and-core-loop.md) | Premise, player role, progression layers, and core cycle |
| [02-adventurers-and-stat-growth.md](02-adventurers-and-stat-growth.md) | Unique recruits, three stat layers, affinity, and growth formula |
| [03-guild-and-resources.md](03-guild-and-resources.md) | Guild master priorities, capacity, equipment support, and future upgrades |
| [04-dungeons-and-expeditions.md](04-dungeons-and-expeditions.md) | Dungeon requirements, individual runs, retreat, and loot |
| [05-decisions-and-open-questions.md](05-decisions-and-open-questions.md) | Decision history, unanswered design questions, and proposed prototype scope |
| [06-queues-and-assignment.md](06-queues-and-assignment.md) | Continuous member dispatch, per-member depth queues and future affinity filters |

| [07-build-plan.md](07-build-plan.md) | Phases, build steps, goals, test gates, and provisional implementation defaults |
| [08-test-report.md](08-test-report.md) | Automated cases, browser acceptance results, and verification limits |
| [09-next-phase.md](09-next-phase.md) | Playtest findings and prioritized follow-up work |

| [10-game-interface.md](10-game-interface.md) | Current 2:8:2 game layout, tab structure, calendar and sidebar requirements |

## Status conventions

- **Agreed:** Explicitly described or accepted by Maya.
- **Working model:** An accepted direction with implementation or balance details still unresolved.
- **Proposed:** An assistant suggestion that has not been approved.
- **Open:** No decision yet; do not silently turn this into a requirement.
- **Future:** Intended eventual mechanic, without a requirement to implement it immediately.

## Maintenance

Keep each mechanic's detailed definition in its topic file. Record material changes in the decision log. When discussing new ideas, preserve the difference between approved requirements and proposals. Example numbers are illustrative, not balance commitments.

The baseline uses React, TypeScript, and Vite with browser-owned versioned saves and file export/import. Source: awkwardbowman/guild-loop-idle. Vercel is the intended hosting target; Convex is deferred to optional cloud sync. See the build plan for prototype defaults and the test report for actual verification.

Current version: 0.2 game-interface and bottomless-dungeon redesign. The original website-like dashboard and fixed-day simulation are superseded. See 04, 06, 07 and 10 for current rules.

| [11-progression-and-check-foundations.md](11-progression-and-check-foundations.md) | Implemented event/unlock, attribute/skill/check and save v6 contracts; provisional formulas and authoring extension points |

Current preparation: schema v5; accepted nine main stats, nine activity groupings and 27 attributes, plus separate guildmaster stats and modifier-only Luck. Location travel, delayed trades, story/event logs and skill-check foundations are implemented. Spell actions, final plot, decay and gear conversion remain future work. The exact accepted matrix and magic rules are maintained in 02.


Current review build: v6 Emberveil opening with Arya/Clyde, <=10-point tier-1 profiles, weighted rooms and size-budget loot, Gavin (Tanner/Barkeep), Stillmere herbalist, shared equipment unlocks, Chips currency, cargo/storage limits and Guild Master/Guild Hall/Storage. The detailed current contracts supersede historical prototype defaults; see 01–05 and 08–11.
