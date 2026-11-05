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

Return reasons: reached depth, stat retreat, manual recall, or the temporary 300-second per-outing warp timer. Returns reset only that member; midnight does not recall anyone. All current returns retain previously earned loot/training. Incomplete/lethal tasks do not grant training or floor rewards. Successful final-task resolution precedes timeout; lethal resolution precedes reward. Depth completion at the timer boundary is logged once as successful return.

Reset is temporarily 12 seconds per member. Current stats refill on the next dispatch. Dispatch consumes the dungeon's gear cost once per outing. Gear regenerates continuously, up to guild capacity. Gear refunds and a separate supplies pool are not implemented.

See 06-queues-and-assignment.md for continuous scheduling and 10-game-interface.md for controls.

## Future agreed direction

A separate dungeon failure mechanic will drop a percentage of the member's carried loot, automatically warp them to the guild, and impose a longer recovery/reset. Loot retention may depend on a member stat. Distinguish this future failure from the current safe retreat/recall behavior. Percentage, stat, trigger and cooldown multiplier are undecided; no penalties are enabled now.

An early successful return may return unused Gear/Supplies, speeding the next departure. Exact reservation, consumption and refund rules remain open. Do not mint refunded resources until that accounting is designed.

## Open decisions

Final scaling curves, activity variation at depth, rating semantics, unlock progression, reward uses, default depth policies, warp duration, recovery stats, failure triggers/retention and Gear/Supplies accounting remain to be designed. All present dungeon names, ratings, costs, distributions and timings are prototype content.
