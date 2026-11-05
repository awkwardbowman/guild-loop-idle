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
