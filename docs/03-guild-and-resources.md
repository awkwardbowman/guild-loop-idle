# Small UI and lore polish — November 6, 2026

Global dungeon controls now live in top-level **Settings** (after Info), not Guild → Settings. Current guild upgrade presentation names are **Wayfarer's Dispatch Table**, **Guild Bunkhouse**, **Reclaimed Supply Stores** and **Emberveil Workroom**. Their existing stable IDs, costs and mechanical effects are unchanged. These labels are purely cosmetic and should not be confused with future equipment crafting.

---

# Current PR #7 implementation — shared settings (November 6, 2026)

Top-level Settings → Dungeon Defaults provides a global Depth Limit (initially Unlimited) and Insufficient Skill Threshold (initially 1%, 0% Off). Each expanded dungeon card can inherit or override both independently; explicit Unlimited differs from inheritance. Limits count rooms and apply at room boundaries. Assignment/member caps are removed from current saves and UI. A default change affects all inheriting dungeons, including active trips at their next boundary/room entry.

Armor's Constitution bonus now increases owned Constitution Skills' check effectiveness and the separate Endurance Capacity maximum. Equipment order is strongest Catchup → sum flat bonuses → sum percentages. Equipment never grants capability or eligibility. Existing raw stats, materials, prices, carrying limits and storage remain intact. Recipe execution, other resource chains and final balance remain deferred.

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Current resource and equipment classification — November 6, 2026

Resource and equipment definitions now hold rarity and tier separately. Existing drops/equipment remain Common. Leather Scraps are T1, Animal Hides T2, Ore T2 and Herbs provisionally T3. Resource tooltips expose both fields; shop tags show rarity and tier. Stable IDs, quantities, costs, bonuses, carrying sizes, loot probabilities and loadout behavior are preserved by this classification pass. This sits on top of the prior weighted-engine/shop pass: equipment capacity is per ally tier; Chips are uncapped; storage offers bulk purchases; Gavin's shared requests consume their fixed materials and teach a selected ally before gear purchases. Earlier global shop-slot ceilings below are historical. No new rarity/tier equip restriction is introduced. Hardened Hide, Scales, ore-family extensions and lore renaming remain future content; a tier-aware loot curve is deferred until balanced and validated.

# Current guild, shops and storage — save v7

Supersedes global equipment-capacity purchases and the standalone Resources page below. Equipment capacity equals each ally’s tier, independent of item tier; each starter equips one item. Purchased templates remain guild-wide. Removed shop capacity offers/API is a no-op compatibility entry point. Existing owned gear is retained, with excess equipped pieces removed when importing pre-v7 saves. Legacy owned templates grandfather their purchase access.

Shops groups by city, currently Emberveil/Gavin and unlocked Stillmere/Elder Ash. Each shop has Shop and Requests tabs. Gavin’s two requests also render in Current Goals using the same completion API/state. Stable request IDs, actor instance IDs, resource IDs and skill IDs are separate.

- gavin_leather_lesson: 12 Leather Scraps (the initial storage cap), consumed once. Choose an Arya/Clyde instance; Guild Master cannot be taught normal skills. Learner receives known Leather Crafting level 1; the permanent progression event unlocks shared armor/satchel purchases and reveals the first crafting assignment card. Its actual recipe/action is deliberately deferred.
- gavin_herb_referral: 5 Herbs (initial cap), consumed once. Unlocks Stillmere and Gavin’s herbologist friend Elder Ash. Upgraded storage caps do not change either request cost.

Purchase rows put fixed-width item-tier tags on the left. Bought rows are gray, affordable unlocked rows green, and other rows use the standard palette. Each cost shows owned/required: gray for insufficient stock, red if storage capacity is below the requirement, green if funded. Hide maxed purchases hides owned templates.

Storage, pinning and timed selling now live in Guild → Storage. Resource sidebar has no pinned-count label; each pinned value shows owned/max, red when full. Chips has infinite storage and no cap purchase; its stored numeric legacy cap is ignored. Capacity quantity options are 1/10/100/Max upgrades. Prices sum all sequential exponential upgrades; fixed batches are atomic, while Max chooses all affordable upgrades within the existing level/number limits.

Attention symbols for recruits/healing/idle remain at fixed positions even at zero; other activity counts use a matching spacer so numbers align. Top main navigation never includes these indicators.

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
