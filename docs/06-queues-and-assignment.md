# Queues and Assignment

Updated November 5, 2026.

## Intent — Agreed direction

The initial functional setup needs two basic ordered lists: guild-member dispatch priority and each adventurer's dungeon queue. Advanced assignment preferences are deferred.

## Guild-member dispatch queue — Initial requirement, agreed

- Maintain guild members in a player-defined order.
- At the start of a day, consider members for adventure assignment in that order.
- Guild support limits still gate which expeditions can be launched.
- This order determines priority for assignment and access to limited support resources.
- Reordering is required; the exact interface (drag-and-drop or move buttons) is not specified.

Queue order is separate from the guild master's priorities such as recruitment and infrastructure.

"Adventure in that order" establishes dispatch priority. It does not yet settle whether expeditions overlap or must run sequentially. Do not assume only one adventurer may be active.

## Adventurer dungeon queue — Initial requirement, agreed

Each adventurer has a bare-bones ordered list of dungeons to attempt. The queue supplies their dungeon plan; keep the initial controls simple, allowing dungeon entries to be added, removed, and reordered.

No affinity filters, thresholds, conditional routing, or other advanced assignment rules are required for the first version.

Exact execution details are still open: whether several entries can run in one expedition, when the queue advances after success or retreat, and whether the next day restarts the queue or resumes its position.

## Dungeon assignment preferences — Future, agreed direction

Later, preferences can change how assignment works. Explicit examples are minimum and maximum Stat Affinity thresholds for dungeons. Nonmatching adventurers are skipped before assignment to the relevant dungeon.

A member's high position in the queue does not override a dungeon's eligibility rules once those rules are enabled.

These thresholds evaluate affinity, not Current Value or Max Value. Whether they use rolled base affinity or effective affinity after guild upgrades remains open.

Illustrative example only:

| Member order | Strength affinity | Dungeon preference: minimum 60 |
|---|---:|---|
| First member | 45 | Skip for this dungeon |
| Second member | 85 | Matches affinity preference; still subject to other dispatch requirements |

Skipping a member for one dungeon does not establish that they must be excluded from all other dungeons. Fallback behavior is still open.

## Candidate assignment procedure — Proposed

1. Begin daily assignment.
2. Walk the guild-member queue in player order.
3. Identify the candidate dungeon from the adventurer's ordered dungeon queue. Exact advancement and reset rules remain open.
4. When future preferences are enabled, check the member against the dungeon's affinity thresholds.
5. Check guild support availability.
6. Assign an eligible, supportable member; continue considering later members as allowed.

This procedure illustrates the intended separation between priority, eligibility, and support. Exact traversal order across members and dungeons must be settled before implementation.

## Scheduling questions — Open

- What is a day, how long does it last, and is its boundary global?
- Does the day end independently from each adventurer's warp timer?
- Are all eligible members dispatched together at day start, or are dispatches staggered?
- Can returned members run again during the same day?
- Are members dispatched later in the day when gear regenerates or capacity frees up?
- If a member cannot be supported, does the system wait, skip them, or try a cheaper dungeon?
- Do edits to queue order apply immediately or starting the next day?
- How does each adventurer's dungeon queue advance after success, retreat, and timed warp, and when does it restart?
- Are any additional queues needed beyond member dispatch and individual dungeon queues?

## Future filter questions — Open

- Which individual stats can have thresholds?
- Are minimum and maximum endpoints inclusive?
- Do multiple stat filters all need to match?
- What happens with unset thresholds or an invalid minimum greater than maximum?
- Are filters per dungeon, per member, or reusable assignment rules?
- Do guild affinity upgrades immediately change eligibility for existing recruits?
- What happens when no member matches, or several dungeons match one member?
