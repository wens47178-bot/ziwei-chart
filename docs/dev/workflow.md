# Workflow

> L2 | Parent: `AGENTS.md`

## Local Development

From `app/`:

```powershell
npm run dev
```

Use the local URL printed by Vite. If a frontend behavior changes, verify it in a
browser when practical.

## Verification

From `app/`:

```powershell
npm run lint
npm run test
npm run build
npm audit
```

GitHub Actions also prints a non-blocking dependency-audit summary after `npm ci`.
It lists affected packages, severity, vulnerable version ranges, and whether npm
reports an available fix. Audit findings must be reviewed and remediated separately;
the audit-report step does not silently upgrade or rewrite the lockfile.

For deployment mirror workflow edits:

```powershell
npm run test -- sync-zwknows
```

## Documentation Gate

Before finishing any meaningful change, update the matching development document:

- `docs/dev/progress.md` for current status, shipped work, risks, and verification.
- `docs/dev/project-map.md` for structure, module ownership, or data flow.
- `docs/dev/decisions.md` for durable product or technical choices.
- `docs/dev/workflow.md` for commands, release, GitHub, or Vercel process.
- `app/AGENTS.md` for app-level module and testing guidance.

Then check:

```powershell
git diff --stat
git status --short --branch
```

## GitHub Issue Rules

Use GitHub issue templates for incoming work:

- Bug reports must include symptom, reproduction steps, expected behavior, area,
  and documentation impact.
- Feature requests must include problem, smallest useful solution, acceptance
  criteria, area, and documentation impact.
- Development tasks must include scope, likely files or modules, verification
  plan, and documentation-as-code checklist.

Issues may start as rough notes, but implementation work should not begin until
scope, verification, and documentation impact are clear enough to execute.

## Pull Request Rules

Every PR must fill out `.github/PULL_REQUEST_TEMPLATE.md`.

The documentation-as-code checklist is part of review. A PR that changes behavior,
architecture, workflow, deployment, data sources, or development process without
matching documentation is incomplete.

For code changes, include fresh verification evidence. If a command is not run,
state the reason in the PR.

## GitHub Sync to Vercel Repository

Source repo: `ziweiknows/ziwei-chart`

Deployment mirror: `ruijayfeng/zwknows`

The workflow `.github/workflows/sync-zwknows.yml` runs on pushes to `main`.
It pushes source `main` to `zwknows/main` with `--force-with-lease`.

Required GitHub secret on `ziweiknows/ziwei-chart`:

```text
ZWKNOWS_SYNC_TOKEN
```

The token must have access to `ruijayfeng/zwknows` and include permissions needed
to update workflow files, currently `repo` and `workflow` for a classic PAT.

## Tianyan Render Deployment

- Create a separate Static Site for the short `onrender.com` address. Use `app`
  as the root directory, `npm ci && npm run build` as the build command, and
  `dist` as the publish directory. Keep the original site in service.
- On the hosted AI service running `node server/index.mjs` from the repository
  root, set `AI_ALLOWED_ORIGINS` to the new site's exact HTTPS origin. Append to
  existing values with a comma. `GEMINI_API_KEY` belongs on the AI service only.
- Check `/health`, a browser preflight from both site origins, and a streamed
  report using synthetic chart data. A configured health response only confirms
  that the key is present. Use a free-tier AI project for live tests.

## Sync Debugging

Check recent runs:

```powershell
gh run list --repo ziweiknows/ziwei-chart --workflow "Sync zwknows deployment repository" --limit 3 --json databaseId,status,conclusion,headSha,url
```

Inspect a run:

```powershell
gh run view <run-id> --repo ziweiknows/ziwei-chart --json status,conclusion,attempt,headSha,url
gh run view <run-id> --repo ziweiknows/ziwei-chart --log
```

Compare refs:

```powershell
git ls-remote origin refs/heads/main
git ls-remote zwknows refs/heads/main
```

Both refs should match after a successful sync.

[PROTOCOL]: Update this file when commands, CI, GitHub, Vercel, or release flow
changes.
