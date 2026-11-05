# Adventurers and Stat Growth

Updated November 5, 2026.

## Recruitment and identity — Agreed

- Recruits have semi-random stats and should be individually distinctive.
- Each stat has a Current Value, Max Value, and Stat Affinity.
- Higher-tier adventurers have higher average affinities. Tier does not imply identical stat distributions.
- Exact tiers, roll distributions, starting maximums, traits, classes, and recruit replacement rules are open.

## Three layers per stat — Agreed

| Field | Meaning | Lifetime |
|---|---|---|
| Current Value | Available amount of the stat during this run; tasks consume it | Run-specific |
| Max Value | The amount available at the start of a run; increases through training | Persists between runs |
| Stat Affinity | Growth potential for this stat; determines how high its maximum can grow | Individual baseline, with future guild modifiers |

Any current stat reaching zero causes retreat. These stats therefore act as expedition resource pools as well as measures of ability.

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
