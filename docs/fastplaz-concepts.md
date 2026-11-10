# OMES-Web product Control Center display — FastPlaz concepts, repository-specific architecture

## Document control
- **Version:** v1.0.0
- **Updated:** 2026-11-10
- **Status:** Proposed architecture / research only; not a production feature.
- **Document Changeset:** First reference and implementation-boundary mapping.
- **Owning issue:** [#39](https://github.com/ahliweb/omes-web/issues/39).

## Summary and confirmed local baseline
Derived AWCMS-One product with its own CMS/DB and landing web. Some inherited BjekMart identity remains documented in open #19; admin specifications in #18.

## Intent and candidate adaptation
Classify read-only developer/host diagnostic presentation as observations with source/freshness/permission and no duplicated control-plane authority.

## Authority and prohibitions
Never add agent runtime, IDE editor/chat, host executor or arbitrary shell APIs to product web. AWCMS owns business approval/audit and OMES typed host control; Hermes runtime.

## Existing related issues and anti-duplication
Architecture [#39](https://github.com/ahliweb/omes-web/issues/39); existing identity drift [#19](https://github.com/ahliweb/omes-web/issues/19) and admin UX [#18](https://github.com/ahliweb/omes-web/issues/18).

## Six concrete validation scenarios
1. Host health shows source and timestamp rather than made-up live status.
2. Stale/unknown ACP posture is visibly unknown.
3. Tenant A cannot view tenant B operation evidence.
4. Business approval UI does not execute shell.
5. Landing public pages never expose server diagnostics.
6. Inherited template identity corrected under #19 rather than a duplicate issue.

## Proposed checks and test evidence
Validate role/tenant checks, status freshness, no direct host commands; existing `apps/cms` subtree only updated by upstream sync rules.

## Rollout / handoff
Reuse #19 and #18; do not start new dashboard. Product docs must describe actual current code accurately.

## Source reference and limits
This document takes **concepts only** from [FastPlaz](https://github.com/fastplaz/fastplaz): [MCP/AI Agent Plane](https://github.com/fastplaz/fastplaz/blob/master/docs/MCP.md), [IDE workflow](https://github.com/fastplaz/fastplaz/blob/master/docs/AI_AGENT_by_FASTPLAZ.md), and [standalone operator concepts](https://github.com/fastplaz/fastplaz/blob/master/docs/STANDALONE-deployment.md). No Pascal, Lazarus, CGI, MVC/theme engine, or source-code copying. [FastPlaz license text](https://github.com/fastplaz/fastplaz/blob/master/LICENSE.txt) does not demonstrate explicit source-code permissions; independent implementation only.

## Cross-portfolio engineering invariants
Applies the **internal cross-portfolio standard**, alongside this repository's own AGENTS, ADR, CONTRIBUTING and current code reality. Human-approved **Gate 9 (cross-spec Definition of Ready)** precedes production feature code; human-approved **Gate 15 (release readiness)** precedes production. One issue/branch/PR per atomic scope. Never present a specification, green documentation check, or research as working production functionality.

Local MCP/tool connector, if ever required: loopback or authenticated IPC, host/Origin restrictions for HTTP, rotating scoped credentials, canonical-path and symlink protections, read/write/destructive approval tiers, no arbitrary shell, no default SQL/raw DB/secret access, bounded resource/time/cancellation, policy at actual tool/OS runtime, fail-closed unknown and redacted logs. Human sign-off for changes to authorization, production configuration or sensitive data.

## Relevant regulatory and control references
Evaluate applicability, not compliance by assertion: Indonesian UU 27/2022 (PDP), PP 71/2019 (PSTE), Perpres 95/2018 where SPBE applies; ISO/IEC 27001, 27002, 27005, 27017, 27018, 27034, 27701, ISO 22301, ISO/IEC 20000-1, ISO/IEC 42001, ISO/IEC 15408; OWASP LLM/Agentic Security, NIST AI RMF. Obtain independent control evidence and applicable edition before any claim of certification.

## Acceptance evidence rubric
For any follow-on: link spec/ADR and owning issue; record source commit, toolchain/runtime version, commands executed, actual error/result, denied access tests and evidence SHA. Mark unrun checks **NOT EXECUTED**. Approvals and publication/deployment status are distinct. No sensitive personal data or production secrets in prompts, logs or GitHub artifacts.


## Changelog
- **v1.0.0 — 2026-11-10:** Documented evidence-backed, repo-specific adoption boundary, six practical cases and acceptance rubric.
