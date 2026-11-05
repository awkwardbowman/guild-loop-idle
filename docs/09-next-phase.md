# Next Phase: Playtest, Tune, and Release

November 5, 2026. Proposed backlog based on the completed baseline and tests; not new approved feature requirements.

## Release checks

1. Run actual mobile/narrow-screen browser acceptance and keyboard-only navigation, including import dialogs. Responsive CSS exists; real device validation remains open.
2. Connect Vercel to awkwardbowman/guild-loop-idle, use Vite defaults, and validate the production URL. No backend credentials are needed. Confirm GitHub Actions passes on the published commit.
3. Have Maya play the baseline and review whether the 60-second day, 35-second expedition limit, manual day start, and daily route restart feel right.

## Findings from the first playtest

| Finding | Implication | Suggested next work |
|---|---|---|
| Two starting expedition slots mean Bram never runs without roster reordering or an upgrade | Member priority already creates a visible decision | Improve the pre-day explanation of who will stay home and why |
| An added dungeon can consume the gear needed by another member | Queue length and assignment order interact meaningfully | Show projected initial dispatch and possible route costs |
| The 20-day scenario reaches 65 clears and substantial stat growth | The progression cycle functions, but early tuning is generous | Compare longer/harder routes and adjust training rates with actual player feedback |
| No retries occur after day-start dispatch | A member can stay home while gear later regenerates | Review this default before adding more scheduling logic |
| Dungeon loot accumulates without an item sink | Gold/material upgrades work; loot progression is incomplete | Decide how loot supports guild progression before adding crafting complexity |
| Individuality currently comes from stat rolls and affinity, not traits | Recruitment is mechanically distinct but personality is minimal | Consider a small trait pool after basic balance is approved |

## Proposed subsequent functional groups

### Phase B — Planning clarity and balance

Add a dispatch preview, clearer total dungeon costs/training rewards, and concise return summaries. Tune first-session pacing. Validate preview versus actual dispatch, prohibit state mutations from preview, and rerun the baseline suite. Add actual mobile acceptance coverage.

### Phase C — Broader guild progression

Define loot uses, tier unlocks, and guild-master affinity upgrades. Add only after those rules are decided. Validate additive affinity effects on existing recruits, retention of rolled identity, ceiling growth, upgrade costs, and save migration.

### Phase D — Optional assignment rules

Add dungeon minimum/maximum affinity filters and defined fallback behavior. Preserve basic queues. Validate threshold boundaries, ineligible-member skipping, no-match behavior, priority order, and migration of saves without rules.

### Phase E — Optional sync / offline progress

Treat cloud sync and offline simulation as separate features. Local play must remain complete. Define conflict resolution before integrating any cloud service. Validate concurrent-device conflicts, local export portability, capped offline processing, and exactly-once reward resolution.

## Completion workflow for every phase

Implement one major functional group → write concrete expected-outcome tests → run tests → fix failures → retain regression cases → run a whole-game scenario → record results and choose the next group. Maintain backward-compatible save migrations when the released schema changes.
