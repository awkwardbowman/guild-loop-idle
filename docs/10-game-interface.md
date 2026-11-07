# Global Settings and discovery UI direction — November 6, 2026

**Implemented in the associated UI slice:** top-level **Settings** appears immediately after **Info** on the main tab strip, with global Dungeon Defaults (formerly Guild → Settings), save export/import and a danger-zone **Reset guild** action. Reset opens the existing Cancel/Confirm modal, and successful confirmation replaces the current guild with a fresh game and returns navigation to Story. Settings is visible before guild founding so broken beta saves can still be replaced; Info remains gated by opening the guild. Guild's old Settings subtab is removed to prevent competing defaults menus. New Settings navigation gets a functional regression assertion.

**Planned, not implemented yet — discovery UI:** Each dungeon expands into per-floor inspection; 10 counted rooms per floor. Show `known/10` for successfully cleared distinct authored counted rooms. Each unknown counted room contributes its share to **Unknown** (e.g. 1 of 10 known → 90% Unknown). Known room's stats contribute only to that revealed share. Expand floor to show **Normal / Treasure / Boss** filter selections, each with its own stat mix and known/unknown coverage. Treasure rooms do not advance counted rooms; two treasure rooms cannot appear consecutively. Boss at each floor end. User can ignore Treasure, avoiding distortion of Normal view. Aggregate per-dungeon discovery without showing unvisited future-floor stats or hidden special Skills. The 100-floor Emberveil story dungeon has controlled checkpoints, deeper difficulty and a final game-ending boss. UI should not label the whole dungeon "completed" after its first floor.

**Open UI specification:** whether the boss is included in the ten room slots; how optional room discovery denominators and weighted aggregates work; stable authored per-floor room identities vs procedural repetition; when secret Skill names unlock in endless dungeons. Treat the user's 1/10 example as an exact requirement for counted room discovery, not a justification for prematurely revealing entire authored mixes.

---

# Current PR #7 interface (November 6, 2026)

Character Skills shows five selected Attributes by five selected Disciplines, exactly 25 positions. Only catalog-authored pairs populate cells; other positions are empty. Five row totals, five column totals and a grand total count each populated Skill once. Discipline header glyphs are black on a light backing; Skill glyphs use Attribute colors. Only numeric Value text uses red/yellow/green training colors. Keyboard focus/hover expose a text description, and tapping/clicking selects persistent details. Potential remains unknown pending a future reveal unlock. Composite Skills has its own tab and browser.

Guild adds Settings → Dungeon Defaults for Depth Limit and Insufficient Skill Threshold. Expanded dungeon cards contain both per-dungeon controls, including inherit/override, explicit Unlimited and 0% Off. Member controls no longer include personal limits. Assignments show the separate Endurance Capacity meter, low-skill efficiency/grace countdown, pending recall and its independent countdown. Recall is disabled once queued, and return history distinguishes exceptional outcomes.

Info explains all root/Discipline symbols, the grid, totals, capabilities, Composite prerequisites, band boundaries, fallback, gear order, Con-1, non-consumable Attributes, endurance/growth, rooms vs ten-room floors, threshold benchmark and outcomes, recall, shared settings and legacy behavior. Main How to play text agrees with this contract. Desktop and mobile verification are recorded in [08](08-test-report.md).

---

## Historical design and implementation notes

The sections below record earlier builds and proposals. The current contract above and the v9 contract in 11 supersede conflicts.

# Finalized dungeon settings layout and threshold behavior — Nov 6 2026 (DESIGN ONLY)

In **Guild → Settings → Dungeon Defaults**, expose:
- **Depth Limit:** Unlimited by default or any positive whole-room count.
- **Insufficient Skill Threshold:** 1% proposed global default; 0% Off.

In every **expanded dungeon**, place both controls together:
- **Depth Limit:** Inherit Global / Unlimited override / Custom N rooms.
- **Insufficient Skill Threshold:** Inherit Global / Off / Custom percent.
Show the **effective setting** and whether it is inherited or overridden. An inherited dungeon updates if the global value changes.

**Remove every per-member/per-assignment depth-limit input.** Members → Assignments shows only the selected dungeon, current status and personal expedition history. All members assigned to a given dungeon use its effective common depth cap. Preserve current depth-limit stopping semantics (room count), while distinguishing **Room N** and canonical **Floor F = ten rooms** for rewards and ordinary safe recall.

