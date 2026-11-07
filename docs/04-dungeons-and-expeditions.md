# Reusable unit and class-ceiling procedure — November 7, 2026

The calculator now separates an individual profile from the strongest legal member of a declared class. It is independent of dungeon theme: Diplomacy can use Influence/Insight and a different capacity expression while retaining the same encounter sequence and probability recurrence.

**Confirmed ceiling policy:** tests use Skills trained to their generated affinity ceilings and the best available legal equipment combinations. Common T1 (including Arya and Clyde) has a total affinity budget of 10. Broader recruitment budgets are deferred. The allocation of those 10 points and the diminishing-returns/floor-reward implementation are awaiting clarification; the existing uncapped Constitution XP mechanic does not yet implement that policy. The old first-ten worksheet below remains an explicitly frozen, pre-change scenario until that is reconciled.

## Inputs and exact individual odds

`src/challenge-probability.ts` defines:

- **Profile:** allocation values, nonnegative weighted expressions mapping them into named stat/Skill channels, and fixed capability/unlock traits. A maximum-profile test supplies affinity values, rather than starting trained values. Attributes/Disciplines that are derived totals must be expressions of the underlying Skills, rather than independent extra budget.
- **Equipment:** one explicitly legal loadout; each channel applies strongest catchup, then additive flats, then additive percentages. Equipment does not grant traits. Negative modifiers, conditional equipment and consumables need an extended model before use.
- **Challenge:** independently weighted standard, optional bonus and final-checkpoint encounter categories; count of standard slots; bonus chance; ordered work checks; required traits; optional encounter deadlines; capacity expression; drain and total exploration-time limit. Fixed positive work rates are computed from the declared channels. Missing required traits skip an optional bonus in one second; missing standard/boss traits fail the all-standards-plus-boss objective. Zero work rate cannot complete an eligible encounter.

Convert every check to tick-rounded time, sum ordered checks, and calculate the available funded time. Convolve the categories using the recurrence below, dropping probability mass as soon as it fails a requirement/deadline or exceeds the time budget. Final surviving mass is the clear probability. This is exact for the declared frozen model, subject to ordinary floating-point precision; it does not sample runs. The current 300-second ward bounds the elapsed-time state to at most 301 values.

`src/member-probability.ts` adapts **any existing Member** and an explicit current loadout to the authored dungeon/floor rules. `memberFloorChance(member, dungeonId, floor, loadout)` computes all-ten-success-plus-boss odds. `bestMemberLoadout(member, dungeonId, floor, availableItemIds)` enumerates bare plus every legal slot combination from the explicitly supplied available pool, up to 256 combinations. This does not assume that a tier-2 item is unavailable to a tier-1 unit: current game rules restrict slot count, not item tier. Item access must be supplied correctly by the caller.

The live adapter freezes training at entry, validates slot counts/duplicates/item IDs, includes current check eligibility and low-skill deadlines, and rejects scenarios whose maximum cargo could bind. It does not forecast unlock acquisition or invent a potion strategy. The older first-ten Arya worksheet and the new member adapter agree on the floor-10 result.

## Strongest legal member of a class

`classCeiling(challenge, scopes, threshold, maxEvaluations = 256)` tests integer allocation domains. Each scope declares the total affinity budget, a minimum/maximum per allocation dimension, fixed selections/capability traits, channel expressions and the complete allowed loadout list. Include every allowed selection/unlock variant to make a claim about the entire rarity/tier class; a single selection preset proves only that preset. Fractional generation must first be expressed in integer affinity quanta, with corresponding channel weights. Current positive-only expressions/modifiers make clear odds monotone inside each fixed scope.

1. Validate that legal allocations sum to the budget and obey all bounds. Using the maximum total from a generated budget range is safe only when lower-total legal profiles can be increased to that maximum under the same constraints; otherwise declare separate scopes.
2. Evaluate a componentwise upper vector to obtain an optimistic probability bound. It may exceed the total budget; **never label it a recruit or a counterexample**.
3. Evaluate an actual budget-respecting allocation to obtain an attainable lower bound and witness.
4. If the upper bound is strictly below the target, that whole allocation box is proven below it. Otherwise split the widest allocation interval, tighten it using the total-budget constraint, and repeat.
5. Stop at the evaluation budget and report the remaining interval. No random search or simulated expeditions are used.

Results:

- `proven-below`: every declared legal allocation/loadout has a pass rate **strictly below** the target.
- `counterexample`: an explicit legal allocation/loadout reaches or exceeds the target. This refutes the proposed restriction; it does not necessarily identify the absolute best build.
- `inconclusive`: the remaining upper bound still reaches the target when the calculation budget expires. Increase the budget, narrow the declared scope, or revise the gate; never report this as a pass.

The result includes lower/upper probability bounds, number of evaluations, and the best legal witness found. A 1% rule uses `threshold: 0.01`. Rarity/tier labels do not secretly supply budgets, progression, unlocks or item access.

## Runnable example and verification

Run `node scripts/check-challenge.ts docs/examples/challenge-ceiling.json`. This Diplomacy-shaped **test fixture** proves the declared five-attribute budget-14 scope below 1% in two profile evaluations; it is not a live Tier-5 recruitment rule. The same fixture with budget 50 produces a legal counterexample. A JSON input can instead contain `challenge`, `profile`, and `loadout` for individual odds.

CP01–CP04 verify class certificates, legal witnesses, a bounded inconclusive result, tradeoff branching against exhaustive legal allocations, weighted failure mass, optional skips, gear, deadlines and ordered checks. MP01 verifies agreement with the existing Arya worksheet, all supplied legal current gear combinations, input immutability and unsupported-cargo rejection. Repeatable progression, retries, damage, conditional stats, consumables or cargo that affect later choices require extra probability-state dimensions before the tool can certify those scenarios.

---

# Floor clear probability procedure

**Current method, November 6, 2026:** use an analytic probability calculation to balance floors 1–10. Maya requested a defined, reusable calculation rather than large simulations. Stillmere upgrades remain deferred. Earlier simulation results below are historical validation, not the procedure to repeat for routine balance changes.

**Implementation:** `src/floor-probability.ts`; worksheet command: `node scripts/balance-floors.ts`. This command advances no game time, samples no RNG and reads no player saves. `firstTenClearChance(floor, armor, constitutionXP)` supplies the current beginner-Arya worksheet; `floorClearProbability(...)` supplies the general distribution calculation.

## 1. Define the event and freeze the inputs

Calculate **the probability of clearing one floor's ten standard encounters and its separate boss before endurance runs out**, starting at that floor with a full meter. Do not conflate this with discovery coverage, a whole outing containing several floors, or total campaign completion time.

