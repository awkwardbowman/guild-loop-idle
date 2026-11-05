# Next Phase

Updated November 5, 2026 after Maya requested a game-focused redesign. The old dashboard/60-second-day pacing plan is superseded.

## Current priorities

1. Maya playtest of the 2:8:2 game layout and continuous dungeon/reset loop. Validate whether density, status and queues suit actual play.
2. Real mobile/touch-device validation and keyboard navigation, especially narrow queue/depth editors. Desktop browser verification is recorded in 08.
3. Vercel deployment when its connection is available; no database needed.
4. Decide how dungeon loot feeds guild progression. Inventory currently accumulates with no crafting sink.
5. Tune floor time/cost/reward scaling, initial member stats, gear throughput and cooldowns from observed play. Current numbers are placeholders.

## Future groups requiring design first

- Failure: trigger, lost-loot percentage/retention stat and longer-reset formula.
- Gear/Supplies returned on early successful completion: reservation/consumption/refund accounting.
- Traits: influence stats and properties; Pampered example recorded in 02, benefit unspecified.
- Member reset stat and guildmaster affinity skill tree.
- Internal assignment/training activities.
- Dungeon discovery/unlocks, rating semantics and floor activity variation.
- Affinity assignment filters and queue fairness under scarce supplies.
- Optional cloud sync and offline simulation, separately designed. Local saves remain complete.

For each group: build → write meaningful test cases → validate and fix → play main game → update reports and next steps.
