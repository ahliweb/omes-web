---
bump: patch
type: docs
impact: internal
---

# Point the working contract at product development flow v2.0.0

Adds a "Product development flow (v2.0.0)" section to `AGENTS.md` (and its Indonesian mirror) and a one-line pointer in `docs/omes-admin-ui-ux.md` to the new step-4 expectations. No runtime behaviour changes.

- Product work is placed on the 18-step flow before it starts; UX/UI is validated at step 4, before the data model and contract, and step 11 runs per slice as frontend, backend, integration.
- Here the storefront is 11.1 and local `apps/cms` module work is 11.2; a screen with no data source in the contract is not ready, and authorization is never frontend-only.
- The flow document inside `apps/cms` is upstream's copy and stays at v1 until the next subtree sync; it is deliberately not edited.