**Threshold runtime and Info:** evaluate effective progress efficiency when entering EACH room. If below threshold, show a 30-game-second grace period, after which incomplete room triggers its authored failure (not a safe exit). Finish within the grace to continue. Explain numerator, benchmark denominator, 0.01 fallback, gear effects, 0%=Off, and role-dependent outcomes in **Info → Skills/Dungeons**. Manual recall's independent 30-second exceptional timeout remains distinct; do not display threshold auto-bail as normal recall.

Older UI instructions below requiring member-specific depth-limit editing or speculating about full-floor preflight are historical and superseded.

---

# Proposed configurable Insufficient Skill Threshold UI — November 6, 2026 (DESIGN ONLY)

Place **Insufficient Skill Threshold** near **Depth Limit** in each dungeon's expanded settings, with an **Inherit global default** choice. The global default belongs in Guild/Configuration or Info Settings (settings location TBD), but **Info → Skills/Dungeons** must describe what the threshold means. Candidate default **1% efficiency**; **0% disables the check**. Keep the control separate from permission/Skill learning gates and from manual Recall.

Explain efficiency as **predicted work rate divided by the room's reference work rate**, with missing Skill → selected Attribute fallback → unselected 0.01 baseline and gear order applied. This is NOT Value/Potential and NOT chance to succeed. Tooltip example: `1% means work is predicted at less than one hundredth of the reference room pace`. Show effective per-member evaluation when practical, and a clear `Insufficient skill` reason for any automatic bail.

Important player promise: no free safe escapes during a floor. Qualified exits at a canonical floor boundary can be safe; a 30-second mid-floor failsafe is exceptional and must obey authored failure/reward rules. Existing engine rolls rooms individually, so do not claim the player can preflight whole randomized floors until prediction/pre-generation is implemented. Once finalized, add this explanation to the dedicated Info Skills legend rather than hiding it only in a tooltip.

---

# Revised UI: combined Endurance, Constitution XP and queued recall — November 6, 2026 (DESIGN ONLY)

On member and dungeon views, label the only draining dungeon resource **Endurance Capacity** (Current / Maximum), derived from owned Constitution Skills. Do **not** show the Constitution Attribute itself, or any other Attribute, as a consumable dungeon meter. Character Skill matrix still shows Value, hidden-until-discovered Potential, row totals, column totals and grand total; the Constitution column/row helps communicate the capability that feeds capacity. Info → Skills needs an explicit explanation of **Con-1**, owned Toughness/Endurance/Vitality contributions to Endurance Capacity, and the **general Constitution XP granted on completed full floors** in addition to specific check training.

Info → Skills / Equipment text must state the exact modifier order **Catchup, then Flat, then Percent**. Example: base 2, Catchup 10 → 6, +5 → 11, +20% → 13.2. No gear modifier unlocks prerequisites. Numeric Value colors stay directly on numbers only.

The Recall button now **requests** recall: show "Recall pending" and, if useful, remaining fallback seconds until the 30-second stuck-run fail-safe. Safe exit happens **after completing the current canonical floor** (10-room boundary), not at each room; the emergency 30-second interrupt may cut off a floor and should not be portrayed as a normal safe clear. When already between floors, safe recall can happen immediately. Depth limits remain as before. Show enough information to distinguish **Room N** from **Floor F**, since current v8 code labels room numbers `run.floor`. Exact emergency penalty/time basis and pause semantics should be finalized before coding.

---

# New Skill grid totals, endurance and explanatory UI — November 6, 2026 (planned, NOT implemented)

