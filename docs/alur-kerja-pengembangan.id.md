🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](alur-kerja-pengembangan.md)

<!-- i18n-source-hash: sha256:d106a261249a2d2b2d6f05dcf51d57542e4df4df0a583ae1e1aa2fb080da10eb -->

# Alur kerja pengembangan

Branching, konvensi changeset buatan-sendiri, pemotongan rilis, dan branch protection GitHub nyata repositori ini — dibaca dari pengaturan live repositori ini sendiri, bukan dari apa yang direncanakan.

## Branching dan PR

Satu branch per issue, dipotong dari `main`; PR kembali ke `main`, berjudul merujuk issue yang ditutupnya. [`CONTRIBUTING.md`](../CONTRIBUTING.md) menamai alur kontribusi lengkap dan Definition of Done di [`AGENTS.md`](../AGENTS.md#definition-of-done) — dokumen ini tidak mengulang keduanya, hanya bagian yang spesifik untuk bagaimana perubahan benar-benar mendarat.

## Branch protection pada `main`

Dibaca dari pengaturan GitHub live `ahliweb/omes-web` sendiri pada 25 Oktober 2026 (issue #23), bukan dari apa yang direncanakan. Pengaturannya sudah diubah setelah issue dibuat, sehingga bukti awal issue ("tanpa proteksi / squash diizinkan") sudah basi — pelajaran yang melahirkan `bun run audit:repo-settings`, perintah yang dijalankan maintainer, membaca endpoint yang sama, dan gagal bila salah satu baris di bawah tidak lagi benar:

```
gh api repos/ahliweb/omes-web
gh api repos/ahliweb/omes-web/branches/main/protection
gh api repos/ahliweb/omes-web/rulesets
```

| Pengaturan | Nilai |
| --- | --- |
| Metode merge | Merge commit **diizinkan**; squash **mati**; rebase **mati** (`allow_merge_commit=true`, `allow_squash_merge=false`, `allow_rebase_merge=false`). `delete_branch_on_merge` aktif |
| Status check wajib | Dua belas context: `Check (toko)`, `Check (berita)`, `Check (landing)`, `check-cms`, `template-init-smoke (toko)`, `template-init-smoke (berita)`, `template-init-smoke (landing)`, `template-init-smoke (root-suite)`, `e2e (toko)`, `e2e (berita)`, `e2e (landing)`, `Analyze (javascript-typescript)` — semuanya dilaporkan GitHub Actions. Daftarnya ada di satu tempat, `packages/gerbang/lib/repo-settings-policy.mjs`, dan `tests/repo-settings-policy.test.mjs` membuktikan setiap entri adalah nama job nyata di `.github/workflows/` |
| Strict (branch harus mutakhir sebelum merge) | Ya |
| Review wajib | **1 review persetujuan**; persetujuan basi dibatalkan saat ada push baru; review code-owner tidak wajib; persetujuan atas push terakhir tidak wajib |
| Resolusi percakapan wajib | Ya |
| Enforce untuk admin | **Ya** — administrator tidak bisa merge melewati check yang merah atau tertunda, atau review yang belum ada |
| Force push / penghapusan branch | Ditolak / ditolak |
| Required linear history | **Tidak, dengan sengaja** — itu melarang merge commit sungguhan yang menjadi dasar model subtree riwayat-lengkap (lihat "Penyematan subtree" di [`AGENTS.md`](../AGENTS.md#the-subtree-embed)). `audit:repo-settings` gagal bila ada yang menyalakannya |
| Tanda tangan wajib | Tidak |
| Lock branch | Tidak |
| Ruleset repositori | **Tidak ada** (`gh api repos/ahliweb/omes-web/rulesets` mengembalikan `[]`). Repositori ini dimiliki pengguna, jadi ruleset organisasi pun tidak berlaku. Bila ada yang ditambahkan, `audit:repo-settings` gagal tertutup pada ruleset aktif mana pun yang mencantumkan bypass actor |

### Kebijakan bypass yang berlaku

Tidak ada. `enforce_admins` aktif dan tidak ada ruleset, jadi tidak ada aktor — termasuk pemilik — yang bisa push ke `main` atau merge PR melewati aturan di atas. Satu-satunya jalan melewatinya adalah mengubah pengaturannya sendiri, yaitu prosedur break-glass di bawah, bukan yang lain.

### Arti satu review wajib dengan satu maintainer

GitHub tidak mengizinkan penulis menyetujui PR-nya sendiri. Dengan satu maintainer, review wajib karena itu **memblokir setiap PR yang dibuka maintainer** sampai akun kedua menyetujuinya — kolaborator, atau akun bot reviewer yang ditambahkan sebagai kolaborator. Ini pertukaran yang disengaja: proteksi yang menjamin tak seorang pun (termasuk otomasi yang memegang token maintainer) bisa memasukkan perubahan tanpa review ke `main` adalah proteksi yang sama yang membuat maintainer menunggu reviewer. Jangan "memperbaiki" penantian itu dengan menurunkan jumlahnya atau mematikan `enforce_admins`; tambahkan reviewer, atau pakai prosedur break-glass bila menunggu tidak terjangkau. `audit:repo-settings` gagal bila jumlahnya turun di bawah 1.

### Metode merge dan jebakan subtree

GitHub tidak bisa membatasi metode merge ke PR yang menyentuh satu path, jadi aturan bahwa PR sinkronisasi subtree harus di-merge dengan merge commit ([ADR-0001](adr/0001-git-subtree-with-full-history-for-apps-cms.md)) ditegakkan di seluruh repositori: squash dan rebase dimatikan, dan tombol merge hanya menawarkan merge commit. Branch protection saja tidak membatasi metode merge, itulah sebabnya pengaturan repositori ikut diaudit di samping proteksinya.

### Memeriksanya

```
bun run audit:repo-settings                 # live: butuh `gh` masuk sebagai ADMIN repositori
bun run audit:repo-settings --from <dir>    # fixture: repo.json, protection.json, rulesets.json
bun run audit:subtree --require-remote      # riwayat, bukan pengaturan — lihat di bawah
```

`audit:repo-settings` keluar `0` bila setiap baris benar, `1` bila ada pengaturan yang salah, dan `2` bila pengaturan tidak bisa dibaca (tanpa `gh`, belum masuk, bukan admin, luring). **Exit `2` adalah kegagalan, bukan lulus**: pengaturan yang tak terbaca tidak dianggap patuh. Membaca branch protection butuh hak administrator repositori, yang tidak dimiliki `GITHUB_TOKEN` sebuah workflow, jadi audit ini **dijalankan maintainer** — setelah setiap perubahan pengaturan, pada setiap pemotongan rilis, dan bulanan — bukan langkah CI.

### Ancestry subtree: `governance.yml` dan `audit:subtree`

Pengaturan mencegah squash ditawarkan; ia tidak bisa menunjukkan bahwa riwayat di bawahnya masih sehat. `bun run audit:subtree` (`tools/subtree-ancestry-check.mjs`) membaca riwayatnya sendiri, terhadap satu catatan yang bisa dibaca mesin, [`ops/awcms-subtree.json`](../ops/awcms-subtree.json), yang menyimpan commit upstream tempat `apps/cms` terakhir disinkronkan. Ia memeriksa bahwa:

- `lastSyncCommit` yang tercatat adalah leluhur `HEAD`, dan `git merge-base HEAD awcms/main` sama dengannya — sehingga sinkronisasi yang masuk tanpa memperbarui catatan (merge base lebih baru dari catatan) dan sinkronisasi yang di-squash/rebase (catatan tidak berada di jalur menuju upstream) sama-sama tertangkap;
- remote `awcms`, bila ada, hanya mengambil `main`, memiliki `tagOpt --no-tags`, dan menunjuk ke upstream yang tercatat;
- setiap tag lokal cocok dengan pola produk (`^v\d+\.\d+\.\d+$`) dan tak satu pun menunjuk ke dalam riwayat upstream sendiri (leluhur `lastSyncCommit`), yang merupakan ciri tag rilis upstream yang terimpor oleh fetch biasa;
- klon tidak dangkal (ancestry tidak bisa dinilai dari klon dangkal; pemeriksaan menolak, bukan menebak).

**Setiap PR sinkronisasi subtree memperbarui `ops/awcms-subtree.json` di perubahan yang sama**; sinkronisasi belum selesai sebelum itu, dan audit akan mengatakannya. Audit berjalan di [`.github/workflows/governance.yml`](../.github/workflows/governance.yml) pada pull request, push ke `main`, jadwal mingguan, dan dispatch manual (checkout riwayat penuh, remote upstream ditambahkan dipersempit dan `--no-tags`). **`governance / subtree-ancestry` dalam masa percobaan dan BELUM menjadi status check wajib**; ia dipromosikan hanya setelah riwayat run pasca-pengenalan menunjukkan tidak ada kegagalan palsu, jalur yang sama dengan `e2e` dan `template-init-smoke` — dan promosinya adalah perubahan terpisah pada proteksi `main` ditambah `EXPECTED_REQUIRED_CONTEXTS`. Ia sengaja tetap di luar `bun test` akar yang telanjang: butuh riwayat penuh dan ref upstream yang sudah di-fetch, sehingga tes unitnya (`tests/subtree-ancestry.test.mjs`) membangun repositori git sekali pakai.

### Prosedur break-glass

Untuk keadaan darurat yang tidak bisa menunggu review — `main` rusak, rahasia bocor yang perlu perbaikan dalam satu jam — dan hanya itu:

1. **Siapa.** Pemilik repositori (administrator pengaturan). Tak seorang pun selain itu, dan tidak ada otomasi.
2. **Utamakan tidak menyentuh aturan.** Buka PR dan minta kolaborator menyetujuinya, atau revert commit bermasalah lewat PR biasa. Pengaturan hanya diubah bila keduanya tidak sempat.
3. **Catat dulu.** Sebelum mengubah apa pun, buka issue berjudul `break-glass: <alasan>` yang menyebut waktu, alasan, dan persis pengaturan mana yang akan diubah, lalu simpan keluaran `gh api repos/ahliweb/omes-web/branches/main/protection` ke issue itu. Keluaran itu adalah bukti apa yang harus dipulihkan.
4. **Ubah seminimal mungkin, selama sesingkat mungkin.** Turunkan hanya satu pengaturan yang menghalangi (biasanya `required_approving_review_count`, atau `enforce_admins` untuk check wajib yang merah). Jangan pernah mengaktifkan squash atau rebase, jangan menyalakan linear history, dan jangan menyentuh force-push atau penghapusan.
5. **Masukkan perbaikannya** sebagai PR dengan merge commit, menautkan issue.
6. **Pulihkan segera,** dari keluaran yang disimpan, lalu jalankan `bun run audit:repo-settings` dan tempel `OK — no violations.` ke issue. Break-glass belum selesai sebelum audit itu hijau.
7. **Tutup issue dengan catatan singkat** mengapa jalur normal tidak berhasil, dan apa yang akan membuatnya berhasil lain kali.

### Memulihkan ancestry subtree

Bila PR sinkronisasi subtree pernah di-squash atau di-rebase — `audit:subtree` gagal dengan "not an ancestor of HEAD" atau "ancestry broken", atau `git subtree pull` berikutnya berbenturan terhadap riwayat yang tidak bisa disejajarkan git — perbaiki sebelum sinkronisasi apa pun berikutnya:

1. **Berhenti menyinkronkan.** Jangan menutupinya dengan merge manual; menumpuk sinkronisasi di atas dasar yang rusak mengubur masalahnya.
2. **Revert PR yang di-squash** di sebuah branch (`git revert <commit squash>`) dan merge revert itu sebagai PR biasa dengan merge commit. Pohon `apps/cms` kembali ke sinkronisasi sebelumnya.
3. **Pastikan ancestry** kembali: `git fetch awcms main`, `git merge-base HEAD awcms/main` adalah commit sinkronisasi sebelum squash, dan `ops/awcms-subtree.json` menamainya. Bila catatan sempat dimajukan oleh PR yang di-squash, revert memulihkannya.
4. **Ulangi sinkronisasi** dari dasar yang dipulihkan: `git subtree pull --prefix=apps/cms awcms main` di sebuah branch, perbarui `ops/awcms-subtree.json` ke commit upstream baru di PR yang sama, dan merge dengan **merge commit**.
5. **Jalankan ulang `bun run audit:subtree --require-remote`** dan `bun run audit:repo-settings`. Bila ternyata merge squash atau rebase sempat diaktifkan kembali, perbaiki pengaturan itu lebih dulu — itulah cara hal ini terjadi.
6. **Bila merge base sudah hilang** (pull tidak menemukan leluhur bersama): jalankan merge ancestry satu kali seperti dijelaskan di "Penyematan subtree" pada [`AGENTS.md`](../AGENTS.md#the-subtree-embed) — `git merge -s ours --allow-unrelated-histories <commit awcms yang cocok dengan apps/cms>`, setelah memastikan pohonnya cocok — lalu lanjutkan dari langkah 4.

Jangan pernah force-push `main` untuk memperbaiki ini; proteksi menolaknya, dan perbaikannya selalu perubahan maju.

## Changeset buatan-sendiri, bukan `@changesets/cli`

Perubahan yang memengaruhi perilaku publik, struktur workspace, dependensi, atau deployment mendapat berkas di [`.changesets/`](../.changesets/README.md) dalam perubahan yang sama yang menyebabkannya: `YYYY-MM-DD-ringkasan-dalam-kebab-case.md`, dengan frontmatter `bump: major | minor | patch` dipilih saat menulis perubahan, karena itu satu-satunya momen siapa pun secara andal tahu jawabannya. `bun run audit:rilis` mengawasi backlog yang menunggu dan memerah begitu melewati 20 berkas atau 14 hari usianya — sinyal bahwa rilis sudah waktunya, bukan kesalahan.

## Pengiriman berbasis wave, di epic ini

Increment 2 (epic #21) dikirimkan sebagai rangkaian PR atomik satu-issue, bukan satu perubahan besar: gelombang pertama pekerjaan fondasi independen (perbaikan `check:cms` #22, chrome storefront #24, PostgreSQL lokal + seed + `check-cms` #25), lalu pasangan CMS/storefront yang harus diserialisasi terhadap modul yang sama (katalog `commerce` #23 → marketing #26 → orders/customers #29 di sisi `apps/cms`; chrome #24 → berita #28 → katalog #27 → checkout #30 di sisi `apps/storefront`, masing-masing bergantung pada berkas bersama dari issue sebelumnya), dengan issue dokumentasi ini (#31) berjalan terakhir karena ia satu-satunya yang harus melihat setiap issue lain di-merge sebelum bisa mendeskripsikan tree secara jujur. Setiap PR menamai bagian "Notes/Deviations/Decisions for #31"-nya sendiri khusus agar refresh ini tidak perlu menurunkannya ulang dari diff.

## Pemotongan rilis

`bun run release` (aksi maintainer, [`tools/rilis.mjs`](../tools/rilis.mjs)) melipat setiap changeset yang menunggu ke `CHANGELOG.md`, memakai `bump` **terbesar** di antara mereka untuk memutuskan versi berikutnya — satu `minor` di samping sembilan entri `patch` membuat seluruh rilis `minor`, jadi ukuran rilis adalah konsekuensi dari apa yang masuk ke dalamnya, bukan penilaian yang dibuat saat rilis dari daftar nama berkas. `--commit` tambahan menandai `vX.Y.Z`. Issue #31 (refresh dokumentasi ini) tidak memotong rilis itu sendiri — lihat [`.changesets/README.md`](../.changesets/README.md) untuk batas backlog dan bagian "Gates" `README.md` untuk `audit:rilis`.

Mendorong (push) tag itulah yang benar-benar mempublikasikannya (issue #181). [`.github/workflows/release.yml`](../.github/workflows/release.yml) terpicu pada `push: tags: ['v*']`, mengekstrak bagian `CHANGELOG.md` versi yang di-push memakai [`tools/rilis-catatan.mjs`](../tools/rilis-catatan.mjs), lalu membuat GitHub Release darinya memakai `GITHUB_TOKEN` — ditandai "latest" hanya bila tag itu adalah semver `v*` tertinggi di repositori. Workflow yang sama juga menerima `workflow_dispatch` dengan input `tag` yang wajib diisi, menjalankan `gh release edit` secara idempoten alih-alih gagal ketika tag itu sudah punya Release — cara untuk mem-backfill tag yang di-push sebelum workflow ini ada, atau menerbitkan ulang catatannya setelah ada koreksi di `CHANGELOG.md`.

## CI: dua job — satu tanpa syarat, satu terhadap basis data nyata

`.github/workflows/ci.yml` mendefinisikan dua job.

**`check`** (`name: Check`, `timeout-minutes: 15`) berjalan pada setiap push ke `main`, setiap pull request, dan dispatch manual, tidak butuh build, tidak butuh `apps/cms` hidup, dan tidak butuh basis data. Sejak increment 6 (issue #137, [ADR-0018 D7](adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.id.md)), ia adalah **matriks 3-leg** (`strategy.matrix.profile: [toko, berita, landing]`, `fail-fast: false`) — GitHub menampilkan tiap leg sebagai `Check (toko)`, `Check (berita)`, `Check (landing)`. Setiap leg menjalankan `bun run check:lockfile`, `bun install --frozen-lockfile`, lalu `SITE_PROFILE=<leg> bun run check` (type-check storefront yang mencakup `src/profil/**` tanpa memandang group mana yang aktif) dan `cd apps/storefront && SITE_PROFILE=<leg> bun test tests/profil-build-smoke.test.ts tests/profil-routes.test.ts` — build milik leg itu sendiri terhadap stub CMS, membuktikan group halaman yang dikecualikan sungguh-sungguh absen dari `dist/` dan sitemap. `bun test` root, `audit:dokumen`, `audit:translation`, `audit:graf`, `audit:rilis`, dan `bun audit --audit-level=low` tidak bergantung pada profil, jadi ia berjalan **sekali saja, di leg `toko`** (`if: matrix.profile == 'toko'`), tanpa `SITE_PROFILE` diatur — di langkah itu, `profil-build-smoke` sendiri membangun ketiga profil, jadi leg `toko` sendiri sudah membuktikan seluruh matriks. Tidak ada apa pun di job ini yang membangun image container atau men-deploy apa pun.

**`check-cms`** (`name: check-cms`, `needs: check`, `timeout-minutes: 20`) berjalan terhadap container layanan `postgres:18.4` nyata (`POSTGRES_USER=awcms`, `POSTGRES_DB=awcms`, port 5432, health-checked dengan `pg_isready`):

1. `bun install --frozen-lockfile` di root.
2. `cd apps/cms && DATABASE_URL="" bun run check` — rantai penuh ~53 langkah (lint, docs/i18n, setiap gate registry/konsistensi, typecheck, `bun test` dengan setiap suite ber-gate-DB skip bersih, `bun run build`).
3. `DATABASE_URL=postgres://awcms:awcms_ci_password@127.0.0.1:5432/awcms` ditulis ke `$GITHUB_ENV`, lalu `bun run db:migrate:cms` menerapkan setiap migrasi ke basis data layanan yang segar.
4. `cd apps/cms && bun test tests/integration/ --timeout 60000` — suite integrasi ber-gate-DB, kini benar-benar berjalan (lebih dari 670 tes per PR orders/customers).
5. Langkah job-summary (`if: always()`) meng-grep jumlah `N skip` dari kedua berkas log dan melaporkan jumlah skip ber-gate-DB sebelum/sesudah, sehingga reviewer bisa melihat suite itu benar-benar berjalan, bukan diam-diam skip dua kali.

Ketiga leg `Check` dan `check-cms` semuanya status check wajib di `main` (lihat "Branch protection pada `main`" di atas) — ini menutup celah yang dideskripsikan draf dokumen ini sebelumnya: rantai gate `apps/cms` sendiri, dan cakupan RLS/basis datanya, berjalan di CI repositori INI sendiri pada setiap PR, tidak hanya lokal.

## CI: workflow ketiga, kini wajib — `template-init-smoke`

`.github/workflows/template-init-smoke.yml` (issue #138) adalah berkas workflow TERPISAH, bukan job ketiga di `ci.yml` — berkas itu dimiliki oleh perubahan lain yang sejak itu landing (issue #137), dan cakupan workflow ini sendiri meminta berkas baru alih-alih job yang ditempelkan ke sana. **Keempat leg-nya — `template-init-smoke (toko)`, `template-init-smoke (berita)`, `template-init-smoke (landing)`, `template-init-smoke (root-suite)` — menjadi status check wajib pada issue #182 (22 September 2026)**, mengikuti pola promosi yang sama yang dilalui `check-cms` sendiri (lihat "Branch protection pada `main`" di atas): dipromosikan hanya setelah berjalan hijau di `main` untuk sementara waktu, DAN hanya setelah setidaknya tiga run berturut-turut terhadap kondisi kode yang sama semuanya hijau lebih dulu (kriteria penerimaan issue #147 sendiri — lihat di bawah untuk alasan batas itu ada).

**Bentuk sejak issue #147.** Workflow aslinya menjalankan `bun test` root penuh — termasuk setiap tes build-smoke storefront, yang masing-masing memulai stub CMS-nya sendiri dan `astro build`-nya sendiri — satu kali per leg matriks, sehingga tiga salinan suite itu berebut CPU/IO runner dua-core yang sama secara bersamaan. Dua run `main` berturut-turut masing-masing gagal pada langkah `Root bun test` milik leg yang BERBEDA, pada tenggat mulai-stub tes build-smoke yang BERBEDA pula — perebutan sumber daya, bukan cacat profil yang nyata, tetapi justru jenis kegagalan sesekali yang membuat status "wajib" tidak bisa dipercaya. Perbaikannya adalah pemisahan tanggung jawab, bukan tenggat yang diperbesar:

- **Job matriks `template-init-smoke`** (`toko`/`berita`/`landing`, ADR-0018 D2) tetap menjalankan hal yang sungguhan per profil: `bun run template:init --profil <profile> --yes` terhadap checkout-nya sendiri (`TEMPLATE_INIT_TEST_SCOPE=root` menjaga `bun test` akhir milik alat itu sendiri tetap tercakup pada tes gate akar saja, bukan seluruh workspace), memulai stub CMS milik storefront (PID-nya ditulis ke berkas agar langkah berikutnya selalu bisa menemukan dan mematikannya), menjalankan `SITE_PROFILE=<profile> bun run build` dari `apps/storefront`, lalu `bun scripts/assert-profil-dist.ts` — pemeriksaan deterministik atas `dist/client` yang SAMA yang sudah dibangun (berkas/direktori grup yang dikecualikan tidak ada, grup yang aktif ada, tidak ada entri sitemap atau tautan halaman terbangun yang menyeberang ke rute yang dikecualikan), diturunkan dari `apps/storefront/src/config/profil.ts` dengan cara yang sama seperti `apps/storefront/tests/profil-build-smoke.test.ts`/`apps/storefront/tests/profil-routes.test.ts`, tetapi tanpa memicu build KEDUA seperti yang terjadi bila kedua berkas tes itu dijalankan lagi. Langkah `if: always()` di akhir mematikan PID stub itu dan, `if: failure()`, mencetak `/tmp/stub-awcms.log`.
- **Job `root-suite` terpisah**, tanpa matriks, menjalankan `template:init --profil toko` (lagi-lagi `TEMPLATE_INIT_TEST_SCOPE=root`) lalu `bun test` penuh TEPAT SATU KALI, di runner-nya sendiri tanpa apa pun lain yang berebut CPU. Inilah kini satu-satunya tempat di seluruh workflow ini di mana suite derived-repository penuh berjalan.

Dua detail menjaga rantai gate workflow ini sendiri tidak gagal terhadap dirinya sendiri. Pertama, probe kesiapan stub CMS memeriksa **dengan bearer token** (`curl -sf -H "Authorization: Bearer stub" http://localhost:4310/api/v1/commerce/products`) — stub menjawab `401` untuk request tanpa autentikasi memang disengaja (`apps/storefront/scripts/stub-awcms.mjs`), dan `curl -f` polos akan membaca `401` itu sebagai "belum siap" selamanya. Kedua, `tests/template-init.test.mjs` melewati dirinya sendiri begitu mendeteksi ia tidak lagi berjalan di dalam `awcms-one` (`package.json.name !== "awcms-one"`) — tanpa guard itu, `bun test` akhir milik sebuah run `template:init` akan menemukan dan menjalankan ulang berkas tesnya sendiri di dalam repositori yang baru saja diinisialisasinya, yang tes full-run-nya kemudian mencoba membangun salinan sementara lain dari `git ls-files`, yang masih mendaftar path yang sudah di-`unlinkSync` (tidak pernah di-`git rm`) oleh langkah penghapusan run itu sendiri, melempar `ENOENT` pada setiap satu darinya.

## CI: workflow keempat, kini wajib — `e2e`

`.github/workflows/e2e.yml` (issue #183) adalah berkas workflow TERPISAH dari `ci.yml`, mengikuti presedan `template-init-smoke.yml` sendiri: suite Playwright browser-sungguhan lebih lambat dan membawa risiko flaky yang berbeda dari type-check atau tes unit, jadi ia diperkenalkan dengan masa percobaan yang disengaja alih-alih langsung wajib. Ia mematriks-kan spec e2e milik `apps/storefront` atas tiga profil build yang sama (`e2e (toko)`, `e2e (berita)`, `e2e (landing)`, `fail-fast: false`), setiap leg membangun satu situs sungguhan terhadap fixture stub CMS yang di-commit (`apps/storefront/tests/e2e/build-and-serve.ts`/`apps/storefront/tests/e2e/global-setup.ts` — tanpa `apps/cms` hidup, tanpa jaringan selain `bun install` dan unduhan Chromium) dan menjalankan: alur checkout dan pop-up iklan, pemeriksaan aksesibilitas axe-core yang gagal pada pelanggaran WCAG 2.1 A/AA `serious`/`critical`, dan pemeriksaan no-horizontal-overflow deterministik pada 360px. Screenshot penuh-halaman (mobile dan desktop, setiap halaman kunci, setiap profil) diunggah sebagai artifact CI untuk dilihat manusia — tidak pernah dibandingkan dengan baseline yang di-commit, karena rendering font lintas-OS membuat baseline byte-level flaky secara konstruksi dan layanan visual-diff yang dihosting adalah dependensi eksternal berbayar yang tidak dimiliki repo ini.

**Ketiga leg-nya menjadi status check wajib pada issue #215 (24 September 2026)**, mengikuti pola promosi yang sama yang dilalui `check-cms` dan `template-init-smoke`: dipromosikan hanya setelah rekam jejak jalan pasca-perkenalan menunjukkan tidak ada kegagalan e2e. Sampel yang ditinjau adalah setidaknya tujuh run hijau berturut-turut setelah issue #183 memperkenalkan workflow itu (#197, #202, #203, #204, #207, #208, #209), dan pemeriksaan lebih luas atas `gh run list --workflow e2e.yml` pada saat promosi tidak menemukan run tambahan di luar sampel itu dalam status apa pun selain sukses (atau masih berjalan). Context persisnya diverifikasi terhadap check PR sungguhan (`gh pr checks`/`gh api .../check-runs`) alih-alih disimpulkan dari berkas workflow, karena GitHub menurunkan context yang ditampilkan job matriks dari `jobs.<id>.name`, bukan dari kunci job.

## CI: workflow kelima, kini wajib — `codeql`

`.github/workflows/codeql.yml` (issue #184, bagian dari epic #179) menjalankan analisis CodeQL milik GitHub atas source JavaScript/TypeScript milik workspace ini sendiri, pada setiap push ke `main`, setiap pull request, jadwal mingguan, dan dispatch manual. `build-mode: none` (ekstraksi source tanpa-build milik CodeQL) menjaga job ini tetap Bun-only — tidak ada `astro build`, tidak ada `apps/cms` hidup, tidak ada kode aplikasi yang pernah dijalankan — dan CodeQL tidak menyediakan ekstraktor Astro, sehingga setiap berkas `.astro` di mana pun dalam workspace berada di luar pemindaian ini terlepas dari `paths-ignore` milik `.github/codeql/codeql-config.yml` sendiri. `apps/cms/**` SOURCE tetap dalam cakupan: itulah kode yang sungguhan berjalan di deployment ini (lihat "Lima permukaan" di [`SECURITY.md`](../SECURITY.md)), meski pohon itu adalah `ahliweb/awcms` upstream yang di-embed lewat subtree (lihat "The subtree embed" di [`AGENTS.md`](../AGENTS.md#the-subtree-embed)); hanya output generated/vendored milik pohon itu yang dikecualikan, dengan syarat sama seperti output setara milik repositori ini sendiri. Query suite-nya adalah `security-extended`, bukan `security-extended,security-and-quality` milik `ahliweb/awcms` upstream sendiri — dipertahankan sengaja lebih sempit, disiplin yang sama dengan yang diterapkan "The gates" di atas untuk menahan `audit:graf`/`check-cms` sampai ada kapasitas untuk menindaklanjutinya.

Temuan mendarat di tab Security → Code scanning milik repositori ini sendiri, terpisah dari pemindaian `ahliweb/awcms` sendiri atas pohon yang sama. Sebuah temuan di bawah `apps/cms/**` ditriase menurut [`SECURITY.md`](../SECURITY.md): diperbaiki di sini hanya jika termasuk salah satu divergensi lokal terdokumentasi milik AGENTS.md atau modul `commerce` milik repositori ini sendiri, selain itu dilaporkan ke (dan diperbaiki di) `ahliweb/awcms` lalu ditarik masuk lewat sinkronisasi subtree biasa. Lihat bagian "Triase CodeQL" di [`SECURITY.md`](../SECURITY.md) untuk catatan triase repositori ini sendiri (issue #206) — alert mana yang di-dismiss dan alasannya, serta dua aturan baku (hash SHA-256 atas token acak berentropi tinggi bukan hash password; PKCE S256 adalah RFC 7636 §4.2) yang tidak boleh dipersoalkan ulang oleh alert serupa di masa depan.

**Dipromosikan menjadi status check wajib pada issue #214 (24 September 2026)**, mengikuti pola probasi-lalu-promosi yang sama yang dilalui `check-cms`, `template-init-smoke`, dan `e2e`: workflow ini berjalan di setiap push dan PR sejak issue #184 tanpa gate status check wajib, sementara issue #206 membangun proses triase sungguhan dan mencatat alasan setiap dismissal, dan dua temuan `js/clear-text-logging` yang bisa ditindaklanjuti diperbaiki dalam kode oleh #205/#208. Riwayat PR pasca-perkenalan yang ditinjau (#194, #196, #197, #200–#204, #207–#209) menunjukkan setidaknya 11 run sukses tanpa kegagalan workflow yang teramati.

**Context wajibnya adalah `Analyze (javascript-typescript)`, bukan check `CodeQL` yang bersebelahan — diverifikasi, bukan disimpulkan, dari check-runs PR sungguhan** (`gh pr checks <n>` dan `gh api repos/ahliweb/awcms-one/commits/<sha>/check-runs`, dibaca terhadap commit *head* PR, karena merge commit hanya membawa check di sisi Actions). GitHub memasang dua check terpisah pada commit yang sama untuk workflow ini:

- **`Analyze (javascript-typescript)`** — app `GitHub Actions` (`app_id` 15368), status job workflow itu sendiri. Ini adalah job yang dinamai di `jobs.analyze.name` milik `codeql.yml`, dan ia melaporkan `failure` setiap kali job itu sendiri error — langkah `Initialize CodeQL` yang rusak, kegagalan ekstraksi, kegagalan action, timeout — terlepas dari apakah SARIF pernah dihasilkan atau diunggah.
- **`CodeQL`** — app `GitHub Advanced Security` (`app_id` 57789), check **hasil** code-scanning. GitHub membuat/memperbarui check ini hanya setelah unggahan SARIF berhasil, dari data alert dalam unggahan itu; ia tidak mengatakan apa pun tentang apakah run analisis itu sendiri selesai.

Kebijakan failure/triase milik issue itu sendiri mensyaratkan sebuah check CodeQL wajib "gagal tertutup untuk kegagalan workflow/analyzer" — temuan itu sendiri tetap memakai semantik severity/triase code-scanning biasa milik GitHub, bukan gate merge. `Analyze (javascript-typescript)` adalah yang benar-benar melakukan ini: ia terikat langsung ke status keluar job workflow itu sendiri, sehingga crash analyzer atau kesalahan konfigurasi melaporkan `failure` (atau tidak pernah selesai, yang juga memblokir check wajib) alih-alih diam-diam tidak meninggalkan check hasil code-scanning sama sekali untuk dievaluasi aturan wajib. `CodeQL`, karena hilir dari unggahan SARIF yang berhasil, tidak bisa membedakan "analisis berjalan bersih" dari "analisis tidak pernah cukup jauh untuk menghasilkan SARIF sama sekali" dalam kasus yang justru penting untuk sebuah gate merge. `Analyze (javascript-typescript)` karena itu ditambahkan ke status check wajib `main`, secara aditif, di samping sebelas context yang sudah dibangun issue #215 (lihat "Branch protection pada `main`" di atas).

## Pembaruan dependensi

`.github/dependabot.yml` (issue #180) membuka pull request pembaruan versi — terpisah dari pembaruan *keamanan* Dependabot, yang sudah aktif sebelumnya (lihat "Branch protection pada `main`" di atas) dan mencakup ekosistem apa pun terlepas dari berkas ini. Satu blok `updates` hari ini:

- **`github-actions`, `directory: "/"`.** Setiap action yang dipin di `.github/workflows/*.yml` — konvensi pin-SHA-plus-komentar-`# vX.Y.Z` yang dijelaskan bagian "Configuration and toolchain" AGENTS.md. Bulanan, dikelompokkan (`github-actions-minor-patch`: minor dan patch bersama dalam satu PR; versi mayor tidak pernah dikelompokkan, karena bisa mengubah perilaku sebuah action dan mendapat PR serta review sendiri), prefix commit `ci(deps)`.

**Tidak ada blok `bun` (issue #199, lanjutan dari #180/#179).** Satu pernah dicoba; run terjadwal pertamanya langsung gagal (run 35858077848): `Unsupported bun.lock 'lockfileVersion' 2 in /bun.lock. The bun version Dependabot runs supports up to 1.` `bun.lock` root repositori ini adalah `lockfileVersion` 2 (format bawaan Bun 1.4), dan menurunkan format lockfile hanya demi menjaga sebuah blok Dependabot tetap bekerja ditolak — itu akan membuat lockfile berlawanan dengan versi Bun yang sudah dipin, alih-alih sebaliknya. Job bulanan yang selalu gagal adalah kebisingan yang menutupi kegagalan sungguhan, jadi bloknya dihapus alih-alih dibiarkan merah selamanya.

**Alur kerja manual yang dipakai repo ini sebagai gantinya, untuk dependensi workspace miliknya sendiri** (`package.json` root, `apps/storefront`, `packages/*` — tidak pernah `apps/cms`, yang adalah `ahliweb/awcms` yang di-embed lewat `git subtree`, bagian "The subtree embed" AGENTS.md: upstream memiliki set dependensinya sendiri dan mengirimkan `apps/cms/.github/dependabot.yml`-nya sendiri, tidak aktif di repo ini karena GitHub hanya membaca berkas konfigurasi di root repositori, dan sebuah PR pembaruan versi yang dibuka di sini terhadap `apps/cms/package.json` akan mengubah kode yang bisa di-overwrite atau dikonflikkan diam-diam oleh `git subtree pull` di masa depan):

1. `bun update` di root repositori (bisa dipersempit ke satu paket, mis. `bun update <name>`), yang menaikkan rentang `package.json` dan `bun.lock` bersamaan.
2. `bun run check:lockfile`, untuk memastikan `bun.lock` masih cocok persis dengan `package.json` setiap workspace — gate yang sama yang harus dilewati sebuah PR Dependabot.
3. Gate `bun test`/`audit:*` di root, sama seperti perubahan lainnya.
4. Versi Bun sendiri tidak pernah disentuh oleh alur ini: ia dipin di tiga tempat yang harus berpindah bersama (`packageManager`/`engines.bun` di `package.json` root, `bun-version` di setiap job `ci.yml` — bagian "Configuration and toolchain" AGENTS.md), dan menaikkannya adalah perubahan sengaja, sekaligus-di-ketiganya, bukan efek samping `bun update`.

Mengaktifkan kembali blok `bun` tinggal mengembalikan sebuah blok `package-ecosystem: "bun"` ke `.github/dependabot.yml` (riwayat git punya bentuk terakhirnya, dari sebelum commit yang menutup issue #199) begitu updater `bun` milik Dependabot mendukung lockfile v2, lalu memperbarui `tests/dependabot-config.test.mjs` — ia sudah membaca `lockfileVersion` milik `bun.lock` sendiri dan hanya mewajibkan blok itu kembali begitu angka itu adalah 1.

**Meninjau PR Dependabot `github-actions` terhadap gate lockfile:** `bun run check:lockfile` dan gate `bun test`/`audit:*` di root tetap berlaku seperti perubahan lainnya, meski PR yang hanya menyentuh berkas workflow tidak akan menyentuh `bun.lock`. Dependabot memindahkan SHA dan komentar `# vX.Y.Z`-nya bersamaan — ia telah memperbarui komentar versi setelah action yang dipin-SHA sejak Oktober 2022 — sehingga yang layak dilirik manusia adalah apakah komentar itu masih berakhir dengan versi (komentar dengan prosa tambahan setelah versi adalah satu-satunya bentuk yang dilewati updater Dependabot sendiri, menurut dokumennya), bukan apakah pembaruannya terjadi sama sekali.

## Seeding profil secara lokal

`tools/seed-cms.ts` (`bun run db:seed:cms` / `bun run db:seed:cms:profil <nama>`, issue #139) menyemai `apps/cms` yang sudah dimigrasi dengan salah satu dari empat profil: set contoh netral dan fiktif `toko`/`berita`/`landing` di bawah `tools/seed-data/profil/**`, atau `contoh:borneojek-mart` (default di repositori INI — `template:init`, issue #138, menulis ulang default itu menjadi profil pilihan deployment di repo turunan, lihat [`docs/template.md`](template.md)) — konten lengkap deployment referensi yang hidup di bawah tools/seed-data/contoh/borneojek-mart/**. Lihat bagian "Seed contoh" di [`docs/template.md`](template.md) untuk isi tiap profil.

**Jangan pernah menyemai profil netral ke basis data dev lokal bersama milik repositori ini** (`postgres://awcms:awcms_dev_password@localhost:5433/awcms`, default `bun run db:up`) — basis data itu sudah berisi tenant BjekMart milik repositori ini, dan `POST /api/v1/setup/initialize` adalah kunci singleton sekali-per-basis-data (lihat `ensureTenantAndSession` milik `tools/seed-cms.ts` sendiri): run `--profil` kedua terhadap basis data yang sama akan gagal di langkah bootstrap, bukan membuat tenant kedua. Pakai `--dry-run` untuk melihat apa yang AKAN disemai suatu profil (ia memvalidasi JSON profil dan mencetak ringkasan inventaris, tanpa panggilan jaringan sama sekali, sehingga tidak butuh `apps/cms` yang berjalan dan selalu aman dijalankan), atau arahkan `AWCMS_BASE_URL`/`POSTGRES_*` ke basis data sekali-pakai saat run sungguhan terhadap suatu profil memang dibutuhkan.

## Belum ditegakkan hari ini

Syarat review code-owner (`require_code_owner_reviews` mati; hanya `apps/cms/.github/CODEOWNERS` yang ada, dan itu milik upstream). Langkah CI yang membangun atau mempublikasikan image container, atau men-deploy ke mana pun — lihat [`docs/deployment.md`](deployment.id.md) untuk apa arti "men-deploy repositori ini" hari ini. (Pembatasan strategi-merge untuk PR yang menyentuh `apps/cms`, sebelumnya tercantum di sini sebagai honour-system saja, kini ditegakkan secara mekanis di seluruh repositori — lihat "Branch protection pada `main`" di atas — issue #149.)
