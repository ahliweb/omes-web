---
bump: minor
type: content
impact: internal
---

# Sync apps/cms subtree to awcms 4a7416ac

Pulled `ahliweb/awcms` `main` (`0d6c0dfe` → `4a7416ac`) into `apps/cms`,
carrying in the design system, AI-privacy consumption (sql/160-162),
design polish, Hermes orchestration (sql/163-164), a tree-indentation
CSP fix, the Arsitektur screen (sql/165), and a stale-session rendering
fix — upstream PRs #829, #830, #832, #834, #835, #836, #837.

- `APP_BUDGET_BYTES` raised 263,400 → 274,833 B, carrying both lineages
  per AGENTS.md's divergence rule (upstream moved 226,000 → 237,433,
  a +11,433 B delta added to this repo's own figure).
- New migrations sql/160-165 ship in this sync; they still need to be
  applied to any running database before the corresponding admin
  screens are usable (see the production runbook for the applied
  sequence).

Part of ahliweb/omes#246.
