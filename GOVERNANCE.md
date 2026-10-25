🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](GOVERNANCE.id.md)

# Governance

## The principle that binds every decision

**This repo is the public face, the content system, and the deployment of a product (OMES), built on a template that was itself a re-platform of a real commerce store.** A defect here is not abstract: the CMS holds the product's own data under row-level security, the public site is what visitors read and install from, and the commerce module inherited from the template was designed to carry real transactions. Every decision is judged against that.

What follows from it:

- A new rule brings its own checker where one is possible. A rule that is merely written is a rule that erodes, and the most dangerous version is one that looks guarded and is not.
- Re-platforming means re-expressing, not guessing. A schema decision that cannot be traced back to the live `commerce_bj_mart` database is a decision made on an assumption, in a domain where the assumption is checkable.
- A gate is loosened only by a deliberate, recorded decision — never quietly, to make CI green.

## Roles

| Role | Authority |
| --- | --- |
| **Maintainer** | Approves merges, settles scope questions, publishes releases and tags |
| **Contributor** | Proposes a change to this repo's code or documentation, with its reasoning and (where possible) its checker |
| **Translator** | Fills in and edits the Indonesian mirrors of the governance documents |
| **AI agent** | May do anything [`AGENTS.md`](AGENTS.md) permits |

Roles inside `apps/cms` for its own general-purpose capabilities — module admission, RBAC/ABAC policy — follow `awcms`'s own governance as carried in `apps/cms/GOVERNANCE.md`; this document governs `omes-web` as a repository, not `awcms`'s own internal design authority.

## Recording a decision

This repo keeps a formal architecture-decision-record log in [`docs/adr/`](docs/adr/), indexed by [`docs/adr/README.md`](docs/adr/README.md). A decision that changes this repo's structure, its data model, or a rule in `AGENTS.md` is recorded as an ADR there, alongside the pull request that makes it and, where the change is public or structural, its changeset (see [`.changesets/README.md`](.changesets/README.md)).

`bun run audit:dokumen` enforces that index: a complete two-way index, no duplicate rows, status agreement, and `ADR-NNNN` citations that resolve.

A changeset alone is enough for a bug fix, a style change, a new component following an existing contract, or a routine dependency update.

## The decision flow

```mermaid
flowchart TD
  Proposal["Change proposal"] --> Branch["Branch from main"]
  Branch --> Gates["bun test + audit:dokumen/rilis/translation green"]
  Gates --> Review["Maintainer review"]
  Review --> MergeCommit["Merge commit — the only method GitHub offers repo-wide (issue #149)"]
  MergeCommit --> Changeset["Changeset, if public/structural"]
  Changeset --> Due{"Backlog due? (audit:rilis)"}
  Due -->|Yes| Release["bun run release"]
  Due -->|No| Done["Done"]
```

## Changes that may not be made alone

The following always need a recorded maintainer decision, however small the change looks:

- Merging a `git subtree pull` PR with anything other than a merge commit — since issue #149 this is also mechanically impossible repository-wide, not only a rule to follow.
- Loosening a gate to make CI green. If the rule really is wrong, change it deliberately, with its reasoning, and record why in the PR.
- Editing `apps/cms`'s source in a way that a future `git subtree pull` is likely to conflict with or silently overwrite, rather than contributing the change upstream first.

## Releases

A maintainer's authority, run through `bun run release` (see [`tools/rilis.mjs`](tools/rilis.mjs)) once `bun run audit:rilis` shows the waiting `.changesets/` backlog is due. What each changeset's `bump` means and the tag format: [`.changesets/README.md`](.changesets/README.md).
