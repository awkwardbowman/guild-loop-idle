# True-zero Attributes, minimum eligible progress and display precision — November 6, 2026

Non-selected/unknown Attributes now have **real effective value 0**, replacing the former 0.01 fallback. Missing weighted check components are zero; no weight is redistributed. Only **after** calculating the full check's effective rate and verifying its explicit prerequisites, the generated-room engine applies `max(0.001, effectiveRate)`. Ineligible actions remain at zero work and follow the authored skip/failure rules. Legacy check rooms use the same 0.001 minimum check-speed safeguard. The shared `src/numbers.ts` helper formats visible stat/Skill/endurance/efficiency values to **at most two decimal places** (no padded trailing zeros) while preserving full precision in gameplay and saves. Selected root fallback (`max(1, maximum)`), owned Skill Value, Constitution XP increments and Soul/Constitution eligibility remain unchanged.

# Current PR #7 / save v9 contract — November 6, 2026

The full specialization/endurance/settings scope is implemented. Maya authorized provisional choices for character axes, growth, Composite prerequisites, gear stacking and recall failure. Leather crafting recipe execution stays deferred. Earlier contracts below describe historical versions only where they conflict with this section.

## Character values and training

`specialization.ts` owns persisted five/five selections, authored Skill ownership, missing-Skill fallback, Potential, matrix/totals, discipline sums and Composite prerequisites. Fixed picks are listed in [02](02-adventurers-and-stat-growth.md). Recruits choose strongest-five root affinities and densest-five authored Disciplines deterministically without extra RNG, guaranteeing a Constitution Skill when Constitution is chosen. Picks do not change during normal play.

Owned Skill Value = `1 + saved specialized training`; Potential = `1 + saved specialized affinity`. Selected root fallback = `max(1, saved root.max)`; unselected fallback = `0`. No weight renormalization. On success, only owned pairwise Skills and selected roots earn 0.01×contribution-weight pending training, applied through the existing capped growth function on home arrival. Composite XP (2 per success) and new lessons require all authored component Skills; existing learned abilities remain stored and usable. No action gains eligibility from gear.

One general Constitution XP per successfully completed canonical floor (ten rooms, no skips) adds `0.01 × total XP` to each owned Constitution Skill's Value and Potential. It is committed once at the boundary and survives reload, increases future derived capacity, and grants neither Skill XP nor root-stat consumption. A migrated partial floor starts its success counter at zero, preventing retroactive bonuses.

## Work and endurance

Gear: strongest Catchup N applies `max(V,(V+N)/2)`, then sum flat bonuses, then multiply by `1 + sum(percent bonuses)`. Apply after capability fallback, independently per check contribution. Capacity sums only owned Constitution Skills with the same modifiers. The run stores `{current,max}` separately from all nine root stats. A paid room second costs `0.05 × (1 + 0.2 × (canonicalFloor-1))`; canonical floor = `floor((room-1)/10)+1`. Every room uses this drain, including optional attempts. An unaffordable tick performs no work; an exactly funded completion succeeds. Faster work pays fewer seconds. Generated rooms no longer drain parent pools or require Combat Composite.

Room content must supply `failure: injury|return` and positive `referenceRate`; current benchmark is provisionally 10 work/second. Trap/boss failure injures and heals after home arrival; other authored failures force return without injury. Previously completed cargo/training stays; incomplete work grants no loot/XP. Loss/death/revival remain deferred. Pure `roomCheckStep` computes work and successful practice; `tickGenerated` owns endurance, timers and failure resolution. No Speed-based interval modifier currently exists.

## Timers, settings and boundary precedence

Global `{depthLimit:null,skillThreshold:1}`; absent per-dungeon keys inherit, explicit null Depth Limit means Unlimited and explicit zero threshold disables it. No individual caps are persisted. Depth Limit counts rooms and applies before room entry/after room completion; a live lowered cap never cuts an active room short.

Efficiency at room entry is `sum(work) / sum(work/effectiveRate) / room.referenceRate` across ordered checks. Work difficulty scales both actual and reference completion time and cancels. It uses real fallback/modifiers, independent of personal Potential. Low-skill is strict `< threshold/100`. Store `roomStartedAt`, `roomEfficiency` and `lowSkill` once; 30 elapsed game seconds of incomplete work invokes the current room's authored failure. Later settings apply at the next room entry.

