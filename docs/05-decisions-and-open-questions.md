# Threadless / Hollow reskin direction — November 6, 2026

## Accepted direction (design only; not implemented in this documentation change)

- **World and chronology:** Guild Loops is set thousands of years after the Threadless campaign and uses **the Hollow's surviving architecture/geography** as its setting. Ruins of Emberveil exist in both periods. The original Threadless campaign geography is historical reference, not proof that every current travel distance/settlement is unchanged. Do not assert that modern Emberveil and original Spellreach Emberveil are identical without reconciling the Hollow's history.
- **Arya and Clyde:** They **predate Threadless**, with important lore intentionally reserved for much later. Do not describe them as newly invented post-Threadless characters, replace their identities, or expose their origins prematurely.
- **Catacombs:** Retain the historically grounded ruins/catacombs of Emberveil, linked to the *Ruins of the Wound and the Wish*. This is a **long-term story dungeon**, not an easy dungeon intended for deep early clears. Later levels should become significantly more difficult and reveal progressively more dangerous creatures. Depth scaling, enemy tiers and story gates need dedicated balancing; preserve current mechanics until designed.
- **Archive:** Rename/display the current Whispering Archive as **The Forgotten Highwoven Annex** (working accepted direction from the immediately prior naming proposal), a future lore-oriented exploration site for Clyde. The historical Highwoven Hall/Emberveil material is the basis, not an automatic copy of its original state. Stable internal dungeon ID `ruins` must not change for a display rename.
- **Quarry/Delve:** The current Emberstone Delve concept does not fit. Later, design a simple Weave-related hidden site; it should only be **discoverable by someone with Soul**. No present playable adventurer is intended to meet the combined expedition and Soul prerequisites. Do not activate or try to balance this site yet; exact place/name, Soul eligibility, who discovers it and unlock rules are deferred.
- **Secret dungeon abilities:** Do **not display the names** of dungeon-specific special Skills before that dungeon has been completed at least once. Keep secret metadata out of pre-clear dungeon panels, skill lists, tooltips and similar disclosures. Because dungeons are bottomless, the exact definition of the first valid "completion" is **unresolved** (e.g. first complete canonical ten-room floor and safe return, or another explicit milestone). Ordinary non-secret skills may remain visible; identify what counts as dungeon-specific when implementing.
- **Shops:** Favor renaming/flavoring the shopping establishment in an Emberveil/Hollow style, with a link to historic **The Loomlight Hearth** where appropriate. Distinguish a building/name surviving from an original proprietor still living. Keep navigation and backend IDs stable until scope is specified.
- **Resources/materials:** Early loot should be **generic Common materials and artifacts**, suitable as inputs for later processing into named, specialized, and/or higher-tier resources. Inkwell Reach is **not** to be used as the source of ink/loot flavor. Soul-enabled adventurers will later be able to recognize/find specific resources; adventurers without Soul find generic material whose conversion may fail or return lesser products. Recovery, processing, probabilities, Soul definition and specific outputs need separate design; no present loot curve changes are approved.
- **Equipment progression:** Gavin/the leather mentor is to **teach how to use/craft each tier**, but that does not directly give equipment. Each gear item must actually be crafted; multiple equipment types are planned. This supersedes current immediate-purchase template behavior **as a future redesign**, not an immediate migration. Recipes, distinct training and crafting permissions, tiers, costs, and legacy purchases remain deferred.
- **Guild building names:** The proposed guild-room/upgrade names are acceptable as flavor, but existing upgrade functions and capacities remain unchanged.
- **Characters:** Rename/recast current Elder Ash as a **later successor/descendant** such as *Oakley Ash* (working name); do not treat the original Elder Ash as the merchant. Original Ash's Weave Leech nature makes an asserted biological descent a lore question; family name, adopted lineage, institutional succession or narrative relationship should be defined before asserting a genetic link.
- **Rooms:** Current room names are acceptable. Additional atmospheric snippets may be added later, with no need to change room mechanics now.

## Lore-reference correction — Gavin / the Loomlight Hearth

The Threadless source `Festival Day 0.md` calls Emberveil's inn **The Loomlight Hearth** and names its innkeeper **Marven Wess**. `Marven.md` also calls the establishment the **Emberveil Hearth**. **Gavin is not verified as the original innkeeper in these files**; the existing Guild Loops Gavin is its tanner and barkeep. Make him the new proprietor/associated craftsperson in the far-future successor establishment if desired, but do not silently substitute him for Marven. References:

