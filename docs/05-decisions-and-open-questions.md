# Backlog disposition — November 6, 2026

Implemented: single repeating dungeon assignment per member; distinct queued status and live roster-ordered dungeon wait lists; current-activity-first member controls; persistent member/dungeon depth and last-return history; newest-first Plot; separate member/material/equipment rarity and tier, with Common T1 starters and safe old-save migration. Tier has no authored maximum within rarity. Current recruitment numbers, equipment permissions and loot rates are preserved.

Deferred: crafting recipes/execution; cross-rarity stat curves and recruit distributions; joint rarity/tier/depth drop weighting; new material families and later lore renaming. The historical 10^tier rule remains a Common recruitment default, not an approved cross-rarity formula. These deferrals do not block this backlog merge.

# Decisions and Open Questions

Updated November 5, 2026. Source: the initial game-design conversation with Maya on this date.

## Decision log

| ID | Status | Decision |
|---|---|---|
| D01 | Agreed | Browser incremental game about managing a guild, inspired by Idle Loops |
| D02 | Agreed | Adventurers perform the loops; the guild master persists and does not reset initially |
| D03 | Agreed | Guild-master priorities include recruitment and infrastructure |
| D04 | Agreed | Recruits have semi-random stats and should be distinctive |
| D05 | Agreed | Guild capacity, gear capacity, and gear regeneration gate simultaneous expeditions |
| D06 | Agreed | Dungeons differ in resource requirements and have individual loot pools |
| D07 | Revised | Insufficient required consumable resources force return; non-consumable modifiers such as Luck do not. The exploration time limit starts return travel. |
| D08 | Agreed | Dungeon tasks determine stat training, growing maximums for subsequent runs |
| D09 | Agreed | Each stat has Current Value, Max Value, and Stat Affinity |
| D10 | Agreed | Higher adventurer tiers have higher average affinities |
| D11 | Working model | Growth scales with dungeon training and the normalized gap between Max Value and Affinity |
| D12 | Agreed | Successful dungeon runs return random loot from that dungeon's pool |
| D13 | Future | Guild-master upgrades improve affinity; additive bonuses are a possible approach |
| D14 | Agreed | Maintain requirements and mechanics in Markdown in the Guild Loops Idle Drive folder |
| D15 | Revised | Ordered guild-member priority remains; the continuous-time prototype now retries dispatch as members/support become available |
| D16 | Future | Dungeon assignment preferences can specify minimum/maximum Stat Affinity thresholds and skip members who do not match |
| D17 | Agreed | Initial functionality needs both guild-member dispatch order and a bare-bones dungeon queue per adventurer |
| D18 | Agreed | Keep initial dungeon queues simple; defer affinity filters, thresholds, and advanced assignment rules |
| D19 | Agreed | Players own their saves: browser persistence and versioned export/import; no mandatory database |
| D20 | Future | Cloud service may synchronize saves, but local play does not depend on it |
| D21 | Agreed | Build in phases, write and validate test cases after functional groups, then playtest the main game and plan the next phase |

| D22 | Agreed | Game-first 2:8:2 layout; collapsible left status, center functional tabs and right event log |
| D23 | Agreed | Fictional continuous day/month/year and hour:minute:second clock; realtime speed available; final epoch TBD |
| D24 | Agreed | Bottomless dungeons; global stopping depth and personal assignment depth both apply |
| D25 | Agreed | Deeper floors cost more time/resources and offer larger rewards carried until surviving return |
| D26 | Agreed | Independent member reset cooldown before redeployment; eventual stat likely controls duration |
| D27 | Future | Penalized failure loses a percentage of loot, auto-warps and applies longer reset; retention stat/formula TBD |
| D28 | Future | Early return may recover unused Gear/Supplies to accelerate departure |
| D29 | Future | Traits determine member properties; Pampered may increase reset/gear needs with an undecided benefit |
| D30 | Agreed | Guild, Members, Activities (Dungeons + TBD internal assignments), Resources and final Info tabs |

| D31 | Agreed | Upcoming skill checks force return when required resources are exhausted or insufficient to pay the next cost; no unpaid progress or success reward |
| D32 | Future | Gear may convert resources inside dungeons, potentially based on affinities; no conversion initially |

The 0.1 visual design was rejected as too website-like. Replaced with a game-focused interface. Fixed dungeon completion, 60-second days and manual daily restart are superseded defaults. Current authoritative rules are in 04, 06, 07 and 10. Historical baseline tests remain historical, not proof of the redesign.

## Next design decisions

1. Tune uses and costs for the accepted nine main stats and 27 attributes; see 02.
2. Tune bottomless-floor task structure, scaling curves, stat costs and training rewards; depth controls and current completion defaults are in 04.
3. Decide training retention and any loot retention after retreat or timed warp.
4. Define capacity and gear semantics: roster versus deployed limits, consumption, reservation, and regeneration.
5. Define execution details for the approved member dispatch queue and per-adventurer dungeon queues. Dungeon queue ordering is required; advancement, restart/resume, repeat settings, and recall remain open.
   - Define day length, whether dispatches run concurrently, and whether returned members can redeploy during a day.
   - Define behavior when a member cannot be equipped, and whether any skipped member is reconsidered later.
   - For future affinity filters, define stat selection, base versus effective affinity, inclusive bounds, and dungeon fallback order.
6. Define recruitment generation, tier distributions, and initial maximums relative to affinities.
7. Decide how time, recovery, background progress, and offline progress work.
8. Specify loot uses and the first guild upgrade costs.

No immediate answers are required to preserve the current design. These are an agenda for future discussion, not blockers for documentation.

## Proposed first playable prototype — Not yet approved

An earlier assistant suggestion was one guild, three adventurer slots, one explorable region, and a small action set. Those counts and that content scope have not been accepted.