Store `recallRequestedAt` independently. Ordinary recall returns after the next completed ten-room boundary. Already outbound or between full floors can return immediately. At 30 seconds, an incomplete room invokes its failure; a room completed on that tick retains its reward but a partial-floor return is labeled Interrupted and receives no full-floor XP. Order: fund work → resolve successful check/room and any full-floor XP → safe recall/depth exit → low-skill timeout → exceptional recall → depleted-at-room-boundary return → historical ward timeout. A resolved outing cannot fail or reward again. Cargo and ward exits remain separate.

## Save contract and compatibility

v9 validates five unique known axes, nonnegative integer Constitution XP, separate meter bounds, settings/override ranges, and recall/entry timestamps within saved outing time. Current saves reject retired personal/assignment cap fields. v0–v8 migration preserves raw stats, trained specializations, learned Composite records, active work, loot, RNG, travel, trade clocks and history. Each old per-dungeon cap is preserved as an override; missing global default is Unlimited. Unequal member caps are dropped rather than combined. Active room capacity preserves the old CON current/max fraction; current-room grace begins at migration time; full-floor success counter starts at zero. No refill or retrospective floor reward occurs.

Historical task/check outings retain their original work and resource rules, and migrate to the new shared limit settings. All new generated outings use the v9 work/endurance system. No new backend, sync, offline progression, recipe execution, death or revival is added. Balance and the numeric defaults above remain provisional.


---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Current Room and Progression Contract — v6

November 5, 2026. The accepted opening supersedes the historical single-friend/task-route content below.

- `resources.ts`: resource sizes/caps, currency naming, rarity weights, budgeted loot and exponential storage prices.
- `rooms.ts`: six group types, two-stage weighted selection, dungeon room/check catalogs, optional/mandatory resolution, affordability, success-only skill XP and generated-room state.
- `equipment.ts`: shared unlock templates, stat bonuses, carry bonuses and absolute shop capacity ceilings.
- `engine.ts`: fixed Arya/Clyde, 10^tier recruit budgets, room-step integration, cargo/deposit overflow, shop/cap purchases, snapshot loadouts and story transitions.
- `GuildPanel.tsx` / `ShopsPanel.tsx`: new guild subtabs, per-resource storage purchases and Gavin/Stillmere shops.
- `persistence.ts`: v6 validation and historical migration. Old Gold maps to Chips, new skills default safely, existing stocks receive preserving caps, old profiles/trips keep their values/rules. Generated room ID/index/work/attempts and cargo/loadout snapshots are validated.

The shared nine roots / nine groups / 27 attributes remain unchanged. No child resource pools or passive new-guild regeneration are added. Legacy task/check routes continue to use their saved rules, and can be opted out of through the new story path for future departures.

---

## Historical foundations and retained APIs

# Progression and Check Foundations — Current

November 5, 2026. Functional preparation based on Maya's accepted design; numerical rules below are provisional implementation choices. This is a game-specific system inspired by D&D attributes, not an implementation of official D&D rules.

## Implemented boundaries

The framework is executable: saved progression, guarded unlocks and feature visibility, Story threads/actions, member profiles, attribute fallback, learned skills, work and costs, success rolls, failure tables, check-room sequencing, dungeon return/rewards and save migration. The archive demonstrates the complete system. The accepted main-stat/attribute matrix is now implemented; plot, content scaling, traits, decay, resource conversions and guildmaster spells/skill-tree actions remain incomplete.

## Saved event facts and derived unlocks

`progression.completed` maps stable event IDs to `{day,time}`. First completion wins; repeat events/actions cannot regrant unlocks or rewrite timestamps. Feature visibility and dungeon eligibility are derived from definitions, not independent saved booleans. Backend dispatch, priorities, upgrades and queue editing enforce the same gates as UI visibility.

Temporary opening sequence:

| Fact/action | Result |
|---|---|
| No completed events | Story only; no roster, hidden tabs or running clock |\n| Open the guild | Guild and utility Info become available |
| Welcome your friend | Guaranteed first member; Members available |\n| Open recruitment | Recruitment work enabled for additional members |
| Founding friend joined | First expedition goal available under Current Goals |
| Explore the Ritual Catacombs | Activities and Ritual Catacombs available |
| Return from first outing | Resources and Infrastructure available |
| Clear first floor, investigate archive | Archive, member skill display and archive trap checks available |
| Clear archive floor, survey ridge | Emberstone Delve available |

New story entries are authored in `progression.ts`: stable ID, thread, prerequisites, completion event, title and description. Automatic milestones are recorded at actual game transitions. Cosmetic text is separate from ID identity. These story controls are functional scaffolding, not final plot.

