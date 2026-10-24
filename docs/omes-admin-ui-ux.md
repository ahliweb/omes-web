🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](omes-admin-ui-ux.id.md)

# OMES-Web Admin / Control Center — detailed product UI/UX specification v1.0

**Date:** 24 October 2026 · **Status:** product design and QA baseline, **not implementation confirmation** · **Owning issue:** [OMES-Web #18](https://github.com/ahliweb/omes-web/issues/18) · **Architecture:** [OMES ADR-0036 proposal](https://github.com/ahliweb/omes/issues/350) and [OMES-Web ADR-0021](adr/0021-separate-omes-product-site-from-native-host-runtime.md).

## 0. Evidence, boundaries and terminology

- **Product implementation**: OMES-Web is the separate Bun/Astro \`landing\` site at \`omes.ahlikoding.com\`, plus a deployed AWCMS CMS origin documented as \`omes-cms.ahlikoding.com\`. The actual admin routes come **from OMES-Web \`apps/cms\` git subtree**, which is synced from upstream \`ahliweb/awcms\`. The last synced upstream commit in the product is **8e9bce0c**; **not every upstream 2026-10-24 route is necessarily present in current OMES-Web production**. Revalidate the product's vendored route list after [OMES-Web #17](https://github.com/ahliweb/omes-web/issues/17), and do not mark a route deployed merely because upstream code has it.
- **Upstream source**: \`ahliweb/awcms\` main has 15 observed \`src/pages/admin/omes/*.astro\` route files on 2026-10-24. Some are read-only snapshots, some have typed approved actions. The canonical domain/API/RLS and SYSTEM admin design live there; **not** in \`ahliweb/omes\`, \`awcms-astro\` or a second \`omes-web\` frontend.
- **Native OMES**: host runtime and signed outbound-only HTTPS pull-worker, published stable release version **0.6.0**; Hermes maintains its own agent sessions/models/tools. OMES \`ui/control-center/index.html\` is a **non-functional design prototype**; site landing's Control Center tile is a visibly labeled **synthetic illustration**.
- **Design reuse**: AWCMS \`AdminLayout.astro\`, \`tokens.css\`, \`admin.css\`, \`admin-screens.css\`, \`omes-control-center.css\`, shared role-aware navigation, tenant context badge, language/theme switch, existing permissions and i18n. OMES ADR-0023 remains color/layout inspiration, not an independent admin implementation. Keep existing operator login and server-defined session/tenant guards.

The terms **implemented upstream**, **present in vendored subtree**, **enabled by rights/feature flags** and **deployed/verified** are distinct. The first is confirmed at upstream file level; the latter two require product tests/runtime proof.

## 1. Navigation, screen map and release-status contract

Recommended sidebar IA (**no duplicate nav**):
**Overview**; **Fleet** (Servers, Enrollments, Health); **Delivery** (Deployments, Operations, Jobs, Backups); **Hermes & AI** (Hermes, Live Orchestration, Repository Progress, AI Privacy); **Insights** (Architecture, Mission Control); **Governance** (Audit, existing shared Approval Inbox, Role Management). Only render entries backed by current deployed route, permission and available upstream contract. Do not invent independent \`/admin/omes/settings\` or \`/admin/omes/ai-agents\` routes without accepted upstream code.

| UX ID | Actual upstream route | Current upstream evidence as of 2026-10-24 | Product deployment condition |
| --- | --- | --- | --- |
| OMUI-01 | \`/admin/omes\` | Implemented read models: fleet, job, backup, drift overview | Confirm vendored route + tenant rights |
| OMUI-02 | \`/admin/omes/servers\` | Implemented fleet register/list/detail, trust evidence | Confirm API/DB migrations |
| OMUI-03 | \`/admin/omes/enrollments\` | Implemented one-time enrollment challenge issuance/revocation | Confirm vendored commit, permission and host readiness |
| OMUI-04 | \`/admin/omes/deployments\` | Implemented desired-vs-observed deployment projection | Confirm worker protocol compatibility |
| OMUI-05 | \`/admin/omes/operations\` | Implemented allowlisted typed operation requests + shared workflow-approval | Do not bypass real approval setup |
| OMUI-06 | \`/admin/omes/jobs\` | Implemented job queue, cancel queued / approve failed for retry | Not independent destructive-job approval authority |
| OMUI-07 | \`/admin/omes/health\` | Implemented latest snapshots and per-host history | Respect source and freshness |
| OMUI-08 | \`/admin/omes/backups\` | Implemented backup snapshots, guarded restore request | Restore must be approved and reconciled |
| OMUI-09 | \`/admin/omes/audit\` | Implemented redacted immutable audit projection | Scope and pagination authorized |
| OMUI-10 | \`/admin/omes/hermes\` | Implemented **read-only** delegated-task overview; \`planner\`/step \`budget\` are **not reported in v1** | Show “not available” |
| OMUI-11 | \`/admin/omes/orkestrasi-langsung\` | Implemented **read-only**, polled Hermes subagent tree/events with stale/unknown states | Not a second agent runtime |
| OMUI-12 | \`/admin/omes/progres-hermes\` | Implemented AWCMS-polled GitHub repository progress; configured/unconfigured/stale distinctions | GitHub owns repo truth; projection may be stale |
| OMUI-13 | \`/admin/omes/ai-privacy\` | Implemented read-only privacy evidence **plus one narrowly scoped owner egress approval** | No raw prompts or transcripts |
| OMUI-14 | \`/admin/omes/arsitektur\` | Implemented **PINNED RELEASE SNAPSHOT**, explicitly not live host telemetry | Display source SHA and “snapshot” |
| OMUI-15 | \`/admin/omes/mission-control\` | Implemented compositional **3D workspace**, list fallback, live/history projection and scoped actions via existing endpoints | Validate upstream pin, feature ability and deployed WebGL behavior |
| OMUI-16 | Future typed AI Management workspace | **NOT a proven separate existing route/functionality**; tracked [OMES #343/#344](https://github.com/ahliweb/omes/issues/344) | Admission, contracts, security, UI and staged release required |
| OMUI-17 | Future browser transfer/AI controls | **PLANNED** [OMES #294/#300–#306](https://github.com/ahliweb/omes/issues/294) | Do not show operational controls until API + host adapters exist |
| OMUI-18 | Future native Bun SSE/WS dashboard transport | **PLANNED** pending [AWCMS #1168/#1171](https://github.com/ahliweb/awcms/issues/1168) | HTTPS polling fallback until accepted/implemented |

**Never** infer that a missing page in OMES-Web current subtree can be fixed by duplicating upstream files in product-local \`apps/cms\`; fix upstream if generic, sync with MERGE COMMIT and test.

## 2. Global admin shell and responsiveness

### Desktop wireframe (wide, 1440px reference)
\`\`\`text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ SYSTEM admin ▾   Tenant badge  ⟳ freshness     Search      Notifications   User ▾ │
├───────────────┬─────────────────────────────────────────────────────────────────────┤
│ OMES Overview │ Breadcrumb   Page title      [status]      [contextual allowed CTA]│
│ Fleet         ├─────────────────────────────────────────────────────────────────────┤
│  Servers      │ [KPI or filter row / source timestamp / scope]                     │
│  Enrollments  │ [Primary content: table + optional detail panel / event graph]      │
│  Health       │ [pagination] [empty/error/freshness / audit correlation]            │
│ Delivery      │                                                                     │
│ Hermes & AI   │                                                                     │
│ Insights      │                                                                     │
│ Governance    │                                                                     │
└───────────────┴─────────────────────────────────────────────────────────────────────┘
\`\`\`
Keep upstream sidebar hierarchy and shared topbar; above is a **layout contract**, not new app chrome.

At ≥1200px: sidebar as current upstream design, responsive table/detail split where useful. 768–1199px: collapsible navigation, fewer columns, grouped filters. ≤767px including 360/390px: accessible nav drawer, list→detail transitions, no mandatory hover, no clipped permission/error messages, safe scroll for large tables. Keep visible progress as text in addition to semantic status colors. Provide screen-reader labels, keyboard focus restoration, reduced motion and no mandatory WebGL.

Global context bar shows current tenant and role, source freshness, time zone/date range, optional alert counts from authoritative data and product version **separate from native OMES host release**. Switching tenant clears cached data and revokes old streaming topics; server RLS and ABAC enforce authorization regardless of UI links.

## 3. Personas and permission policy

| Persona | Read | Allowed mutation | Prohibited |
| --- | --- | --- | --- |
| SYSTEM admin (approved) | Scoped fleet, policy and audited data | Registration, workflow/policy config within explicit role | Undeclared root shell, cross-tenant secrets |
| Tenant owner / fleet manager | Their tenant inventory/health | Enroll worker, allowed operation request, approvals if separately granted | Force live-host command or bypass approval |
| Operator | Assigned jobs and servers | Typed allowed job request/cancel where policy permits | Destructive action without workflow definition |
| Auditor | Audit and redacted event evidence | Authorized export only | Key retrieval, credential reveal or job mutation |
| Observer/analyst | Sanitized view, available reports | None | Approvals, unknown capability execution |
| Hermes agent | Own runtime/skills | Executes through **supported OMES native interface**, not browser | Direct privileged UI tool from untrusted prompt |

Permission names derive from AWCMS canonical \`OMES_GUARDS\` and API, not an invented parallel \`omes-web\` ACL. A rejected API request is shown as 403/denied even if a hidden button was accidentally reachable.

## 4. Screen-by-screen layout, interactions and edge cases

### OMUI-01 Overview / Command dashboard
Panels: enrolled servers, healthy/stale/unknown, approved/pending/failed operations, job queue, latest verified backup, deployment drift and source freshness. Click each KPI to already-authorized canonical page with relevant filter; no fabricated example totals. Primary CTAs conditional on \`servers.register\`, \`enrollments.manage\` or operation permissions. Empty state “No servers enrolled for this tenant” with safe enrollment onboarding, not green healthy. Poll status and timestamp separate; stale cached result must not claim operational health.

### OMUI-02 Servers / Inventory and trust
List: masked host alias, ID, OS/profile, configured role, last signed heartbeat, online/stale/unknown, contract version, observed vs desired deployment, scoped actions. Search server alias, exact ID, status; keyset pagination and bounded filtering. Detail: Overview / Enrollment evidence / Worker heartbeat / Deployment / History. Register uses AWCMS endpoint \`POST /api/v1/omes/servers\`, requires authorization, unique tenancy, idempotency key, evidence. Decommission is soft-delete with explicit confirmation and audit; do not display full worker credential/private keys.

### OMUI-03 Enrollments
Eligible server selector constrained by status; one-time enrollment challenge issued via existing AWCMS endpoint, visible **once** with expiry and no secrets in query params/logs/download. Provide manual select-and-copy guidance aligned with upstream file rather than inventing a clipboard auto-copy feature. Revoke requires typed confirmation and underlying idempotent endpoint. UI never reissues token to already healthy enrolled server silently. View pending/expired/revoked/enrolled and next recovery action. Host generates its own local key material. Signed **outbound-only HTTPS** poll is the sole host link.

### OMUI-04 Deployments
Table desired release, observed release, digest/source, drift badge, host, elapsed and last verification. Distinguish “requested”, “queued”, “applied”, “observed” and “verified”; clicking row opens typed evidence, deployment history, output redacted and rollback preparedness. There is no automatic “healthy” from a successful request; reconciliation uses host-reported signed result and independent health. Do not expose deploy secrets or host shell.

### OMUI-05 Operations
Operation wizard chooses target server and fixed allowlist \`status|preflight|start|stop|restart|update|backup|rollback\`, optional bounded typed params, review blast radius and permission, submit with idempotency key. **\`stop\` and \`rollback\`** are destructive and require existing global AWCMS \`workflow-approval\`; no second OMES approval inbox. Missing workflow definition results in refusal with CTA to permitted admin settings, not implicit approval. On success show “request recorded”, then separate approved/dispatched/observed/verified statuses. Double-submit and worker reconnect must not run same operation twice.

### OMUI-06 Jobs
Tabs queued/leased/failed/completed/unknown; columns job ID, operation correlation, owner, lease, attempts, last failure, scope, next action. **Cancel** only queued job; **approve for retry** only failed job, not authorizing a destructive operation anew. Confirmation shows scope/irreversibility and conflict if worker claim already occurred. Never expose raw job payload or tool output. Stale vs in-flight vs verified success labeled distinctly.

### OMUI-07 Health / Doctor
Latest-per-host rows; detail \`?serverId=\` keyset history. Every check shows source \`omes-host\`, \`hermes\` or \`external\` only when supplied, observed-at, stale condition and status. Distinguish service reachable from agent/model capability truly verified, source evidence and last heartbeat. “Healthy” badge cannot imply a stale host is live; render badge alongside freshness. Allow operator safe “inspect details”, not arbitrary \`doctor\` shell injection.

### OMUI-08 Backups / Recovery
Show backup inventory, target, retention/checksum, created/verified time and restore readiness. Backup requested ≠ verified artifact. Restore is a **destructive controlled workflow**, requires explicit resource/target confirmation and appropriate approval/authorization; show pending vs successful recovery and drill/read-back evidence. Users lacking approval cannot initiate restore by forging API calls; failure/unknown must prompt reconciliation, not blind retry.

### OMUI-09 Audit
Tenant-scoped immutable view of actor, action, target, decision, result, source and correlation IDs; pagination, date/source filters, export only if separately authorized. Sensitive values masked, no credentials, host keys, token, prompts/transcripts or raw command. A user seeing one tenant must not search by ID into another.

### OMUI-10 Hermes Observer
Read-only delegated-task summary, most recently observed task/session, source and freshness. Show agent/task status and step count only where v1 schemas provide them; explicitly display **“Not reported in v1 contract”** for planner model identity and step budget. Never infer budget from steps or generate generic AI run controls. Link to live-orchestration projection with same tenant guard.

### OMUI-11 Live Orchestration
Tree of delegated Hermes subagents/events with source/provenance, depth bounded, statuses live/stale/unknown, filtered activity feed and timestamps. Polling is existing behavior; browser-closed sessions do not keep an agent alive. Selecting node shows redacted metadata only; no prompt, chain-of-thought, raw tool arguments/results or direct agent control. Unknown/stale never colored active merely because data exists.

### OMUI-12 Repository Progress
Shows AWCMS-polled GitHub repository/milestone/issue summaries when configured; poll job default described as ~15 minutes upstream and data has states unconfigured/unknown/stale/fresh. GitHub remains repository truth; Control Center is a bounded projection, **not GitHub control**. Last successful poll, failure and retry button only if a supported safe endpoint actually exists (do not invent one); do not fabricate progress percentage or project completeness.

### OMUI-13 AI Privacy + egress approval
Cards risk/privacy posture, approved/restricted data classification, trusted last evidence and pending egress requests. Exactly **one narrowly typed owner approval action** exists under authorized \`aiPrivacy.approve\` and backend workflow. Show policy/version/risk, request source, approval-required and expiry; never show raw prompts, transcripts, model responses or model provider secrets. A forged approval by a non-approver must fail server-side. Privacy unknown is not “safe”.

### OMUI-14 Architecture
Capability lanes show OMES/Hermes/AWCMS providers and source commit. Prominent **“Pinned release snapshot — NOT live”** banner, source SHA and vendored timestamp; do not substitute active host diagnostics or current release version. For a different current release, show an audit of artifact and reviewed vendor sync rather than silently fetching remote JSON per request. Read-only diagram has accessible table/list fallback.

### OMUI-15 Mission Control
Current upstream Astro includes a **3D compositional workspace**, **accessible list fallback** (usable without WebGL/JS), Live/History mode, bounded history replay and role-filtered available actions via existing endpoints. Every object is a reference to existing owner’s record, never a new mission/job authority. Keep source provenance, authorizations and history “as-of” timestamp. Reduce motion and use list view for keyboard/screen reader. Unsupported sources explicitly unavailable, not 0. Product OMES-Web must verify actual vendored route and browser support before claiming this version in production.

### OMUI-16 Future AI Management (not shipped independently)
Only after OMES [#343/#344](https://github.com/ahliweb/omes/issues/344) versioned Hermes contracts are accepted: proposed tabs Agents, Sessions, Models/Skills capability read-only, Policy, Approvals and Budgets. Use OMES-native data as **sanitized projection**, no new agent process manager. Cost/budget is **not reported** unless source certifies semantics. Mutations require typed allowlisted action and tenant/role policy; destructive/elevated actions require human approval, visible expiry and audit. Keep this behind server-verified capability flags; no dead navigation item beforehand.

### OMUI-17 Future Browser Transfer (not shipped)
Proposed approved Source/Destination setup → privacy and schema mapping → dry-run → human MFA/login step → durable job submission → typed checkpoint progress → destination read-back → reconciled success/uncertain-write. Browser workers remain under Hermes/OMES admitted contract, no privileged browser agent by default in Control Center.

### OMUI-18 Future Bun realtime (not shipped)
A Bun-native SSE server-to-browser projection is preferable to WebSocket for mostly one-way progress; native Bun WS only for approved duplex use after [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168). Neither transport sends host commands nor replaces signed outbound-only OMES worker polling. Requires Origin, short-lived scoped tickets, tenant/role checks, redacted event envelopes, backpressure and reconnect with authorized snapshot. Until then retain existing page-level polling and honest staleness.

## 5. Product-specific settings vs upstream functional UI

Product-owned additions are **configuration**: OMES logo/branding, site name, tenant URL, public release CTA, deployment compatibility notice, product support links and permissions to enable inherited modules. These should be managed via supported AWCMS public APIs/admin configuration; **do not create local forks of shared admin screens**. Avoid mixing commercial checkout, courier, BjekMart SKU and customer marketing in OMES operator navigation unless deliberately enabled for an actual OMES business need. Root README and AGENTS template leftovers are tracked under [#19](https://github.com/ahliweb/omes-web/issues/19).

Target technical topology:
\`\`\`mermaid
flowchart TB
  Site["OMES-Web Astro public SSG<br/>omes.ahlikoding.com"] -->|"Public/read-only CMS API at build"| CMS
  CMS["OMES-Web apps/cms<br/>AWCMS upstream subtree"] -->|"Signed enroll/poll/result/heartbeat<br/>OUTBOUND from host"| Host["Native OMES worker<br/>Bash/Python/systemd"]
  CMS --> UI["/admin/omes/* Astro admin<br/>SYSTEM operator role"]
  Release["Published OMES release<br/>versioned protocol/manifest"] -.->|"Pinned verified metadata"| Site
  Release -.->|"Contract compatibility fixtures"| CMS
  Hermes["Hermes Agent native runtime"] -->|"OMES-approved observation"| Host
\`\`\`
(The protocol edge arrow represents the authenticated relationship; **OMES host initiates outbound HTTPS** to CMS, never vice versa.)

## 6. UX acceptance matrix, security gates and deployment

| Test ID | Required proof |
| --- | --- |
| UI-01 Auth/roles | Owner/operator/auditor/observer page visibility and **API-level refusal**, no rights escalation by crafted POST |
| UI-02 Tenant isolation | Two tenants with overlapping host aliases IDs cannot cross-read servers/jobs/backups/approval |
| UI-03 Enrollment | Token only once, expired/revoked correctly refused, no screenshots/logs with secrets |
| UI-04 Job workflows | Idempotency and conflict after lease, destructive workflow-approval gating, unknown worker status not success |
| UI-05 Hermes and AI | Privacy redaction; v1 missing budget/planner shown “not reported”; no new agent runner or host shell |
| UI-06 Architecture/history | Snapshot source/commit visible, stale and history \`as-of\` labels, 3D selection and 2D/list accessible |
| UI-07 Responsive/a11y | 360px/390px, 768px, 1440px, keyboard-only, visible focus, WCAG 2.2 AA, reduced motion, chart/list alternative |
| UI-08 API compatibility | OMES released worker v1 contract vs AWCMS vendored schema, future major blocked, signed HTTPS/nonce/replay and RLS |
| UI-09 Product version/SEO | Landing installer matches official pinned OMES release, old v0.4.0 removed after #16, canonical/OpenGraph/CSP/static route still valid |
| UI-10 Deployment | Bun pin, image digest, PostgreSQL runtime user least privilege, forward-only DB migrations, staging → prod promotion and reversible CMS/site/host releases |

**Workflow:** upstream UI fixes in \`ahliweb/awcms\` only → validate code/DB/contract/a11y → OMES-Web dedicated reviewed \`git subtree pull\` branch with **MERGE COMMIT (never squash/rebase)** → confirm \`/admin/omes/*\` route matrix and flags → run \`bun test\`, \`bun run check\`, \`bun run check:cms\`, \`bun run audit:dokumen\`, \`bun run audit:translation\`, DB FORCE RLS/auth tests, all three build profiles and deployment preflight → staged synthetic demo screenshots → production rollback plan. OMES native \`./scripts/ci-local.sh\` remains separate. The documents and this branch do **not** mean these checks were executed or new UI shipped.

## 7. Priority and issue traceability

**P0** decision and product ownership: [OMES #350](https://github.com/ahliweb/omes/issues/350), [OMES-Web #19](https://github.com/ahliweb/omes-web/issues/19), [#16](https://github.com/ahliweb/omes-web/issues/16). **P0 security/data:** upstream CMS subtree migration [#17](https://github.com/ahliweb/omes-web/issues/17), native release schema [OMES #352](https://github.com/ahliweb/omes/issues/352), upstream AWCMS consumer test [#1185](https://github.com/ahliweb/awcms/issues/1185), OMES-Web preflight [#20](https://github.com/ahliweb/omes-web/issues/20). **P1 UX acceptance:** this spec [#18](https://github.com/ahliweb/omes-web/issues/18), upstream source-side issues [OMES #348](https://github.com/ahliweb/omes/issues/348), [AWCMS admin UI issues](https://github.com/ahliweb/awcms/issues/858). **P2:** AI governance [OMES #343/#344](https://github.com/ahliweb/omes/issues/344), Mission Control enhancement [#263](https://github.com/ahliweb/omes/issues/263), browser transfer [#294](https://github.com/ahliweb/omes/issues/294), realtime Bun [AWCMS #1168/#1171](https://github.com/ahliweb/awcms/issues/1168). Distinguish backlog from current delivered site features.
