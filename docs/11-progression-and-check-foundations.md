# Progression and Check Foundations — 0.3

November 5, 2026. Functional preparation based on Maya's accepted design; numerical rules below are provisional implementation choices. This is a game-specific system inspired by D&D attributes, not an implementation of official D&D rules.

## Implemented boundaries

The framework is executable: saved progression, guarded unlocks and feature visibility, Story threads/actions, member profiles, attribute fallback, learned skills, work and costs, success rolls, failure tables, check-room sequencing, dungeon return/rewards and save migration. The archive demonstrates the complete system. This does not finalize plot, the whole attribute list, content scaling, traits, decay, resource conversions or the guildmaster skill tree.

## Saved event facts and derived unlocks

`progression.completed` maps stable event IDs to `{day,time}`. First completion wins; repeat events/actions cannot regrant unlocks or rewrite timestamps. Feature visibility and dungeon eligibility are derived from definitions, not independent saved booleans. Backend dispatch, priorities, upgrades and queue editing enforce the same gates as UI visibility.

Temporary opening sequence:

| Fact/action | Result |
|---|---|
| Guild founded | Story (00), Guild and utility Info visible; no starting roster |
| Open recruitment | Recruitment work enabled |
| Accept first recruit | Members and Expeditions story thread available |
| Survey outskirts | Activities and Briarwood Trail available |
| Return from first outing | Resources and Infrastructure available |
| Clear first floor, investigate archive | Archive, member skill display and archive trap checks available |
| Clear archive floor, survey ridge | Emberstone Delve available |

New story entries are authored in `progression.ts`: stable ID, thread, prerequisites, completion event, title and description. Automatic milestones are recorded at actual game transitions. Cosmetic text is separate from ID identity. These story controls are functional scaffolding, not final plot.

## Attributes and skills

`ATTRIBUTES` is a data-defined parent tree. Every root maps to a resource pool; children cannot declare another pool. Validation rejects cycles, missing ancestors and duplicate IDs. The final D&D-like roots and branches are not selected.

For compatibility with existing saves, the demonstration maps Strength → Might, Dexterity → Agility and Intelligence → Focus. The existing three resource pools remain in the interface. Finger Dexterity is the sample child of Dexterity. Adding Constitution or other independent pools is a later content/schema change, not silently completed here. There is no Physical wrapper.

Root capability uses the member's persistent maximum, not its depleted current balance. Specializations have a trained value and an individual affinity ceiling, with no Current resource field. Their starting ceilings temporarily copy the mapped root's affinity; rolled root identity is retained. No feature raises affinity in this preparation.

Provisional recursive fallback at retention `r`:

`effective(child) = own(child) + r × max(0, effective(parent) − own(child))`

An empty child under 100 parent at 50% retention gets 50; an empty grandchild gets 25. Child 40 under parent 100 gets 70. Perfect child 100 under parent 100 remains 100, not 150. General capability units and behavior across unequal caps require later balance review.

Every learned skill stores level (0–99), experience and last-used game-second timestamp. Definitions link weighted attribute contributions and a specialization retention ratio. Current samples: Observation, Investigation and Lock Picking. Lock Picking uses 75% Finger Dexterity and 25% Intelligence. Disuse metadata is recorded during funded work; decay is explicitly disabled.

Temporary practice thresholds: next level costs `10 × (current level + 1)` XP. Successful checks grant 2 XP to each distinct contributing skill; level 99 retains zero overflow XP. Failed attempts record use without granting success practice. These are test defaults, not a final training design.

## Independent check channels

A check defines three separate weighted skill channels: speed, success and efficiency. Each channel has a base value, an attribute coefficient and a learned-level coefficient. Skill attribute power is its weighted effective attributes divided by 100; learned power is level/99. Weights within each channel sum to one.

`channel = base + attributeFactor × weightedAttributePower + levelFactor × weightedLearnedPower`

- Speed is work/second, with a minimum 0.01.
- Success chance is clamped to the check's configured minimum and maximum.
- Efficiency is at least 1; resource costs divide by this value.

The archive's disarm speed draws on Investigation (Intelligence), success draws on Lock Picking (mostly Finger Dexterity), and resource efficiency draws on Lock Picking's learned level. Faster attempts and reliable attempts are therefore separate capabilities.

## Resource charging and resolution

A check has a total resource amount, weighted attribute distribution and charging mode (`attempt` or `second`). Mapping each contribution to its root combines costs if multiple branches use the same pool. There is no separate skill/child resource bar.

`root cost = sum(total amount × floor scale × contribution weight / efficiency)`

All required pools must afford the charge before any work or roll. Insufficient resources cause immediate return, even at a positive balance. No unpaid work, free attempts or negative balances are allowed. Exact depletion charges to zero and returns before a success roll, matching the zero-stat retreat rule. Cost mode is defined per check; per-second mode is tested, while the sample archive charges per attempt. Retry cooldowns do not charge work costs.

Each game tick can advance work and resolve at most one check. Surplus work is discarded at an attempt boundary. On success, advance the room; on failure, select a weighted outcome. Supported outcomes: retry, cooldown, alternate check with explicit index, core-resource damage, gear loss and return. The sample enables retries, reassessment cooldowns and minor Agility injury. It does not enable punitive loot-loss failure.

Room state saves check index, work, cooldown, attempts, status and last outcome. A floor rewards loot only after all three trap checks succeed. Seeded rolls are part of the game's saved random state. Completed check training is retained if a later check causes retreat. Core and pending specialization growth are applied on return toward affinity; learned practice can increase during an outing.

## Live integration and compatibility

Fresh games enable the trap route when the archive is discovered. Existing v0–v2 saves receive `legacy_access`, retaining formerly available content and rosters. Story → Current Goals → Train for trap rooms lets an existing guild enable the new archive route for future departures. Each active run snapshots its task/check rules; changing unlocks does not rewrite an in-progress route. No reset is required.

Legacy task routes remain as the other sample dungeons. Check-room floors scale work, cost, damage and training with the existing linear floor multiplier. Their return estimates are marked ~; they are planning estimates, not predictions of random outcomes.

## Save v3

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

Choose real opening plot and content beats; final root pools and attribute tree; skill catalog/practice rates; scaling, cost and success formulas; affinity ceilings; decay; traits; gear conversion; failure penalties and resource refunds. Every addition should reuse definitions, include a save migration when needed, and pass a whole-game scenario before release.

## Story subtabs — Current Goals and Plot

Story now has two fixed top-level subtabs:
1. **Current Goals** shows actionable unlocks and ongoing goals (recruit a member, clear a floor, return home, clear the archive). Every goal states where to act. Completed goals leave the current list.
2. **Plot** is the durable chronological account of completed milestones and unlocks. Each entry shows the saved day/time, what changed, exact tab/panel locations and buttons to open the relevant main tab. Story destinations open Current Goals; Activities destinations open Dungeons.

This replaces the previous Guild/Expeditions Story thread selector. Future content threads can be grouped within these two views. Plot is derived from saved progression facts, not the bounded live event log, so old milestones remain after the log rolls over. Uncompleted future milestones stay hidden. No new save fields or migration are needed. Existing migrated guilds show their retained access without inventing historical completion events.

Source: src/story.ts provides goal/history projections and location metadata; StoryPanel.tsx renders the views.
