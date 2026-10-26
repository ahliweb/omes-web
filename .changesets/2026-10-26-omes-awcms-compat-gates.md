---
bump: minor
type: structure
impact: internal
---

# Release compatibility manifest and `compat:preflight` gate (#20)

`ops/compat/release-manifest.json` records the verified combination of product version, AWCMS sync
commit, native OMES release (`ahliweb/omes` v0.6.0) and the vendored OMES Control Center contract
(pin `a4026e63`, `release-plus-additive`: v0.6.0 plus two commits, worker protocol byte-identical).

- `bun run compat:preflight` (`tools/compat-preflight.mjs`, pure evaluator in
  `packages/gerbang/lib/compat-policy.mjs`) is offline and deterministic. It refuses an unknown
  contract major, a missing or altered worker schema (sha256 on disk vs `PIN.json` vs manifest), a
  stale manifest (90 days), a false `exact-release` claim, an `awcms-one` upstream, drift against the
  storefront's `omes-rilis.json`, `package.json` or (once present) `ops/awcms-subtree.json`, missing
  worker routes, an inbound WebSocket under the OMES API routes, and loss of the replay / idempotency
  / tenant-scope integration coverage. It states that the contract is not claimed tested against an
  exact published release while the pin is ahead of it.
- `bun run deploy:preflight` now folds it in and fails closed.
- Fixture tests plus a real-tree test run in the root `bun test`; `docs/deployment.md` carries the
  versioned test matrix, bump procedure and staged promotion / rollback.
