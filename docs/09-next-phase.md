# Next PR planning: character specialization and Info Skills — November 6, 2026

**Design requested, no implementation or PR opened.** Add alongside the Leather Crafting work queue: all characters choose five of nine **Attributes** and five of nine **Disciplines**, with baseline 1 and no normal training outside their picks. Their pairwise capabilities become **Skills** (Power = Strength + Combat); advanced learned abilities become **Composite Skills**. Constitution selected is a required dungeon gate. Guild Master selects Perception, Intelligence, Charisma, Soul and Luck (no physical specialties and no dungeon access; five Disciplines TBD). Character display becomes an eligible 5×5 matrix with neutral black Discipline glyphs, Attribute-tinted Skill glyphs, Value/Potential reveal and training-ratio coloring.

**The Info tab must include a Skills section explaining every symbol and this entire mechanism, including the 5×5 grid, skill tiers, combination rules, specializations, dungeon eligibility and color legend.** See docs/02-adventurers-and-stat-growth.md and docs/10-game-interface.md for the detailed planned contract.

**Resolve before implementation:** the currently authored 27 total 9×9 pairings cannot guarantee 25 valid cells for each 5×5 choice; specific 5/5 character picks, generated recruits, Composite Skill prerequisites, baseline/stat budget interactions, Guild Master disciplines, saved progression migrations and the inclusive 90% color boundary are all still open. Do not change gameplay or claim implemented until a later PR passes migration and UI tests.

---

# Backlog implemented — November 6, 2026

Single dungeon assignments, queued statuses/counts/lists, simplified member controls, per-member/dungeon history, newest-first Plot and separate rarity/tier metadata are implemented in save v8. The pending discovered-skills and weighted-engine/shop commits are included in this delivery.

Remaining decisions are crafting recipe inputs/outputs/duration and execution, cross-rarity stat budgets/recruit generation, and a jointly rarity/tier/depth-aware loot curve. Materials beyond existing IDs and Threadless renaming remain later content. None of these blocks the implemented backlog. Current Common stats, prices and drops are retained. Validate balance through playtesting before changing them.

# Immediate next work

The v7 weighted room/shop/storage pass supersedes prior opening balance and global slot purchase plans below. Crafting recipe inputs, outputs and duration are explicitly deferred to Maya’s next pass. The Leather Crafting skill, chosen learner, equipment purchase gate and first activity entry are ready. Next: define that recipe/action, then playtest/tune deterministic work weights, injury incidence, boss frequency, single treasure draws and early quest pacing. Do not reintroduce success RNG or generic Constitution exertion.

# Next Phase — After the Emberveil Opening

November 5, 2026. The Arya/Clyde opening, weighted room engine, budgeted loot, Gavin/Stillmere chain, equipment templates/loadouts, Chips economy, caps and Guild subtabs are implemented on the review branch. Verification is in 08.

1. Playtest pacing: first return, first armor, first herb and five-herb referral. The seeded automated path reached Stillmere in about 56 game minutes; this is a test outcome, not a finalized pacing target.
2. Tune room/check weights, rarity, work, costs, carrying caps, storage prices and equipment bonuses while preserving the distinct roles of Arya and Clyde.
3. Refine archive/delve flavor and specialized checks beyond the first dungeon; keep group and room weights independently authored.
4. Design later training so members can learn currently missing skills without rewarding failed-check spam.
5. Specify actual death triggers and a governing recovery stat before implementing the 4× to 2× travel revival timer.
6. Author guildmaster spell actions and storage compression, then worker assignments and per-storage-tab auto-selling. No passive automation or compression is enabled yet.
7. Choose Pebs/Bowls denomination ratios when needed; current accounting uses Chips only.

Skill decay, traits, equipment resource conversion, guildmaster affinity upgrades, offline progress and optional cloud sync remain future systems. Existing saves are preserved, not force-normalized to the new tier budgets.
