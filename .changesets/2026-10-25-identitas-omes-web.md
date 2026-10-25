---
bump: patch
type: docs
impact: internal
---

# Pin OMES-Web's product identity and inventory inherited awcms-one names

Corrects first-party text that still described this repository as the `awcms-one` template or the
BjekMart store: `AGENTS.md` now states what `ahliweb/omes-web` is, who owns what across
`omes-web`, `awcms-one`, `awcms` and the separate `ahliweb/omes` repository, and how bare issue
numbers are read; `README`, `SUPPORT`, `CONTRIBUTING`, `SECURITY`, `GOVERNANCE`,
`CODE_OF_CONDUCT`, `docs/status.md` and the issue-form links point at `ahliweb/omes-web`, while
template-era issue links are qualified as `ahliweb/awcms-one#NNN`. `docs/template.md` is reframed as
the retained template mechanism (its profile matrix is unchanged). The root `package.json` gets the
real repository URL and description.

`docs/deployment.md` gains "Persistent identifiers inherited from awcms-one": every Compose
project, volume, image, env key, backup label, cron file, database role, migration range and
browser-storage key that still carries the template name, and what a separately approved rename
would have to include. Nothing is renamed. The root workspace name stays `omes` because renaming
it needs a `bun.lock` regeneration that also churns dependency versions.
