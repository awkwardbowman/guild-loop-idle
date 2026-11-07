# Next phase after PR #7 — November 6, 2026

The full five/five specialization, Skills grid/totals, separate endurance, full-floor Constitution growth, queued recall, insufficient-skill room grace and shared dungeon settings scope is implemented for review in save v9. Maya authorized the provisional details. See [11](11-progression-and-check-foundations.md) for formulas/migration and [08](08-test-report.md) for executed validation.

## Small content slice — November 6, 2026

The Whispering Archive and Emberstone Delve now have individually authored names for all eight existing room templates instead of prefixed Catacombs room titles. This is **flavor only**: room IDs, check skills and weights, drop tables, failure outcomes, difficulty and save semantics are unchanged. Existing O03 tests now guard distinct names and preserved mechanics. Additional specialized checks, location-specific room structures and balance remain future work.

1. Playtest/tune the provisional five/five picks, baseline-plus-training values, 0.05 endurance rate, 10-work/second room benchmark and 0.01-per-floor-XP Constitution growth. Test early characters under room limits below ten: these intentionally receive no full-floor bonus; normal successful-check practice still applies.
2. Define Leather Crafting's recipe inputs, outputs and duration, then implement recipe execution. The lesson, learner and purchase gate exist; recipes remain deferred as requested.
3. Design Potential reveal, additional Composite teaching/prerequisites, generated character balance and rarity/tier stat budgets. Existing trained points and learned abilities are preserved; no respec flow is introduced.
4. Author more varied room failures/content and any loot loss, death, revival or recovery-stat rules before adding them. Current outcomes are explicit forced-return or injury, retaining completed cargo.
5. Define future Speed tick intervals, Scouting and Movement action bonuses, later training/decay, gear variants and magic. Formula hooks support Catchup/Flat/Percent, but no new gear items or tick interval mechanics are implied.

Current storage, shops, request pacing, single assignments, queues/history, discovered Composites and independent rarity/tier data remain. Cross-rarity scaling, depth-aware loot balance, Pebs/Bowls ratios, compression, assigned auto-selling and offline/cloud sync are still future work. Review the PR before updating the live game.
