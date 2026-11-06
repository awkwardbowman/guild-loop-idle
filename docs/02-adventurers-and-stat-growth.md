# Proposed role and activity eligibility refinements — November 6, 2026 (NOT implemented)

The Guild Master remains explicitly **without Constitution**, and therefore cannot dungeon-run. Arya must retain the **Power** Skill (Strength × Combat). Clyde must select **Constitution, Perception and Dexterity**, plus **Crafting** Discipline, and may be a non-Combat dungeon scavenger: the proposed five Attributes are **Dexterity, Constitution, Perception, Intelligence, Luck**; proposed five Disciplines are **Crafting, Exploration, Management, Recovery & Support, Trade**. This preserves Scavenging (Observation + Discovery), Herbology/Harvesting (Handiwork + Observation), Leather Crafting (Handiwork + Design), and additional lore/research aptitudes. Clyde's full list is a suggestion awaiting final approval.

**Proposed progress rule:** weighted dungeon checks use trained Skill Value; if the defined Skill is unavailable but its Attribute is selected, use a reduced parent-Attribute fallback; if the Attribute is not selected, that component contributes **zero**, despite the character's displayed baseline-1 competence. Do not normalize surviving weights. This explicitly separates **baseline display** from **effective weighted work**. No Combat/Power/Combat Composite prerequisite for general dungeon entry; Constitution selection is enough. The content-defined specialized action gates (e.g. Herbology) are separate.

**Proposed action eligibility gates** (not blanket tab locks): no selected **Charisma** → character cannot perform Recruitment assignments; no **Intelligence** → Research assignments (future); no **Perception** → Scavenging; no **Constitution** → dungeon expedition. Strength, Dexterity and Speed are predominantly weighted dungeon efficiency; Luck and Soul provide atypical situational effects but are not universal hard locks. The Guild Master has Charisma/Intelligence for guild-level Recruitment and Research, so those tabs must not be hidden because other members lack those stats.

**Engineering caution:** if a non-Constitution resource drains to zero, either stop the related contributions and keep funding the remaining slices, or define another explicit exhaustion rule. To make Constitution the sole expedition end condition, the current all-or-nothing pool-cost check must change and Constitution must appear at least once per progression unit. When it depletes on a danger check, injury vs normal exhausted return should be separately specified. Ensure no zero-progress mandatory-room infinite loops.

---

# Planned specialization redesign — November 6, 2026 (design only, NOT implemented)

## Terminology and structure
- **Attributes**: the nine existing roots: Strength, Dexterity, Constitution, Speed, Perception, Intelligence, Charisma, Soul, Luck.
- **Disciplines**: the nine existing activity groups: Combat, Dungeoneering, Exploration, Crafting, Social, Trade, Travel & Logistics, Recovery & Support, Management. This replaces ambiguous "Types"/"Skills" labels for the activity axis.
- **Skills**: pairwise Attribute + Discipline combinations. Example: Strength + Combat = Power. The existing 27 named specializations are renamed to Skills, without automatically rewriting save IDs.
- **Composite Skills**: separate learned capabilities drawing on multiple authored Skills (e.g. Lock Picking). Replace "learned skills" nomenclature with Composite Skills.

## Character affinities
Every character specializes in five of the nine Attributes and five of the nine Disciplines. All unselected Attributes and Disciplines retain baseline competence **1** but are normally untrainable. Only Skills consistent with a character's selected axes are trainable; Composite Skill learning requires matching authored Skill prerequisites. Exactly how prerequisites are checked remains to be specified.

Selecting **Constitution** as one of the five Attributes is required to enter a dungeon; baseline Constitution 1 is not sufficient. This is an eligibility check, separate from ordinary resource depletion once deployed.

The **Guild Master** chooses the five nonphysical Attributes: Perception, Intelligence, Charisma, Soul and Luck. Strength, Dexterity, Constitution and Speed are baseline only. The Guild Master cannot dungeon-run; the five Guild Master Disciplines still need deciding. Innate magic remains exclusive to the Guild Master.

