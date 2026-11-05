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

00 Story is the first main tab, with only unlocked story threads shown. Fresh saves expose Story, Guild and the utility Info tab; no roster, dungeons or resources are pre-unlocked. Guild starts with a Begin your story control. Story opens recruitment; accepting the first member reveals Members and the Expeditions story thread; discovering the trail reveals Activities; returning reveals Resources and Infrastructure. Later milestones offer the archive and ridge. These actions are functional placeholders, not final narrative writing.

Members gains skill levels/practice and specialization values/potential after the skills feature becomes available. Dungeon details match the active route rules. Skill-based expedition time is an estimate, shown with ~, because random failures and cooldowns prevent an exact return prediction. Legacy task routes retain exact estimates.

Existing saves keep their former features through a migration event. Story → Guild offers Train for trap rooms to enable the check system for future archive outings; already active routes continue under their saved rules. No reset is required.
