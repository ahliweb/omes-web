# Graph Report - ahliweb__omes-web  (2026-11-09)

> Cakupan: kode (AST) saja; dokumen belum diekstrak. Lihat `STATUS.md`.

## Corpus Check
- 426 files · ~490,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3200 nodes · 6336 edges · 168 communities (156 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fca2099`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed-cms.ts
- penyaji.mjs
- plan.mjs
- berita.ts
- stub-awcms.mjs
- routes.ts
- support.js
- wilayah-checkout.ts
- toko-klien.ts
- rilis.mjs
- navigasi-berita.ts
- pemasaran.ts
- audit-dokumen.mjs
- config/profil.ts
- buletin.ts
- akun-klien.ts
- portable-text.ts
- scripts
- video/[slug].astro
- formatPrice
- bacaSesi
- akun-pesanan.ts
- bagikan.test.ts
- Backup assurance (issue #213)
- UI / UX
- profil-uji-bersama.ts
- catalog.ts
- blog.ts
- scripts
- produk-listing.ts
- ArtikelView.astro
- akun.ts
- audit-graf.mjs
- CMS: authoring, publishing, permissions, audit, media, taxonomy
- seed-profil.test.mjs
- `apps/storefront` — the public BjekMart storefront
- redirect-push.ts
- wishlist-kontrak.ts
- stub-lifecycle.ts
- BeritaLayout.astro
- 4. Screen-by-screen layout, interactions and edge cases
- sitemap-sources.ts
- masuk.ts
- kategori/[slug].astro
- check-docs-translation.mjs
- profil.mjs
- navigasi-profil.ts
- awcms-one 0.4.0 — 2026-09-18
- Database schema
- knowledge-obsidian-export.mjs
- AGENTS.md
- iklan-popup.ts
- API
- dengar.ts
- afiliasi-kontrak.ts
- UI/UX redesign — OMES public site (October 2026)
- Data dictionary
- knowledge-graph-combine.mjs
- AGENTS.md — awcms-one's working contract
- product/[slug].astro
- akun-alamat.ts
- awcms/analitik.ts
- lembaga.ts
- Decision
- Decision
- cek-lockfile.mjs
- mysql-dump-reader.ts
- bun
- resolveSiteProfile
- akun-afiliasi.ts
- profil-halaman.ts
- awcms-one 0.7.0 — 2026-09-20
- `template:init` — CLI reference
- Routing
- produk-detail.ts
- awcms-one 0.11.0 — 2026-09-23
- Development workflow
- Testing
- SEO
- compilerOptions
- Inherited awcms-one template history (pre-fork, not OMES-Web releases)
- Architecture
- Status
- docs-i18n-stamp.mjs
- contrastingForeground
- compilerOptions
- kontrak/package.json
- [0.2.0] — 2026-10-24
- awcms-one 0.3.0 — 2026-09-17
- Decision
- Decision
- Root knowledge-graph workflow
- knowledge-no-subtree-write.test.mjs
- awcms-one 0.6.0 — 2026-09-19
- awcms-one — Start a new app from this template
- Contributing Guide
- awcms-one
- Security Policy
- awcms-one — Add a commerce table + endpoint
- Responsive design
- knowledge-obsidian-export.test.mjs
- checkout-guard-no-prerender.test.ts
- awcms-one 0.2.0 — 2026-09-15
- awcms-one — Add a storefront page
- compose-produksi.test.mjs
- Decision
- ADR-0021 — OMES-Web is a separate, integrated OMES product deployment
- awcms-one 0.9.0 — 2026-09-21
- awcms-one 0.12.0 — 2026-09-24
- awcms-one 0.10.0 — 2026-09-22
- Code of Conduct
- Governance
- kontrak-arah-impor.test.mjs
- ga-init.ts
- berita-guard-no-news-route.test.ts
- meta-sosial-build-smoke.test.ts
- Changesets
- status-prosa.test.mjs
- Lessons learned
- config/package.json
- gerbang/package.json
- audit-dokumen.test.mjs
- audit-rilis.test.mjs
- promo-popup.ts
- sidebar-build-smoke.test.ts
- 0006-a-federated-knowledge-graph-that-never-duplicates-the-subtree.md
- ADR-0010 — Manual payment and alternative courier first; gateways and aggregators arrive through the outbox
- ADR-0015 — Commerce migrations live in the reserved `9xx` range
- compilerOptions
- subtree-guard.mjs
- root-env-example-coverage.test.mjs
- SITE_PROFILES
- write-build-id.mjs
- bagikan-build-smoke.test.ts
- dengar-build-smoke.test.ts
- logo-instansi-build-smoke.test.ts
- ADR-0001 — `apps/cms` is `ahliweb/awcms`, embedded via `git subtree` with full history
- ADR-0002 — The storefront is `output: "static"`, fetching the catalog at build time
- ADR-0003 — Money is `numeric(14,2)`, and crosses the wire as a string
- ADR-0004 — `packages/kontrak` is a type-only contract, with a gate holding the import direction one-way
- ADR-0005 — Product URLs match the live site's shape: `/product/{slug}`, no trailing slash, `/products` redirects
- ADR-0007 — Cart, checkout and order tracking stay static; the browser calls the CMS's anonymous commerce endpoints directly
- ADR-0008 — One `commerce` module carries the whole store, not three
- ADR-0009 — Guest checkout, addressed by order code + phone; customer accounts come later
- ADR-0011 — The storefront resolves media through `GET /api/v1/media/objects`, and the CSP is derived from what resolved
- ADR-0012 — Visitor analytics is first-party by default; GA4 is an opt-in switch
- ADR-0013 — Rule-based legacy redirects sit beside the row-based map, and a row always wins
- Documentation
- Contracts index
- Monorepo map
- Ownership boundaries and subtree sync rules
- Security and tenant-isolation boundaries
- Support
- versi-toolchain.test.mjs
- knowledge-graph-update.mjs
- nav-desktop-buka.ts
- global-css-fonts.test.ts
- newsletter-path-contract.test.ts
- pesan-build-smoke.test.ts
- select-and-offsite-copy.sh
- Architecture Decision Records
- 2026-10-24-desain-redesain-ui-ux.md
- 2026-10-30-alur-pengembangan-produk-v2.md
- 01-create-least-privilege-roles.sh
- run-backup-compose.sh
- run-job-compose.sh

## God Nodes (most connected - your core abstractions)
1. `ROUTES` - 57 edges
2. `bun` - 39 edges
3. `kirimPermintaan()` - 36 edges
4. `getSiteIdentity()` - 31 edges
5. `formatPrice()` - 31 edges
6. `scripts` - 28 edges
7. `bacaSesi()` - 26 edges
8. ``apps/storefront` — the public BjekMart storefront` - 26 edges
9. `handleAccountRequest()` - 24 edges
10. `CMS: authoring, publishing, permissions, audit, media, taxonomy` - 24 edges

## Surprising Connections (you probably didn't know these)
- `runTemplateInitTests()` --indirect_call--> `profil()`  [INFERRED]
  tests/template-init.test.mjs → apps/storefront/integrations/profil.mjs
- `resolveBuildId()` --references--> `bun`  [EXTRACTED]
  apps/storefront/scripts/write-build-id.mjs → package.json
- `canSpawnBun()` --references--> `bun`  [EXTRACTED]
  apps/storefront/tests/afiliasi-build-smoke.test.ts → package.json
- `canSpawnBun()` --references--> `bun`  [EXTRACTED]
  apps/storefront/tests/akun-build-smoke.test.ts → package.json
- `canSpawnBun()` --references--> `bun`  [EXTRACTED]
  apps/storefront/tests/bagikan-build-smoke.test.ts → package.json

## Import Cycles
- 2-file cycle: `apps/storefront/src/lib/toko-klien.ts -> apps/storefront/src/lib/toko-permintaan.ts -> apps/storefront/src/lib/toko-klien.ts`

## Communities (168 total, 12 thin omitted)

### Community 0 - "seed-cms.ts"
Cohesion: 0.05
Nodes (79): AdPlacementSeed, apiCall(), ApiResult, applySiteProfile(), assertOk(), attemptCreateVerifiedMediaObject(), BASE_URL, CategorySeed (+71 more)

### Community 1 - "penyaji.mjs"
Cohesion: 0.05
Nodes (65): canonicalRubrikSlug(), DAERAH_ENTRIES, DAERAH_NAMES, DAERAH_SLUG_BY_ALIAS, decodeSegment(), findNewsRowTargetById(), findVideoRowTargetById(), lastPathSegment() (+57 more)

### Community 2 - "plan.mjs"
Cohesion: 0.05
Nodes (60): canSpawnBun(), ADR-0018, NOTE: this test file is NOT excluded from the copy any more. It used to, runTemplateInitTests(), applyPlan(), applyColorDefaults(), BOOLEAN_FLAGS, FLAG_KEYS (+52 more)

### Community 3 - "berita.ts"
Cohesion: 0.05
Nodes (58): RawTerm, AuthorArchive, buildIndex(), buildRubrikForest(), collectAncestors(), collectDescendantSlugs(), DaerahArchive, DaerahLink (+50 more)

### Community 4 - "stub-awcms.mjs"
Cohesion: 0.07
Nodes (63): ACCOUNTS, ANALYTICS_RANGES, analyticsPages(), buildAffiliateLink(), buildCourierOptions(), buildPaymentInstructions(), computeQuote(), corsHeaders() (+55 more)

### Community 5 - "routes.ts"
Cohesion: 0.08
Nodes (33): socialIcons, tokoAktif, SEARCH_SURFACE, SITE_PROFILE, ROUTES, ADR-0018, DEFAULT_IDENTITY, siteConfig (+25 more)

### Community 6 - "support.js"
Cohesion: 0.07
Nodes (52): boot(), cdnScriptFor(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createExternalModules() (+44 more)

### Community 7 - "wilayah-checkout.ts"
Cohesion: 0.06
Nodes (45): DEFAULT_THEME_COLORS, awcmsGet(), baseUrl(), Envelope, timeoutMs(), apiOrigin(), extractThemeToken(), fetchSiteTheme() (+37 more)

### Community 8 - "toko-klien.ts"
Cohesion: 0.06
Nodes (51): describeShippingOption(), isShippingOptionSelected(), shippingOptionKey(), ShippingOptionView, keepDigitsAndLeadingPlus(), previewIndonesianPhone(), cancelOrder(), CartLineStatus (+43 more)

### Community 9 - "rilis.mjs"
Cohesion: 0.06
Nodes (46): dated, oldest, pending, reporter, todayIso, changelogSection(), findChangelogHeadings(), normalizeLineEndings() (+38 more)

### Community 10 - "navigasi-berita.ts"
Cohesion: 0.07
Nodes (46): rubrikColumn, year, daerahActive, getAllInstitutions(), RawInstitution, buildRegionIndex(), findKaltengProvince(), getProvinces() (+38 more)

### Community 11 - "pemasaran.ts"
Cohesion: 0.06
Nodes (44): CSP_NEEDS, getMediaPublicOrigin(), CustomerLevel, DEFAULT_CUSTOMER_LEVELS, EMPTY_STORE_SETTINGS, findFlashSaleForProduct(), FlashSale, FlashSaleProductEntry (+36 more)

### Community 12 - "audit-dokumen.mjs"
Cohesion: 0.07
Nodes (49): actualCount(), adrStatus(), auditAdrCitations(), auditAdrIndex(), auditLinkedCounts(), auditLinks(), auditNamedPaths(), auditOneIndex() (+41 more)

### Community 13 - "config/profil.ts"
Cohesion: 0.06
Nodes (44): activeRouteKeys(), CspNeeds, cspNeedsFor(), DEFAULT_SITE_PROFILE, describeProfile(), excludedRouteKeys(), FeedEntry, FEEDS (+36 more)

### Community 14 - "buletin.ts"
Cohesion: 0.06
Nodes (33): AwcmsOriginConfigError, requireAwcmsOrigin(), ADR-0007, isValidGatewayRedirectUrl(), ADR-0010, AnalyticsBeaconPayload, buildAnalyticsPayload(), isTrackingOptedOut() (+25 more)

### Community 15 - "akun-klien.ts"
Cohesion: 0.10
Nodes (48): Afiliasi, AfiliasiKomisi, ambilAfiliasi(), ambilAlamat(), ambilKomisiAfiliasi(), ambilPercakapan(), ambilPercakapanById(), ambilPesananAkun() (+40 more)

### Community 16 - "portable-text.ts"
Cohesion: 0.07
Nodes (46): chunk(), fetchMediaPublicOrigin(), isExpectedRefusal(), markUnresolved(), MediaPublicOrigin, RawResolvedMediaItem, resetMediaCachesForTests(), resolvedCache (+38 more)

### Community 17 - "scripts"
Cohesion: 0.04
Nodes (46): awcmsOne, initializedAt, templateVersion, description, engines, homepage, license, name (+38 more)

### Community 18 - "video/[slug].astro"
Cohesion: 0.07
Nodes (37): absoluteUrl(), BeritaFeedItem, escapeCdata(), escapeXml(), getPost(), getPosts(), getRelatedPosts(), renderBeritaRssXml() (+29 more)

### Community 19 - "formatPrice"
Cohesion: 0.11
Nodes (38): formatPrice(), PRICE_FORMATTER, addToCart(), clearCart(), loadCart(), newCartId(), removeCartLine(), saveCart() (+30 more)

### Community 20 - "bacaSesi"
Cohesion: 0.10
Nodes (36): simpanWishlistAkun(), UlasanAkun, Akun, AKUN_EVENT_NAME, AKUN_STORAGE_KEY, isIsoDateString(), isSesiKedaluwarsa(), parseSesi() (+28 more)

### Community 21 - "akun-pesanan.ts"
Cohesion: 0.08
Nodes (35): AkunPesananHalaman, nextPollDecision(), PesananPoller, POLL_INTERVAL_MS, POLL_MAX_DURATION_MS, PollDecision, PollInput, PollStopReason (+27 more)

### Community 22 - "bagikan.test.ts"
Cohesion: 0.09
Nodes (32): followLinks, shareLinks, buildShareLinks(), FOLLOW_LABEL, FOLLOW_ORDER, FollowLink, FollowPlatform, resolveFollowLinks() (+24 more)

### Community 23 - "Backup assurance (issue #213)"
Cohesion: 0.05
Nodes (41): A known gap: `SETUP_DATABASE_URL` / `awcms_setup` lacks a grant it needs, A Postgres 18 gotcha, recorded so the next person does not lose an hour to it, `apps/cms/.env.example`, `apps/storefront/.env.example`, Backup assurance (issue #213), Build profiles (`SITE_PROFILE`, issue #137), Build, then serve — two separate steps, two separate trust levels, `compose.production.yaml` (+33 more)

### Community 25 - "UI / UX"
Cohesion: 0.05
Nodes (40): A pre-existing template defect this work found and fixed: the desktop primary nav was invisible, A second type system, self-hosted the same way, Accessibility floor, Account & affiliate pages, redesigned (issue #168), Admin (2026-09 redesign, issue #171), Cart (`/keranjang`), Catalog (`/produk`, `/kategori/[slug]`), Checkout and tracking: payment gateway, redirect-based (issue #112, contract: #106 D3) (+32 more)

### Community 26 - "profil-uji-bersama.ts"
Cohesion: 0.11
Nodes (28): dead, excludedHits, failures, profile, sitemapDead, sitemapLeaks, sitemapPaths, routePathPrefix() (+20 more)

### Community 27 - "catalog.ts"
Cohesion: 0.08
Nodes (31): assertNeverProductStatus(), buildCategoryTree(), buildProdukIndex(), CategoryNode, CommercePage, CommerceProductImage, DEFAULT_TIER_LABELS, getCategories() (+23 more)

### Community 28 - "blog.ts"
Cohesion: 0.09
Nodes (28): AD_PLACEMENT_KEYS, AdPlacementKey, fetchActiveAdPlacements(), fetchAllInstitutions(), fetchAllTerms(), fetchLegacyRedirectRows(), getActiveAdPlacements(), getAllPosts() (+20 more)

### Community 29 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, astro, @astrojs/node, @awcms-one/kontrak, description, devDependencies, @astrojs/check, @axe-core/playwright (+26 more)

### Community 30 - "produk-listing.ts"
Cohesion: 0.11
Nodes (29): filterProdukIndex(), paginateProdukIndex(), ProductSort, ProdukIndexFilter, emptyState, grid, heading, paginationEl (+21 more)

### Community 31 - "ArtikelView.astro"
Cohesion: 0.12
Nodes (21): absoluteShareUrl, avatarInitials, bodyHtml, breadcrumbItems, heroCaption, heroCredit, readingMinutes, wasUpdated (+13 more)

### Community 32 - "akun.ts"
Cohesion: 0.12
Nodes (29): buildWhatsappAccountMessage(), buildWhatsappUrl(), ADR-0003, ADR-0007, showSubmitError(), hideSubmitError(), initialsFor(), LEVEL_LABELS (+21 more)

### Community 33 - "audit-graf.mjs"
Cohesion: 0.11
Nodes (28): graphPath, ignoreExists, ignorePath, manifestPath, outputDir, reporter, reportPath, subtreeTrackedOutput (+20 more)

### Community 34 - "CMS: authoring, publishing, permissions, audit, media, taxonomy"
Cohesion: 0.06
Nodes (31): Accessibility and responsive: the CMS admin side only, Admin screens: twelve, covering every permission, Advertising: ad placements, as `blog_content` renders them, Affiliate program: the shopper's side (issue #93); the admin/staff side is issue #92, both implemented, Audit logging, CMS: authoring, publishing, permissions, audit, media, taxonomy, Commerce inbox (issue #111, contract #106 D8), Courier rates: RajaOngkir, cached (issue #107, contract #106 D4) (+23 more)

### Community 35 - "seed-profil.test.mjs"
Cohesion: 0.14
Nodes (25): ALL_PROFILES, HAS_CONTOH_SEED, HAS_DEPRECATION_SHIM, NEUTRAL_PROFILES, SEED_ASSETS_ROOT, SEED_DATA_ROOT, check(), isNonEmptyString() (+17 more)

### Community 36 - "`apps/storefront` — the public BjekMart storefront"
Cohesion: 0.07
Nodes (30): Ad popup (issue #53), Addresses, orders, synced wishlist, and reviews (issue #90, S2 of #32), Affiliate program — `?ref=` capture, checkout attribution, `/akun/afiliasi` (issue #93, S3 of #32), `apps/storefront` — the public BjekMart storefront, Article share row (issue #51), `BaseLayout.astro`'s `head` slot, Browser-level tests (Playwright), Build profiles — `SITE_PROFILE` (issue #137) (+22 more)

### Community 37 - "redirect-push.ts"
Cohesion: 0.09
Nodes (25): apiCall(), ApiResult, assertOk(), AwcmsApiError, resolveExistingTenantSession(), Session, chunkIdempotencyKey(), ChunkOutcome (+17 more)

### Community 38 - "wishlist-kontrak.ts"
Cohesion: 0.19
Nodes (21): loadWishlist(), removeFromWishlist(), saveWishlist(), toggleWishlist(), addWishlistItem(), createEmptyWishlist(), isIsoDateString(), isWishlisted() (+13 more)

### Community 39 - "stub-lifecycle.ts"
Cohesion: 0.10
Nodes (14): canSpawnBun(), canSpawnBun(), canSpawnBun(), canSpawnBun(), canSpawnBun(), canSpawnBun(), canSpawnBun(), canSpawnBun() (+6 more)

### Community 40 - "BeritaLayout.astro"
Cohesion: 0.13
Nodes (19): PostDetail, articleSocialMeta(), isHttpUrl(), listingSocialMeta(), MetaTag, ogImageMeta(), OgType, postSeoText() (+11 more)

### Community 41 - "4. Screen-by-screen layout, interactions and edge cases"
Cohesion: 0.07
Nodes (28): 0. Evidence, boundaries and terminology, 1. Navigation, screen map and release-status contract, 2. Global admin shell and responsiveness, 3. Personas and permission policy, 4. Screen-by-screen layout, interactions and edge cases, 5. Product-specific settings vs upstream functional UI, 6. UX acceptance matrix, security gates and deployment, 7. Priority and issue traceability (+20 more)

### Community 42 - "sitemap-sources.ts"
Cohesion: 0.16
Nodes (21): SITEMAP_SOURCES, chunkSitemapEntries(), collectSitemapEntries(), escapeXml(), getAllSitemapEntries(), KATALOG_SITEMAP_SOURCE_NAMES, registerSitemapSource(), renderSitemapIndexXml() (+13 more)

### Community 43 - "masuk.ts"
Cohesion: 0.12
Nodes (18): mintaKode(), OtpChannel, CartQuote, Envelope, STOREFRONT_PATH_PREFIX, TokoApiError, ValidationErrorDetail, clearFieldErrors() (+10 more)

### Community 44 - "kategori/[slug].astro"
Cohesion: 0.13
Nodes (13): buildPriceTiers(), collectCategorySubtreeIds(), CommerceCategory, CommerceProduct, getCategoryBySlug(), productsInCategory(), ProdukIndexEntry, BreadcrumbItem (+5 more)

### Community 45 - "check-docs-translation.mjs"
Cohesion: 0.23
Nodes (18): DOCS_AWAITING_MIRROR, gitList(), listMirrors(), listSources(), ROOT, runChecks(), checkMirrorCoverage(), checkTranslationPair() (+10 more)

### Community 46 - "profil.mjs"
Cohesion: 0.16
Nodes (17): ADR-0018, SITE, BERANDA_ALIAS, berandaVariantPath(), collectInjectedRoutes(), ENDPOINT_EXTENSIONS, listPageFiles(), ADR-0018 (+9 more)

### Community 47 - "navigasi-profil.ts"
Cohesion: 0.16
Nodes (16): detailCache, fetchStaticPage(), fetchStaticPageList(), getStaticPage(), isExpectedRefusal(), listStaticPages(), StaticPageDetail, StaticPageSummary (+8 more)

### Community 48 - "awcms-one 0.4.0 — 2026-09-18"
Cohesion: 0.10
Nodes (21): `apps/storefront`: news chrome — primary nav, Daerah panel, ticker, utility bar, footer directory, footer leaderboard slot, back-to-top, `audit:rilis` count bound raised from 10 to 20 waiting changesets, awcms-one 0.4.0 — 2026-09-18, `/berita`, `/video` and every `/rubrik/{slug}` answered 404 on the served site, "Dengarkan berita ini" — the article read-aloud player, Exporter from the seputarborneo MariaDB dump to `blog_content`'s legacy-import pipeline, Logo Instansi — an institution's emblem beside the article it filed, One more correction: the row-based (issue #28) map itself (+13 more)

### Community 49 - "Database schema"
Cohesion: 0.10
Nodes (21): Affiliate program: two tables (`sql/921`), `awcms_commerce_categories` (`sql/901`, `+restored_at` in `sql/904`), `awcms_commerce_product_images` / `awcms_commerce_product_variants` (`sql/905`), `awcms_commerce_products` (`sql/901` core + `sql/904` BjekMart parity columns), Catalog: `awcms_commerce_categories`, `awcms_commerce_products`, `_product_images`, `_product_variants`, Commerce inbox: two tables (`sql/927`), Courier rates: two cache tables (`sql/924`), Customer accounts, OTP, sessions: three tables (`sql/917`-`918`) (+13 more)

### Community 50 - "knowledge-obsidian-export.mjs"
Cohesion: 0.15
Nodes (16): ALLOWED_EXTENSIONS, basenameOf(), checkCuratedCollision(), classifyEntry(), extensionOf(), isAbsoluteLike(), KNOWN_HOUSEKEEPING_BASENAMES, resolveWithin() (+8 more)

### Community 51 - "AGENTS.md"
Cohesion: 0.25
Nodes (4): Definition of Done, How it was verified, Linked issue, Summary

### Community 52 - "iklan-popup.ts"
Cohesion: 0.15
Nodes (14): BODY_OPEN_CLASS, CLOSE_LABEL, CTA_LABEL, DEFAULT_LABEL, DIALOG_ID, IklanPopupData, initIklanPopup(), isModifiedClick() (+6 more)

### Community 53 - "API"
Cohesion: 0.10
Nodes (20): API, Authorization: 39 owner permissions, Catalog (issue #4, deepened by #23), Commerce inbox — implemented (#111, contract #106/ADR-0017 D8), Courier rates (issue #107, contract #106 D4), Customer accounts — auth + resources + affiliates implemented (#89, #91, #92), Customer campaigns — implemented (#114, contract #106/ADR-0017 D9), Domain events: twelve (+12 more)

### Community 54 - "dengar.ts"
Cohesion: 0.20
Nodes (11): bacaSimpanan(), DILEWATI, initDengar(), KELAS_DIBACA, kumpulkanUnit(), pasangPemutar(), pecahKalimat(), suaraIndonesia() (+3 more)

### Community 55 - "afiliasi-kontrak.ts"
Cohesion: 0.23
Nodes (14): AFILIASI_STORAGE_KEY, AFILIASI_TTL_MS, AfiliasiTertangkap, bacaKodeAfiliasi(), bacaStorage(), isAfiliasiKedaluwarsa(), isIsoDateString(), parseAfiliasi() (+6 more)

### Community 56 - "UI/UX redesign — OMES public site (October 2026)"
Cohesion: 0.09
Nodes (17): Design artifacts, Assets used, Contents, Findings from reading the code, How to view, Proposals that need a decision, UI/UX redesign — OMES public site (October 2026), ADR-0014 — An institution owns its emblem; a post never carries one (+9 more)

### Community 57 - "Data dictionary"
Cohesion: 0.11
Nodes (18): `awcms_commerce_categories` ← `commerce_bj_mart.categories`, `awcms_commerce_product_images` / `awcms_commerce_product_variants` ← `commerce_bj_mart.product_images` / `.product_variants`, `awcms_commerce_products` ← `commerce_bj_mart.products`, `awcms_seo_redirects` — `tools/out/seputarborneo/redirects.json` (origin `legacy_blog`), `berita_red` → `tools/out/seputarborneo/posts.ndjson`, one `LegacyImportRecord` per line, `berita_vid` → `tools/out/seputarborneo/videos.ndjson`, `config` → `tools/out/seputarborneo/site-profile.json`, merged into `PUT /api/v1/site-profile`, Data dictionary (+10 more)

### Community 58 - "knowledge-graph-combine.mjs"
Cohesion: 0.15
Nodes (14): checkMergedResult(), checkMergeInputsCompatible(), validateGraphFile(), CMS_GRAPH, cmsResult, incompatible, mergedResult, OUT_DIR (+6 more)

### Community 59 - "AGENTS.md — awcms-one's working contract"
Cohesion: 0.12
Nodes (17): AGENTS.md — awcms-one's working contract, Build profiles and the template mechanism (increment 6, epic #135), Changesets and releases, Configuration and toolchain, Definition of Done, Knowledge Graph (graphify), Language, Product development flow (v2.0.0) (+9 more)

### Community 60 - "product/[slug].astro"
Cohesion: 0.18
Nodes (10): comparePrices(), formatDiscountPercent(), priceToNumber(), ADR-0003, formatRemaining(), tick(), HARGA_FILE, SCANNABLE_EXTENSIONS (+2 more)

### Community 61 - "akun-alamat.ts"
Cohesion: 0.26
Nodes (16): Alamat, AlamatInput, clearFieldErrors(), closeForm(), deleteAlamat(), hideSubmitError(), loadList(), openFormForCreate() (+8 more)

### Community 62 - "awcms/analitik.ts"
Cohesion: 0.20
Nodes (11): fetchTopPaths(), getTopPaths(), hitungTayangPerSlug(), isExpectedRefusal(), pilihTerpopuler(), resetAnalitikCacheForTests(), slugDariPath(), TERPOPULER_RANGE (+3 more)

### Community 63 - "lembaga.ts"
Cohesion: 0.18
Nodes (12): buildMitraList(), getMitraBySlug(), getMitraList(), MitraSummary, toMitraSummary(), ResolvedMedia, resolveRegion(), getMitra() (+4 more)

### Community 64 - "Decision"
Cohesion: 0.12
Nodes (17): ADR-0017 — External providers are `commerce`-owned ports, with env-per-deployment credentials and token-addressed webhooks, Consequences, Context, D10 — Features & partners: module settings flags, and `customers.level` as BjekMart's own "Partners", D1 — Integration pattern: a port + adapters inside `commerce`, modelled on `email`, D2 — Inbound webhooks: token-addressed, `SECURITY DEFINER`-resolved, replay-protected, D3 — Payment gateway: a `PaymentGatewayProvider` port, Midtrans Snap first, redirect-based storefront flow, D4 — Courier rates: a `ShippingRateProvider` port, RajaOngkir (Komerce API v2) adapter, 6-hour cached rates (+9 more)

### Community 65 - "Decision"
Cohesion: 0.12
Nodes (17): ADR-0018 — awcms-one is a template, with build profiles and an idempotent `template:init`, Consequences, Context, D1 — Template in place: one repository, a `template` flag, no fork, D2 — Build profiles: `SITE_PROFILE ∈ {toko, berita, landing}`, chosen at build time, D3 — Mechanism: `src/profil/<group>/pages/**` injected by an Astro integration, driven by `apps/storefront/src/config/profil.ts`, D4 — Brand lives in env + `site.ts`, plus a short, named list of files `template:init` rewrites, D5 — `template:init`: an idempotent CLI over the D4 brand surface (+9 more)

### Community 66 - "cek-lockfile.mjs"
Cohesion: 0.15
Nodes (14): stripTrailingCommas(), blocks, config, lockfile, ALL_PACKAGES, DEPENDENCY_BLOCKS, findWorkspaces(), foundPaths (+6 more)

### Community 67 - "mysql-dump-reader.ts"
Cohesion: 0.17
Nodes (12): DumpRow, extractCreateTableColumns(), findMatchingParen(), findNextStatementStart(), Mode, readMysqlDumpRows(), SqlInsertTokenizer, SqlValue (+4 more)

### Community 68 - "bun"
Cohesion: 0.14
Nodes (8): canSpawnBun(), canSpawnBun(), runBuild(), bun, cleanup, fixture(), run(), SCRIPT

### Community 69 - "resolveSiteProfile"
Cohesion: 0.20
Nodes (11): isSiteProfile(), resolveSiteProfile(), buildAndServe(), BuildAndServeOptions, BuiltSite, ADR-0007, waitForHttp(), globalSetup() (+3 more)

### Community 70 - "akun-afiliasi.ts"
Cohesion: 0.22
Nodes (14): AfiliasiKomisiHalaman, appendKomisiRows(), hideSubmitError(), KOMISI_STATUS_LABELS, KOMISI_STATUS_TONES, loadMoreKomisi(), render(), renderEnrolled() (+6 more)

### Community 71 - "profil-halaman.ts"
Cohesion: 0.20
Nodes (11): FAILING_IMPACT, WCAG_TAGS, ACTIVE_PROFILE, firstSlug(), KEY_PAGES, KeyPage, keyPagesFor(), VIEWPORTS (+3 more)

### Community 72 - "awcms-one 0.7.0 — 2026-09-20"
Cohesion: 0.13
Nodes (15): ADR-0017 + OpenAPI contract for external providers — payment gateway, courier rates, WhatsApp, POS, reports, inbox, campaigns, awcms-one 0.7.0 — 2026-09-20, Build-smoke tests wait 20 s, not 5 s, for the stub CMS to boot, Checkout prices real courier rates per destination (issue #109, S1 of #33), Commerce feature toggles per tenant + tiered pricing at quote for logged-in customers, Commerce inbox — customer/store conversations, bearer + owner endpoints, admin screen, Customer campaigns: consent, mass e-mail/WhatsApp, dispatcher, admin screen (issue #114, C6 of #33), Payment gateway checkout — "Bayar sekarang" + polling (issue #112, S2 of #33) (+7 more)

### Community 73 - "`template:init` — CLI reference"
Cohesion: 0.13
Nodes (15): After it runs, BjekMart as the reference example, Build profiles, Memulai dari template (starting from the template), Navigation, sitemap, feeds, robots, CSP, and fixtures per profile, Sample seeds, Status, `template:init` — CLI reference (+7 more)

### Community 74 - "Routing"
Cohesion: 0.14
Nodes (14): A page shadowed by a same-named directory is rewritten to its `.html` (issue #75), Build profiles: `SITE_PROFILE` decides which groups are routes (issue #137, [ADR-0018](adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.md) D2/D3), Catalog, Commerce runtime (browser calls `apps/cms` directly; pages themselves are static), Customer accounts (issue #88 S1, issue #90 S2, issue #93/#115 S3, of #32/#33), Discovery, feeds, and generated assets, Legacy redirects, News (mirrors seputarborneo/beritasampit) (+6 more)

### Community 75 - "produk-detail.ts"
Cohesion: 0.23
Nodes (12): CommerceProductVariant, findVariantForSelection(), currentVariant(), effectiveMaxQuantity(), effectivePrice(), FlashSalePayload, hasSelection(), ProdukDetailPayload (+4 more)

### Community 76 - "awcms-one 0.11.0 — 2026-09-23"
Cohesion: 0.15
Nodes (13): A newcomer-first README, with real per-profile screenshots, A single current-state status page; AGENTS.md becomes working rules only, `audit:graf` fails once the root knowledge graph drifts too far from the tree, awcms-one 0.11.0 — 2026-09-23, CODEOWNERS, a PR template, and issue forms, CodeQL code scanning for JavaScript/TypeScript, Dependabot version updates for GitHub Actions and this repo's own workspaces, Fix the storefront Dockerfile smoke job's unreachable stub CMS (+5 more)

### Community 77 - "Development workflow"
Cohesion: 0.15
Nodes (13): Branch protection on `main`, Branching and PRs, CI: a fifth, now-required workflow — `codeql`, CI: a fourth, now-required workflow — `e2e`, CI: a third, now-required workflow — `template-init-smoke`, CI: two jobs — one unconditional, one against a real database, Dependency updates, Development workflow (+5 more)

### Community 78 - "Testing"
Cohesion: 0.15
Nodes (13): 1. Root gate suite (`bun test` from the repo root), 2. `apps/storefront`: unit tests, a type-check, and two build-smoke tiers, 3. `apps/cms` (`check-cms` CI job): a real, provisioned PostgreSQL, Increment 5's `apps/cms` integration suites (issues #107/#108/#110/#111/#113/#114/#116/#117/#118), Not built, Playwright e2e — a fourth tier, its own command, its own CI workflow (issue #183), Production preflight (issue #150, ADR-0019), Running it locally (+5 more)

### Community 79 - "SEO"
Cohesion: 0.15
Nodes (13): Build profiles: the discovery surface shrinks with the profile (issue #137), Canonical URLs, JSON-LD by page type, Legacy redirects: two layers, rows first, `noindex` pages, Not built, Open Graph and Twitter Card by page type (issue #54), Per-page metadata — unchanged mechanism from increment 1 (+5 more)

### Community 80 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, isolatedModules, lib, module, noEmit, strict, target, extends (+4 more)

### Community 81 - "Inherited awcms-one template history (pre-fork, not OMES-Web releases)"
Cohesion: 0.17
Nodes (12): ADR-0018 + profile matrix + template contract (wave 0 of epic #135), awcms-one 0.11.1 — 2026-09-24, awcms-one 0.1.0 — 2026-09-15, awcms-one 0.5.0 — 2026-09-18, awcms-one 0.8.0 — 2026-09-20, `bun run template:init` — idempotent brand/profile initialisation for derived repos, `commerce:deploy:preflight` redacts credential-shaped values before printing, Commerce migrations renumbered into a reserved `9xx` range (+4 more)

### Community 82 - "Architecture"
Cohesion: 0.17
Nodes (12): A third trust tier: anonymous → authenticated customer, still no cookie, Architecture, External providers: ports and outboxes inside `commerce`, never a synchronous call on the order path, Further reading, Import direction: one way, `storefront → kontrak → cms`, One more thing the server does: it repairs a shadowed page, One storefront, three build profiles (issue #137, [ADR-0018](adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.md) D2/D3), The `commerce` module: one module, three areas, a dependency on `media_library` (+4 more)

### Community 83 - "Status"
Cohesion: 0.17
Nodes (12): `apps/cms` — the `commerce` module (ADR-0008), `apps/storefront` — build profiles (ADR-0018), Customer accounts and affiliates (ADR-0016), External integrations (ADR-0017), Not here yet — the short list, Ops and deployment, Releases, Status (+4 more)

### Community 84 - "docs-i18n-stamp.mjs"
Cohesion: 0.21
Nodes (8): MARKER_REGEX, changed, CHECK_ONLY, inBody(), ROOT, splitFrontmatter(), withMarker(), withoutMarker()

### Community 85 - "contrastingForeground"
Cohesion: 0.40
Nodes (8): labelClassName(), contrastingForeground(), contrastRatio(), isValidHexColor(), relativeLuminance(), WCAG_AA_TEXT_CONTRAST, GET(), prerender

### Community 86 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, baseUrl, paths, types, extends, @profil/beranda, astro/tsconfigs/strict, bun (+2 more)

### Community 87 - "kontrak/package.json"
Cohesion: 0.18
Nodes (10): awcms, dependencies, awcms, description, exports, name, private, type (+2 more)

### Community 88 - "[0.2.0] — 2026-10-24"
Cohesion: 0.18
Nodes (11): [0.2.0] — 2026-10-24, `apps/cms` synced from `ahliweb/awcms` `0d6c0dfe` — OMES Control Center screens and worker API, Changelog, Clear the bun audit advisories on main, `landing` build stops preloading fonts the OMES theme never renders, OMES theme, self-hosted Public Sans/JetBrains Mono, and the OMES home page, Sync apps/cms subtree to awcms 4a7416ac, Sync apps/cms subtree to awcms 8e9bce0c (+3 more)

### Community 89 - "awcms-one 0.3.0 — 2026-09-17"
Cohesion: 0.18
Nodes (11): awcms-one 0.3.0 — 2026-09-17, `bun run check:cms` is green again inside the subtree embed, Commerce marketing surface: flash sales, vouchers, sliders, testimonials, promo popup, store settings, `commerce` reaches full BjekMart product-model parity, Commerce transactional surface: customers, addresses, orders, payment confirmations, reviews, Increment-2 documentation refresh: ADR-0007..0010, mirrors, root skills, knowledge graph, Local PostgreSQL via docker compose, seed the BjekMart tenant, CI job for check:cms, Storefront cart, checkout, order tracking, and wishlist (+3 more)

### Community 90 - "Decision"
Cohesion: 0.18
Nodes (11): ADR-0016 — Customer accounts are OTP-verified `commerce` accounts with bearer sessions, Consequences, Context, D1 — Identity: a `commerce` row, never `awcms_principals`, D2 — Channel: e-mail OTP now, WhatsApp as a follow-up, D3 — Session transport: opaque bearer token, `localStorage`, 30-day sliding TTL, D4 — Registration binds to an existing guest row only when the e-mail also matches, D5 — Affiliate program, designed fresh (+3 more)

### Community 91 - "Decision"
Cohesion: 0.18
Nodes (11): ADR-0019 — Production topology: two images, a jobs sidecar, and a fail-closed preflight, Consequences, Context, D1 — `apps/cms` is the system of record; `apps/storefront` stays a static build with its own tiny server, never a dynamic backend, D2 — Two build-time images, one runtime database role each, and a separate migration-owner identity, D3 — Scheduled jobs run from the generated crontab, never a hand-copied list, including under docker-compose, D4 — `AWCMS_API_TOKEN` reaches the storefront build only through a BuildKit build secret, never an ARG/ENV, D5 — Preflight is fail-closed and layered: `apps/cms`'s own commerce-specific checks, then the root storefront-shape check (+3 more)

### Community 92 - "Root knowledge-graph workflow"
Cohesion: 0.18
Nodes (11): Bounded content staleness (issue #186), Cross-repo source-of-truth rules, Extraction mode: code-only, local, no API, by default, `knowledge/curated/`, Root knowledge-graph workflow, Security and privacy: what this workflow considers, and does not certify, The federated model, The Obsidian export boundary (+3 more)

### Community 93 - "knowledge-no-subtree-write.test.mjs"
Cohesion: 0.24
Nodes (9): buildFixture(), cleanup, COMBINE_SCRIPT, EXPORT_SCRIPT, fakeGraph(), fakeGraphifyBin(), REPO_ROOT, runTool() (+1 more)

### Community 94 - "awcms-one 0.6.0 — 2026-09-19"
Cohesion: 0.20
Nodes (10): ADR-0016 + OpenAPI contract for customer accounts, OTP, bearer sessions, affiliates, Affiliate program, from the shopper's side: `?ref=` capture, checkout attribution, `/akun/afiliasi` (issue #93, S3 of #32), Affiliate program — schema, commissions on completed orders, storefront + owner API, admin screen (C4), awcms-one 0.6.0 — 2026-09-19, Customer account auth endpoints — OTP request/verify, me, logout (C2), Customer account, OTP and session schema (C1), Customer account resource endpoints — addresses, wishlist, orders, reviews (C3), Customer accounts: addresses, order history, synced wishlist, reviews (issue #90, S2 of #32) (+2 more)

### Community 95 - "awcms-one — Start a new app from this template"
Cohesion: 0.20
Nodes (8): After `template:init` runs, check, awcms-one — Start a new app from this template, Common mistakes, Step 1 — pick the build profile before anything else, Step 2 — run `template:init`, Step 3 — seed it and run it, What this repository is, twice over, awcms-one root skills

### Community 96 - "Contributing Guide"
Cohesion: 0.20
Nodes (10): Branch naming, Code ownership, Commit conventions, Contributing Guide, Definition of Done, Reporting problems, Rules that are not negotiable, Setting up (+2 more)

### Community 97 - "awcms-one"
Cohesion: 0.20
Nodes (10): Architecture at a glance, awcms-one, Documentation, Gates, Language, Licence, Running locally, Use this as a template (+2 more)

### Community 98 - "Security Policy"
Cohesion: 0.20
Nodes (10): CodeQL triage, Controls in force today, Five surfaces, reported the same way but owned differently, Not a security vulnerability, Provider and webhook surfaces: what protects them, Reporting a vulnerability, Security Policy, The storefront's anonymous surface: what protects it (+2 more)

### Community 99 - "awcms-one — Add a commerce table + endpoint"
Cohesion: 0.22
Nodes (9): Adding to the anonymous storefront API (`/api/v1/commerce/storefront/*`), Admin screen and events, Admin screen composition (2026-09 redesign, issue #171), awcms-one — Add a commerce table + endpoint, Every new owner-side endpoint, Every new table, It is one module, not three — put your work inside `apps/cms/src/modules/commerce/`, Two `Bun.SQL` quirks every commerce query must account for (+1 more)

### Community 100 - "Responsive design"
Cohesion: 0.22
Nodes (9): Customer accounts: no dedicated breakpoint, fluid like the rest, Mostly fluid, with a small, deliberate set of breakpoints, Not built, Responsive design, Tap targets, The 2026-09 redesign's chrome (issue #166), The OMES theme (`landing` build profile only, `omes-web`#3), Two real overflow bugs the first automated run found (issue #183) (+1 more)

### Community 101 - "knowledge-obsidian-export.test.mjs"
Cohesion: 0.31
Nodes (8): buildFixture(), cleanup, EXPORT_SCRIPT, fakeGraph(), fakeGraphifyBin(), REPO_ROOT, runExport(), write()

### Community 102 - "checkout-guard-no-prerender.test.ts"
Cohesion: 0.29
Nodes (7): listAllPageFiles(), listSourceFiles(), PAGES_ROOT, PROFIL_ROOT, SRC_ROOT, TOKO_PAGES_ROOT, ADR-0007

### Community 103 - "awcms-one 0.2.0 — 2026-09-15"
Cohesion: 0.25
Nodes (8): apps/cms: the `commerce` module — catalog domain, persistence, migrations, API, apps/storefront: the public catalog and product-detail storefront, Architecture and reference documentation, describing the merged tree as it actually is, audit:dokumen no longer reads knowledge/generated/, awcms-one 0.2.0 — 2026-09-15, Federated knowledge-graph workflow: root Graphify graph, `audit:graf`, safe Obsidian export, Monorepo foundation: audit gates, release tooling, governance docs, and CI, packages/kontrak: the type-only DTO contract, and the storefront reconciled to the real envelope

### Community 104 - "awcms-one — Add a storefront page"
Cohesion: 0.25
Nodes (8): Adding a build-time page (the common case: catalog, news, a static page), Adding a runtime (browser-calls-`apps/cms`) page or script, Adding an authenticated (signed-in-customer) page, awcms-one — Add a storefront page, Choose the profile group first (issue #137, ADR-0018 D2/D3), The one rule that governs every page in this app, Three things increment 3 added that a new page must respect, Verifying your change

### Community 105 - "compose-produksi.test.mjs"
Cohesion: 0.25
Nodes (5): ADR-0019, COMPOSE_PATH, doc, raw, REPO_ROOT

### Community 106 - "Decision"
Cohesion: 0.25
Nodes (8): ADR-0020 — Publish only the CMS images to GHCR, with SBOM and provenance, Consequences, Context, D1 — `.github/workflows/images.yml` publishes exactly two images: `apps/cms`'s `runtime` and `jobs` targets, unmodified, D2 — The storefront image is deliberately not published; rejected alternatives, D3 — A build-only Dockerfile smoke test proves `apps/storefront/Dockerfile` still builds, without publishing it, D4 — `compose.production.yaml`'s `cms`/`jobs`/`migrate` image names become env-overridable, defaulting to today's local-build names, Decision

### Community 107 - "ADR-0021 — OMES-Web is a separate, integrated OMES product deployment"
Cohesion: 0.25
Nodes (6): ADR-0021 — OMES-Web is a separate, integrated OMES product deployment, Alternatives, Context and evidence, Contract and operational acceptance, Integration + release model, Non-negotiable ownership

### Community 108 - "awcms-one 0.9.0 — 2026-09-21"
Cohesion: 0.29
Nodes (7): A real production deployment path, and a fail-closed preflight, A second, independent contention source, found while validating this fix, A third, root-cause finding: `TEMPLATE_INIT_TEST_SCOPE=root` never scoped anything, awcms-one 0.9.0 — 2026-09-21, Merge commit is now the only merge method — subtree-sync protection is mechanical, not procedural, Security policy reconciled with the implemented customer and provider surfaces, `template-init-smoke` no longer runs the full root suite three times at once

### Community 109 - "awcms-one 0.12.0 — 2026-09-24"
Cohesion: 0.29
Nodes (7): Align the root-owned Bun pin to 1.4.2, awcms-one 0.12.0 — 2026-09-24, Encrypted backup assurance and restore drills, integrated into the production topology, Promote CodeQL to a required pull-request status check, Promote the Playwright e2e matrix to required status checks, Sync the `apps/cms` subtree from upstream `8c64528d` to `2d29a446`, Test awcms-one's deployment/migration boundary around the synchronized `omes_control` module

### Community 110 - "awcms-one 0.10.0 — 2026-09-22"
Cohesion: 0.29
Nodes (7): apps/cms synced to ahliweb/awcms 8c64528d — the admin chrome restyle, awcms-one 0.10.0 — 2026-09-22, Commerce admin screens re-composed on the new admin primitives (issue #171), Storefront redesign — account and affiliate pages, Storefront redesign — commerce pages (home, catalog, product, cart, checkout, tracking, wishlist), Storefront redesign foundation — self-hosted type system, tokens, primitives, site chrome, Storefront redesign — news chrome, news home and article

### Community 111 - "Code of Conduct"
Cohesion: 0.29
Nodes (7): Attribution, Code of Conduct, Commitment, Enforcement, Responsibility, Scope, Standards

### Community 112 - "Governance"
Cohesion: 0.29
Nodes (7): Changes that may not be made alone, Governance, Recording a decision, Releases, Roles, The decision flow, The principle that binds every decision

### Community 113 - "kontrak-arah-impor.test.mjs"
Cohesion: 0.38
Nodes (4): join(), SCANNED_EXTENSIONS, SKIP, sourceFiles()

### Community 114 - "ga-init.ts"
Cohesion: 0.53
Nodes (3): gtag(), initGa(), Window

### Community 115 - "berita-guard-no-news-route.test.ts"
Cohesion: 0.33
Nodes (4): PAGES_ROOT, PROFIL_ROOT, SRC_ROOT, ADR-0071

### Community 116 - "meta-sosial-build-smoke.test.ts"
Cohesion: 0.47
Nodes (4): canSpawnBun(), headOf(), relLinks(), socialMeta()

### Community 117 - "Changesets"
Cohesion: 0.33
Nodes (6): `bump` decides the version, Changesets, Format, Notes, The backlog has two bounds, When one is required

### Community 118 - "status-prosa.test.mjs"
Cohesion: 0.33
Nodes (5): ADR-0016, EN, ID, STALE_EN_PHRASES, STALE_ID_PHRASES

### Community 119 - "Lessons learned"
Cohesion: 0.33
Nodes (6): Lessons learned, Why `git subtree`, not a package dependency or a fork, Why re-platform rather than upgrade Laravel in place, Why the federated graph is generated, not committed, Why the Obsidian export runs against the root graph, not the combined one, Why the root knowledge graph is `--code-only` by default (issue #11)

### Community 120 - "config/package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 121 - "gerbang/package.json"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 122 - "audit-dokumen.test.mjs"
Cohesion: 0.33
Nodes (4): cleanup, ADR-0042, run(), SCRIPT

### Community 123 - "audit-rilis.test.mjs"
Cohesion: 0.33
Nodes (3): cleanup, run(), SCRIPT

### Community 124 - "promo-popup.ts"
Cohesion: 0.60
Nodes (4): dialog, markShown(), shouldShow(), storageKey()

### Community 126 - "0006-a-federated-knowledge-graph-that-never-duplicates-the-subtree.md"
Cohesion: 0.40
Nodes (4): ADR-0006 — A federated knowledge graph: root-owned, code-only, never duplicating `apps/cms`'s own, Consequences, Context, Decision

### Community 127 - "ADR-0010 — Manual payment and alternative courier first; gateways and aggregators arrive through the outbox"
Cohesion: 0.40
Nodes (5): ADR-0010 — Manual payment and alternative courier first; gateways and aggregators arrive through the outbox, Consequences, Context, Decision, Status — 19 September 2026

### Community 128 - "ADR-0015 — Commerce migrations live in the reserved `9xx` range"
Cohesion: 0.40
Nodes (5): ADR-0015 — Commerce migrations live in the reserved `9xx` range, Consequences, Context, Decision, Options considered

### Community 129 - "compilerOptions"
Cohesion: 0.40
Nodes (4): compilerOptions, jsx, jsxImportSource, moduleResolution

### Community 130 - "subtree-guard.mjs"
Cohesion: 0.80
Nodes (3): assertNotUnderSubtree(), isAbsoluteLike(), isUnderSubtree()

### Community 132 - "SITE_PROFILES"
Cohesion: 0.50
Nodes (3): run, { values }, SITE_PROFILES

### Community 133 - "write-build-id.mjs"
Cohesion: 0.50
Nodes (3): buildId, OUT_PATH, resolveBuildId()

### Community 134 - "bagikan-build-smoke.test.ts"
Cohesion: 0.50
Nodes (3): ARTICLE_PAGE, canSpawnBun(), VIDEO_PAGE

### Community 135 - "dengar-build-smoke.test.ts"
Cohesion: 0.50
Nodes (3): ARTICLE_PAGE, canSpawnBun(), VIDEO_PAGE

### Community 136 - "logo-instansi-build-smoke.test.ts"
Cohesion: 0.50
Nodes (3): ARTICLE_WITH_LOGO, canSpawnBun(), MITRA_WITH_LOGO

### Community 137 - "ADR-0001 — `apps/cms` is `ahliweb/awcms`, embedded via `git subtree` with full history"
Cohesion: 0.50
Nodes (4): ADR-0001 — `apps/cms` is `ahliweb/awcms`, embedded via `git subtree` with full history, Consequences, Context, Decision

### Community 138 - "ADR-0002 — The storefront is `output: "static"`, fetching the catalog at build time"
Cohesion: 0.50
Nodes (4): ADR-0002 — The storefront is `output: "static"`, fetching the catalog at build time, Consequences, Context, Decision

### Community 139 - "ADR-0003 — Money is `numeric(14,2)`, and crosses the wire as a string"
Cohesion: 0.50
Nodes (4): ADR-0003 — Money is `numeric(14,2)`, and crosses the wire as a string, Consequences, Context, Decision

### Community 140 - "ADR-0004 — `packages/kontrak` is a type-only contract, with a gate holding the import direction one-way"
Cohesion: 0.50
Nodes (4): ADR-0004 — `packages/kontrak` is a type-only contract, with a gate holding the import direction one-way, Consequences, Context, Decision

### Community 141 - "ADR-0005 — Product URLs match the live site's shape: `/product/{slug}`, no trailing slash, `/products` redirects"
Cohesion: 0.50
Nodes (4): ADR-0005 — Product URLs match the live site's shape: `/product/{slug}`, no trailing slash, `/products` redirects, Consequences, Context, Decision

### Community 142 - "ADR-0007 — Cart, checkout and order tracking stay static; the browser calls the CMS's anonymous commerce endpoints directly"
Cohesion: 0.50
Nodes (4): ADR-0007 — Cart, checkout and order tracking stay static; the browser calls the CMS's anonymous commerce endpoints directly, Consequences, Context, Decision

### Community 143 - "ADR-0008 — One `commerce` module carries the whole store, not three"
Cohesion: 0.50
Nodes (4): ADR-0008 — One `commerce` module carries the whole store, not three, Consequences, Context, Decision

### Community 144 - "ADR-0009 — Guest checkout, addressed by order code + phone; customer accounts come later"
Cohesion: 0.50
Nodes (4): ADR-0009 — Guest checkout, addressed by order code + phone; customer accounts come later, Consequences, Context, Decision

### Community 145 - "ADR-0011 — The storefront resolves media through `GET /api/v1/media/objects`, and the CSP is derived from what resolved"
Cohesion: 0.50
Nodes (4): ADR-0011 — The storefront resolves media through `GET /api/v1/media/objects`, and the CSP is derived from what resolved, Consequences, Context, Decision

### Community 146 - "ADR-0012 — Visitor analytics is first-party by default; GA4 is an opt-in switch"
Cohesion: 0.50
Nodes (4): ADR-0012 — Visitor analytics is first-party by default; GA4 is an opt-in switch, Consequences, Context, Decision

### Community 147 - "ADR-0013 — Rule-based legacy redirects sit beside the row-based map, and a row always wins"
Cohesion: 0.50
Nodes (4): ADR-0013 — Rule-based legacy redirects sit beside the row-based map, and a row always wins, Consequences, Context, Decision

### Community 148 - "Documentation"
Cohesion: 0.50
Nodes (4): Documentation, Language, OMES-Web product integration and SYSTEM admin UX, What this directory does not duplicate

### Community 149 - "Contracts index"
Cohesion: 0.50
Nodes (4): Contracts index, Responsibility, The flow today, before `packages/kontrak`, Why this file exists separately from the graph

### Community 150 - "Monorepo map"
Cohesion: 0.50
Nodes (4): Approach, Monorepo map, Why `apps/cms` embeds `awcms` whole, not as a dependency, Why this repo exists at all

### Community 151 - "Ownership boundaries and subtree sync rules"
Cohesion: 0.50
Nodes (4): Ownership boundaries and subtree sync rules, Source-of-truth boundaries, The one rule that protects every future subtree sync, What this means for the knowledge-graph workflow specifically

### Community 152 - "Security and tenant-isolation boundaries"
Cohesion: 0.50
Nodes (4): Canonical sources, Security and tenant-isolation boundaries, What this file does not claim, What this repo adds, not restates

### Community 153 - "Support"
Cohesion: 0.50
Nodes (4): Priority, Support, What can be helped with here, What this channel is NOT

### Community 154 - "versi-toolchain.test.mjs"
Cohesion: 0.50
Nodes (3): ci, pkg, VERSION

### Community 155 - "knowledge-graph-update.mjs"
Cohesion: 0.50
Nodes (3): COST_PATH, ROOT, run()

### Community 161 - "Architecture Decision Records"
Cohesion: 0.67
Nodes (3): Architecture Decision Records, This table is guarded, Why the numbering starts at 0001

## Knowledge Gaps
- **1321 isolated node(s):** `SITE`, `ADR-0018`, `ADR-0018`, `name`, `type` (+1316 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `bun` connect `bun` to `plan.mjs`, `write-build-id.mjs`, `bagikan-build-smoke.test.ts`, `dengar-build-smoke.test.ts`, `logo-instansi-build-smoke.test.ts`, `rilis.mjs`, `audit-dokumen.mjs`, `scripts`, `profil-uji-bersama.ts`, `knowledge-graph-update.mjs`, `pesan-build-smoke.test.ts`, `stub-lifecycle.ts`, `check-docs-translation.mjs`, `mysql-dump-reader.ts`, `resolveSiteProfile`, `knowledge-no-subtree-write.test.mjs`, `knowledge-obsidian-export.test.mjs`, `meta-sosial-build-smoke.test.ts`, `audit-dokumen.test.mjs`, `audit-rilis.test.mjs`, `sidebar-build-smoke.test.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `ROUTES` connect `routes.ts` to `berita.ts`, `navigasi-berita.ts`, `pemasaran.ts`, `config/profil.ts`, `akun-klien.ts`, `video/[slug].astro`, `akun-pesanan.ts`, `profil-uji-bersama.ts`, `blog.ts`, `ArtikelView.astro`, `akun.ts`, `BeritaLayout.astro`, `sitemap-sources.ts`, `masuk.ts`, `kategori/[slug].astro`, `navigasi-profil.ts`, `product/[slug].astro`, `lembaga.ts`, `profil-halaman.ts`, `berita-guard-no-news-route.test.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `startStub()` connect `stub-lifecycle.ts` to `bun`, `bagikan-build-smoke.test.ts`, `dengar-build-smoke.test.ts`, `logo-instansi-build-smoke.test.ts`, `meta-sosial-build-smoke.test.ts`, `profil-uji-bersama.ts`, `sidebar-build-smoke.test.ts`, `pesan-build-smoke.test.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `SITE`, `ADR-0018`, `ADR-0018` to the rest of the system?**
  _1321 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed-cms.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054069938289744345 - nodes in this community are weakly interconnected._
- **Should `penyaji.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05379746835443038 - nodes in this community are weakly interconnected._
- **Should `plan.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.053613053613053616 - nodes in this community are weakly interconnected._