- In the fixed 5×5 character Skill matrix, add **a total at the end of each Attribute row**, **a total at the bottom of each Discipline column**, and **a bottom-right grand total** of all populated Skill numeric Values, counting each Skill **exactly once**. Blank unauthored pairs do not contribute to totals. Layout orientation may swap axes, but there must be five totals per axis and one grand total.
- The same totals are useful for **discipline-level and attribute-level checks**. Example: Dungeoneering total = Force + Finesse + Agility **only where the character actually owns those defined Skills**. A baseline-0.01 fallback is used to make weak *check progress*, but does **not** appear as a trained Skill or inflate a matrix rollup. Keep raw totals descriptive: a total is **not** a guaranteed dungeon rating because dungeons have authored weights and Constitution endurance.
- Display a meaningful label for the corner value, e.g. **Total Skill Value** (or Overall Power if clearly explained); raw totals favor profiles with more authored Skill intersections, so do not label it a cross-build balance-adjusted rating unless normalized.
- **Only the numeric Value gets red/yellow/green training-ratio coloring.** Axis totals, the grand total and hidden Potential must not leak undiscovered Potential. Indicate potentially undiscovered values with appropriate discovery gating. Retain no additional status icons. Keep baseline-0.01 attributes separate from specialized trainable cells.
- Character dungeon eligibility indicator: **Con-1 means owning at least one Constitution Skill** (Toughness, Endurance, or Vitality), **not merely Constitution being selected**. Show combined current Constitution endurance, maximum from owned Con Skills, and current room drain rate (per game second) when an expedition is active. Other Attributes and Soul/Luck are **non-consumable** and must not be represented as dungeon-draining gauges.
- The **Info → Skills** section additionally explains row/column/grand totals, how a Skill check uses a selected Attribute fallback or tiny 0.01 non-specialized baseline, why a powerful group total need not guarantee a particular room, Con-1 and room-specific failures, how per-second endurance drain causes slow builds to fail sooner, future Speed/Agility/Scouting/Movement effects, and how flat/percent/Catchup gear modifies checks **without unlocking prerequisites**. Keep symbols, Attribute colors and number-only trained-state colors as already agreed.
- For assignment-specific actions show disabled-with-reason gating (e.g. requires Perception, requires Composite Skill) without hiding entire navigation tabs. Combat is not a blanket eligibility condition for any dungeon.

---

# Planned 5×5 character matrix and Info Skills guide — November 6, 2026 (design only)

**Required in the next character specialization PR, not implemented in v8.**

## Character matrix
Replace the current long specialized-attribute display with a **fixed 5×5 matrix (25 positions)**: five specialized **Attributes** along one axis and five specialized **Disciplines** along the other. Populate only defined Attribute + Discipline **Skills** (e.g. Strength + Combat = Power). **Approved: when a pair has no authored Skill, leave that cell completely empty.** Perception + Combat is an explicit example of a blank cell. Never auto-create 25 Skills or display a fake locked Skill.

Show trained Skill **Value** in each populated cell; reveal **Potential** on hover, keyboard focus or tap only after the relevant game unlock, otherwise show unknown. Use a neutral **black** glyph for each standalone Discipline. Tint the Discipline glyph by the source Attribute color within a Skill cell (Combat is not inherently red; Strength + Combat becomes red only because of Strength). **Only the numeric Skill Value itself gets the training-state color**: red below 75%, yellow 75% to less than 90%, green at least 90% provisionally (confirm exact 90% boundary). **No additional traffic-light icon, dot, badge or status glyph.** Attribute/Discipline glyph colors represent identity only. Make color supplementary to accessible text/ratio descriptions.

Clearly distinguish selected specializations from unselected baseline-1 abilities. Keep expedition Current/Max Attribute pools in a separate understandable display, rather than mistaking resource depletion for Skill training. Display dungeon ineligibility when Constitution is not a selected Attribute. Guild Master: Perception, Intelligence, Charisma, Soul and Luck selected; four physical Attributes unselected, no dungeon access.

## Required Info tab subsection: **Skills**
Add a dedicated **Skills** help section within Info that explains all symbols and this entire system using shared game icon, color and terminology metadata:
1. Nine **Attributes** (root values, colors and symbols); nine **Disciplines** (black standalone symbols); their pairwise **Skills**; and multi-Skill **Composite Skills** (e.g. Lock Picking).
2. Why each character chooses five Attributes and five Disciplines, what baseline 1 on the rest means, which capacities can grow, and the Constitution specialization requirement for dungeons.
3. Reading the fixed 5×5 axes; why nonexistent pairs such as Perception × Combat have completely empty cells; visible Value only for defined Skills; Potential on hover/focus/tap after unlock; and the distinction between trained Skill Value and consumable Current/Max Attribute pools.
4. Icon legend: black Combat symbol = Discipline; Strength-colored Combat symbol = Power; color originates from the Attribute, not the Discipline.
5. Training legend: **numeric Skill Value text** is red below 75%, yellow 75%–less than 90%, green at least 90% (provisional 90%-equality rule). **No extra training-status icon.** Unknown Potential appears before discovery; accessible text labels/ratios explain the color for keyboard and touch users.
6. Composite Skill gating: explain prerequisite component Skills and locked/unavailable reasons without pretending unimplemented combinations exist.

