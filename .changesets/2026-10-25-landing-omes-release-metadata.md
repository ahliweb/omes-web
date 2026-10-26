---
bump: patch
type: fix
impact: public
---

# Landing page shows the verified OMES v0.6.0 release, not a hardcoded v0.4.0

The `landing` home page hardcoded `Pre-alpha · v0.4.0`, a `v0.4.0` bootstrap URL and copy claiming
`v0.4.0`, while `ahliweb/omes` had published `v0.6.0` (annotated tag, stable, 2026-09-28).

- One read-only build-time file, `apps/storefront/src/config/omes-rilis.json`, now holds the tag,
  tag object, commit, release/changelog/install-guide links, installer blob sha and sha256, and the
  install command. `omes-rilis.ts` validates it and fails the build on a malformed or inconsistent
  file; `Beranda.astro` renders the version chip, description, install section and links from it
  only. No origin is added to the derived CSP (the new links are navigation).
- The printed command is `curl -fsSL https://raw.githubusercontent.com/ahliweb/omes/v0.6.0/install/bootstrap.sh | bash -s -- --ref v0.6.0`.
  The `--ref` pin is required: the `v0.6.0` bootstrap still defaults `OMES_DEFAULT_STABLE_TAG` to
  `v0.4.0`, so without it the command would install `v0.4.0`. OMES's own `v0.6.0` README still
  shows the old command (upstream discrepancy, recorded in `docs/alur-kerja-pengembangan.md`).
- `bun run verify:omes-release` (`tools/omes-release-verify.mjs`) checks the file against the
  GitHub API (published, not a prerelease, tag object, commit, installer blob sha) without ever
  downloading or executing the installer, and fails closed (distinct exit codes) on any network
  or API error. `.github/workflows/omes-release-verify.yml` runs it on related PRs, weekly and on
  demand; it is deliberately not a required check because it depends on the network.
- Offline tests cover the schema, the command format, the built landing page (the exact command
  once, no other OMES version literal, CSP unchanged) and the verifier with fixtures.