## Skill matrix and visual conventions — APPROVED
Display each character's five selected Attributes against five selected Disciplines in a compact **5×5 matrix** with **25 fixed positions**. A cell displays a Skill **only when that exact Attribute + Discipline pairing exists in the authored catalog**. Otherwise the cell is **empty**—no invented Skill, placeholder name, numeric value, or locked marker. Example: Perception × Combat is blank. This is an approved decision, not a pending catalog expansion. Each populated Skill cell shows trained **Value**; on hover/focus/tap, show **Potential**, but only after the relevant unlock (otherwise unknown). Discipline-only symbols are neutral **black**, not individually keyed to a red Combat icon. Each Skill uses the Discipline symbol tinted by its Attribute color: Power uses the Strength-colored Combat glyph.

Color-code **the actual numeric Skill Value text itself**, not an additional circle, dot, badge or progress icon: red below 75% of Potential; yellow from 75% to below 90%; green at/above 90% as the provisional equality convention (exactly 90% remains to confirm). The Discipline/Skill glyphs still identify skill categories and Attribute associations, **not training percentage**. Accessibility must not depend on hue alone: reveal a textual ratio/label on focus/tap/hover. Keep run-specific Current/Max Attribute resource pools distinct from training Value/Potential.

## Blocking design questions for the next implementation PR
The current game authors **27 named pairs in the full 9×9 matrix**, not every pairing. **Approved:** retain that catalog; a selected 5×5 always shows 25 grid positions, but undefined intersections stay empty (e.g. Perception × Combat). Do not author new Skills merely to fill the matrix. Still specify Arya, Clyde and normal recruit five/five picks; how baseline 1 interacts with existing 10^tier budgets and resource pools; how Composite Skill prerequisites work; which five Disciplines belong to Guild Master; whether selection can change; and safe migration of already-trained stats, skills, active trips and legacy saves. **Retain v8 behavior until implemented and tested.**

---

# Current classification — November 6, 2026

Rarity is the broad class; Tier is a separate, open-ended positive rank within it. Both are stored and displayed for members and recruitment candidates. Arya and Clyde are Common T1 and retain affinity total 10, starting maximum total 9, learned identities and normal starter equipment access. Existing saves receive Common classification without rewriting stats. No tier boundary automatically changes rarity; future Rare recruits should have correspondingly higher tiers, not an assumed Rare T1. Current Common recruitment keeps its prior distribution and provisional 10^tier budget. Cross-rarity affinity curves and recruitment distributions remain future balance work. The tier-10 validation ceiling is removed; safe-integer serialization limits are technical guards, not content progression limits.

# Adventurers and Stat Growth

Updated November 5, 2026.

## Recruitment and identity — Agreed

- Recruits have semi-random stats and should be individually distinctive.
- Main stats retain Current Value, Max Value, and Stat Affinity. Only costs explicitly assigned to consumable stats drain Current Value; Luck is a non-consumable modifier.
- Higher-tier adventurers have higher average affinities. Tier does not imply identical stat distributions.
- Exact tiers, roll distributions, starting maximums, traits, classes, and recruit replacement rules are open.

## Three layers per stat — Agreed

| Field | Meaning | Lifetime |
|---|---|---|
| Current Value | Available amount of the stat during this run; tasks consume it | Run-specific |
| Max Value | The amount available at the start of a run; increases through training | Persists between runs |
| Stat Affinity | Growth potential for this stat; determines how high its maximum can grow | Individual baseline, with future guild modifiers |

Required consumable stats act as expedition resource pools as well as measures of ability. Insufficient resources for required work force return. Luck reaching zero does not cause retreat, and Luck cannot fund a resource charge.

Current values refill for a new run. Each member now has an independent reset cooldown; the playable default is 12 seconds, with a future member stat likely controlling duration. Growth improves the maximum for the next run; it should not be assumed to refill the current run's depleted pool.

## Dungeon-driven training — Agreed direction

The dungeon and its tasks determine the stats trained and their training amounts. Growth depends on the gap between the adventurer's current maximum and that stat's affinity. The closer the maximum gets to affinity, the slower further growth becomes.

The discussion accepted this simple working formula:

```text
Max gain = Dungeon training × (1 − Max Value / Stat Affinity)
```

Example for Max Value = 20 and Dungeon training = 2:

| Stat Affinity | Gain |
|---|---:|
| 40 | 1.0 |
| 100 | 1.6 |
| 200 | 1.8 |

These numbers illustrate the relationship; they are not final content or balance values. This normalized gap formula is the current working model, not a finalized implementation contract.

