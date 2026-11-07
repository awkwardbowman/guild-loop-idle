# Browser and floor acceptance extension — November 6, 2026 · review branch

The existing smoke/targeted/full policy below remains in effect. Central engine, schema and dependency changes in this combined pass require full regression plus build. FD01–FD23 register floor/catalog, discovery, checkpoint, secret-name, recall, migration, Soul, farming and first-ten balance invariants; P0 checkpoint/save/award cases are explicitly classified in `test-policy.json`.

`npm run test:browser` is a separate Playwright suite (UI01–UI09, with UI06 parameterized over five widths). Install Chromium with `npx playwright install chromium`, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` at an existing Chromium. It tests real DOM/keyboard/modal/settings/discovery/shop/trade/save interactions, 320/375/768/1024/1440px layouts, axe WCAG A/AA rules and 200% CSS zoom reflow. It does not replace engine tests or establish universal device/screen-reader conformance. Browser CI uploads screenshots, JSON results and failure traces as `browser-evidence` for 14 days.

`node scripts/balance-floors.ts` runs disposable seeded simulations, never user saves. Current numerical acceptance is starter Arya clearing floors 1–10 and a current-kit barrier at floor 11 pending Stillmere designs; it is not full-campaign balance verification. Exact executed counts and limitations belong in [08](08-test-report.md).

---

# Guild Loops — Risk-based test and release policy
Updated 2026-11-06 (reconciled after gameplay PR #7 merge). Authoritative implementation: `test-policy.json`, `scripts/test-policy.mjs`, and `.github/workflows/validate.yml`.

## Principle
Do not run every automated test after every small change. Select tests by blast radius, criticality, and release intent. A small high-risk change (save validation, reward integrity, central simulation) can merit the full suite; a large cosmetic change may need only smoke, UI checks and a production build. Never represent an unexecuted test as passing.

## Criticality (independent of the release version)
- **P0 — Integrity:** corrupt or lost saves, broken migrations, negative resources, duplicated loot/payouts, unintended repeated effects, invalid simulation states. P0 coverage is prioritized; a curated 12-case smoke subset runs by default.
- **P1 — Core:** running dungeons, dispatch/capacity, skill progression, travel and other fundamental mechanics. Run the affected subsystem and its dependencies.
- **P2 — Feature/content:** opening, progression unlocks, authored rooms, requests, reports, shops and other feature behavior. Run when content or behavior changes, or for content releases.
- **P3 — Presentation:** sorting, UI details, filters and cosmetic affordances. Run relevant tests and verify the UI in browser when a visual change is made.

The JSON catalog registers each test ID with a file-level default and P0 overrides. Cases can belong to multiple subsystem groups. The catalog includes newly classified **NM01–NM02** numeric correctness/presentation tests and **QS01–QS04** quick UI/navigation and lore-contract tests, plus previously added **ST07**. Keep the actual test counts from the latest CI report instead of relying on an old catalog total. New tests in an existing file inherit its default and produce a notice; new files default to P1/core and should be classified. CI change detection selects every case in a modified test file, including new cases. Keep stable IDs in test names (`D01`, `S04`, etc.). Three event-log tests were assigned `EL01`–`EL03`.

## Commands
| Action | Command | Tests selected |
|---|---|---|
| Default quick check | `npm test` or `npm run test:smoke` | Curated P0 smoke set |
| One or more affected systems | `npm run test:targeted -- dungeon save` | Smoke plus all tests tagged dungeon OR save |
| Explicit test IDs | `npm run test:select -- S01 WR04` | Smoke plus named cases |
| Exact named tests only | `npm run test:select -- --only S01 WR04` | Named cases only; intentionally bypasses smoke |
| Content/progression milestone | `npm run test:content` | Smoke, content, progression, integration |
| Determine tests from Git changes | `npm run test:changed -- --base origin/main` | Smoke plus impacted subsystems; unrecognized or cross-cutting code changes force full |
| Full automated regression | `npm run test:full` | Every test |
| Release automation | `npm run test:release` | Every test plus TypeScript/Vite build; NOT browser acceptance |
| Patch release targeting | `npm run test:version -- patch dungeon` | Smoke plus named impacted groups |
| Minor release targeting | `npm run test:version -- minor content` | Smoke, named impacted groups and integration |
| Major release validation | `npm run test:version -- major` | Full automated suite |
| Catalog review | `npm run test:catalog` | Print suite metadata; run no tests |

Add `--dry-run` to any selection to print IDs without executing them. All profiles report selected and **not run** counts separately. The runner exits nonzero on failed tests, unknown IDs, duplicate IDs, or unnamed test cases.

## Version conventions and compatibility
The application uses semantic versions (`MAJOR.MINOR.PATCH`; e.g. `0.4.0` currently). Treat patch/minor/major as **release scope hints**, not guaranteed risk levels. Before 1.0, significant changes may still appear as minor versions, but should get the appropriate validation. A seemingly tiny save-schema or engine change can trigger the full suite.

Application version and **save schema version are separate**. All historical save migration and corruption-guard tests remain eligible for full runs even when they cover older saves. Never disable historical migration checks because their source version is old. When a contract truly becomes obsolete, replace or retire only the affected expectation, record why, and keep relevant compatibility coverage.

## Change-impact rules
The runner explicitly maps known source files to test groups:
- Central `src/engine.ts`: full, because simulation changes have broad side effects.
- `src/persistence.ts`: save, travel and integration.
- Attributes, specialization and skill system: attributes/checks/dungeon.
- Authored content, rooms, story and equipment: their relevant content/progression/dungeon/economy groups.
- `*.tsx`, styles and `index.html`: UI group + smoke; browser acceptance remains manual.
- Changed `tests/*.test.ts`: all cases in the touched file.
- Any unknown code path, test fixture, workflow, test runner or dependency change: full.
- Documentation-only change: smoke (no special subsystem).
- CI PRs: `test:changed` against the PR base commit plus a production build.
- Pushes to `main` and manually invoked CI: full regression plus production build.

If a file maps to more than one subsystem, selection is the union of impacted tests. If the agent knows the change has further downstream impact, it must **expand** selection manually, or use `test:full`. A new test may inherit a suite default temporarily, but the developer must classify it during review.

## Agent operating rules
1. Explain the affected mechanics, dependencies and save implications *before* choosing a profile.
2. During implementation use smoke + targeted tests. The intent is faster iteration, not skipping testing altogether.
3. For any new behavior, write targeted regression tests that genuinely exercise it; do not replace testing with the smoke set.
4. For save schema/migration, loot/reward accounting, persistence, shared engine/state changes, or large refactors, run the broader relevant suites (full for cross-cutting engine changes).
5. Run `npm run build` before opening a merge-ready PR. Browser/desktop/mobile acceptance is separate from unit/integration tests; do not claim it without actually checking.
6. Report each command, number passed/failed, number not selected, limitations and unverified areas. Never copy forward the previous run's success count.
7. Full release gate requires a successful automated full suite, production build, and documented real browser acceptance appropriate to changed screens and flows. The `test:release` command covers only the first two; no automated Playwright environment is claimed.
8. Maintain the canonical design documentation in the existing Guild Loops Drive folder and a matching source copy under `docs/`. Record meaningful outcome changes in the existing test report when appropriate, avoiding stale blanket "all tests passed" assertions.

## Examples
- Text-only label change: smoke, UI tests, build, visually inspect the changed screen.
- Dungeon progress formula: dungeon + checks + attributes + save, integration; if `src/engine.ts` changed, auto-select full.
- New request/loot table: content, economy, dungeon and opening/progression checks.
- Save schema upgrade: save + migration fixtures + integration; consider full when in-flight state, loot or RNG is affected.
- Pre-release milestone: `npm run test:release`, then manual desktop/mobile browser acceptance and test report.

This policy supersedes the older blanket expectation to run `npm test` (the entire suite) for each functional group. Tests not selected by a profile have **not run**; they must not be described as passing.
