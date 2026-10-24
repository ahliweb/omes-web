🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](0021-separate-omes-product-site-from-native-host-runtime.md)

<!-- i18n-source-hash: sha256:36b8d55339f0fae801d0980c57648f71af531662b6820d81da73b22ce47e2bba -->

# ADR-0021 — OMES-Web adalah deployment produk yang terpisah, tetapi terintegrasi dengan OMES

- **Status:** Diusulkan
- **Tanggal:** 24 Oktober 2026
- **Pengambil keputusan:** ahliweb
- **Terkait:** [OMES ADR-0036](https://github.com/ahliweb/omes/issues/350), [OMES-Web #16](https://github.com/ahliweb/omes-web/issues/16), [#17](https://github.com/ahliweb/omes-web/issues/17), [#18](https://github.com/ahliweb/omes-web/issues/18), [#19](https://github.com/ahliweb/omes-web/issues/19), [#20](https://github.com/ahliweb/omes-web/issues/20)
- **Lingkup:** website publik OMES profil `landing`, CMS AWCMS dan database yang dimiliki produk, halaman admin SYSTEM warisan AWCMS, versi dan deployment mandiri.

## Konteks dan bukti

OMES-Web dibangun sebagai produk turunan **AWCMS-One** (templateVersion 0.12.0 di package.json), dengan `apps/storefront` Astro/Bun `landing` statis dan `apps/cms` dari git subtree histori penuh `ahliweb/awcms`. Repo **OMES** berbeda, memiliki CLI, layanan host Bash/Python/systemd dan integrasi Hermes. `VERSION=0.6.0` beserta rilis OMES berbeda dari versi produk web `0.1.0`. Modul `omes_control`, tenant, API worker bertanda tangan dan UI `/admin/omes/*` sudah dimiliki AWCMS upstream.

Homepage produk masih mengunci OMES **v0.4.0** dan installer v0.4.0; sementara README/AGENTS dan sebagian dokumentasi masih menyebut BjekMart/AWCMS-One. Sinkronisasi subtree terakhir memakai upstream `8e9bce0c`; peningkatan selanjutnya harus diaudit, bukan dianggap selalu aman. Domain produksi telah terdokumentasi, tetapi kesehatan produksi tidak disimpulkan dari adanya konfigurasi.

## Perbandingan pilihan

| Aspek | A — Dua repo dengan kontrak berversi | B — Website publik dipindah ke OMES | C — Semua OMES-Web digabung ke OMES |
| --- | --- | --- | --- |
| Keamanan/RLS | Mempertahankan otorisasi AWCMS dan worker HTTPS keluar | CI/deployment bercampur | Risiko mencampur host berhak tinggi dan DB/browser |
| Maintainability | Source of truth tiap repositori jelas, subtree terkendali | Paket native OMES menanggung Astro | Subtree AWCMS dan runtime native bercampur |
| Rollback/reliabilitas | Website, CMS dan worker dapat dipulihkan terpisah | Rilis website terikat CLI | Dampak kegagalan lebih luas |
| SEO/aset | Profil Astro sekarang dipertahankan | Perlu migrasi URL dan build | Perlu migrasi penuh |
| Biaya | Manifest dan pengujian integrasi terbatas | Workflow build baru | CI/operasional lebih kompleks |

**Keputusan yang dipilih: Opsi A.** Repo tetap terpisah; OMES memasok metadata rilis/kontrak worker, OMES-Web mengelola deployment produk, AWCMS menjadi sumber kode Control Center. ADR ini tetap **Diusulkan** sampai review dan gerbang verifikasi memenuhi syarat.

## Batas pemilik yang wajib dipatuhi

- **OMES:** versi rilis, installer, host, job, signed outbound-only HTTPS pull-worker, adapter Hermes, observabilitas host, `contracts/control-center/v1`. Tidak membuat database multi-tenant/CMS, halaman SYSTEM admin maupun runtime agent kedua.
- **AWCMS:** endpoint `omes_control`, FORCE RLS dan RBAC/ABAC, sistem admin Astro, enrollment/job/result/heartbeat. Tidak menyediakan shell bebas maupun listener privileged host.
- **AWCMS-One:** template reusable, bukan dependency runtime aktif produk OMES-Web.
- **AWCMS-Astro:** referensi pola publik dan USER admin bila dipilih, bukan pemilik SYSTEM admin.
- **OMES-Web:** website, tema, konfigurasi dan rilis produk, database CMS milik produk serta halaman admin dari **subtree AWCMS**. Tidak memfork modul `omes_control` atau membuat runtime Hermes baru.

## Aturan kontrak dan proses rilis

1. **Rilis OMES resmi yang dipin** menghasilkan metadata publik yang dapat diverifikasi: versi/tag/waktu, dokumentasi/URI installer yang benar, checksum bila tersedia secara terverifikasi, versi worker protocol dan schema. Jangan memakai installer dari `main` yang berubah bebas atau mengarang checksum. Sinkronisasi homepage [#16](https://github.com/ahliweb/omes-web/issues/16) dan manifest OMES [#352](https://github.com/ahliweb/omes/issues/352).
2. Perubahan CMS generik dilakukan **upstream AWCMS lebih dulu**, diikuti `git subtree pull --prefix=apps/cms awcms main` menggunakan **MERGE COMMIT**, **tidak squash/rebase**; fetch main saja tanpa upstream tags. Jangan menulis ulang migrasi yang sudah diterapkan. Issue [#17](https://github.com/ahliweb/omes-web/issues/17).
3. Protokol komunikasi host hanya **HTTPS keluar bertanda tangan** untuk `enroll/poll/result/heartbeat`, kredensial disimpan host, ID tenant/server dan replay/idempotensi diverifikasi. Antarmuka tidak menjalankan shell atau menampilkan metrik yang tak ada. Tes kompatibilitas [#20](https://github.com/ahliweb/omes-web/issues/20) dan [AWCMS #1185](https://github.com/ahliweb/awcms/issues/1185).
4. CMS, jobs dan website mempunyai versi image/build masing-masing, staging dan rollback. Bun milik website/CMS, bukan perintah mengganti layanan OMES Python. Nama Compose seperti `awcms-one-production`/volume/env **tidak boleh diganti sembarangan** sebab berpotensi menjadi identitas sumber daya produksi permanen.
5. UI admin OMES-Web adalah **spesifikasi dan konfigurasi produk**, bukan kode admin baru. Rute fungsional berada di AWCMS Astro; prototipe `ui/control-center` OMES hanya acuan, ilustrasi beranda publik tetap berlabel sintetis. [#18](https://github.com/ahliweb/omes-web/issues/18).

## Kriteria penerimaan dan rollback

- Halaman publik menyebut versi rilis OMES terverifikasi (0.6.0 jika sudah dibuktikan/dipin), bukan v0.4.0 lama; instalasi harus aman dan terlacak.
- Preflight memeriksa rentang kontrak worker, commit CMS upstream, migrasi database dan role PostgreSQL; versi tidak dikenal ditolak dengan alasan jelas.
- Uji dua tenant/RLS, replay nonce, worker reconnect, idempotensi, approval, reconciled evidence dan tanpa secret/prompts privat di browser.
- Situs tetap Astro SSG `landing`, CSP/SEO/aset tetap aman dan `toko/berita` diuji sebagai regresi template, bukan fitur produk OMES.
- README, AGENTS dan dokumentasi identitas produk disesuaikan lewat [#19](https://github.com/ahliweb/omes-web/issues/19), tanpa mengganti sumber kebenaran. Rollback host, CMS/DB forward-only, dan website disiapkan masing-masing.
- Penggabungan fisik repository hanya dipertimbangkan ulang lewat ADR baru yang membuktikan manfaat, migrasi git/DB/lalu lintas, pemulihan data dan batas keamanan.
