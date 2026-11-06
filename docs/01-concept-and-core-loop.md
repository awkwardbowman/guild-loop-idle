# Concept and Core Loop

Status: Agreed direction. Updated November 5, 2026.

## Premise

A browser incremental game inspired by the planning and repeated-run progression of Idle Loops. The player is a guild master who recruits distinctive adventurers and sends them on missions. The loops belong to the adventurers, rather than to the guild master.

The player gradually improves expedition assignments and guild support, allowing the roster to accomplish more over repeated runs.

## Progression layers

| Layer | What changes | Persistence |
|---|---|---|
| Individual expedition | Current stat values are depleted; the adventurer advances through dungeon tasks | Run state resets for another expedition |
| Adventurer | Dungeon training raises maximum stats toward individual affinities | Stat growth benefits future runs |
| Guild / guild master | Recruitment, infrastructure, support capacity, and eventually affinity upgrades improve | Persists across adventurer loops; no guild reset initially |

The guild is conceptually a persistent prestige layer. A later guild reset system has not been defined or committed.

## Core cycle

1. Set guild-master priorities, such as recruitment and infrastructure.
2. Recruit adventurers with semi-random stats and individual growth potential.
3. Assign adventurers to dungeons, subject to guild support limits.
4. Resolve dungeon tasks, consuming current stats and generating stat training based on the dungeon.
5. Explore weighted rooms to a personal/global stopping depth; return through success, stat depletion, recall, or the expedition time limit.
6. Carry stat growth into the next run; successful dungeon runs return random loot from that dungeon's pool.
7. Improve the guild and refine assignments to sustain more adventurers and tackle harder content.

## Design intentions

- Adventurers should feel individually distinctive.
- Dungeon selection should give different stat distributions a purpose.
- Guild development should gate how many adventurers can be supported simultaneously.
- Repeated runs should make individual adventurers progressively more capable.
- The player should make planning and priority decisions as a guild master.

## Not yet specified

The current tabbed interface is specified in 10-game-interface.md; bottomless dungeons in 04-dungeons-and-expeditions.md and queue execution in 06-queues-and-assignment.md. Final balance, offline progression and broader content progression remain open. The game is inspired by a reference game's loop concept; it does not yet inherit that game's specific systems.

## Grounded opening — Accepted and implemented

1. Story introduces the player’s history in Emberveil, a small town reviving a thousand years after Threadless.
2. Introduce Arya and Clyde: low-tier friends with fixed, complementary profiles.
3. Found the guild; both friends join and the harmless Ritual Catacombs unlock immediately, with no equipment requirement.
4. Arya pushes deeper. Clyde has better scavenging/harvesting skills and can obtain herbs Arya cannot harvest.
5. The first stored Leather Scraps open a story action to meet **Gavin, Tanner and Barkeep**. His shop unlocks shared equipment and individual loadouts.
6. The first stored herb opens Gavin’s conversation. He does not buy herbs; with five herbs held, he gives directions to Stillmere’s herbalist without consuming the sample.
7. Extend gear, carrying capacity and resource storage; then investigate further dungeons.

The opening is optimistic and personal. The guildmaster cannot fight; unusually high Soul supports future magic. No chosen-one obligation or catastrophic starting threat is introduced.

Existing saves retain rosters, active trips and balances. They may opt into the new room routes through Current Goals → Meet Arya and Clyde, provided two roster spaces are available. Existing active routes retain their saved rules. Fresh history/founding is a new-guild flow; it does not overwrite established saves.

## Setting and magic direction — November 5, 2026

Use Threadless as inspiration roughly a thousand years after the campaign, without altering campaign canon. Emberveil is a small town beginning to revive; members venture into the nearby Ritual Catacombs, then reach further locations as the guild and town grow. The player guildmaster has unusually high Soul and is the sole innate magic user. Adventurers work through ordinary abilities and relics/artifacts. Their accepted nine-stat/27-attribute structure is maintained in 02; magic actions and new production chains remain future content.
