/* ==========================================================================
   api.js — pengambilan & normalisasi data
   Sumber data: Google Sheet -> Google Apps Script -> JSON -> website.
   Selama API_URL kosong / gagal, dipakai data demo dari data-demo.js.
   ========================================================================== */

window.PW = window.PW || {};

/* ==========================================================================
   1. UTILITAS UMUM
   ========================================================================== */
PW.util = (function () {

  /* -- format Rupiah: 25000 -> "Rp25.000" ------------------------------- */
  function rupiah(nilai) {
    var n = parseHarga(nilai);
    if (n === null) return "Hubungi penjual";
    if (n === 0) return "Gratis";
    return "Rp" + n.toLocaleString("id-ID");
  }

  /* -- ubah apa pun menjadi angka harga --------------------------------- */
  function parseHarga(nilai) {
    if (typeof nilai === "number" && isFinite(nilai)) return Math.round(nilai);
    if (nilai === null || nilai === undefined) return null;
    var s = String(nilai).trim();
    if (!s) return null;
    // buang "Rp", spasi, titik ribuan; koma desimal -> titik
    s = s.replace(/rp/gi, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
    var n = parseFloat(s);
    return isFinite(n) ? Math.round(n) : null;
  }

  /* -- normalisasi nomor WhatsApp Indonesia ------------------------------
     08123456789   -> 628123456789
     +62 812-3456  -> 628123456
     8123456789    -> 628123456789
  ----------------------------------------------------------------------- */
  function normalizeWa(nomor) {
    if (!nomor) return "";
    var s = String(nomor).replace(/[^\d+]/g, "");
    s = s.replace(/^\+/, "");
    if (!s) return "";
    if (s.indexOf("62") === 0) return s;
    if (s.indexOf("0") === 0) return "62" + s.slice(1);
    if (s.indexOf("8") === 0) return "62" + s;
    return s;
  }

  /* -- normalisasi username Instagram: buang @, spasi, dan URL ----------- */
  function normalizeIg(ig) {
    if (!ig) return "";
    var s = String(ig).trim();
    s = s.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "");
    s = s.replace(/[?#].*$/, "");
    s = s.replace(/\/+$/, "");
    s = s.replace(/^@+/, "");
    s = s.replace(/\s+/g, "");
    return s;
  }

  function igLink(ig) {
    var u = normalizeIg(ig);
    return u ? "https://instagram.com/" + encodeURIComponent(u) : "";
  }

  /* -- tautan WhatsApp dengan pesan otomatis ----------------------------- */
  function waLink(nomor, pesan) {
    var wa = normalizeWa(nomor);
    if (!wa) return "";
    return "https://wa.me/" + wa + "?text=" + encodeURIComponent(pesan || "");
  }

  /* -- isi template pesan: {produk}, {usaha}, {promo} -------------------- */
  function isiTemplate(tpl, data) {
    return String(tpl || "").replace(/\{(\w+)\}/g, function (m, key) {
      return data && data[key] != null ? data[key] : "";
    });
  }

  /* -- tanggal ----------------------------------------------------------- */
  function parseDate(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    var s = String(v).trim();
    if (!s) return null;
    // format dd/mm/yyyy atau dd-mm-yyyy
    var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  function hariSejak(v) {
    var d = parseDate(v);
    if (!d) return Infinity;
    return (Date.now() - d.getTime()) / 86400000;
  }

  function tanggalID(v) {
    var d = parseDate(v);
    if (!d) return "";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function tanggalPendek(v) {
    var d = parseDate(v);
    if (!d) return "";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  /* -- teks --------------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function slug(s) {
    return String(s || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function potong(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n - 1).trim() + "…" : s;
  }

  function isTrue(v) {
    if (v === true) return true;
    var s = String(v == null ? "" : v).trim().toLowerCase();
    return s === "true" || s === "ya" || s === "yes" || s === "1" || s === "y";
  }

  /* -- URL ---------------------------------------------------------------- */
  function getParam(nama) {
    try {
      return new URLSearchParams(window.location.search).get(nama);
    } catch (e) { return null; }
  }

  function urlProduk(id) {
    var base = window.location.origin === "null" || !window.location.origin
      ? window.location.href.split("?")[0].split("#")[0]
      : window.location.origin + window.location.pathname;
    if (/toko\.html$/i.test(base)) base = base.replace(/toko\.html$/i, "index.html");
    return base + "?produk=" + encodeURIComponent(id);
  }

  function urlToko(id) {
    var base = window.location.href.split("?")[0].split("#")[0];
    base = base.replace(/(index|toko)\.html$/i, "");
    if (!/\/$/.test(base)) base += "/";
    return base + "toko.html?id=" + encodeURIComponent(id);
  }

  /* -- acak (Fisher–Yates) ------------------------------------------------ */
  function acak(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  return {
    rupiah: rupiah, parseHarga: parseHarga,
    normalizeWa: normalizeWa, normalizeIg: normalizeIg, igLink: igLink,
    waLink: waLink, isiTemplate: isiTemplate,
    parseDate: parseDate, hariSejak: hariSejak, tanggalID: tanggalID, tanggalPendek: tanggalPendek,
    esc: esc, slug: slug, potong: potong, isTrue: isTrue,
    getParam: getParam, urlProduk: urlProduk, urlToko: urlToko, acak: acak
  };
})();


/* ==========================================================================
   2. NORMALISASI BARIS SHEET -> OBJEK YANG DIPAKAI WEBSITE
   ========================================================================== */
PW.normalize = (function () {
  var U = PW.util;

  /* ambil nilai pertama yang ada dari beberapa kemungkinan nama kolom */
  function pick(obj, keys, fallback) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") return obj[k];
      // coba pencocokan tanpa spasi & huruf kecil
      var target = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (var real in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, real)) continue;
        if (real.toLowerCase().replace(/[^a-z0-9]/g, "") === target) {
          var v = obj[real];
          if (v !== undefined && v !== null && String(v).trim() !== "") return v;
        }
      }
    }
    return fallback !== undefined ? fallback : "";
  }

  function produk(row) {
    var kategoriNama = String(pick(row, ["kategori", "Kategori"], "Lainnya")).trim() || "Lainnya";
    var kat = PW.getCategory(kategoriNama);
    var varianRaw = pick(row, ["varian", "Varian", "variasi"], "");
    var varian = String(varianRaw).split(/[,;|]/).map(function (v) { return v.trim(); }).filter(Boolean);
    var ratingNum = parseFloat(pick(row, ["rating", "Rating"], ""));

    var p = {
      id: String(pick(row, ["idProduk", "ID Produk", "id"], "")).trim(),
      idPenjual: String(pick(row, ["idPenjual", "ID Penjual"], "")).trim(),
      nama: String(pick(row, ["namaProduk", "Nama Produk", "nama"], "Produk")).trim(),
      namaUsaha: String(pick(row, ["namaUsaha", "Nama Usaha"], "")).trim(),
      namaMahasiswa: String(pick(row, ["namaMahasiswa", "Nama Mahasiswa"], "")).trim(),
      angkatan: String(pick(row, ["angkatan", "Angkatan"], "")).trim(),
      kategori: kategoriNama,
      kategoriMeta: kat,
      harga: U.parseHarga(pick(row, ["harga", "Harga"], null)),
      deskripsi: String(pick(row, ["deskripsi", "Deskripsi", "Deskripsi Produk"], "")).trim(),
      foto: String(pick(row, ["foto", "Foto", "Foto Produk", "gambar"], "")).trim(),
      whatsapp: U.normalizeWa(pick(row, ["whatsapp", "WhatsApp", "wa", "No WhatsApp"], "")),
      instagram: U.normalizeIg(pick(row, ["instagram", "Instagram", "ig"], "")),
      lokasi: String(pick(row, ["lokasi", "Lokasi", "Lokasi COD"], "")).trim(),
      promo: String(pick(row, ["promo", "Promo"], "")).trim(),
      status: String(pick(row, ["status", "Status"], "")).trim().toUpperCase(),
      featured: U.isTrue(pick(row, ["featured", "Featured", "unggulan"], "")),
      rating: isFinite(ratingNum) && ratingNum > 0 ? Math.min(5, ratingNum) : null,
      varian: varian,
      tanggal: pick(row, ["tanggalUpdate", "Tanggal Update", "timestamp", "Timestamp", "tanggal"], "")
    };

    if (!p.id) p.id = "PRD-" + U.slug(p.namaUsaha + "-" + p.nama);
    // foto sengaja dibiarkan kosong bila memang tidak ada — tampilan kartu akan
    // menggambar ilustrasi kategori, bukan menampilkan gambar placeholder
    p.adaFoto = !!p.foto;
    p.baru = U.hariSejak(p.tanggal) <= PW.config.NEW_DAYS;
    p.hargaTeks = U.rupiah(p.harga);
    p.cari = [p.nama, p.namaUsaha, p.namaMahasiswa, p.kategori, p.deskripsi, p.lokasi, p.promo, varian.join(" ")]
      .join(" ").toLowerCase();
    return p;
  }

  function penjual(row) {
    var p = {
      id: String(pick(row, ["idPenjual", "ID Penjual", "id"], "")).trim(),
      namaMahasiswa: String(pick(row, ["namaMahasiswa", "Nama Mahasiswa"], "")).trim(),
      angkatan: String(pick(row, ["angkatan", "Angkatan"], "")).trim(),
      namaUsaha: String(pick(row, ["namaUsaha", "Nama Usaha"], "")).trim(),
      deskripsi: String(pick(row, ["deskripsiUsaha", "Deskripsi Usaha", "deskripsi"], "")).trim(),
      logo: String(pick(row, ["logo", "Logo"], "")).trim(),
      whatsapp: U.normalizeWa(pick(row, ["whatsapp", "WhatsApp", "wa"], "")),
      instagram: U.normalizeIg(pick(row, ["instagram", "Instagram", "ig"], "")),
      lokasi: String(pick(row, ["lokasi", "Lokasi", "Lokasi COD"], "")).trim(),
      status: String(pick(row, ["status", "Status"], "AKTIF")).trim().toUpperCase()
    };
    return p;
  }

  function promo(row) {
    return {
      id: String(pick(row, ["idPromo", "ID Promo", "id"], "")).trim(),
      idPenjual: String(pick(row, ["idPenjual", "ID Penjual"], "")).trim(),
      idProduk: String(pick(row, ["idProduk", "ID Produk"], "")).trim(),
      judul: String(pick(row, ["judulPromo", "Judul Promo", "judul"], "Promo")).trim(),
      deskripsi: String(pick(row, ["deskripsi", "Deskripsi"], "")).trim(),
      mulai: pick(row, ["tanggalMulai", "Tanggal Mulai"], ""),
      selesai: pick(row, ["tanggalSelesai", "Tanggal Selesai"], ""),
      status: String(pick(row, ["status", "Status"], "AKTIF")).trim().toUpperCase()
    };
  }

  function cerita(row) {
    return {
      id: String(pick(row, ["idCerita", "ID Cerita", "id"], "")).trim(),
      idPenjual: String(pick(row, ["idPenjual", "ID Penjual"], "")).trim(),
      judul: String(pick(row, ["judul", "Judul"], "Cerita")).trim(),
      excerpt: String(pick(row, ["excerpt", "Excerpt", "ringkasan"], "")).trim(),
      penulis: String(pick(row, ["penulis", "Penulis", "namaMahasiswa"], "")).trim(),
      angkatan: String(pick(row, ["angkatan", "Angkatan"], "")).trim(),
      thumbnail: String(pick(row, ["thumbnail", "Thumbnail", "foto"], "")).trim() || PW.config.PLACEHOLDER,
      tanggal: pick(row, ["tanggal", "Tanggal"], ""),
      isi: String(pick(row, ["isi", "Isi", "konten"], "")).trim()
    };
  }

  return { produk: produk, penjual: penjual, promo: promo, cerita: cerita };
})();


/* ==========================================================================
   3. PENGAMBILAN DATA
   ========================================================================== */
PW.api = (function () {
  var U = PW.util;

  /* -- fetch dengan timeout ---------------------------------------------- */
  function ambilJson(url) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, PW.config.FETCH_TIMEOUT);

    return fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).catch(function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  /* -- cadangan JSONP (jika CORS diblokir) -------------------------------- */
  function ambilJsonp(url) {
    return new Promise(function (resolve, reject) {
      var cb = "pwcb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      var script = document.createElement("script");
      var timer = setTimeout(function () { bersih(); reject(new Error("JSONP timeout")); }, PW.config.FETCH_TIMEOUT);

      function bersih() {
        clearTimeout(timer);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cb] = function (data) { bersih(); resolve(data); };
      script.onerror = function () { bersih(); reject(new Error("JSONP gagal dimuat")); };
      script.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + cb;
      document.head.appendChild(script);
    });
  }

  /* -- rapikan bentuk respons apa pun menjadi {penjual,produk,promo,cerita} */
  function bentuk(data) {
    var hasil = { penjual: [], produk: [], promo: [], cerita: [] };
    if (!data) return hasil;

    if (Array.isArray(data)) { hasil.produk = data; return hasil; }

    var src = data.data && typeof data.data === "object" && !Array.isArray(data.data) ? data.data : data;

    hasil.produk  = src.produk  || src.products || src.PRODUK  || [];
    hasil.penjual = src.penjual || src.sellers  || src.PENJUAL || [];
    hasil.promo   = src.promo   || src.promos   || src.PROMO   || [];
    hasil.cerita  = src.cerita  || src.stories  || src.CERITA  || [];

    // Bentuk { success:true, count:N, data:[...] } dari endpoint ?action=products
    if (!hasil.produk.length && Array.isArray(data.data)) hasil.produk = data.data;

    if (!Array.isArray(hasil.produk))  hasil.produk = [];
    if (!Array.isArray(hasil.penjual)) hasil.penjual = [];
    if (!Array.isArray(hasil.promo))   hasil.promo = [];
    if (!Array.isArray(hasil.cerita))  hasil.cerita = [];
    return hasil;
  }

  /* -- olah mentah -> state siap render ----------------------------------- */
  function olah(mentah, sumber) {
    var N = PW.normalize;

    var produk = mentah.produk.map(N.produk).filter(function (p) {
      return p.status === "TAYANG";   // WAJIB: hanya status TAYANG yang tampil
    });

    var penjual = mentah.penjual.map(N.penjual).filter(function (s) {
      return s.id && s.status !== "NONAKTIF" && s.status !== "DITOLAK" && s.status !== "MENUNGGU";
    });

    var petaPenjual = {};
    penjual.forEach(function (s) { petaPenjual[s.id] = s; });

    // Sheet PENJUAL bersifat opsional dan boleh terisi sebagian. Setiap usaha yang
    // punya produk tayang tetapi belum punya baris di sana dibentuk dari data produknya,
    // supaya tidak ada tautan toko yang mengarah ke halaman kosong.
    produk.forEach(function (p) {
      var key = p.idPenjual || U.slug(p.namaUsaha);
      if (!key) return;
      p.idPenjual = key;
      if (petaPenjual[key]) return;
      petaPenjual[key] = {
        id: key, namaUsaha: p.namaUsaha || "Usaha Mahasiswa",
        namaMahasiswa: p.namaMahasiswa, angkatan: p.angkatan,
        deskripsi: "", logo: p.foto, whatsapp: p.whatsapp,
        instagram: p.instagram, lokasi: p.lokasi, status: "AKTIF",
        kategori: p.kategori, kategoriMeta: p.kategoriMeta
      };
      penjual.push(petaPenjual[key]);
    });

    // lengkapi produk dari data penjual bila ada field yang kosong
    produk.forEach(function (p) {
      var s = petaPenjual[p.idPenjual];
      if (!s) return;
      if (!p.namaUsaha) p.namaUsaha = s.namaUsaha;
      if (!p.namaMahasiswa) p.namaMahasiswa = s.namaMahasiswa;
      if (!p.angkatan) p.angkatan = s.angkatan;
      if (!p.whatsapp) p.whatsapp = s.whatsapp;
      if (!p.instagram) p.instagram = s.instagram;
      if (!p.lokasi) p.lokasi = s.lokasi;
      p.cari = p.cari + " " + String(s.namaUsaha + " " + s.namaMahasiswa).toLowerCase();
    });

    // hitung jumlah produk per penjual, dan catat kategori utamanya
    // (dipakai untuk ilustrasi toko bila usaha itu belum punya logo)
    penjual.forEach(function (s) {
      var milik = produk.filter(function (p) { return p.idPenjual === s.id; });
      s.jumlahProduk = milik.length;
      if (!s.kategori && milik.length) {
        s.kategori = milik[0].kategori;
        s.kategoriMeta = milik[0].kategoriMeta;
      }
      if (!s.logo && milik.length) s.logo = milik[0].foto;   // "" bila produknya juga tanpa foto
    });
    penjual = penjual.filter(function (s) { return s.jumlahProduk > 0; });

    // promo aktif = status AKTIF + berada dalam rentang tanggal
    var kini = new Date(); kini.setHours(0, 0, 0, 0);
    var promo = mentah.promo.map(PW.normalize.promo).filter(function (pr) {
      if (pr.status && pr.status !== "AKTIF" && pr.status !== "TAYANG") return false;
      var mulai = U.parseDate(pr.mulai), selesai = U.parseDate(pr.selesai);
      if (mulai && kini < mulai) return false;
      if (selesai) { var akhir = new Date(selesai); akhir.setHours(23, 59, 59, 999); if (kini > akhir) return false; }
      return true;
    });

    // cerita dummy hanya dipakai saat mode demo aktif
    var cerita = mentah.cerita.map(PW.normalize.cerita);
    if (!cerita.length && PW.config.MODE_DEMO && PW.DEMO && PW.DEMO.cerita) {
      cerita = PW.DEMO.cerita.map(PW.normalize.cerita);
    }

    return {
      produk: produk,
      penjual: penjual,
      petaPenjual: petaPenjual,
      promo: promo,
      cerita: cerita,
      kategori: hitungKategori(produk),
      sumber: sumber,
      dimuatPada: new Date()
    };
  }

  function hitungKategori(produk) {
    return PW.config.categories.map(function (c) {
      var jumlah = produk.filter(function (p) {
        return String(p.kategori).toLowerCase() === c.nama.toLowerCase();
      }).length;
      return { nama: c.nama, emoji: c.emoji, c1: c.c1, c2: c.c2, jumlah: jumlah };
    }).filter(function (c) { return c.jumlah > 0; });
  }

  function dataDemo() {
    return { penjual: PW.DEMO.penjual, produk: PW.DEMO.produk, promo: PW.DEMO.promo, cerita: PW.DEMO.cerita };
  }

  function dataKosong() {
    return { penjual: [], produk: [], promo: [], cerita: [] };
  }

  /* -- API publik ----------------------------------------------------------
     Urutan keputusan:
       API_URL terisi   -> ambil dari Google Sheet
       API_URL kosong   -> MODE_DEMO true  ? data contoh : keadaan kosong
       API gagal        -> MODE_DEMO true  ? data contoh : keadaan kosong + pesan error
  ------------------------------------------------------------------------- */
  function muat() {
    var url = String(PW.config.API_URL || "").trim();
    var bolehDemo = PW.config.MODE_DEMO === true;

    if (!url) {
      return Promise.resolve(olah(bolehDemo ? dataDemo() : dataKosong(), bolehDemo ? "demo" : "kosong"));
    }

    return ambilJson(url)
      .catch(function () { return ambilJsonp(url); })
      .then(function (data) {
        // API menjawab tapi melaporkan kegagalan di sisi Apps Script
        if (data && (data.success === false || data.ok === false)) {
          throw new Error(data.error || "API melaporkan kegagalan");
        }
        var mentah = bentuk(data);
        // API menjawab tapi belum ada produk TAYANG: itu keadaan sah, bukan error
        return olah(mentah, mentah.produk.length ? "api" : "kosong");
      })
      .catch(function (err) {
        var pakaiDemo = bolehDemo && PW.config.USE_DEMO_FALLBACK;
        var state = olah(pakaiDemo ? dataDemo() : dataKosong(), pakaiDemo ? "demo-fallback" : "gagal");
        state.error = err && err.message ? err.message : "Gagal memuat data";
        return state;
      });
  }

  return {
    muat: muat, olah: olah, bentuk: bentuk,
    dataDemo: dataDemo, dataKosong: dataKosong, hitungKategori: hitungKategori
  };
})();
