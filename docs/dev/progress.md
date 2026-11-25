# Development Progress

> L2 | Parent: `AGENTS.md`

## Current State

- Branch: `main`
- Source repository: `ziweiknows/ziwei-chart`
- Deployment mirror: `ruijayfeng/zwknows`
- Vercel should remain connected to `zwknows/main`
- Source-to-mirror sync verified through: `eb76a165dac652e24ac674d322386e7447a3acf0`
- Working tree was clean before this documentation task.

## Recently Completed

- Replaced the prefixed LICENSE layout with the unmodified canonical GNU GPLv3
  text so GitHub can identify the repository license; the project copyright and
  GPLv3-or-later notice remain explicit in README.
- Added a compact README repository-identity section with the canonical GitHub
  URL and facts verified from `app/package.json` and the application source.
- Added visible GitHub repository and MIT License links to the app shell.
- Added true solar time correction support.
- Added free-text birthplace matching.
- Added local city and region coordinate dataset from `88250/city-geo`.
- Added Vercel Analytics.
- Added GitHub Actions workflow to sync `ziwei/main` to `zwknows/main`.
- Added workflow validation test for `sync-zwknows.yml`.
- Fixed sync workflow credential persistence by setting `persist-credentials: false`.
- Confirmed workflow succeeds with a classic PAT stored as `ZWKNOWS_SYNC_TOKEN`.

## Organization Migration

The Chart source repository moved to `ziweiknows/ziwei-chart`; Ziwei Chat and
ZATI moved to `ziweiknows/ziwei-chat` and `ziweiknows/zati`. GitHub preserved
the repositories' public visibility, history, community assets, workflows, and
the Chart `ZWKNOWS_SYNC_TOKEN` secret. The post-transfer source-to-mirror sync
completed successfully at `8922cc2d738334e5d7bb6ee6f43f105870728c8b`.

## Known Verification Baseline

Previously passed:

```powershell
cd app
npm run lint
npm run test
npm run build
npm run test -- sync-zwknows
```

Reverified on 2026-07-31 after the LICENSE/README evidence update:

- ESLint passed.
- Vitest passed 28/28 application tests.
- The sync workflow test passed 2/2 tests.
- The TypeScript and Vite production build completed successfully.
- The local LICENSE matches GitHub's canonical GPL-3.0 template after trimming
  leading and trailing whitespace.

Known build note: Vite may report a large chunk warning. That warning was already
known and is not by itself a failure.

## Open Risks

- `CLAUDE.md` currently reads as mojibake in this environment and should not be
  treated as the primary agent entry point.
- The birthplace matching experience depends on the quality and coverage of the
  local coordinate dataset.
- The deployment mirror sync depends on the GitHub secret `ZWKNOWS_SYNC_TOKEN`
  retaining both `repo` and `workflow` permissions.
- A July 2026 dependency audit reported 11 findings (1 low, 2 moderate, 8 high).
  This count is historical and must be rechecked against the current lockfile before
  remediation decisions.

## Next Useful Work

- Keep `ruijayfeng/zwknows` as the Vercel mirror unless the deployment model is
  deliberately migrated and revalidated.
- Consider replacing or migrating the garbled `CLAUDE.md` once the new docs have
  been accepted.
- Add feature-level tests whenever true solar time or birthplace matching behavior
  changes.
- Use GitHub issue templates for new feature, bug, and internal development work.
- Keep the in-app open source links pointed at `ziweiknows/ziwei-chart`.

[PROTOCOL]: Update this file after each feature, fix, release, deployment change,
or notable verification run.


## 2026-11-25 Completed engineering work

- PR #1 merged to the user's fork `main` as `b4fac3ff6ca40d9df22eb55fed1419c779d5189b`: Gemini API keys now use the `x-goog-api-key` header in both keyword extraction and streaming requests; added a regression test and CI workflow.
- PR #1 CI passed: `npm ci`, ESLint, Vitest, and TypeScript/Vite production build.
- PR #2 merged to the user's fork `main` as `92f0550b991138bea739809ed9ffeddbbb3ac04d`: Gemini streaming now requests the documented `alt=sse` format and parses SSE event boundaries, multi-part text, split chunks, CRLF separators, escaped quotes, and the final buffered event.
- PR #2 CI passed: dependency installation, lint, tests, and production build.
- The fork's deployment-sync workflow correctly skipped because its repository guard only permits the canonical `ziweiknows/ziwei-chart` source repository. No deployment-mirror push was performed.
- Official Gemini streaming protocol reference: https://ai.google.dev/gemini-api/docs/get-started/rest.

## 2026-11-25 In-progress security improvement

- Reviewing Zustand settings persistence because provider and Tavily API keys were included in the `ziwei-settings` localStorage payload.
- A proposed change on branch `security/keep-api-keys-out-of-local-storage` removes API credentials from persisted browser storage while retaining non-secret preferences.
- Credentials will remain in app memory for the current page session and need to be entered again after a reload.
- CI passed on 2026-11-25 after the versioned Zustand persist generic fix: dependency installation, ESLint, all 34 Vitest tests, and TypeScript/Vite production build.
- PR #3 remains open for merge at the time of this update.
- The same `npm ci` run reported 20 dependency audit findings (1 low, 7 moderate, 12 high). These are dependency advisories, not test failures; a separate lockfile/advisory review is now a priority.


## 2026-11-25 Dependency audit follow-up

- The latest CI dependency installation reported 20 vulnerabilities: 1 low, 7 moderate, and 12 high.
- Added a non-blocking CI audit-summary step on branch `ci/report-npm-audit-details` so the exact affected packages, vulnerable ranges, advisory titles, and fix availability are visible in workflow logs.
- This reporting-only change does not alter package versions or the lockfile. Dependency remediation will be handled in a separate reviewed change after examining the advisory output.


## 2026-11-25 Dependency update verification

- The compatible dependency update preview uses npm 11 because npm 10 failed with an Arborist `edgesOut` internal error on this lockfile.
- Updating within the declared semver ranges succeeded under npm 11, but the newer ESLint rules surfaced two existing synchronous state updates inside effects in `BirthForm.tsx` and `AIInterpretation.tsx`.
- Refactored birthplace matching state transitions into input/toggle handlers and initialized the AI interpretation display from its cache, removing the two effect lint errors without changing chart calculation behavior.
- Dependency updates are not merged yet; the preview must pass lint, all tests, and production build before a PR is opened.