Use one canonical metadata table for icons, color logic and help; never hardcode a separate Info legend that can drift from actual character UI. Accessibility must not require a mouse.

Resolved: missing intersections remain blank within the 25-cell grid; the four category names are approved (Attributes, Disciplines, Skills, Composite Skills). Open before coding: five/five chosen sets, Guild Master Disciplines, growth budget/migration and exact 90%-edge semantics.

---

# Current backlog UI — November 6, 2026

Members → Assignments starts with current activity/status, live outing progress/cargo and contextual pause/recall/remove/dismiss actions. Unlocked dungeon choices follow it; there is no multi-entry route editor. Each option displays member-specific farthest room, last return room/reason and an editable personal cap when assigned. Empty history is —. Changing assignment moves the waiting destination; current trips continue their saved destination/cap.

Dungeon cards show active/capacity immediately followed by N queued. Expanding shows the roster-ordered waiting members and live relevant current/max pools. Sidebar member totals distinguish queued from idle and healing; dungeon sidebar tiles also show queued counts. Members/candidates show separate rarity and tier; material tooltips and equipment tags share the same classification vocabulary.

Story → Plot is newest first by saved day/time, with reverse event-registry order as deterministic tie breaker. Underlying event timestamps, unlock destinations and durable progression records are unchanged.

# Game Interface

Agreed redesign, November 5, 2026. Replaces the presentation-led baseline dashboard.

## Layout

Desktop uses 2:8:2 columns: left information queue, center game controls, right event log. The game fills the viewport. Center content and event log scroll independently. No hero, promotional introduction, or landing-page content.

Left sidebar:
- In-game calendar at the top: day count, day/month/year, hour:minute:second. 1× advances at realtime speed but is a fictional calendar, never the device clock. Final seed date remains open.
- Collapsed active expeditions: count first; expanded tiles show member, dungeon, stage, room and progress. Clicking a tile opens that member. Travel countdowns and return estimates are hidden.
- Collapsible members: “X of Y members active”, member status.
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
- Activity summaries show current state without outbound/home countdowns. Travel Time is revealed in expanded dungeon cards.
- Pin/unpin persists through save/reload.
- Inputs have labels; replacement dialogs support Escape, focus trapping and cancel.
- UI state never implies that traits, penalties, supplies refunds or skill trees already work.

## 0.3 progression visibility

00 Story is the first main tab, with only unlocked story threads shown. Fresh saves now expose only Story; Guild and utility Info unlock after Open the guild, and Members unlocks when the friend joins. Dungeons and resources stay locked. Guild starts with a Begin your story control. Story opens recruitment; accepting the first member reveals Members and the Expeditions story thread; discovering the trail reveals Activities; returning reveals Resources and Infrastructure. Later milestones offer the archive and ridge. These actions are functional placeholders, not final narrative writing.

Members gains skill levels/practice and specialization values/potential after the skills feature becomes available. Dungeon details match the active route rules. Expedition estimates remain internal; normal pages show the current stage and room.

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

The calendar shows Emberveil as the home location. Expedition tiles show stage, room and progress without outbound/home timers. Expanded dungeon cards show Travel Time. Resources includes quantity inputs, sale values, and pending trade progress.


### Main stats, attributes and guildmaster

The Guild page shows the guildmaster’s own nine-stat profile and innate-magic designation. Member/candidate stats show all nine roots. Luck is displayed as a modifier with maximum/affinity rather than a consumable fraction. The attribute panel offers By main stat and By activity views, exposing all 27 attributes with their root, grouping, trained value, affinity and effective fallback. Learned skills remain a separate panel. Ordinary members rely on relics/artifacts for magical effects.


### Dungeon attribute matching

The dungeon catalog has an assignment-member selector and collapsed cards. Headers show three root-stat symbols, ranked from the live room/check requirements. Expanded cards show full root emphasis and compact learned-skill subcards, including dungeon-specific skills. Relative emphasis is not a success probability.


## Current opening UI v6

Story introduces history and Arya/Clyde before Guild management appears. Founding grants both named recruits, Members and the no-gear Ritual Catacombs. Plot unlocks also enter the compact section-colored event log.

