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