Record the floor, actor's selected/owned Skills, actual trained values, Constitution XP, loadout and starting endurance. The default worksheet uses starter Arya, no ordinary practice, and one Constitution XP per preceding floor; compare no equipment with Rough Leather Armor. If a different member earned some earlier floor bonuses, use Arya's actual XP instead of automatically granting those bonuses. This is a conservative fixed-profile comparison, not a claim that equipment has already been purchased.

Confirm entry eligibility and the meaning of success first. Current Arya can attempt every standard/boss check, so boss checkpoint victory and a successful full-floor XP clear have the same event. If optional standard skips become possible, track that success flag separately when calculating XP odds. An ineligible mandatory encounter must be a failure branch, never assigned minimum progress as if it were eligible.

## 2. Enumerate the random choices and normalize their weights

Use the actual generation rules:

- A standard room identity has probability `p_i = w_i / sum(w)`, where the current floor generator uses `w_i = groupWeight_i × roomWeight_i` **inside the standard category**. Repeats are allowed. Do not substitute unique-discovery percentages for encounter probabilities.
- Before each of the ten standard encounters, there is either **no treasure** with probability `0.85`, or **one treasure** with probability `0.15`. Select its identity using its normalized category weights. The treasure is followed by a standard room, which enforces no consecutive treasure rooms.
- After standard encounter ten, the boss is mandatory. Normalize any choices **within the boss category**; its old random group weight is not its probability of appearing. There is no extra treasure draw before this boss.
- Each selected category's probabilities must sum to 1. Treat these weighted draws as independent for planning odds; this is not a seed-specific forecast.

## 3. Convert each outcome into funded game seconds

For each eligible check, use the live weighted work rate after the agreed fallback and equipment rules:

`checkSeconds = max(1, ceil((requiredWork − 1e−9) / effectiveWorkPerSecond))`

`requiredWork = authoredWork × floorDifficulty`

Current checks take one work step per game second. Add ordered check times for a room only when every required check is eligible and the relevant failure/deadline rules have been included. A currently unavailable optional treasure consumes one funded attempt second and is skipped. The current worksheet deliberately rejects unsupported multi-check/ineligible-standard/deadline cases rather than producing a misleading number.

Group the room outcomes by duration to obtain three distributions: `N(t)` for a standard room, `T(t)` for treasure, and `B(t)` for the final boss. Outcomes with the same duration combine their probabilities.

## 4. Calculate the endurance budget

Use the engine's owned Constitution Skill values and the actual gear order to compute capacity `C`; do not substitute the root Constitution Attribute.

For the current beginner worksheet on floor `f`:

- No equipment: `C = 2 + 0.02 × ConstitutionXP`.
- Rough Leather Armor: multiply that capacity by `1.10`.
- Per-second drain: `d_f = 0.05 × (1 + 0.2 × (f − 1))`.
- Funded seconds: `budget = floor((C + 1e−9) / d_f)`.

The inclusive budget matters: completing the boss on the last funded second counts as a clear. Travel and later recovery affect pacing, but do not consume this floor's endurance.

## 5. Sum successful paths, not just average time

Let `*` mean convolution: `(A * B)(t) = sum_s A(s) × B(t − s)`.

1. Optional-bonus distribution: `O(0) = 0.85`; positive durations receive `O(t) = 0.15 × T(t)`.
2. One counted slot including its possible bonus: `U = O * N`.
3. Start with `P_0(0) = 1`; calculate `P_(n+1) = P_n * U` for `n = 0…9`.
4. Add the mandatory boss: `F = P_10 * B`.
5. **Clear probability:** `Pr(clear) = sum_(t ≤ budget) F(t)`.

This is a short finite probability calculation, not repeated simulated playthroughs. Do not decide success by comparing mean time to capacity: that loses the chance of unusually easy or difficult encounter combinations.

## 6. Check assumptions and validate the calculation

Require nonnegative probabilities, positive integer encounter durations, finite capacity/drain, and total probability mass 1. Check a hand-enumerated small example and exact-last-second funding. Those checks are covered by FP01/FP02.

Before using the simplified time-only model, prove that other mechanics cannot bind. Current beginner Arya's slowest possible first-ten floor is 32 exploration seconds, below the 300-second ward. Her maximum possible floor cargo is 22, below her 72 capacity; her locked herb encounter is skipped. The current low-skill threshold does not interrupt any eligible check. The worksheet checks these boundaries. No Recall is assumed.

If cargo, injury, retries inside a room, changing skills, consumables or a deadline can change later outcomes, **extend the mathematical state** to carry those quantities and an absorbing failure state before reporting odds. Do not silently ignore them or replace the procedure with a large simulation matrix. Only round displayed percentages, not intermediate math.

## 7. Record the result and make the balance decision

| Floor | Arya, no equipment | With Rough Leather Armor |
| --- | ---: | ---: |
| 1–5 | approximately 100% | approximately 100% |
| 6 | 99.99% | approximately 100% |
| 7 | 99.69% | 99.99% |
| 8 | 95.59% | 99.69% |
| 9 | 87.60% | 98.71% |
| 10 | **71.67%** | **95.59%** |

These are **fresh single-floor attempt** probabilities with the declared XP and no ordinary practice. The first two floors fit even the slowest encounter combination; later rounded `100%` values need not mean a guarantee. Floor 10 is accessible without a potion, while existing armor significantly reduces retries. Ordinary earned practice improves the real profile beyond this worksheet. The current 3.5% work steps and increasing endurance drain therefore remain suitable for the first ten floors; no numeric retuning is required in this pass.

### Worked example: floor 10

With nine prior floor XP, Arya has `C = 2.18`, drain `d = 0.14`, and 15 funded seconds. Normal encounters take one or two seconds; the slow-room probability is `4/33`. A bonus treasure takes one second with probability `0.15`; the boss takes two seconds. Thus:

`totalSeconds = 12 + Binomial(10, 4/33) + Binomial(10, 0.15)`

`Pr(clear) = Pr(totalSeconds ≤ 15) = 71.67%`.

Rough Leather Armor raises capacity to `2.398` and the budget to 17 seconds, giving **95.59%**. For an unchanged profile, odds of succeeding within `k` independent fresh attempts are `1 − (1 − p)^k`; when practice changes the profile, recompute each attempt's probability instead of promising a fixed campaign duration.

---

# Floor/checkpoint implementation for review — November 6, 2026 · save v10

