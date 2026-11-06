# Proposed configurable insufficient-skill auto-bail — November 6, 2026 (DESIGN, not implemented)

**New player option:** `Insufficient Skill Threshold`, preferably a **global default with a per-dungeon override**, shown with dungeon depth limits/assignment settings. Suggested default **1%**; **0% disables** the efficiency-based auto-bail. Show an understandable description and the active setting in Info and dungeon settings. This should not be a static per-member stat; units with different builds can share the dungeon but evaluate independently.

**Efficiency must be relative to the room's authored difficulty/time target, not relative to the member's own Skill Potential.** Proposed, pending balancing: `efficiencyRatio = memberPredictedWorkPerGameSecond / authoredReferenceWorkPerGameSecond` with `authoredReferenceWorkPerGameSecond = roomRequiredWork / roomTargetCompletionSeconds`. Multiply by 100 for the percentage. The member prediction uses **actual weighted check values after** Skill/Attribute/0.01 baseline fallback and gear application, without renormalizing missing weights; apply any activity-specific tick-frequency modifiers consistently. A 1% threshold means the actor would complete at under 1% of intended reference work speed, not that the actor is under 1% of their personal Potential. For rooms with ordered checks, define whether to evaluate worst mandatory check or projected total floor/room time (proposal: worst mandatory check to avoid impossible segments). Author reference time for each room/dungeon or another reproducible benchmark, with tests.

**Bail / no-running invariant:** distinguish a **pre-entry rejection** from a **mid-floor interruption**. Recommended: evaluate predicted efficiency at a **safe floor-entry boundary**; if below threshold, automatically stop rather than commit to a floor that the unit cannot reasonably finish. Once engaged in a floor, do not grant automatic safe flight: apply the existing per-room failure policy if the unit exhausts endurance or hits an exceptional stuck-run timeout. Suggested **30 elapsed game seconds** as a grace/failsafe for a critically underqualified check **if the player wants the actor to try anyway**, but exact trigger/consequence and relation to queued manual recall should be decided before code; do not silently reinterpret a low-efficiency timeout as a safe floor clear. Never award floor XP/loot for an uncompleted floor.

**Room vs floor unresolved:** The design calls ten rooms one canonical floor; the current `run.floor` is a room counter and each encountered room is randomly rolled. For an exact **whole-floor entry** prediction, generate/inspect the relevant room sequence before committing or use an explicitly documented aggregated-floor benchmark; a per-room check may occur *inside* a canonical floor and therefore cannot safely exit at every room boundary without relaxing the existing no-running rule. Select an explicit pre-entry assessment scope in the implementation, don't conflate floor/room. Default should ensure an adventurer such as Clyde is merely slow in a 90% Power/10% Finesse encounter, **not automatically rejected unless his measured ratio actually falls below the configured threshold**.

**Player-facing:** In the expanded dungeon settings show `Insufficient Skill Threshold: Inherit global / 0% Off / percent` and a short estimated efficiency tooltip. Info → Skills / Dungeons describes the percentage baseline, the fallback/gear interaction, what happens below threshold, and the fact that no gear permits a locked activity. Retain the current ability to edit depth limits and inspect each member's expedition history.

**Tests:** mixed-build Arya/Clyde, missing primary weighted Skills, 0.01 fallback, >100% efficiency, 0% Off, custom overrides and inheritance, unknown/invalid reference duration, save/load, depth scaling, no false safe escapes, award-once floor XP and queued recall/30s behavior. Gameplay remains v8 until a PR implements this.

---

# Accepted clarification: endurance capacity, floor XP, ordered equipment, queued recall — November 6, 2026 (DESIGN ONLY, not in v8)

This **supersedes** earlier descriptions of Constitution as a spendable root-stat pool, and clarifies recall. The character has an **overall dungeon Endurance Capacity** resource, not a consumed Constitution Attribute. It is derived from trained/effective values of owned Constitution Skills (Toughness, Endurance, Vitality); at least one is required (Con-1) to enter a dungeon. Treat the capacity as an expedition run resource with current and maximum values, refilled according to run/return rules to be implemented. Constitution, Soul, Luck and all other Attributes themselves are **not drained** by checks. Each active dungeon room independently imposes a flat endurance-rate drain per elapsed game second, scaled by canonical floor depth, separate from weighted progress contributions. Only the endurance capacity decreases. If depleted mid-room, apply the room-specific failure outcome.

