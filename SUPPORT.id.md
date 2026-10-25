🇮🇩 Bahasa Indonesia · 🇬🇧 [English (source)](SUPPORT.md)

<!-- i18n-source-hash: sha256:07e95000b1d92bbc7c6b43cd17bda5e7b846169e00410494e0d14cfd6cc26d8e -->

# Dukungan

## Yang BUKAN kanal ini

**Repo ini menyimpan kode dan dokumentasi untuk OMES, bukan toko yang sudah tayang atau layanan pelanggannya.** Belum ada deployment produksi platform ini yang hidup — lihat [`docs/deployment.md`](docs/deployment.md) dan [`SECURITY.md`](SECURITY.md) untuk rincian persis apa yang sudah dan belum disediakan — dan sekalipun nanti sudah ada, masalah pesanan, pembayaran, atau akun pelanggan di toko yang berjalan bukan sesuatu yang ditangani oleh issue tracker repo ini.

Pertanyaan tentang kode, workspace, cakupan produk, atau integrasi dengan `apps/cms` dipersilakan lewat GitHub Issues.

## Yang bisa dibantu di sini

| Kebutuhan | Jalur |
| --- | --- |
| Gerbang yang rusak, hasil CI yang salah, workspace yang tidak bisa dibangun | Buka issue dengan templat **Bug report** |
| Pertanyaan tentang struktur repo ini, gerbangnya, atau penyematan `apps/cms` lewat subtree | Buka issue; mulai dari [`AGENTS.md`](AGENTS.md) |
| Pertanyaan tentang cakupan atau batas kepemilikan produk ini | Baca dulu [ADR-0021](docs/adr/0021-separate-omes-product-site-from-native-host-runtime.id.md), lalu buka issue di `ahliweb/omes-web` bila masih belum jelas. Pertanyaan host native, CLI, atau installer OMES masuk ke [`ahliweb/omes`](https://github.com/ahliweb/omes); pertanyaan fitur yang dapat dipakai ulang atau template masuk ke [`ahliweb/awcms-one`](https://github.com/ahliweb/awcms-one) |
| Ingin membantu menerjemahkan cermin Indonesia sebuah dokumen governance | Buka issue, lalu lihat [`CONTRIBUTING.md`](CONTRIBUTING.md#translation) |
| Menemukan kerentanan keamanan | **Jangan buka issue publik.** Ikuti [`SECURITY.md`](SECURITY.md) |
| Masalah toko yang sudah tayang atau akun pelanggan | Bukan di sini — repo ini belum punya deployment hidup; begitu ada, kanalnya akan didokumentasikan di sini |

## Prioritas

Ditangani sebelum yang lain: cacat yang tidak menggagalkan gerbang mana pun tetapi tetap salah — kolom skema yang diekspresikan ulang dengan makna yang keliru, batas workspace yang terlewati diam-diam, dokumen yang sudah tidak sesuai lagi dengan kode. Setiap gerbang di repo ini ditulis untuk mempersempit celah itu, tetapi sebuah gerbang hanya menangkap apa yang memang ditulis untuk ditangkapnya.