Guild has Guild Master, Guild Hall and Storage subtabs. Chips are the primary guild currency. Storage lists each resource quantity/cap and its individual cap purchase. Overflow is discarded and logged. Resources keeps manual pinning and timed trade controls.

The first Leather Scraps enable Gavin’s story action and Shops tab. Gavin is both Tanner and Barkeep. Shops offers reusable guild-wide gear unlocks and absolute equipment-slot ceilings; Members offers independent loadouts, current/best room, total core stats and cargo capacity. In-flight loadouts cannot change.

Dungeon cards default to title, top-three stat symbols, possible finds, room limit and queue action. Expanded cards contain a brief lore description, Travel Time, larger attribute breakdown and collapsible skill cards. Group/room/loot weights and floor equivalence are not exposed in player-facing cards. Scaling, retry rules and loot mechanics belong in Info.

Stillmere’s herbalist appears after the five-herb referral, enables herb sales and offers equipment capacity to five. Compression and assigned auto-selling are future placeholders rather than active controls.

## Compact disclosure standard — November 5, 2026

Normal pages emphasize actionable controls, concise costs/reward potential and indicators. Expand for descriptive context, lore, requirements and detailed values; general mechanical explanations belong in Info. Native details/summary disclosures are keyboard accessible and closed initially. Queue/economy controls sit outside the disclosure so they remain available while cards are closed.

`stat-presentation.ts` owns nine unique root-stat colors and SVG shapes; `StatSymbols.tsx` renders them with accessible names and title hints. Specialized attributes inherit their parent identity. Dungeon emphasis uses the live room distribution, normalized within group, then check attribute contributions. Skill subcards use their actual checks’ requirements. No probabilities, weights, or formulas are shown on routine activity cards.

Members show icon/value stat summaries, with full bars behind expansion. Equipment, learned skills and specialized-attribute groups collapse. Shop items keep purchase buttons/costs visible and descriptions collapsed. Story descriptions collapse while navigation and action buttons stay visible. Sidebars start collapsed with status/counts. Removed speculative-feature panels from routine Guild/Member screens; planned systems remain in Info. Save schema and simulation behavior are unchanged.

### Character headers and tabs — current

Supersedes stacked member panels and current/max header summaries. Every character/candidate header renders name, nine root symbols with **trained maximum only**, then any visible tags. The Guild Master’s innate-magic tag is hidden. Header numbers never use current pool values or affinity.

Guild Master: Story (current goals/plot), Attributes, Skills, Lore. Members: Story (personal progress), Attributes, Skills, Assignments, Equipment, Lore. Members default to Assignments; the Guild Master defaults to Story. Lore is always last. Tabs align right on desktop; narrow views scroll horizontally from the start so all remain reachable. Each tab renders its own content instead of stacking multiple full panels. Attributes retain expandable groups; detailed affinity appears only within the Attributes tab. Candidate recruitment keeps its compact header and recruit/decline actions.

### Dungeon capacity, automatic time and compact story links — current

Each dungeon declares maxConcurrent independently (all current authored dungeons default to one). The dispatcher applies both dungeon and guild capacity. A departing member reserves a dungeon place, preventing simultaneous arrivals from overbooking it. Starting home releases the dungeon place; the guild expedition slot remains occupied until arrival. Previously saved active trips are preserved; no new departure exceeds capacity.

The left expedition section renders one card per unlocked dungeon, with the same three root symbols as its catalog header, used/max slots, and approximate time to next dungeon completion (excluding homeward travel). Generated room estimates remain approximate time-limit estimates, not exact predictions of random checks/exhaustion. Members shows counts for expeditions (all trip stages), trading, crafting, healing (cooldown), recruits pending and idle. Main Members repeats that compact summary. Guild sales are not falsely counted as trading members; trading/crafting assignments are not yet implemented.

Time runs automatically at 1x while the page is open, including background tabs, before and after founding. No Pause/Resume or speed selector remains. Recovered planning saves start advancing automatically. Modal confirmations do not pause the clock. Closed-page offline simulation is still not implemented. Cross-tab/autosave protection may block this tab to avoid overwriting another tab.

Story goals and Plot use compact title rows with quick links/actions at the top right. No repeated “Where to find it” labels or location paragraphs. Link tooltips retain destination context. Multiple destinations in the same main tab are consolidated into one button. Lore/description still expands.

### Compact calendar, attribute matrix, status alerts and rarity — current

