---
bump: minor
type: content
impact: internal
---

# Sync apps/cms subtree to awcms 9ca28dee

Pulled `ahliweb/awcms` `main` (`e48bd84f` → `9ca28dee`) into `apps/cms`, carrying in
upstream PRs #839 (real vendoring provenance on the Arsitektur screen), #840 (a
Debian base-image security upgrade patching CRITICAL `perl-base` CVEs in
`Dockerfile.production`'s base stage), #841 (deploy docs split), #842 (long
unbreakable text no longer widens the admin main column), #844 (topbar/legal-hold-form
overflow fixes at 1024px/360px), #845 (the repository-progress feature: sql/166-167,
`omes:repository-progress:poll`, `omes_control.repository_progress.configure`, and
`/api/v1/omes/repository-progress[/config]` — closes ahliweb/omes#249), and #846
(Progres Hermes UX polish — danger button, milestone titles, checkbox sizing).

- `APP_BUDGET_BYTES` raised 274,833 → 277,356 B, carrying both lineages per
  AGENTS.md's divergence rule: upstream moved 237,433 → 239,956, a +2,523 B delta
  added to this repo's own figure (274,833 + 2,523 = 277,356).
- New migrations sql/166-167 ship in this sync; they still need to be applied to any
  running database before the repository-progress projection is usable (see the
  production runbook for the applied sequence).
- Two upstream-authored generated docs (`apps/cms/docs/PROJECT_STATE.md`/`.id.md`) still said
  "25 modules" after the wholesale-then-regenerate merge; fixed to 26 to match this
  embed's own module registry (which also carries the `commerce` module upstream does
  not have), same class of stale-prose fix the `4a7416ac` sync made for the equivalent
  "25 registered modules"/`sql/001-sql/164` count.

Part of ahliweb/omes#249.
