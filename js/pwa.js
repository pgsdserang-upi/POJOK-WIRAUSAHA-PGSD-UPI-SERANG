/* ==========================================================================
   pwa.js — mendaftarkan service worker & menangani pembaruan
   Tanpa file ini, Chrome hanya membuat "pintasan" biasa yang ikonnya
   diberi lencana Chrome. Dengan service worker + manifest.json, Chrome
   memasangnya sebagai aplikasi (WebAPK) sehingga ikonnya bersih.
   ========================================================================== */

(function () {
  "use strict";

  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1') return;   // service worker butuh HTTPS

  var sudahMuatUlang = false;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { scope: './' })
      .then(function (reg) {

        // Versi baru terdeteksi -> langsung diaktifkan, lalu halaman dimuat ulang
        reg.addEventListener('updatefound', function () {
          var baru = reg.installing;
          if (!baru) return;
          baru.addEventListener('statechange', function () {
            if (baru.state === 'installed' && navigator.serviceWorker.controller) {
              baru.postMessage('LANGSUNG_AKTIF');
            }
          });
        });

        // periksa pembaruan sekali saat halaman dibuka
        reg.update().catch(function () {});
      })
      .catch(function (err) {
        if (window.console && console.warn) console.warn('Service worker gagal didaftarkan:', err);
      });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (sudahMuatUlang) return;
      sudahMuatUlang = true;
      location.reload();
    });
  });
})();
