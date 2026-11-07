# Guild Loops — Development agent instructions

Source of truth for risk-based testing: [docs/12-testing-policy.md](docs/12-testing-policy.md) and [test-policy.json](test-policy.json).

- **Do not run the entire test suite reflexively** after each edit. Begin with `npm test` (12-case smoke) and `npm run test:targeted -- <affected-groups>`, or use `npm run test:changed -- --base origin/main` when a Git base is available.
- If the central simulation (`src/engine.ts`), unknown runtime files, dependency configuration, or test infrastructure changes, choose full regression; select more groups whenever dependencies require them.
- Add tests for new behavior, record relevant test IDs and their subsystem/criticality metadata. Historical save migrations and corruption guards remain important.
- For a PR, run the relevant tests and `npm run build`; for a major release, run `npm run test:release` and separately verify actual browser flows.
- Record test commands and results precisely. **Skipped/not selected does not mean passed.** Do not claim visual acceptance without real browser verification.
- Avoid duplicating design docs. Keep durable documentation in the Guild Loops Drive folder with source copies under `docs/`. Do not overwrite concurrent feature PR changes without reconciling them.

- **Balance procedure:** Follow [Floor clear probability procedure](docs/04-dungeons-and-expeditions.md#floor-clear-probability-procedure). Freeze the scenario, derive weighted encounter durations, convolve the counted rooms/optional treasure/boss, and sum the paths within the endurance budget. Use `node scripts/balance-floors.ts` for the first-ten worksheet. Prefer this defined calculation to large simulation matrices; keep short engine boundary tests for implementation correctness and extend the mathematical state when another mechanic can bind.
