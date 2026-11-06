# Guild and Resources

Updated November 5, 2026. Current opening supersedes the prototype consumable-gear economy.

## Currency

**Chips replace Gold entirely.** Chips / Pebs / Bowls are rock-based denominations (chips, pebbles, boulders), analogous to bronze/silver/gold. All current accounting and prices use Chips; higher denomination conversion ratios are not invented yet. Old Gold balances, carried rewards, pending sale quotes and pins migrate 1:1 to Chips.

## Guild tabs

- **Guild Master:** the player’s own stats, attributes and future magic. The guildmaster cannot fight.
- **Guild Hall:** recruitment/infrastructure priorities, roster and expedition capacity, and hall upgrades.
- **Storage:** per-resource quantities, caps and paid cap increases.

Member dispatch order remains distinct from guild work priorities. Internal worker assignments and automation are future systems. No passive stat or gear regeneration starts enabled in a new guild.

## Storage and carrying

Each resource has its own storage cap. Starter caps: Chips 80; Leather Scraps 12; Animal Hides 8; Ore 8; Herbs 5; Building Materials 10. Old resources remain supported in existing saves.

Each cap upgrade costs `ceil(5 × 1.25^level)` Chips; the selected cap becomes `ceil(cap × 1.2)`, at least +1. Only the selected resource changes. Values are provisional slow exponential defaults.

Carrying capacity is separate from guild storage. Item size counts toward both the room loot budget and carried cargo, but stored caps count resource quantities. Arya carries size 72; Clyde 36. Chips use size 1; Leather Scraps 1; Animal Hides/Ore 2; Herbs 3. Cargo is deposited only on arrival home. Items exceeding individual storage caps are discarded and logged; no automatic sale or unclaimed overflow is created.

The guildmaster may later learn compression magic. Storage tabs may later auto-sell when a guild member is assigned to that work. Both are future scope, not active passive systems.

## Gavin’s equipment shop

Gavin is Emberveil’s **Tanner and Barkeep**, doing both jobs in a small town. The first Leather Scraps enable his story unlock and Shops tab. Equipment purchases unlock reusable templates for the entire guild; each member independently equips unlocked pieces while home. There is no single shared copy to fight over.

- Rough Leather Armor: tier 1, +10% Constitution effectiveness, 4 Chips + 3 Leather Scraps.
- Reinforced Leather Armor: tier 2, +25% Constitution effectiveness, 12 Chips + 8 Leather Scraps.
- Leather Satchel: tier 1, +12 carrying capacity, 5 Chips + 4 Leather Scraps.

Armor reduces constitution exertion and benefits relevant check capability; it does not create permanent stat growth or passive regeneration. Equipment is snapshotted for an outing.

Equipment capacity is guild-wide, applied per member. Gavin supports an absolute maximum of 1; Stillmere’s herbalist supports 5, even if Gavin’s slot purchase was skipped. Each next slot costs `4 × 2^current capacity` Chips. A later shop’s ceiling is absolute, not an additive bonus.

## Herbs and trade

The first herb enables a conversation with Gavin, who will not buy it. Once the guild holds 5 herbs, he provides directions to Stillmere; the sample is not consumed. Herbs can then be sold to the herbalist. Sales commit inventory immediately and pay Chips after a 15-second game-time trade. Overflow of sale proceeds is also discarded and logged if Chips storage is full.

Future guild affinity upgrades, traits, compression, worker assignments and automatic spending remain distinct from current equipment/storage purchases. Legacy consumable gear and gear regeneration are retained only for established saved task routes; new room routes need no dispatch gear.