- [Threadless Festival Day 0](https://drive.google.com/file/d/11rUfMcIDCK1ySp9UfEsZMhuh9yLiDMgO/view)
- [Marven Wess](https://drive.google.com/file/d/18xoQGeP8fqvhwPwcndztu9WEeSbT8cjB/view)
- [Ruins of the Wound and Wish](https://drive.google.com/file/d/1TK9F9owsH6tsmTvcGpCw3-7FcoIlI9CE/view)
- [Emberveil](https://drive.google.com/file/d/1la0MH7qbwYTlPj_Rxk4vmf8omYmB-xrE/view)
- [Elder Ash](https://drive.google.com/file/d/1wuOKuWdx6OU2SCsESA7Firja14o83YRk/view)
- [The Hollow](https://drive.google.com/file/d/1cajQH7PIiViBhEB0rv7KkpB7EJ_sTkHp/view)

## Open requirements before implementation

1. **First completion trigger for hidden dungeon Skill names:** Bottomless dungeons do not have a natural final clear. Pick an explicit per-dungeon durable milestone, likely a completed canonical floor and successful return, and define whether discovery in another UI view may reveal a Skill sooner.
2. **Soul classification and perception/processing rules:** Does "has Soul" mean innate capacity, a selected Soul Attribute/Skill, effective Soul above a threshold, or a combination? Differentiate *finding specific loot* from *identifying generic finds* and *successfully refining* them. Don't accidentally grant Soul eligibility to every recruit who merely has a numerical Soul stat.
3. **Catacomb progression:** Outline the depth bands, early safe rewards vs intentionally dangerous deeper creatures, escalating monsters, and story revelations, without blocking ordinary beginner runs.
4. **Archive role:** Define which lore discoveries are Clyde-oriented without restricting the dungeon to Clyde unless intentionally approved. Confirm its exact display name and discovery progression.
5. **Quarry replacement:** Define whether to hide the current discoverable Delve entirely until the Soul-access site is designed and how existing saves/assignments transition.
6. **Equipment economy migration:** Current equipment "purchases" unlock reusable templates; switching to actual crafting affects recipes, material consumption, per-member equipment ownership, old unlocked gear, and later tier teaching.
7. **Merchant lineage/name:** Confirm Gavin's relationship to the old Hearth and whether Oakley Ash is a family member, an adopted successor, or otherwise inherits the title. Do not invent original Threadless lineage.
8. **Time and setting continuity:** How the Hollow survived/evolved for millennia (including the White Wall and altered magic) is a long-term story question; keep the game from revealing campaign-ending facts prematurely.

## Engineering boundary

This document records accepted narrative direction and explicit unknowns, **not implemented gameplay**. Preserve stable identifiers for resources/dungeons/shops/events and save-compatible history when editing presentation names. No new Soul drops, dungeon difficulty, hidden-skill unlock, cooking/crafting, or Soul-only location is live as a result of this decision log.

---

# Implementation decisions for PR #7 — November 6, 2026

Maya explicitly authorized choosing and documenting provisional defaults and implementing the full scope. Implemented: five/five specialization and sparse Skills matrix/totals; 0.01 fallback without weight renormalization; owned-Constitution-Skill entry gate; separate Endurance Capacity; successful ten-room floor Constitution XP that raises future capacity; Catchup → Flat → Percent; queued recall and independent room-grace timer; global/per-dungeon settings; retirement of assignment caps; v9 migration and Info explanations.

Provisional decisions are centralized in [02](02-adventurers-and-stat-growth.md), [04](04-dungeons-and-expeditions.md) and [11](11-progression-and-check-foundations.md). Those engineering choices are authorized for this PR, not declarations of final balance. Green includes exactly 90%. Fixed role/recruit picks, XP contribution, strongest-catchup/additive stacking and authored return/injury outcomes are no longer implementation blockers. Remaining work: craft recipe execution; balance playtesting; future Composite teaching/content, Potential reveal, Speed intervals, death/revival and optional sync.

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Approved depth-limit simplification and room threshold behavior — Nov 6 2026

- **Remove per-unit/per-assignment Depth Limit.** One shared limit per dungeon, with an **inheritable global default** (default Unlimited) and explicit local override (Unlimited or positive integer room count). Current v8 has both dungeon-wide `dungeonLimits` and per-member `queue[].maxDepth` / active `personalLimit`; only the new shared policy is authoritative once implemented. Do not merge inconsistent old member limits into a new group cap during migration.
- Put **Depth Limit** and **Insufficient Skill Threshold** together in expanded dungeon settings; put their defaults in Guild → Settings → Dungeon Defaults. Inheritance follows live global changes; local overrides remain fixed. Existing depth limit room-boundary behavior stays, distinct from ten-room canonical floors for XP and ordinary recall.
- **Agreed threshold behavior:** on entering each random room, compute member's effective weighted work rate as a percentage of the room's reference work rate. If below the configured percentage, let them try **30 game seconds**; incomplete → that room's failure mode. A quick completion continues. Proposed default 1%, 0% disables. This is a failure inside a floor, not a safe retreat. Prior preflight-only suggestion withdrawn.
- **Independent manual recall:** request waits for a full ten-room floor boundary or its own 30-second stuck-run failsafe. Handle simultaneous timeout events once. Need to finalize exact penalties for recall timeout and room failure catalog; numeric floor scaling / reference speed remain balance decisions.

This design is documented, NOT live in v8.

---

# Under discussion: insufficient skill auto-bail — November 6, 2026

A configurable **Insufficient Skill Threshold** is requested for underqualified dungeon entrants. Proposal: **1% default, 0% off**, inherited global setting with per-dungeon overrides near depth limits. Compute ratio of actual member weighted effective work-per-second against an authored normal room reference work-per-second, NOT their personal affinity/potential. Clyde can deliberately struggle in a 90% Power/10% Finesse room; the small 0.01 fallback still produces low progress, and the actual ratio (not simply a missing Skill flag) decides whether he trips the threshold.

**Cannot automatically bail safely mid-canonical floor** without violating the newly agreed no-running rule. Recommended safe check at floor boundary, with any mid-floor 30-second failsafe treated as a separate exceptional interruption. But the engine generates rooms randomly and calls each room a `floor`, while ten rooms canonically make one floor: the exact screening unit/benchmark requires an explicit decision. Further open detail: whether low-efficiency candidates attempt for 30 seconds before failure or reject entry immediately; whether trigger is worst mandatory room segment versus full floor estimate; default reference durations; manual recall interaction; exact punishment. Keep this as design (not implementation) until settled.

---

# Finalized mechanic clarifications — November 6, 2026 (planned, not in v8)

- The only **consumable dungeon resource** is overall **Endurance Capacity**, **not** the underlying Constitution Attribute. Max Capacity derives from the owned Constitution Skill values; a Con-1 character owns at least one of Toughness, Endurance or Vitality.
- Clearing **a complete floor** grants **general Constitution XP**, on top of usual check/room attribution. The existing game counts individual rooms as `run.floor`; the design's canonical floor is ten rooms. Do not count every room as a full-floor XP event. Open balance issue: 1-room beginner depth limit prevents whole-floor XP until later; decide how general Constitution XP feeds effective combined Con Skill values or total Capacity, and how early endurance growth works.
- Equipment strictly transforms effective check value in the order **Catchup first → Flat second → Percent last**. Catchup N is no-downside: max(V,(V+N)/2). Need multiple-item stacking choice. Eligibility is unchanged by equipment.
- Manual recall is **queued until the next full-floor boundary** for a safe exit. Hard **30-second fallback** allows interrupting a stuck/slow floor; it is not an ordinary safe exit and doesn't grant floor-clear XP. Between floors, safe recall may resolve immediately. Existing depth limit exits stay unchanged. Whether 30s are game-time versus wall-time, and exactly which loss/penalty to assign on fallback interruption, remain open (game-time recommended).
- Current `engine.ts` instantly recalls, increments a field called `floor` per room, and tracks depth caps in rooms. These must be reconciled in implementation without corrupting old saves.

Older document sections proposing a directly depleted Constitution root stat, a universal safe return on CON exhaustion, or per-room Constitution XP are superseded. Current behavior unchanged.

---

# Confirmed dungeon and character progression corrections — November 6, 2026 (planned, not live)

1. **Constitution is the only consumable Attribute**, and Soul/Luck are explicitly non-consumable. All other Attributes affect effectiveness without resource drainage; the previous multi-pool parent-cost model is superseded.
2. **Con-1** dungeon eligibility = owning **any** Constitution Skill (Toughness, Endurance, Vitality), not a Combat requirement nor merely having an unselected Constitution baseline. All three owned Con Skills may contribute to shared endurance capacity (proposed sum).
3. **Each room drains Constitution at a flat per-second rate**, scaling with floor depth but independent of its progress/check weights. Speedier completion conserves endurance; do not make it an invariant one-off fee per completed room.
4. **Progress may always be attempted** on general dungeon checks. Preferred Skill Value → selected Attribute fallback → tiny unselected Attribute baseline **0.01**, with authored weights unchanged. Missing pairings remain visually blank in the 5×5 display; baseline never unlocks a Skill.
5. **No automatic safe flight when exhausted.** Each room defines the appropriate failure outcome. Consequences and optional voluntary exit/recall rules require a separate design decision.
6. Specialized actions may require an authored **Composite Skill**. Charisma/Intelligence/Perception gate Recruitment/Research/Scavenging assignments at the character action level; Constitution's Con-1 gates dungeons.
7. Attribute or Discipline **rollups**: sum the character's authored/owned Skill Values in the related axis. The 5×5 display must show all five row totals, five column totals, and a grand total counting each owned Skill once. Dungeoneering group checks may use Force+Finesse+Agility. Speed-derived Agility/Scouting/Movement may later affect dungeon tick pace, area discovery and travel time.
8. Planned check gear: percent multiplier, flat value boost, and **Catchup N** (`max(V,(V+N)/2)` as no-downside definition). Gear never gives an absent Skill, Composite Skill, selected affinity or Con-1 eligibility.

**Unresolved:** floor-rate numerical scaling; whether hidden or not-yet-trained selected Constitution Skills provide any starting endurance; exact slow-check fallbacks; which room failure outcomes and recovery/loot/death effects are authored; manual recall/depth caps; Speed tick rounding; gear stacking order; 5/5 fixed starting rosters; save migration and test coverage. Existing v8 game code has NOT been changed. Earlier dated paragraphs below are historical and overridden where they disagree.

---

# November 6 design discussion — dungeon fallback and character action gates

**New direction under discussion (not implemented):** Arya needs Power, Clyde must have Constitution and Crafting and can stay a non-Combat scavenger, Guild Master lacks Constitution and has Crafting. Dungeon entry is Constitution-only, *not* Power, Combat Discipline or Combat Composite. Per weighted check: use the defined Skill where trained; if absent, use the selected Attribute fallback; if the Attribute is unselected, its share contributes zero with no weight renormalization. Need to reconcile baseline-1 display with zero effective participation for unselected roots.

Constitution should be present in every floor's work/cost and act as the main dungeon failure resource; current rooms are the actual progress units. Current hard level-1 Combat gates on mandatory checks and all-or-nothing pool charging are incompatible. Decide whether other depleted pools disable only their contributions, whether all rooms (not just canonical floors) drain CON, and ordinary fatigue versus danger injury. Tune work, costs and recovery so the non-Combat scavenger has finite meaningful progression. Guard against no-contribution zero-speed mandatory checks.

Proposed per-character, **action-level** hard gates: selected Charisma for Recruitment, Intelligence for Research (future), Perception for Scavenging, Constitution for dungeon entry. No automatic entire-tab hiding; the Guild Master retains Charisma+Intelligence. Strength/Dexterity/Speed mainly support dungeon speed; Luck and Soul have situational roles. Distinguish from current executable v8 rules. Further detail in docs/02, 04 and 09.

---

# Approved character grid and terminology decisions — November 6, 2026 (planned, not implemented)

Approved names: nine root **Attributes**; nine activity **Disciplines**; pairwise authored **Skills** (e.g. Strength × Combat = Power); learned multi-Skill **Composite Skills**. Each character specializes in five Attributes and five Disciplines. **The 5×5 matrix always has 25 positions, but only catalog-authored pairs display Skills; all missing pairings stay completely blank.** Example: Combat × Perception is an empty cell. The existing 27 unique Skills are not expanded merely to fill a grid.

Discipline glyphs are neutral black by themselves; Skill glyphs are Attribute-colored. A Skill's **numeric Value text itself** is colored red (<75% of Potential), yellow (75% to <90%), or green (>=90%, provisional exact-boundary choice). **No added training-state icon, colored dot or badge**. Info → Skills will document all nine symbols per axis, their intersections, blank cells, baseline competence, Constitution gating, Composite Skill prerequisites, hidden Potential and the training legend.

Still open: characters' five/five assignments, generated-recruit distributions, root resource/10^tier balance, Guild Master Discipline picks, legacy save migration, Composite Skill prerequisite exactness and exact-90% boundary. No live gameplay implementation yet.

---

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