**Branch implementation, not a production deployment.** This section supersedes the older open boss-placement, identity, reveal and scaling questions below. Maya approved both the UI and gameplay roadmaps, then clarified that only floors 1–10 need current balance: Arya must clear them now, while the next ten require future Stillmere potions and other support.

- A floor is **ten counted standard encounters followed by a separate mandatory boss**. Standard room selection is random **with replacement** from ten distinct, stable floor-specific identities. Encounter counts and unique discoveries are independent: ten repeated successes can clear a floor while revealing only one of its normal room identities.
- Treasure is a 15% bonus opportunity between standard encounters, never consecutive, never counted toward the ten. Once the tenth standard encounter resolves, the next encounter is the boss. Treasure has two catalog identities and bosses one per floor, with independent discovery denominators.
- Boss victory records a durable guild checkpoint. Future outings default to the first uncleared floor. **Starting floor** may instead select an earlier unlocked checkpoint for repeat material/training runs; active outings keep their current state. Unfinished standard-room counters restart on a new outing, while learned rooms and completed bosses persist.
- Successful encounter clears alone reveal their room's stat requirements. Each normal identity contributes one tenth of the floor's normal preview; repeat, failed or skipped rooms add no coverage. Boss victory reveals remaining **Composite Skill names** for that floor, without fabricating uncleared room stat coverage. Individual successful encounters also reveal their own Skill names. Global character browsers respect these secret-name rules.
- Normal, Treasure and Boss filters may be combined, with equal identity weighting and truthful known/total denominators. Dungeon summaries aggregate **explored floors only**. Undiscovered checks, possible finds and special Skill names are not exposed through summaries, tooltips, sidebars, assignment cards or failure messages.
- General Constitution XP requires ten successful standard encounters plus boss victory in that outing's floor. Bonus treasure does not contribute. Skipped standard rooms invalidate the XP, while a boss checkpoint can still be secured. Existing work practice, current outing capacity snapshots, injury outcomes and 30-game-second recall/low-skill clocks remain.
- Ordinary Recall waits for the defeated boss, including when requested at standard room ten. Exact completion wins a simultaneous timeout. Limits count standard rooms; a cap at a multiple of ten includes the separate boss. A lower mid-floor cap returns without full-floor XP. Bonus treasure does not advance the cap.
- The Catacombs have exactly **100 floors**. Defeating floor 100's boss records a single completion event, returns/banks cargo normally and prevents a floor-101 departure. Other dungeons have no authored campaign ending. Their numerical work scale is bounded for finite simulation math.

## Current balance boundary

Only Catacombs floors **1–10** are tuned: work multiplier `1.035^(floor-1)`, base normal check work 0.5 and separate boss check work 1.5. Existing linear per-floor endurance drain remains. Thirty seeded engine runs using starter Arya, earned practice and no equipment/potions cleared ten floors in 460–600 game seconds (mean 496). These are simulation results, not elapsed human playtests or guaranteed first-attempt clears.

Floor **11** begins a deliberately large **provisional** work step at 32×, followed by provisional 3.5% steps. Thirty probes using stronger-than-current Arya (capped roots and Skills, ten floor XP, best existing armor) produced zero floor-11 boss clears. This preserves a current-kit barrier while Stillmere support is undefined. **Do not treat the floor-11 constant, floors 11–100, potion strengths or total campaign pacing as finalized balance.** Revisit this boundary together with Stillmere consumables, equipment and training. No potion effect has been invented or enabled in this PR. Reproduce with `node scripts/balance-floors.ts`.

The 100-floor topology uses stable room catalogs and provisional reusable threat bands. One hundred unique lore scenes, special story gates and bespoke boss mechanics have not been authored merely by creating those catalogs.

## Soul and save boundary

Generated recruits have inert Soul current/max/affinity **exactly 1**, never select Soul and always carry explicit `soulAccess: none`. Guildmaster alone has `soulAccess: guildmaster` and cannot dungeon. Arya/Clyde keep Constitution entry; neither gains true Soul. Modern progression no longer offers the obsolete Quarry discovery or new departures there. Historical legacy access/outings remain readable. A Soul-discoverable replacement, fixed named Leeches, their unlock sequence and magic still need authored content.

Save v10 validates checkpoint/catalog IDs, categories, counters, campaign completion and Soul access. v0–v9 saves remain readable. Existing outings retain their historical room/work rules through return, with no retroactive checkpoint or discovery credit; later departures use the new model. Old random recruits are normalized to inert Soul and non-Soul selections; if necessary their root budget and active snapshots are reconciled without erasing trained Skill records. A beta reset is still available, but import does not silently wipe the guild.

---

# Approved main-campaign and dungeon discovery direction — November 6, 2026

**STATUS: Future gameplay redesign, not implemented in the current v9 dungeon engine.** This section supersedes conflicting older floor, endpoint, and discovery assumptions below. See [05](05-decisions-and-open-questions.md) for decision log and unresolved thresholds.

## World structure and endpoint

- Dungeons outside the main story are typically **endless**; do not require a dungeon-ending event for progression or learning.
- The opening **Catacombs of the Wound and Wish** beneath Emberveil are the **main campaign** and have exactly **100 authored floors**. Clearing floor 100, including its final boss/checkpoint requirement, is required to finish the game; exploring other cities is optional but should be practically useful to grow strong enough for the later floors.
- Every dungeon has **boss checkpoints at floor endings**. Main-story boss sequence is more controlled, with authored gates/revelations and stronger difficulty escalation. Bosses are not simply random low-level encounters. Other dungeons can use more general checkpoints.
- **Ten counted standard rooms form one floor**. Treasure rooms are optional **bonus rooms**, do not advance the ten-room floor counter, and may never appear consecutively. A mandatory boss-type encounter occurs at the floor end; whether it consumes the tenth counted slot or is a capstone after the ten standard slots remains an explicit design choice for implementation. The player-facing 1/10 discovery denominator describes the ten authored counted rooms and never includes bonus treasure rooms.
- Floor identity, room identity and successful clears must be stored independently. Current v9's `run.floor` is actually a room counter; do not patch the labels alone without redesigning progression and save state.

## Proposed floor-based exponential difficulty, with parameters intentionally undecided

- Strong scaling is intended, with a **step up at every ten counted rooms**, plus possible within-floor adjustment. A candidate shape (not yet adopted, not numerically balanced) is `difficulty(room) = withinFloor(room) * q ^ floor((room-1)/10)`, where `q > 1` is a later tuning value. Each next floor moves up a level, and deeper floors may require stronger recruits/gear and outside exploration.
- Do not deploy guessed `q` values or reinterpret the rough user sketch as an exact formula. Evaluate first-floor accessibility, higher-floor boss breakpoints, expected full-run length, stamina limits, gear and reward growth, and out-of-city value during balance playtests.

