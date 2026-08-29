/* ==========================================================================
   config.js — SATU-SATUNYA FILE YANG PERLU KAMU UBAH
   Pojok Wirausaha Mahasiswa — PGSD UPI Kampus Serang
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) URL API GOOGLE APPS SCRIPT
   --------------------------------------------------------------------------
   Kosongkan ("") selama belum punya API -> website otomatis memakai data demo.
   Setelah men-deploy apps-script/Code.gs sebagai Web App, tempel URL-nya di sini.
   Contoh: "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec"
-------------------------------------------------------------------------- */
var API_URL = "https://script.google.com/macros/s/AKfycbzMXCCQamCFuLtcnFAiY2HX6MjpY2xSjZ2Qaywxa0dIsEUOI7gFxSbY0tbJiunDbPUFPw/exec";

/* --------------------------------------------------------------------------
   2) URL GOOGLE FORM PENDAFTARAN USAHA
-------------------------------------------------------------------------- */
var GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd0zCjfObmOD-M0ZXByYg-coU7LqAMrHIwhw78FjQRhxvQm3A/viewform";

/* --------------------------------------------------------------------------
   3) MODE DEMO
   --------------------------------------------------------------------------
   false (bawaan) -> selama belum ada data asli, website menampilkan keadaan
                     "belum ada usaha terdaftar" beserta ajakan mendaftar.
                     Ini yang aman untuk website yang sudah dipublikasikan.

   true           -> website memakai data contoh dari js/data-demo.js dan
                     menampilkan banner "DATA CONTOH" di bagian atas halaman.
                     Pakai ini hanya untuk menguji atau memamerkan tampilan.

   PERINGATAN: nomor WhatsApp pada data contoh adalah nomor karangan. Jangan
   publikasikan website dengan MODE_DEMO = true ke pengunjung umum.
-------------------------------------------------------------------------- */
var MODE_DEMO = false;

/* ========================================================================== */

var PW = window.PW || {};
window.PW = PW;

PW.config = {
  API_URL: API_URL,
  GOOGLE_FORM_URL: GOOGLE_FORM_URL,
  MODE_DEMO: MODE_DEMO,

  /* identitas situs */
  site: {
    nama: "Pojok Wirausaha Mahasiswa",
    sub: "PGSD UPI Kampus Serang",
    tagline: "Karya Mahasiswa • Belanja Mahasiswa • Tumbuh Bersama"
  },

  /* perilaku */
  PAGE_SIZE: 12,          // jumlah produk per "tampilkan lebih banyak"
  FEATURED_COUNT: 8,      // jumlah kartu di section "Produk Pilihan"
  NEW_DAYS: 14,           // produk < 14 hari otomatis dapat badge NEW
  RECENT_MAX: 5,          // maksimal produk "Terakhir Kamu Lihat"
  FETCH_TIMEOUT: 12000,   // ms sebelum request API dianggap gagal
  USE_DEMO_FALLBACK: true,// jika API gagal, tampilkan data demo? (hanya berlaku saat MODE_DEMO = true)

  /* kunci localStorage */
  LS_FAV: "pw_favorit_v1",
  LS_RECENT: "pw_terakhir_v1",

  /* template pesan WhatsApp; {produk} & {usaha} diganti otomatis */
  WA_TEMPLATE:
    "Halo, saya melihat produk {produk} melalui Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang. " +
    "Apakah produknya masih tersedia?",
  WA_TEMPLATE_TOKO:
    "Halo {usaha}, saya menemukan usaha Anda melalui Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang. " +
    "Saya ingin bertanya mengenai produknya.",
  WA_TEMPLATE_PROMO:
    "Halo, saya tertarik dengan promo \"{promo}\" dari {usaha} di Pojok Wirausaha Mahasiswa " +
    "PGSD UPI Kampus Serang. Apakah promonya masih berlaku?",

  /* daftar kategori resmi + warna pastelnya */
  categories: [
    { nama: "Kuliner",            emoji: "🍜", c1: "#FFE7DA", c2: "#FFB694" },
    { nama: "Minuman",            emoji: "☕", c1: "#DFF2E7", c2: "#96D8B6" },
    { nama: "Fashion",            emoji: "👕", c1: "#E5E7FF", c2: "#AFB5F4" },
    { nama: "Handmade",           emoji: "🎨", c1: "#FFE8F1", c2: "#F5A9C6" },
    { nama: "Pendidikan",         emoji: "📚", c1: "#FFF4D6", c2: "#F6CE6A" },
    { nama: "Produk Digital",     emoji: "💻", c1: "#DEF0FB", c2: "#8ACBEC" },
    { nama: "Jasa Kreatif",       emoji: "📸", c1: "#F1E7FB", c2: "#C0A3E9" },
    { nama: "Gift & Merchandise", emoji: "🎁", c1: "#FFE9E1", c2: "#F3A48D" },
    { nama: "Les Privat",         emoji: "✏️", c1: "#DCF2F1", c2: "#8FD3CE" },
    { nama: "Lainnya",            emoji: "🛍️", c1: "#EBEEF3", c2: "#B7C1CE" }
  ],

  /* gambar cadangan bila foto produk kosong / gagal dimuat */
  PLACEHOLDER: "assets/images/placeholder.svg"
};

/* pencarian cepat kategori berdasarkan nama */
PW.config.categoryMap = PW.config.categories.reduce(function (map, c) {
  map[c.nama.toLowerCase()] = c;
  return map;
}, {});

PW.getCategory = function (nama) {
  var key = String(nama || "").trim().toLowerCase();
  return PW.config.categoryMap[key] || PW.config.categoryMap["lainnya"];
};