**Training:** When a character **fully clears a canonical floor**, award general **Constitution XP** in addition to the normal per-room/per-check weighted Skill/Attribute XP already earned. Award this once per actual floor clear, **not once per room, per partial floor, per attempt, or on a failed/forced recall**. Root Constitution XP is meant to enable future endurance growth: specify its conversion into the Constitution Skills, their fallback, cap or effective combined capacity so it is not decorative. Avoid applying the same award multiple times on resume, save reload, recount or replay. Preserve earlier accumulated per-check training on normal floor completion.

**Floor boundary:** existing v8 engine variable `run.floor` actually counts **rooms**, and design lore says **10 rooms per canonical floor**. The new floor-clear XP and safe-recall boundary should use explicitly authored/derived 10-room floor boundaries (rooms 10,20,30…), **not every `resolvedRoom` event**. A caveat for balancing: present starter depth limits may stop at room 1, so floor-clear-only CON XP would not be obtainable until a full 10-room floor is reachable; do not silently award floor XP per room to work around this. Decide whether other early training also increases endurance or starter caps need adjusting. Depth Limit is preserved at existing room boundaries, even where that does not grant a completed canonical-floor bonus.

**Manual recall:** unlike v8 immediate `recall()` safe exit, recall must **set a pending request**. The character continues through the current canonical floor and exits safely **at the next floor boundary**, *or* a **hard 30-second fallback** from the recall request fires if progress is stalled/slow. The ordinary recall must never safely interrupt a floor. If the 30-second cap forces an exit mid-floor, this is an **exceptional interruption**, not a safe floor-boundary clear; exact penalty/failure labeling is still open (do not invent the room's injury type or grant the floor bonus). If the request is placed while already between floors, safe recall may resolve immediately. Prefer measuring the 30 seconds in **elapsed simulation/game seconds**, respecting pause/speed; confirm this timescale prior to implementation. Store pending-request elapsed time and phase in a save-safe manner. Standard depth limits continue working as they do now; they do not convert into a 30-second recall timer.

**Equipment processing order:** for each check/effective-value contribution, apply all relevant **Catchup** boosts first, then applicable **flat additions**, then **percentage multipliers**. A Catchup N modifier evaluates at least `max(value,(value+N)/2)`; it must not reduce already-high values. Gear does not satisfy any activity/Con-1/Composite Skill eligibility gate, even when it raises a weak base value. Multiple-item Catchup combination and percentage stacking are still open for the subsequent engineering specification.

**Implementation collisions to test:** `engine.ts` currently performs immediate `recall()`, calls `resolvedRoom` after each individual room, uses `run.floor` for room number, and starts with room-based depth caps. Refactor and test floor-boundary detection, timer timeout, injury/failure outcomes, XP credit only at true floor clear, capacity training persistence and post-return reset. Existing historical trip rules must migrate without duplicating rewards.

---

# Approved direction: room endurance, single-resource drain, and room-specific failures — November 6, 2026 (planned, NOT implemented)

**This supersedes the earlier proposed Constitution-as-a-weighted-check-component redesign and the earlier proposal to deplete other Attributes; the v8 executable engine described later is historical until the next PR.**

## Endurance pool and dungeon eligibility
- Dungeon entry requires **Con-1**: character possesses **at least one of the three authored Constitution Skills**: Toughness (Constitution × Combat), Endurance (Constitution × Travel & Logistics), or Vitality (Constitution × Recovery & Support). Merely having baseline Constitution 0.01 or gear that boosts checks does not create eligibility. Guild Master has none; Clyde can qualify via Vitality.
- Constitution is the **only consumable Attribute** for dungeon work. Endurance capacity is **proposed to equal the combined trained effective values** of owned Constitution Skills (Toughness + Endurance + Vitality); no other Attribute has a spendable Current pool. Final calculation (bonuses, baseline for owned-but-untrained skill, reset/training integration) is a tuning/implementation detail. A character with all three can reach a much higher pool than one with only a single Constitution Skill.
- Each room has a **flat Constitution drain rate per elapsed game second**, with that rate scaling by the floor/depth. This drain is **separate from weighted progress contributors**: a room need not include Constitution in its speed/check weights. If a room takes twice as long, it spends about twice as much Constitution. **Do not implement a once-per-room fixed charge**, which would eliminate the intended time-efficiency tradeoff. A final tick must pay its rate before completing; exact funding succeeds.
- The dungeon currently advances by **rooms**; ten rooms are one flavor floor. Author the drain rate per room, with floor scaling defined explicitly (e.g., floor index from room number / 10) rather than silently using the previous 1.04^room scaling. Work scaling and CON drain scaling may be tuned separately. Speed/time modifiers must use real elapsed game time consistently.
- **Every room defines an on-Constitution-depletion failure mode.** Apply that room's authored consequences when the character cannot pay the next tick; do **not** substitute an automatic safe retreat. Outcomes could include injury or more severe danger depending on the room, but their exact consequence catalog (loss/death/revival, reset, loot, etc.) still needs authoring. Existing manual recall, time limits and depth-cap exits are separate mechanics requiring review; "no running in a dungeon" rejects automatic escape on failed room checks.

## Progress and fallback
- For each check, sum the **original, unchanged weights** times each contributor's effective Skill value. If a defined Skill is absent, fall back to the underlying selected Attribute at its retention factor. If the Attribute is not specialized, use its **tiny baseline value (proposed 0.01), not zero**, so a nonspecialist is extremely slow but can contribute. Missing pairings in the visible 5×5 grid remain visually empty; fallback is an engine-level calculation, not a newly unlocked Skill. Never renormalize absent weights.
- A room with 90% Power and 10% Finesse must be very hard for scavenger Clyde: no Power means that 90% term uses the tiny Strength baseline (unless equipment boosts the check), leaving only his Dexterity fallback for the 10% Finesse share. His Constitution drains throughout the slow attempt.
- No blanket Combat Skill or Combat Composite gate on mandatory dungeon rooms. Individual **special activities** (herb harvesting and future crafted actions) may require specific learned **Composite Skills**. Missing such a gate does not prevent ordinary physical progress; classify author-defined opportunities as mandatory/optional consistently.
- Because only Constitution is spent, non-Constitution stat shortages cannot terminate an adventure. Avoid division-by-zero or infinite stalls if work progress is 0; with a 0.01 baseline and positive room weights progress should be positive, but validate data and fail according to room rules if it is not.

## Distinct speed/time effects and rollups (future extension)
- A group-specific check may use the **sum of the available three Skills under one Discipline**, e.g. Dungeoneering = Force + Finesse + Agility (only character-owned Skills contribute to the discipline total, with empty pairs contributing 0). Avoid double-counting individual weighted contributors when introducing a group rollup; content explicitly selects its calculation.
- Optional **Speed/Agility** (Speed × Dungeoneering) effects can shorten the duration between dungeon progress ticks; **Scouting** (Speed × Exploration) can improve exploration/discovery; **Movement** (Speed × Travel & Logistics) can shorten city trade travel. These are distinct authored mechanics, **not** global mandatory Speed gates. Tune interval minimums, speed diminishing returns and interaction with per-second Constitution drain.
- Later equipment types: **percentage multiplier** to a relevant check value, **flat additive value**, and **Catchup N**, proposed as raising a weaker effective value halfway toward N: `max(value, (value+N)/2)` (never reduces a strong value). Gear **never grants a missing base Skill or Composite Skill, never changes chosen affinities and never satisfies Con-1 or other activity gates**. It can still improve an otherwise weak check term, including baseline terms. Stacking order, category, scope and rarity/cost deferred.

## Implementation and regression requirements
The current executable `rooms.ts` hard-requires Combat level 1 on several mandatory rooms, charges all parent pools, and ties injury to the old Constitution check weights. Replace deliberately with a **single CON endurance pool, rate-based per-second drain, weighted work independent of endurance charging, authored failure modes**, and no automatic safe escape for room failure. Update room data, UI labels, elapsed time, simulation estimates, skill progression, stat training, equipment, save version/migration and regression tests together. Keep existing behavior on historical saves until a migration is specified; mark planned versus live behavior clearly.

---

# Proposed constitution-endurance dungeon redesign — November 6, 2026 (NOT implemented)

User direction: dungeon participation **does not require the Combat Discipline, Power, or the Combat Composite Skill**. Constitution specialization is the *entry* prerequisite. During combat and other rooms, progress uses each authored weighted Skill when available, otherwise that Skill's parent Attribute when selected; if that Attribute is unselected, its share contributes zero work. Missing shares are **not renormalized**. This applies equally to noncombat specialists such as the proposed Clyde scavenger (Dexterity, Constitution, Perception, Intelligence, Luck).

Each floor should require **some Constitution**, so Constitution is the expedition endurance/ultimate stopping resource. The current executable progression unit is a *room* (ten rooms are a flavor floor); **recommended implementation** is a nonzero Constitution component in every mandatory room/check, and perhaps all rooms. Confirm whether every room—including optional treasure—should drain Constitution rather than quietly treating flavor floors as atomic. Aim for ordinary expedition failure/return when the next Constitution cost cannot be paid, not automatic "Injured" on every routine return. Danger-specific injury can remain separate. Successful final ticks paid exactly should still complete once; never retroactively lose the room.

**Important engine conflict:** current `rooms.ts` has hard `requiredLevel:1` Composite Combat gates on mandatory scavenger/boss checks, and `roomCheckStep` rejects the whole tick when *any* parent pool cannot pay, before applying `checkRating` work. Also, only existing combat/trap checks use Constitution. These behaviors **must be revised** for Clyde to progress without Combat and for Constitution to be the universal failure resource. Suggested rule: when a non-Constitution pool cannot pay its slice, that slice stops contributing/consuming; other funded slices (especially Constitution) continue. Do not permit free progress from exhausted stat pools, and preserve atomicity per paid slice. Luck remains non-consumable. If no contribution can make progress, mandatory rooms must return safely rather than hang; optional rooms can skip. Keep a separate content-defined hard Skill gate for specialized optional actions (e.g. Herbology for herbs), not broad mandatory Combat permission.

Rebalance starter check work and cost/Con shares so a Constitution-specialized non-combat gatherer has a survivable, slower path; merely adding a tiny Constitution fraction to a high-work combat check can make it mathematically impossible at starter capacities. The inherited room cost/exact-final-tick, injury, migration, and ETA logic require regression tests. This text is proposed design, not a change to v8 gameplay.

---

# Assignment and run history — November 6, 2026

Each member has at most one repeating dungeon assignment, with a personal room cap. Assigning another destination replaces the waiting assignment; active destination, loadout and personal cap remain snapshotted. Waiting members are shown as Queued, separately from idle, healing and active expeditions. Dungeon headers display active/capacity followed by the waiting count, with a roster-ordered expanded list and live relevant stat pools. Active, disabled and healing members are excluded from that ready queue.

Each member stores per-dungeon farthest room and most recent return room/reason/detail/timestamp, independent of the compact event log. Reasons retain depth limit, resource exhaustion, injury, time limit, recall and carrying/missing-skill distinctions. A run tracks the last entered room so recall after clearing a room does not claim entry to the next. No old per-dungeon history is fabricated from the global best-room counter. Active older trips seed only observable current depth; historical outings show — until observed.

The deterministic weighted v7 engine remains current: no success RNG or generic Constitution drain, atomic weighted parent-pool payment, injury only on applicable Constitution exhaustion, walking home before healing, and uninjured immediate readiness. Earlier v6 formulas below are historical. New rarity/tier metadata does not change loot rates; joint rarity/tier/depth weighting remains deferred.

# Current dungeon engine — weighted seconds (save v7)

This section supersedes prior generated-room success-roll, retry, generic Constitution exertion and per-attempt cost descriptions below. Historical task/check engines remain for older prototype routes; the current Arya/Clyde opening uses weighted rooms.

Each authored check has a work requirement and weighted attribute contributions. Every one-second tick computes progress as the weighted sum of trained effective attributes (including existing parent fallback and equipment modifiers). It aggregates the same contribution weights into their parent resource pools and pays them once per second. Luck contributes progress without a consumable pool. The final tick pays in full. Room depth increases required work by 1.04^(room−1); costs per tick are not inflated separately.

Example: 75% Power + 25% Constitution, 300 work. Effective Power 100 / Constitution 10 gives 77.5 work each second and clears after four paid ticks: 3 Strength and 1 Constitution. Effective Power 200 gives 152.5 work and clears after two ticks: 1.5 Strength and .5 Constitution. Current resource depletion does not reduce the trained-value rate. No success roll occurs. Only room selection and eligible treasure finds are random. Costs are checked atomically before work; unaffordable ticks make no partial payment or progress. Exact funding of the final tick succeeds.

Constitution shortage during a funded-skill trap/combat encounter returns the member Injured. Other shortages return safely; missing mandatory skills return safely, and missing optional skills skip the opportunity. Injured members walk home, then use their existing recovery duration (currently 12 seconds). Current weighted-room fatigue, manual recall, cargo/room limits and time-limit returns have no healing delay or failed-dungeon log. Safe returns refill pools on arrival; healing completion refills injured members. Old fatigue-labeled failure history is hidden.

Arya starts with known Combat and Clyde with known Herbology. Other composite abilities stay undiscovered; checks do not spontaneously teach unowned skills. The boss requires Combat. Herbology alone gates herb access; there is no extra Perception minimum. Normal Catacomb rooms give one Chip. Boss completion reserves one Leather Scrap before any Chip reward. Treasure makes one eligible draw from Chips/Scraps/Herbs, with Herbs excluded without Herbology or sufficient carrying space. Early rooms do not drop Hides/Ore. All current rarity is Common.

Local-route ETA now forecasts a bounded isolated copy using the actual weighted engine and current RNG/state, without changing the real guild. It remains approximate because future assignment/action changes can affect the shared state. Carried drops, injury return state and partial work are validated/saved; v6 generated work is bounded into the new work requirement during migration.

# Dungeons and Expeditions — Current Rooms

Updated November 5, 2026. The new opening uses **rooms** as progression units; ten rooms represent a floor for flavor. Personal/global limits count rooms.

## Weighted room selection

Each dungeon owns group weights and a weighted room catalog within each group. Select a group, then a room within it. Catacomb group weights: Neutral 5, Combat 5, Trap 2, Puzzle 1, Boss 0.25, Treasure 2. Multipliers apply directly to weights, so doubling Trap doubles its relative rate. These are weights, not fixed percentages. Archive and delve have separate group distributions and room catalogs.

Neutral passages, scavenger combat, rusted snares, faded ritual puzzles, an oversized crypt beetle and forgotten caches/herb alcoves form the starter room catalog. Each room has ordered checks, applicable weighted attributes, a learned skill, optional minimum skill, costs, work and loot. Crypt Lore is a dungeon-specific skill.

Optional failure/ineligibility skips that room with no skill XP or loot. Mandatory failure retries the check; inability to fund required work returns the member home. All required resources must be affordable before work progresses. Successful checks alone award skill XP and pending attribute training. No death or punitive failure is introduced in these harmless starter catacombs.

## Difficulty and reward scaling

Difficulty and exertion grow **1.04^(room−1)**. Base room exertion is 0.063 Constitution × difficulty, reduced by equipped Constitution bonuses. Repeated check attempts also have small explicit resource costs. Loot budget is `1 + floor((room−1)/4) + a 0-or-1 roll`: linear progression, independent of exponential difficulty.

At full affinity, 100 seeded trials gave Clyde room 10, Arya room 20, and Clyde with Reinforced Leather Armor room 12. This comes from their pools and costs, not hardcoded character depth ceilings. Starting current maxima are lower, and optional/retry outcomes can affect individual results.

## Budgeted weighted loot

First roll a room’s integer budget, limited by remaining carrying capacity. Each draw selects among items that fit the remaining size, spends that item’s size and repeats. **Chips always remain a size-1, weight-1 fallback.** If budget 4 spends two size-1 Leather Scraps, size-3 Herbs become ineligible for subsequent draws. A Herb first leaves room for one size-1 result.

Resources carry rarity tiers; their relative weights improve smoothly with depth using `base weight × (1 + min(4,(room−1)/20) × rarity)`. Chips remain weight 1. Herbs need size 3 and Harvesting eligibility, with no hard depth gate: an early find is unlikely but possible once the budget fits. Arya cannot obtain herbs until she learns the required skill; Clyde starts able to harvest.

Loot, Chips and pending growth remain carried until arrival home. Cargo and storage have separate limits; overflow is discarded on deposit. See 03 for economy/caps and 02 for the fixed friends and stat budgets.

## Trips, persistence and future failure

Local outbound and return travel each take 15 game seconds. Travel is separate from exploration and 12-second recovery. Rooms, partial work, attempts, RNG, cargo, loadout and travel stages survive saves. The temporary 300-second exploration limit starts a safe return. Pausing/closed play does not advance timers.

Old active task/check routes preserve their rules on migration. Existing guilds can adopt room routes through the Arya/Clyde story action; current trips are not rewritten. A future death/revival timer should range from 4× toward 2× travel using a diminishing stat benefit, but death triggers and the governing stat remain undecided.

---

## Historical task-route contract

The following is retained for older saved outings only and is superseded by the room rules above for new departures using room routes.

# Dungeons and Expeditions

Updated November 5, 2026. Current bottomless-dungeon redesign supersedes fixed dungeon completion and daily expedition resets.

## Agreed mechanics

- Every dungeon is bottomless, with its own resource demands, activities and random loot pool.
- Each successive floor takes longer, demands more resources/activity effort, and offers greater rewards.
- Players can set a dungeon-wide maximum depth that applies to every adventurer.
- A member's dungeon assignment also has its own personal maximum depth. Both limits apply; the smaller limit determines where that member stops.
- The member carries dungeon rewards and brings them back when surviving the expedition.
- Current stats are depleted by tasks; zero forces retreat. Completed dungeon tasks train maximums toward affinity for later runs.
- Each member has an independent reset cooldown before departing again. A future member stat likely controls that delay.

## Current playable defaults (provisional)

One outing attempts one dungeon entry. Floor 1 uses the original task sequence; each later floor repeats those tasks with scale = 1 + 0.2 × (floor − 1). Each task duration rounds up after scaling. Stat drain and training use the scale without rounding. Floor gold rounds to the nearest integer. A completed floor rolls one weighted item type from that dungeon's pool, with quantity equal to the floor number.

Blank limits mean unlimited. Positive integer depth limits are validated. A cap edited during an active expedition applies at the next floor boundary: a member already partway through a floor finishes that floor first. Personal limits are snapshotted at dispatch; editing an assignment changes future outings. There is no content floor ceiling; the input guard of 1,000,000 is an implementation bound.

Loot and gold stay in carried state until return. Growth is applied once on return from completed, survived tasks using the run's starting maximum. Survived floors are counted when cleared, independently from when loot is banked.

Return reasons: reached depth, stat retreat, manual recall, or the temporary 300-second exploration timer. Each reason starts the return journey; reset begins after arriving home. Travel does not consume the exploration timer. Returns reset only that member; midnight does not recall anyone. All current returns retain previously earned loot/training. Incomplete/lethal tasks do not grant training or floor rewards. Successful final-task resolution precedes timeout; lethal resolution precedes reward. Depth completion at the timer boundary is logged once as successful return.

Reset is temporarily 12 seconds per member. Current stats refill on the next dispatch. Dispatch consumes the dungeon's gear cost once per outing. Gear regenerates continuously, up to guild capacity. Gear refunds and a separate supplies pool are not implemented.

See 06-queues-and-assignment.md for continuous scheduling and 10-game-interface.md for controls.

## Future agreed direction

A separate dungeon failure mechanic will drop a percentage of the member's carried loot, automatically warp them to the guild, and impose a longer recovery/reset. Loot retention may depend on a member stat. Distinguish this future failure from the current safe retreat/recall behavior. Percentage, stat, trigger and cooldown multiplier are undecided; no penalties are enabled now.

An early successful return may return unused Gear/Supplies, speeding the next departure. Exact reservation, consumption and refund rules remain open. Do not mint refunded resources until that accounting is designed.

## Open decisions

Final scaling curves, activity variation at depth, rating semantics, unlock progression, reward uses, default depth policies, warp duration, recovery stats, failure triggers/retention and Gear/Supplies accounting remain to be designed. All present dungeon names, ratings, costs, distributions and timings are prototype content.

## Skill-check resource exhaustion — Agreed next-design rule

This rule is implemented for the skill-check routes in the 0.3 foundation. Classic fixed-task routes remain available for existing saves; already active routes preserve their saved rules.

- Whenever check progress or an attempt requires resources, verify the member can pay the required costs from every contributing core attribute/resource pool.
- If a required resource is exhausted or insufficient to pay the next required cost, the member gives up the check and returns to the guild. No free attempts, unpaid progress, or negative resources.
- A positive balance may still be insufficient: 2 Dexterity cannot pay a required cost of 3 Dexterity.
- Finger Dexterity consumes the underlying Dexterity pool, not an additional child pool. Checks involving multiple core resources require all their costs.
- Giving up does not complete the check or award its success reward. Resource-based return is distinct from future penalized failure; do not automatically add loot-loss or longer-reset penalties.
- Per-second versus per-attempt charging remains open. Enforce affordability at every actual charging point.

Future gear may convert resources inside dungeons, potentially based on affinities. Rates, triggers, affinity effects and gear requirements remain undecided. No conversion or automatic resource substitution is available initially.

## Prepared sample check route

The archive can use a three-stage trap room: notice, find the trigger, disarm. Work, payment, rolls, failure tables, learned skills and return behavior are implemented. All three checks must succeed before awarding floor loot. Pending specialization growth applies on return, while skill practice can improve during the outing. See 11-progression-and-check-foundations.md for provisional formulas, current rollout and save behavior.


## Locations, travel and trade foundations

Guild Loops is inspired by Threadless roughly a thousand years later. Emberveil is a small settlement beginning to revive. The first dungeon display name is Ritual Catacombs; the existing `wood` content ID remains stable for saves. Location flavor is an adaptation, not a change to campaign canon.

`src/locations.ts` owns location IDs, names, descriptions, travel durations and trade durations. Each dungeon references its location; the guild has a home location. Local outbound and return legs each take **15 game seconds**. Each route snapshots its origin, destination and both durations at dispatch, independently of later queue changes. Locations currently have no relocation or town-growth controls; existing plot progression gates access to their dungeons.

An expedition follows outbound → exploring → returning → home/reset. It occupies its member and an expedition slot throughout travel. Outbound travel performs no checks or floor work. The 300-second limit measures exploration only. Depth completion, depletion, manual return and time limit all start return travel. Manual return during outbound uses the full return leg; returning again cannot restart or skip its timer. Midnight does not interrupt a trip. Carried loot, gold and pending attribute training settle once on arrival, then the existing 12-second recovery starts. Learned skill practice retains its existing during-exploration behavior.

Resources → Trade supports quantity-based sales. Starting a sale removes the committed inventory immediately and creates an independent trade timer; gold is credited once after **15 game seconds**. Multiple sales can proceed concurrently (100 pending trades maximum), with no adventurer or expedition slot requirement. Current per-item prices in `SALE_VALUES` are provisional test values, separate from timing. Price and duration are snapshotted for pending sales. Shop purchases and town-development balancing are separate pending work.

All timers use the normal game clock: pausing freezes them; game speed affects them; closed/hidden play does not advance them. Schema v4 stores journeys and trades. Older active outings migrate in place as exploring, without replaying outbound travel or losing carried rewards, then use the new return leg. New fields and timers are validated on save/import.

## Per-dungeon capacity — November 5, 2026

Every authored dungeon has maxConcurrent, currently 1 for each. Outbound trips reserve a place, exploration keeps it, and starting home frees it for the next eligible member in roster order. The independent guild expedition cap still includes homeward trips. Members waiting for a full dungeon stay idle; their queue entry is not skipped. Active saved trips are retained and stop further departures while at/above cap.

## Compact dungeon event policy

Only assignment additions/removals, failed dungeon returns, successful boss-room completions and successful treasure-room completions enter Dungeon history. Optional skips, attempts, retries, normal room clears, travel and successful routine returns do not. Reward events store actual full-room drops, independently of display text; unfinished/skipped rooms do not receive a clear event. Manual recall and cargo/depth/time-limit returns are not marked failed. A resource-exhaustion retreat is marked failed once on arrival, using the shared healing icon. Display rarity is Common for all current rooms and drops; probability weighting remains independently tuned.