## Discovery-based stat previews, per-dungeon and per-floor

- Players learn what a dungeon demands by **successfully clearing encounters**, not by seeing the full authored distribution at unlock. Visiting/failing/skipping a room does not fill in its stat breakdown.
- A floor with 10 authored counted room identities begins at **0/10 known** and **100% Unknown**. Successfully clearing one previously unlearned counted room reveals **1/10 known** (10% of counted room coverage); other nine remain Unknown. Re-clearing the same room identity does not increase the count. The known room's own attribute mix is weighted into the 10% known slice. Example: one room 60% Strength/40% Dexterity gives 6% Strength, 4% Dexterity, 90% Unknown in the floor's counted-room preview.
- Each expanded dungeon presents **per-floor panels**, displaying discovered/total counted rooms, discovered stat mix and the explicit Unknown share. The dungeon-level overview aggregates across explored floors; do not expose future-floor content or requirements just because their definitions exist in source.
- Show **three independently filterable distributions** for each floor: **Normal rooms**, **Treasure rooms**, **Boss rooms**. Each category displays its own known/unknown coverage and stat mix; the selected filter must not accidentally include treasure/boss stats in the normal-only view. The aggregate should default to standard counted rooms unless the player chooses other categories. A boss can be a known locked checkpoint without revealing its undiscovered actual skill/stat requirements.
- **Open implementation issue:** For procedurally weighted rooms with repeats, define a stable authored identity/slot catalog per floor so “one of ten known” is truthful and does not count identical templates multiple times. If some floors have fewer or more authored encounter types than ten, separately define **cleared slots** versus **known unique types**; never conflate them. Different categories require meaningful denominators even if optional treasure appearances are indefinite.
- Avoid spoilers through global skill catalog, tooltips, possible finds, filters, log records and character UI. Secret dungeon-specific Skill **names** should unlock only after a meaningful authored checkpoint; old “complete the entire dungeon first” is incompatible with endless dungeons and would withhold everything until floor 100 in the main dungeon. Precise reveal checkpoint (first boss defeat, discovery per check, etc.) remains to be decided. Do not implement misleading unrestricted names meanwhile.

## Soul and who may enter

- **Constitution-based dungeon entry remains universal** for all adventurers, irrespective of Clyde's lore role or Soul. Soul enables *special discovery and identification*, not general entry eligibility.
- **The guildmaster alone starts with true Soul**, but cannot adventure. Later fixed, story-introduced **Threadless Leeches** are the only recruitable adventurers with functional Soul. They are **unique, predetermined characters**, not random recruitment variants.
- **Every randomly generated adventurer has an inert Soul baseline of exactly 1** (not a randomized affinity, chosen Soul discipline, or effective Soul resource), and random recruits must never gain true Soul capability by accident. Future Soul-bearing scripted allies need an explicit character class/flag separate from the number, and fixed identity and unlock requirements; don't infer `canUseSoul` by testing `soul > 0`.
- Later loot is initially **Common generic material/artifacts** for non-Soul explorers; special Soul-capable explorers may find or recognize specific materials directly. Generic artifacts can be processed, sometimes imperfectly; source/rarity/quality, processing odds and ownership rules remain for later. Avoid Inkwell Reach associations.
- The proposed Weave-associated small hidden location replacing the current Quarry/Delve remains **future content**, not an immediately accessible dungeon: it is discoverable only by someone with functional Soul who can actually adventure. During closed beta, deliberately reset/wipe old test saves rather than preserving every obsolete Delve route; no legacy migration obligation.

## Narrative

- **Arya and Clyde predate Threadless**; their deeper history is a later reveal, not a reason to restrict their current dungeon entry.
- **Gavin Wess** succeeds the historic Wess-associated Loomlight Hearth in Emberveil; the campaign's old innkeeper was **Marven Wess**, not Gavin. The exact genealogy is not yet told.
- The Forgotten Highwoven Annex is a lore-rich destination intended to feature Clyde later, without locking out other qualified members.
- Rooms may gain authored snippets later; leave existing room encounter math untouched until the floor redesign is built.

---
# Current PR #7 implementation — room work, endurance and return rules (November 6, 2026)

The full scope is implemented for generated room outings in save v9, with Maya authorizing provisional details. Historical task/check outings retain their saved work/pool rules; all assignments now use shared dungeon limits. See [11](11-progression-and-check-foundations.md) for exact formulas and migration.

- Con-1 requires an owned Constitution Skill. Combat Composite is not a gate for generic dungeon checks; Clyde can attempt them with weak weighted contributions.
- Endurance maximum is the sum of owned Constitution Skill effective values, with gear. Every attempted room second costs `0.05 × (1 + 0.2 × (canonicalFloor - 1))`, independent of work weights. Canonical floor = `floor((roomNumber - 1)/10) + 1`. Attributes do not drain in new outings.
- Each room explicitly authors a failure and reference rate. Provisional danger outcomes: trap/boss = injury and existing healing on home arrival; neutral/combat/puzzle/treasure = forced return without injury. Completed cargo is kept. Loss/death/revival remain future content. No incomplete-room reward or floor XP is granted on failure.
- Benchmark is provisionally 10 work/second. Room efficiency = total base check work / sum(base check work / actor effective check rate) / benchmark. Difficulty multiplies actor and benchmark required work equally and cancels in the rate ratio. This is not Value/Potential. Tick speed is currently one work step per game second; future Speed interval changes must update both prediction and work together.
- Evaluate threshold once on each room entry. Strictly below threshold grants 30 game seconds. Completion on the 30th second wins; an unfinished room invokes its failure. Threshold changes apply at next room entry, not retrospectively.
- Manual recall queues until the next ten-room boundary. Its independent 30-second fallback invokes the current incomplete room's failure. If a room completes on that deadline inside a partial floor, keep that completed reward and label the return **Interrupted**, with no general floor XP. Outbound or between-full-floor recall is immediately safe. Simultaneous timeouts resolve once, with low-skill expiry taking precedence over recall expiry for the reason text.
- General Constitution XP requires all ten successful rooms within that canonical floor. Skips invalidate that floor's bonus. Completed-check practice remains earned on a partial floor. Depth limits count rooms, can stop mid-canonical-floor at a room boundary, and grant no full-floor XP for that partial floor. Lowering a limit never interrupts an already active room.
- Both grace and recall clocks use saved outing elapsed game seconds; no offline progression is introduced. Capacity is snapshotted at departure and never refilled by mid-outing XP. Existing cargo-full and 300-second ward returns remain separate.

