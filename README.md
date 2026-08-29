# Pojok Wirausaha Mahasiswa — PGSD UPI Kampus Serang

Etalase digital produk dan jasa karya mahasiswa PGSD UPI Kampus Serang.
**Karya Mahasiswa • Belanja Mahasiswa • Tumbuh Bersama**

Website ini **bukan** marketplace dengan pembayaran internal. Fungsinya sebagai media promosi
dan penghubung: transaksi dilakukan langsung antara pembeli dan mahasiswa penjual melalui
WhatsApp atau Instagram.

Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa framework, tanpa proses build,
siap di-host di GitHub Pages.

---

## Daftar Isi

1. [Struktur file](#1-struktur-file)
2. [Cara menjalankan secara lokal](#2-cara-menjalankan-secara-lokal)
3. [Setup otomatis — satu fungsi untuk semuanya](#3-setup-otomatis--satu-fungsi-untuk-semuanya)
4. [Struktur Google Sheet yang terbentuk](#4-struktur-google-sheet-yang-terbentuk)
5. [Google Form yang terbentuk](#5-google-form-yang-terbentuk)
6. [Deploy API dan mengisi API_URL](#6-deploy-api-dan-mengisi-api_url)
7. [Deploy ke GitHub Pages](#7-deploy-ke-github-pages)
8. [Alur moderasi admin](#8-alur-moderasi-admin)
9. [Foto produk — bagian yang paling sering bermasalah](#9-foto-produk--bagian-yang-paling-sering-bermasalah)
10. [Kontrak data API ↔ website](#10-kontrak-data-api--website)
11. [Kustomisasi](#11-kustomisasi)
12. [Fitur yang sudah tersedia](#12-fitur-yang-sudah-tersedia)
13. [Pemecahan masalah](#13-pemecahan-masalah)

---

## 1. Struktur file

```
/
├── index.html              Halaman utama (hero, katalog, promo, cerita, CTA)
├── toko.html               Halaman toko mini per mahasiswa (?id=PGSD0001)
├── .nojekyll               Wajib ada agar GitHub Pages tidak memproses file lewat Jekyll
├── README.md
│
├── css/
│   └── style.css           Seluruh gaya: design token, komponen, responsif, animasi
│
├── js/
│   ├── config.js           ★ SATU-SATUNYA FILE YANG PERLU DIUBAH (API_URL & GOOGLE_FORM_URL)
│   ├── data-demo.js        Data contoh 21 produk / 10 usaha / 5 promo / 4 cerita
│   ├── api.js              Pengambilan data, normalisasi WhatsApp–Instagram–harga–tanggal
│   ├── favorites.js        Favorit & "Terakhir Kamu Lihat" (localStorage)
│   ├── products.js         Komponen: kartu produk, skeleton, modal detail, share
│   ├── app.js              Pengendali halaman utama
│   └── toko.js             Pengendali halaman toko
│
├── assets/
│   ├── icons/              logo.svg, favicon.svg
│   └── images/             Placeholder produk & thumbnail cerita (SVG ringan)
│
└── apps-script/
    └── Code.gs             Setup otomatis (Form + Sheet + trigger) sekaligus JSON API
```

Total ukuran aset kurang dari 250 KB. Tidak ada dependensi eksternal selain Google Fonts.

---

## 2. Cara menjalankan secara lokal

Karena website memakai `fetch`, jangan buka `index.html` dengan klik ganda (protokol `file://`).
Jalankan server statis sederhana:

```bash
# Python 3
python3 -m http.server 8000

# atau Node.js
npx serve .
```

Lalu buka `http://localhost:8000`.

### Tiga keadaan website

Perilaku halaman ditentukan oleh dua saklar di `js/config.js`: `API_URL` dan `MODE_DEMO`.

| `API_URL` | `MODE_DEMO` | Yang tampil |
|---|---|---|
| kosong | `false` *(bawaan)* | Panel **"Belum ada usaha yang terdaftar"** beserta ajakan mendaftar dan ringkasan 3 langkah. Bagian katalog, kategori, promo, wirausaha, dan cerita disembunyikan otomatis, termasuk tautan navigasinya |
| kosong | `true` | 21 produk contoh, dengan **banner "DATA CONTOH"** di paling atas halaman |
| terisi | apa pun | Data asli dari Google Sheet. Kalau sheet belum berisi produk `TAYANG`, tampilannya kembali ke panel "belum ada usaha" |

> **Jangan publikasikan website dengan `MODE_DEMO = true`.** Nomor WhatsApp pada data
> contoh adalah nomor karangan — pengunjung yang menekan "Pesan" bisa saja menghubungi
> orang yang tidak berkaitan. Pakai mode demo hanya di komputer sendiri untuk menguji
> tampilan.

Kalau `API_URL` sudah diisi tetapi API-nya gagal diakses, website menampilkan pesan
"Produk sedang tidak dapat dimuat" beserta tombol **Muat ulang** — bukan data contoh —
kecuali `MODE_DEMO` sengaja dinyalakan.

---

## 3. Setup otomatis — satu fungsi untuk semuanya

Kamu tidak perlu membuat Form, Spreadsheet, kolom, dropdown, atau trigger satu per satu.
Semuanya dibuat oleh satu fungsi di `apps-script/Code.gs`.

1. Buka <https://script.google.com> → **New project**. Beri nama, misalnya
   *API Pojok Wirausaha PGSD*.
2. Hapus isi `Code.gs` bawaan, tempel **seluruh** isi `apps-script/Code.gs`, lalu **Simpan**.
3. Pilih fungsi **`setupPojokWirausaha`** di dropdown atas → **Run**.
   Saat diminta izin: *Review permissions* → pilih akun → *Advanced* → *Go to … (unsafe)* →
   *Allow*. (Peringatan "unsafe" itu wajar untuk script buatan sendiri yang belum
   diverifikasi Google.)
4. Buka **Execution log**. Di sana tercetak URL Form, URL Spreadsheet, Form ID,
   Spreadsheet ID, dan langkah berikutnya.

Yang dikerjakan fungsi itu:

| Langkah | Hasil |
|---|---|
| Membuat Spreadsheet | *DATABASE Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang* |
| Membuat 4 sheet | `PRODUK` (wajib) + `PENJUAL`, `PROMO`, `CERITA` (opsional) |
| Menulis header | Lengkap, tebal, latar merah marun, baris dibekukan, lebar kolom diatur |
| Memasang dropdown | `STATUS` (4 pilihan) dan `KATEGORI` (10 pilihan) |
| Memasang checkbox | Kolom `FEATURED` |
| Pewarnaan bersyarat | TAYANG hijau, MENUNGGU kuning, DITOLAK merah, NONAKTIF abu |
| Format angka | `HARGA` sebagai `#,##0`, tanggal sebagai `yyyy-mm-dd` |
| Membuat Google Form | 13 pertanyaan lengkap dengan teks bantuan dan validasi |
| Menyambungkan Form → Sheet | Jawaban mentah masuk ke tab *Form Responses 1* |
| Memasang 3 trigger | `onFormSubmit`, `onEditSheet`, `onOpenSpreadsheet` |
| Menyimpan ID | Form ID & Spreadsheet ID disimpan di `PropertiesService` |

### Idempotent

`setupPojokWirausaha()` aman dijalankan berulang kali. Form ID dan Spreadsheet ID
disimpan di `PropertiesService`, jadi:

- Form dan Spreadsheet **tidak** dibuat ulang;
- pertanyaan Form yang judulnya sudah ada **tidak** ditambahkan lagi;
- header sheet hanya ditulis ulang bila memang berbeda — data yang sudah ada aman;
- trigger yang sudah terpasang tidak diduplikasi.

Kalau kamu memang ingin mulai dari nol dengan pasangan Form + Sheet yang baru, jalankan
`resetSetup()` (Form dan Sheet lama **tidak** dihapus, hanya dilepas dari script), lalu
jalankan `setupPojokWirausaha()` lagi.

### Fungsi lain yang tersedia

| Fungsi | Kegunaan |
|---|---|
| `showSetupInfo()` | Menampilkan kembali URL Form, URL Sheet, ID, jumlah TAYANG/MENUNGGU, dan daftar trigger |
| `ujiApi()` | Memeriksa kontrak data: field wajib lengkap, harga bertipe number, WhatsApp berawalan 62, Instagram tanpa `@`, dan memastikan tidak ada NIM yang bocor |
| `isiContohUntukUjiCoba()` | Menambahkan 3 baris contoh berstatus TAYANG supaya kamu bisa mencoba website sebelum ada pendaftar |
| `perbaikiIzinFoto()` | Memasang izin baca publik dan menyeragamkan URL foto (lihat bagian 9) |
| `ujiFotoPublik()` | Menguji apakah foto benar-benar bisa dibuka pengunjung anonim |
| `isiIdKosong()` | Mengisi `ID_PRODUK` / `ID_PENJUAL` pada baris yang diketik manual |
| `setStatusProduk('PRD0001','TAYANG')` | Mengubah status satu produk dari editor |
| `resetSetup()` | Melepas kaitan script dengan Form/Sheet saat ini |

---

## 4. Struktur Google Sheet yang terbentuk

### Sheet `PRODUK` — sumber utama website

| # | Kolom | Isi | Catatan |
|---|---|---|---|
| 1 | `ID_PRODUK` | `PRD0001` | Otomatis, unik, tidak berubah walau baris diurutkan |
| 2 | `ID_PENJUAL` | `PGSD0001` | Otomatis. Nama usaha yang sama memakai ID yang sama |
| 3 | `TIMESTAMP` | Waktu kiriman Form | |
| 4 | `NAMA_MAHASISWA` | `Naya Putri` | Tampil di website |
| 5 | `NIM` | `2205123` | **Tidak pernah dikirim ke API** |
| 6 | `ANGKATAN` | `2025` | |
| 7 | `NAMA_USAHA` | `Dapur Naya` | Dasar pengelompokan halaman toko |
| 8 | `NAMA_PRODUK` | `Brownies Lumer` | |
| 9 | `KATEGORI` | dropdown 10 pilihan | |
| 10 | `HARGA` | `25000` | Angka polos |
| 11 | `DESKRIPSI` | teks | |
| 12 | `FOTO` | URL | Lihat bagian 9 |
| 13 | `WHATSAPP` | `6281234567890` | Dinormalisasi otomatis dari `08…` |
| 14 | `INSTAGRAM` | `dapurnaya` | `@` dibuang otomatis |
| 15 | `LOKASI` | `COD UPI Kampus Serang` | |
| 16 | `STATUS` | dropdown | **Hanya `TAYANG` yang tampil di website** |
| 17 | `FEATURED` | checkbox | Diprioritaskan di "Produk Pilihan" |
| 18 | `PROMO` | `Diskon 20%` | Badge di kartu produk; boleh kosong |
| 19 | `TANGGAL_UPDATE` | `2026-08-24` | Dasar badge "Baru" dan urutan "Terbaru" |
| 20 | `CATATAN_ADMIN` | catatan internal | **Tidak pernah dikirim ke API** |

Tiga kolom di luar daftar yang kamu sebutkan sengaja saya tambahkan karena dipakai
langsung oleh website: `ID_PENJUAL` (supaya tautan halaman toko berfungsi), `PROMO`
(badge promo pada kartu), dan `CATATAN_ADMIN` (tempat script menuliskan peringatan,
misalnya ketika izin foto gagal dipasang).

### Sheet `PENJUAL`, `PROMO`, `CERITA` — opsional

Ketiganya boleh dibiarkan kosong; website tetap berjalan normal.

**`PENJUAL`** — untuk memperkaya halaman toko. Kolom: `ID_PENJUAL`, `NAMA_USAHA`,
`NAMA_MAHASISWA`, `ANGKATAN`, `DESKRIPSI_USAHA`, `LOGO`, `WHATSAPP`, `INSTAGRAM`,
`LOKASI`, `STATUS`. Kalau sebuah usaha tidak punya baris di sini, website membentuk
profil tokonya sendiri dari data produk — jadi mengisi sheet ini boleh sebagian saja.

**`PROMO`** — untuk section "🔥 Promo Minggu Ini". Kolom: `ID_PROMO`, `ID_PENJUAL`,
`ID_PRODUK`, `JUDUL_PROMO`, `DESKRIPSI`, `TANGGAL_MULAI`, `TANGGAL_SELESAI`, `STATUS`.
Promo hanya tampil bila `STATUS = AKTIF` **dan** hari ini berada di antara kedua tanggal.

**`CERITA`** — untuk section "Cerita di Balik Usaha". Kolom: `ID_CERITA`, `ID_PENJUAL`,
`JUDUL`, `EXCERPT`, `PENULIS`, `ANGKATAN`, `THUMBNAIL`, `TANGGAL`, `ISI`
(pisahkan paragraf dengan baris kosong). Kalau kosong, section ini disembunyikan
otomatis beserta tautan menunya.

---

## 5. Google Form yang terbentuk

**Judul:** POJOK WIRAUSAHA MAHASISWA — PGSD UPI Kampus Serang

**Deskripsi:** Formulir pendaftaran produk dan jasa mahasiswa PGSD UPI Kampus Serang.
Produk yang dikirim akan melalui proses verifikasi sebelum ditampilkan pada website
Pojok Wirausaha Mahasiswa.

| # | Pertanyaan | Jenis | Wajib |
|---|---|---|---|
| 1 | Nama Mahasiswa | Jawaban singkat | ✔ |
| 2 | NIM | Jawaban singkat | ✔ |
| 3 | Angkatan | Dropdown 2022–2026 | ✔ |
| 4 | Nama Usaha | Jawaban singkat | ✔ |
| 5 | Nama Produk | Jawaban singkat | ✔ |
| 6 | Kategori | Dropdown 10 kategori | ✔ |
| 7 | Harga | Jawaban singkat + validasi angka | ✔ |
| 8 | Deskripsi Produk | Paragraf | ✔ |
| 9 | Nomor WhatsApp | Jawaban singkat | ✔ |
| 10 | Instagram | Jawaban singkat | — |
| 11 | Lokasi COD / Area Pelayanan | Jawaban singkat | ✔ |
| 12 | Foto Produk | Unggah berkas (gambar, 1 file, maks 10 MB) | ✔ |
| 13 | Persetujuan Publikasi | Kotak centang | ✔ |

Teks persetujuan:

> Saya menyatakan bahwa informasi dan produk yang saya daftarkan merupakan tanggung jawab
> saya sebagai penjual dan saya menyetujui publikasi informasi produk pada Pojok Wirausaha
> Mahasiswa PGSD UPI Kampus Serang.

Pesan setelah kirim menegaskan bahwa produk berstatus **MENUNGGU VERIFIKASI**.

Judul pertanyaan disimpan di `CONFIG.T` dalam `Code.gs` dan dipakai bersama oleh pembuat
Form **dan** pembaca kiriman. Jadi kalau kamu mengubah judul pertanyaan, ubah juga di
`CONFIG.T` agar keduanya tetap sinkron.

> **Catatan tentang unggah foto.** Pertanyaan unggah berkas mengharuskan mahasiswa masuk
> dengan akun Google (akun `upi.edu` mereka bisa dipakai). Kalau akun kamu tidak mendukung
> pertanyaan unggah berkas, script otomatis menggantinya dengan isian tautan foto dan
> mencatat hal itu di Execution log — setup tetap selesai.

---

## 6. Deploy API dan mengisi API_URL

1. Di editor Apps Script: **Deploy → New deployment → ⚙ → Web app**

   | Isian | Nilai |
   |---|---|
   | Description | `API Pojok Wirausaha v1` |
   | Execute as | **Me** |
   | Who has access | **Anyone** |

2. **Deploy** → izinkan akses → salin **Web app URL** yang berakhiran `/exec`.

3. Uji dulu di browser. Hasilnya harus JSON seperti:

```json
{
  "success": true,
  "count": 3,
  "diperbaruiPada": "2026-08-29T...",
  "produk": [ { "idProduk": "PRD0001", "harga": 25000, "...": "..." } ],
  "penjual": [],
  "promo": [],
  "cerita": [],
  "stats": { "jumlahProduk": 3, "jumlahUsaha": 3, "jumlahKategori": 3, "jumlahPromoAktif": 1 }
}
```

4. Buka **`js/config.js`** — satu-satunya file website yang perlu diedit — dan isi tiga
   baris teratas:

```js
var API_URL         = "https://script.google.com/macros/s/AKfycb..../exec";
var GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/..../viewform";
var MODE_DEMO       = false;
```

   URL Form ada di Execution log `setupPojokWirausaha()`, atau panggil `showSetupInfo()`.

5. Commit dan push ke GitHub. Selesai — tidak ada file lain yang perlu disentuh.

### Daftar endpoint

| URL | Balasan |
|---|---|
| `…/exec` | `{ success, count, produk, penjual, promo, cerita, stats }` — **ini yang dipakai website** |
| `…/exec?action=products` | `{ success, count, data:[…] }` |
| `…/exec?action=stats` | `{ success, data:{ jumlahProduk, jumlahUsaha, jumlahKategori, jumlahPromoAktif } }` |
| `…/exec?action=sellers` | `{ success, count, data:[…] }` |
| `…/exec?action=promos` | `{ success, count, data:[…] }` |
| `…/exec?action=stories` | `{ success, count, data:[…] }` |
| `…/exec?callback=namaFungsi` | Balasan JSONP |

Website membaca kedua bentuk (`produk:[…]` maupun `data:[…]`), tetapi **pakailah URL
`/exec` polos** — hanya bentuk itu yang sekaligus membawa data penjual, promo, dan cerita.

Statistik di website dihitung dari data yang diterima, bukan dari `?action=stats`.
Endpoint itu tersedia untuk keperluan lain, misalnya papan pantau atau laporan.

### Tentang CORS

Website memanggil API dengan `fetch()` GET biasa tanpa header khusus, sehingga tidak
memicu preflight dan berjalan normal dari GitHub Pages. Kalau tetap terhalang, `js/api.js`
otomatis mencoba ulang lewat JSONP (`?callback=`) yang tidak tunduk pada CORS. Kamu tidak
perlu mengonfigurasi apa pun.

> Setiap kali kamu **mengubah kode** Apps Script, jalankan **Deploy → Manage deployments →
> ✏ → Version: New version → Deploy** supaya URL yang sama memuat kode terbaru.
> Mengubah **isi spreadsheet** tidak perlu deploy ulang.

---
## 7. Deploy ke GitHub Pages

### Lewat antarmuka GitHub

1. Buat repository baru, misalnya `pojok-wirausaha` (boleh di akun pribadi maupun organisasi
   `pgsdserang-upi`).
2. **Add file → Upload files** → seret seluruh isi folder ini (bukan foldernya, tapi isinya:
   `index.html`, `css/`, `js/`, `assets/`, dan seterusnya) → **Commit**.
3. **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** • folder: **/ (root)**
   - **Save**
4. Tunggu 1–2 menit. Website terbit di:
   `https://<username>.github.io/pojok-wirausaha/`

### Lewat Git

```bash
cd pojok-wirausaha
git init
git add .
git commit -m "Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang"
git branch -M main
git remote add origin https://github.com/<username>/pojok-wirausaha.git
git push -u origin main
```

Lalu aktifkan GitHub Pages seperti langkah 3 di atas.

### Domain sendiri (opsional)

Buat file `CNAME` di root berisi nama domain, misalnya `pojokwirausaha.pgsd-serang.upi.edu`,
lalu arahkan record DNS ke `<username>.github.io`.

> File `.nojekyll` sudah disertakan. Jangan dihapus — tanpa file itu GitHub Pages akan
> memproses situs lewat Jekyll dan dapat mengabaikan sebagian file.

---
## 8. Alur moderasi admin

```
MAHASISWA → GOOGLE FORM → sheet PRODUK (STATUS = MENUNGGU)
                                    ↓
                              ADMIN REVIEW
                                    ↓
                            STATUS = TAYANG
                                    ↓
                                WEBSITE
```

Produk **tidak pernah** langsung tayang. Penyaringan `STATUS = TAYANG` dilakukan di
Apps Script, jadi baris `MENUNGGU`, `DITOLAK`, dan `NONAKTIF` bahkan tidak pernah
meninggalkan Google Sheet.

**Cara meninjau, paling sederhana:** buka sheet `PRODUK`, cari baris berlatar kuning
(MENUNGGU), lalu ubah sel `STATUS` lewat dropdown. Website menyesuaikan dalam waktu
kurang dari satu menit.

Saat status diubah menjadi `TAYANG`, trigger `onEditSheet` ikut memperbarui
`TANGGAL_UPDATE`. Jadi badge "Baru" dan urutan "Terbaru" mengikuti tanggal **tayang**,
bukan tanggal pendaftaran — yang lebih masuk akal bagi pengunjung.

Spreadsheet juga punya menu **Pojok Wirausaha** (muncul beberapa detik setelah file
dibuka) berisi: tayangkan/tolak/nonaktifkan baris terpilih, isi ID yang kosong, perbaiki
izin & URL foto, uji akses foto, bersihkan cache API, dan lihat info setup. Kalau menu itu
tidak muncul di lingkunganmu, semua fungsi tersebut tetap bisa dijalankan dari editor
Apps Script.

### Yang tidak pernah dikirim ke API

Penyaringan dilakukan di `bacaSheet_()`, di satu tempat, sebelum data disusun — sehingga
tidak ada jalur lain yang bisa membocorkannya:

`NIM` · `CATATAN_ADMIN` · `EMAIL` · `ALAMAT` · `NIK`

Fungsi `ujiApi()` ikut memeriksa hal ini dan akan melaporkan `Data sensitif : BOCOR`
bila suatu saat ada kolom baru yang lolos.

---

## 9. Foto produk — bagian yang paling sering bermasalah

Google Form menyimpan unggahan ke Drive dalam keadaan **privat**, dan URL yang diberikannya
berbentuk `https://drive.google.com/open?id=…` yang **tidak bisa** dipakai oleh tag `<img>`.
Kalau dibiarkan, semua foto akan gagal tampil.

Yang dilakukan script setiap ada kiriman baru:

1. mengambil ID berkas dari bentuk URL Drive apa pun;
2. memberi izin baca *"siapa saja yang memiliki tautan"* **pada berkas itu saja** —
   bukan pada seluruh folder Drive;
3. menyimpan URL dalam bentuk `https://drive.google.com/thumbnail?id=…&sz=w1200`,
   yaitu bentuk yang paling stabil untuk halaman web publik.

### Kalau izin gagal dipasang

Akun Google Workspace (termasuk domain `upi.edu`) sering melarang berbagi tautan ke luar
organisasi. Kalau itu terjadi, langkah 2 gagal — itu kebijakan Admin Console, bukan bug
script. Script menangani ini dengan jujur: peringatan ditulis ke kolom `CATATAN_ADMIN`
pada baris tersebut dan ke Execution log.

Tiga jalan keluar, urut dari yang paling rapi:

1. **Minta admin Google Workspace** mengizinkan berbagi tautan untuk akun pengelola.
   Setelah itu jalankan `perbaikiIzinFoto()` untuk memperbaiki seluruh baris lama sekaligus.
2. **Pakai akun Gmail pribadi** sebagai pemilik Form dan Spreadsheet. Akun pribadi tidak
   terkena kebijakan domain.
3. **Isi kolom `FOTO` secara manual** dengan URL gambar publik lain. Website menerima:
   - URL absolut mana pun (`https://…/foto.jpg`);
   - **path relatif di repo**, misalnya `assets/images/brownies.jpg` — cukup commit
     fotonya ke GitHub. Ini pilihan paling stabil dan paling cepat dimuat, karena
     dilayani langsung oleh GitHub Pages tanpa bergantung pada Drive.

### Memverifikasi

Jalankan **`ujiFotoPublik()`**. Fungsi ini memanggil setiap URL foto **tanpa kredensial** —
persis seperti pengunjung website — lalu melaporkan mana yang mengembalikan gambar dan
mana yang tidak. Jauh lebih cepat daripada membuka website satu per satu.

Kalau sebuah foto tetap gagal dimuat, website tidak menampilkan kotak rusak: kartu produk
otomatis jatuh ke `assets/images/placeholder.svg`.

---

## 10. Kontrak data API ↔ website

Ini bagian yang membuat integrasi tidak mudah patah. Apps Script mengirim nama field
**persis** seperti yang dibaca `js/api.js`:

| Field JSON | Asal kolom sheet | Tipe | Dipakai untuk |
|---|---|---|---|
| `idProduk` | `ID_PRODUK` | string | Identitas, URL `?produk=PRD0001` |
| `idPenjual` | `ID_PENJUAL` | string | Relasi ke halaman toko |
| `namaProduk` | `NAMA_PRODUK` | string | Judul kartu |
| `namaUsaha` | `NAMA_USAHA` | string | Nama toko |
| `namaMahasiswa` | `NAMA_MAHASISWA` | string | "Oleh Naya • PGSD '25" |
| `angkatan` | `ANGKATAN` | string | idem |
| `kategori` | `KATEGORI` | string | Badge, filter, warna pastel |
| `harga` | `HARGA` | **number** | Diformat jadi `Rp25.000` di sisi website |
| `deskripsi` | `DESKRIPSI` | string | Modal detail |
| `foto` | `FOTO` | string | Gambar kartu |
| `whatsapp` | `WHATSAPP` | string `62…` | Tautan `wa.me` |
| `instagram` | `INSTAGRAM` | string tanpa `@` | Tautan Instagram |
| `lokasi` | `LOKASI` | string | Baris "📍 COD …" |
| `promo` | `PROMO` | string | Badge PROMO |
| `status` | `STATUS` | string | Selalu `TAYANG` |
| `featured` | `FEATURED` | boolean | Prioritas "Produk Pilihan" |
| `tanggalUpdate` | `TANGGAL_UPDATE` | `yyyy-mm-dd` | Badge "Baru", urutan "Terbaru" |

Website juga membaca `rating` dan `varian` bila ada. Keduanya tidak ada di Form; kamu bisa
menambahkan kolomnya sendiri di sheet `PRODUK` (`RATING`, `VARIAN` dipisah koma) dan
keduanya akan langsung terbaca tanpa mengubah kode.

Normalisasi dilakukan **dua kali** — di Apps Script dan sekali lagi di `js/api.js` —
sehingga data yang diketik manual di sheet tetap aman:

- `Rp 25.000` / `25.000` / `25000` → `25000`
- `08123456789` / `+62 812-3456-789` / `8123456789` → `628123456789` (tanpa tanda `+`)
- `@dapurnaya` / `instagram.com/dapurnaya/` → `dapurnaya`
- URL Drive bentuk apa pun → `drive.google.com/thumbnail?id=…&sz=w1200`

### Perubahan pada source code website

Integrasi ini menuntut lima suntingan kecil, semuanya sudah diterapkan:

| File | Perubahan | Alasan |
|---|---|---|
| `js/config.js` | Menambah kategori **Les Privat** | Ada di daftar kategori Form, sebelumnya belum ada di website |
| `js/api.js` | `bentuk()` juga menerima `data:[…]` | Agar `?action=products` bisa dipakai |
| `js/api.js` | `success:false` diperlakukan sebagai kegagalan | Agar error API tidak tersamar jadi "belum ada usaha" |
| `js/api.js` | Penjual yang belum ada di sheet `PENJUAL` dibentuk dari produknya | Agar sheet itu boleh diisi sebagian tanpa merusak tautan toko |
| `js/api.js` | Normalisasi Instagram menerima URL tanpa `https://` | Mahasiswa sering menulis `instagram.com/nama` |
| `js/app.js` | Section `CERITA` disembunyikan saat kosong | Sheet `CERITA` opsional |
| `css/style.css` | Grid kategori `auto-fit` | Menyesuaikan jumlah kategori berapa pun |

Struktur file, nama fungsi, dan tampilan website tidak diubah.

---
## 11. Kustomisasi

### Kategori

Sepuluh kategori resmi didefinisikan di **dua tempat yang harus selalu sama**:
`PW.config.categories` di `js/config.js` dan `CONFIG.KATEGORI` di `apps-script/Code.gs`.

`Kuliner` · `Minuman` · `Fashion` · `Handmade` · `Pendidikan` · `Produk Digital` ·
`Jasa Kreatif` · `Gift & Merchandise` · `Les Privat` · `Lainnya`

Menambah kategori baru: tambahkan barisnya di kedua file (di `js/config.js` sekalian
dengan emoji dan sepasang warna pastel), lalu jalankan `setupPojokWirausaha()` sekali lagi
supaya dropdown di Sheet dan pilihan di Form ikut diperbarui.

Kategori yang belum punya produk otomatis disembunyikan dari halaman, dan grid kategori
menyesuaikan diri dengan jumlah berapa pun.

### Warna dan tipografi

Semua warna berupa CSS variable di bagian atas `css/style.css`:

```css
--maroon-600:#AB2039;   /* warna aksen utama */
--cream:#FFF8F3;        /* latar lembut */
--ink:#1E1A1D;          /* warna teks */
```

Ubah satu nilai, seluruh komponen ikut menyesuaikan. Font diambil dari Google Fonts
(Plus Jakarta Sans + Inter) — ganti di `<link>` pada `index.html` dan `toko.html`.

### Pesan WhatsApp otomatis

Ada di `js/config.js`. Placeholder `{produk}`, `{usaha}`, dan `{promo}` diisi otomatis:

```js
WA_TEMPLATE: "Halo, saya melihat produk {produk} melalui Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang. Apakah produknya masih tersedia?",
```

### Perilaku lain

| Variabel | Arti | Bawaan |
|---|---|---|
| `PAGE_SIZE` | Produk per klik "Tampilkan lebih banyak" | 12 |
| `FEATURED_COUNT` | Jumlah kartu di "Produk Pilihan" | 8 |
| `NEW_DAYS` | Umur maksimal produk untuk badge NEW | 14 hari |
| `RECENT_MAX` | Jumlah "Terakhir Kamu Lihat" | 5 |
| `FETCH_TIMEOUT` | Batas waktu permintaan API | 12000 ms |

### Foto produk

Website memakai placeholder SVG di `assets/images/`. Untuk foto asli, isi kolom **Foto**
di Google Sheet dengan salah satu dari:

- URL gambar publik mana pun (`https://…jpg`)
- URL Google Drive — otomatis dikonversi menjadi
  `https://drive.google.com/thumbnail?id=…&sz=w1200`
- Path relatif di repo, misalnya `assets/images/produk-saya.jpg`

Bila foto gagal dimuat, kartu otomatis jatuh ke `assets/images/placeholder.svg`.

---

## 12. Fitur yang sudah tersedia

**Data & integrasi**

- Pengambilan JSON dari Google Apps Script dengan `async/await`, timeout, dan cadangan JSONP
- Filter ketat: hanya produk berstatus `TAYANG` yang dirender
- Normalisasi otomatis nomor WhatsApp Indonesia (`08…` → `62…`), username Instagram
  (`@nama` → `nama`), harga (`"Rp 25.000"` → `25000`), dan tanggal
- Relasi 1 penjual → banyak produk; halaman toko mini per mahasiswa
- Skeleton shimmer saat memuat, pesan ramah saat API gagal, tombol muat ulang

**Penemuan produk**

- Pencarian langsung pada nama produk, nama usaha, nama mahasiswa, kategori, deskripsi, varian
- Filter kategori (kartu kategori + chip), filter rentang harga, 4 opsi pengurutan
- Statistik otomatis dengan animasi counter — dihitung dari data, bukan angka tetap
- Produk pilihan acak setiap muat ulang, dengan prioritas `featured = TRUE`
- Badge `NEW` otomatis untuk produk berumur kurang dari 14 hari
- Empty state dengan ilustrasi, bukan halaman kosong

**Interaksi**

- Favorit dengan localStorage, tanpa login; ada section "Produk Favorit Saya" dan badge di navbar
- "Terakhir Kamu Lihat" (maksimal 5 produk)
- Modal detail produk tanpa reload, dengan URL berbagi `index.html?produk=PRD001`
- Tombol Bagikan memakai Web Share API, jatuh ke salin-ke-clipboard plus toast
- Tombol WhatsApp dengan pesan otomatis berdasarkan nama produk

**Kualitas**

- HTML semantik, `alt` pada semua gambar, `aria-label`, `aria-pressed`, navigasi keyboard,
  focus trap pada modal, skip link, dukungan `prefers-reduced-motion`
- Mobile-first: grid 2 kolom di ponsel, kategori horizontal scroll, hamburger menu,
  tanpa overflow horizontal
- `loading="lazy"` pada gambar, tanpa framework, tanpa proses build
- NIM, email, dan alamat tidak pernah dikirim ke sisi klien — disaring di Apps Script

---

## 13. Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Muncul nama produk & mahasiswa padahal belum ada yang mendaftar | `MODE_DEMO` masih `true` di `js/config.js`. Ubah menjadi `false` |
| Produk tidak muncul padahal sheet sudah terisi | Kolom **Status** belum `TAYANG` (huruf besar semua), atau `API_URL` belum diisi |
| `Failed to fetch` / CORS | Deployment bukan **Anyone**. Ulangi Deploy dengan *Who has access: Anyone*. Website otomatis mencoba JSONP sebagai cadangan |
| Perubahan sheet tidak terlihat | Cache API 60 detik. Tunggu sebentar, atau menu **Pojok Wirausaha → Bersihkan cache API** |
| Perubahan kode Apps Script tidak berlaku | Wajib **Manage deployments → New version → Deploy** |
| Foto tidak tampil | Jalankan `perbaikiIzinFoto()` lalu `ujiFotoPublik()`. Kalau tetap gagal, kebijakan Google Workspace melarang berbagi tautan — lihat bagian 9 |
| Kiriman Form tidak masuk ke sheet `PRODUK` | Trigger belum terpasang. Jalankan `setupPojokWirausaha()` lagi, lalu cek `showSetupInfo()` bagian "Trigger aktif" |
| Kiriman masuk tapi kolomnya berantakan | Judul pertanyaan Form diubah tanpa mengubah `CONFIG.T` di `Code.gs`. Samakan keduanya |
| Sheet `PRODUK` tampak kosong padahal Form sudah dikirim | Gulir ke bawah — kiriman mungkin tertulis jauh di bawah baris kosong. Jalankan `rapikanSheet()` untuk menaikkannya ke atas |
| Muncul kartu produk kosong bertuliskan "Produk / Gratis / Kontak kosong" | Ada baris hantu yang kolom STATUS-nya terisi TAYANG. Jalankan `rapikanSheet()` |
| `ID_PRODUK` kosong pada baris tertentu | Baris itu diketik manual. Jalankan `isiIdKosong()` |
| Kategori produk tidak muncul di filter | Ejaan kategori di sheet berbeda dari daftar resmi. Pakai dropdown, jangan diketik |
| Semua produk tampil "belum ada usaha" padahal sheet terisi | Tidak ada baris ber-`STATUS = TAYANG`. Jalankan `ujiApi()` untuk memastikan |
| Harga tampil `Hubungi penjual` | Kolom Harga kosong atau bukan angka. Isi angka polos: `25000` |
| Tombol WhatsApp tidak terbuka | Kolom WhatsApp kosong. Isi `08…` atau `62…`, format bebas |
| Halaman putih di GitHub Pages | Nama folder `css`/`js`/`assets` berubah, atau file diunggah dalam satu folder induk. Pastikan `index.html` berada di root repository |
| Buka `index.html` langsung lalu kosong | Protokol `file://` memblokir `fetch`. Jalankan lewat server lokal (bagian 2) |

---

## Disclaimer

Pojok Wirausaha Mahasiswa berfungsi sebagai media promosi produk mahasiswa. Transaksi
dilakukan langsung antara pembeli dan penjual. Pengelola website tidak menjadi pihak dalam
transaksi.

Dikembangkan sebagai ruang promosi dan pengembangan kewirausahaan mahasiswa
**PGSD UPI Kampus Serang**.
