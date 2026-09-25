🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](README.md)

<!-- i18n-source-hash: sha256:5f140aacd2afa01fc5645a99437f82d61d47f82d81dcd9b63c1ef3f42815bcab -->

[![CI](https://github.com/ahliweb/awcms-one/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ahliweb/awcms-one/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE) [![runtime](https://img.shields.io/badge/runtime-Bun-blue?logo=bun&logoColor=white)](https://bun.sh)

# awcms-one

**OMES** adalah deployment yang dibuat dari template [awcms-one](https://github.com/ahliweb/awcms-one) — Bun, Astro, dan PostgreSQL dengan row-level security. Profil build-nya adalah `landing` dan domain kanoniknya adalah `omes.ahlikoding.com` (lihat [`docs/template.md`](docs/template.id.md)).

## Letak repo ini di keluarga AWCMS

| | |
| --- | --- |
| **Repo ini** | `ahliweb/awcms-one` — monorepo Bun: satu backend commerce/berita (`apps/cms`), satu storefront publik (`apps/storefront`), satu kontrak DTO bersama (`packages/kontrak`) |
| **Backend / system of record** | `apps/cms`, di repo ini — `ahliweb/awcms` disematkan utuh lewat `git subtree`, menjaga riwayat upstream tetap ada |
| **Repo model** | [`ahliweb/media-lenterakalteng`](https://github.com/ahliweb/media-lenterakalteng) — tata letak workspace, gerbang audit, konvensi changeset, dan struktur dokumen governance di repo ini diadaptasi darinya |

## Kenapa `apps/cms` menyematkan `awcms` utuh

Modul commerce yang dibutuhkan platform ini tidak bisa berdiri sendiri — ia bergantung pada infrastruktur bersama `awcms` yang tidak punya paket mandiri: `withTenant` (konteks tenant RLS), `authorizeInTransaction` (RBAC/ABAC), `appendDomainEvent` (outbox), `recordAuditEvent`, `_shared/module-contract` (`defineModule`), `getDatabaseClient`, runner migrasi SQL, dan `_shared/api-response`. Jadi `awcms` disematkan utuh, lewat `git subtree`, alih-alih dijadikan dependency sebagai paket — lihat [`AGENTS.md`](AGENTS.md#the-subtree-embed) untuk mekanika sinkronisasi dan satu aturan yang melindunginya.

## Gunakan sebagai template

Repositori ini dibuat dari template [`ahliweb/awcms-one`](https://github.com/ahliweb/awcms-one) menggunakan `bun run template:init` milik template itu sendiri — lihat [`docs/template.md`](https://github.com/ahliweb/awcms-one/blob/main/docs/template.md) repositori tersebut untuk panduannya dan [ADR-0018](https://github.com/ahliweb/awcms-one/blob/main/docs/adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.md) untuk keputusan desain di baliknya.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [`docs/status.md`](docs/status.id.md) | Referensi keadaan-terkini: apa yang ada per permukaan, apa yang belum — mulai di sini untuk "apa yang sungguh ada hari ini" |
| [`AGENTS.md`](AGENTS.md) | Kontrak kerja repo ini — dibaca sebelum melakukan apa pun, manusia maupun agen |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Penyiapan, alur kerja, konvensi branch/commit, Definition of Done |
| [`SECURITY.md`](SECURITY.md) | Cara melaporkan kerentanan, dan permukaan serangan repo ini hari ini |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Peran, alur keputusan, rilis |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Perilaku yang diharapkan |
| [`SUPPORT.md`](SUPPORT.md) | Ke mana pertanyaan atau laporan bug diarahkan |
| [`CHANGELOG.md`](CHANGELOG.md) | Riwayat rilis, dilipat dari changeset — riwayat per-increment yang tidak lagi dibawa README ini |
| [`.changesets/README.md`](.changesets/README.md) | Cara menulis catatan perubahan |
| [`knowledge/README.md`](knowledge/README.md) | Workflow graf pengetahuan Graphify + Obsidian yang terfederasi |
| [`docs/README.md`](docs/README.id.md) | Referensi arsitektur, skema, API, CMS, routing, SEO, aksesibilitas, responsif, UI/UX, pengujian, deployment, alur kerja, dan template, plus [`docs/adr/`](docs/adr/README.md) |

## Menjalankan secara lokal

```bash
cp .env.example .env
bun install
bun test               # rangkaian gerbang akar — lihat "Gerbang" di bawah
```

Repo ini **hanya-Bun**: Bun adalah runtime sekaligus package manager, versinya dipin di `packageManager`/`engines.bun`, dan `bun.lock` adalah satu-satunya lockfile.

| Perintah | Kegunaan |
| --- | --- |
| `bun install` | Meresolusi seluruh workspace |
| `bun test` | Rangkaian gerbang akar. `bunfig.toml` mengecualikan `apps/cms/**` — rangkaian itu ~500 berkas dan butuh PostgreSQL hidup; ia berjalan di bawah gerbangnya sendiri, `bun run check:cms` |
| `bun run check:lockfile` | Membuktikan `bun.lock` benar-benar milik `package.json` repo ini, untuk akar dan setiap anggota workspace |
| `bun run check:cms` | Rangkaian gerbang penuh `apps/cms` sendiri (53 langkah — lint, docs, inventaris, spec, gerbang, typecheck, tesnya sendiri, build-nya sendiri) |
| `bun run db:up` / `db:down` / `db:reset` | Menyalakan/mematikan/mereset `postgres:18.4` lokal sekali-pakai (`compose.yaml`) |
| `bun run db:migrate:cms` | Menjalankan migrasi `apps/cms` terhadap `DATABASE_URL` — lihat `apps/cms/.env.example` |
| `bun run db:seed:cms` | Men-seed tenant `borneojek-mart`, katalog, permukaan marketing, dan contoh pesanan lewat API publik `apps/cms` sendiri — lihat [`docs/deployment.md`](docs/deployment.id.md) |
| `bun run deploy:preflight` | Preflight produksi fail-closed — bentuk env build storefront, lalu mendelegasikan ke `commerce:deploy:preflight` milik `apps/cms` sendiri — lihat [`docs/deployment.md`](docs/deployment.id.md) dan ADR-0019 |
| `bun run release` | Memotong rilis bertag dari changeset yang menunggu — lihat [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| `dev` / `build` / `check` / `serve` | Mendelegasikan ke `apps/storefront` — `bun run build` men-type-check, mengambil konten katalog/marketing/berita dari `apps/cms` saat build, dan memanggang output statis termasuk CSP turunan; `bun run serve` menjalankan `apps/storefront/server/penyaji.mjs` yang sudah di-build. Ketiga perintah saat-build ini menuruti `SITE_PROFILE` (default `toko`) — lihat [`docs/deployment.md`](docs/deployment.id.md) |
| `bun run template:init` | Inisialisasi merek/profil yang idempoten untuk repo turunan — lihat [`docs/template.md`](docs/template.id.md) |

## Arsitektur sekilas

```
apps/
├── cms/                     ahliweb/awcms, disematkan lewat git subtree dengan riwayat penuh —
│                             backend commerce/berita dan system of record, membawa satu modul
│                             commerce (katalog, marketing, pesanan, akun pelanggan, afiliasi,
│                             integrasi provider eksternal — lihat docs/status.md) plus API
│                             anonim dan ber-bearer /api/v1/commerce/storefront/* serta route
│                             intake webhook publik
└── storefront/              storefront Astro publik — output: "static" di seluruh bagian,
                              dibangun per SITE_PROFILE; keranjang/checkout dan permukaan akun
                              memanggil API storefront apps/cms langsung dari browser
                              (ADR-0007, ADR-0016)
packages/
├── config/                  preset tsconfig bersama
├── gerbang/                 gerbang audit workspace ini, sebagai paket
└── kontrak/                 kontrak DTO bertipe-saja yang diimpor apps/storefront dari apps/cms,
                              plus gerbang arah-impornya
tools/                       skrip lintas-workspace: rilis, pemeriksaan lockfile, stamp i18n docs,
                              update/combine/export graf pengetahuan, data seed, template:init
tests/                       tes gerbang tingkat akar (docs, changeset, toolchain, skrip,
                              arah impor)
docs/                        referensi arsitektur, skema, API, CMS, routing, SEO, aksesibilitas,
                              responsif, UI/UX, pengujian, deployment, alur kerja, dan
                              template, plus docs/adr/ dan docs/status.md
knowledge/                   workflow graf pengetahuan Graphify + Obsidian yang terfederasi
.claude/skills/               awcms-one-storefront, awcms-one-commerce, awcms-one-template —
                              panduan cara menambah halaman storefront, tabel/endpoint
                              commerce, atau memulai aplikasi baru dari template ini
.changesets/, .github/       tetap di akar repo — keputusan tentang repo secara keseluruhan
```

PostgreSQL hidup dan tersedia ada untuk pengembangan lokal dan CI (`compose.yaml`, `bun run db:up`/`db:migrate:cms`/`db:seed:cms`, job CI `check-cms`), dan topologi produksi nyata juga sudah ada (`compose.production.yaml`, `bun run deploy:preflight` yang fail-closed, ADR-0019) — lihat [`docs/deployment.md`](docs/deployment.id.md) untuk kedua urutannya, [`docs/arsitektur.md`](docs/arsitektur.id.md) untuk topologi lengkap dan desain trust-tier-nya, dan [`docs/status.md`](docs/status.id.md) untuk apa yang ada hari ini, per permukaan, dan apa yang belum.

## Gerbang

`bun test` plus empat skrip `audit:*` berjalan tanpa syarat di setiap push, tidak butuh build, jaringan, atau `apps/cms`. Job `Check` adalah **matriks atas tiga profil build** — `Check (toko)`, `Check (berita)`, `Check (landing)` — tiap kaki men-type-check dan menjalankan profile-smoke-test `apps/storefront` di bawah `SITE_PROFILE` masing-masing; tes akar dan skrip `audit:*` berjalan sekali, di kaki `toko`. Job CI kedua, `check-cms`, menjalankan rangkaian gerbang penuh `apps/cms` sendiri plus rangkaian integrasi ber-gerbang-DB-nya terhadap PostgreSQL hidup yang sekali-pakai — lihat [`docs/alur-kerja-pengembangan.md`](docs/alur-kerja-pengembangan.id.md). **`Check (toko)`, `Check (berita)`, `Check (landing)`, dan `check-cms` semuanya adalah status check wajib di `main`.** Sebuah workflow keempat, `.github/workflows/template-init-smoke.yml`, menjalankan matriks `bun run template:init` atas ketiga profil ke dalam salinan sementara repo, plus satu leg `root-suite` yang menjalankan suite tes derived-repository penuh sekali; **keempat leg-nya juga adalah status check wajib.** Begitu pula workflow kelima, `.github/workflows/e2e.yml` — matriks Playwright atas ketiga profil yang sama (checkout, popup iklan, aksesibilitas axe-core, pemeriksaan responsif/overflow); **ketiga leg `e2e` menjadi status check wajib pada issue #215**, setelah rekam jejak jalan pasca-perkenalannya tidak menunjukkan kegagalan e2e.

| Gerbang | Yang ditangkapnya |
| --- | --- |
| `bun run audit:dokumen` | Tautan markdown mati; indeks ADR yang tidak lengkap di salah satu arah atau membawa baris duplikat; jalur berkas dalam backtick yang tidak ada di repo ini; kutipan `ADR-NNNN` yang tidak menuju ke mana pun; angka yang dieja yang tidak cocok dengan set yang diklaimnya dihitung |
| `bun run audit:rilis` | Backlog `.changesets/` yang menunggu melewati batasnya — 20 berkas atau 14 hari |
| `bun run audit:translation` | Cermin Indonesia (`<nama>.id.md`) yang hash sumber tercatatnya tidak lagi cocok dengan sumber Inggrisnya, atau dokumen governance tanpa cermin sama sekali |
| `bun run audit:graf` (alias: `knowledge:check`) | Korpus graf pengetahuan akar (graphify-out/) menggambarkan dirinya sendiri secara jujur, termasuk bahwa korpus tidak melenceng lebih dari `MAX_STALE_FILES` (40) berkas dari pohon yang digambarkannya — lihat [`knowledge/README.md`](knowledge/README.md) |
| `bun test` | Rangkaian tes gerbang akar — `tests/*.test.mjs` — plus tes unit/build-smoke/route milik `apps/storefront` sendiri |
| `check-cms` (job CI) | Rangkaian `bun run check` ~53 langkah `apps/cms` sendiri, lalu rangkaian `tests/integration/`-nya terhadap PostgreSQL hidup yang termigrasi sungguhan |

`.github/workflows/codeql.yml` (analisis CodeQL `security-extended` milik GitHub, plus jadwal mingguan) juga berjalan di setiap push dan PR; context status-job-nya, `Analyze (javascript-typescript)`, menjadi status check wajib pada issue #214 — lihat "CI: workflow kelima, kini wajib — `codeql`" di `docs/alur-kerja-pengembangan.md` untuk alasan memilih context itu, bukan check `CodeQL` hasil code-scanning yang bersebelahan. Dua workflow lagi berjalan di setiap push tapi **bukan** status check wajib: `.github/workflows/images.yml` (mempublikasikan image `runtime`/`jobs` milik `apps/cms` ke GHCR dengan SBOM dan provenance, pada tag versi atau dispatch), dan `.github/workflows/release.yml` (mempublikasikan GitHub Release dari bagian `CHANGELOG.md` sebuah tag versi yang di-push). Lihat komentar `template-init-smoke.yml` sendiri untuk jalur promosi yang diikuti sebuah workflow begitu ia sudah berjalan hijau untuk sementara waktu, dan [`docs/README.md`](docs/README.id.md) untuk indeks dokumentasi lengkap.

## Bahasa

Bahasa Inggris di jalur telanjang adalah sumber otoritatif; Bahasa Indonesia di `<nama>.id.md` adalah cerminnya, dan ia mencatat hash dari bahasa Inggris yang diterjemahkannya. `bun run audit:translation` gagal saat sebuah cermin menjadi basi. Cermin dokumen ini adalah [`README.id.md`](README.id.md).

Kode repo ini sendiri (`packages/gerbang/`, `tools/`, `tests/`) ditulis dalam bahasa Inggris sepenuhnya — identifier, komentar, maupun pesan gerbang. `apps/cms` membawa konvensinya sendiri yang terpisah sebagai kode `ahliweb/awcms` yang disematkan; repo ini tidak mengatur atau mengubahnya.

## Lisensi

[MIT](LICENSE) untuk kode di repo ini. `apps/cms` membawa lisensi dan notice hak cipta `ahliweb/awcms` sendiri sebagai bagian dari riwayat yang disematkan; lihat `LICENSE` workspace itu sendiri.
