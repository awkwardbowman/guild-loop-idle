# Guild and Resources

Updated November 5, 2026.

## Guild master — Agreed

The player manages priorities such as recruitment and infrastructure. The guild persists while its adventurers perform their individual loops. There is no guild-master reset initially.

How priorities are expressed is open: weighted allocation, ordered priorities, toggles, or another interface. A specific allocation system has not been approved.

## Adventurer dispatch priority — Agreed

The player maintains an ordered list of guild members. The continuous-time prototype considers eligible members in roster order whenever support becomes available, superseding the old day-start-only dispatch default. This member ordering is a separate control from the guild master's recruitment/infrastructure priorities. Detailed scheduling and future eligibility rules are defined in 06-queues-and-assignment.md.

## Support resources — Agreed direction

The guild has limits and replenishment systems that gate simultaneous expeditions. Explicitly named concepts:

| Concept | Intended purpose | Unresolved detail |
|---|---|---|
| Max capacity | Limits the number of adventurers the guild can support | Total roster, simultaneous deployment, or separate limits? |
| Gear capacity | Limits equipment support available for expeditions | Consumable stock, reserved loadout capacity, or durable item inventory? |
| Gear regeneration | Replenishes the equipment support resource over time | Rate, cap, costs, and when gear is consumed or returned? |

Other support resources may be added later. None are yet specified.

Supporting an adventurer should depend on available guild resources, not simply whether a recruit exists. Dungeon-specific resource requirements also affect deployment; the exact split between guild costs and adventurer stat costs is open.

## Infrastructure — Agreed category, details open

Infrastructure is a guild-master priority. Specific buildings, upgrade paths, costs, currencies, and production rules have not been selected.

## Recruitment — Agreed category, details open

Recruitment produces semi-random adventurers. Higher tiers have higher average Stat Affinity. Recruitment timing, costs, candidate offers, tier unlocks, and dismissal or replacement rules are not decided.

## Affinity improvement — Future, agreed

Guild-master upgrades will eventually improve affinity. An additive modifier is a candidate implementation. See 02-adventurers-and-stat-growth.md for the formula direction and unresolved scope.

## Proposals that are not requirements

- Research as an additional priority.
- Specific buildings or resource types.
- A later guild prestige/reset system.
- Automatic spending rules or recruitment automation.

## Resource interface and future returns

Resources has its own main tab. Players can pin chosen resources to the collapsible left-sidebar resource display. See 10-game-interface.md.

The baseline separates member roster capacity and simultaneous expedition capacity, consumes gear once on dispatch, and regenerates gear continuously to its cap. These are provisional accounting choices. Early successful returns may eventually refund unused Gear/Supplies to speed future departures; refund percentages, supply units, caps and reservation accounting are undecided and not implemented.

Guild is the main guildmaster tab, including a reserved future skill-tree area. Affinity upgrades belong to that future development; no tree nodes or costs are currently approved.
