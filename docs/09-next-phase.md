# Confirmed next-PR design: Endurance capacity, full-floor training, gear order and recall — November 6, 2026

**Approved direction (not implemented):** Constitution is **not a directly drained Attribute**. Dungeon runs consume a separate overall **Endurance Capacity** derived from available Constitution Skills (Toughness, Endurance and Vitality); Con-1 eligibility still requires at least one such Skill. Every room's per-second endurance drain is independent of the weighted work requirements and scales with floor depth. Soul/Luck and all Attributes are non-consumable.

**On successfully clearing a full canonical floor**, award **general Constitution XP**, in addition to normal per-check/per-room Skill and Attribute training. Do not credit a failed partial floor or repeat award on save reload. Since the current engine calls each *room* a `floor`, a canonical floor must be explicitly derived from **10 cleared rooms** before making a bonus/recall decision. Full-floor-only XP might be inaccessible to early characters capped at room 1: address as balance, not by silently awarding every-room bonus. Define how general Constitution XP actually increases the derived Endurance maximum.

**Gear order** on each applicable check value: first catchup (no reductions; Catchup N = max(V,(V+N)/2)), then flat, then percent. Multi-bonus stacking still needs a rule. Gear never grants eligibility.

**Recall** replaces instant safe exit with a queued request; wait until **the next completed full-floor boundary** for safe return. A **30-second hard fallback** stops a run stuck/slow inside a floor, but is an exceptional interruption and should not count as a safe successful clear or award floor XP; specific failure/penalty remains to author. If already between floors, allow immediate safe recall. Preserve existing depth limit logic. Suggested timer basis: 30 *game/simulation* seconds (not yet specified by the user). Save/reload, pause, room-to-floor conversion and regression tests are required.

This design supersedes earlier notes describing `Constitution depletion` as spending the Constitution stat itself, immediate recall, generic safe return on fatigue, or full-floor XP at every room. No PR has been opened or gameplay modified by these docs.

---

# Updated next-PR scope: single Constitution drain and Skill totals — Nov 6 2026

**New agreed direction, NOT implemented; this supersedes the older text below suggesting zero work from unselected Attributes, charging other stats, and mandatory Constitution check weights.**

- Dungeon entry **Con-1**: own any one of Toughness/Endurance/Vitality. Guild Master lacks Constitution. Clyde's suggested scavenger picks provide Vitality. Mandatory Combat/Power checks are NOT gated behind Combat Composite.
- Every room drains **one combined Constitution endurance pool at a flat rate per elapsed game second**, scaled by depth/floor, separately from arbitrary weighted Skill requirements. Provisional capacity = sum of the character's owned Constitution Skills. Only Constitution consumes; Soul, Luck and all other Attributes are non-consumable. A missing Skill falls back to selected Attribute; absent Attribute produces tiny **0.01 baseline work**, not zero, with no weight renormalization.
- If CON runs out within a room, use the **failure mode authored for that room**, never silently choose a universal safe retreat. Work, loot, injury, death/loss/revival consequences, and special exit/recall behavior require proper tests/specification.
- Speed/Agility may later affect dungeon tick intervals; Scouting area finding and Movement city travel speed are other possible authored benefits. A Discipline-specific check can use the sum of available component Skills, such as Dungeoneering = Force + Finesse + Agility.
- UI: 5×5 grid includes five **row totals**, five **column totals** and a bottom-right **grand total**, each populated Skill counted once; Info Skills teaches totals and all progress/endurance rules. Numeric Value coloring remains number-only with no added status icon.
- Later gear variants: additive percent, additive flat numeric bonus, and **Catchup N** applying at least `max(V,(V+N)/2)` to low values, with no lowering stronger stats and **no unlocking missing activities/Composite Skills/Con-1**.
- Next coding PR must update room progress calculations, endurance pool and flat rates, failure outcomes, guards, migration, stats display, ETA predictions and regression tests. Earlier proposed other-stat depletion and per-room mandatory CON-weight authoring are withdrawn. Leather Crafting recipe definition remains separate future design work. No PR created by this design change.

---

# Additional next-PR design discussion — Constitution endurance and activity gates (Nov 6, 2026)

**Design discussion, no implementation/PR.** The player prefers Clyde as a non-Combat scavenger; proposed 5 Attributes DEX / CON / PER / INT / LCK and Disciplines Crafting / Exploration / Management / Recovery & Support / Trade. Arya must have Power; Guild Master cannot have Constitution. Do not require Power or Combat Composite for generic dungeon participation. A check's authored weighted Skill falls back to its selected Attribute when the Skill is absent; with no selected Attribute, that share contributes zero and the remaining weights are not normalized. The user wants some Constitution cost in every floor, with Constitution depletion as the general expedition failure condition. Since the actual unit is a room, confirm scope and rebalance before implementation.

Current mandatory Combat level-1 gating and atomic abort on any depleted non-Constitution pool conflict with this design; change these intentionally, with deterministic tests, rather than simply removing Skill flags. For all-role safety, non-Constitution depletion should zero only that contribution if Constitution is to control the return; prevent free work/zero-progress stalls. Ordinary exhaustion vs injury is an open distinction.

Suggested action-level (not whole-tab) minimum Attribute specializations: Charisma→Recruitment, Intelligence→future Research, Perception→Scavenging, Constitution→Dungeons; Strength/Dexterity/Speed weighted heavily in dungeon progress; Luck/Soul primarily situational. Guild Master can conduct Recruitment/Research independently of member mix. See docs/02 and 04 for full constraints.

---

# Next PR planning: character specialization and Info Skills — November 6, 2026

**Design requested, no implementation or PR opened.** Add alongside the Leather Crafting work queue: all characters choose five of nine **Attributes** and five of nine **Disciplines**, with baseline 1 and no normal training outside their picks. Their pairwise capabilities become **Skills** (Power = Strength + Combat); advanced learned abilities become **Composite Skills**. Constitution selected is a required dungeon gate. Guild Master selects Perception, Intelligence, Charisma, Soul and Luck (no physical specialties and no dungeon access; five Disciplines TBD). Character display becomes a fixed 5×5 matrix with neutral black Discipline glyphs, Attribute-tinted Skill glyphs, Value/Potential reveal and training-ratio coloring **directly on the numeric Value text only, with no added status icon**. Only catalog-authored Skill intersections are populated; undefined cells such as Perception × Combat are simply blank. The labels Attributes, Disciplines, Skills and Composite Skills are approved.

**The Info tab must include a Skills section explaining every symbol and this entire mechanism, including the 5×5 grid, skill tiers, combination rules, specializations, dungeon eligibility and color legend.** See docs/02-adventurers-and-stat-growth.md and docs/10-game-interface.md for the detailed planned contract.

**Resolved:** the 5×5 is always 25 positions but only the currently authored 27 global Skill pairs can populate it. No new pairings are implied, and missing intersections are empty. Numeric Skill Value text gets red/yellow/green, with no extra status icon. **Still resolve before implementation:** specific 5/5 character picks, generated recruits, Composite Skill prerequisites, baseline/stat budget interactions, Guild Master disciplines, saved progression migrations and the inclusive 90% color boundary. Do not change gameplay or claim implemented until a later PR passes migration and UI tests.

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
