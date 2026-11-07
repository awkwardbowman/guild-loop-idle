# Affinity ceilings and reusable challenge tests — November 7, 2026

Implemented a theme-independent profile calculator, bounded class-ceiling proofs and a current-member/current-gear dungeon adapter; see the reusable procedure at the top of [04](04-dungeons-and-expeditions.md). Common T1 has a total affinity ceiling of 10; broader recruitment budgets remain deferred. The player-facing training change is pending the allocation and diminishing-returns decisions. Until resolved, do not treat the current uncapped Constitution XP system as an affinity-capped maximum.

---

# Current scope clarification — November 6, 2026

**Stillmere upgrades are deferred at Maya's request.** Finish and maintain the floors 1–10 balance using the defined probability procedure in [04](04-dungeons-and-expeditions.md#floor-clear-probability-procedure), rather than large simulation matrices. The current first-ten curve passes that calculation without new numerical changes. Future Stillmere/Leech/crafting decisions below remain queued, not questions blocking this pass.

---

# Combined floor/UI implementation — November 6, 2026 · review branch

Implemented: ten random counted encounters from stable floor catalogs plus a separate mandatory boss; non-counting/non-consecutive treasure; durable checkpoint/restart selection; discovery-only per-floor/category previews; individual-plus-boss secret-name reveals; 100-floor Catacombs endpoint; inert generated Soul and explicit capability flags; modern obsolete-Quarry suppression; version-10 save validation/legacy continuation; shared UI controls, mobile shell, keyboard navigation, numeric drafts, modal behavior and real browser regression.

**Current balance scope is only floors 1–10.** Thirty starter-Arya seeds cleared those floors without equipment/potions; thirty fully trained/current-best-armor probes could not beat floor 11. The next ten floors and their provisional work barrier must be tuned with Stillmere's future consumables/support, not treated as final campaign balance.

The Stillmere material chain remains reachable by selecting an earlier Starting floor for farming. This is important when the newest checkpoint is too difficult for Clyde or the guild needs additional leather/herbs.

**Next decisions / not implemented:**

1. Stillmere potion/support types, costs, effects, duration, ownership and use rules; tune floors 11–20 alongside them.
2. Fixed named Leech recruits, their story unlock order, expedition capabilities and magic. No random Soul rolls or improvised campaign lore.
3. Crafting recipes, consumed inputs, output item ownership, per-tier teaching and conversion of current shared equipment templates.
4. Soul-specific loot recognition/processing, probabilities, generic material families and the future hidden Weave site.
5. Full authored narrative checkpoints and unique boss mechanics for the later Catacombs bands. Current topology and generic threat labels do not substitute for this content.

Full automated regression/build and browser acceptance are recorded in [08](08-test-report.md). This work is prepared for PR review; do not infer a live deployment from local screenshots.

---

# Next phase after PR #7 — November 6, 2026

The full five/five specialization, Skills grid/totals, separate endurance, full-floor Constitution growth, queued recall, insufficient-skill room grace and shared dungeon settings scope is implemented for review in save v9. Maya authorized the provisional details. See [11](11-progression-and-check-foundations.md) for formulas/migration and [08](08-test-report.md) for executed validation.

## UI/UX consistency audit — November 6, 2026

Static review of current source; browser/device accessibility has **not** yet been verified. Detailed findings, evidence, suggested design tokens and acceptance criteria: [10-game-interface.md](10-game-interface.md#guild-loops-uiux-heuristic-audit-and-consistency-contract--november-6-2026).

- **Small independent polish:** Shop city switches should show the new city's Shop by default (UX-08); unify page heading and empty-state language (UX-12); standardize terminology (UX-11); consistent feedback and disabled reasons (UX-06); numeric input drafts/validation (UX-07); avoid hover-only essential icon meanings (UX-09).
- **Medium UI infrastructure:** unify navigation semantics and keyboard behavior (UX-01), introduce reusable tokens and components (UX-05), formalize dialogs (UX-10), improve Skill matrix accessibility (UX-13).
- **Major coupled work:** redesign 320–440px navigation/shell (UX-02), discover-only dungeon statistics/Skill previews as part of 100-floor mechanics (UX-04), build actual browser/mobile accessibility regression coverage (UX-14).
- **Keep:** existing dark visual identity, progressive disclosure, compact event log, resource/stat icon system, confirmed destructive actions and focus styling.
- **Don't claim:** that a CSS-only audit establishes WCAG conformance or that stale Vercel production shows the latest code.

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


---

## Historical Drive planning preserved during reconciliation

The following older notes are superseded by the current sections above. Retained to preserve prior planning and historical test outcomes.

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
