🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](alur-kerja-pengembangan.id.md)

# Development workflow

Branching, the homegrown changeset convention, the release cut, and this repository's actual GitHub branch protection — read from the repository's own live settings, not from what was planned.

## Branching and PRs

One branch per issue, cut from `main`; a PR back into `main`, titled to reference the issue it closes. [`CONTRIBUTING.md`](../CONTRIBUTING.md) names the full contribution flow and the Definition of Done in [`AGENTS.md`](../AGENTS.md#definition-of-done) — this document does not repeat either, only the parts specific to how a change actually lands.

## Branch protection on `main`

Read from `ahliweb/omes-web`'s own live GitHub settings on 25 October 2026 (issue #23), not from what was planned. The settings had been changed after the issue was filed, so the issue's original "unprotected / squash allowed" evidence was already stale — the lesson that produced `bun run audit:repo-settings`, a maintainer-run command that reads these same endpoints and fails if any line below stops being true:

```
gh api repos/ahliweb/omes-web
gh api repos/ahliweb/omes-web/branches/main/protection
gh api repos/ahliweb/omes-web/rulesets
```

| Setting | Value |
| --- | --- |
| Merge methods | Merge commit **allowed**; squash **off**; rebase **off** (`allow_merge_commit=true`, `allow_squash_merge=false`, `allow_rebase_merge=false`). `delete_branch_on_merge` is on |
| Required status checks | Twelve contexts: `Check (toko)`, `Check (berita)`, `Check (landing)`, `check-cms`, `template-init-smoke (toko)`, `template-init-smoke (berita)`, `template-init-smoke (landing)`, `template-init-smoke (root-suite)`, `e2e (toko)`, `e2e (berita)`, `e2e (landing)`, `Analyze (javascript-typescript)` — all reported by GitHub Actions. The list lives in one place, `packages/gerbang/lib/repo-settings-policy.mjs`, and `tests/repo-settings-policy.test.mjs` proves each is a real job name in `.github/workflows/` |
| Strict (branch must be up to date before merging) | Yes |
| Required reviews | **1 approving review**; stale approvals are dismissed on a new push; code-owner review is not required; approval of the last push is not required |
| Required conversation resolution | Yes |
| Enforce for admins | **Yes** — an administrator cannot merge past a red or pending check or a missing review |
| Force pushes / branch deletion | Refused / refused |
| Required linear history | **No, deliberately** — it forbids the real merge commits the full-history subtree model is built from (see "The subtree embed" in [`AGENTS.md`](../AGENTS.md#the-subtree-embed)). `audit:repo-settings` fails if someone turns it on |
| Required signatures | No |
| Lock branch | No |
| Repository rulesets | **None** (`gh api repos/ahliweb/omes-web/rulesets` returns `[]`). The repository is user-owned, so no organisation ruleset applies either. Were one added, `audit:repo-settings` fails closed on any active ruleset that lists bypass actors |

### Effective bypass policy

There is none. `enforce_admins` is on and no ruleset exists, so no actor — owner included — can push to `main` or merge a PR past the rules above. The only way past them is to change the settings themselves, which is the break-glass procedure below and nothing else.

### What one required review means with one maintainer

GitHub does not let an author approve their own PR. With a single maintainer, a required review therefore **blocks every PR the maintainer opens** until a second account approves it — a collaborator, or a reviewer bot account added as a collaborator. This is a deliberate trade: the protection that guarantees nobody (including an automation holding the maintainer's token) lands an unreviewed change on `main` is the same protection that makes the maintainer wait for a reviewer. Do not "fix" the wait by lowering the count or by disabling `enforce_admins`; add a reviewer, or use the break-glass procedure when a wait is not affordable. `audit:repo-settings` fails if the count drops below 1.

### Merge method and the subtree trap

GitHub cannot restrict a merge method to PRs touching one path, so the rule that a subtree-sync PR must be merged with a merge commit ([ADR-0001](adr/0001-git-subtree-with-full-history-for-apps-cms.md)) is enforced repository-wide: squash and rebase are switched off, and the merge button offers a merge commit only. Branch protection alone does not restrict merge method, which is why the repository setting is audited as well as the protection.

### Checking it

```
bun run audit:repo-settings                 # live: needs `gh` signed in as a repository ADMIN
bun run audit:repo-settings --from <dir>    # fixtures: repo.json, protection.json, rulesets.json
bun run audit:subtree --require-remote      # history, not settings — see below
```

`audit:repo-settings` exits `0` when every line holds, `1` when a setting is wrong, and `2` when the settings could not be read (no `gh`, not signed in, not an admin, offline). **Exit `2` is a failure, never a pass**: an unreadable setting is not treated as a compliant one. Reading branch protection needs repository administrator rights, which a workflow's `GITHUB_TOKEN` does not have, so this audit is **maintainer-run** — after any settings change, at each release cut, and monthly — not a CI step.

### Subtree ancestry: `governance.yml` and `audit:subtree`

Settings stop a squash from being offered; they cannot show that the history underneath is still sound. `bun run audit:subtree` (`tools/subtree-ancestry-check.mjs`) reads the history itself, against one machine-readable record, [`ops/awcms-subtree.json`](../ops/awcms-subtree.json), which holds the upstream commit `apps/cms` was last synced to. It checks that:

- the recorded `lastSyncCommit` is an ancestor of `HEAD`, and `git merge-base HEAD awcms/main` equals it — so a sync landed without updating the record (merge base newer than the record) and a squashed/rebased sync (record not on the path to upstream) are both caught;
- the `awcms` remote, when present, fetches only `main`, has `tagOpt --no-tags`, and points at the recorded upstream;
- every local tag matches the product pattern (`^v\d+\.\d+\.\d+$`) and none points into upstream's own history (an ancestor of `lastSyncCommit`), which is what an upstream release tag imported by a plain fetch looks like;
- the clone is not shallow (ancestry cannot be judged from one; the check refuses rather than guesses).

**Every subtree-sync PR updates `ops/awcms-subtree.json` in the same change**; the sync is not complete until it does, and the audit says so. It runs in [`.github/workflows/governance.yml`](../.github/workflows/governance.yml) on pull requests, pushes to `main`, a weekly schedule and manual dispatch (full-history checkout, the upstream remote added narrowed and `--no-tags`). **`governance / subtree-ancestry` is on probation and is NOT a required status check yet**; it is promoted only after a post-introduction run history shows no false failure, the same path `e2e` and `template-init-smoke` followed — and promotion is a separate change to `main`'s protection plus `EXPECTED_REQUIRED_CONTEXTS`. It deliberately stays out of the bare root `bun test`: it needs full history and a fetched upstream ref, so its unit tests (`tests/subtree-ancestry.test.mjs`) build throwaway git repositories instead.

### Break-glass procedure

For an emergency that cannot wait for a review — a broken `main`, a leaked secret that needs a same-hour fix — and only then:

1. **Who.** The repository owner (a settings administrator). Nobody else, and no automation.
2. **Prefer not to touch the rules.** Open the PR and ask a collaborator to approve it, or revert the offending commit through an ordinary PR. Settings change only if neither works in time.
3. **Record first.** Before changing anything, open an issue titled `break-glass: <reason>` stating the time, the reason, and exactly which setting you will change, and save the output of `gh api repos/ahliweb/omes-web/branches/main/protection` to the issue. That output is the evidence of what to restore.
4. **Change the minimum, for the minimum time.** Lower only the one setting that blocks you (normally `required_approving_review_count`, or `enforce_admins` for a red required check). Never enable squash or rebase, never turn on linear history, and never touch force-push or deletion.
5. **Land the fix** as a PR with a merge commit, linking the issue.
6. **Restore immediately,** from the saved output, then run `bun run audit:repo-settings` and paste its `OK — no violations.` into the issue. The break-glass is not over until that audit is green.
7. **Close the issue with a short account** of why the normal path did not work, and what would let it work next time.

### Restoring subtree ancestry

If a subtree-sync PR was ever squashed or rebased — `audit:subtree` fails with "not an ancestor of HEAD" or "ancestry broken", or the next `git subtree pull` conflicts against history git cannot line up — repair it before any further sync:

1. **Stop syncing.** Do not paper over it with a manual merge; stacking syncs on a broken base buries it.
2. **Revert the squashed PR** on a branch (`git revert <squash commit>`) and merge that revert as an ordinary PR with a merge commit. The `apps/cms` tree returns to the previous sync.
3. **Confirm the ancestry** is back: `git fetch awcms main`, `git merge-base HEAD awcms/main` is the pre-squash sync commit, and `ops/awcms-subtree.json` names it. If the record was moved forward by the squashed PR, the revert restores it.
4. **Redo the sync** from the restored base: `git subtree pull --prefix=apps/cms awcms main` on a branch, update `ops/awcms-subtree.json` to the new upstream commit in the same PR, and merge it with a **merge commit**.
5. **Re-run `bun run audit:subtree --require-remote`** and `bun run audit:repo-settings`. If squash or rebase merging turns out to have been re-enabled, fix that setting first — it is how this happened.
6. **If the merge base was already lost** (a pull cannot find any common ancestor): run the one-time ancestry merge described under "The subtree embed" in [`AGENTS.md`](../AGENTS.md#the-subtree-embed) — `git merge -s ours --allow-unrelated-histories <the awcms commit apps/cms matches>`, after confirming the tree matches — then continue from step 4.

Never force-push `main` to repair any of this; the protection refuses it, and the repair is always a forward change.

## Homegrown changesets, not `@changesets/cli`

A change affecting public behaviour, workspace structure, dependencies, or deployment gets a file in [`.changesets/`](../.changesets/README.md) in the same change that causes it: `YYYY-MM-DD-summary-in-kebab-case.md`, with `bump: major | minor | patch` frontmatter chosen while writing the change, because that is the only moment anyone reliably knows the answer. `bun run audit:rilis` watches the waiting backlog and reddens once it crosses 20 files or 14 days old — a signal a release is due, not a fault.

## Wave-based delivery, in this epic

Increment 2 (epic #21) was delivered as a sequence of atomic, single-issue PRs rather than one large change: a first wave of independent foundation work (#22's `check:cms` fix, #24's storefront chrome, #25's local PostgreSQL + seed + `check-cms`), then CMS/storefront pairs that had to serialise against the same module (`commerce` catalog #23 → marketing #26 → orders/customers #29 on the `apps/cms` side; chrome #24 → news #28 → catalog #27 → checkout #30 on the `apps/storefront` side, each depending on the previous one's shared files), with this documentation issue (#31) running last because it is the one thing that has to see every other issue merged before it can describe the tree truthfully. Each PR names its own "Notes/Deviations/Decisions for #31" section specifically so this refresh does not have to re-derive them from the diff.

## The release cut

`bun run release` (a maintainer's action, [`tools/rilis.mjs`](../tools/rilis.mjs)) folds every waiting changeset into `CHANGELOG.md`, using the **largest** `bump` among them to decide the next version — one `minor` beside nine `patch` entries makes the whole release `minor`, so the size of a release is a consequence of what went into it, not a judgement made at release time from a list of file names. `--commit` additionally tags `vX.Y.Z`. Issue #31 (this documentation refresh) does not cut the release itself — see [`.changesets/README.md`](../.changesets/README.md) for the backlog bound and `README.md`'s "Gates" section for `audit:rilis`.

Pushing that tag is what actually publishes it (issue #181). [`.github/workflows/release.yml`](../.github/workflows/release.yml) triggers on `push: tags: ['v*']`, extracts the pushed version's `CHANGELOG.md` section with [`tools/rilis-catatan.mjs`](../tools/rilis-catatan.mjs), and creates a GitHub Release from it with `GITHUB_TOKEN` — marked "latest" only when that tag is the highest `v*` semver in the repository. The same workflow also accepts `workflow_dispatch` with a required `tag` input, idempotently running `gh release edit` rather than failing when that tag already has a Release — the way to back-fill a tag pushed before this workflow existed, or to re-publish one's notes after a `CHANGELOG.md` correction.

## CI: two jobs — one unconditional, one against a real database

`.github/workflows/ci.yml` defines two jobs.

**`check`** (`name: Check`, `timeout-minutes: 15`) runs on every push to `main`, every pull request, and on manual dispatch, needing no build, no live `apps/cms`, and no database. Since increment 6 (issue #137, [ADR-0018 D7](adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.md)), it is a **3-leg matrix** (`strategy.matrix.profile: [toko, berita, landing]`, `fail-fast: false`) — GitHub displays each leg as `Check (toko)`, `Check (berita)`, `Check (landing)`. Every leg runs `bun run check:lockfile`, `bun install --frozen-lockfile`, then `SITE_PROFILE=<leg> bun run check` (a storefront type-check that covers `src/profil/**` regardless of which group is active) and `cd apps/storefront && SITE_PROFILE=<leg> bun test tests/profil-build-smoke.test.ts tests/profil-routes.test.ts` — that leg's own build against the stub CMS, proving the excluded page groups are genuinely absent from `dist/` and the sitemaps. The root `bun test`, `audit:dokumen`, `audit:translation`, `audit:graf`, `audit:rilis`, and `bun audit --audit-level=low` are profile-independent, so they run **once, on the `toko` leg only** (`if: matrix.profile == 'toko'`), with no `SITE_PROFILE` set — in that step, `profil-build-smoke` itself builds all three profiles, so the `toko` leg alone still proves the whole matrix. Nothing in this job builds a container image or deploys anything.

**`check-cms`** (`name: check-cms`, `needs: check`, `timeout-minutes: 20`) runs against a real `postgres:18.4` service container (`POSTGRES_USER=awcms`, `POSTGRES_DB=awcms`, port 5432, health-checked with `pg_isready`):

1. `bun install --frozen-lockfile` at the root.
2. `cd apps/cms && DATABASE_URL="" bun run check` — the full ~53-step chain (lint, docs/i18n, every registry/consistency gate, typecheck, `bun test` with every DB-gated suite skipping cleanly, `bun run build`).
3. `DATABASE_URL=postgres://awcms:awcms_ci_password@127.0.0.1:5432/awcms` is written to `$GITHUB_ENV`, then `bun run db:migrate:cms` applies every migration to the fresh service database.
4. `cd apps/cms && bun test tests/integration/ --timeout 60000` — the DB-gated integration suite, now running for real (over 670 tests as of the orders/customers PR).
5. A job-summary step (`if: always()`) greps the trailing `N skip` count from both log files and reports the before/after DB-gated skip count, so a reviewer can see the suites actually ran instead of silently skipping twice.

All three `Check` legs and `check-cms` are required status checks on `main` (see "Branch protection on `main`" above) — this closes the gap earlier drafts of this document described: `apps/cms`'s own gate chain, and its RLS/DB coverage, run in THIS repository's CI on every PR, not only locally.

## CI: a third, now-required workflow — `template-init-smoke`

`.github/workflows/template-init-smoke.yml` (issue #138) is a SEPARATE workflow file, not a third job on `ci.yml` — that file is owned by a different, since-landed change (issue #137), and this workflow's own scope asked for a new file rather than a job bolted onto it. **All four of its legs — `template-init-smoke (toko)`, `template-init-smoke (berita)`, `template-init-smoke (landing)`, `template-init-smoke (root-suite)` — became required status checks in issue #182 (22 September 2026)**, following the same promotion pattern `check-cms` itself went through (see "Branch protection on `main`" above): promoted only after it had run green on `main` for a while, with at least three consecutive runs against the same code state all green first (issue #147's own acceptance criterion — see below for why that bar exists).

**Shape since issue #147.** The original workflow ran a full root `bun test` — including every storefront build-smoke test, each of which starts its own stub CMS and its own `astro build` — once per matrix leg, so three copies of that suite competed for the same two-core runner's CPU/IO at once. Two consecutive `main` runs each failed a DIFFERENT leg's `Root bun test` step on a DIFFERENT build-smoke test's stub-start deadline — contention, not a real profile defect, but exactly the kind of intermittent red that makes a "required" status untrustworthy. The fix is a responsibility split, not a bigger timeout:

- **The `template-init-smoke` matrix job** (`toko`/`berita`/`landing`, ADR-0018 D2) still runs the real thing per profile: `bun run template:init --profil <profile> --yes` against its own checkout (`TEMPLATE_INIT_TEST_SCOPE=root` keeps that tool's own trailing `bun test` scoped to the root gate tests, not the full workspace), starts the storefront's stub CMS (its PID written to a file so a later step can always find and kill it), runs `SITE_PROFILE=<profile> bun run build` from `apps/storefront`, then `bun scripts/assert-profil-dist.ts` — a deterministic check over that SAME already-built `dist/client` (excluded groups' files/directories absent, active groups' present, no sitemap entry or built-page link crossing into an excluded route), derived from `apps/storefront/src/config/profil.ts` the same way `apps/storefront/tests/profil-build-smoke.test.ts`/`apps/storefront/tests/profil-routes.test.ts` are, but without triggering a SECOND build the way running those two test files again would. A trailing `if: always()` step kills the stub's PID and, `if: failure()`, prints `/tmp/stub-awcms.log`.
- **A separate `root-suite` job**, with no matrix, runs `template:init --profil toko` (again `TEMPLATE_INIT_TEST_SCOPE=root`) and then the full `bun test` exactly ONCE, on its own runner with nothing else competing for CPU. This is now the only place in the whole workflow the full derived-repository suite runs.

Two details keep the workflow's own gate chain from failing on itself. First, the stub-CMS readiness probe polls **with a bearer token** (`curl -sf -H "Authorization: Bearer stub" http://localhost:4310/api/v1/commerce/products`) — the stub answers `401` to an unauthenticated request on purpose (`apps/storefront/scripts/stub-awcms.mjs`), and a plain `curl -f` would read that `401` as "not up yet" forever. Second, `tests/template-init.test.mjs` skips itself the moment it detects it is no longer running inside `awcms-one` (`package.json.name !== "awcms-one"`) — without that guard, a `template:init` run's own trailing `bun test` would discover and re-run its own test file inside the very repository it just initialised, whose full-run tests then try to build another temporary copy from `git ls-files`, which still lists paths that run's own removal step already `unlinkSync`'d (never `git rm`'d), throwing `ENOENT` on every one.

## CI: a fourth, now-required workflow — `e2e`

`.github/workflows/e2e.yml` (issue #183) is a SEPARATE workflow file from `ci.yml`, matching `template-init-smoke.yml`'s own precedent: a real-browser Playwright suite is slower and carries a different flake risk than a type-check or a unit test, so it was introduced on a deliberate probation period rather than required outright. It matrices `apps/storefront`'s e2e specs over the same three build profiles (`e2e (toko)`, `e2e (berita)`, `e2e (landing)`, `fail-fast: false`), each leg building one real site against the committed stub CMS fixtures (`apps/storefront/tests/e2e/build-and-serve.ts`/`apps/storefront/tests/e2e/global-setup.ts` — no live `apps/cms`, no network beyond `bun install` and the Chromium download) and running: the checkout and ad-popup flows, axe-core accessibility assertions failing on `serious`/`critical` WCAG 2.1 A/AA violations, and a deterministic no-horizontal-overflow check at 360px. Full-page screenshots (mobile and desktop, every key page, every profile) are uploaded as CI artifacts for a human to look at — never compared against a committed baseline, since cross-OS font rendering makes a byte-level baseline flaky by construction and a hosted visual-diff service is a paid external dependency this repo does not have.

**All three legs became required status checks in issue #215 (24 September 2026)**, following the same promotion pattern `check-cms` and `template-init-smoke` went through: promoted only once the post-introduction run history showed no e2e failure. The reviewed sample was at least seven consecutive green runs after issue #183 introduced the workflow (#197, #202, #203, #204, #207, #208, #209), and a broader check of `gh run list --workflow e2e.yml` at promotion time found no additional run outside that sample in any state other than success (or still in progress). The exact contexts were verified against a real PR's checks (`gh pr checks`/`gh api .../check-runs`) rather than inferred from the workflow file, since GitHub derives a matrix job's displayed context from `jobs.<id>.name`, not the job key.

## CI: a fifth, now-required workflow — `codeql`

`.github/workflows/codeql.yml` (issue #184, part of epic #179) runs GitHub's CodeQL analysis over this workspace's own JavaScript/TypeScript source, on every push to `main`, every pull request, a weekly schedule, and manual dispatch. `build-mode: none` (CodeQL's no-build source extraction) keeps the job Bun-only — no `astro build`, no live `apps/cms`, no application code ever runs — and CodeQL ships no Astro extractor, so every `.astro` file anywhere in the workspace is outside this scan regardless of `.github/codeql/codeql-config.yml`'s own `paths-ignore`. `apps/cms/**` SOURCE stays in scope: it is the code that actually runs in this deployment (see [`SECURITY.md`](../SECURITY.md)'s "Five surfaces"), even though that tree is upstream `ahliweb/awcms` embedded via subtree (see "The subtree embed" in [`AGENTS.md`](../AGENTS.md#the-subtree-embed)); only its generated/vendored output is excluded, on the same terms as this repository's own equivalent output. The query suite is `security-extended`, not upstream `ahliweb/awcms`'s own `security-extended,security-and-quality` — kept deliberately narrower, the same discipline "The gates" above applies to withholding `audit:graf`/`check-cms` until there was capacity to act on them.

Findings land on this repository's own Security → Code scanning tab, separate from `ahliweb/awcms`'s own scan of the same tree. A finding under `apps/cms/**` is triaged per [`SECURITY.md`](../SECURITY.md): fixed here only if it falls inside one of AGENTS.md's documented local divergences or this repository's own `commerce` module, otherwise reported to (and fixed in) `ahliweb/awcms` and pulled in through the normal subtree sync. See [`SECURITY.md`](../SECURITY.md)'s "CodeQL triage" section for this repository's own triage record (issue #206) — which alerts were dismissed and why, and the two standing rules (a SHA-256 hash over a high-entropy random token is not a password hash; PKCE S256 is RFC 7636 §4.2) a future alert on the same shapes should not re-litigate.

**Promoted to a required status check in issue #214 (24 September 2026)**, following the same probation-then-promotion pattern `check-cms`, `template-init-smoke`, and `e2e` were each held to: this workflow ran on every push and PR since issue #184 without a required-check gate while issue #206 established a real triage process and recorded reasons for every dismissal, and the two actionable `js/clear-text-logging` findings were fixed in code by #205/#208. The reviewed post-introduction PR history (#194, #196, #197, #200–#204, #207–#209) showed at least 11 successful runs with no observed workflow failure.

**The required context is `Analyze (javascript-typescript)`, not the sibling `CodeQL` check — verified, not inferred, from a real PR's check-runs** (`gh pr checks <n>` and `gh api repos/ahliweb/awcms-one/commits/<sha>/check-runs`, read against the PR's *head* commit, since the merge commit only carries the Actions-side checks). GitHub posts two distinct checks against the same commit for this workflow:

- **`Analyze (javascript-typescript)`** — app `GitHub Actions` (`app_id` 15368), the workflow job's own status. This is the job named in `codeql.yml`'s `jobs.analyze.name`, and it reports `failure` whenever the job itself errors — a broken `Initialize CodeQL` step, an extraction failure, an action failure, a timeout — regardless of whether any SARIF was ever produced or uploaded.
- **`CodeQL`** — app `GitHub Advanced Security` (`app_id` 57789), the code-scanning **results** check. GitHub creates/updates this one only once a SARIF upload succeeds, from the alert data in that upload; it says nothing about whether the analysis run itself completed.

The issue's own failure/triage policy requires a required CodeQL check to "fail closed for workflow/analyzer failure" — findings themselves stay on GitHub's ordinary code-scanning severity/triage semantics, not the merge gate. `Analyze (javascript-typescript)` is the one that actually does this: it is tied directly to the workflow job's own exit status, so an analyzer crash or a misconfiguration reports `failure` (or never completes, which also blocks a required check) rather than silently leaving no code-scanning results check behind for a required rule to even evaluate. `CodeQL`, being downstream of a successful SARIF upload, cannot distinguish "the analysis ran clean" from "the analysis never got far enough to produce a SARIF at all" in the case that actually matters for a merge gate. `Analyze (javascript-typescript)` was therefore added to `main`'s required status checks, additively, alongside the eleven contexts issue #215 had already established (see "Branch protection on `main`" above).

## Dependency updates

`.github/dependabot.yml` (issue #180) opens version-update pull requests — separately from Dependabot *security* updates, which were already on (see "Branch protection on `main`" above) and cover any ecosystem regardless of this file. One `updates` block today:

- **`github-actions`, `directory: "/"`.** Every action pinned in `.github/workflows/*.yml` — the SHA-pin-plus-`# vX.Y.Z`-comment convention AGENTS.md's "Configuration and toolchain" describes. Monthly, grouped (`github-actions-minor-patch`: minor and patch together in one PR; a major version is never grouped, since it can change an action's behaviour and gets its own PR and review), commit prefix `ci(deps)`.

**There is no `bun` block (issue #199, follow-up to #180/#179).** One was tried; its first scheduled run failed outright (run 35858077848): `Unsupported bun.lock 'lockfileVersion' 2 in /bun.lock. The bun version Dependabot runs supports up to 1.` This repo's root `bun.lock` is `lockfileVersion` 2 (Bun 1.4 writes v2), and downgrading the lockfile format just to keep a Dependabot block working was rejected — it would make the lockfile fight the pinned Bun version instead of the other way around. A monthly job that always fails is noise that hides a real failure, so the block was removed rather than left permanently red.

**The manual workflow this repo uses instead, for its own workspace dependencies** (root `package.json`, `apps/storefront`, `packages/*` — never `apps/cms`, which is `ahliweb/awcms` embedded via `git subtree`, AGENTS.md's "The subtree embed": upstream owns its own dependency set and ships its own `apps/cms/.github/dependabot.yml`, inert in this repo since GitHub only reads the config file at the repository root, and a version-update PR opened here against `apps/cms/package.json` would edit code a future `git subtree pull` can silently overwrite or conflict with):

1. `bun update` at the repo root (optionally scoped to one package, e.g. `bun update <name>`), which bumps `package.json` ranges and `bun.lock` together.
2. `bun run check:lockfile`, to confirm `bun.lock` still agrees with every workspace's `package.json` exactly — the same gate a Dependabot PR would have had to pass.
3. The root `bun test`/`audit:*` gates, same as any other change.
4. Bun's own version is never touched by this workflow: it is pinned in three places that must move together (`packageManager`/`engines.bun` in the root `package.json`, `bun-version` in every `ci.yml` job — AGENTS.md's "Configuration and toolchain"), and raising it is a deliberate, all-three-at-once edit, not a `bun update` side effect.

Re-enabling the `bun` block is a matter of restoring a `package-ecosystem: "bun"` block to `.github/dependabot.yml` (git history has its last shape, from before the commit that closed issue #199) once Dependabot's `bun` updater supports lockfile v2, then updating `tests/dependabot-config.test.mjs` — it already reads `bun.lock`'s own `lockfileVersion` and only requires the block back once that number is 1.

**Reviewing a `github-actions` Dependabot PR against the lockfile gate:** `bun run check:lockfile` and the root `bun test`/`audit:*` gates still apply as with any other change, though a workflow-file-only PR will not touch `bun.lock`. Dependabot moves the SHA and its trailing `# vX.Y.Z` comment together — it has updated version comments after SHA-pinned actions since October 2022 — so the thing worth a human glance is that the comment still ends in the version (a comment with trailing prose after the version is the one shape Dependabot's own updater skips, per its docs), not that the update happened at all.

## Seeding a profile locally

`tools/seed-cms.ts` (`bun run db:seed:cms` / `bun run db:seed:cms:profil <name>`, issue #139) seeds an already-migrated `apps/cms` with one of four profiles: the neutral, fictional `toko`/`berita`/`landing` sample sets under `tools/seed-data/profil/**`, or `contoh:borneojek-mart` (the default in THIS repository — `template:init`, issue #138, rewrites that default to the deployment's own chosen profile in a derived repo, see [`docs/template.md`](template.md)) — the live reference deployment's own full content under tools/seed-data/contoh/borneojek-mart/**. See [`docs/template.md`](template.md)'s "Sample seeds" section for what each profile contains.

**Never seed a neutral profile into this repository's own shared local dev database** (`postgres://awcms:awcms_dev_password@localhost:5433/awcms`, `bun run db:up`'s default) — it already holds this repository's own BjekMart tenant, and `POST /api/v1/setup/initialize` is a once-per-database singleton lock (see `tools/seed-cms.ts`'s own `ensureTenantAndSession`): a second `--profil` run against that same database fails the bootstrap step rather than creating a second tenant. Use `--dry-run` instead to see what a profile WOULD seed (it validates the profile's JSON and prints an inventory summary, making no network call at all, so it needs no running `apps/cms` and is always safe to run), or point `AWCMS_BASE_URL`/`POSTGRES_*` at a disposable database when a real run against a profile is actually needed.

## Not enforced today

A code-owner review requirement (`require_code_owner_reviews` is off; only `apps/cms/.github/CODEOWNERS` exists, and it is upstream's). A CI step that builds or publishes a container image, or deploys anywhere — see [`docs/deployment.md`](deployment.md) for what "deploying this repository" means today. (The merge-strategy restriction for `apps/cms`-touching PRs, previously listed here as honour-system only, is now mechanically enforced repository-wide — see "Branch protection on `main`" above — issue #149.)
