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
5. Descend bottomless floors to a personal/global stopping depth; return through success, stat depletion, recall, or the expedition time limit.
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

## Grounded opening — Current direction

You grew up watching adventurers and wanted to be part of that world. You are not an adventurer yourself, but you believe you can build and lead a guild. One friend shares the idea and becomes its first adventurer. The initial ambition is to make this small guild work and grow it.

The earlier reincarnation/demon-king premise was considered and rejected. Do not introduce a chosen-one destiny, hidden personal powers, a world-saving obligation or a catastrophic starting threat without a new design decision. The opening is optimistic and personal; not being an adventurer does not make the protagonist a failure.

### Implemented first beats

| Step | Story / action | Unlocked |
|---|---|---|
| Introduction | Establish the protagonist's interest in adventurers and the friend beside them | Only Story, with Current Goals and Plot |
| Open the guild | Commit to starting together | Guild and utility Info |
| Welcome your first member | The friend joins as the guaranteed first member | Members |
| Prepare to grow | Open ordinary recruitment and discover the first manageable expedition | Existing recruitment / first-dungeon systems |

The friend is temporarily named “Your friend”; no final name, gender, backstory, class, unique trait or authored stat profile is established. Current stats use the prototype seeded recruit generator. The first dungeon remains the prototype trail; names, the exact first job, narrative copy and later opening beats remain open. A newly joined friend has no queued dungeon until discovery, preventing spoilers before the feature unlock.

Existing saves keep established guilds and rosters; they are not reset or given a second founding friend. Opening actions and the friend grant are one-time events. Clock/work cannot start before the guild opens. Save loading remains available from the Story-only screen.


## Setting and magic direction — November 5, 2026

Use Threadless as inspiration roughly a thousand years after the campaign, without altering campaign canon. Emberveil is a small town beginning to revive; members venture into the nearby Ritual Catacombs, then reach further locations as the guild and town grow. The player guildmaster has unusually high Soul and is the sole innate magic user. Adventurers work through ordinary abilities and relics/artifacts. Their accepted nine-stat/27-attribute structure is maintained in 02; magic actions and new production chains remain future content.