## Timing and numerical rules — Open

- Whether training is accumulated and applied at return, or the persistent maximum updates during a run while the current pool stays unchanged. The accepted description places the benefit in the next run.
- Whether successive training events use an updated maximum or a snapshot from the start of the run.
- Whether unsuccessful runs retain all, some, or none of their accumulated training. Retaining some training was proposed, but not explicitly settled.
- Whether only completed tasks award training, or partial tasks can award it too.
- Fractional precision, display rounding, and save precision.
- Handling zero or negative affinity and maximums at or above effective affinity. A nonnegative gain clamp and positive affinity validation are implementation proposals, not approved rules.

## Guild-master affinity upgrades — Future, agreed

The guild master will eventually unlock upgrades that improve adventurer affinity. An additive bonus is an intended possible approach; its exact placement is not fixed.

Proposed representation:

```text
Effective Affinity = Base Stat Affinity + Guild Affinity Bonus
Max gain = Dungeon training × (1 − Max Value / Effective Affinity)
```

Keep the adventurer's rolled affinity conceptually separate from guild-derived bonuses so individual identity can be preserved. This separation is a documentation/modeling proposal.

Still open: global versus stat-specific bonuses, whether bonuses affect existing recruits, unlock costs, and whether future modifiers can multiply as well as add.

## Traits — Future agreed direction

Traits will determine or modify member stats and related properties. Example only: **Pampered** might increase reset time and gear requirements in exchange for an advantage elsewhere. The benefit is deliberately undecided. No trait list, rolls, numerical modifiers, interactions, or balance is approved yet; traits are documented only, not applied in the prototype.

The current implementation uses completed-task training, accumulated until return and evaluated against the starting maximum, nonnegative gain clamped to affinity. Failed/partial tasks award no training; earlier completed training is retained on retreat. These are working defaults pending tuning. See 04-dungeons-and-expeditions.md.

## Attribute and skill foundation — Agreed direction, prepared in 0.3

The accepted main stats and their 27 specializations are listed below. A specialization is a capability beneath a main stat, not an extra resource bar. Finesse spends underlying Dexterity when used to fund work. Multiple contributing roots each pay their part of a check cost. Not every stat must be consumed in a dungeon; Luck is explicitly a modifier. No Physical wrapper is established.

Learned skills are a separate tree/catalog, all capped at level 99. Lock Picking uses 75% Finesse and 25% Design (under Intelligence) in the current definition. Specialization fallback extends through ancestors, retaining less contribution at each step, without counting the same capability repeatedly. Each check can configure speed, success and resource efficiency separately, with different contributing skills/ratios. Intelligence-heavy speed and dexterity-heavy success are intentionally supported.

Skill deterioration through disuse is future agreed direction. Save records include last-used timestamps; decay is disabled. Grace period, rate, retained minimum and recovery remain undecided. Attribute affinity improvements stay limited/future, not a routine skill reward.

The technical contract, provisional formulas, sample progression and save v5 behavior are in 11-progression-and-check-foundations.md. The 9 × 3 matrix is accepted; numerical balance and further skill content remain provisional.


## Accepted nine-stat / nine-activity matrix

Each of nine main stats has three attributes. Each of nine activity groupings has three attributes, for 27 unique matches. Role labels describe primary uses; checks may combine attributes across roles. Learned skills such as Lock Picking are separate.

| Main stat | Attribute | Activity grouping |
|---|---|---|
| Strength | Power | Combat |
| Strength | Force | Dungeoneering |
| Strength | Hauling | Travel & Logistics |
| Dexterity | Precision | Combat |
| Dexterity | Finesse | Dungeoneering |
| Dexterity | Handiwork | Crafting |
| Constitution | Toughness | Combat |
| Constitution | Endurance | Travel & Logistics |
| Constitution | Vitality | Recovery & Support |
| Speed | Agility | Dungeoneering |
| Speed | Scouting | Exploration |
| Speed | Movement | Travel & Logistics |
| Perception | Observation | Exploration |
| Perception | Insight | Social |
| Perception | Diagnosis | Recovery & Support |
| Intelligence | Design | Crafting |
| Intelligence | Appraisal | Trade |
| Intelligence | Planning | Management |
| Charisma | Persuasion | Social |
| Charisma | Bargaining | Trade |
| Charisma | Leadership | Management |
| Soul | Attunement | Crafting |
| Soul | Resilience | Recovery & Support |
| Soul | Inspiration | Management |
| Luck | Discovery | Exploration |
| Luck | Serendipity | Social |
| Luck | Opportunity | Trade |

