# Current PR #7 implementation — one assignment, shared settings (November 6, 2026)

A member has one repeating `{dungeonId}` assignment. There is no assignment cap or active personal cap in v9. Shared per-dungeon Depth Limit inherits the global default unless explicitly overridden, including explicit Unlimited. Members keeps assignment, pause, recall and history controls; Activities holds expanded dungeon settings. Old API callers may submit a retired cap, but it is ignored and never persisted. Migration removes unequal individual caps without restricting the dungeon to their minimum.

New room dispatch requires an owned Constitution Skill and respects dungeon/guild capacity. Ineligible assigned actors show the reason and do not appear in the ready queue. Active trips preserve destination/loadout; assignment edits affect future departure. Recall now queues to the next ten-room boundary with a separate 30-game-second exceptional fallback; see [04](04-dungeons-and-expeditions.md).

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Current single assignment — November 6, 2026

This supersedes multi-entry queues, duplicate destinations, reordering and cycling below. Each member has zero or one repeating dungeon assignment; the engine rejects multi-entry edits. Assigning a different dungeon replaces that destination. Removing an assignment prevents future departure while an active trip finishes normally. Roster priority determines dispatch and visible waiting order. Queued members are counted separately from idle; healing remains a distinct state, and active/disabled/healing members do not count in the ready dungeon queue.

Each assignment retains a personal room cap; global caps retain their existing behavior. Edits affect future trips; active snapshots are preserved. Save v8 migrates each old route to its saved next entry and resets its index to zero, preserving active trips and stats. No historical per-dungeon run data is invented. Member Assignments shows current activity and contextual actions, unlocked dungeon choices, personal cap and member-specific dungeon history. Crafting recipe/execution design remains deferred, so the unlocked Leather Crafting entry remains a placeholder rather than an assignable job.

# Queues and Assignment

Updated November 5, 2026 for the continuous-time redesign.

## Required controls

The player orders guild members for dispatch priority. Each member has a simple ordered dungeon queue with add, remove, reorder and a personal max depth for each entry. Dungeon-wide max depth lives in Activities → Dungeons and applies to all members. Blank depths mean unlimited; the lower configured limit wins.

These controls are distinct from guildmaster recruitment/infrastructure priority.

## Current execution defaults (provisional)

- Time advances continuously; the old manual 60-second Start Day and daily queue resets are superseded.
- Eligible members are considered in roster order whenever time advances, and immediately on the first resume. Expeditions may overlap up to guild capacity.
- Skip active members, disabled assignments, resetting members, empty queues, unsupported gear costs or full expedition capacity. Reconsider later when support is available; affordable later members may depart first.
- One queue entry is one outing. On any return, advance to the next entry, cycle at the end, then wait that member's cooldown. The same dungeon may appear more than once with different depths.
- Stats refill only at dispatch. A new run consumes one dungeon gear charge.
- Queue edits affect future departures. The active dungeon and personal limit are snapshotted. Global dungeon caps remain live, applied at floor boundaries.
- Queue editing restarts the pending queue pointer at entry one. An already active outing still advances once on return. This policy is provisional and merits a later UX decision.
- Member priority edits affect subsequent dispatch immediately. Pausing assignments lets an active outing finish. Manual recall safely returns the member and starts their reset.
- Midnight advances the calendar without ending outings or restarting queues.

## Future assignment preferences

Minimum/maximum Stat Affinity filters can skip members who do not match a dungeon's preferences. These are not in the current build. Open: which stats, base versus effective affinity, inclusivity, combined rules, invalid ranges and fallback order.

Other open scheduling decisions: starvation/fairness policy under tight support; queue advancement on future penalized failure; per-member reset-stat formulas; late-day dispatch policies if a daily planning mechanic is reintroduced. Roster priority can favor earlier members when gear is scarce; current cooldowns allow other members to use freed capacity.
