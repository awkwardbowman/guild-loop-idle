# Next phase after PR #7 — November 6, 2026

The full five/five specialization, Skills grid/totals, separate endurance, full-floor Constitution growth, queued recall, insufficient-skill room grace and shared dungeon settings scope is implemented for review in save v9. Maya authorized the provisional details. See [11](11-progression-and-check-foundations.md) for formulas/migration and [08](08-test-report.md) for executed validation.

## Main-story floor architecture and discovery — November 6, 2026

**Accepted and queued for later implementation** (see [04](04-dungeons-and-expeditions.md) and latest [05](05-decisions-and-open-questions.md)); current PR only implements the top-level Settings UI and safe display-name changes.

1. Replace generic room counter model with **ten counted rooms per floor**, floor boss checkpoint, non-counting treasure rooms (never twice consecutively), and durable per-floor progress. Main Emberveil Catacombs have **100 floors** and completion is required for game ending; other dungeons usually remain endless.
2. Add controlled Emberveil exponential-style floor difficulty, more dangerous creatures/encounter bands, milestones and story checkpoints; test room-budget/endurance/reward balance before selecting the numeric multiplier.
3. Persist **known authored rooms**, with unknown portions masked until a successful first clear. Expand dungeon cards to show **per-floor** known/total coverage, stat mix, Unknown share, and Normal/Treasure/Boss filters; provide dungeon-wide aggregates without leaking unseen content.
4. Keep special dungeon Skill names hidden until a future-specific checkpoint that also works for endless dungeons; choose milestone before implementing.
5. Enforce fixed unique Soul-bearing Threadless Leeches as scripted recruits, inert Soul=1 for randomized recruits, and explicit functional Soul eligibility only for guildmaster and these future Leeches. Guildmaster cannot dungeon; entry remains Constitution-based.
6. Later replace Quarry with an expedition-Soul-gated simple Weave site, implement generic Common finds vs Soul-specific discoveries and uncertain processing, and redesign taught gear tiers + actual crafted gear.
7. Closed-beta test saves can be discarded rather than migrated; Settings now holds confirmed reset and save transfer actions.

## Threadless / Hollow lore reskin — design decisions recorded November 6, 2026

See [05 — Threadless / Hollow reskin direction](05-decisions-and-open-questions.md) for accepted scope, verified source references and blockers. **This is design only**, not deployed gameplay.

- Prioritize the **Catacombs of the Wound and Wish** as a long-term, progressively dangerous story dungeon rather than making deep progress easy.
- Rebrand the Whispering Archive as the **Forgotten Highwoven Annex**, a future Clyde-focused lore location; existing in-game ID stays `ruins`.
- Defer/rethink the simple Weave-associated Soul-discoverable quarry site until expedition-capable Soul adventurers exist. Do not add it as accessible early content.
- Hide special dungeon Skills' names until the dungeon's first qualifying completion; define completion for bottomless dungeons before coding.
- Adopt historically linked Loomlight Hearth retail presentation, verifying **Marven Wess** as the original innkeeper and treating modern Gavin as a distinct character.
- Make Common finds generic precursors, later split into recognized Soul-specific items and uncertain non-Soul conversion. Do not use Inkwell Reach as an item source.
- Later shift equipment to learned per-tier techniques and **actual crafting**, with multiple gear forms; do not imply current template unlocks already perform crafting.
- Maintain Arya and Clyde's pre-Threadless identity as a deferred long-term mystery. Propose **Oakley Ash** as successor to historic Elder Ash, with lineage unspecified.
- Preserve accepted guild room names; add room flavor snippets later. Keep stable IDs/save continuity.

Before implementing: settle first dungeon-clear milestone, Soul gating, current Delve handling for existing saves, and equipment ownership/recipe migration. Distinguish approved direction from proposed concrete names and new mechanics.

## Presentation precision — November 6, 2026

Implemented: unselected/unknown Attributes provide a genuine effective **0**. Calculate full weighted work without renormalizing missing components; only an **eligible** check's final work rate gets a **0.001** minimum. Ineligible checks remain blocked. Consolidate display formatting to at most two decimal places without rounding internal game state, changing prerequisites or erasing training. Added regression tests. See [02](02-adventurers-and-stat-growth.md) and [11](11-progression-and-check-foundations.md).

## Small backlog cleanup — November 6, 2026

Implemented safe UI/lore fixes: the Members activity count overview is noninteractive rather than seven dead buttons (sidebar counts still navigate); Info/Settings expose current-page semantics; the empty Guild roster guidance names the real Guild Hall path; the rarity legend no longer presents rarity rank as material tier; the guild metric counts traversed rooms including skipped encounters; Story references the actual Recall control. Applied Old Highwoven District, The Loomlight Hearth, Oakley Ash (working name), and approved guild upgrade display names without changing IDs, drops, lore reveal or economy. Added regression tests (QS01–QS04) and classified the previously unregistered NM01–NM02 and ST07 cases for selective testing. The 100-floor redesign, discovery percentages and Soul script remain reserved for later work.

## Small content slice — November 6, 2026

The Whispering Archive and Emberstone Delve now have individually authored names for all eight existing room templates instead of prefixed Catacombs room titles. This is **flavor only**: room IDs, check skills and weights, drop tables, failure outcomes, difficulty and save semantics are unchanged. Existing O03 tests now guard distinct names and preserved mechanics. Additional specialized checks, location-specific room structures and balance remain future work.

1. Playtest/tune the provisional five/five picks, baseline-plus-training values, 0.05 endurance rate, 10-work/second room benchmark and 0.01-per-floor-XP Constitution growth. Test early characters under room limits below ten: these intentionally receive no full-floor bonus; normal successful-check practice still applies.
2. Define Leather Crafting's recipe inputs, outputs and duration, then implement recipe execution. The lesson, learner and purchase gate exist; recipes remain deferred as requested.
3. Design Potential reveal, additional Composite teaching/prerequisites, generated character balance and rarity/tier stat budgets. Existing trained points and learned abilities are preserved; no respec flow is introduced.
4. Author more varied room failures/content and any loot loss, death, revival or recovery-stat rules before adding them. Current outcomes are explicit forced-return or injury, retaining completed cargo.
5. Define future Speed tick intervals, Scouting and Movement action bonuses, later training/decay, gear variants and magic. Formula hooks support Catchup/Flat/Percent, but no new gear items or tick interval mechanics are implied.

Current storage, shops, request pacing, single assignments, queues/history, discovered Composites and independent rarity/tier data remain. Cross-rarity scaling, depth-aware loot balance, Pebs/Bowls ratios, compression, assigned auto-selling and offline/cloud sync are still future work. Review the PR before updating the live game.
