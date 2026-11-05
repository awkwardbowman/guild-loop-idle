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
5. Return through success, stat depletion, or the expedition's time limit.
6. Carry stat growth into the next run; successful dungeon runs return random loot from that dungeon's pool.
7. Improve the guild and refine assignments to sustain more adventurers and tackle harder content.

## Design intentions

- Adventurers should feel individually distinctive.
- Dungeon selection should give different stat distributions a purpose.
- Guild development should gate how many adventurers can be supported simultaneously.
- Repeated runs should make individual adventurers progressively more capable.
- The player should make planning and priority decisions as a guild master.

## Not yet specified

Exact controls for expedition plans, repeat automation, offline progression, run duration, stat names, dungeon structure, and the broader content progression remain open. The game is inspired by a reference game's loop concept; it does not yet inherit that game's specific systems.
