/* ==========================================================================
   sw.js — Service Worker Pojok Wirausaha Mahasiswa PGSD UPI Kampus Serang
   --------------------------------------------------------------------------
   Fungsinya dua:
   1. memenuhi syarat Chrome agar pintasan di layar utama Android dipasang
      sebagai aplikasi (WebAPK) — inilah yang menghilangkan lencana Chrome
      di pojok ikon;
   2. menyimpan tampilan situs supaya tetap terbuka saat sinyal buruk.

   PENTING SAAT MENGUBAH SITUS:
   naikkan angka VERSI di bawah setiap kali kamu mengubah HTML/CSS/JS.
   Tanpa itu, pengunjung lama bisa tetap melihat versi tersimpan.
   ========================================================================== */

const VERSI = 'pojok-wirausaha-v1';

/* Berkas tampilan yang disimpan sejak awal. Data produk TIDAK ikut disimpan —
   selalu diambil langsung dari Apps Script agar tidak pernah basi. */
const ASET = [
  './',
  './index.html',
  './toko.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/data-demo.js',
  './js/api.js',
  './js/favorites.js',
  './js/products.js',
  './js/app.js',
  './js/toko.js',
  './js/pwa.js',
  './assets/icons/logo.svg',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/images/placeholder.svg'
];

/* ---------------------------------------------------------------- pasang --- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSI)
      .then(function (cache) {
        // satu berkas gagal tidak boleh menggagalkan seluruh pemasangan
        return Promise.all(ASET.map(function (url) {
          return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

/* --------------------------------------------------------------- aktifkan -- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (kunci) {
        return Promise.all(kunci.map(function (k) {
          return k === VERSI ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* ------------------------------------------------------------------ ambil -- */
self.addEventListener('fetch', function (event) {
  const req = event.request;

  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Permintaan ke luar domain (API Google Apps Script, Google Fonts, foto Drive)
  // dibiarkan lewat jaringan apa adanya — data produk harus selalu yang terbaru.
  if (url.origin !== self.location.origin) return;

  // js/config.js selalu diambil dari jaringan dulu. File inilah yang berisi API_URL,
  // dan isinya berubah setiap kali kamu membuat deployment Apps Script baru — kalau
  // sampai tertahan versi lama, situs akan menarik data dari alamat yang sudah mati.
  if (url.pathname.indexOf('/js/config.js') > -1) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(function (res) {
          const salinan = res.clone();
          caches.open(VERSI).then(function (c) { c.put(req, salinan); });
          return res;
        })
        .catch(function () { return caches.match(req); })
    );
    return;
  }

  // Navigasi halaman: utamakan jaringan supaya pembaruan langsung terlihat,
  // baru jatuh ke simpanan kalau sedang offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          const salinan = res.clone();
          caches.open(VERSI).then(function (c) { c.put(req, salinan); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (r) {
            return r || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Berkas tampilan (css/js/gambar): pakai simpanan dulu supaya cepat,
  // sambil tetap memperbaruinya di belakang layar.
  event.respondWith(
    caches.match(req).then(function (tersimpan) {
      const jaringan = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const salinan = res.clone();
          caches.open(VERSI).then(function (c) { c.put(req, salinan); });
        }
        return res;
      }).catch(function () { return tersimpan; });

      return tersimpan || jaringan;
    })
  );
});

/* Memungkinkan halaman meminta service worker baru langsung mengambil alih. */
self.addEventListener('message', function (event) {
  if (event.data === 'LANGSUNG_AKTIF') self.skipWaiting();
});