A useful candidate vertical slice would exercise recruitment, ordered daily member dispatch, basic per-adventurer dungeon queues, support-limited deployment, dungeon stat consumption, retreat/success/warp, between-run stat growth, and dungeon-specific loot. Exact scope should be agreed before treating it as an implementation plan.

## Technical state

- Baseline implementation: React, TypeScript, and Vite; local automatic saves plus versioned JSON import/export.
- Source repository: awkwardbowman/guild-loop-idle.
- Maya reported deployment at https://guild-loop-idle.vercel.app/ on November 5, 2026. Hosted gameplay has not yet been independently verified.
- No account, database, or server is required for local play. Convex is deferred to optional cloud sync.
- Phased implementation defaults are recorded in 07-build-plan.md. These resolve open questions provisionally; the earlier topic files preserve the distinction between approved requirements and permanent undecided rules.
- Verification results are in 08-test-report.md; next steps are in 09-next-phase.md.

## Balance and implementation cautions

These are review considerations, not additional approved mechanics:

- Avoid rewarding impossible-run spam more than meaningful dungeon progress unless intentional.
- Preserve specialist identities as recruitment tiers increase.
- Specify growth rounding and boundary behavior before implementing the formula.
- Resolve simultaneous completion, retreat, and timeout deterministically.
- Preserve accrued progress through save/load and repeated return processing once persistence is implemented.

## Progression and skills — November 5, 2026

| ID | Status | Decision |
|---|---|---|
| D33 | Agreed | Save completed events as durable facts; derive feature visibility from them |
| D34 | Agreed | New players begin with the guild; add 00 Story with feature/content threads appearing as unlocked |
| D35 | Revised | Consumable main stats provide pools; specializations charge the underlying root. Luck is a non-consumable modifier. |
| D36 | Agreed | Specialization fallback extends through ancestry with diminishing contribution |
| D37 | Agreed | Learned skills have a universal level cap of 99 and determine effective resource use |
| D38 | Agreed | Check speed, success and efficiency can use different skills or ratios |
| D39 | Future | Skills can deteriorate from disuse; decay parameters undecided |
| D40 | Working defaults | 0.3 supplies a small unlock chain, three sample skills and an archive trap room for testing; plot and final balance remain open |

Functional preparation is implemented and tested. See 11-progression-and-check-foundations.md for technical contracts and 08-test-report.md for actual checks. Source is prepared for a review branch, not a production rollout.


## Accepted matrix and guildmaster — November 5, 2026

- Nine main stats: Strength, Dexterity, Constitution, Speed, Perception, Intelligence, Charisma, Soul, Luck.
- Nine activity groupings: Combat, Dungeoneering, Exploration, Crafting, Social, Trade, Travel & Logistics, Recovery & Support, Management.
- The exact 27 matches in 02-adventurers-and-stat-growth.md are accepted, with three per stat and three per grouping. Learned skills remain separate.
- Stats can be consumable, modifiers, or both depending on the activity; Luck is initially non-consumable.
- The player guildmaster has a separate permanent stat profile with unusually high Soul and is the only innate magic user. Adventurers use relics/artifacts; Soul is useful without spellcasting. Magic/imbuement/revival actions remain future content.
- The earlier three-pool root model is superseded by schema v5; numerical starting values are implementation defaults.
- Setting inspiration is Threadless roughly 1,000 years later: a small Emberveil beginning to revive, with Ritual Catacombs nearby. Local travel takes 15 seconds each way; sales take 15 seconds and commit items immediately.
- A death/revival recovery timer from 4× travel toward 2× travel with diminishing stat benefits is agreed direction; governing stat, scaling and death triggers remain undecided and unimplemented.

- The 27 attributes are the shared foundation for most activities. Dungeons will have unique specialized check sequences and weighted combinations, displayed beside the dungeon for member selection. Each dungeon/check can assign different relative importance. Authored planning weights are separate from actual speed/success/efficiency/cost channels.


## Emberveil opening — Accepted v6

- Introduce player history, then friends Arya/Clyde, then found the guild. Both are fixed low-tier recruits.
- Tier-1 total core potential budget is 10, not 10 per stat; tiers scale as 10^tier. Starting core maxima total 9 for each friend.
- Arya favors dungeon progression; Clyde has higher support/scavenging skills and the Harvesting eligibility Arya lacks.
- The Ritual Catacombs require no equipment; no passive regeneration begins enabled.
- Track rooms; ten may represent a canonical floor. Use weighted room groups, then weighted rooms within the selected group.
- Optional failures skip; mandatory failures retry until required resources cannot fund progress. Only successful checks award skill XP.
- Loot uses a size budget, repeated eligible weighted draws and a permanent size-1/weight-1 Chips fallback. Resource rarity improves relative weights with depth, not hard unlock floors.
- Difficulty grows slowly exponentially; rewards grow linearly.
- Gavin is the Tanner and Barkeep. First Leather Scraps unlock his shop story. Equipment unlocks are guild-wide, loadouts per member, shop capacity ceilings absolute.
- First herb opens Gavin’s conversation; he does not buy herbs. Holding 5 herbs unlocks directions to Stillmere’s herbalist without consuming the sample.
- Chips replace Gold entirely; Pebs/Bowls represent pebbles/boulders as later denominations.
- Each resource has a separately purchased cap. Cargo capacity is separate. Overflow is discarded and logged. Compression magic and assigned storage-tab auto-selling are future systems.
- Guild subtabs: Guild Master, Guild Hall, Storage.

These decisions supersede the old single unnamed friend, consumable gear/regen starter, fixed task floors, uncapped stockpile and Gold terminology. Exact numerical weights/prices are provisional implementation values.