Active v8 rooms retain work, cargo, RNG and travel. Their new meter preserves the old CON pool fraction; current-room evaluation starts at migration time, and no earlier clears are retroactively credited as a successful full floor. Per-dungeon caps—including explicit Unlimited—are preserved; individual caps are discarded without merging them.

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Approved dungeon-level depth-limit ownership and insufficient-skill behavior — November 6, 2026 (NOT IMPLEMENTED)

**Depth Limit ownership:** remove the per-member/per-assignment depth cap. A dungeon has **one effective depth limit shared by all adventurers assigned to it**. Support a global default and a per-dungeon override; a dungeon set to **Inherit** automatically uses the current global setting, while an overridden dungeon keeps its own value. Global default **Unlimited**; explicit Unlimited also allowed as a local override, so it does not become limited if the global value changes. Preserve the existing room-count depth unit and the existing boundary behavior for depth-limit exits (the new ten-room canonical-floor model for floor XP/normal recall does NOT silently change this). Each dungeon has an explicit override mode `inherit | unlimited | cap(positive integer)`; the global limit is `unlimited | cap(positive integer)`. Effective limit is one shared value, not the minimum of a member's cap and the dungeon's cap.

**Engine migration:** v8 stores `g.dungeonLimits[dungeonId]` AND `member.queue[].maxDepth` / `run.personalLimit`; effectiveLimit takes their minimum. v9 redesign eliminates assignment-level maxDepth UI and data and uses only global default plus dungeon override. Old member-specific caps MUST NOT silently become a dungeon-wide restriction for everybody; remove/ignore them for future dispatches, preserve existing active expeditions and prevent save corruption. Existing per-dungeon caps can migrate to explicit per-dungeon overrides; old global absence should mean Unlimited. Reconcile custom dungeon caps edited while runs are active at the existing next-room boundary, not by assigning differing limits to members.

**Two dungeon settings next to each other:** Depth Limit and Insufficient Skill Threshold. Both inherit global defaults with optional per-dungeon overrides. Insufficient Skill Threshold global candidate 1%, per dungeon may override any validated percentage or 0=Off.

**Agreed insufficient-skill auto-bail operation** (supersedes the preflight-only idea described in older sections): **evaluate the character's predicted efficiency when entering each generated room**; if it is below the configured threshold, allow a **30-game-second grace period to finish that room**. If the room is not complete at the end of the grace period, invoke **that room's authored failure outcome**. If the room completes before timeout, continue. This is NOT a safe early exit, even inside a canonical floor. A character above threshold remains subject to the usual endurance depletion and authored failure. Efficiency is actor-effective weighted work/second divided by room-authored reference work/second, not Value/Potential; include 0.01 fallback and gear Catchup → Flat → Percent. The 30-second low-skill timeout is independent of the 30-second pending-manual-recall failsafe. If both fire, ensure deterministic one-time resolution; no double penalties or rewards. Define the clock to count simulation/game seconds and make the room-start timer save-safe.

**Balance:** do not make an absent Power Skill a direct prohibition. Clyde can still finish a very slow 90%-Power/10%-Finesse room if he does so before the low-efficiency timer or endurance exhaustion. Threshold 0 disables automatic insufficient-skill timeout. Even without threshold, an endless/zero-progress room must ultimately fail through endurance or explicit guard. Preserve room-count Depth Limit semantics independent of canonical 10-room floor XP and queued safe manual recall.

---

# Proposed configurable insufficient-skill auto-bail — November 6, 2026 (DESIGN, not implemented)

**New player option:** `Insufficient Skill Threshold`, preferably a **global default with a per-dungeon override**, shown with dungeon depth limits/assignment settings. Suggested default **1%**; **0% disables** the efficiency-based auto-bail. Show an understandable description and the active setting in Info and dungeon settings. This should not be a static per-member stat; units with different builds can share the dungeon but evaluate independently.

**Efficiency must be relative to the room's authored difficulty/time target, not relative to the member's own Skill Potential.** Proposed, pending balancing: `efficiencyRatio = memberPredictedWorkPerGameSecond / authoredReferenceWorkPerGameSecond` with `authoredReferenceWorkPerGameSecond = roomRequiredWork / roomTargetCompletionSeconds`. Multiply by 100 for the percentage. The member prediction uses **actual weighted check values after** Skill/Attribute/0.01 baseline fallback and gear application, without renormalizing missing weights; apply any activity-specific tick-frequency modifiers consistently. A 1% threshold means the actor would complete at under 1% of intended reference work speed, not that the actor is under 1% of their personal Potential. For rooms with ordered checks, define whether to evaluate worst mandatory check or projected total floor/room time (proposal: worst mandatory check to avoid impossible segments). Author reference time for each room/dungeon or another reproducible benchmark, with tests.

**Bail / no-running invariant:** distinguish a **pre-entry rejection** from a **mid-floor interruption**. Recommended: evaluate predicted efficiency at a **safe floor-entry boundary**; if below threshold, automatically stop rather than commit to a floor that the unit cannot reasonably finish. Once engaged in a floor, do not grant automatic safe flight: apply the existing per-room failure policy if the unit exhausts endurance or hits an exceptional stuck-run timeout. Suggested **30 elapsed game seconds** as a grace/failsafe for a critically underqualified check **if the player wants the actor to try anyway**, but exact trigger/consequence and relation to queued manual recall should be decided before code; do not silently reinterpret a low-efficiency timeout as a safe floor clear. Never award floor XP/loot for an uncompleted floor.

**Room vs floor unresolved:** The design calls ten rooms one canonical floor; the current `run.floor` is a room counter and each encountered room is randomly rolled. For an exact **whole-floor entry** prediction, generate/inspect the relevant room sequence before committing or use an explicitly documented aggregated-floor benchmark; a per-room check may occur *inside* a canonical floor and therefore cannot safely exit at every room boundary without relaxing the existing no-running rule. Select an explicit pre-entry assessment scope in the implementation, don't conflate floor/room. Default should ensure an adventurer such as Clyde is merely slow in a 90% Power/10% Finesse encounter, **not automatically rejected unless his measured ratio actually falls below the configured threshold**.

**Player-facing:** In the expanded dungeon settings show `Insufficient Skill Threshold: Inherit global / 0% Off / percent` and a short estimated efficiency tooltip. Info → Skills / Dungeons describes the percentage baseline, the fallback/gear interaction, what happens below threshold, and the fact that no gear permits a locked activity. Retain the current ability to edit depth limits and inspect each member's expedition history.

