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

Provisional defaults: guildmaster ordinary stats start at 12/60 maximum/affinity and Soul at 100/300. Newly introduced legacy member stats initialize at 12/60 without RNG changes. These numbers can be tuned without changing the accepted matrix.

## v5 compatibility

Might maps to Strength, old Agility to Dexterity, and Focus to Intelligence. Old Finger Dexterity values and pending training map to Finesse. Newly added roots and attributes initialize deterministically, with existing trained attributes, skill levels, affinity, current pools, carried training, trip/trade timers and RNG preserved. Historical v0–v4 conversions remain supported. Luck never creates a spendable child pool.


## Dungeon-specific checks and member matching

The accepted 27 attributes form the common foundation. Every dungeon can author its own ordered check series with different combinations. Each check has relative importance within the dungeon and weighted attributes within the check, each normalized to 100%. The overall dungeon attribute mix sums check importance × that check’s attribute weights. These planning weights are separate from live check speed, success, efficiency and resource charging; learned skill proficiency and affordability still determine actual outcomes.

The dungeon catalog displays the weighted attribute mix, per-check importance and combinations, plus an advisory weighted-capability score for a selected member. The score combines effective attributes with the planning mix; it is not a success probability or resource-survival guarantee. Initial profiles are provisional examples. The archive’s mix derives from its actual learned-skill dependencies; the starter and delve planning profiles accompany their existing fixed-task routes until their full bespoke check content is authored.
