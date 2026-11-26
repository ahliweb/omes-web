---
bump: minor
type: structure
impact: internal
---

# Replace CodeQL with OpenGrep SAST and gitleaks

CodeQL is removed from CI and replaced by a `keamanan` workflow (job `keamanan / sast-rahasia-dependensi`: gitleaks over the commit range plus OpenGrep SAST), under the internal cross-portfolio standard (DL-098). The reason is licensing: GitHub's CodeQL terms do not permit use on non-open-source code or in CI without a GitHub Advanced Security licence, and the owner chose a single security path for every repository.

- Removed `.github/workflows/codeql.yml` and `.github/codeql/`; nothing uploads to Code scanning any more.
- Added `.github/workflows/keamanan.yml`, `tools/ci/sast/` (pinned OpenGrep `v2.1.0`, copied `opengrep-rules` (212 rules: 203 JavaScript/TypeScript and 9 GitHub Actions workflow), local rules, tests) and `tools/ci/sast/baseline.json`, which holds the `ERROR` findings present at adoption and may only shrink. Dependency audit stays in `ci.yml`.
- Updated `SECURITY.md`, `AGENTS.md`, `README.md`, `docs/status.md` and `docs/alur-kerja-pengembangan.md` (and their Indonesian mirrors). The context `Analyze (javascript-typescript)` must be removed from branch protection by the owner.
