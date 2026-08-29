/* ==========================================================================
   favorites.js — Favorit & "Terakhir Kamu Lihat"
   Disimpan di localStorage perangkat pengunjung. Tanpa login, tanpa server.
   ========================================================================== */

window.PW = window.PW || {};

PW.store = (function () {

  function baca(kunci) {
    try {
      var raw = window.localStorage.getItem(kunci);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === "string" && x; }) : [];
    } catch (e) {
      return [];   // mode privat / storage diblokir
    }
  }

  function tulis(kunci, nilai) {
    try {
      window.localStorage.setItem(kunci, JSON.stringify(nilai));
      return true;
    } catch (e) {
      return false;
    }
  }

  return { baca: baca, tulis: tulis };
})();


/* -------------------------------------------------------------------------
   FAVORIT
   ------------------------------------------------------------------------- */
PW.fav = (function () {
  var KUNCI = PW.config.LS_FAV;
  var pendengar = [];

  function daftar() { return PW.store.baca(KUNCI); }
  function jumlah() { return daftar().length; }
  function ada(id) { return daftar().indexOf(String(id)) > -1; }

  function ubah(id) {
    id = String(id);
    var list = daftar();
    var i = list.indexOf(id);
    var aktif;
    if (i > -1) { list.splice(i, 1); aktif = false; }
    else { list.unshift(id); aktif = true; }
    PW.store.tulis(KUNCI, list);
    beritahu();
    return aktif;
  }

  function hapusSemua() {
    PW.store.tulis(KUNCI, []);
    beritahu();
  }

  function onUbah(fn) { if (typeof fn === "function") pendengar.push(fn); }

  function beritahu() {
    var n = jumlah();
    pendengar.forEach(function (fn) {
      try { fn(n); } catch (e) { /* abaikan */ }
    });
  }

  return { daftar: daftar, jumlah: jumlah, ada: ada, ubah: ubah, hapusSemua: hapusSemua, onUbah: onUbah, beritahu: beritahu };
})();


/* -------------------------------------------------------------------------
   TERAKHIR DILIHAT
   ------------------------------------------------------------------------- */
PW.recent = (function () {
  var KUNCI = PW.config.LS_RECENT;
  var pendengar = [];

  function daftar() { return PW.store.baca(KUNCI); }

  function tambah(id) {
    id = String(id);
    if (!id) return;
    var list = daftar().filter(function (x) { return x !== id; });
    list.unshift(id);
    if (list.length > PW.config.RECENT_MAX) list = list.slice(0, PW.config.RECENT_MAX);
    PW.store.tulis(KUNCI, list);
    pendengar.forEach(function (fn) { try { fn(list); } catch (e) {} });
  }

  function hapusSemua() {
    PW.store.tulis(KUNCI, []);
    pendengar.forEach(function (fn) { try { fn([]); } catch (e) {} });
  }

  function onUbah(fn) { if (typeof fn === "function") pendengar.push(fn); }

  return { daftar: daftar, tambah: tambah, hapusSemua: hapusSemua, onUbah: onUbah };
})();