**Tests:** mixed-build Arya/Clyde, missing primary weighted Skills, 0.01 fallback, >100% efficiency, 0% Off, custom overrides and inheritance, unknown/invalid reference duration, save/load, depth scaling, no false safe escapes, award-once floor XP and queued recall/30s behavior. Gameplay remains v8 until a PR implements this.

---

# Accepted clarification: endurance capacity, floor XP, ordered equipment, queued recall — November 6, 2026 (DESIGN ONLY, not in v8)

This **supersedes** earlier descriptions of Constitution as a spendable root-stat pool, and clarifies recall. The character has an **overall dungeon Endurance Capacity** resource, not a consumed Constitution Attribute. It is derived from trained/effective values of owned Constitution Skills (Toughness, Endurance, Vitality); at least one is required (Con-1) to enter a dungeon. Treat the capacity as an expedition run resource with current and maximum values, refilled according to run/return rules to be implemented. Constitution, Soul, Luck and all other Attributes themselves are **not drained** by checks. Each active dungeon room independently imposes a flat endurance-rate drain per elapsed game second, scaled by canonical floor depth, separate from weighted progress contributions. Only the endurance capacity decreases. If depleted mid-room, apply the room-specific failure outcome.

**Training:** When a character **fully clears a canonical floor**, award general **Constitution XP** in addition to the normal per-room/per-check weighted Skill/Attribute XP already earned. Award this once per actual floor clear, **not once per room, per partial floor, per attempt, or on a failed/forced recall**. Root Constitution XP is meant to enable future endurance growth: specify its conversion into the Constitution Skills, their fallback, cap or effective combined capacity so it is not decorative. Avoid applying the same award multiple times on resume, save reload, recount or replay. Preserve earlier accumulated per-check training on normal floor completion.

**Floor boundary:** existing v8 engine variable `run.floor` actually counts **rooms**, and design lore says **10 rooms per canonical floor**. The new floor-clear XP and safe-recall boundary should use explicitly authored/derived 10-room floor boundaries (rooms 10,20,30…), **not every `resolvedRoom` event**. A caveat for balancing: present starter depth limits may stop at room 1, so floor-clear-only CON XP would not be obtainable until a full 10-room floor is reachable; do not silently award floor XP per room to work around this. Decide whether other early training also increases endurance or starter caps need adjusting. Depth Limit is preserved at existing room boundaries, even where that does not grant a completed canonical-floor bonus.