Supersedes the large calendar/header, potential readouts and grouped attribute disclosures. The sidebar begins with three compact lines: Emberveil - Dragon Campe Guild; Day N - DD/MM/YYYY; timer. No oversized game title/calendar heading.

The Guild Master has Attributes, Skills and Lore, without a duplicate Story tab. Recruited units show trained root maxima in the header (up to two decimals); unrecruited candidates show ??? for every value. All potential/affinity values are hidden, including progress-bar scales that would indirectly reveal them. A later feature will gate potential disclosure; no unlock is implemented yet.

Attributes contains all 27 entries in a single table: Symbol, Name, Attribute, Skill, Value, Potential. A single toggle sorts by root attribute or activity/skill family. Potential always renders ???. Root stats retain unique icons/colors; each of the nine activity groups has a shared shape. Specialized attributes combine the activity shape with their parent root’s color (Power/Precision/Toughness share Combat swords in Strength/Dexterity/Constitution colors). Root/skill legends live in Info.

Members’ summary and main navigation display shared attention symbols/counts for recruits waiting, healing/recovery and idle members only when positive. The same healing icon identifies failed dungeon log entries. Zero-count states do not have warning symbols. The existing post-expedition cooldown remains the healing/recovery count; this UI pass does not change recovery rules.

Dungeon logs are limited to new/removed assignments, failed dungeons, completed boss rooms and completed treasure rooms. Routine departure/travel/room/check/retry/successful return chatter is no longer stored; verbose entries from older saves are hidden. Assignment reordering or cap-only edits do not generate new-assignment spam. Boss/treasure events include the entire room’s actual drops; room drop accumulators survive mid-room saves. Other event sections are unchanged.

`rarity.ts` is the shared zero-indexed Common → Eternal palette supplied by Maya, with enum-like Rarity IDs and direct rarity[index] access. All current resources and rooms are Common (index 0 / tier 1), as are current recruit presentation tags. Equipment level is separate from rarity. Resource depthBias preserves prior depth weighting independently of display rarity. Shared components tint resource names, actual drop lists, room labels and recruit tags; contracts/trade variants can reuse the same registry.

### Discovered skills browser — current

Skills starts with no visible learned/combo skills. Internal starter abilities remain in place so Arya/Clyde and the opening checks retain their authored behavior; visibility is a separate discovered flag. Positive experience from successful use reveals a skill. Failure, ineligibility and resource exhaustion do not reveal it. Existing saves without that flag retain previously used/experienced skills while untouched starter levels remain hidden. The dungeon’s expanded skill cards use the same discovery rule.

Each learned skill is one compact inline row: name, participating attribute symbols in parent colors, and level. No Practice column, XP fraction or /99 text appears on normal rows. Left sub-card provides all 27 named/symbolized attributes as a scrollable checklist, searchable by attribute/root/activity name. Matching any checked attribute includes a discovered skill; no checked filters includes all discovered skills. Clear resets the checklist/search. The right side provides skill-name search and Name A–Z / Level descending sorting. Empty learned list and no-filter-results have distinct messages.

Discovery is optional save metadata validated as boolean. Save version remains 6; no numeric skill levels, XP thresholds, success chances or resource costs change.

### Weighted engine / shop request pass — current

The separate Resources tab is removed; storage/trading/pinning are consolidated under Guild → Storage, including its sidebar management link. Pin dropdown omits its count and shows owned/max values, red at maximum; Chips displays ∞. Capacity selection uses 1/10/100/Max.

Main navigation is stable with no attention icons. Sidebar Members always renders recruit/healing/idle icons and counts in fixed-width positions, with matching empty spacers in other activity rows. Catacomb expanded cards explicitly show Combat and Herbology to communicate the starter roles.

Shops has city tabs, shop sections Shop/Requests, left-fixed tier tags, bought/affordable/unfunded row states, owned/required cost text and a hide-maxed checkbox. Requests are actionable both here and in Current Goals. Leather lesson selection only lists Arya/Clyde instances; completed requests gray out and cannot charge again. Elder Ash appears in Stillmere after the herb referral. The Leather Crafting assignment entry is visible after teaching, but no crafting timer/input/output is invented.

Current generated rooms now clear deterministically with full-second weighted parent-pool costs. Normal return UI does not show a recovery state; only injured returns heal. Info text and archived history filtering reflect the distinction. Save v7 migrates existing skill profiles, requests defaults, equipped limits and partial generated work.
