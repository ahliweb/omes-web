🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](0021-separate-omes-product-site-from-native-host-runtime.id.md)

# ADR-0021 — OMES-Web is a separate, integrated OMES product deployment

- **Status:** Proposed
- **Date:** 24 October 2026
- **Decision maker:** ahliweb
- **Related:** [OMES ADR-0036](https://github.com/ahliweb/omes/blob/main/docs/adr/0036-omes-web-separated-repositories-versioned-integration.md) (proposed in [OMES #350](https://github.com/ahliweb/omes/issues/350)), [OMES-Web #16](https://github.com/ahliweb/omes-web/issues/16), [#17](https://github.com/ahliweb/omes-web/issues/17), [#18](https://github.com/ahliweb/omes-web/issues/18), [#19](https://github.com/ahliweb/omes-web/issues/19), [#20](https://github.com/ahliweb/omes-web/issues/20)
- **Scope:** OMES-branded public \`landing\` profile; product-owned AWCMS CMS runtime and database; inherited SYSTEM admin surface; independent release and deployment.

## Context and evidence
OMES-Web was initialized using AWCMS-One as an independent derived product (templateVersion 0.12.0 in root package.json), and currently contains \`apps/storefront\` (Bun/Astro static \`landing\`) and \`apps/cms\` (full-history git subtree from \`ahliweb/awcms\`). OMES native is a **different repo**, built for host operations, Bash/Python/systemd and Hermes integration. Its \`VERSION=0.6.0\` and published release are separate from OMES-Web's own \`version=0.1.0\`. AWCMS itself already owns \`omes_control\` tenant data, signed worker web APIs and Astro \`/admin/omes/*\` screens.

OMES-Web's homepage still hardcodes OMES v0.4.0 and links to a v0.4.0 bootstrap, while its root README/AGENTS/docs retain BjekMart and awcms-one placeholders. The last CMS sync into this product was upstream \`8e9bce0c\`; the next sync is independently audited, not assumed safe. Production domains are documented but live network/status is not verified by this ADR.

## Alternatives
| | A — separate with contracts | B — move static website into native OMES | C — combine entire OMES-Web and OMES |
| --- | --- | --- | --- |
| Security/tenant RLS | Preserves AWCMS rights and signed host pull | Mixed web/native governance | Privileged host and CMS stacks intermingle |
| Maintainability | Distinct authoritative source; subtree sync | New mixed release workflows | Duplicate authority/history and large dependency tree |
| Reliability/rollbacks | Independently revert website/CMS/worker releases | Site coupled to CLI publication | Host failure and DB deploy blast radius rise |
| SEO/assets | Existing Astro profile preserved | Requires public URL and build migration | Full frontend migration |
| Cost | Version manifests/testing are bounded | Build/packaging rework | Higher CI and operator overhead |

**Decision: Option A.** Keep both repos; explicitly integrate **OMES release manifest / typed worker contracts** with **OMES-Web product deployment** and **AWCMS-owned Control Center**. This draft requires review to become accepted; user preference alone is not a verified production contract.

## Non-negotiable ownership
- **OMES:** release version and install manifest, host profiles/jobs, signed outbound HTTPS poll-worker, Hermes native adapter, native health/rollback, versioned \`contracts/control-center/v1\`; no duplicate tenant DB, web SYSTEM admin or agent runtime.
- **AWCMS:** canonical API, \`omes_control\` data and security, admin Astro shell \`/admin/omes/*\`, worker enrollment/result/heartbeat, RLS/ABAC; no direct host shell or unsigned inbound worker channel.
- **AWCMS-One:** generic template to bootstrap this product; not a required live runtime dependency.
- **AWCMS-Astro:** reusable public and USER-admin frontend patterns only; no second SYSTEM admin.
- **OMES-Web:** website content/OMES marketing theme, product-specific settings and deployment, owned CMS PostgreSQL and routes **inherited from AWCMS subtree**, compatibility/test/build/deployment. No new direct agent runtime or shadow \`omes_control\` module.

## Integration + release model
1. Native OMES official **published pinned** release supplies verifiable **non-secret metadata** for site CTA: version, tag, release publication date, installation documentation/URI, optional digest where actually verified, supported worker protocol/schemas. Do not install from unpinned \`main\` or assume assets exist; product site should fail a release/copy validation if metadata is stale. [OMES-Web #16](https://github.com/ahliweb/omes-web/issues/16) and [OMES #352](https://github.com/ahliweb/omes/issues/352).
2. OMES-Web \`apps/cms\` receives generic changes from **AWCMS first** via \`git subtree pull --prefix=apps/cms awcms main\`, using a **MERGE COMMIT — never squash/rebase**, main-only refspec and \`--no-tags\`. Never import upstream tags into OMES-Web or rewrite applied migrations. [#17](https://github.com/ahliweb/omes-web/issues/17).
3. Versioned, authenticated **outbound-only** \`enroll/poll/result/heartbeat\` bridge connects OMES worker to AWCMS; credentials stay host-side with scoped identities. The UI may show verified observations, never remote shell, fake result or live-model metric without source. Cross-version safety tested before independently deployed CMS/host releases. [#20](https://github.com/ahliweb/omes-web/issues/20), [AWCMS #1185](https://github.com/ahliweb/awcms/issues/1185).
4. CMS, worker jobs and public site use independent pinned image/build versions and staging/canary; \`bun\` is the CMS/frontend runtime, not a mandate to rewrite native OMES Python services. Never change existing Compose project/volume/env identifiers blindly: the current \`awcms-one-production\` strings may name stateful external resources and require separate migration if changed.
5. OMES-Web admin UI/UX is a **product specification and configuration overlay**, not a new admin codebase. Reuse upstream AWCMS Astro admin styles/routes; OMES design prototype in \`ui/control-center\` is reference-only and public homepage mock is synthetic labelled illustration. [#18](https://github.com/ahliweb/omes-web/issues/18).

## Contract and operational acceptance
- Public site correctly identifies verified OMES release version (0.6.0 when explicitly pinned/tested), docs and checksum-backed installer where supported; older version must not silently reappear.
- CMS preflight checks the released worker schema/compatible contract range, AWCMS upstream SHA, database migrations and worker role separation; unknown version fails closed with explicit operator message rather than guessed compatibility.
- Worker reconnect, replay/nonce, idempotent job results and verified state reconciliation tested with two tenants; RLS and approval gates enforced; no secrets, PII or raw private model data in browser.
- Existing \`landing\` SEO, static CSP, self-hosted assets, Bun version pin and theme maintain their identity; \`toko/berita\` regressions checked for template inheritance, but **not deployed as OMES product features**.
- Update product README/AGENTS/ID, deployment notes and compatibility/runbooks via #19 while retaining historical attributions. New requirements and fixes tracked in native owner repos; no duplicate Hermes or AWCMS feature issue.
- Rollbacks independently planned for OMES host version, CMS API/database (forward-only migrations), and static public site. Re-evaluate merging repos only with new ADR, measured benefit, safe history/DB/traffic migration and restore rehearsal.