## Attributes and skills

`ATTRIBUTES` is a data-defined parent tree. Every root maps to a resource pool; children cannot declare another pool. Validation rejects cycles, missing ancestors and duplicate IDs. The accepted nine roots and 27 branches are centrally defined in attributes.ts, with three branches per root and per activity grouping.

The UI and engine now use all nine main stats. Legacy Might/Agility/Focus map to Strength/Dexterity/Intelligence. Finesse migrates to Finesse. Each root can be configured as consumable or modifier; Luck is non-consumable and resource-charge validation rejects Luck costs. There is no Physical wrapper.

Root capability uses the member's persistent maximum, not its depleted current balance. Specializations have a trained value and an individual affinity ceiling, with no Current resource field. Their starting ceilings temporarily copy the mapped root's affinity; rolled root identity is retained. No feature raises affinity in this preparation.

Provisional recursive fallback at retention `r`:

`effective(child) = own(child) + r × max(0, effective(parent) − own(child))`

An empty child under 100 parent at 50% retention gets 50; an empty grandchild gets 25. Child 40 under parent 100 gets 70. Perfect child 100 under parent 100 remains 100, not 150. General capability units and behavior across unequal caps require later balance review.

Every learned skill stores level (0–99), experience and last-used game-second timestamp. Definitions link weighted attribute contributions and a specialization retention ratio. Current samples: Observation, Investigation and Lock Picking. Lock Picking uses 75% Finesse and 25% Design. Disuse metadata is recorded during funded work; decay is explicitly disabled.

Temporary practice thresholds: next level costs `10 × (current level + 1)` XP. Successful checks grant 2 XP to each distinct contributing skill; level 99 retains zero overflow XP. Failed attempts record use without granting success practice. These are test defaults, not a final training design.

## Independent check channels

A check defines three separate weighted skill channels: speed, success and efficiency. Each channel has a base value, an attribute coefficient and a learned-level coefficient. Skill attribute power is its weighted effective attributes divided by 100; learned power is level/99. Weights within each channel sum to one.

`channel = base + attributeFactor × weightedAttributePower + levelFactor × weightedLearnedPower`

- Speed is work/second, with a minimum 0.001 **for eligible checks**; an ineligible check still cannot progress.
- Success chance is clamped to the check's configured minimum and maximum.
- Efficiency is at least 1; resource costs divide by this value.

The archive's disarm speed draws on Investigation (Intelligence), success draws on Lock Picking (mostly Finesse), and resource efficiency draws on Lock Picking's learned level. Faster attempts and reliable attempts are therefore separate capabilities.

## Resource charging and resolution

A check has a total resource amount, weighted attribute distribution and charging mode (`attempt` or `second`). Mapping each contribution to its root combines costs if multiple branches use the same pool. There is no separate skill/child resource bar.

`root cost = sum(total amount × floor scale × contribution weight / efficiency)`

All required pools must afford the charge before any work or roll. Insufficient resources cause immediate return, even at a positive balance. No unpaid work, free attempts or negative balances are allowed. Exact depletion charges to zero and returns before a success roll, matching the zero-stat retreat rule. Cost mode is defined per check; per-second mode is tested, while the sample archive charges per attempt. Retry cooldowns do not charge work costs.

Each game tick can advance work and resolve at most one check. Surplus work is discarded at an attempt boundary. On success, advance the room; on failure, select a weighted outcome. Supported outcomes: retry, cooldown, alternate check with explicit index, core-resource damage, gear loss and return. The sample enables retries, reassessment cooldowns and minor Dexterity injury. It does not enable punitive loot-loss failure.

Room state saves check index, work, cooldown, attempts, status and last outcome. A floor rewards loot only after all three trap checks succeed. Seeded rolls are part of the game's saved random state. Completed check training is retained if a later check causes retreat. Core and pending specialization growth are applied on return toward affinity; learned practice can increase during an outing.

## Live integration and compatibility

Fresh games enable the trap route when the archive is discovered. Existing v0–v2 saves receive `legacy_access`, retaining formerly available content and rosters. Story → Current Goals → Train for trap rooms lets an existing guild enable the new archive route for future departures. Each active run snapshots its task/check rules; changing unlocks does not rewrite an in-progress route. No reset is required.

Legacy task routes remain as the other sample dungeons. Check-room floors scale work, cost, damage and training with the existing linear floor multiplier. Their return estimates are marked ~; they are planning estimates, not predictions of random outcomes.

## Historical save v3

