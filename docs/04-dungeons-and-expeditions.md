# Dungeons and Expeditions

Updated November 5, 2026.

## Dungeon definitions — Agreed direction

Each dungeon has different resource requirements. Dungeon tasks determine which adventurer stats are used and trained. A dungeon also has its own loot pool.

The exact resource model is open: requirements may involve stat depletion, guild support, or both. Do not assume every dungeon shares the same costs or training profile.

## Individual runs — Agreed

- Each adventurer undertakes their own loops.
- Each run has a limited amount of time before the adventurer must warp home.
- Current stat values are consumed during the run.
- Any stat reaching zero forces a retreat.
- Training grows maximum stats for future runs toward the adventurer's affinities.
- Successful runs bring back random loot from that dungeon's pool.

## Return reasons

| Reason | Trigger | Known result |
|---|---|---|
| Success | Dungeon completion condition is met | Return random loot from the dungeon pool; stat progression benefits later runs |
| Retreat | Any current stat reaches zero | Run ends; loot and training retention rules still open |
| Timed warp | The adventurer's allowed expedition time expires | Adventurer warps home; partial reward and training rules still open |

Retreat and timed warp are not currently defined as death or permanent loss. There is no approved death mechanic.

## Tasks and assignment — Partially specified

Task-specific depletion and training support matching recruits to dungeons. The exact stat list has not been chosen. Strength, Endurance, and Perception were illustrative examples only.

An ordered guild-member dispatch queue is required for the initial setup: members are considered at the start of a day in player-defined order. Future assignment preferences include dungeon minimum/maximum Stat Affinity thresholds, skipping nonmatching members before assigning a dungeon. See 06-queues-and-assignment.md.

The initial setup also requires a basic ordered dungeon queue per adventurer, with simple add/remove/reorder controls and no advanced rules. Queue advancement and restart behavior remain open. This does not require queues for individual actions inside a dungeon. Automatic repeat, manual recall, and executing multiple dungeon entries in one run remain undecided.

## Loot — Agreed direction

Successful dungeon completion rolls from that dungeon's loot pool. Exact item types, drop weights, number of rolls, rarity, duplicate handling, inventory capacity, and uses of loot are open.

## Resolution questions

- What counts as dungeon completion: a fixed task sequence, progress threshold, boss, or another condition?
- Can a dungeon be completed several times within one run?
- If the final task depletes a stat to zero, does retreat take precedence over completion?
- If completion coincides with the time limit, which result takes precedence?
- Are task costs deterministic, random, or partially revealed?
- Can adventurers cooperate in parties, or are all assignments solo?
- Is the warp limit independent from all stat pools?
- How do guild gear costs apply at dispatch, during tasks, and at return?
- Does time advance while the app is closed, and what are the limits?
