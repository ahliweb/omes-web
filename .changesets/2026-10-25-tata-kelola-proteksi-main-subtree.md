---
bump: minor
type: structure
impact: internal
---

# Audit `main` protection and the `apps/cms` subtree ancestry (issue #23)

Two new audits keep the merge-commit-only rule for subtree syncs true instead of remembered.

- `bun run audit:repo-settings` reads the live GitHub settings (merge methods, `main` protection, rulesets) and fails if squash/rebase is on, merge commits are off, force-push/deletion is allowed, `enforce_admins` is off, linear history is on, fewer than 1 review is required, a required check is missing, or a ruleset grants bypass. It exits 2 (fail closed) when the settings cannot be read. Maintainer-run: branch protection needs admin rights.
- `bun run audit:subtree` checks the subtree's history against a new single record, `ops/awcms-subtree.json` (`lastSyncCommit`): ancestry, `git merge-base HEAD awcms/main`, the narrowed no-tags `awcms` remote, and upstream tags leaking into the product namespace. A subtree-sync PR now updates that record in the same change.
- New `.github/workflows/governance.yml` runs `audit:subtree` on PRs, pushes, weekly and on demand — on probation, not a required check.
- `docs/alur-kerja-pengembangan.md` is rewritten to this repository's verified settings, with a break-glass procedure and a restore-from-merge plan; `AGENTS.md` lists the new audits and the Bun pin in `governance.yml`.