Version 3 adds progression facts, skill profiles, specialties, active room state, run rule snapshots and pending specialization training. Existing storage keys remain stable, so deployed saves can be found. v2 migration preserves seed, roster, existing task position, current stats, carried loot, inventory, depth caps and cooldowns; new profile fields initialize without consuming RNG. v0/v1 first undergo their existing safe-return conversion, then receive v3 fields. Unknown future versions and invalid event/skill/specialty/check state are rejected. Backup recovery remains available.

## Source ownership

| File | Responsibility |
|---|---|
| `src/progression.ts` | Stable events, unlock predicates, story actions and visible tabs |
| `src/skill-system.ts` | Attribute/skill/check definitions, validators, fallback, charging and room stepper |
| `src/engine.ts` | Recruitment profiles, guarded actions, dungeon integration, seeded rolls, returns |
| `src/persistence.ts` | v3 validation, historical migrations, export/import and backups |
| `src/StoryPanel.tsx` | Current Goals and chronological Plot with unlock destinations |
| `src/SkillPanel.tsx` | Skill practice and specialization display |
| `src/DungeonPanel.tsx` | Dungeon details reflecting current route rules |
| `tests/foundations.test.ts` | New progression, fallback, checks, migrations and whole-game cases |

## Next design work

Choose real opening plot and content beats; additional learned skills and activity uses; skill catalog/practice rates; scaling, cost and success formulas; affinity ceilings; decay; traits; gear conversion; failure penalties and resource refunds. Every addition should reuse definitions, include a save migration when needed, and pass a whole-game scenario before release.

## Story subtabs — Current Goals and Plot

Story now has two fixed top-level subtabs:
1. **Current Goals** shows actionable unlocks and ongoing goals (recruit a member, clear a floor, return home, clear the archive). Every goal states where to act. Completed goals leave the current list.
2. **Plot** is the durable chronological account of completed milestones and unlocks. Each entry shows the saved day/time, what changed, exact tab/panel locations and buttons to open the relevant main tab. Story destinations open Current Goals; Activities destinations open Dungeons.

This replaces the previous Guild/Expeditions Story thread selector. Future content threads can be grouped within these two views. Plot is derived from saved progression facts, not the bounded live event log, so old milestones remain after the log rolls over. Uncompleted future milestones stay hidden. No new save fields or migration are needed. Existing migrated guilds show their retained access without inventing historical completion events.

Source: src/story.ts provides goal/history projections and location metadata; StoryPanel.tsx renders the views.

## Opening revision

The grounded premise and opening gates are authoritative in 01-concept-and-core-loop.md. A fresh progression object has no completed events. Existing v3 saves with an established guild retain access. The friend grant is a guarded story action; normal applicants cannot become the first member in a fresh game. No schema fields changed. Unfounded state must contain no members, candidate or active runs and must remain in planning.\n

## Current schema v5 and training

See 02-adventurers-and-stat-growth.md for the accepted matrix and provisional defaults. All member/candidate/guildmaster profiles contain nine roots and 27 attributes. Guildmaster stats are separate from the roster and innate magic access is gated to the guildmaster ID. No spell action is introduced by this foundation.

Successful checks collect pending training for contributing specialization attributes, taking the strongest contribution per attribute across speed/success/efficiency so the same use is not counted three times. Explicit authored training can supply a higher amount. Training applies once on arrival home, with the existing diminishing affinity-gap formula. Failed checks grant no successful attribute practice. Learned skill experience still updates during exploration.

The archive now draws on Observation/Scouting for noticing, Planning/Observation for investigation, and Finesse/Design for lock picking; resource costs resolve to their root pools. Checks can reference any accepted attribute without creating a child resource pool.

Schema v5 migrates v0–v4, preserving historical roots, learned skills, old Finesse training, active routes/loot and pending trades. New fields initialize deterministically. Journey/trade behavior is described in 04. Stats/profile completeness, attribute ceilings, non-consumable behavior and guildmaster identity are validated.


## Dungeon profile authoring

`src/dungeon-profiles.ts` owns unique ordered planning check profiles, positive normalized per-check importance and per-attribute weights, aggregate attribute mixes and an advisory member-fit function. Definitions only accept the shared 27 specialization IDs; malformed/duplicate weights fail validation. The archive derives its profile from the actual check channels; starter/delve profiles prepare their future bespoke check routes while retaining existing fixed-task gameplay. Planning profiles do not rewrite resource costs or success probabilities. Additional dungeon mechanics should reuse these attributes and author unique live checks separately.
