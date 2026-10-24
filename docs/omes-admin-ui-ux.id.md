🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](omes-admin-ui-ux.md)

<!-- i18n-source-hash: sha256:972b78cf2f47748fc149f2029d6b7716296a312bbb31e26f69100a314d1e7d36 -->

# Spesifikasi UI/UX Admin OMES-Web / Control Center v1.0

**Tanggal:** 24 Oktober 2026 · **Status:** standar desain produk dan pengujian, **bukan bukti seluruh fitur telah terpasang di produksi** · **Issue utama:** [OMES-Web #18](https://github.com/ahliweb/omes-web/issues/18) · **Keputusan integrasi:** [OMES #350](https://github.com/ahliweb/omes/issues/350) dan [ADR OMES-Web #0021](adr/0021-separate-omes-product-site-from-native-host-runtime.id.md).

## 0. Dasar bukti, kepemilikan dan istilah

- **Implementasi produk:** OMES-Web adalah website \`landing\` Astro/Bun pada \`omes.ahlikoding.com\`, serta instance AWCMS yang didokumentasikan pada \`omes-cms.ahlikoding.com\`. Route admin berasal dari **subtree \`apps/cms\`** yang ditarik dari \`ahliweb/awcms\`. Terakhir sinkron upstream \`8e9bce0c\`; **halaman yang ada di AWCMS terbaru belum tentu sudah ada di build OMES-Web**. Verifikasi ulang manifest route dan izin sesudah sinkronisasi [#17](https://github.com/ahliweb/omes-web/issues/17).
- **Kode kanonis:** AWCMS upstream pada 24 Oktober memiliki **15 berkas route** di \`src/pages/admin/omes/\`. Ada halaman read-only, tindakan terotorisasi, snapshot rilis, dan layar graf 3D. Modul \`omes_control\`, sistem otorisasi dan API adalah milik AWCMS, bukan dashboard React terpisah.
- **Runtime native:** OMES mengelola host, signed HTTPS pull worker keluar dan kontrak \`control-center/v1\`; Hermes mengelola runtime agent. \`ui/control-center/index.html\` di OMES adalah **prototipe desain non-fungsional**, sedangkan mockup Control Center pada website publik OMES-Web adalah **ilustrasi sintetis**, bukan screenshot armada.
- **Sistem desain:** gunakan \`AdminLayout.astro\` AWCMS, \`tokens.css\`, \`admin.css\`, \`admin-screens.css\`, \`omes-control-center.css\`, tenant badge, sidebar modular, language/theme switch dan API permission yang sudah ada. ADR-0023 OMES merupakan acuan, bukan implementasi admin pesaing.

Bedakan status **diimplementasikan upstream**, **sudah ada pada subtree produk**, **diaktifkan sesuai role/flag**, dan **terverifikasi pada deployment**. Bukti keberadaan route upstream **tidak otomatis membuktikan halaman sudah live** di OMES-Web.

## 1. Navigasi, matriks layar dan batas rilis

Struktur sidebar yang direkomendasikan (**memakai hierarki admin AWCMS**, bukan sidebar baru):
**Overview**; **Fleet** (Servers, Enrollments, Health); **Delivery** (Deployments, Operations, Jobs, Backups); **Hermes & AI** (Hermes, Live Orchestration, Repository Progress, AI Privacy); **Insights** (Architecture, Mission Control); **Governance** (Audit, inbox Approvals bersama, manajemen role yang sudah ada). Hanya tampilkan link untuk route yang terpasang, punya izin dan kontrak tersedia. Jangan mengarang route settings/ai-agents baru.

| ID | Route upstream yang diperiksa | Bukti fungsi upstream saat audit | Syarat aktif pada OMES-Web |
| --- | --- | --- | --- |
| OMUI-01 | \`/admin/omes\` | Ringkasan armada, pekerjaan, backup, drift | Subtree dan role diverifikasi |
| OMUI-02 | \`/admin/omes/servers\` | List/registrasi/riwayat server dan trust | API + migrasi DB sudah siap |
| OMUI-03 | \`/admin/omes/enrollments\` | Penerbitan dan pencabutan challenge sekali pakai | Izin dan kesesuaian host |
| OMUI-04 | \`/admin/omes/deployments\` | Desired vs observed deploy | Kontrak worker sesuai |
| OMUI-05 | \`/admin/omes/operations\` | Request operasi bertipe, approval bersama | Workflow benar-benar aktif |
| OMUI-06 | \`/admin/omes/jobs\` | Antrian, cancel queued, retry failed | Tidak ada approval berbahaya kedua |
| OMUI-07 | \`/admin/omes/health\` | Snapshot terbaru dan histori host | Timestamp/sumber valid |
| OMUI-08 | \`/admin/omes/backups\` | Snapshot backup dan restore terjaga | Izin dan rekonsiliasi hasil |
| OMUI-09 | \`/admin/omes/audit\` | Proyeksi audit teredaksi | Tenant dan pagination sah |
| OMUI-10 | \`/admin/omes/hermes\` | Observasi tugas Hermes **read-only**; planner/budget belum dilaporkan kontrak v1 | Tampilkan tidak tersedia |
| OMUI-11 | \`/admin/omes/orkestrasi-langsung\` | Pohon subagent/event lewat polling, status stale/unknown | Bukan runtime agent kedua |
| OMUI-12 | \`/admin/omes/progres-hermes\` | Progres GitHub hasil polling AWCMS; unknown/stale/configured | GitHub sumber kebenaran |
| OMUI-13 | \`/admin/omes/ai-privacy\` | Postur privasi read-only dan **satu approval egress owner** yang sempit | Tanpa prompt/transkrip mentah |
| OMUI-14 | \`/admin/omes/arsitektur\` | **Snapshot rilis yang dipin**, bukan telemetri live | SHA/snapshot jelas |
| OMUI-15 | \`/admin/omes/mission-control\` | **Graf 3D**, fallback daftar, mode live/history dan aksi dari endpoint existing | Cek versi subtree, WebGL dan role |
| OMUI-16 | Manajemen AI tambahan | **BELUM terbukti berupa route/fungsi mandiri yang lengkap** | OMES #343/#344 harus selesai |
| OMUI-17 | Browser transfer dan AI controls | **RENCANA** OMES #294/#300–#306 | API, kebijakan dan worker tersedia |
| OMUI-18 | SSE/WS Bun realtime | **RENCANA** AWCMS #1168/#1171 | ADR dan implementasi telah diterima |

Perubahan UI generik tidak dilakukan dengan menyalin berkas dari \`awcms/src/pages/admin/omes\` secara lokal. Kembangkan upstream AWCMS dan bawa via subtree **MERGE COMMIT**.

## 2. Pola shell admin dan tata letak responsif

### Wireframe desktop acuan ±1440px
\`\`\`text
┌────────────────────────────────────────────────────────────────────────────────┐
│ Admin SYSTEM ▾  Badge Tenant   Waktu sync    Search   Notifikasi    Pengguna ▾ │
├───────────────┬────────────────────────────────────────────────────────────────┤
│ OMES Overview │ Breadcrumb  Judul Halaman  [status]  [CTA sesuai izin]          │
│ Fleet         ├────────────────────────────────────────────────────────────────┤
│  Servers      │ [KPI / filter / sumber / timestamp]                            │
│  Enrollments  │ [Konten utama: tabel, detail, atau graf/timeline yang sesuai]  │
│  Health       │ [pagination] [loading/empty/error/stale/unknown]                │
│ Delivery      │                                                                │
│ Hermes & AI   │                                                                │
│ Insights      │                                                                │
│ Governance    │                                                                │
└───────────────┴────────────────────────────────────────────────────────────────┘
\`\`\`
Ini **kontrak komposisi** di dalam shell AWCMS, bukan template aplikasi admin baru.

Desktop ≥1200px memanfaatkan sidebar asli dan split table/detail bila perlu; tablet 768–1199px menggunakan navigasi dapat dilipat dan filter bertumpuk; ponsel ≤767px (uji 360/390px) memakai drawer, list→detail dan tombol dengan nama aksesibel. Aksi kritis tidak boleh tergantung hover. Graf memakai alternatif daftar dan reduced motion. Semua status harus memiliki teks dan label, bukan warna saja.

Context header: tenant, role, asal data, waktu observasi dan zona waktu, notifikasi yang dapat dipertanggungjawabkan; versi **produk OMES-Web** dipisahkan dari versi **rilis host OMES**. Pergantian tenant membersihkan cache dan subscription, server tetap mengecek RLS/ABAC.

## 3. Persona dan hak akses

| Persona | Hak baca | Mutasi sah | Larangan |
| --- | --- | --- | --- |
| SYSTEM admin berizin | Fleet/kebijakan tenant yang diotorisasi | Registrasi, kebijakan, approval sesuai izin | Shell root sembarang, secret lintas tenant |
| Owner tenant/fleet manager | Inventaris dan kesehatan milik sendiri | Enrollment, typed operation, approval bila memiliki peran | Mengabaikan persetujuan/destructive gate |
| Operator | Server dan job yang ditugaskan | Request operasi bertipe, cancel sesuai status | Operasi destruktif tanpa workflow |
| Auditor | Audit yang telah disanitasi | Ekspor terotorisasi | Baca credential/job mutation |
| Pengamat/analis | Status dan report yang diizinkan | Tidak ada | Memberi approval atau menjalankan capability unknown |
| Agent Hermes | Runtime/skill milik Hermes | Hanya melalui adapter native tepercaya | Eksekusi browser privileged dari prompt tidak tepercaya |

Permission sebenarnya menggunakan \`OMES_GUARDS\` dan endpoint AWCMS, **tidak membuat ACL baru di OMES-Web**. Tombol yang disembunyikan tidak mengganti cek otorisasi API.

## 4. Kontrak per layar: komponen, aksi, state dan kegagalan

### OMUI-01 Dashboard Overview
Kartu: host terdaftar, healthy/stale/unknown, operasi pending/failed, panjang antrean job, backup terverifikasi terakhir, drift deployment dan freshness. Klik metrik menuju route yang sudah berizin sambil mewariskan filter. CTA register/enroll/operation tergantung role. Empty: “Belum ada server pada tenant ini” dan onboarding aman, bukan nol server berarti semuanya sehat. Polling dan timestamp ditampilkan; kegagalan permintaan tidak diam-diam menampilkan data stale sebagai live.

### OMUI-02 Server Registry
Tabel nama host tersamarkan, ID, OS/profile, status worker, heartbeat bertanda tangan terakhir, desired vs observed release, contract version. Search/filter status dan pagination keyset. Detail Overview/Enrollment Evidence/Heartbeat/Deployment/History. Registrasi lewat \`POST /api/v1/omes/servers\` harus mempunyai tenant dan idempotency key; decommission soft-delete memerlukan konfirmasi dan audit. Jangan menampilkan credential/key private worker.

### OMUI-03 Enrollment Management
Pilih server dengan status eligible; challenge enrollment hanya ditampilkan **sekali**, memiliki masa berlaku dan tidak masuk log/URL/download. Sesuaikan dengan UI upstream yang memakai petunjuk seleksi teks manual; **jangan mengklaim tombol auto-copy/modal sudah dibangun**. Revoke memiliki konfirmasi dan endpoint idempotent. Server aktif tidak diam-diam memperoleh token baru. State Pending/Expired/Revoked/Enrolled/Unknown dan pemulihan jelas. Host membuat keypair lokal; koneksi selalu HTTPS **keluar dari host**.

### OMUI-04 Deployment Projection
Tabel desired release, observed release, digest/sumber, host, status drift, waktu dan validasi. Bedakan request tercatat, queued, applied, observed dan verified. Detail menampilkan bukti teredaksi serta riwayat/recovery, bukan root credential. Request sukses tidak otomatis membuktikan aplikasi sehat; health worker dan verifikasi independen menjadi bukti.

### OMUI-05 Operations
Wizard target host → operasi allowlisted **status/preflight/start/stop/restart/update/backup/rollback** → parameter typed terbatas → pratinjau risiko/role → kirim dengan idempotency key. Operasi **stop/rollback** destruktif memakai **workflow-approval AWCMS yang sudah ada**; jangan membuat inbox persetujuan kedua. Bila workflow belum dikonfigurasi, tampilkan penolakan yang dapat ditindaklanjuti. Sukses awal berstatus “permintaan tercatat”, kemudian Approved/Dispatched/Observed/Verified sesuai bukti. Submit ulang atau reconnect tidak boleh menjalankan tugas ganda.

### OMUI-06 Jobs
Tab queued/leased/failed/completed/unknown, kolom job ID, correlation operasi, lease, jumlah percobaan, error terakhir dan aksi. **Cancel** hanya queued; **approve for retry** hanya failed dan **bukan approval destruktif baru**. Konfirmasi dan kondisi race jika worker sudah claim ditampilkan jelas. Payload dan hasil tool tidak dipublikasikan tanpa redaksi.

### OMUI-07 Health/Doctor
Ringkasan snapshot kesehatan terakhir per host dan histori terpaginasikan melalui \`?serverId=\`. Tiap pemeriksaan menunjukkan status, sumber \`omes-host\`/\`hermes\`/\`external\` bila disuplai, waktu observasi dan stale flag. Endpoint model terhubung bukan bukti seluruh skill/agent siap. Badge kesehatan dan badge freshness tetap **terpisah**, tidak menganggap host stale sebagai live. Aksi diagnosis memakai kontrak aman, bukan perintah shell bebas.

### OMUI-08 Backups/Restore
Tabel backup target, tanggal pembuatan, retensi, checksum, bukti verifikasi dan kesiapan restore. Backup diminta bukan backup berhasil. Restore membutuhkan izin, konfirmasi keras dan approval/destructive workflow, menyebut target serta dampak, memerlukan bukti read-back setelah pemulihan. Unknown/failure tidak diulang secara buta.

### OMUI-09 Audit Trail
Timeline immutable actor/action/target/decision/result/correlation/sumber berizin. Filter tanggal/status/sumber, pagination dan ekspor terbatas. Data pribadi/host keys/API secrets/prompt atau transkrip Hermes tidak boleh ikut. Akses tenant lain dengan ID tebak harus ditolak di API.

### OMUI-10 Hermes Observer
Ringkasan delegated task/session paling baru, jumlah langkah dan status hanya dari skema valid. **Planner/model identitas dan step budget belum ada pada kontrak v1** sehingga label “Belum dilaporkan oleh kontrak v1”, bukan angka palsu. Read-only tanpa tombol menjalankan agent sendiri; link ke proyeksi live berizin.

### OMUI-11 Live Orchestration
Tree subagent dan event Hermes, aktivitas dengan timestamp dan bounded depth. Status live/stale/unknown dipisah, polling sesuai kode saat ini. Detail node hanya metadata yang sudah disanitasi; tidak mengakses prompt, chain-of-thought, tool args/results, tidak ada kontrol mutasi sesi. Data yang pernah ada tetapi stale tidak menjadi “berjalan” hanya karena node tertinggal.

### OMUI-12 Repository Progress
Ringkasan issue/milestone GitHub diperbarui oleh poll AWCMS (default sekitar 15 menit pada dokumentasi upstream), bukan passthrough langsung ke GitHub. Tampilkan belum dikonfigurasi/unknown/stale/fresh, last successful poll, alasan gagal, progress berdasarkan fakta tersedia. Jangan mengarang persen penyelesaian proyek atau tombol “sync now” tanpa endpoint yang telah diterima.

### OMUI-13 AI Privacy
Postur privasi AI dan izin keluar data ditampilkan sebagai metadata teredaksi. **Ada satu tindakan owner egress approval yang sempit**, dengan role \`aiPrivacy.approve\` dan cek server-side, bukan panel kontrol model bebas. Tampilkan kebijakan/versi/risiko/sumber/waktu dan status keputusan, tanpa prompt, transkrip, respons raw dan credential. Status unknown tidak dianggap aman. Request palsu oleh non-owner harus ditolak.

### OMUI-14 Architecture Snapshot
Lane komponen OMES/Hermes/AWCMS/provider, versi dan SHA sumber. Banner jelas **“Snapshot rilis yang dipin — BUKAN telemetri host langsung”**, waktu vendored dan sumber. Saat release berubah, lakukan sinkronisasi fixture melalui alur audit terkontrol, bukan fetch JSON bebas dari browser. Diagram read-only harus menyediakan tabel/list aksesibel.

### OMUI-15 Mission Control
Upstream AWCMS saat audit sudah memiliki **ruang 3D**, **fallback daftar tanpa JS/WebGL**, mode **Live/History**, replay historis berbatas dan aksi yang bergantung endpoint existing dan role. Objek graf hanya referensi ke fakta pemilik, bukan mesin task baru. Tampilkan asal data/as-of, label unavailable bila sumber tidak berizin, reduced motion dan alternatif keyboard/list. **OMES-Web harus membuktikan route ini sudah tersinkronkan dan dapat dirender sebelum mengklaim fitur tersedia di produksi.**

### OMUI-16 AI Management lanjutan — rencana
Setelah kontrak Hermes [OMES #343/#344](https://github.com/ahliweb/omes/issues/344) diterima, usulkan tab Agents/Sessions/Models & Skills/Policy/Approvals/Budgets. Informasi model/cost/budget hanya jika semantik didukung sumber. Aksi lewat typed allowlist, role, approval dan audit; tidak membuat model router, native agent runner atau memori Hermes kedua. Jangan tampilkan menu aktif sebelum backend ada.

### OMUI-17 Browser Data Transfer — rencana
Wizard Source/Destination → Privacy/Mapping → Dry-run → MFA/Login manusia bila perlu → durable task → progress checkpoint → read-back independen → reconcile. Status pending/blocked MFA/running/uncertain write/verified/failed dan pemulihan yang benar. Integrasi dengan Hermes/OMES sesuai kontrak, bukan browser agent privileged langsung dari prompt.

### OMUI-18 SSE/WS Bun — rencana
SSE Bun untuk progres satu arah; WebSocket native Bun bila kebutuhan dua arah terbukti dan ADR [AWCMS #1168](https://github.com/ahliweb/awcms/issues/1168) diterima. Tidak mengirim command host atau menggantikan worker OMES signed HTTPS polling keluar. Wajib cek Origin, tiket singkat, tenant/role, payload teredaksi, backpressure, reconnect dan snapshot. Sementara belum ada, gunakan polling/status stale seperti sekarang.

## 5. Konfigurasi khas produk vs kode generic

Tambahan khas OMES-Web hanya branding/logo, konfigurasi domain dan tenant, tautan support, CTA instalasi rilis OMES, kompatibilitas deployment dan enablement modul sesuai kemampuan. Gunakan API konfigurasi AWCMS yang resmi. **Jangan memfork halaman admin generik**. Menu e-commerce/BjekMart/kurir tidak tampil sebagai fitur operator OMES kecuali produk memang mengaktifkannya dengan kebutuhan yang tervalidasi. Drift README/AGENTS ditangani [#19](https://github.com/ahliweb/omes-web/issues/19).

\`\`\`mermaid
flowchart TB
    Site["OMES-Web Astro landing SSG<br/>omes.ahlikoding.com"] -->|"CMS public read API saat build"| CMS["OMES-Web apps/cms<br/>AWCMS git subtree"]
    CMS --> UI["Control Center /admin/omes/*<br/>Astro SYSTEM Admin"]
    Host["Worker native OMES<br/>Bash/Python/systemd"] -->|"Signed HTTPS keluar<br/>enroll/poll/result/heartbeat"| CMS
    Release["Rilis OMES resmi, versi/manifest"] -.->|"Metadata terverifikasi"| Site
    Release -.->|"Fixture kontrak kompatibilitas"| CMS
    Hermes["Hermes Agent native"] -->|"Observasi terotorisasi"| Host
\`\`\`
Panah koneksi host menunjukkan **host menginisiasi HTTPS keluar**, tidak ada listener privileged inbound.

## 6. Matriks pengujian UI/UX dan keamanan

| Test ID | Bukti wajib |
| --- | --- |
| UI-01 | Owner/operator/auditor/observer punya tampilan tepat dan API menolak POST tanpa izin |
| UI-02 | Dua tenant dengan alias host sama tidak dapat membaca job/backup/approval tenant lain |
| UI-03 | Token enrollment sekali tampil, expired/revoked aman, tidak bocor ke screenshot/log |
| UI-04 | Lease/retry/idempotency, stop/rollback melalui workflow approval, unknown bukan sukses |
| UI-05 | Hermes/AI redacted; planner/budget v1 “tidak dilaporkan”; tidak ada agent runner/shell baru |
| UI-06 | Snapshot arsitektur SHA, histori as-of, mode 3D + 2D/list dan reduced motion |
| UI-07 | Ponsel 360/390px, tablet 768, desktop 1440, keyboard/focus, WCAG 2.2 AA |
| UI-08 | Worker OMES vs schema AWCMS kompatibel, unknown-major ditolak, HTTPS signed, nonce dan RLS |
| UI-09 | Homepage installer OMES sesuai rilis resmi terpin, tidak v0.4.0 usang, canonical/CSP/SEO aman |
| UI-10 | Bun dipin, image digest, PostgreSQL role non-owner, migrasi forward-only, staging dan rollback |

**Urutan pengembangan:** perbaiki UI yang generic **di upstream AWCMS**, uji kontrak/DB/RLS/a11y, lalu OMES-Web menarik upstream melalui git subtree **MERGE COMMIT (tidak squash/rebase)** pada branch sendiri. Sesudah itu uji 18 ID layar dan feature flag, \`bun test\`, \`bun run check\`, \`bun run check:cms\`, audit dokumen/terjemahan, integrasi DB, build \`landing/toko/berita\`, deploy preflight dan staging. OMES native menjalankan \`./scripts/ci-local.sh\` terpisah. PR dokumentasi ini **tidak** mengklaim tes atau deploy sudah dilakukan.

## 7. Urutan prioritas dan issue

**P0 keputusan/identitas:** [OMES #350](https://github.com/ahliweb/omes/issues/350), OMES-Web [#19](https://github.com/ahliweb/omes-web/issues/19), [#16](https://github.com/ahliweb/omes-web/issues/16). **P0 keamanan dan data:** audit/sinkronisasi subtree [#17](https://github.com/ahliweb/omes-web/issues/17), manifest kontrak host [OMES #352](https://github.com/ahliweb/omes/issues/352), consumer test [AWCMS #1185](https://github.com/ahliweb/awcms/issues/1185), preflight produk [#20](https://github.com/ahliweb/omes-web/issues/20). **P1 QA UI:** dokumen ini [#18](https://github.com/ahliweb/omes-web/issues/18), UI kanonis [OMES #348](https://github.com/ahliweb/omes/issues/348), [AWCMS #858](https://github.com/ahliweb/awcms/issues/858). **P2:** AI [OMES #343/#344](https://github.com/ahliweb/omes/issues/344), 3D lanjutan [#263](https://github.com/ahliweb/omes/issues/263), browser transfer [#294](https://github.com/ahliweb/omes/issues/294), realtime Bun [AWCMS #1168/#1171](https://github.com/ahliweb/awcms/issues/1168). Seluruh fitur dalam backlog harus dibedakan dari yang telah dirilis dalam OMES-Web.