Combat combines offense and defense. Dungeoneering overcomes environmental obstacles; Exploration discovers routes, hazards and resources. Social concerns people/relationships; Trade concerns economic value. Travel & Logistics moves people/goods; Recovery & Support restores readiness; Management organizes people/work. Crafting includes making, repairing and improving equipment and working with artifacts. These categories are data definitions, not claims that every corresponding activity has been implemented.

## Guildmaster and magic

The guildmaster has a separate permanent nine-stat/27-attribute profile and unusually high Soul. Only the guildmaster has innate magic; adventurers rely on relics/artifacts. Soul alone does not make an adventurer a spellcaster. Attunement supports artifact compatibility, Resilience mental/spiritual recovery and Inspiration morale. The player can eventually provide magic for imbuement while members provide material/design/attunement work. Spell actions, imbuement production and revival mechanics are not implemented yet.

Historical v5 defaults (superseded for new guilds): guildmaster ordinary stats started at 12/60 maximum/affinity and Soul at 100/300. Newly introduced legacy member stats initialize at 12/60 without RNG changes. These numbers can be tuned without changing the accepted matrix.

## v5 compatibility

Might maps to Strength, old Agility to Dexterity, and Focus to Intelligence. Old Finger Dexterity values and pending training map to Finesse. Newly added roots and attributes initialize deterministically, with existing trained attributes, skill levels, affinity, current pools, carried training, trip/trade timers and RNG preserved. Historical v0–v4 conversions remain supported. Luck never creates a spendable child pool.


## Dungeon-specific checks and member matching

The accepted 27 attributes form the common foundation. Every dungeon can author its own ordered check series with different combinations. Each check has relative importance within the dungeon and weighted attributes within the check, each normalized to 100%. The overall dungeon attribute mix sums check importance × that check’s attribute weights. These planning weights are separate from live check speed, success, efficiency and resource charging; learned skill proficiency and affordability still determine actual outcomes.

The dungeon catalog displays the weighted attribute mix, per-check importance and combinations, plus an advisory weighted-capability score for a selected member. The score combines effective attributes with the planning mix; it is not a success probability or resource-survival guarantee. Initial profiles are provisional examples. The archive’s mix derives from its actual learned-skill dependencies; the starter and delve planning profiles accompany their existing fixed-task routes until their full bespoke check content is authored.


## Starting budget and tiers — Current v6

Tier potential is **10^tier total across the nine core stats**, not ten points per stat. Tier 1 has 10; tier 2 has 100; tier 3 has 1,000. New recruits divide their tier budget across nine affinities. Current/max totals start below potential. The first two recruits have fixed tier-1 allocations; each starts with a core maximum total of 9 and affinity total of 10. All initial skill levels are at most 4.

| Stat | Arya affinity | Clyde affinity |
|---|---:|---:|
| Strength | 2 | 0.4 |
| Dexterity | 1.8 | 0.7 |
| Constitution | 2 | 0.8 |
| Speed | 1.4 | 0.5 |
| Perception | 0.8 | 1.8 |
| Intelligence | 0.5 | 1.6 |
| Charisma | 0.4 | 1.4 |
| Soul | 0.4 | 1 |
| Luck | 0.7 | 1.8 |

Starting maximum/current = 90% of the listed affinity. Arya starts Combat 3, Athletics 2, Lock Picking 1. Clyde starts Scavenging 4, Harvesting 2, Observation 2, Crypt Lore 1. Unlisted learned skills start at zero. Harvesting requires level 1, so Arya cannot self-train it through failed checks or roll herbs from incidental loot. Clyde can. Root and specialization experience is awarded from successful checks; failures grant no skill XP.

New guildmaster current/max total is 10: Soul 8 and 0.25 in each other stat, with higher affinity reserved for future progression. These replace the large v5 starting numbers. Old saves preserve their previous stat values as legacy profiles instead of shrinking existing adventurers. The exact 27-attribute matrix above is unchanged.
