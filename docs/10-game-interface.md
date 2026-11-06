# Game Interface

Agreed redesign, November 5, 2026. Replaces the presentation-led baseline dashboard.

## Layout

Desktop uses 2:8:2 columns: left information queue, center game controls, right event log. The game fills the viewport. Center content and event log scroll independently. No hero, promotional introduction, or landing-page content.

Left sidebar:
- In-game calendar at the top: day count, day/month/year, hour:minute:second. 1× advances at realtime speed but is a fictional calendar, never the device clock. Final seed date remains open.
- Collapsible active dungeons: “X active dungeons, next completed in Y”, compact member/dungeon tiles sorted by next return. Clicking a tile opens that member.
- Collapsible members: “X of Y members active”, member status and reset timers.
- Collapsible resources: current values for resources pinned from Resources.
- Pause/resume and temporary test speeds. Sidebar status persists across tabs.

Right sidebar: newest-first events for departures, floor clears, returns, stat growth, recruitment, guild work, and day rollover. Bounded to 100 events in the prototype.

## Center tabs

| Order | Tab | Scope |
|---|---|---|
| 1 | Guild | Guildmaster priorities, recruitment, infrastructure; reserved future skill tree |
| 2 | Members | Member properties, stats, dispatch order, activity enable/pause, dungeon queues and personal depth limits |
| 3 | Activities | Sub-tabs: Dungeons and reserved in-guild assignments/training |
| 3.1 | Dungeons | Found/unlocked dungeon type, rating, scaling, stat requirements, general loot, global max depth |
| 3.2 | Guild assignments | TBD: internal positions/training; no working mechanic yet |
| 4 | Resources | Current quantities and sidebar pinning; deeper resource systems TBD |
| Last | Info | General help, prototype rules, save export/import, recovery/reset |

The requested “Tab 999” means Info stays last, not that there are hundreds of empty tabs.

## Implementation defaults

These are provisional, not final game balance: 30-day months, 12-month years, epoch 01/01/0001; 1 game second per real second at 1×. 5× and 20× speeds are test controls. Hidden/closed play pauses. Desktop keeps 2:8:2; medium widths use minimum usable sidebars; on narrow screens the event log moves below the center content. Actual touch-device acceptance is still required.

## Acceptance

- Tabs change only center controls; status and log remain visible.
- All sidebar sections can collapse; expand shows current live values.
- Next-completed header and tiles use actual estimated return times including stat depletion, depth caps and warp timer.
- Pin/unpin persists through save/reload.
- Inputs have labels; replacement dialogs support Escape, focus trapping and cancel.
- UI state never implies that traits, penalties, supplies refunds or skill trees already work.

## 0.3 progression visibility

00 Story is the first main tab, with only unlocked story threads shown. Fresh saves now expose only Story; Guild and utility Info unlock after Open the guild, and Members unlocks when the friend joins. Dungeons and resources stay locked. Guild starts with a Begin your story control. Story opens recruitment; accepting the first member reveals Members and the Expeditions story thread; discovering the trail reveals Activities; returning reveals Resources and Infrastructure. Later milestones offer the archive and ridge. These actions are functional placeholders, not final narrative writing.

Members gains skill levels/practice and specialization values/potential after the skills feature becomes available. Dungeon details match the active route rules. Skill-based expedition time is an estimate, shown with ~, because random failures and cooldowns prevent an exact return prediction. Legacy task routes retain exact estimates.

Existing saves keep their former features through a migration event. Story → Guild offers Train for trap rooms to enable the check system for future archive outings; already active routes continue under their saved rules. No reset is required.

## Story subtabs — Current Goals and Plot

Story now has two fixed top-level subtabs:
1. **Current Goals** shows actionable unlocks and ongoing goals (recruit a member, clear a floor, return home, clear the archive). Every goal states where to act. Completed goals leave the current list.
2. **Plot** is the durable chronological account of completed milestones and unlocks. Each entry shows the saved day/time, what changed, exact tab/panel locations and buttons to open the relevant main tab. Story destinations open Current Goals; Activities destinations open Dungeons.

This replaces the previous Guild/Expeditions Story thread selector. Future content threads can be grouped within these two views. Plot is derived from saved progression facts, not the bounded live event log, so old milestones remain after the log rolls over. Uncompleted future milestones stay hidden. No new save fields or migration are needed. Existing migrated guilds show their retained access without inventing historical completion events.

Source: src/story.ts provides goal/history projections and location metadata; StoryPanel.tsx renders the views.

## Story-only opening gates

Fresh launch and reload select Story. Before founding, no other main tab is rendered, the clock controls are disabled, no guild work runs, and Plot has an introductory empty state. Load a save remains a utility control rather than another tab. Opening reveals Guild/Info; welcoming the guaranteed friend reveals Members. Recruitment now looks for additional adventurers, after the friend has joined. Dungeon queues remain empty until discovery; add controls are disabled when no dungeon is unlocked.\n
### Section colors and event log

`src/sections.ts` owns the stable section numbers and rainbow palette. Only the numeric prefixes on main tabs are colored; event bars and filter numbers reuse the same palette. Shops reserves 05 for the upcoming shop system; Info is 06.

New plot entries also create a single Story-section Unlock event at the same in-game timestamp, including automatic first-clear and first-return milestones. Unlock bodies use the player-facing action title (or milestone title), never internal event IDs. Archive discovery includes skill access in one plot/log entry. Repeated actions do not duplicate unlocks.

The event log uses a compact `D1 - 00:00:00 Unlock` header, a message beneath it, and a section-colored left bar. Member names are inline for expedition events. The bottom Filter sections disclosure supports independent checkboxes, All, and None; filtering only changes visibility, not stored history. The existing latest-100-event retention remains. Existing saves without section tags use a compatibility mapping; new tags are validated on import.

### Travel and sales

The calendar shows Emberveil as the home location. Active expedition tiles and member panels show outbound/exploring/homeward stage, stage progress, and total time until home. Check-driven exploration estimates retain the ~ marker; a homeward countdown is exact. Return home initiates travel and disappears during an existing return. Dungeon entries list their location and each leg’s travel time. Resources includes quantity inputs, provisional sale prices, and pending trade countdowns/progress.


### Main stats, attributes and guildmaster

The Guild page shows the guildmaster’s own nine-stat profile and innate-magic designation. Member/candidate stats show all nine roots. Luck is displayed as a modifier with maximum/affinity rather than a consumable fraction. The attribute panel offers By main stat and By activity views, exposing all 27 attributes with their root, grouping, trained value, affinity and effective fallback. Learned skills remain a separate panel. Ordinary members rely on relics/artifacts for magical effects.
