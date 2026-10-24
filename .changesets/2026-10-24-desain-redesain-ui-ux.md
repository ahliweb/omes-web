---
bump: patch
type: docs
impact: internal
---

# Reference-only UI/UX redesign of the OMES public site

Adds `design/redesain-ui-ux-2026-10/`, a design proposal for the `landing` build profile that
starts from what `docs/ui-ux.md` already decided (the OMES theme tokens, self-hosted Public Sans and
JetBrains Mono, Indonesian-only copy, the Control Center as a labelled illustration) rather than
inventing a new look. Nothing in it is implemented or calls an API, so no runtime behaviour changes.

- Home with a quick-start terminal per profile and channel, the authority layers, and a roadmap
  section that separates what the CLI does today from what is staged.
- A proposed `/modul` route listing the OMES modules and CLI commands with search and filters and
  no paging, plus the shared static, contact and 404 pages and their 360 px views.
- A per-route spec and ten UI findings, among them the BjekMart favicon still served by this build
  and home-page copy that predates the third (`hermes`) profile; a proposed OMES mark is included.