**Manual recall:** unlike v8 immediate `recall()` safe exit, recall must **set a pending request**. The character continues through the current canonical floor and exits safely **at the next floor boundary**, *or* a **hard 30-second fallback** from the recall request fires if progress is stalled/slow. The ordinary recall must never safely interrupt a floor. If the 30-second cap forces an exit mid-floor, this is an **exceptional interruption**, not a safe floor-boundary clear; exact penalty/failure labeling is still open (do not invent the room's injury type or grant the floor bonus). If the request is placed while already between floors, safe recall may resolve immediately. Prefer measuring the 30 seconds in **elapsed simulation/game seconds**, respecting pause/speed; confirm this timescale prior to implementation. Store pending-request elapsed time and phase in a save-safe manner. Standard depth limits continue working as they do now; they do not convert into a 30-second recall timer.

**Equipment processing order:** for each check/effective-value contribution, apply all relevant **Catchup** boosts first, then applicable **flat additions**, then **percentage multipliers**. A Catchup N modifier evaluates at least `max(value,(value+N)/2)`; it must not reduce already-high values. Gear does not satisfy any activity/Con-1/Composite Skill eligibility gate, even when it raises a weak base value. Multiple-item Catchup combination and percentage stacking are still open for the subsequent engineering specification.

**Implementation collisions to test:** `engine.ts` currently performs immediate `recall()`, calls `resolvedRoom` after each individual room, uses `run.floor` for room number, and starts with room-based depth caps. Refactor and test floor-boundary detection, timer timeout, injury/failure outcomes, XP credit only at true floor clear, capacity training persistence and post-return reset. Existing historical trip rules must migrate without duplicating rewards.

---

# Approved direction: room endurance, single-resource drain, and room-specific failures — November 6, 2026 (planned, NOT implemented)

**This supersedes the earlier proposed Constitution-as-a-weighted-check-component redesign and the earlier proposal to deplete other Attributes; the v8 executable engine described later is historical until the next PR.**

## Endurance pool and dungeon eligibility
- Dungeon entry requires **Con-1**: character possesses **at least one of the three authored Constitution Skills**: Toughness (Constitution × Combat), Endurance (Constitution × Travel & Logistics), or Vitality (Constitution × Recovery & Support). Merely having baseline Constitution 0.01 or gear that boosts checks does not create eligibility. Guild Master has none; Clyde can qualify via Vitality.
- Constitution is the **only consumable Attribute** for dungeon work. Endurance capacity is **proposed to equal the combined trained effective values** of owned Constitution Skills (Toughness + Endurance + Vitality); no other Attribute has a spendable Current pool. Final calculation (bonuses, baseline for owned-but-untrained skill, reset/training integration) is a tuning/implementation detail. A character with all three can reach a much higher pool than one with only a single Constitution Skill.
- Each room has a **flat Constitution drain rate per elapsed game second**, with that rate scaling by the floor/depth. This drain is **separate from weighted progress contributors**: a room need not include Constitution in its speed/check weights. If a room takes twice as long, it spends about twice as much Constitution. **Do not implement a once-per-room fixed charge**, which would eliminate the intended time-efficiency tradeoff. A final tick must pay its rate before completing; exact funding succeeds.
- The dungeon currently advances by **rooms**; ten rooms are one flavor floor. Author the drain rate per room, with floor scaling defined explicitly (e.g., floor index from room number / 10) rather than silently using the previous 1.04^room scaling. Work scaling and CON drain scaling may be tuned separately. Speed/time modifiers must use real elapsed game time consistently.
- **Every room defines an on-Constitution-depletion failure mode.** Apply that room's authored consequences when the character cannot pay the next tick; do **not** substitute an automatic safe retreat. Outcomes could include injury or more severe danger depending on the room, but their exact consequence catalog (loss/death/revival, reset, loot, etc.) still needs authoring. Existing manual recall, time limits and depth-cap exits are separate mechanics requiring review; "no running in a dungeon" rejects automatic escape on failed room checks.

## Progress and fallback
- For each check, sum the **original, unchanged weights** times each contributor's effective Skill value. If a defined Skill is absent, fall back to the underlying selected Attribute at its retention factor. If the Attribute is not specialized, use its **tiny baseline value (proposed 0.01), not zero**, so a nonspecialist is extremely slow but can contribute. Missing pairings in the visible 5×5 grid remain visually empty; fallback is an engine-level calculation, not a newly unlocked Skill. Never renormalize absent weights.
- A room with 90% Power and 10% Finesse must be very hard for scavenger Clyde: no Power means that 90% term uses the tiny Strength baseline (unless equipment boosts the check), leaving only his Dexterity fallback for the 10% Finesse share. His Constitution drains throughout the slow attempt.
- No blanket Combat Skill or Combat Composite gate on mandatory dungeon rooms. Individual **special activities** (herb harvesting and future crafted actions) may require specific learned **Composite Skills**. Missing such a gate does not prevent ordinary physical progress; classify author-defined opportunities as mandatory/optional consistently.
- Because only Constitution is spent, non-Constitution stat shortages cannot terminate an adventure. Avoid division-by-zero or infinite stalls if work progress is 0; with a 0.01 baseline and positive room weights progress should be positive, but validate data and fail according to room rules if it is not.

## Distinct speed/time effects and rollups (future extension)
- A group-specific check may use the **sum of the available three Skills under one Discipline**, e.g. Dungeoneering = Force + Finesse + Agility (only character-owned Skills contribute to the discipline total, with empty pairs contributing 0). Avoid double-counting individual weighted contributors when introducing a group rollup; content explicitly selects its calculation.
- Optional **Speed/Agility** (Speed × Dungeoneering) effects can shorten the duration between dungeon progress ticks; **Scouting** (Speed × Exploration) can improve exploration/discovery; **Movement** (Speed × Travel & Logistics) can shorten city trade travel. These are distinct authored mechanics, **not** global mandatory Speed gates. Tune interval minimums, speed diminishing returns and interaction with per-second Constitution drain.
- Later equipment types: **percentage multiplier** to a relevant check value, **flat additive value**, and **Catchup N**, proposed as raising a weaker effective value halfway toward N: `max(value, (value+N)/2)` (never reduces a strong value). Gear **never grants a missing base Skill or Composite Skill, never changes chosen affinities and never satisfies Con-1 or other activity gates**. It can still improve an otherwise weak check term, including baseline terms. Stacking order, category, scope and rarity/cost deferred.

## Implementation and regression requirements
The current executable `rooms.ts` hard-requires Combat level 1 on several mandatory rooms, charges all parent pools, and ties injury to the old Constitution check weights. Replace deliberately with a **single CON endurance pool, rate-based per-second drain, weighted work independent of endurance charging, authored failure modes**, and no automatic safe escape for room failure. Update room data, UI labels, elapsed time, simulation estimates, skill progression, stat training, equipment, save version/migration and regression tests together. Keep existing behavior on historical saves until a migration is specified; mark planned versus live behavior clearly.

---

# Proposed constitution-endurance dungeon redesign — November 6, 2026 (NOT implemented)

User direction: dungeon participation **does not require the Combat Discipline, Power, or the Combat Composite Skill**. Constitution specialization is the *entry* prerequisite. During combat and other rooms, progress uses each authored weighted Skill when available, otherwise that Skill's parent Attribute when selected; if that Attribute is unselected, its share contributes zero work. Missing shares are **not renormalized**. This applies equally to noncombat specialists such as the proposed Clyde scavenger (Dexterity, Constitution, Perception, Intelligence, Luck).

Each floor should require **some Constitution**, so Constitution is the expedition endurance/ultimate stopping resource. The current executable progression unit is a *room* (ten rooms are a flavor floor); **recommended implementation** is a nonzero Constitution component in every mandatory room/check, and perhaps all rooms. Confirm whether every room—including optional treasure—should drain Constitution rather than quietly treating flavor floors as atomic. Aim for ordinary expedition failure/return when the next Constitution cost cannot be paid, not automatic "Injured" on every routine return. Danger-specific injury can remain separate. Successful final ticks paid exactly should still complete once; never retroactively lose the room.

**Important engine conflict:** current `rooms.ts` has hard `requiredLevel:1` Composite Combat gates on mandatory scavenger/boss checks, and `roomCheckStep` rejects the whole tick when *any* parent pool cannot pay, before applying `checkRating` work. Also, only existing combat/trap checks use Constitution. These behaviors **must be revised** for Clyde to progress without Combat and for Constitution to be the universal failure resource. Suggested rule: when a non-Constitution pool cannot pay its slice, that slice stops contributing/consuming; other funded slices (especially Constitution) continue. Do not permit free progress from exhausted stat pools, and preserve atomicity per paid slice. Luck remains non-consumable. If no contribution can make progress, mandatory rooms must return safely rather than hang; optional rooms can skip. Keep a separate content-defined hard Skill gate for specialized optional actions (e.g. Herbology for herbs), not broad mandatory Combat permission.

Rebalance starter check work and cost/Con shares so a Constitution-specialized non-combat gatherer has a survivable, slower path; merely adding a tiny Constitution fraction to a high-work combat check can make it mathematically impossible at starter capacities. The inherited room cost/exact-final-tick, injury, migration, and ETA logic require regression tests. This text is proposed design, not a change to v8 gameplay.

---

# Assignment and run history — November 6, 2026

Each member has at most one repeating dungeon assignment, with a personal room cap. Assigning another destination replaces the waiting assignment; active destination, loadout and personal cap remain snapshotted. Waiting members are shown as Queued, separately from idle, healing and active expeditions. Dungeon headers display active/capacity followed by the waiting count, with a roster-ordered expanded list and live relevant stat pools. Active, disabled and healing members are excluded from that ready queue.

Each member stores per-dungeon farthest room and most recent return room/reason/detail/timestamp, independent of the compact event log. Reasons retain depth limit, resource exhaustion, injury, time limit, recall and carrying/missing-skill distinctions. A run tracks the last entered room so recall after clearing a room does not claim entry to the next. No old per-dungeon history is fabricated from the global best-room counter. Active older trips seed only observable current depth; historical outings show — until observed.

The deterministic weighted v7 engine remains current: no success RNG or generic Constitution drain, atomic weighted parent-pool payment, injury only on applicable Constitution exhaustion, walking home before healing, and uninjured immediate readiness. Earlier v6 formulas below are historical. New rarity/tier metadata does not change loot rates; joint rarity/tier/depth weighting remains deferred.

# Current dungeon engine — weighted seconds (save v7)

This section supersedes prior generated-room success-roll, retry, generic Constitution exertion and per-attempt cost descriptions below. Historical task/check engines remain for older prototype routes; the current Arya/Clyde opening uses weighted rooms.

Each authored check has a work requirement and weighted attribute contributions. Every one-second tick computes progress as the weighted sum of trained effective attributes (including existing parent fallback and equipment modifiers). It aggregates the same contribution weights into their parent resource pools and pays them once per second. Luck contributes progress without a consumable pool. The final tick pays in full. Room depth increases required work by 1.04^(room−1); costs per tick are not inflated separately.

Example: 75% Power + 25% Constitution, 300 work. Effective Power 100 / Constitution 10 gives 77.5 work each second and clears after four paid ticks: 3 Strength and 1 Constitution. Effective Power 200 gives 152.5 work and clears after two ticks: 1.5 Strength and .5 Constitution. Current resource depletion does not reduce the trained-value rate. No success roll occurs. Only room selection and eligible treasure finds are random. Costs are checked atomically before work; unaffordable ticks make no partial payment or progress. Exact funding of the final tick succeeds.

Constitution shortage during a funded-skill trap/combat encounter returns the member Injured. Other shortages return safely; missing mandatory skills return safely, and missing optional skills skip the opportunity. Injured members walk home, then use their existing recovery duration (currently 12 seconds). Current weighted-room fatigue, manual recall, cargo/room limits and time-limit returns have no healing delay or failed-dungeon log. Safe returns refill pools on arrival; healing completion refills injured members. Old fatigue-labeled failure history is hidden.

Arya starts with known Combat and Clyde with known Herbology. Other composite abilities stay undiscovered; checks do not spontaneously teach unowned skills. The boss requires Combat. Herbology alone gates herb access; there is no extra Perception minimum. Normal Catacomb rooms give one Chip. Boss completion reserves one Leather Scrap before any Chip reward. Treasure makes one eligible draw from Chips/Scraps/Herbs, with Herbs excluded without Herbology or sufficient carrying space. Early rooms do not drop Hides/Ore. All current rarity is Common.

Local-route ETA now forecasts a bounded isolated copy using the actual weighted engine and current RNG/state, without changing the real guild. It remains approximate because future assignment/action changes can affect the shared state. Carried drops, injury return state and partial work are validated/saved; v6 generated work is bounded into the new work requirement during migration.

# Dungeons and Expeditions — Current Rooms

Updated November 5, 2026. The new opening uses **rooms** as progression units; ten rooms represent a floor for flavor. Personal/global limits count rooms.

## Weighted room selection

Each dungeon owns group weights and a weighted room catalog within each group. Select a group, then a room within it. Catacomb group weights: Neutral 5, Combat 5, Trap 2, Puzzle 1, Boss 0.25, Treasure 2. Multipliers apply directly to weights, so doubling Trap doubles its relative rate. These are weights, not fixed percentages. Archive and delve have separate group distributions and room catalogs.

Neutral passages, scavenger combat, rusted snares, faded ritual puzzles, an oversized crypt beetle and forgotten caches/herb alcoves form the starter room catalog. Each room has ordered checks, applicable weighted attributes, a learned skill, optional minimum skill, costs, work and loot. Crypt Lore is a dungeon-specific skill.

Optional failure/ineligibility skips that room with no skill XP or loot. Mandatory failure retries the check; inability to fund required work returns the member home. All required resources must be affordable before work progresses. Successful checks alone award skill XP and pending attribute training. No death or punitive failure is introduced in these harmless starter catacombs.

## Difficulty and reward scaling

Difficulty and exertion grow **1.04^(room−1)**. Base room exertion is 0.063 Constitution × difficulty, reduced by equipped Constitution bonuses. Repeated check attempts also have small explicit resource costs. Loot budget is `1 + floor((room−1)/4) + a 0-or-1 roll`: linear progression, independent of exponential difficulty.

At full affinity, 100 seeded trials gave Clyde room 10, Arya room 20, and Clyde with Reinforced Leather Armor room 12. This comes from their pools and costs, not hardcoded character depth ceilings. Starting current maxima are lower, and optional/retry outcomes can affect individual results.

## Budgeted weighted loot

First roll a room’s integer budget, limited by remaining carrying capacity. Each draw selects among items that fit the remaining size, spends that item’s size and repeats. **Chips always remain a size-1, weight-1 fallback.** If budget 4 spends two size-1 Leather Scraps, size-3 Herbs become ineligible for subsequent draws. A Herb first leaves room for one size-1 result.

Resources carry rarity tiers; their relative weights improve smoothly with depth using `base weight × (1 + min(4,(room−1)/20) × rarity)`. Chips remain weight 1. Herbs need size 3 and Harvesting eligibility, with no hard depth gate: an early find is unlikely but possible once the budget fits. Arya cannot obtain herbs until she learns the required skill; Clyde starts able to harvest.

Loot, Chips and pending growth remain carried until arrival home. Cargo and storage have separate limits; overflow is discarded on deposit. See 03 for economy/caps and 02 for the fixed friends and stat budgets.

## Trips, persistence and future failure

Local outbound and return travel each take 15 game seconds. Travel is separate from exploration and 12-second recovery. Rooms, partial work, attempts, RNG, cargo, loadout and travel stages survive saves. The temporary 300-second exploration limit starts a safe return. Pausing/closed play does not advance timers.

Old active task/check routes preserve their rules on migration. Existing guilds can adopt room routes through the Arya/Clyde story action; current trips are not rewritten. A future death/revival timer should range from 4× toward 2× travel using a diminishing stat benefit, but death triggers and the governing stat remain undecided.

---

## Historical task-route contract

The following is retained for older saved outings only and is superseded by the room rules above for new departures using room routes.

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

## Per-dungeon capacity — November 5, 2026

Every authored dungeon has maxConcurrent, currently 1 for each. Outbound trips reserve a place, exploration keeps it, and starting home frees it for the next eligible member in roster order. The independent guild expedition cap still includes homeward trips. Members waiting for a full dungeon stay idle; their queue entry is not skipped. Active saved trips are retained and stop further departures while at/above cap.

## Compact dungeon event policy

Only assignment additions/removals, failed dungeon returns, successful boss-room completions and successful treasure-room completions enter Dungeon history. Optional skips, attempts, retries, normal room clears, travel and successful routine returns do not. Reward events store actual full-room drops, independently of display text; unfinished/skipped rooms do not receive a clear event. Manual recall and cargo/depth/time-limit returns are not marked failed. A resource-exhaustion retreat is marked failed once on arrival, using the shared healing icon. Display rarity is Common for all current rooms and drops; probability weighting remains independently tuned.
